import { Box, Text, Group, Avatar } from '@mantine/core';
import { useConversation } from '../../hooks/useChat';
import { useAuthStore } from '../../stores/authStore';

interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { data: conversation } = useConversation(conversationId);
  const { user } = useAuthStore();

  if (!conversation?.typingUsers || conversation.typingUsers.length === 0) {
    return null;
  }

  const typingUsers = conversation.typingUsers.filter(userId => userId !== user?.id);
  
  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      const user = conversation.participants.find(p => p.id === typingUsers[0]);
      return `${user?.firstName || 'Someone'} is typing...`;
    } else if (typingUsers.length === 2) {
      const users = typingUsers.map(userId => 
        conversation.participants.find(p => p.id === userId)?.firstName || 'Someone'
      );
      return `${users.join(' and ')} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: 8,
        padding: '8px 12px',
      }}
    >
      <Group gap="xs" align="flex-end">
        {/* Avatar for typing user */}
        {typingUsers.length === 1 && (
          <Avatar
            size="sm"
            src={conversation.participants.find(p => p.id === typingUsers[0])?.avatar}
            alt={conversation.participants.find(p => p.id === typingUsers[0])?.firstName}
          >
            {conversation.participants.find(p => p.id === typingUsers[0])?.firstName?.charAt(0) || 'U'}
          </Avatar>
        )}

        {/* Typing indicator bubble */}
        <Box
          style={{
            backgroundColor: 'var(--mantine-color-gray-2)',
            padding: '8px 12px',
            borderRadius: 16,
            maxWidth: '100%',
            position: 'relative',
          }}
        >
          <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
            {getTypingText()}
          </Text>
          
          {/* Animated typing dots */}
          <Box
            style={{
              display: 'inline-flex',
              gap: 2,
              marginLeft: 4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-gray-6)',
                  animation: `typing 1.4s infinite ease-in-out ${i * 0.16}s`,
                }}
              />
            ))}
          </Box>
        </Box>
      </Group>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
}
