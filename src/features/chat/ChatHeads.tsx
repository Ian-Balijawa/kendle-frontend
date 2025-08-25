import { ActionIcon, Avatar, Badge, Group, Paper, rem, Text, Transition } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useConversations } from "../../hooks/useChat";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";

export function ChatHeads() {
  const { user } = useAuthStore();
  const { data: conversations = [] } = useConversations();
  const { chatHeads, openChatWindow, removeChatHead } = useFloatingChatStore();

  // Get conversations that should show as heads
  const headConversations = conversations.filter(conv => chatHeads.includes(conv.id));

  if (headConversations.length === 0) {
    return null;
  }

  return (
    <>
      {headConversations.map((conversation, index) => {
        const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
        const unreadCount = conversation.unreadCount;

        return (
          <Transition
            key={conversation.id}
            mounted={true}
            transition="slide-right"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <Paper
                shadow="md"
                className="chat-head"
                style={{
                  ...styles,
                  position: "fixed",
                  bottom: rem(20 + index * 60),
                  right: rem(20),
                  zIndex: 1000 + index,
                  borderRadius: "50%",
                  overflow: "visible",
                }}
              >
                <Group gap={0} align="center">
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="lg"
                    radius="xl"
                    className={unreadCount > 0 ? "chat-head-new-message" : ""}
                    style={{
                      position: "relative",
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={() => openChatWindow(conversation.id)}
                  >
                    <Avatar
                      src={otherParticipant?.avatar}
                      alt={otherParticipant?.firstName || "User"}
                      size="sm"
                      radius="xl"
                    >
                      {(otherParticipant?.firstName || "U").charAt(0)}
                    </Avatar>

                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                      <Badge
                        size="xs"
                        color="red"
                        variant="filled"
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          minWidth: 18,
                          height: 18,
                          borderRadius: "50%",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </ActionIcon>

                  {/* Close button */}
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    radius="xl"
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      backgroundColor: "white",
                      border: "1px solid var(--mantine-color-gray-3)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChatHead(conversation.id);
                    }}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                </Group>

                {/* Tooltip on hover */}
                <Paper
                  shadow="sm"
                  p="xs"
                  style={{
                    position: "absolute",
                    right: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginRight: 8,
                    backgroundColor: "var(--mantine-color-gray-9)",
                    color: "white",
                    whiteSpace: "nowrap",
                    opacity: 0,
                    pointerEvents: "none",
                    transition: "opacity 0.2s ease",
                    zIndex: 1001,
                  }}
                  className="chat-head-tooltip"
                >
                  <Text size="xs" fw={500}>
                    {conversation.name ||
                      `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                  </Text>
                  {conversation.lastMessage && (
                    <Text size="xs" opacity={0.7} lineClamp={1}>
                      {conversation.lastMessage.content}
                    </Text>
                  )}
                </Paper>
              </Paper>
            )}
          </Transition>
        );
      })}
    </>
  );
}
