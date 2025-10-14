import { useState, useRef, useEffect } from "react";
import {
  Group,
  ActionIcon,
  Box,
  Textarea,
  Popover,
  Stack,
  Button,
  Text,
  Paper,
  Transition,
  Tooltip,
  FileInput,
  Progress,
} from "@mantine/core";
import {
  IconSend,
  IconMoodSmile,
  IconPhoto,
  IconPaperclip,
  IconX,
} from "@tabler/icons-react";
import { useSendMessage, useConversation } from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { user } = useAuthStore();
  const sendMessage = useSendMessage();
  const { data: conversation } = useConversation(conversationId);
  const { sendTypingIndicator } = useWebSocketIntegration();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    const participant = conversation?.participants.find(
      (p) => p.id !== user?.id,
    );
    if (!participant) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        data: {
          content: message.trim(),
          receiverId: participant.id,
          conversationId,
          messageType: selectedFile ? "image" : "text",
        },
      });
      setMessage("");
      setSelectedFile(null);
      setUploadProgress(0);

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setEmojiPickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setAttachmentOpen(false);

    // Simulate upload progress
    if (file) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // Common emojis for quick access
  const quickEmojis = ["😀", "😂", "❤️", "👍", "👎", "😢", "😮", "😡"];

  return (
    <Transition
      mounted={mounted}
      transition="slide-up"
      duration={300}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Paper
          style={{
            ...styles,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "16px 16px 0 0",
            padding: "16px",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* File preview */}
          {selectedFile && (
            <Box mb="sm">
              <Paper
                p="sm"
                radius="md"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <IconPhoto
                      size={16}
                      color="var(--mantine-color-indigo-6)"
                    />
                    <Text size="sm" fw={500}>
                      {selectedFile.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                  </Group>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={removeFile}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress
                    value={uploadProgress}
                    size="xs"
                    mt="xs"
                    color="indigo"
                    radius="xl"
                  />
                )}
              </Paper>
            </Box>
          )}

          <Group align="flex-end" gap="sm">
            {/* Attachment button */}
            <Popover
              opened={attachmentOpen}
              onChange={setAttachmentOpen}
              position="top-start"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                <Tooltip label="Attach file" position="top">
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="gray"
                    radius="xl"
                    onClick={() => setAttachmentOpen(!attachmentOpen)}
                    style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      "&:hover": {
                        background: "rgba(99, 102, 241, 0.2)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <IconPaperclip size={18} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown p="sm">
                <Stack gap="xs">
                  <FileInput
                    placeholder="Select image"
                    accept="image/*"
                    onChange={handleFileSelect}
                    leftSection={<IconPhoto size={16} />}
                    size="sm"
                    radius="md"
                  />
                  <Text size="xs" c="dimmed" ta="center">
                    Max file size: 10MB
                  </Text>
                </Stack>
              </Popover.Dropdown>
            </Popover>

            {/* Message input */}
            <Box style={{ flex: 1 }}>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyPress}
                placeholder={
                  conversation?.participants?.length === 2
                    ? `Message ${conversation.participants.find((p) => p.id !== user?.id)?.firstName}...`
                    : "Type a message..."
                }
                autosize
                minRows={1}
                maxRows={4}
                radius="xl"
                size="md"
                styles={{
                  input: {
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    padding: "12px 16px",
                    "&:focus": {
                      borderColor: "var(--mantine-color-indigo-5)",
                      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-gray-5)",
                    },
                  },
                }}
              />
            </Box>

            {/* Emoji picker */}
            <Popover
              opened={emojiPickerOpen}
              onChange={setEmojiPickerOpen}
              position="top"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                <Tooltip label="Add emoji" position="top">
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="yellow"
                    radius="xl"
                    onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    style={{
                      background: "rgba(255, 193, 7, 0.1)",
                      "&:hover": {
                        background: "rgba(255, 193, 7, 0.2)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <IconMoodSmile size={18} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown p="sm">
                <Stack gap="xs">
                  <Text size="xs" fw={500} c="dimmed">
                    Quick Emojis
                  </Text>
                  <Group gap="xs">
                    {quickEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="subtle"
                        size="sm"
                        radius="md"
                        onClick={() => handleEmojiSelect(emoji)}
                        style={{
                          minWidth: "auto",
                          padding: "4px 8px",
                          fontSize: "16px",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>

            {/* Send button */}
            <Tooltip
              label={
                !message.trim() && !selectedFile
                  ? "Type a message"
                  : "Send message"
              }
              position="top"
            >
              <ActionIcon
                size="lg"
                radius="xl"
                onClick={handleSendMessage}
                loading={sendMessage.isPending}
                disabled={!message.trim() && !selectedFile}
                style={{
                  background:
                    !message.trim() && !selectedFile
                      ? "var(--mantine-color-gray-3)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  boxShadow:
                    !message.trim() && !selectedFile
                      ? "none"
                      : "0 4px 16px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    transform:
                      !message.trim() && !selectedFile ? "none" : "scale(1.05)",
                    boxShadow:
                      !message.trim() && !selectedFile
                        ? "none"
                        : "0 6px 20px rgba(102, 126, 234, 0.4)",
                  },
                  "&:disabled": {
                    background: "var(--mantine-color-gray-3)",
                    color: "var(--mantine-color-gray-5)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <IconSend size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Typing indicator */}
          {isTyping && (
            <Text size="xs" c="dimmed" mt="xs" style={{ opacity: 0.7 }}>
              Typing...
            </Text>
          )}
        </Paper>
      )}
    </Transition>
  );
}
