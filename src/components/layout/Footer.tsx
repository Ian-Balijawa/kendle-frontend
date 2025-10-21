import {
  ActionIcon,
  Box,
  Group,
  Indicator,
  Paper,
  Text,
  Transition,
  ThemeIcon,
  Tooltip,
  Center,
} from "@mantine/core";
import {
  IconCompass,
  IconHome,
  IconMessageCircle,
  IconPlus,
  IconUser,
  IconSparkles,
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
    path: "/statuses",
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
      path.includes("statuses");

    if (!isAuthenticated && needsAuth) {
      navigate("/auth");
      return;
    }
    navigate(path);
  };

  const getItemContent = (item: (typeof mobileNavItems)[0]) => {
    const isCurrentActive = isActive(item.path);
    const needsAuth =
      item.path.includes("chat") ||
      item.path.includes("profile") ||
      item.path.includes("statuses");
    const canAccess = !needsAuth || isAuthenticated;
    const showUnread =
      item.path === "/chat" && unreadCount > 0 && isAuthenticated;

    return (
      <Transition
        mounted={mounted}
        transition="slide-up"
        duration={300}
        timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {(styles) => (
          <Tooltip
            label={item.label}
            position="top"
            withArrow
            transitionProps={{ duration: 200 }}
          >
            <Box
              style={{
                ...styles,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                padding: "12px 8px",
                borderRadius: "16px",
                minWidth: "60px",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: isCurrentActive
                  ? "var(--mantine-color-blue-0)"
                  : "transparent",
                transform: isCurrentActive
                  ? "translateY(-2px)"
                  : "translateY(0)",
                boxShadow: isCurrentActive
                  ? "0 4px 12px rgba(34, 139, 230, 0.2)"
                  : "none",
              }}
              onClick={() => handleNavigation(item.path)}
            >
              {item.isCreate ? (
                <ThemeIcon
                  size="lg"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isCurrentActive ? "scale(1.1)" : "scale(1)",
                    boxShadow: "0 4px 12px rgba(34, 139, 230, 0.3)",
                  }}
                >
                  <item.icon size={20} stroke={2} />
                </ThemeIcon>
              ) : (
                <ActionIcon
                  variant={isCurrentActive ? "filled" : "subtle"}
                  color={isCurrentActive ? "blue" : "gray"}
                  size="lg"
                  radius="xl"
                  disabled={!canAccess}
                  style={{
                    position: "relative",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isCurrentActive ? "scale(1.05)" : "scale(1)",
                    backgroundColor: isCurrentActive
                      ? "var(--mantine-color-blue-6)"
                      : "transparent",
                  }}
                >
                  <item.icon size={20} stroke={1.5} />
                  {showUnread && (
                    <Indicator
                      size={16}
                      color="red"
                      position="top-end"
                      offset={2}
                      label={unreadCount > 99 ? "99+" : unreadCount}
                      styles={{
                        indicator: {
                          border: "2px solid white",
                          fontSize: "10px",
                          fontWeight: 600,
                          animation: "pulse 2s infinite",
                        },
                      }}
                    />
                  )}
                </ActionIcon>
              )}

              <Text
                size="xs"
                fw={isCurrentActive ? 600 : 500}
                c={isCurrentActive ? "blue" : "dimmed"}
                style={{
                  transition: "all 0.2s ease",
                  opacity: isCurrentActive ? 1 : 0.8,
                }}
              >
                {item.label}
              </Text>

              {isCurrentActive && (
                <Box
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "var(--mantine-color-blue-6)",
                    animation: "pulse 2s infinite",
                  }}
                />
              )}
            </Box>
          </Tooltip>
        )}
      </Transition>
    );
  };

  return (
    <Transition
      mounted={mounted}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          shadow="lg"
          radius="xl"
          style={{
            ...styles,
            margin: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--mantine-color-gray-2)",
          }}
        >
          <Group
            justify="space-around"
            align="center"
            p="xs"
            style={{
              minHeight: "60px",
            }}
          >
            {mobileNavItems.map((item) => (
              <Center key={item.path} style={{ flex: 1 }}>
                {getItemContent(item)}
              </Center>
            ))}
          </Group>

          {isAuthenticated && (
            <Box
              style={{
                position: "absolute",
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              <ThemeIcon
                size="xl"
                radius="xl"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 8px 24px rgba(34, 139, 230, 0.4)",
                  border: "3px solid white",
                }}
                onClick={() => navigate("/statuses")}
              >
                <IconSparkles size={24} stroke={2} />
              </ThemeIcon>
            </Box>
          )}
        </Paper>
      )}
    </Transition>
  );
}
