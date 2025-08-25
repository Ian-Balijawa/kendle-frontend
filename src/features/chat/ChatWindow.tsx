import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Menu,
  Paper,
  rem,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDotsVertical,
  IconFile,
  IconMoodSmile,
  IconPaperclip,
  IconPhone,
  IconPhoto,
  IconSend,
  IconVideo,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import {
  useInfiniteMessages,
  useMarkConversationAsRead,
  useSendMessage,
  useUpdateConversation,
} from "../../hooks/useChat";
import { SendMessageRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Conversation } from "../../types/chat";
import { MessageCard } from "./MessageCard";

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatWindow({
  conversation,
  onBack,
  showBackButton = false,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const theme = useMantineTheme();

  // React Query hooks
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading,
  } = useInfiniteMessages(conversation.id, { limit: 20 });

  const sendMessageMutation = useSendMessage();
  const markConversationAsReadMutation = useMarkConversationAsRead();
  const updateConversationMutation = useUpdateConversation();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  // Flatten messages from all pages
  const messages = messagesData?.pages.flatMap((page) => page) || [];

  // Get the other participant for direct conversations
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== user?.id
  );

console.log("conversation.participants", conversation)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      markConversationAsReadMutation.mutate(conversation.id);
    }
  }, [
    conversation.id,
    conversation.unreadCount,
    markConversationAsReadMutation,
  ]);

  // Handle typing indicators
  useEffect(() => {
    if (messageText.trim() && !isTyping) {
      setIsTyping(true);
      // TODO: Send typing indicator via WebSocket
    } else if (!messageText.trim() && isTyping) {
      setIsTyping(false);
      // TODO: Stop typing indicator via WebSocket
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (messageText.trim()) {
      typingTimeoutRef.current = window.setTimeout(() => {
        setIsTyping(false);
        // TODO: Stop typing indicator via WebSocket
      }, 2000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, isTyping]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !otherParticipant) return;

    const messageData: SendMessageRequest = {
      content: messageText.trim(),
      receiverId: otherParticipant.id,
      conversationId: conversation.id,
      messageType: "text",
    };

    sendMessageMutation.mutate(
      { conversationId: conversation.id, data: messageData },
      {
        onSuccess: () => {
          setMessageText("");
          setIsTyping(false);

          // Focus back on input
          messageInputRef.current?.focus();
        },
        onError: (error) => {
          console.error("Failed to send message:", error);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadMoreMessages = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleTogglePin = () => {
    updateConversationMutation.mutate({
      id: conversation.id,
      data: { isPinned: !conversation.isPinned },
    });
  };

  const handleToggleMute = () => {
    updateConversationMutation.mutate({
      id: conversation.id,
      data: { isMuted: !conversation.isMuted },
    });
  };

  const handleToggleArchive = () => {
    updateConversationMutation.mutate({
      id: conversation.id,
      data: { isArchived: !conversation.isArchived },
    });
  };

  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.gray[0],
      }}
    >
      {/* Chat Header */}
      <Paper
        p="md"
        shadow="sm"
        style={{
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          backgroundColor: theme.white,
        }}
      >
        <Group justify="space-between">
          <Group>
            {showBackButton && (
              <ActionIcon
                variant="subtle"
                onClick={onBack}
                radius="xl"
                size="lg"
                style={{
                  backgroundColor: theme.colors.gray[1],
                  color: theme.colors.gray[7],
                }}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
            )}

            <Group gap="sm">
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

              <Box>
                <Text fw={600} size="sm" c={theme.colors.gray[8]}>
                  {conversation.name ||
                    (otherParticipant
                      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                      : "Unknown User")}
                </Text>
                <Group gap={4}>
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.green[5],
                    }}
                  />
                  <Text size="xs" c="dimmed">
                    {otherParticipant
                      ? `@${otherParticipant.username || otherParticipant.phoneNumber}`
                      : ""}
                  </Text>
                </Group>
              </Box>
            </Group>
          </Group>

          <Group>
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="lg"
              style={{
                backgroundColor: theme.colors.green[1],
                color: theme.colors.green[7],
              }}
            >
              <IconPhone size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="lg"
              style={{
                backgroundColor: theme.colors.blue[1],
                color: theme.colors.blue[7],
              }}
            >
              <IconVideo size={18} />
            </ActionIcon>

            <Menu shadow="md" width={200} position="bottom-end" radius="lg">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  radius="xl"
                  size="lg"
                  style={{
                    backgroundColor: theme.colors.gray[1],
                    color: theme.colors.gray[6],
                  }}
                >
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={handleTogglePin}
                  leftSection={<IconDotsVertical size={14} />}
                >
                  {conversation.isPinned ? "Unpin" : "Pin"} Conversation
                </Menu.Item>
                <Menu.Item
                  onClick={handleToggleMute}
                  leftSection={<IconDotsVertical size={14} />}
                >
                  {conversation.isMuted ? "Unmute" : "Mute"} Conversation
                </Menu.Item>
                <Menu.Item
                  onClick={handleToggleArchive}
                  leftSection={<IconDotsVertical size={14} />}
                >
                  {conversation.isArchived ? "Unarchive" : "Archive"}{" "}
                  Conversation
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconDotsVertical size={14} />}
                >
                  Delete Conversation
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>

      {/* Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        style={{ flex: 1 }}
        scrollbarSize={4}
        offsetScrollbars
        styles={{
          viewport: {
            backgroundColor: theme.colors.gray[0],
          },
        }}
      >
        <Stack gap="xs" p="md" style={{ minHeight: "100%" }}>
          {/* Load more messages button */}
          {hasNextPage && (
            <Center pb="md">
              <Button
                variant="subtle"
                size="xs"
                radius="xl"
                onClick={handleLoadMoreMessages}
                loading={isFetchingNextPage}
                styles={{
                  root: {
                    backgroundColor: theme.colors.gray[1],
                    color: theme.colors.gray[7],
                  },
                }}
              >
                {isFetchingNextPage ? "Loading..." : "Load older messages"}
              </Button>
            </Center>
          )}

          {messagesLoading && messages.length === 0 ? (
            <Center py="xl" style={{ height: "100%" }}>
              <Stack align="center" gap="lg">
                <Loader size="lg" color="blue" />
                <Text c="dimmed" fw={500}>
                  Loading messages...
                </Text>
              </Stack>
            </Center>
          ) : messages.length === 0 ? (
            <Center py="xl" style={{ height: "100%" }}>
              <Stack align="center" gap="lg" style={{ maxWidth: 300 }}>
                <Paper
                  p="xl"
                  radius="xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.blue[1]} 0%, ${theme.colors.cyan[1]} 100%)`,
                  }}
                >
                  <Avatar size="lg" color="blue" radius="xl">
                    {(otherParticipant?.firstName || "U").charAt(0)}
                  </Avatar>
                </Paper>
                <div style={{ textAlign: "center" }}>
                  <Text size="lg" fw={600} c={theme.colors.gray[8]} mb={8}>
                    Start the conversation
                  </Text>
                  <Text size="sm" c="dimmed" mb="lg">
                    Send a message to{" "}
                    {otherParticipant?.firstName || "this user"} to get started
                  </Text>
                </div>
                <Button
                  variant="filled"
                  color="blue"
                  radius="xl"
                  size="md"
                  onClick={() => messageInputRef.current?.focus()}
                  style={{
                    boxShadow: theme.shadows.md,
                  }}
                >
                  Send First Message
                </Button>
              </Stack>
            </Center>
          ) : (
            messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const nextMessage = messages[index + 1];
              return (
                <MessageCard
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user?.id}
                  showAvatar={message.senderId !== user?.id}
                  previousMessage={previousMessage}
                  nextMessage={nextMessage}
                />
              );
            })
          )}

          {/* Typing Indicators */}
          {isTyping && (
            <Group gap="sm" align="center" p="sm">
              <Avatar size="sm" radius="xl">
                {(otherParticipant?.firstName || "U").charAt(0)}
              </Avatar>
              <Paper
                p="xs"
                radius="lg"
                style={{
                  backgroundColor: theme.colors.gray[2],
                }}
              >
                <Text size="xs" c="dimmed" fw={500}>
                  {otherParticipant?.firstName || "User"} is typing...
                </Text>
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      {/* Message Input */}
      <Paper
        p="md"
        shadow="sm"
        style={{
          borderTop: `1px solid ${theme.colors.gray[2]}`,
          backgroundColor: theme.white,
        }}
      >
        <Group gap="xs" align="flex-end">
          {/* Attachment Menu */}
          <Menu
            opened={showAttachmentMenu}
            onChange={setShowAttachmentMenu}
            position="top-start"
            shadow="md"
            radius="lg"
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                style={{
                  backgroundColor: theme.colors.gray[1],
                  color: theme.colors.gray[6],
                }}
              >
                <IconPaperclip size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPhoto size={16} />}
                onClick={() => setShowAttachmentMenu(false)}
              >
                Photo
              </Menu.Item>
              <Menu.Item
                leftSection={<IconVideo size={16} />}
                onClick={() => setShowAttachmentMenu(false)}
              >
                Video
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFile size={16} />}
                onClick={() => setShowAttachmentMenu(false)}
              >
                File
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Message Input */}
          <Textarea
            ref={messageInputRef}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
            autosize
            minRows={1}
            maxRows={4}
            radius="xl"
            styles={{
              input: {
                border: `2px solid ${theme.colors.gray[2]}`,
                backgroundColor: theme.colors.gray[0],
                fontSize: rem(14),
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              },
            }}
            rightSection={
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  radius="xl"
                  size="md"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    backgroundColor: theme.colors.yellow[1],
                    color: theme.colors.yellow[7],
                  }}
                >
                  <IconMoodSmile size={16} />
                </ActionIcon>
                <ActionIcon
                  color="blue"
                  radius="xl"
                  size="md"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  loading={sendMessageMutation.isPending}
                  style={{
                    backgroundColor: messageText.trim()
                      ? theme.colors.blue[6]
                      : theme.colors.gray[2],
                    color: theme.white,
                  }}
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Group>
            }
          />
        </Group>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Paper
            mt="xs"
            p="sm"
            radius="lg"
            shadow="sm"
            style={{
              border: `1px solid ${theme.colors.gray[2]}`,
              backgroundColor: theme.white,
            }}
          >
            <Group gap="xs">
              {["😀", "😂", "❤️", "👍", "👎", "😮", "😢", "😡"].map((emoji) => (
                <ActionIcon
                  key={emoji}
                  variant="subtle"
                  radius="xl"
                  size="md"
                  onClick={() => {
                    setMessageText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.gray[1];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Text size="lg">{emoji}</Text>
                </ActionIcon>
              ))}
            </Group>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}
