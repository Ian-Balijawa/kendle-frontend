import { useNavigate, useLocation } from 'react-router-dom'
import {
    Stack,
    NavLink,
    Group,
    Avatar,
    Text,
    Divider,
    Button,
    Box,
} from '@mantine/core'
import {
    IconHome,
    IconTrendingUp,
    IconUser,
    IconMessageCircle,
    IconBell,
    IconSettings,
    IconPlus,
    IconSearch,
} from '@tabler/icons-react'
import { useAuthStore } from '../../stores/authStore'

const navigationItems = [
  { label: 'Home', icon: IconHome, path: '/' },
  { label: 'Explore', icon: IconSearch, path: '/explore' },
  { label: 'Trending', icon: IconTrendingUp, path: '/trending' },
  { label: 'Profile', icon: IconUser, path: '/profile' },
  { label: 'Messages', icon: IconMessageCircle, path: '/chat' },
  { label: 'Notifications', icon: IconBell, path: '/notifications' },
  { label: 'Settings', icon: IconSettings, path: '/settings' },
]

export function NavbarContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <Stack gap="md" h="100%">
      {/* User Profile Section */}
      <Box p="md">
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
              @{user?.username}
            </Text>
          </Box>
        </Group>
      </Box>

      <Divider />

      {/* Create Post Button */}
      <Box px="md">
        <Button
          fullWidth
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('/create-post')}
          size="md"
        >
          Create Post
        </Button>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <Stack gap={4}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={<item.icon size={16} />}
            active={isActive(item.path)}
            onClick={() => navigate(item.path)}
            variant="filled"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              margin: '0 var(--mantine-spacing-md)',
            }}
          />
        ))}
      </Stack>

      {/* Bottom Section */}
      <Box style={{ marginTop: 'auto' }} p="md">
        <Text size="xs" c="dimmed" ta="center">
          Kendle v1.0.0
        </Text>
      </Box>
    </Stack>
  )
}
