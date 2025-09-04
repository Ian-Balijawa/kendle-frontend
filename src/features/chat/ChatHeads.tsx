import { useState } from "react";
import { Box, Avatar, Badge, Tooltip, Transition, Stack } from "@mantine/core";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useConversations } from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { Conversation } from "../../types";

export function ChatHeads() {
  const { chatHeads, openChatWindow, removeChatHead } = useFloatingChatStore();
  const { data: conversations } = useConversations();
  const { user } = useAuthStore();
  const [hoveredHead, setHoveredHead] = useState<string | null>(null);

  // Get conversation data for chat heads
  const getConversationData = (
    conversationId: string,
  ): Conversation | undefined => {
    return conversations?.find((conv) => conv.id === conversationId);
  };

  if (chatHeads.length === 0) {
    return null;
  }

  return (
    <Stack
      gap="xs"
      style={{
        pointerEvents: "auto",
        marginBottom: 10,
      }}
    >
      {chatHeads.map((conversationId, index) => {
        const conversation = getConversationData(conversationId);
        if (!conversation) return null;

        const participant = conversation.participants.find(
          (p) => p.id !== user?.id,
        );
        const isOnline = participant?.isOnline || false;
        const unreadCount = conversation.unreadCount || 0;

        return (
          <Transition
            key={conversationId}
            mounted={true}
            transition="scale"
            duration={200}
            timingFunction="ease"
          >
            {(styles) => (
              <Box style={styles}>
                <Tooltip
                  label={conversation.name || participant?.firstName || "Chat"}
                  position="left"
                  withArrow
                >
                  <Box
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      transform: `translateX(${index * 10}px)`,
                    }}
                    onMouseEnter={() => setHoveredHead(conversationId)}
                    onMouseLeave={() => setHoveredHead(null)}
                    onClick={() => openChatWindow(conversationId)}
                  >
                    <Avatar
                      size="lg"
                      src={conversation.avatar || participant?.avatar}
                      alt={conversation.name || participant?.firstName}
                      style={{
                        border: "3px solid var(--mantine-color-white)",
                        boxShadow: "0 2px 8px var(--mantine-color-shadow)",
                        transition: "all 0.2s ease",
                        transform:
                          hoveredHead === conversationId
                            ? "scale(1.1)"
                            : "scale(1)",
                      }}
                    >
                      {participant?.firstName?.charAt(0) || "U"}
                    </Avatar>

                    {/* Online indicator */}
                    {isOnline && (
                      <Box
                        style={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "var(--mantine-color-green-5)",
                          border: "2px solid var(--mantine-color-white)",
                        }}
                      />
                    )}

                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                      <Badge
                        size="xs"
                        variant="filled"
                        color="red"
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}

                    {/* Close button on hover */}
                    <Transition
                      mounted={hoveredHead === conversationId}
                      transition="fade"
                      duration={150}
                    >
                      {(tooltipStyles) => (
                        <Box
                          style={{
                            ...tooltipStyles,
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "var(--mantine-color-red-5)",
                            color: "var(--mantine-color-white)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            cursor: "pointer",
                            border: "2px solid var(--mantine-color-white)",
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChatHead(conversationId);
                          }}
                        >
                          ×
                        </Box>
                      )}
                    </Transition>
                  </Box>
                </Tooltip>
              </Box>
            )}
          </Transition>
        );
      })}
    </Stack>
  );
}
