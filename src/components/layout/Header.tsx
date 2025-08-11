import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBell,
  IconSearch as IconExplore,
  IconHome,
  IconLogout,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSettings,
  IconTrendingUp,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

const navigationItems = [
  { label: "Home", icon: IconHome, path: "/dashboard" },
  { label: "Explore", icon: IconExplore, path: "/dashboard/explore" },
  { label: "Trending", icon: IconTrendingUp, path: "/dashboard/trending" },
  { label: "Chat", icon: IconMessageCircle, path: "/dashboard/chat" },
];

export function HeaderContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/dashboard/explore?q=${encodeURIComponent(searchQuery.trim())}`
      );
      setMobileMenuOpened(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setMobileMenuOpened(false);
  };

  const handleSignIn = () => {
    navigate("/", { replace: true });
    setMobileMenuOpened(false);
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpened(false);
  };

  return (
    <>
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%" gap="md">
          {/* Left Section - Logo and Mobile Menu */}
          <Group gap="md">
            <Box className="mobile-menu-button">
              <Burger
                opened={mobileMenuOpened}
                onClick={() => setMobileMenuOpened(true)}
                size="sm"
                color="var(--mantine-color-text)"
              />
            </Box>

            <UnstyledButton onClick={() => navigate("/dashboard")}>
              <Text
                size="xl"
                fw={700}
                className="text-gradient"
                style={{ cursor: "pointer" }}
              >
                Kendle
              </Text>
            </UnstyledButton>
          </Group>

          {/* Center Section - Search Bar (Desktop) */}
          <Box className="desktop-search" style={{ flex: 1 }} mx="xl">
            <form onSubmit={handleSearch}>
              <TextInput
                placeholder="Search posts, people, or hashtags..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                size="sm"
                radius="xl"
                style={{ maxWidth: 400 }}
              />
            </form>
          </Box>

          {/* Right Section - Actions and User Menu */}
          <Group gap="sm">
            {/* Create Post Button - Desktop (Only for authenticated users) */}
            {isAuthenticated && (
              <Box className="desktop-create-post">
                <Button
                  leftSection={<IconPlus size={16} />}
                  size="sm"
                  onClick={() => navigate("/protected/create-post")}
                  variant="filled"
                  radius="xl"
                >
                  Create Post
                </Button>
              </Box>
            )}

            {/* Sign In Button - For unauthenticated users */}
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignIn}
                radius="xl"
              >
                Sign In
              </Button>
            )}

            {/* Notifications - Only for authenticated users */}
            {isAuthenticated && (
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => navigate("/dashboard/notifications")}
                style={{ position: "relative" }}
              >
                <IconBell size={20} />
                {unreadCount > 0 && (
                  <Badge
                    size="xs"
                    color="red"
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      minWidth: 18,
                      height: 18,
                      fontSize: 10,
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </ActionIcon>
            )}

            {/* User Menu - Only for authenticated users */}
            {isAuthenticated && user && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <UnstyledButton>
                    <Avatar
                      src={user?.avatar}
                      alt={user?.firstName}
                      size="md"
                      style={{ cursor: "pointer" }}
                    >
                      {user?.firstName?.charAt(0)}
                    </Avatar>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={() => navigate("/dashboard/profile")}
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={() => navigate("/protected/edit-profile")}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={mobileMenuOpened}
        onClose={() => setMobileMenuOpened(false)}
        size="100%"
        position="left"
        title={
          <Group justify="space-between" w="100%">
            <Text size="lg" fw={600}>
              Menu
            </Text>
            <ActionIcon
              variant="subtle"
              onClick={() => setMobileMenuOpened(false)}
            >
              <IconX size={20} />
            </ActionIcon>
          </Group>
        }
        styles={{
          header: {
            borderBottom: "1px solid var(--mantine-color-gray-3)",
            padding: "var(--mantine-spacing-md)",
          },
          body: {
            padding: 0,
          },
        }}
      >
        <Stack gap={0} h="100%">
          {/* User Profile Section - Only for authenticated users */}
          {isAuthenticated && user && (
            <Box
              p="lg"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Group>
                <Avatar
                  src={user?.avatar}
                  alt={user?.firstName}
                  size="lg"
                  radius="xl"
                >
                  {user?.firstName?.charAt(0)}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {user?.phoneNumber}
                  </Text>
                </Box>
              </Group>
            </Box>
          )}

          {/* Sign In Section - For unauthenticated users */}
          {!isAuthenticated && (
            <Box
              p="lg"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Stack gap="md">
                <Text size="sm" fw={500} ta="center">
                  Welcome to Kendle
                </Text>
                <Button fullWidth onClick={handleSignIn} variant="filled">
                  Sign In to Continue
                </Button>
              </Stack>
            </Box>
          )}

          {/* Search Bar */}
          <Box
            p="lg"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
          >
            <form onSubmit={handleSearch}>
              <TextInput
                placeholder="Search posts, people, or hashtags..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                size="md"
                radius="md"
              />
            </form>
          </Box>

          {/* Create Post Button - Only for authenticated users */}
          {isAuthenticated && (
            <Box
              p="lg"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Button
                leftSection={<IconPlus size={16} />}
                fullWidth
                size="md"
                onClick={() => handleNavigation("/protected/create-post")}
              >
                Create Post
              </Button>
            </Box>
          )}

          {/* Navigation Links */}
          <Box p="lg" style={{ flex: 1 }}>
            <Stack gap="xs">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<item.icon size={18} />}
                  active={isActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                  variant="filled"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Bottom Section - Only for authenticated users */}
          {isAuthenticated && (
            <Box
              p="lg"
              style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Stack gap="xs">
                <NavLink
                  label="Profile"
                  leftSection={<IconUser size={18} />}
                  onClick={() => handleNavigation("/dashboard/profile")}
                  variant="subtle"
                />
                <NavLink
                  label="Settings"
                  leftSection={<IconSettings size={18} />}
                  onClick={() => handleNavigation("/protected/edit-profile")}
                  variant="subtle"
                />
                <Divider />
                <NavLink
                  label="Logout"
                  leftSection={<IconLogout size={18} />}
                  onClick={handleLogout}
                  variant="subtle"
                  color="red"
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
