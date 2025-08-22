import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Drawer,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconArchive,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { ChatWindow } from "./ChatWindow";
import { ConversationCard } from "./ConversationCard";
import { useConversations, useUnreadCount } from "../../hooks/useChat";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";

export function ChatPage() {
  const { isAuthenticated } = useAuthStore();

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
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [conversations, searchQuery]);

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId,
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
      <Card withBorder p="xl" radius="md">
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>
            Authentication Required
          </Text>
          <Text c="dimmed" ta="center">
            Please sign in to access your messages.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Card withBorder p="md" style={{ borderRadius: 0, borderTop: 0 }}>
        <Group justify="space-between">
          <Group>
            {isMobileView && !showConversations && (
              <ActionIcon variant="subtle" onClick={handleBackToConversations}>
                <IconMenu2 size={20} />
              </ActionIcon>
            )}
            <Title order={3}>
              {selectedConversation
                ? selectedConversation.name ||
                  `${selectedConversation.participants[0]?.firstName} ${selectedConversation.participants[0]?.lastName}`
                : "Messages"}
            </Title>
            {unreadCount > 0 && (
              <Text size="sm" c="blue" fw={500}>
                ({unreadCount} unread)
              </Text>
            )}
          </Group>

          <Group>
            <Text size="xs" c={isConnected ? "green" : "red"}>
              {connectionState}
            </Text>
            <ActionIcon variant="subtle" onClick={handleNewChat}>
              <IconPlus size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle">
              <IconSettings size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>

      <Box style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Conversations List */}
        {(!isMobileView || showConversations) && (
          <Card
            withBorder
            style={{
              width: isMobileView ? "100%" : "350px",
              borderRadius: 0,
              borderTop: 0,
              borderBottom: 0,
              borderLeft: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search */}
            <Box
              p="md"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
            >
              <TextInput
                placeholder="Search conversations..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="sm"
              />
            </Box>

            {/* Conversations */}
            <ScrollArea style={{ flex: 1 }}>
              {conversationsLoading ? (
                <Center py="md">
                  <Stack align="center" gap="sm">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">
                      Loading conversations...
                    </Text>
                  </Stack>
                </Center>
              ) : conversationsError ? (
                <Card p="md">
                  <Text c="red" size="sm" ta="center">
                    Failed to load conversations
                  </Text>
                </Card>
              ) : filteredConversations.length === 0 ? (
                <Stack align="center" gap="md" p="xl">
                  <Text size="lg" fw={500} c="dimmed">
                    No conversations yet
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Start a new conversation to begin messaging
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleNewChat}
                    variant="light"
                  >
                    New Chat
                  </Button>
                </Stack>
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
          </Card>
        )}

        {/* Chat Window */}
        {(!isMobileView || !showConversations) && (
          <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onBack={handleBackToConversations}
                showBackButton={isMobileView}
              />
            ) : (
              <Card
                style={{
                  flex: 1,
                  borderRadius: 0,
                  borderTop: 0,
                  borderBottom: 0,
                  borderRight: 0,
                }}
              >
                <Stack
                  align="center"
                  justify="center"
                  style={{ height: "100%" }}
                  gap="md"
                >
                  <Avatar size="xl" color="blue">
                    <IconMenu2 size={32} />
                  </Avatar>
                  <Text size="lg" fw={500} c="dimmed">
                    Select a conversation
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Choose a conversation from the sidebar to start messaging
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleNewChat}
                    variant="light"
                  >
                    Start New Chat
                  </Button>
                </Stack>
              </Card>
            )}
          </Box>
        )}
      </Box>

      {/* New Chat Modal */}
      <Modal
        opened={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Start New Chat"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            placeholder="Search users..."
            leftSection={<IconSearch size={16} />}
          />

          <Text size="sm" c="dimmed">
            Search for users to start a conversation
          </Text>

          {/* TODO: Add user search results here */}
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Recent contacts will appear here
            </Text>
          </Stack>
        </Stack>
      </Modal>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        title="Chat Settings"
        position="right"
        size="sm"
      >
        <Stack gap="md">
          <Button
            leftSection={<IconArchive size={16} />}
            variant="light"
            fullWidth
          >
            Archived Chats
          </Button>
          <Button
            leftSection={<IconSettings size={16} />}
            variant="light"
            fullWidth
          >
            Chat Settings
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
