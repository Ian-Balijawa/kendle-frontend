import {
    ActionIcon,
    Box,
    Group,
    Indicator,
    Paper,
    Text,
    Transition,
} from "@mantine/core";
import {
    IconCompass,
    IconHome,
    IconMessageCircle,
    IconPlus,
    IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

const mobileNavItems = [
  { label: "Home", icon: IconHome, path: "/" },
  { label: "Explore", icon: IconCompass, path: "/explore" },
  {
    label: "Create",
    icon: IconPlus,
    path: "/create",
    isCreate: true,
  },
  { label: "Messages", icon: IconMessageCircle, path: "/chat" },
  { label: "Profile", icon: IconUser, path: "/profile" },
];

export function FooterContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    const needsAuth =
      path.includes("chat") ||
      path.includes("profile") ||
      path.includes("create");

    if (!isAuthenticated && needsAuth) {
      navigate("/");
      return;
    }
    navigate(path);
  };

  const getItemContent = (item: (typeof mobileNavItems)[0]) => {
    const isCurrentActive = isActive(item.path);
    const needsAuth =
      item.path.includes("chat") ||
      item.path.includes("profile") ||
      item.path.includes("create");
    const canAccess = !needsAuth || isAuthenticated;
    const showUnread =
      item.path === "/chat" && unreadCount > 0 && isAuthenticated;

    return (
      <Transition
        mounted={mounted}
        transition="slide-up"
        duration={200}
        timingFunction="ease"
      >
        {(styles) => (
          <Box
            style={{
              ...styles,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "16px",
              minWidth: "60px",
              position: "relative",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: isCurrentActive
                ? "var(--mantine-color-blue-0)"
                : "transparent",
              transform: isCurrentActive ? "translateY(-2px)" : "translateY(0)",
              opacity: canAccess ? 1 : 0.4,
            }}
            onClick={() => handleNavigation(item.path)}
          >
            {/* Create button special styling */}
            {item.isCreate ? (
              <Box
                style={{
                  background: isCurrentActive
                    ? "linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-cyan-6) 100%)"
                    : "linear-gradient(135deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-cyan-5) 100%)",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isCurrentActive
                    ? "0 8px 20px rgba(59, 130, 246, 0.3)"
                    : "0 4px 12px rgba(59, 130, 246, 0.2)",
                  transform: isCurrentActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s ease",
                }}
              >
                <item.icon size={22} color="white" stroke={2} />
              </Box>
            ) : (
              <Box style={{ position: "relative" }}>
                <ActionIcon
                  variant={isCurrentActive ? "filled" : "subtle"}
                  color={isCurrentActive ? "blue" : "gray"}
                  size="lg"
                  radius="xl"
                  style={{
                    transition: "all 0.3s ease",
                    transform: isCurrentActive ? "scale(1.1)" : "scale(1)",
                    backgroundColor: isCurrentActive
                      ? "var(--mantine-color-blue-6)"
                      : "transparent",
                  }}
                >
                  <item.icon
                    size={20}
                    stroke={isCurrentActive ? 2 : 1.5}
                    color={
                      isCurrentActive ? "white" : "var(--mantine-color-gray-6)"
                    }
                  />
                </ActionIcon>

                {/* Unread indicator */}
                {showUnread && (
                  <Indicator
                    size={18}
                    color="red"
                    position="top-end"
                    offset={2}
                    label={unreadCount > 99 ? "99+" : unreadCount}
                    styles={{
                      indicator: {
                        border: "2px solid white",
                        fontSize: "9px",
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  />
                )}
              </Box>
            )}

            {/* Label */}
            <Text
              size="xs"
              fw={isCurrentActive ? 600 : 500}
              style={{
                color: isCurrentActive
                  ? "var(--mantine-color-blue-6)"
                  : "var(--mantine-color-gray-6)",
                fontSize: "10px",
                lineHeight: 1.2,
                textAlign: "center",
                transition: "color 0.3s ease",
                marginTop: item.isCreate ? "2px" : "0",
              }}
            >
              {item.label}
            </Text>

            {/* Active indicator dot */}
            {isCurrentActive && !item.isCreate && (
              <Box
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "var(--mantine-color-blue-6)",
                  transition: "all 0.3s ease",
                }}
              />
            )}
          </Box>
        )}
      </Transition>
    );
  };

  return (
    <Paper
      shadow="lg"
      style={{
        borderRadius: 0,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--mantine-color-gray-1)",
      }}
    >
      <Box
        style={{
          height: 60,
          position: "relative",
        }}
      >
        {/* Navigation Items */}
        <Group
          justify="space-around"
          h="100%"
          gap={0}
          px="sm"
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {mobileNavItems.map((item) => (
            <Box key={item.path}>{getItemContent(item)}</Box>
          ))}
        </Group>

        {/* Background gradient for active item */}
        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, var(--mantine-color-blue-6) 50%, transparent 100%)",
            opacity: mobileNavItems.some((item) => isActive(item.path)) ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      </Box>
    </Paper>
  );
}
