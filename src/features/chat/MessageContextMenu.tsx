import { Menu, ActionIcon, Group } from '@mantine/core';
import { 
  IconHeart, 
  IconThumbUp, 
  IconMoodHappy, 
  IconMoodSad, 
  IconMoodAngry, 
  IconArrowBackUp, 
  IconEdit, 
  IconTrash,
  IconCopy,
  IconDots
} from '@tabler/icons-react';
import { Message } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface MessageContextMenuProps {
  message: Message;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
}

const quickReactions = [
  { emoji: '❤️', icon: IconHeart, label: 'Love' },
  { emoji: '👍', icon: IconThumbUp, label: 'Like' },
  { emoji: '😂', icon: IconMoodHappy, label: 'Laugh' },
  { emoji: '😢', icon: IconMoodSad, label: 'Sad' },
  { emoji: '😡', icon: IconMoodAngry, label: 'Angry' },
];

export function MessageContextMenu({ 
  message, 
  onReply, 
  onEdit, 
  onDelete, 
  onReact 
}: MessageContextMenuProps) {
  const { user } = useAuthStore();
  const isOwnMessage = message.senderId === user?.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleReact = (emoji: string) => {
    onReact?.(message, emoji);
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          style={{ opacity: 0.7 }}
        >
          <IconDots size={14} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Quick Reactions */}
        <Menu.Label>Quick Reactions</Menu.Label>
        <Group gap="xs" p="xs">
          {quickReactions.map(({ emoji, icon: Icon, label }) => (
            <ActionIcon
              key={emoji}
              variant="subtle"
              size="sm"
              onClick={() => handleReact(emoji)}
              title={label}
            >
              <Icon size={16} />
            </ActionIcon>
          ))}
        </Group>

        <Menu.Divider />

        {/* Message Actions */}
        <Menu.Item
          leftSection={<IconArrowBackUp size={14} />}
          onClick={() => onReply?.(message)}
        >
          Reply
        </Menu.Item>

        <Menu.Item
          leftSection={<IconCopy size={14} />}
          onClick={handleCopy}
        >
          Copy text
        </Menu.Item>

        {/* Own message actions */}
        {isOwnMessage && (
          <>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={() => onEdit?.(message)}
            >
              Edit message
            </Menu.Item>

            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => onDelete?.(message)}
            >
              Delete message
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
