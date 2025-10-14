import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Image,
  Indicator,
  Menu,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  Paper,
  Transition,
  Badge,
  Divider,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconCompass,
  IconHome,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconUser,
  IconSearch,
  IconBell,
  IconMessage,
  IconHeart,
  IconBookmark,
  IconShield,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { useState, useEffect } from "react";
import { useMantineColorScheme } from "@mantine/core";

const navigationItems = [
  { label: "Home", icon: IconHome, path: "/" },
  { label: "Explore", icon: IconCompass, path: "/explore" },
];

export function HeaderContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount } = useUIStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <Transition
      mounted={mounted}
      transition="slide-down"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          shadow="sm"
          style={{
            ...styles,
            borderRadius: 0,
            borderBottom: `1px solid var(--mantine-color-gray-2)`,
            backgroundColor:
              colorScheme === "dark"
                ? "var(--mantine-color-dark-7)"
                : "var(--mantine-color-white)",
          }}
        >
          <Group justify="space-between" h={60} gap="sm" px="lg">
            {/* Logo and Navigation */}
            <Group gap="sm">
              <UnstyledButton
                onClick={() => navigate("/")}
                style={{
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "12px",
                  padding: "4px",
                }}
                className="logo-hover"
              >
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                >
                  <Image src="/logo.png" alt="Kendle" width={24} height={24} />
                </ThemeIcon>
              </UnstyledButton>

              <Group gap="xs" visibleFrom="sm">
                {navigationItems.map((item) => {
                  const isCurrentActive = isActive(item.path);
                  const needsAuth =
                    item.path.includes("chat") ||
                    item.path.includes("statuses");
                  const canAccess = !needsAuth || isAuthenticated;

                  return (
                    <Tooltip
                      key={item.path}
                      label={item.label}
                      position="bottom"
                      withArrow
                      transitionProps={{ duration: 200 }}
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
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: isCurrentActive
                            ? "scale(1.05)"
                            : "scale(1)",
                          boxShadow: isCurrentActive
                            ? "0 4px 12px rgba(34, 139, 230, 0.3)"
                            : "none",
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
                                  animation: "pulse 2s infinite",
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

            {/* Search and User Actions */}
            <Group gap="sm">
              {/* Search Button */}
              <Tooltip label="Search" position="bottom" withArrow>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  radius="xl"
                  onClick={() => setSearchOpened(true)}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                >
                  <IconSearch size={20} stroke={1.5} />
                </ActionIcon>
              </Tooltip>

              {/* Theme Toggle */}
              <Tooltip
                label={colorScheme === "dark" ? "Light mode" : "Dark mode"}
                position="bottom"
                withArrow
              >
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  radius="xl"
                  onClick={() => toggleColorScheme()}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                >
                  {colorScheme === "dark" ? (
                    <IconSun size={20} stroke={1.5} />
                  ) : (
                    <IconMoon size={20} stroke={1.5} />
                  )}
                </ActionIcon>
              </Tooltip>

              {!isAuthenticated ? (
                <Group gap="sm">
                  <Button
                    variant="light"
                    size="sm"
                    radius="xl"
                    onClick={() => navigate("/auth")}
                    style={{
                      transition: "all 0.2s ease",
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    radius="xl"
                    onClick={() => navigate("/auth")}
                    gradient={{ from: "blue", to: "cyan" }}
                    variant="gradient"
                    style={{
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 12px rgba(34, 139, 230, 0.3)",
                    }}
                  >
                    Join Kendle
                  </Button>
                </Group>
              ) : (
                <Group gap="xs">
                  {/* Notifications */}
                  <Tooltip label="Notifications" position="bottom" withArrow>
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="xl"
                      onClick={() => navigate("/notifications")}
                      style={{
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconBell size={20} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>

                  {/* Messages */}
                  <Tooltip label="Messages" position="bottom" withArrow>
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="xl"
                      onClick={() => navigate("/chat")}
                      style={{
                        position: "relative",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconMessage size={20} stroke={1.5} />
                      {unreadCount > 0 && (
                        <Indicator
                          size={12}
                          color="red"
                          position="top-end"
                          offset={2}
                          styles={{
                            indicator: {
                              border: "2px solid white",
                              animation: "pulse 2s infinite",
                            },
                          }}
                        />
                      )}
                    </ActionIcon>
                  </Tooltip>

                  {/* User Menu */}
                  <Menu
                    shadow="lg"
                    width={280}
                    position="bottom-end"
                    radius="md"
                    transitionProps={{ duration: 200 }}
                  >
                    <Menu.Target>
                      <UnstyledButton
                        style={{
                          borderRadius: "50%",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          padding: "2px",
                        }}
                        className="avatar-hover"
                      >
                        <Avatar
                          src={user?.avatar || "/user.png"}
                          alt={user?.firstName}
                          size="md"
                          radius="xl"
                          style={{
                            border: "2px solid var(--mantine-color-blue-2)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {user?.firstName?.charAt(0).toUpperCase()}
                        </Avatar>
                      </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>
                        <Group gap="sm" p="xs">
                          <Avatar
                            src={user?.avatar || "/user.png"}
                            size="lg"
                            radius="xl"
                          >
                            {user?.firstName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Stack gap={2}>
                            <Text size="sm" fw={600}>
                              {user?.firstName} {user?.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {user?.phoneNumber}
                            </Text>
                            {user?.isVerified && (
                              <Badge
                                size="xs"
                                variant="light"
                                color="blue"
                                leftSection={<IconShield size={10} />}
                              >
                                Verified
                              </Badge>
                            )}
                          </Stack>
                        </Group>
                      </Menu.Label>

                      <Divider />

                      <Menu.Item
                        leftSection={<IconUser size={16} />}
                        onClick={() => navigate("/profile")}
                        style={{ borderRadius: "8px" }}
                      >
                        <Box>
                          <Text size="sm">Your Profile</Text>
                          <Text size="xs" c="dimmed">
                            View and edit your profile
                          </Text>
                        </Box>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconHeart size={16} />}
                        onClick={() => navigate("/liked")}
                        style={{ borderRadius: "8px" }}
                      >
                        <Box>
                          <Text size="sm">Liked Posts</Text>
                          <Text size="xs" c="dimmed">
                            Posts you've liked
                          </Text>
                        </Box>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconBookmark size={16} />}
                        onClick={() => navigate("/bookmarks")}
                        style={{ borderRadius: "8px" }}
                      >
                        <Box>
                          <Text size="sm">Bookmarks</Text>
                          <Text size="xs" c="dimmed">
                            Saved for later
                          </Text>
                        </Box>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconSettings size={16} />}
                        onClick={() => navigate("/settings")}
                        style={{ borderRadius: "8px" }}
                      >
                        <Box>
                          <Text size="sm">Settings</Text>
                          <Text size="xs" c="dimmed">
                            Account and preferences
                          </Text>
                        </Box>
                      </Menu.Item>

                      <Divider />

                      <Menu.Item
                        leftSection={<IconLogout size={16} />}
                        color="red"
                        onClick={handleLogout}
                        style={{ borderRadius: "8px" }}
                      >
                        <Box>
                          <Text size="sm">Sign Out</Text>
                          <Text size="xs" c="dimmed">
                            Sign out of your account
                          </Text>
                        </Box>
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
      )}
    </Transition>
  );
}
