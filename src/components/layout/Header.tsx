import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Indicator,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBell,
  IconCompass,
  IconHome,
  IconLogout,
  IconMenu2,
  IconMessageCircle,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

const navigationItems = [
  { label: "Home", icon: IconHome, path: "/dashboard" },
  { label: "Explore", icon: IconCompass, path: "/dashboard/explore" },
  { label: "Create", icon: IconPhoto, path: "/dashboard/create" },
  { label: "Messages", icon: IconMessageCircle, path: "/dashboard/chat" },
];

export function HeaderContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/dashboard/explore?q=${encodeURIComponent(searchQuery.trim())}`,
      );
      setSearchFocused(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Paper
      shadow={isScrolled ? "sm" : "none"}
      style={{
        borderRadius: 0,
        transition: "box-shadow 0.2s ease",
        borderBottom: isScrolled
          ? "none"
          : "1px solid var(--mantine-color-gray-2)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Group justify="space-between" h={60} px="lg" gap="md">
        {/* Logo Section */}
        <Group gap="xl">
          <UnstyledButton
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              transition: "all 0.2s ease",
            }}
            className="logo-hover"
          >
            <Text
              size="xl"
              fw={800}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 45 }}
              style={{ letterSpacing: "-0.5px" }}
            >
              Kendle
            </Text>
          </UnstyledButton>

          {/* Desktop Navigation */}
          <Group gap="xs" visibleFrom="md">
            {navigationItems.map((item) => {
              const isCurrentActive = isActive(item.path);
              const needsAuth =
                item.path.includes("chat") || item.path.includes("create");
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
                      canAccess ? navigate(item.path) : navigate("/")
                    }
                    disabled={!canAccess}
                    style={{
                      position: "relative",
                      transition: "all 0.2s ease",
                      transform: isCurrentActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <item.icon size={20} stroke={1.5} />
                    {item.path === "/dashboard/chat" &&
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

        {/* Search Bar - Center */}
        <Box style={{ flex: 1, maxWidth: 400 }} visibleFrom="sm">
          <form onSubmit={handleSearch}>
            <TextInput
              placeholder="Search Kendle..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              leftSection={
                <IconSearch
                  size={18}
                  color={
                    searchFocused
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-5)"
                  }
                />
              }
              size="md"
              radius="xl"
              styles={{
                input: {
                  backgroundColor: searchFocused
                    ? "var(--mantine-color-white)"
                    : "var(--mantine-color-gray-0)",
                  border: searchFocused
                    ? "2px solid var(--mantine-color-blue-6)"
                    : "1px solid var(--mantine-color-gray-2)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-white)",
                    borderColor: "var(--mantine-color-blue-4)",
                  },
                },
              }}
            />
          </form>
        </Box>

        {/* Right Section */}
        <Group gap="sm">
          {!isAuthenticated ? (
            <Group gap="sm">
              <Button
                variant="light"
                size="sm"
                radius="xl"
                onClick={() => navigate("/")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                radius="xl"
                onClick={() => navigate("/")}
                gradient={{ from: "blue", to: "cyan" }}
                variant="gradient"
              >
                Join Kendle
              </Button>
            </Group>
          ) : (
            <Group gap="xs">
              {/* Create Button - Mobile */}
              <ActionIcon
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                size="lg"
                radius="xl"
                onClick={() => navigate("/dashboard/statuses")}
                hiddenFrom="md"
              >
                <IconPlus size={20} />
              </ActionIcon>

              {/* Notifications */}
              <Indicator
                disabled={unreadCount === 0}
                size={16}
                color="red"
                offset={6}
                label={unreadCount > 99 ? "99+" : unreadCount || undefined}
              >
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  radius="xl"
                  onClick={() => navigate("/dashboard/notifications")}
                  style={{ transition: "all 0.2s ease" }}
                >
                  <IconBell size={20} />
                </ActionIcon>
              </Indicator>

              {/* User Menu */}
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
                      src={user?.avatar}
                      alt={user?.firstName}
                      size="md"
                      radius="xl"
                      style={{
                        border: "2px solid var(--mantine-color-gray-2)",
                        cursor: "pointer",
                      }}
                    >
                      {user?.firstName?.charAt(0)}
                    </Avatar>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>
                    <Group gap="sm">
                      <Avatar src={user?.avatar} size="sm" radius="xl">
                        {user?.firstName?.charAt(0)}
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
                    onClick={() => navigate("/dashboard/profile")}
                  >
                    Your Profile
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconSettings size={16} />}
                    onClick={() => navigate("/dashboard/settings")}
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

              {/* Mobile Menu - Hidden for now, could add hamburger menu */}
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                hiddenFrom="md"
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
