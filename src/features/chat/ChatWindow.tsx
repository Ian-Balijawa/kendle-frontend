import { useState, useRef, useEffect } from 'react';
import { Box, Paper, Group, Text, ActionIcon } from '@mantine/core';
import { IconMinus, IconX, IconMaximize } from '@tabler/icons-react';
import { useFloatingChatStore } from '../../stores/chatStore';
import { useConversation } from '../../hooks/useChat';
import { useAuthStore } from '../../stores/authStore';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  conversationId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export function ChatWindow({ conversationId, position, size, zIndex }: ChatWindowProps) {
  const {
    minimizeChatWindow,
    closeChatWindow,
    focusChatWindow,
    updateChatWindowPosition,
    updateChatWindowSize,
  } = useFloatingChatStore();
  
  const { data: conversation } = useConversation(conversationId);
  const { user } = useAuthStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const participant = conversation?.participants.find(p => p.id !== user?.id);

  // Handle window dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === windowRef.current || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      focusChatWindow(conversationId);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && windowRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      updateChatWindowPosition(conversationId, {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Handle window resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    focusChatWindow(conversationId);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const newHeight = e.clientY - rect.top;
      
      // Minimum size constraints
      const minWidth = 300;
      const minHeight = 400;
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;
      
      updateChatWindowSize(conversationId, {
        width: Math.max(minWidth, Math.min(newWidth, maxWidth)),
        height: Math.max(minHeight, Math.min(newHeight, maxHeight)),
      });
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position, size]);

  if (!conversation) return null;

  return (
    <Paper
      ref={windowRef}
      shadow="lg"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <Group
        justify="space-between"
        p="xs"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-gray-0)',
          cursor: 'grab',
        }}
        data-drag-handle
      >
        <Group gap="xs">
          <Text size="sm" fw={500} truncate>
            {conversation.name || participant?.firstName || 'Chat'}
          </Text>
          {participant?.isOnline && (
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#44ff44',
              }}
            />
          )}
        </Group>
        
        <Group gap={4}>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => minimizeChatWindow(conversationId)}
          >
            <IconMinus size={14} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => closeChatWindow(conversationId)}
          >
            <IconX size={14} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Messages Area */}
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <ChatMessages conversationId={conversationId} />
      </Box>

      {/* Input Area */}
      <Box p="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <ChatInput conversationId={conversationId} />
      </Box>

      {/* Resize Handle */}
      <Box
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          cursor: 'nw-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseDown={handleResizeMouseDown}
      >
        <IconMaximize size={12} style={{ opacity: 0.5 }} />
      </Box>
    </Paper>
  );
}
