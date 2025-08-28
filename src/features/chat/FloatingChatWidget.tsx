import {
  ActionIcon,
  Avatar, Box,
  Group,
  Paper,
  Text,
  useMantineTheme,
  Tooltip,
  Transition
} from "@mantine/core";
import {
  IconX,
  IconMinus,
  IconMaximize,
  IconPhone,
  IconVideo
} from "@tabler/icons-react";
import { useState } from "react";
import { useFloatingChatStore } from "../../stores/chatStore";
import { Conversation } from "../../types/chat";
import { rem } from "@mantine/core";

interface FloatingChatWidgetProps {
  conversation: Conversation;
  onClose?: () => void;
}

export function FloatingChatWidget({
  conversation,
  onClose,
}: FloatingChatWidgetProps) {
  const theme = useMantineTheme();
  const { openChatWindow, closeChatWindow } = useFloatingChatStore();
  const [isHovered, setIsHovered] = useState(false);

  const otherParticipant = conversation?.participants?.find(
    (p) => p.id !== conversation?.participants?.[0]?.id
  );

  const handleOpenChat = () => {
    openChatWindow(conversation.id);
  };

  const handleClose = () => {
    closeChatWindow(conversation.id);
    onClose?.();
  };

  return (
    <Transition
      mounted={true}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          shadow="lg"
          radius="xl"
          p="md"
          style={{
            ...styles,
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 280,
            backgroundColor: theme.white,
            border: `1px solid ${theme.colors.gray[2]}`,
            cursor: "pointer",
            zIndex: 1000,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleOpenChat}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Box style={{ position: "relative" }}>
                <Avatar
                  src={otherParticipant?.avatar}
                  alt={otherParticipant?.firstName || "User"}
                  size="md"
                  radius="xl"
                  style={{
                    border: `2px solid ${theme.colors.gray[2]}`,
                  }}
                >
                  {(otherParticipant?.firstName || "U").charAt(0)}
                </Avatar>

                {/* Online Status Indicator */}
                {otherParticipant?.isOnline && (
                  <Box
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.green[5],
                      border: `2px solid ${theme.white}`,
                      boxShadow: `0 0 0 1px ${theme.colors.green[2]}`,
                    }}
                  />
                )}

                {/* Unread Count Badge */}
                {conversation?.unreadCount > 0 && (
                  <Box
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.red[5],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      boxShadow: theme.shadows.sm,
                    }}
                  >
                    <Text size="xs" c="white" fw={600}>
                      {conversation?.unreadCount > 99
                        ? "99+"
                        : conversation?.unreadCount}
                    </Text>
                  </Box>
                )}
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text
                  fw={600}
                  size="sm"
                  c={theme.colors.gray[8]}
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: rem(14),
                  }}
                >
                  {conversation?.name ||
                    `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                </Text>

                {conversation?.lastMessage && (
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: rem(12),
                    }}
                  >
                    {conversation?.lastMessage?.content?.substring(0, 40)}
                    {conversation?.lastMessage?.content?.length > 40 && "..."}
                  </Text>
                )}
              </Box>
            </Group>

            <Group gap="xs">
              {/* Quick Actions */}
              <Transition
                mounted={isHovered}
                transition="fade"
                duration={200}
              >
                {(styles) => (
                  <Group gap="xs" style={styles}>
                    <Tooltip label="Voice Call">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        radius="xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement voice call
                        }}
                        style={{
                          backgroundColor: theme.colors.green[1],
                          color: theme.colors.green[7],
                        }}
                      >
                        <IconPhone size={14} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Video Call">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        radius="xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement video call
                        }}
                        style={{
                          backgroundColor: theme.colors.blue[1],
                          color: theme.colors.blue[7],
                        }}
                      >
                        <IconVideo size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}
              </Transition>

              {/* Control Buttons */}
              <Group gap="xs">
                <Tooltip label="Minimize">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    radius="xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement minimize
                    }}
                    style={{
                      backgroundColor: theme.colors.gray[1],
                      color: theme.colors.gray[6],
                    }}
                  >
                    <IconMinus size={14} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Maximize">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    radius="xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat();
                    }}
                    style={{
                      backgroundColor: theme.colors.blue[1],
                      color: theme.colors.blue[7],
                    }}
                  >
                    <IconMaximize size={14} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Close">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    radius="xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    style={{
                      backgroundColor: theme.colors.red[1],
                      color: theme.colors.red[7],
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Group>

          {/* Progress Bar for Unread Messages */}
          {conversation?.unreadCount > 0 && (
            <Box
              mt="sm"
              style={{
                width: "100%",
                height: 3,
                backgroundColor: theme.colors.gray[2],
                borderRadius: theme.radius.xl,
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${Math.min((conversation?.unreadCount / 10) * 100, 100)}%`,
                  height: "100%",
                  backgroundColor: theme.colors.blue[5],
                  borderRadius: theme.radius.xl,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          )}
        </Paper>
      )}
    </Transition>
  );
}
