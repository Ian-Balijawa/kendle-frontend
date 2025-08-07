import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Group, Container,
  Burger,
  TextInput,
  ActionIcon,
  Avatar,
  Menu,
  Badge,
  Box,
  Text
} from '@mantine/core'
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconLogout,
  IconUser
} from '@tabler/icons-react'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'

interface HeaderContentProps {
  opened: boolean
  setOpened: (opened: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function HeaderContent({
  opened,
  setOpened,
  sidebarOpen,
  setSidebarOpen,
}: HeaderContentProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" h="100%">
        <Group>
          <Burger
            opened={opened}
            onClick={() => setOpened(!opened)}
            size="sm"
            color="var(--mantine-color-text)"
            hiddenFrom="sm"
          />

          <Burger
            opened={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            size="sm"
            color="var(--mantine-color-text)"
            visibleFrom="sm"
          />

          <Text
            size="xl"
            fw={700}
            className="text-gradient"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Kendle
          </Text>
        </Group>

        <Box style={{ flex: 1 }} mx="xl" visibleFrom="md">
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

        <Group>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => navigate('/notifications')}
            style={{ position: 'relative' }}
          >
            <IconBell size={20} />
            {unreadCount > 0 && (
              <Badge
                size="xs"
                color="red"
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  minWidth: 18,
                  height: 18,
                  fontSize: 10,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </ActionIcon>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Avatar
                src={user?.avatar}
                alt={user?.firstName}
                size="md"
                style={{ cursor: 'pointer' }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => navigate('/profile')}
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => navigate('/settings')}
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
        </Group>
      </Group>
    </Container>
  )
}
