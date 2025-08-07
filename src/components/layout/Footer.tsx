import { useNavigate, useLocation } from 'react-router-dom'
import {
  Group,
  ActionIcon,
  Badge,
} from '@mantine/core'
import {
  IconHome,
  IconSearch,
  IconPlus,
  IconMessageCircle,
  IconUser,
} from '@tabler/icons-react'
import { useUIStore } from '../../stores/uiStore'

const mobileNavItems = [
  { label: 'Home', icon: IconHome, path: '/' },
  { label: 'Explore', icon: IconSearch, path: '/explore' },
  { label: 'Create', icon: IconPlus, path: '/create-post' },
  { label: 'Chat', icon: IconMessageCircle, path: '/chat' },
  { label: 'Profile', icon: IconUser, path: '/profile' },
]

export function FooterContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useUIStore()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <Group justify="space-around" h="100%" p="md">
      {mobileNavItems.map((item) => (
        <ActionIcon
          key={item.path}
          variant={isActive(item.path) ? 'filled' : 'subtle'}
          size="lg"
          onClick={() => navigate(item.path)}
          style={{ position: 'relative' }}
        >
          <item.icon size={20} />
          {item.path === '/chat' && unreadCount > 0 && (
            <Badge
              size="xs"
              color="red"
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 16,
                height: 16,
                fontSize: 10,
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </ActionIcon>
      ))}
    </Group>
  )
}
