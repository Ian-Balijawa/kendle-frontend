import { useEffect, useRef, useState } from "react";
import {
  Box,
  ScrollArea,
  Group,
  Avatar,
  Text,
  Stack,
  Tooltip,
  Badge,
  Paper,
  Transition,
  ActionIcon,
  Center,
} from "@mantine/core";
import {
  IconCheck,
  IconChecks,
  IconClock,
  IconMoodSmile,
} from "@tabler/icons-react";
import {
  useInfiniteMessages,
  useMarkConversationAsRead,
} from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";
import { Message } from "../../types";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessagesProps {
  conversationId: string;
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMessages(conversationId);
  const markAsRead = useMarkConversationAsRead();
  // const addReaction = useAddMessageReaction();
  const { joinConversation, leaveConversation } = useWebSocketIntegration();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  // Mark conversation as read when component mounts and user is viewing
  useEffect(() => {
    if (
      data &&
      data.pages.length > 0 &&
      !markAsRead.isPending &&
      !markAsRead.isSuccess
    ) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]); // Only run when conversationId changes, not on every data change

  // Join conversation for real-time updates
  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation]);

  const allMessages = data?.pages.flat() || [];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (message: Message) => message.senderId === user?.id;

  const renderReactions = (message: Message) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionCounts = message.reactions.reduce(
      (acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return (
      <Group gap={4} mt={4}>
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <Tooltip
            key={emoji}
            label={`${count} reaction${count > 1 ? "s" : ""}`}
          >
            <Badge
              size="xs"
              variant="light"
              radius="xl"
              style={{
                cursor: "pointer",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--mantine-color-indigo-6)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(99, 102, 241, 0.2)",
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => {
                // TODO: Add/remove reaction functionality
                console.log("Toggle reaction:", emoji);
              }}
            >
              {emoji} {count}
            </Badge>
          </Tooltip>
        ))}
      </Group>
    );
  };

  const renderMessageStatus = (message: Message) => {
    if (!isOwnMessage(message)) return null;

    return (
      <Box style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {message.status === "sending" && (
          <IconClock size={12} color="var(--mantine-color-gray-5)" />
        )}
        {message.status === "delivered" && (
          <IconChecks size={12} color="var(--mantine-color-gray-5)" />
        )}
        {message.status === "read" && (
          <IconChecks size={12} color="var(--mantine-color-blue-5)" />
        )}
        {message.status === "failed" && (
          <IconCheck size={12} color="var(--mantine-color-red-5)" />
        )}
      </Box>
    );
  };

  const renderMessage = (message: Message, _index: number) => {
    const isOwn = isOwnMessage(message);
    const showAvatar = !isOwn;

    return (
      <Transition
        key={message.id}
        mounted={mounted}
        transition="fade-up"
        duration={300}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box
            style={styles}
            mb="sm"
            onMouseEnter={() => setHoveredMessage(message.id)}
            onMouseLeave={() => setHoveredMessage(null)}
          >
            <Group
              align="flex-end"
              gap="xs"
              justify={isOwn ? "flex-end" : "flex-start"}
              wrap="nowrap"
            >
              {showAvatar && (
                <Avatar
                  src={message.sender?.avatar}
                  size="sm"
                  radius="xl"
                  style={{
                    border: "2px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {message.sender?.firstName?.[0]}
                </Avatar>
              )}

              <Stack gap={2} style={{ maxWidth: "70%", minWidth: "120px" }}>
                <Paper
                  p="sm"
                  radius="xl"
                  style={{
                    background: isOwn
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(255, 255, 255, 0.9)",
                    color: isOwn ? "white" : "var(--mantine-color-gray-8)",
                    border: isOwn ? "none" : "1px solid rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                    boxShadow: isOwn
                      ? "0 4px 16px rgba(102, 126, 234, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    transform:
                      hoveredMessage === message.id
                        ? "scale(1.02)"
                        : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {message.messageType === "text" && (
                    <Text
                      size="sm"
                      style={{ lineHeight: 1.4, wordBreak: "break-word" }}
                    >
                      {message.content}
                    </Text>
                  )}

                  {message.messageType === "image" && (
                    <Box>
                      <img
                        src={message.mediaUrl}
                        alt="Shared image"
                        style={{
                          maxWidth: "100%",
                          borderRadius: "8px",
                          marginBottom: message.content ? "8px" : 0,
                        }}
                      />
                      {message.content && (
                        <Text size="sm" style={{ lineHeight: 1.4 }}>
                          {message.content}
                        </Text>
                      )}
                    </Box>
                  )}

                  {renderReactions(message)}
                </Paper>

                <Group
                  gap={4}
                  justify={isOwn ? "flex-end" : "flex-start"}
                  style={{ opacity: hoveredMessage === message.id ? 1 : 0.6 }}
                >
                  <Text size="xs" c="dimmed">
                    {formatTime(message.createdAt)}
                  </Text>
                  {renderMessageStatus(message)}

                  {hoveredMessage === message.id && (
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      radius="xl"
                      onClick={() => {
                        // TODO: Add emoji reaction
                        console.log("Add reaction to message:", message.id);
                      }}
                    >
                      <IconMoodSmile size={12} />
                    </ActionIcon>
                  )}
                </Group>
              </Stack>
            </Group>
          </Box>
        )}
      </Transition>
    );
  };

  if (!data || allMessages.length === 0) {
    return (
      <Box p="md" style={{ height: "100%" }}>
        <Center style={{ height: "100%" }}>
          <Stack align="center" gap="sm">
            <Box
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconMoodSmile size={24} color="var(--mantine-color-indigo-5)" />
            </Box>
            <Text size="sm" c="dimmed" ta="center">
              Start a conversation by sending a message
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScrollArea
        ref={scrollRef}
        style={{ flex: 1 }}
        scrollbarSize={6}
        scrollHideDelay={1000}
      >
        <Box p="md">
          {/* Load more messages button */}
          {hasNextPage && (
            <Center mb="md">
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                radius="xl"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  "&:hover": {
                    background: "rgba(99, 102, 241, 0.2)",
                  },
                }}
              >
                <Text size="xs" fw={500}>
                  Load more
                </Text>
              </ActionIcon>
            </Center>
          )}

          {/* Messages */}
          <Stack gap="xs">
            {allMessages.map((message, index) => renderMessage(message, index))}
          </Stack>

          {/* Typing indicator */}
          <TypingIndicator conversationId={conversationId} />
        </Box>
      </ScrollArea>
    </Box>
  );
}
