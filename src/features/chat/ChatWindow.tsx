import {
  ActionIcon,
  Avatar,
  Box,
  FileInput,
  Group,
  Loader,
  Menu,
  ScrollArea,
  Stack,
  Text,
  TextInput,
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
import { useInboxStore } from "../../stores/inboxStore";
import { Conversation } from "../../types/chat";
import { MessageCard } from "./MessageCard";

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void; // For mobile view
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { user } = useAuthStore();
  const {
    messages,
    sendMessage,
    sendTypingIndicator,
    typingIndicators,
    onlineStatuses,
  } = useInboxStore();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const participant = conversation.participants[0];
  const conversationMessages = messages[conversation.id] || [];
  const isOnline = onlineStatuses[participant.id]?.isOnline || false;
  const lastSeen = onlineStatuses[participant.id]?.lastSeen;

  const participantTyping = typingIndicators.find(
    (ti) =>
      ti.conversationId === conversation.id && ti.userId === participant.id
  );

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [conversationMessages.length]);

  useEffect(() => {
    // Focus message input when conversation changes
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [conversation.id]);

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Online";
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440)
      return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
    return "Last seen recently";
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendMessage(conversation.id, participant.id, messageText.trim());
    setMessageText("");

    // Stop typing indicator
    if (isTyping) {
      sendTypingIndicator(conversation.id, false);
      setIsTyping(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    // Send typing indicator
    if (!isTyping && text.trim()) {
      sendTypingIndicator(conversation.id, true);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        sendTypingIndicator(conversation.id, false);
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    // TODO: Implement file upload functionality
    console.log("File selected:", file.name);
    setShowAttachmentMenu(false);
  };

  const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "👍", "❤️", "🎉", "🔥"];

  const handleEmojiSelect = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  return (
    <Stack h="100%" gap={0}>
      {/* Chat Header */}
      <Box
        p="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          backgroundColor: "var(--mantine-color-white)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Group justify="space-between">
          <Group gap="sm">
            {/* Mobile back button */}
            {onBack && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={onBack}
                className="mobile-only"
              >
                <IconArrowLeft size={16} />
              </ActionIcon>
            )}

            {/* Participant info */}
            <Group gap="sm">
              <Box style={{ position: "relative" }}>
                <Avatar
                  src={participant.avatar}
                  alt={participant.firstName}
                  size="md"
                  radius="xl"
                >
                  {participant.firstName?.charAt(0) || "U"}
                </Avatar>
                {isOnline && (
                  <Box
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-green-6)",
                      border: "2px solid white",
                    }}
                  />
                )}
              </Box>

              <Box>
                <Text fw={500} size="sm">
                  {participant.firstName} {participant.lastName}
                </Text>
                <Text size="xs" c="dimmed">
                  {participantTyping?.isTyping
                    ? "Typing..."
                    : isOnline
                      ? "Online"
                      : lastSeen
                        ? formatLastSeen(lastSeen)
                        : "Offline"}
                </Text>
              </Box>
            </Group>
          </Group>

          {/* Action buttons */}
          <Group gap="xs">
            <ActionIcon variant="subtle" size="md">
              <IconPhone size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="md">
              <IconVideo size={18} />
            </ActionIcon>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" size="md">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>View Profile</Menu.Item>
                <Menu.Item>Media & Files</Menu.Item>
                <Menu.Item>Search Messages</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="orange">Mute Notifications</Menu.Item>
                <Menu.Item color="red">Block User</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* Messages Area */}
      <Box style={{ flex: 1, position: "relative" }}>
        <ScrollArea h="100%" ref={scrollAreaRef} style={{ padding: "16px" }}>
          {isLoadingMessages ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading messages...
              </Text>
            </Group>
          ) : conversationMessages.length === 0 ? (
            <Stack align="center" justify="center" h="100%" gap="md">
              <Avatar size="xl" radius="xl" src={participant.avatar}>
                {participant.firstName?.charAt(0) || "U"}
              </Avatar>
              <Stack align="center" gap="xs">
                <Text fw={500}>
                  {participant.firstName} {participant.lastName}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  No messages yet. Start a conversation!
                </Text>
              </Stack>
            </Stack>
          ) : (
            <Stack gap="xs">
              {conversationMessages
                .slice()
                .reverse()
                .map((message, index, arr) => {
                  const isOwn =
                    message.senderId === user?.id ||
                    message.senderId === "current";
                  const previousMessage =
                    index > 0 ? arr[index - 1] : undefined;
                  const nextMessage =
                    index < arr.length - 1 ? arr[index + 1] : undefined;

                  return (
                    <MessageCard
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={!isOwn}
                      previousMessage={previousMessage}
                      nextMessage={nextMessage}
                    />
                  );
                })}

              {/* Typing indicator */}
              {participantTyping?.isTyping && (
                <Group justify="flex-start" mt="xs">
                  <Avatar size="sm" radius="xl" src={participant.avatar}>
                    {participant.firstName?.charAt(0) || "U"}
                  </Avatar>
                  <Box
                    style={{
                      backgroundColor: "var(--mantine-color-gray-2)",
                      borderRadius: "18px",
                      padding: "8px 16px",
                    }}
                  >
                    <Group gap="xs">
                      <Box
                        style={{
                          display: "flex",
                          gap: "2px",
                        }}
                      >
                        {[1, 2, 3].map((dot) => (
                          <Box
                            key={dot}
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              backgroundColor: "var(--mantine-color-gray-6)",
                              animation: `typing-dots 1.5s infinite ${dot * 0.2}s`,
                            }}
                          />
                        ))}
                      </Box>
                    </Group>
                  </Box>
                </Group>
              )}
            </Stack>
          )}
        </ScrollArea>
      </Box>

      {/* Message Input */}
      <Box
        p="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
          backgroundColor: "var(--mantine-color-white)",
        }}
      >
        <Group gap="sm" align="flex-end">
          {/* Attachment button */}
          <Menu
            opened={showAttachmentMenu}
            onClose={() => setShowAttachmentMenu(false)}
            shadow="md"
            width={200}
            position="top-start"
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setShowAttachmentMenu(true)}
              >
                <IconPaperclip size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <FileInput
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <Menu.Item
                leftSection={<IconPhoto size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Photo or Video
              </Menu.Item>
              <Menu.Item leftSection={<IconFile size={16} />}>
                Document
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Message input */}
          <TextInput
            ref={messageInputRef}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => handleTyping(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
            size="md"
            radius="xl"
            styles={{
              input: {
                paddingRight: "100px",
              },
            }}
            rightSection={
              <Group gap="xs" pr="xs">
                {/* Emoji picker */}
                <Menu
                  opened={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  shadow="md"
                  width={280}
                  position="top-end"
                >
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => setShowEmojiPicker(true)}
                    >
                      <IconMoodSmile size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown p="md">
                    <Group gap="xs">
                      {emojis.map((emoji) => (
                        <ActionIcon
                          key={emoji}
                          variant="subtle"
                          size="lg"
                          onClick={() => handleEmojiSelect(emoji)}
                          style={{ fontSize: "18px" }}
                        >
                          {emoji}
                        </ActionIcon>
                      ))}
                    </Group>
                  </Menu.Dropdown>
                </Menu>

                {/* Send button */}
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Group>
            }
          />
        </Group>
      </Box>

      <style jsx>{`
        @keyframes typing-dots {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }
        }

        @media (min-width: 769px) {
          .mobile-only {
            display: none;
          }
        }
      `}</style>
    </Stack>
  );
}
