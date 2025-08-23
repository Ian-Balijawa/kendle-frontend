import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Drawer,
  Group,
  Loader,
  Modal,
  Paper,
  rem,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArchive,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useConversations, useUnreadCount } from "../../hooks/useChat";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";
import { useAuthStore } from "../../stores/authStore";
import { ChatWindow } from "./ChatWindow";
import { ConversationCard } from "./ConversationCard";

export function ChatPage() {
  const { isAuthenticated } = useAuthStore();
  const theme = useMantineTheme();

  // React Query hooks
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();
  const { data: unreadData } = useUnreadCount();

  // WebSocket integration
  const { isConnected, connectionState } = useWebSocketIntegration();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations.sort((a, b) => {
        // Pinned conversations first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by last update time
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    }

    const query = searchQuery.toLowerCase();
    return conversations
      .filter((conv) => {
        const participant = conv.participants[0];
        const participantName =
          `${participant.firstName} ${participant.lastName}`.toLowerCase();
        const lastMessageContent =
          conv.lastMessage?.content.toLowerCase() || "";
        const conversationName = conv.name?.toLowerCase() || "";

        return (
          participantName.includes(query) ||
          lastMessageContent.includes(query) ||
          conversationName.includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [conversations, searchQuery]);

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  const unreadCount = unreadData?.count || 0;

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);

      if (isMobile && selectedConversationId) {
        setShowConversations(false);
      } else if (!isMobile) {
        setShowConversations(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    if (isMobileView) {
      setShowConversations(false);
    }
  };

  const handleBackToConversations = () => {
    if (isMobileView) {
      setShowConversations(true);
      setSelectedConversationId(null);
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  if (!isAuthenticated) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>
            Authentication Required
          </Text>
          <Text c="dimmed" ta="center">
            Please sign in to access your messages.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.gray[0],
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
        <Group justify="space-between">
          <Group>
            {isMobileView && !showConversations && (
              <ActionIcon
                variant="subtle"
                onClick={handleBackToConversations}
                radius="xl"
                size="lg"
                style={{
                  backgroundColor: theme.colors.gray[1],
                  color: theme.colors.gray[7],
                }}
              >
                <IconMenu2 size={18} />
              </ActionIcon>
            )}
            <div>
              <Title order={3} fw={600} c={theme.colors.gray[8]}>
                {selectedConversation
                  ? selectedConversation.name ||
                    `${selectedConversation.participants[0]?.firstName} ${selectedConversation.participants[0]?.lastName}`
                  : "Messages"}
              </Title>
              {unreadCount > 0 && (
                <Badge
                  size="sm"
                  color="blue"
                  variant="light"
                  mt={4}
                  style={{ fontSize: rem(11) }}
                >
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </Group>

          <Group>
            <Badge
              size="xs"
              color={isConnected ? "green" : "red"}
              variant="dot"
              style={{ fontSize: rem(10) }}
            >
              {connectionState}
            </Badge>
            <ActionIcon
              variant="subtle"
              onClick={handleNewChat}
              radius="xl"
              size="lg"
              style={{
                backgroundColor: theme.colors.blue[1],
                color: theme.colors.blue[6],
              }}
            >
              <IconPlus size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="lg"
              style={{
                backgroundColor: theme.colors.gray[1],
                color: theme.colors.gray[6],
              }}
            >
              <IconSettings size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      <Box style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Conversations List */}
        {(!isMobileView || showConversations) && (
          <Paper
            shadow="xs"
            style={{
              width: isMobileView ? "100%" : "360px",
              borderRadius: 0,
              borderRight: `1px solid ${theme.colors.gray[2]}`,
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.white,
            }}
          >
            {/* Search */}
            <Box
              p="md"
              style={{
                borderBottom: `1px solid ${theme.colors.gray[2]}`,
                backgroundColor: theme.colors.gray[0],
              }}
            >
              <TextInput
                placeholder="Search conversations..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="sm"
                radius="xl"
                styles={{
                  input: {
                    border: `1px solid ${theme.colors.gray[3]}`,
                    backgroundColor: theme.white,
                    fontSize: rem(14),
                  },
                }}
              />
            </Box>

            {/* Conversations */}
            <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
              {conversationsLoading ? (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <Loader size="lg" color="blue" />
                    <Text size="sm" c="dimmed" fw={500}>
                      Loading conversations...
                    </Text>
                  </Stack>
                </Center>
              ) : conversationsError ? (
                <Paper p="md" radius={0}>
                  <Stack align="center" gap="md">
                    <Text c="red" size="sm" ta="center" fw={500}>
                      Failed to load conversations
                    </Text>
                    <Button
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </Stack>
                </Paper>
              ) : filteredConversations.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="lg" style={{ maxWidth: 280 }}>
                    <Paper
                      p="xl"
                      radius="xl"
                      style={{
                        backgroundColor: theme.colors.gray[1],
                      }}
                    >
                      <IconMenu2 size={48} color={theme.colors.gray[4]} />
                    </Paper>
                    <div style={{ textAlign: "center" }}>
                      <Text size="lg" fw={600} c={theme.colors.gray[7]} mb={8}>
                        No conversations yet
                      </Text>
                      <Text size="sm" c="dimmed" mb="lg">
                        Start a new conversation to begin messaging
                      </Text>
                    </div>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleNewChat}
                      variant="filled"
                      color="blue"
                      radius="xl"
                      size="md"
                    >
                      New Chat
                    </Button>
                  </Stack>
                </Center>
              ) : (
                <Stack gap={0}>
                  {filteredConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversationId}
                      onClick={() => handleConversationSelect(conversation.id)}
                    />
                  ))}
                </Stack>
              )}
            </ScrollArea>
          </Paper>
        )}

        {/* Chat Window */}
        {(!isMobileView || !showConversations) && (
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.colors.gray[0],
            }}
          >
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onBack={handleBackToConversations}
                showBackButton={isMobileView}
              />
            ) : (
              <Center style={{ height: "100%", flexDirection: "column" }}>
                <Stack align="center" gap="xl" style={{ maxWidth: 320 }}>
                  <Paper
                    p="xl"
                    radius="xl"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.blue[1]} 0%, ${theme.colors.cyan[1]} 100%)`,
                      border: `2px solid ${theme.colors.blue[2]}`,
                    }}
                  >
                    <IconMenu2 size={64} color={theme.colors.blue[6]} />
                  </Paper>
                  <div style={{ textAlign: "center" }}>
                    <Text size="xl" fw={600} c={theme.colors.gray[8]} mb={8}>
                      Select a conversation
                    </Text>
                    <Text size="sm" c="dimmed" mb="xl">
                      Choose a conversation from the sidebar to start messaging
                    </Text>
                  </div>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleNewChat}
                    variant="filled"
                    color="blue"
                    radius="xl"
                    size="lg"
                    style={{
                      boxShadow: theme.shadows.md,
                    }}
                  >
                    Start New Chat
                  </Button>
                </Stack>
              </Center>
            )}
          </Box>
        )}
      </Box>

      {/* New Chat Modal */}
      <Modal
        opened={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title={
          <Group>
            <IconPlus size={20} />
            <Text fw={600}>Start New Chat</Text>
          </Group>
        }
        size="lg"
        radius="lg"
        padding="xl"
        styles={{
          header: {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
            paddingBottom: theme.spacing.md,
          },
          body: {
            paddingTop: theme.spacing.lg,
          },
        }}
      >
        <Stack gap="lg">
          <TextInput
            placeholder="Search users by name, username, or phone..."
            leftSection={<IconSearch size={18} />}
            size="md"
            radius="xl"
            styles={{
              input: {
                border: `2px solid ${theme.colors.gray[2]}`,
                backgroundColor: theme.colors.gray[0],
                fontSize: rem(14),
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              },
            }}
          />

          <Text size="sm" c="dimmed" ta="center">
            Search for users to start a conversation with
          </Text>

          {/* User Search Results Placeholder */}
          <Paper
            p="xl"
            radius="lg"
            style={{
              backgroundColor: theme.colors.gray[1],
              border: `2px dashed ${theme.colors.gray[3]}`,
            }}
          >
            <Stack align="center" gap="md">
              <IconSearch size={32} color={theme.colors.gray[4]} />
              <Text size="sm" c="dimmed" ta="center" fw={500}>
                Start typing to search for users
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                Recent contacts and search results will appear here
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Modal>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        title={
          <Group>
            <IconSettings size={20} />
            <Text fw={600}>Chat Menu</Text>
          </Group>
        }
        position="right"
        size="sm"
        padding="lg"
        styles={{
          header: {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
            paddingBottom: theme.spacing.md,
          },
        }}
      >
        <Stack gap="sm">
          <Button
            leftSection={<IconArchive size={18} />}
            variant="subtle"
            fullWidth
            radius="lg"
            styles={{
              inner: {
                justifyContent: "flex-start",
              },
            }}
            size="md"
          >
            Archived Chats
          </Button>
          <Button
            leftSection={<IconSettings size={18} />}
            variant="subtle"
            fullWidth
            radius="lg"
            styles={{
              inner: {
                justifyContent: "flex-start",
              },
            }}
            size="md"
          >
            Chat Settings
          </Button>
        </Stack>
      </Drawer>
    </Paper>
  );
}
