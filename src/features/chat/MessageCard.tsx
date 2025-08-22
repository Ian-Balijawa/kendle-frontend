import {
    ActionIcon,
    Avatar,
    Box,
    Button,
    Group,
    Image,
    Menu, Stack,
    Text,
    Textarea
} from "@mantine/core";
import {
    IconCheck,
    IconChecks,
    IconCopy,
    IconDotsVertical,
    IconEdit,
    IconMessageReply,
    IconMoodSmile,
    IconTrash,
    IconAlertCircle,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Message } from "../../types/chat";
import {
    useUpdateMessage,
    useDeleteMessage,
    useAddMessageReaction,
    useMarkMessageAsRead
} from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { UpdateMessageRequest } from "../../services/api";

interface MessageCardProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  previousMessage?: Message;
  nextMessage?: Message;
}

export function MessageCard({
  message,
  isOwn,
  showAvatar = false,
  previousMessage,
  nextMessage,
}: MessageCardProps) {
  const { user } = useAuthStore();

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
          console.error('Failed to update message:', error);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMessageMutation.mutate(message.id, {
      onError: (error) => {
        console.error('Failed to delete message:', error);
      },
    });
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    console.log("Reply to message:", message.id);
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
      case 'sending':
        return <IconCheck size={12} color="var(--mantine-color-gray-5)" />;
      case 'delivered':
        return <IconCheck size={12} color="var(--mantine-color-gray-6)" />;
      case 'read':
        return <IconChecks size={12} color="var(--mantine-color-blue-6)" />;
      case 'failed':
        return <IconAlertCircle size={12} color="var(--mantine-color-red-6)" />;
      default:
        return <IconCheck size={12} color="var(--mantine-color-gray-5)" />;
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

        <Box
          style={{
            maxWidth: "70%",
            backgroundColor: isOwn
              ? "var(--mantine-color-blue-6)"
              : "var(--mantine-color-gray-1)",
            borderRadius: "var(--mantine-radius-md)",
            padding: "var(--mantine-spacing-sm)",
          }}
        >
          <Stack gap="xs">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.currentTarget.value)}
              autosize
              minRows={1}
              maxRows={4}
              size="sm"
            />
            <Group gap="xs" justify="flex-end">
              <Button
                size="xs"
                variant="light"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={handleSaveEdit}
                loading={updateMessageMutation.isPending}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </Box>
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
            }}
          >
            <Text size="xs" c="dimmed">
              Replying to a message
            </Text>
          </Box>
        )}

        <Box
          style={{
            backgroundColor: isOwn
              ? "var(--mantine-color-blue-6)"
              : "var(--mantine-color-gray-1)",
            color: isOwn ? "white" : "var(--mantine-color-dark-7)",
            borderRadius: "var(--mantine-radius-md)",
            padding: "var(--mantine-spacing-sm)",
            position: "relative",
            borderTopLeftRadius: !isOwn && isGroupedWithPrevious ? 4 : undefined,
            borderTopRightRadius: isOwn && isGroupedWithPrevious ? 4 : undefined,
            borderBottomLeftRadius: !isOwn && isGroupedWithNext ? 4 : undefined,
            borderBottomRightRadius: isOwn && isGroupedWithNext ? 4 : undefined,
          }}
          onMouseEnter={(e) => {
            const menu = e.currentTarget.querySelector('.message-menu') as HTMLElement;
            if (menu) menu.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const menu = e.currentTarget.querySelector('.message-menu') as HTMLElement;
            if (menu) menu.style.opacity = '0';
          }}
        >
          {/* Message Content */}
          {message.messageType === "text" ? (
            <Text size="sm" style={{ lineHeight: 1.4, wordBreak: "break-word" }}>
              {message.content}
            </Text>
          ) : (
            <Box>
              {message.messageType === "image" && message.mediaUrl && (
                <Image
                  src={message.mediaUrl}
                  alt="Shared image"
                  radius="sm"
                  style={{ maxWidth: 200, maxHeight: 200 }}
                />
              )}
              {message.content && (
                <Text size="sm" mt="xs" style={{ lineHeight: 1.4 }}>
                  {message.content}
                </Text>
              )}
            </Box>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <Group gap="xs" mt="xs">
              {message.reactions.map((reaction) => (
                <Box
                  key={reaction.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "var(--mantine-radius-sm)",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {reaction.emoji}
                </Box>
              ))}
            </Group>
          )}

          {/* Message Menu */}
          <Box
            className="message-menu"
            style={{
              position: "absolute",
              top: -10,
              right: isOwn ? undefined : -10,
              left: isOwn ? -10 : undefined,
              opacity: 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <Group gap="xs">
              <ActionIcon
                size="sm"
                variant="filled"
                color="gray"
                onClick={() => setShowReactions(!showReactions)}
              >
                <IconMoodSmile size={12} />
              </ActionIcon>

              <Menu
                opened={showMenu}
                onChange={setShowMenu}
                position="bottom"
                shadow="md"
                width={150}
              >
                <Menu.Target>
                  <ActionIcon
                    size="sm"
                    variant="filled"
                    color="gray"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <IconDotsVertical size={12} />
                  </ActionIcon>
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
        </Box>

        {/* Reaction Picker */}
        {showReactions && (
          <Box
            mt="xs"
            p="xs"
            style={{
              backgroundColor: "white",
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-md)",
              boxShadow: "var(--mantine-shadow-sm)",
            }}
          >
            <Group gap="xs">
              {["❤️", "👍", "👎", "😂", "😮", "😢", "😡"].map((emoji) => (
                <ActionIcon
                  key={emoji}
                  variant="subtle"
                  onClick={() => handleReaction(emoji)}
                  loading={addReactionMutation.isPending}
                >
                  <Text>{emoji}</Text>
                </ActionIcon>
              ))}
            </Group>
          </Box>
        )}

        {/* Message Info */}
        {!isGroupedWithNext && (
          <Group
            gap="xs"
            justify={isOwn ? "flex-end" : "flex-start"}
            mt={4}
          >
            <Text size="xs" c="dimmed">
              {formatTime(message.createdAt)}
            </Text>

            {message.isEdited && (
              <Text size="xs" c="dimmed">
                (edited)
              </Text>
            )}

            {getStatusIcon()}
          </Group>
        )}
      </Box>
    </Group>
  );
}
