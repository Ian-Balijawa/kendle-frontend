import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Loader,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Center,
  Button,
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
import { useAuthStore } from "../../stores/authStore";
import { Conversation } from "../../types/chat";
import { MessageCard } from "./MessageCard";
import {
  useInfiniteMessages,
  useSendMessage,
  useMarkConversationAsRead,
  useUpdateConversation,
} from "../../hooks/useChat";
import { SendMessageRequest } from "../../services/api";

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
    (p) => p.id !== user?.id,
  );

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
      },
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
    <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Chat Header */}
      <Box
        p="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        <Group justify="space-between">
          <Group>
            {showBackButton && (
              <ActionIcon variant="subtle" onClick={onBack}>
                <IconArrowLeft size={20} />
              </ActionIcon>
            )}

            <Avatar
              src={otherParticipant?.avatar}
              alt={otherParticipant?.firstName || "User"}
              size="md"
              radius="xl"
            >
              {(otherParticipant?.firstName || "U").charAt(0)}
            </Avatar>

            <Box>
              <Text fw={500} size="sm">
                {conversation.name ||
                  (otherParticipant
                    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                    : "Unknown User")}
              </Text>
              <Text size="xs" c="dimmed">
                {/* TODO: Show online status or typing indicator */}
                {otherParticipant
                  ? `@${otherParticipant.username || otherParticipant.phoneNumber}`
                  : ""}
              </Text>
            </Box>
          </Group>

          <Group>
            <ActionIcon variant="subtle">
              <IconPhone size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle">
              <IconVideo size={20} />
            </ActionIcon>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical size={20} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={handleTogglePin}>
                  {conversation.isPinned ? "Unpin" : "Pin"} Conversation
                </Menu.Item>
                <Menu.Item onClick={handleToggleMute}>
                  {conversation.isMuted ? "Unmute" : "Mute"} Conversation
                </Menu.Item>
                <Menu.Item onClick={handleToggleArchive}>
                  {conversation.isArchived ? "Unarchive" : "Archive"}{" "}
                  Conversation
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red">Delete Conversation</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        style={{ flex: 1 }}
        scrollbarSize={6}
        offsetScrollbars
      >
        <Stack gap="xs" p="md">
          {/* Load more messages button */}
          {hasNextPage && (
            <Center pb="md">
              <Button
                variant="light"
                size="xs"
                onClick={handleLoadMoreMessages}
                loading={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load older messages"}
              </Button>
            </Center>
          )}

          {messagesLoading && messages.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="md" />
                <Text c="dimmed">Loading messages...</Text>
              </Stack>
            </Center>
          ) : messages.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Avatar size="xl" color="blue">
                  {(otherParticipant?.firstName || "U").charAt(0)}
                </Avatar>
                <Text size="lg" fw={500}>
                  Start the conversation
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Send a message to {otherParticipant?.firstName || "this user"}{" "}
                  to get started
                </Text>
              </Stack>
            </Center>
          ) : (
            messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
                showAvatar={message.senderId !== user?.id}
              />
            ))
          )}

          {/* Typing Indicators */}
          {/* TODO: Implement typing indicators from WebSocket */}
        </Stack>
      </ScrollArea>

      {/* Message Input */}
      <Box
        p="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        <Group gap="xs" align="flex-end">
          {/* Attachment Menu */}
          <Menu
            opened={showAttachmentMenu}
            onChange={setShowAttachmentMenu}
            position="top-start"
            shadow="md"
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              >
                <IconPaperclip size={20} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPhoto size={16} />}>Photo</Menu.Item>
              <Menu.Item leftSection={<IconVideo size={16} />}>Video</Menu.Item>
              <Menu.Item leftSection={<IconFile size={16} />}>File</Menu.Item>
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
            rightSection={
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <IconMoodSmile size={18} />
                </ActionIcon>
                <ActionIcon
                  color="blue"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  loading={sendMessageMutation.isPending}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            }
          />
        </Group>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Box
            mt="xs"
            p="sm"
            style={{
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-md)",
              backgroundColor: "white",
            }}
          >
            <Group gap="xs">
              {["😀", "😂", "❤️", "👍", "👎", "😮", "😢", "😡"].map((emoji) => (
                <ActionIcon
                  key={emoji}
                  variant="subtle"
                  onClick={() => {
                    setMessageText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text>{emoji}</Text>
                </ActionIcon>
              ))}
            </Group>
          </Box>
        )}
      </Box>
    </Box>
  );
}
