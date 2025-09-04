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
} from "@mantine/core";
import {
  useInfiniteMessages,
  useMarkConversationAsRead,
  useAddMessageReaction,
} from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";
import { Message } from "../../types";
import { TypingIndicator } from "./TypingIndicator";
import { MessageContextMenu } from "./MessageContextMenu";

interface ChatMessagesProps {
  conversationId: string;
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMessages(conversationId);
  const markAsRead = useMarkConversationAsRead();
  const addReaction = useAddMessageReaction();
  const { joinConversation, leaveConversation } = useWebSocketIntegration();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  // Mark conversation as read when messages are viewed
  useEffect(() => {
    if (data && data.pages.length > 0) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId, data]);

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
              style={{ cursor: "pointer" }}
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

  const handleReact = (message: Message, emoji: string) => {
    addReaction.mutate({
      id: message.id,
      data: { emoji, messageId: message.id },
    });
  };

  const renderMessage = (message: Message, index: number) => {
    const prevMessage = allMessages[index + 1];
    const showAvatar =
      !prevMessage || prevMessage.senderId !== message.senderId;
    const showTimestamp =
      !prevMessage ||
      new Date(message.createdAt).getTime() -
        new Date(prevMessage.createdAt).getTime() >
        5 * 60 * 1000; // 5 minutes

    return (
      <Box
        key={message.id}
        style={{
          display: "flex",
          justifyContent: isOwnMessage(message) ? "flex-end" : "flex-start",
          marginBottom: showTimestamp ? 16 : 4,
        }}
        onMouseEnter={() => setHoveredMessage(message.id)}
        onMouseLeave={() => setHoveredMessage(null)}
      >
        <Group
          gap="xs"
          style={{
            maxWidth: "70%",
            alignItems: "flex-end",
          }}
        >
          {/* Avatar for other user's messages */}
          {!isOwnMessage(message) && showAvatar && (
            <Avatar
              size="sm"
              src={message.sender?.avatar}
              alt={message.sender?.firstName}
            >
              {message.sender?.firstName?.charAt(0) || "U"}
            </Avatar>
          )}

          {/* Message content */}
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Box
              style={{
                backgroundColor: isOwnMessage(message)
                  ? "var(--mantine-color-primary-6)"
                  : "var(--mantine-color-gray-2)",
                color: isOwnMessage(message) ? "white" : "inherit",
                padding: "8px 12px",
                borderRadius: 16,
                maxWidth: "100%",
                wordBreak: "break-word",
                position: "relative",
                cursor: "pointer",
              }}
            >
              <Text size="sm" style={{ lineHeight: 1.4 }}>
                {message.content}
              </Text>

              {/* Message reactions */}
              {renderReactions(message)}

              {/* Context menu on hover */}
              {hoveredMessage === message.id && (
                <Box
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: "white",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <MessageContextMenu message={message} onReact={handleReact} />
                </Box>
              )}
            </Box>

            {/* Message status and timestamp */}
            <Group
              gap={4}
              justify={isOwnMessage(message) ? "flex-end" : "flex-start"}
            >
              {isOwnMessage(message) && (
                <Text size="xs" c="dimmed">
                  {message.status === "sending" && "⏳"}
                  {message.status === "delivered" && "✓"}
                  {message.status === "read" && "✓✓"}
                  {message.status === "failed" && "❌"}
                </Text>
              )}

              {showTimestamp && (
                <Text size="xs" c="dimmed">
                  {formatTime(message.createdAt)}
                </Text>
              )}
            </Group>
          </Stack>

          {/* Avatar for own messages */}
          {isOwnMessage(message) && showAvatar && (
            <Avatar size="sm" src={user?.avatar} alt={user?.firstName}>
              {user?.firstName?.charAt(0) || "U"}
            </Avatar>
          )}
        </Group>
      </Box>
    );
  };

  return (
    <ScrollArea
      ref={scrollRef}
      h="100%"
      scrollbarSize={4}
      style={{
        padding: "12px",
      }}
    >
      <Stack gap={0}>
        {/* Load more button */}
        {hasNextPage && (
          <Box
            style={{
              textAlign: "center",
              padding: "8px",
              cursor: "pointer",
            }}
            onClick={() => fetchNextPage()}
          >
            <Text size="xs" c="dimmed">
              {isFetchingNextPage ? "Loading..." : "Load more messages"}
            </Text>
          </Box>
        )}

        {/* Messages */}
        {allMessages.length === 0 ? (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--mantine-color-gray-6)",
            }}
          >
            <Text size="sm">No messages yet. Start a conversation!</Text>
          </Box>
        ) : (
          allMessages.map((message, index) => renderMessage(message, index))
        )}

        {/* Typing indicator */}
        <TypingIndicator conversationId={conversationId} />
      </Stack>
    </ScrollArea>
  );
}
