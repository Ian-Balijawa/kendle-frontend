import { useState, useRef, useEffect } from 'react';
import { Group, ActionIcon, Box, Textarea, Popover, Stack, Button, Text } from '@mantine/core';
import { IconSend, IconPaperclip, IconMoodSmile } from '@tabler/icons-react';
import { useSendMessage } from '../../hooks/useChat';
import { useConversation } from '../../hooks/useChat';
import { useAuthStore } from '../../stores/authStore';
import { useWebSocketIntegration } from '../../hooks/useWebSocket';

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emojiPickerOpened, setEmojiPickerOpened] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();
  const { data: conversation } = useConversation(conversationId);
  const sendMessage = useSendMessage();
  const { sendTypingIndicator } = useWebSocketIntegration();

  const participant = conversation?.participants.find(p => p.id !== user?.id);

  // Handle sending message
  const handleSend = () => {
    if (!message.trim() || !user || !participant) return;

    sendMessage.mutate({
      conversationId,
      data: {
        content: message.trim(),
        receiverId: participant.id,
        conversationId,
        messageType: 'text',
      },
    });

    setMessage('');
    setIsTyping(false);
  };



  // Handle typing indicator
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [message, conversationId, sendTypingIndicator]);

  const handleInputChange = (value: string) => {
    setMessage(value);
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setEmojiPickerOpened(false);
    inputRef.current?.focus();
  };

  const commonEmojis = ['😀', '😂', '😍', '😢', '😮', '😡', '👍', '👎', '❤️', '🔥', '🎉', '👏'];

  return (
    <Box>
      <Group gap="xs" align="flex-end">
        {/* Attachment button */}
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          disabled
          title="Attach file (coming soon)"
        >
          <IconPaperclip size={16} />
        </ActionIcon>

        {/* Emoji button */}
        <Popover
          opened={emojiPickerOpened}
          onClose={() => setEmojiPickerOpened(false)}
          position="top"
          withArrow
        >
          <Popover.Target>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => setEmojiPickerOpened(!emojiPickerOpened)}
              title="Add emoji"
            >
              <IconMoodSmile size={16} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="xs">
              <Text size="xs" fw={500}>Quick emojis</Text>
              <Group gap="xs">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="subtle"
                    size="xs"
                    onClick={() => addEmoji(emoji)}
                    style={{ minWidth: 'auto', padding: '4px 8px' }}
                  >
                    {emoji}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Popover.Dropdown>
        </Popover>

        {/* Message input */}
        <Textarea
          ref={inputRef}
          value={message}
          onChange={(e) => handleInputChange(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          size="sm"
          style={{ flex: 1 }}
          disabled={sendMessage.isPending}
          minRows={1}
          maxRows={4}
          autosize
        />

        {/* Send button */}
        <ActionIcon
          size="sm"
          variant="filled"
          color="primary"
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
          loading={sendMessage.isPending}
        >
          <IconSend size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
