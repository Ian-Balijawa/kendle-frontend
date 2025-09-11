import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Image,
  Indicator,
  Menu,
  Paper,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconCompass,
  IconHome,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

const navigationItems = [
  { label: "Home", icon: IconHome, path: "/" },
  { label: "Explore", icon: IconCompass, path: "/explore" },
];

export function HeaderContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const avatarURL = `${import.meta.env.VITE_API_URL}/stream/image/${user?.avatar?.split("/").pop()}`;

  return (
    <Paper
      style={{
        borderRadius: 0,
        transition: "box-shadow 0.2s ease",
      }}
    >
      <Group justify="space-between" h={60} gap="sm">
        <Group gap="sm">
          <UnstyledButton
            onClick={() => navigate("/")}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              transition: "all 0.2s ease",
            }}
          >
            <Image src="/logo.png" alt="Kendle" width={50} height={50} />
          </UnstyledButton>

          <Group gap="xs" visibleFrom="sm">
            {navigationItems.map((item) => {
              const isCurrentActive = isActive(item.path);
              const needsAuth =
                item.path.includes("chat") || item.path.includes("statuses");
              const canAccess = !needsAuth || isAuthenticated;

              return (
                <Tooltip
                  key={item.path}
                  label={item.label}
                  position="bottom"
                  withArrow
                >
                  <ActionIcon
                    variant={isCurrentActive ? "filled" : "subtle"}
                    color={isCurrentActive ? "blue" : "gray"}
                    size="lg"
                    radius="xl"
                    onClick={() =>
                      canAccess ? navigate(item.path) : navigate("/auth")
                    }
                    disabled={!canAccess}
                    style={{
                      position: "relative",
                      transition: "all 0.2s ease",
                      transform: isCurrentActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <item.icon size={20} stroke={1.5} />
                    {item.path === "/chat" &&
                      unreadCount > 0 &&
                      isAuthenticated && (
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
                            },
                          }}
                        />
                      )}
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Group>

        <Group gap="sm">
          {!isAuthenticated ? (
            <Group gap="sm">
              <Button
                variant="light"
                size="sm"
                radius="xl"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                radius="xl"
                onClick={() => navigate("/auth")}
                gradient={{ from: "blue", to: "cyan" }}
                variant="gradient"
              >
                Join Kendle
              </Button>
            </Group>
          ) : (
            <Group gap="xs">
              <ActionIcon
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                size="lg"
                radius="xl"
                onClick={() => navigate("/statuses")}
                hiddenFrom="sm"
              >
                <IconPlus size={20} />
              </ActionIcon>

              <Menu shadow="lg" width={220} position="bottom-end" radius="md">
                <Menu.Target>
                  <UnstyledButton
                    style={{
                      borderRadius: "50%",
                      transition: "transform 0.2s ease",
                    }}
                    className="avatar-hover"
                  >
                    <Avatar
                      src={avatarURL || "/user.png"}
                      alt={user?.firstName}
                      size="md"
                      radius="xl"
                      style={{
                        border: "2px solid var(--mantine-color-gray-2)",
                        cursor: "pointer",
                      }}
                    >
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>
                    <Group gap="sm">
                      <Avatar
                        src={avatarURL || "/user.png"}
                        size="sm"
                        radius="xl"
                      >
                        {user?.firstName?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="sm" fw={600}>
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {user?.phoneNumber}
                        </Text>
                      </Stack>
                    </Group>
                  </Menu.Label>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => navigate("/profile")}
                  >
                    Your Profile
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconSettings size={16} />}
                    onClick={() => navigate("/settings")}
                  >
                    Settings
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                hiddenFrom="sm"
                visibleFrom="xs"
              >
                <IconMenu2 size={20} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
