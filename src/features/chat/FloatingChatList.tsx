import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useConversations } from "../../hooks/useChat";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";

interface FloatingChatListProps {
  onConversationSelect?: (conversationId: string) => void;
}

export function FloatingChatList({ onConversationSelect }: FloatingChatListProps = {}) {
  const { user } = useAuthStore();
  const { openChatWindow } = useFloatingChatStore();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();

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
        const participantName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
        const lastMessageContent = conv.lastMessage?.content.toLowerCase() || "";
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

  const handleConversationClick = (conversationId: string) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    } else {
      openChatWindow(conversationId);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <Paper
      shadow="md"
      style={{
        width: rem(320),
        height: rem(500),
        borderRadius: rem(12),
        overflow: "hidden",
        border: "1px solid var(--mantine-color-gray-2)",
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <Paper
        p="sm"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Messages
          </Text>
          <ActionIcon variant="subtle" size="sm">
            <IconPlus size={16} />
          </ActionIcon>
        </Group>
      </Paper>

      {/* Search */}
      <Box p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <TextInput
          placeholder="Search conversations..."
          leftSection={<IconSearch size={14} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          size="sm"
          radius="xl"
          styles={{
            input: {
              border: "1px solid var(--mantine-color-gray-3)",
              backgroundColor: "white",
              fontSize: rem(12),
            },
          }}
        />
      </Box>

      {/* Conversations List */}
      <ScrollArea className="chat-scrollbar" style={{ flex: 1, height: rem(400) }} scrollbarSize={4}>
        {conversationsLoading ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Loader size="sm" color="blue" />
              <Text size="xs" c="dimmed">
                Loading chats...
              </Text>
            </Stack>
          </Center>
        ) : conversationsError ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Text c="red" size="xs" ta="center">
                Failed to load chats
              </Text>
              <Button size="xs" variant="light" color="red">
                Try Again
              </Button>
            </Stack>
          </Center>
        ) : filteredConversations.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="sm" style={{ maxWidth: 200 }}>
              <Text size="sm" fw={500} c="dimmed" ta="center">
                {searchQuery.trim() ? "No conversations found" : "No conversations yet"}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {searchQuery.trim()
                  ? "Try a different search term"
                  : "Start a new conversation to begin messaging"
                }
              </Text>
              {!searchQuery.trim() && (
                <Button
                  leftSection={<IconPlus size={12} />}
                  size="xs"
                  variant="light"
                  color="blue"
                  radius="xl"
                >
                  New Chat
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Stack gap={0}>
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
              const isUnread = conversation.unreadCount > 0;

              return (
                <Paper
                  key={conversation.id}
                  p="sm"
                  className={`conversation-item ${isUnread ? "unread" : ""}`}
                  style={{
                    borderBottom: "1px solid var(--mantine-color-gray-1)",
                    cursor: "pointer",
                    backgroundColor: isUnread
                      ? "var(--mantine-color-blue-0)"
                      : "transparent",
                    transition: "background-color 0.2s ease",
                  }}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <Group gap="sm" align="flex-start">
                    <Avatar
                      src={otherParticipant?.avatar}
                      alt={otherParticipant?.firstName || "User"}
                      size="md"
                      radius="xl"
                    >
                      {(otherParticipant?.firstName || "U").charAt(0)}
                    </Avatar>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" align="flex-start">
                        <Text size="sm" fw={600} lineClamp={1}>
                          {conversation.name ||
                            `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                        </Text>
                        {conversation.lastMessage && (
                          <Text size="xs" c="dimmed">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </Text>
                        )}
                      </Group>

                      {conversation.lastMessage && (
                        <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                          {conversation.lastMessage.content}
                        </Text>
                      )}

                      {isUnread && (
                        <Group gap={4} mt={4}>
                          <Box
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "var(--mantine-color-blue-6)",
                            }}
                          />
                          <Text size="xs" c="blue" fw={500}>
                            {conversation.unreadCount} new message{conversation.unreadCount !== 1 ? "s" : ""}
                          </Text>
                        </Group>
                      )}
                    </Box>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}
      </ScrollArea>
    </Paper>
  );
}
