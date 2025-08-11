import { ActionIcon, Badge, Box, Group, Text } from "@mantine/core";
import {
  IconHome,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

const mobileNavItems = [
  { label: "Home", icon: IconHome, path: "/dashboard" },
  { label: "Explore", icon: IconSearch, path: "/dashboard/explore" },
  { label: "Create", icon: IconPlus, path: "/dashboard/create-post" },
  { label: "Chat", icon: IconMessageCircle, path: "/dashboard/chat" },
  { label: "Profile", icon: IconUser, path: "/dashboard/profile" },
];

export function FooterContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    // For unauthenticated users, only allow basic navigation
    if (
      !isAuthenticated &&
      (path.includes("chat") || path.includes("profile"))
    ) {
      // Redirect to sign in for protected features
      navigate("/");
      return;
    }
    navigate(path);
  };

  return (
    <Box
      style={{
        height: "100%",
        background: "var(--mantine-color-white)",
        borderTop: "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Group justify="space-around" h="100%" p="xs" gap="xs">
        {mobileNavItems.map((item) => (
          <Box
            key={item.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "var(--mantine-radius-sm)",
              backgroundColor: isActive(item.path)
                ? "var(--mantine-color-primary-0)"
                : "transparent",
              transition: "all 0.2s ease",
              opacity:
                !isAuthenticated &&
                (item.path.includes("chat") || item.path.includes("profile"))
                  ? 0.5
                  : 1,
            }}
            onClick={() => handleNavigation(item.path)}
          >
            <ActionIcon
              variant={isActive(item.path) ? "filled" : "subtle"}
              size="md"
              color={isActive(item.path) ? "primary" : "gray"}
              style={{ position: "relative" }}
            >
              <item.icon size={18} />
              {item.path === "/dashboard/chat" &&
                unreadCount > 0 &&
                isAuthenticated && (
                  <Badge
                    size="xs"
                    color="red"
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      minWidth: 16,
                      height: 16,
                      fontSize: 10,
                      border: "2px solid white",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
            </ActionIcon>
            <Text
              size="xs"
              c={isActive(item.path) ? "primary" : "dimmed"}
              fw={isActive(item.path) ? 500 : 400}
              style={{
                fontSize: "10px",
                lineHeight: 1,
                textAlign: "center",
              }}
            >
              {item.label}
            </Text>
          </Box>
        ))}
      </Group>
    </Box>
  );
}
