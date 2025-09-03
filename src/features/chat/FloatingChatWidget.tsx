import { Box, Portal, Transition, ActionIcon, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMessage, IconX } from '@tabler/icons-react';
import { useAuthStore } from '../../stores/authStore';
import { useWebSocketIntegration } from '../../hooks/useWebSocket';
import { useUnreadCount } from '../../hooks/useChat';
import { ChatHeads } from './ChatHeads';
import { ChatWidget } from './ChatWidget';
import { ChatWindows } from './ChatWindows';

export function FloatingChatWidget() {
  const { isAuthenticated, user } = useAuthStore();
  const [opened, { open, close }] = useDisclosure(false);
  const { isConnected } = useWebSocketIntegration();
  const { data: unreadCount } = useUnreadCount();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  if (isMobile) {
    return (
      <Portal>
        <Box
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {/* Chat Heads - Always visible */}
          <ChatHeads />

          {/* Main Chat Button */}
          <Box
            style={{
              pointerEvents: 'auto',
              marginTop: 10,
            }}
          >
            <ActionIcon
              size="lg"
              variant="filled"
              color="primary"
              onClick={open}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              <IconMessage size={20} />
            </ActionIcon>

            {/* Unread count badge */}
            {unreadCount && unreadCount.count > 0 && (
              <Badge
                size="xs"
                variant="filled"
                color="red"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              >
                {unreadCount.count > 99 ? '99+' : unreadCount.count}
              </Badge>
            )}
          </Box>

          {/* Mobile Chat Widget - Full screen overlay */}
          <Transition
            mounted={opened}
            transition="slide-up"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <Box
                style={{
                  ...styles,
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 2000,
                  pointerEvents: 'auto',
                }}
                onClick={close}
              >
                <Box
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'white',
                    borderRadius: '20px 20px 0 0',
                    marginTop: '10%',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Mobile Header */}
                  <Box
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--mantine-color-gray-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box style={{ width: 40 }} />
                    <Box style={{ textAlign: 'center' }}>
                      <strong>Messages</strong>
                    </Box>
                    <ActionIcon variant="subtle" onClick={close}>
                      <IconX size={20} />
                    </ActionIcon>
                  </Box>

                  {/* Mobile Chat Content */}
                  <Box style={{ height: 'calc(100% - 60px)' }}>
                    <ChatWidget onClose={close} />
                  </Box>
                </Box>
              </Box>
            )}
          </Transition>
        </Box>
      </Portal>
    );
  }

  // Desktop version
  return (
    <Portal>
      <Box
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        {/* Chat Heads - Always visible */}
        <ChatHeads />

        {/* Chat Windows - Floating windows */}
        <ChatWindows />

        {/* Main Chat Button */}
        <Box
          style={{
            pointerEvents: 'auto',
            marginTop: 10,
          }}
        >
          <ActionIcon
            size="lg"
            variant="filled"
            color="primary"
            onClick={open}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
            }}
          >
            <IconMessage size={20} />
          </ActionIcon>

          {/* Unread count badge */}
          {unreadCount && unreadCount.count > 0 && (
            <Badge
              size="xs"
              variant="filled"
              color="red"
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {unreadCount.count > 99 ? '99+' : unreadCount.count}
            </Badge>
          )}
        </Box>

        {/* Main Chat Widget - Opens when clicked */}
        <Transition
          mounted={opened}
          transition="slide-up"
          duration={300}
          timingFunction="ease"
        >
          {(styles) => (
            <Box style={styles}>
              <ChatWidget onClose={close} />
            </Box>
          )}
        </Transition>

        {/* Connection Status Indicator */}
        {!isConnected && (
          <Box
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#ff4444',
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
    </Portal>
  );
}
