import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Image,
  Menu,
  Paper,
  rem,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconChecks,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconMessageReply,
  IconMoodSmile,
  IconTrash,
  IconClock,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useAddMessageReaction,
  useDeleteMessage,
  useMarkMessageAsRead,
  useUpdateMessage,
} from "../../hooks/useChat";
import { UpdateMessageRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Message } from "../../types/chat";

interface MessageCardProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  previousMessage?: Message;
  nextMessage?: Message;
  onReply?: (message: Message) => void;
}

export function MessageCard({
  message,
  isOwn,
  showAvatar = false,
  previousMessage,
  nextMessage,
  onReply,
}: MessageCardProps) {
  const { user } = useAuthStore();
  const theme = useMantineTheme();

  // React Query mutations
  const updateMessageMutation = useUpdateMessage();
  const deleteMessageMutation = useDeleteMessage();
  const addReactionMutation = useAddMessageReaction();
  const markAsReadMutation = useMarkMessageAsRead();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const isGroupedWithPrevious =
    previousMessage &&
    previousMessage.senderId === message.senderId &&
    new Date(message.createdAt).getTime() -
      new Date(previousMessage.createdAt).getTime() <
      5 * 60 * 1000; // 5 minutes

  const isGroupedWithNext =
    nextMessage &&
    nextMessage.senderId === message.senderId &&
    new Date(nextMessage.createdAt).getTime() -
      new Date(message.createdAt).getTime() <
      5 * 60 * 1000; // 5 minutes

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    const updateData: UpdateMessageRequest = {
      content: editContent.trim(),
    };

    updateMessageMutation.mutate(
      { id: message.id, data: updateData },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (error) => {
          console.error("Failed to update message:", error);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMessageMutation.mutate(message.id, {
      onError: (error) => {
        console.error("Failed to delete message:", error);
      },
    });
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    setShowMenu(false);
  };

  const handleReaction = (emoji: string) => {
    addReactionMutation.mutate({
      id: message.id,
      data: { emoji, messageId: message.id },
    });
    setShowReactions(false);
  };

  const handleMarkAsRead = () => {
    if (!message.isRead && !isOwn) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Auto-mark as read when message comes into view
  useEffect(() => {
    if (!message.isRead && !isOwn) {
      const timer = setTimeout(() => {
        handleMarkAsRead();
      }, 1000);

      return () => clearTimeout(timer);
    }
  });

  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case "sending":
        return <IconClock size={12} color={theme.colors.gray[5]} />;
      case "delivered":
        return <IconCheck size={12} color={theme.colors.gray[6]} />;
      case "read":
        return <IconChecks size={12} color={theme.colors.blue[6]} />;
      case "failed":
        return <IconAlertCircle size={12} color={theme.colors.red[6]} />;
      default:
        return <IconClock size={12} color={theme.colors.gray[5]} />;
    }
  };

  if (isEditing) {
    return (
      <Group
        justify={isOwn ? "flex-end" : "flex-start"}
        align="flex-start"
        gap="sm"
        style={{ width: "100%" }}
      >
        {!isOwn && showAvatar && !isGroupedWithPrevious && (
          <Avatar size="sm" radius="xl">
            {(user?.firstName || "U").charAt(0)}
          </Avatar>
        )}

        <Paper
          shadow="sm"
          style={{
            maxWidth: "70%",
            backgroundColor: isOwn
              ? theme.colors.blue[6]
              : theme.colors.gray[1],
            borderRadius: theme.radius.lg,
            padding: theme.spacing.sm,
            border: isOwn
              ? `1px solid ${theme.colors.blue[5]}`
              : `1px solid ${theme.colors.gray[3]}`,
          }}
        >
          <Stack gap="sm">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.currentTarget.value)}
              autosize
              minRows={1}
              maxRows={4}
              size="sm"
              radius="md"
              styles={{
                input: {
                  backgroundColor: isOwn
                    ? "rgba(255,255,255,0.1)"
                    : theme.white,
                  color: isOwn ? theme.white : theme.colors.dark[7],
                  border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : theme.colors.gray[3]}`,
                  fontSize: rem(14),
                },
              }}
            />
            <Group gap="xs" justify="flex-end">
              <Button
                size="xs"
                variant="subtle"
                radius="xl"
                onClick={() => setIsEditing(false)}
                styles={{
                  root: {
                    color: isOwn ? theme.white : theme.colors.gray[7],
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                radius="xl"
                onClick={handleSaveEdit}
                loading={updateMessageMutation.isPending}
                styles={{
                  root: {
                    backgroundColor: isOwn
                      ? "rgba(255,255,255,0.2)"
                      : theme.colors.blue[6],
                    color: isOwn ? theme.white : theme.white,
                  },
                }}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Group>
    );
  }

  return (
    <Group
      justify={isOwn ? "flex-end" : "flex-start"}
      align="flex-start"
      gap="sm"
      style={{ width: "100%" }}
    >
      {!isOwn && showAvatar && !isGroupedWithPrevious && (
        <Avatar size="sm" radius="xl">
          {(user?.firstName || "U").charAt(0)}
        </Avatar>
      )}

      {!isOwn && (!showAvatar || isGroupedWithPrevious) && (
        <Box style={{ width: 32 }} /> // Spacer for alignment
      )}

      <Box style={{ maxWidth: "70%" }}>
        {/* Reply Reference */}
        {message.replyToId && (
          <Box
            mb="xs"
            p="xs"
            style={{
              backgroundColor: "var(--mantine-color-gray-0)",
              borderLeft: "3px solid var(--mantine-color-blue-6)",
              borderRadius: "var(--mantine-radius-sm)",
              cursor: "pointer",
            }}
            onClick={() => {
              // TODO: Scroll to replied message
              console.log("Scroll to message:", message.replyToId);
            }}
          >
            <Text size="xs" c="dimmed">
              Replying to a message
            </Text>
          </Box>
        )}

        <Paper
          shadow={isOwn ? "sm" : "xs"}
          style={{
            backgroundColor: isOwn
              ? theme.colors.blue[6]
              : theme.colors.gray[1],
            color: isOwn ? theme.white : theme.colors.dark[7],
            borderRadius: theme.radius.lg,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            position: "relative",
            maxWidth: "85%",
            wordWrap: "break-word",
            border: isOwn
              ? `1px solid ${theme.colors.blue[5]}`
              : `1px solid ${theme.colors.gray[3]}`,
            borderTopLeftRadius:
              !isOwn && isGroupedWithPrevious ? theme.radius.sm : undefined,
            borderTopRightRadius:
              isOwn && isGroupedWithPrevious ? theme.radius.sm : undefined,
            borderBottomLeftRadius:
              !isOwn && isGroupedWithNext ? theme.radius.sm : undefined,
            borderBottomRightRadius:
              isOwn && isGroupedWithNext ? theme.radius.sm : undefined,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const menu = e.currentTarget.querySelector(
              ".message-menu"
            ) as HTMLElement;
            if (menu) menu.style.opacity = "1";
            if (!isOwn) {
              e.currentTarget.style.backgroundColor = theme.colors.gray[2];
            }
          }}
          onMouseLeave={(e) => {
            const menu = e.currentTarget.querySelector(
              ".message-menu"
            ) as HTMLElement;
            if (menu) menu.style.opacity = "0";
            if (!isOwn) {
              e.currentTarget.style.backgroundColor = theme.colors.gray[1];
            }
          }}
        >
          {/* Message Content */}
          {message.messageType === "text" ? (
            <Text
              size="sm"
              style={{
                lineHeight: 1.5,
                wordBreak: "break-word",
                fontSize: rem(14),
              }}
            >
              {message.content}
            </Text>
          ) : (
            <Box>
              {message.messageType === "image" && message.mediaUrl && (
                <Image
                  src={message.mediaUrl}
                  alt="Shared image"
                  radius="md"
                  style={{
                    maxWidth: 250,
                    maxHeight: 250,
                    border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : theme.colors.gray[3]}`,
                  }}
                />
              )}
              {message.content && (
                <Text
                  size="sm"
                  mt="xs"
                  style={{
                    lineHeight: 1.5,
                    fontSize: rem(14),
                  }}
                >
                  {message.content}
                </Text>
              )}
            </Box>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <Group gap="xs" mt="sm">
              {message.reactions.map((reaction) => (
                <Paper
                  key={reaction.id}
                  p="xs"
                  radius="xl"
                  style={{
                    backgroundColor: isOwn
                      ? "rgba(255, 255, 255, 0.2)"
                      : theme.colors.gray[2],
                    border: isOwn
                      ? "1px solid rgba(255, 255, 255, 0.3)"
                      : `1px solid ${theme.colors.gray[3]}`,
                    fontSize: rem(12),
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.backgroundColor = isOwn
                      ? "rgba(255, 255, 255, 0.3)"
                      : theme.colors.gray[3];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = isOwn
                      ? "rgba(255, 255, 255, 0.2)"
                      : theme.colors.gray[2];
                  }}
                >
                  {reaction.emoji}
                </Paper>
              ))}
            </Group>
          )}

          {/* Message Menu */}
          <Box
            className="message-menu"
            style={{
              position: "absolute",
              top: -12,
              right: isOwn ? undefined : -12,
              left: isOwn ? -12 : undefined,
              opacity: 0,
              transition: "all 0.2s ease",
              zIndex: 10,
            }}
          >
            <Group gap="xs">
              <Tooltip label="Add reaction">
                <ActionIcon
                  size="sm"
                  radius="xl"
                  variant="filled"
                  color="gray"
                  onClick={() => setShowReactions(!showReactions)}
                  style={{
                    boxShadow: theme.shadows.sm,
                    backgroundColor: theme.white,
                    color: theme.colors.gray[6],
                    border: `1px solid ${theme.colors.gray[3]}`,
                  }}
                >
                  <IconMoodSmile size={12} />
                </ActionIcon>
              </Tooltip>

              <Menu
                opened={showMenu}
                onChange={setShowMenu}
                position="bottom"
                shadow="md"
                width={160}
                radius="lg"
              >
                <Menu.Target>
                  <Tooltip label="More options">
                    <ActionIcon
                      size="sm"
                      radius="xl"
                      variant="filled"
                      color="gray"
                      onClick={() => setShowMenu(!showMenu)}
                      style={{
                        boxShadow: theme.shadows.sm,
                        backgroundColor: theme.white,
                        color: theme.colors.gray[6],
                        border: `1px solid ${theme.colors.gray[3]}`,
                      }}
                    >
                      <IconDotsVertical size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconMessageReply size={14} />}
                    onClick={handleReply}
                  >
                    Reply
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconCopy size={14} />}
                    onClick={handleCopy}
                  >
                    Copy
                  </Menu.Item>

                  {isOwn && (
                    <>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={handleEdit}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={handleDelete}
                      >
                        Delete
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Box>
        </Paper>

        {/* Reaction Picker */}
        {showReactions && (
          <Paper
            mt="xs"
            p="sm"
            radius="lg"
            shadow="md"
            style={{
              backgroundColor: theme.white,
              border: `1px solid ${theme.colors.gray[3]}`,
              position: "absolute",
              bottom: "100%",
              left: isOwn ? "auto" : 0,
              right: isOwn ? 0 : "auto",
              zIndex: 1000,
              marginBottom: theme.spacing.xs,
            }}
          >
            <Group gap="xs">
              {["❤️", "👍", "👎", "😂", "😮", "😢", "😡", "🎉", "🔥", "💯"].map((emoji) => (
                <Tooltip key={emoji} label={emoji}>
                  <ActionIcon
                    variant="subtle"
                    radius="xl"
                    size="md"
                    onClick={() => handleReaction(emoji)}
                    loading={addReactionMutation.isPending}
                    style={{
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                      e.currentTarget.style.backgroundColor =
                        theme.colors.gray[1];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Text size="lg">{emoji}</Text>
                  </ActionIcon>
                </Tooltip>
              ))}
            </Group>
          </Paper>
        )}

        {/* Message Info */}
        {!isGroupedWithNext && (
          <Group gap="xs" justify={isOwn ? "flex-end" : "flex-start"} mt={6}>
            <Text
              size="xs"
              c="dimmed"
              style={{
                fontSize: rem(11),
                opacity: 0.8,
              }}
            >
              {formatTime(message.createdAt)}
            </Text>

            {message.isEdited && (
              <Text
                size="xs"
                c="dimmed"
                style={{
                  fontSize: rem(10),
                  opacity: 0.6,
                  fontStyle: "italic",
                }}
              >
                edited
              </Text>
            )}

            {getStatusIcon()}
          </Group>
        )}
      </Box>
    </Group>
  );
}
