import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Image,
  Menu,
  Modal,
  Stack,
  Text,
  Textarea,
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
} from "@tabler/icons-react";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useInboxStore } from "../../stores/inboxStore";
import { Message } from "../../types/chat";

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
  const { updateMessage, deleteMessage } = useInboxStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const isGroupedWithPrevious =
    previousMessage &&
    previousMessage.senderId === message.senderId &&
    new Date(message.createdAt).getTime() -
      new Date(previousMessage.createdAt).getTime() <
      5 * 60 * 1000;

  const isGroupedWithNext =
    nextMessage &&
    nextMessage.senderId === message.senderId &&
    new Date(nextMessage.createdAt).getTime() -
      new Date(message.createdAt).getTime() <
      5 * 60 * 1000;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDetailedTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today at ${formatTime(dateString)}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return `Yesterday at ${formatTime(dateString)}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      updateMessage(message.id, {
        content: editContent.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage(message.id);
    }
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleReaction = (emoji: string) => {
    console.log("Add reaction:", emoji, "to message:", message.id);
    setShowReactions(false);
  };

  const getDeliveryIcon = () => {
    if (!isOwn) return null;

    if (message.isRead) {
      return <IconChecks size={12} color="var(--mantine-color-blue-6)" />;
    } else if (message.isDelivered) {
      return <IconChecks size={12} color="var(--mantine-color-gray-6)" />;
    } else {
      return <IconCheck size={12} color="var(--mantine-color-gray-6)" />;
    }
  };

  const messageTimestamp = (
    <Text
      size="xs"
      c="dimmed"
      style={{ marginTop: 2 }}
      title={formatDetailedTime(message.createdAt)}
    >
      {formatTime(message.createdAt)}
      {message.isEdited && " (edited)"}
    </Text>
  );

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  return (
    <Box
      style={{
        marginBottom: isGroupedWithNext ? 2 : 8,
        marginTop: isGroupedWithPrevious ? 2 : 8,
      }}
    >
      <Group
        justify={isOwn ? "flex-end" : "flex-start"}
        align="flex-start"
        gap="sm"
        wrap="nowrap"
      >
        {!isOwn && showAvatar && !isGroupedWithNext && (
          <Avatar size="sm" radius="xl">
            {message.senderId}
          </Avatar>
        )}

        {!isOwn && (!showAvatar || isGroupedWithNext) && (
          <Box style={{ width: 32 }} />
        )}

        <Box
          style={{
            maxWidth: "70%",
            minWidth: 120,
          }}
        >
          {message.replyToMessage && (
            <Box
              mb="xs"
              p="xs"
              style={{
                backgroundColor: "var(--mantine-color-gray-1)",
                borderRadius: "var(--mantine-radius-sm)",
                borderLeft: `3px solid ${
                  isOwn
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-4)"
                }`,
              }}
            >
              <Text size="xs" c="dimmed" fw={500}>
                Replying to {message.replyToMessage.senderId}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {message.replyToMessage.content}
              </Text>
            </Box>
          )}

          <Box
            style={{
              position: "relative",
              backgroundColor: isOwn
                ? "var(--mantine-color-blue-6)"
                : "var(--mantine-color-gray-2)",
              color: isOwn ? "white" : "inherit",
              padding: "8px 12px",
              borderRadius: "var(--mantine-radius-md)",
              borderTopLeftRadius:
                !isOwn && isGroupedWithPrevious ? 4 : undefined,
              borderTopRightRadius:
                isOwn && isGroupedWithPrevious ? 4 : undefined,
              borderBottomLeftRadius:
                !isOwn && isGroupedWithNext ? 4 : undefined,
              borderBottomRightRadius:
                isOwn && isGroupedWithNext ? 4 : undefined,
              wordBreak: "break-word",
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowMenu(true);
            }}
          >
            {isEditing ? (
              <Stack gap="xs">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.currentTarget.value)}
                  autosize
                  minRows={1}
                  maxRows={4}
                  size="sm"
                  styles={{
                    input: {
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: isOwn ? "white" : "inherit",
                    },
                  }}
                />
                <Group gap="xs" justify="flex-end">
                  <Button
                    size="xs"
                    variant="subtle"
                    color={isOwn ? "white" : "gray"}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    variant={isOwn ? "white" : "filled"}
                    onClick={handleSaveEdit}
                  >
                    Save
                  </Button>
                </Group>
              </Stack>
            ) : (
              <>
                {message.messageType === "image" && message.mediaUrl && (
                  <Box mb="xs">
                    <Image
                      src={message.mediaUrl}
                      alt="Shared image"
                      style={{
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: "var(--mantine-radius-sm)",
                      }}
                    />
                  </Box>
                )}

                <Text size="sm" style={{ lineHeight: 1.4 }}>
                  {message.content}
                </Text>

                {message.reactions.length > 0 && (
                  <Group gap={4} mt="xs">
                    {message.reactions.map((reaction) => (
                      <Box
                        key={reaction.id}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          padding: "2px 6px",
                          fontSize: "12px",
                        }}
                      >
                        {reaction.emoji}
                      </Box>
                    ))}
                  </Group>
                )}

                <Menu
                  opened={showMenu}
                  onClose={() => setShowMenu(false)}
                  shadow="md"
                  width={180}
                  position={isOwn ? "left-start" : "right-start"}
                >
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      size="xs"
                      style={{
                        position: "absolute",
                        top: -8,
                        [isOwn ? "left" : "right"]: -8,
                        opacity: showMenu ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        backgroundColor: "var(--mantine-color-gray-6)",
                        color: "white",
                      }}
                    >
                      <IconDotsVertical size={12} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconMessageReply size={14} />}
                      onClick={() => {
                        setShowMenu(false);
                      }}
                    >
                      Reply
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconMoodSmile size={14} />}
                      onClick={() => {
                        setShowReactions(true);
                        setShowMenu(false);
                      }}
                    >
                      React
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconCopy size={14} />}
                      onClick={handleCopy}
                    >
                      Copy Text
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
              </>
            )}
          </Box>

          {!isGroupedWithNext && (
            <Group justify={isOwn ? "flex-end" : "flex-start"} gap="xs" mt={4}>
              {messageTimestamp}
              {getDeliveryIcon()}
            </Group>
          )}
        </Box>
      </Group>

      <Modal
        opened={showReactions}
        onClose={() => setShowReactions(false)}
        title="React to message"
        size="sm"
      >
        <Group gap="md" justify="center">
          {reactionEmojis.map((emoji) => (
            <ActionIcon
              key={emoji}
              size="xl"
              variant="subtle"
              onClick={() => handleReaction(emoji)}
              style={{ fontSize: "24px" }}
            >
              {emoji}
            </ActionIcon>
          ))}
        </Group>
      </Modal>
    </Box>
  );
}
