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
} from "@mantine/core";
import {
  IconArchive,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useInboxStore } from "../../stores/inboxStore";
import { ChatWindow } from "./ChatWindow";
import { ConversationCard } from "./ConversationCard";

export function InboxPage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    searchQuery,
    setSearchQuery,
    getFilteredConversations,
    getUnreadCount,
    initializeInbox,
    connectWebSocket,
    isConnected,
  } = useInboxStore();

  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const filteredConversations = getFilteredConversations();
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const unreadCount = getUnreadCount();

  // Check if mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Initialize inbox and connect WebSocket
  useEffect(() => {
    initializeInbox();

    if (isAuthenticated && user) {
      connectWebSocket(user.id);
    }
  }, [isAuthenticated, user, initializeInbox, connectWebSocket]);

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    // On mobile, hide conversation list when selecting a chat
    if (isMobileView) {
      setShowConversations(false);
    }
  };

  // Handle back to conversations (mobile)
  const handleBackToConversations = () => {
    setSelectedConversationId(null);
    setShowConversations(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Card withBorder p="xl" ta="center">
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Sign in to access your inbox
            </Text>
            <Text c="dimmed">
              Connect with other users and start conversations
            </Text>
          </Stack>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card withBorder h="100%" style={{ overflow: "hidden" }}>
        {/* Mobile Layout */}
        {isMobileView ? (
          <Stack h="100%" gap={0}>
            {showConversations ? (
              // Conversations List (Mobile)
              <Stack h="100%" gap={0}>
                {/* Mobile Header */}
                <Box
                  p="md"
                  style={{
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                    backgroundColor: "var(--mantine-color-white)",
                  }}
                >
                  <Group justify="space-between">
                    <Group>
                      <Title order={2} size="h3">
                        Inbox
                      </Title>
                      {unreadCount > 0 && (
                        <Text size="sm" c="blue" fw={500}>
                          ({unreadCount} unread)
                        </Text>
                      )}
                    </Group>
                    <Group>
                      <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => setShowNewChatModal(true)}
                      >
                        <IconPlus size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => setShowMobileMenu(true)}
                      >
                        <IconMenu2 size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Box>

                {/* Search */}
                <Box p="md" pb="sm">
                  <TextInput
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    size="md"
                    radius="xl"
                  />
                </Box>

                {/* Connection Status */}
                {!isConnected && (
                  <Box px="md" pb="sm">
                    <Card withBorder p="xs" bg="yellow.0" c="yellow.9">
                      <Text size="xs" ta="center">
                        Connecting to chat service...
                      </Text>
                    </Card>
                  </Box>
                )}

                {/* Conversations List */}
                <ScrollArea style={{ flex: 1 }} px="md">
                  <Stack gap="xs" pb="md">
                    {filteredConversations.length === 0 ? (
                      <Stack align="center" py="xl" gap="md">
                        <Text size="lg" c="dimmed" ta="center">
                          No conversations yet
                        </Text>
                        <Button
                          leftSection={<IconPlus size={16} />}
                          onClick={() => setShowNewChatModal(true)}
                          variant="light"
                        >
                          Start a Conversation
                        </Button>
                      </Stack>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <ConversationCard
                          key={conversation.id}
                          conversation={conversation}
                          isSelected={
                            selectedConversationId === conversation.id
                          }
                          onClick={() =>
                            handleConversationSelect(conversation.id)
                          }
                        />
                      ))
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            ) : (
              // Chat Window (Mobile)
              selectedConversation && (
                <ChatWindow
                  conversation={selectedConversation}
                  onBack={handleBackToConversations}
                />
              )
            )}
          </Stack>
        ) : (
          // Desktop Layout
          <Group h="100%" gap={0} wrap="nowrap">
            {/* Conversations Sidebar */}
            <Box
              w={360}
              h="100%"
              style={{
                borderRight: "1px solid var(--mantine-color-gray-3)",
                flexShrink: 0,
              }}
            >
              <Stack h="100%" gap={0}>
                {/* Header */}
                <Box
                  p="md"
                  style={{
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                  }}
                >
                  <Group justify="space-between" mb="sm">
                    <Title order={2} size="h3">
                      Inbox
                    </Title>
                    <Group>
                      <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => setShowNewChatModal(true)}
                      >
                        <IconPlus size={18} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" size="lg">
                        <IconSettings size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  {/* Connection Status & Stats */}
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {isConnected ? "Connected" : "Connecting..."}
                    </Text>
                    {unreadCount > 0 && (
                      <Text size="sm" c="blue" fw={500}>
                        {unreadCount} unread
                      </Text>
                    )}
                  </Group>
                </Box>

                {/* Search */}
                <Box p="md" pb="sm">
                  <TextInput
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    size="sm"
                    radius="xl"
                  />
                </Box>

                {/* Quick Actions */}
                <Box px="md" pb="sm">
                  <Group gap="xs">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconArchive size={14} />}
                    >
                      Archived
                    </Button>
                  </Group>
                </Box>

                {/* Conversations List */}
                <ScrollArea style={{ flex: 1 }} px="md">
                  <Stack gap="xs" pb="md">
                    {filteredConversations.length === 0 ? (
                      <Stack align="center" py="xl" gap="md">
                        <Text size="lg" c="dimmed" ta="center">
                          {searchQuery
                            ? "No conversations found"
                            : "No conversations yet"}
                        </Text>
                        {!searchQuery && (
                          <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setShowNewChatModal(true)}
                            variant="light"
                            size="sm"
                          >
                            Start a Conversation
                          </Button>
                        )}
                      </Stack>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <ConversationCard
                          key={conversation.id}
                          conversation={conversation}
                          isSelected={
                            selectedConversationId === conversation.id
                          }
                          onClick={() =>
                            handleConversationSelect(conversation.id)
                          }
                        />
                      ))
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Box>

            {/* Chat Area */}
            <Box style={{ flex: 1 }} h="100%">
              {selectedConversation ? (
                <ChatWindow conversation={selectedConversation} />
              ) : (
                <Stack align="center" justify="center" h="100%" gap="md">
                  <Avatar size="xl" radius="xl">
                    💬
                  </Avatar>
                  <Stack align="center" gap="xs">
                    <Text size="xl" fw={500}>
                      Welcome to your Inbox
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" maw={300}>
                      Select a conversation from the list to start chatting, or
                      create a new conversation.
                    </Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={() => setShowNewChatModal(true)}
                      variant="light"
                      mt="md"
                    >
                      Start New Conversation
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Group>
        )}
      </Card>

      {/* New Chat Modal */}
      <Modal
        opened={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Start New Conversation"
        size="sm"
      >
        <Stack gap="md">
          <TextInput
            placeholder="Search users..."
            leftSection={<IconSearch size={16} />}
          />
          <Text size="sm" c="dimmed">
            Feature coming soon! You'll be able to search for users and start
            new conversations.
          </Text>
          <Button fullWidth onClick={() => setShowNewChatModal(false)}>
            Close
          </Button>
        </Stack>
      </Modal>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        position="right"
        size="280px"
        title="Inbox Settings"
      >
        <Stack gap="md">
          <Button
            variant="light"
            leftSection={<IconArchive size={16} />}
            fullWidth
            justify="flex-start"
          >
            Archived Conversations
          </Button>
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            fullWidth
            justify="flex-start"
          >
            Chat Settings
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
