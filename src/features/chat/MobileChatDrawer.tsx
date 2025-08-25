import {
  ActionIcon, Box,
  Button,
  Drawer,
  Group,
  Paper, Text, useMantineTheme
} from "@mantine/core";
import {
  IconArrowLeft,
  IconMessageCircle,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useConversations, useUnreadCount } from "../../hooks/useChat";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { FloatingChatList } from "./FloatingChatList";
import { ChatWindow } from "./ChatWindow";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";

interface MobileChatDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function MobileChatDrawer({ opened, onClose }: MobileChatDrawerProps) {
  const { isAuthenticated } = useAuthStore();
  const theme = useMantineTheme();
  const { data: conversations = [] } = useConversations();
  const { data: unreadData } = useUnreadCount();
  const { isConnected } = useWebSocketIntegration();
  const { openChatWindow } = useFloatingChatStore();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);
  const totalUnreadCount = unreadData?.count || 0;

  useEffect(() => {
    if (!opened) {
      setSelectedConversationId(null);
      setShowChatList(true);
    }
  }, [opened]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedConversationId(null);
  };

  const handleOpenDesktopChat = (conversationId: string) => {
    openChatWindow(conversationId);
    onClose();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="90vh"
      radius="lg"
      withCloseButton={false}
      className="mobile-chat-drawer"
      styles={{
        content: {
          backgroundColor: theme.colors.gray[0],
        },
        body: {
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Paper
        p="md"
        shadow="sm"
        style={{
          borderRadius: 0,
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          backgroundColor: theme.white,
        }}
      >
        <Group justify="space-between" align="center">
          <Group>
            {selectedConversationId && (
              <ActionIcon
                variant="subtle"
                onClick={handleBackToList}
                radius="xl"
                size="lg"
                style={{
                  backgroundColor: theme.colors.gray[1],
                  color: theme.colors.gray[7],
                }}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
            )}
            <Box>
              <Text fw={600} size="lg">
                {selectedConversationId
                  ? (selectedConversation?.name ||
                     `${selectedConversation?.participants[0]?.firstName} ${selectedConversation?.participants[0]?.lastName}`)
                  : "Messages"
                }
              </Text>
              {totalUnreadCount > 0 && !selectedConversationId && (
                <Text c="dimmed" size="sm">
                  {totalUnreadCount} unread
                </Text>
              )}
            </Box>
          </Group>

          <Group>
            {/* Connection status */}
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: isConnected ? theme.colors.green[5] : theme.colors.red[5],
              }}
            />

            <ActionIcon
              variant="subtle"
              onClick={onClose}
              radius="xl"
              size="lg"
              style={{
                backgroundColor: theme.colors.gray[1],
                color: theme.colors.gray[6],
              }}
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Content */}
      <Box style={{ flex: 1, overflow: "hidden" }}>
        {showChatList ? (
          <Box p="md">
            <FloatingChatList onConversationSelect={handleConversationSelect} />
          </Box>
        ) : selectedConversation ? (
          <Box style={{ height: "100%" }}>
            <ChatWindow
              conversation={selectedConversation}
              onBack={handleBackToList}
              showBackButton={false}
            />
          </Box>
        ) : null}
      </Box>

      {/* Footer hint for desktop chat */}
      {selectedConversationId && (
        <Paper
          p="sm"
          style={{
            borderTop: `1px solid ${theme.colors.gray[2]}`,
            backgroundColor: theme.colors.blue[0],
          }}
        >
          <Group justify="center">
            <Text size="xs" c="blue" ta="center">
              For better experience, open chat in a separate window
            </Text>
            <Button
              size="xs"
              variant="light"
              color="blue"
              leftSection={<IconMessageCircle size={12} />}
              onClick={() => handleOpenDesktopChat(selectedConversationId)}
            >
              Open Desktop Chat
            </Button>
          </Group>
        </Paper>
      )}
    </Drawer>
  );
}
