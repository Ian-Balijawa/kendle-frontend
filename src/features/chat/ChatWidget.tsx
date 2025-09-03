import { useState, useMemo } from 'react';
import { Box, Paper, Group, Text, ActionIcon, Stack, Avatar, Badge, TextInput, ScrollArea, Tooltip } from '@mantine/core';
import { IconX, IconMessage, IconSearch, IconPin, IconArchive, IconVolumeOff } from '@tabler/icons-react';
import { useConversations } from '../../hooks/useChat';
import { useFloatingChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { Conversation } from '../../types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { FollowedUsersChat } from './FollowedUsersChat';

interface ChatWidgetProps {
  onClose: () => void;
}

export function ChatWidget({ onClose }: ChatWidgetProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: conversations } = useConversations();
  const { openChatWindow } = useFloatingChatStore();
  const { user } = useAuthStore();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery.trim()) return conversations;

    return conversations.filter(conv => {
      const participant = conv.participants.find(p => p.id !== user?.id);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        conv.name?.toLowerCase().includes(searchLower) ||
        participant?.firstName?.toLowerCase().includes(searchLower) ||
        participant?.lastName?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchLower)
      );
    });
  }, [conversations, searchQuery, user?.id]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    openChatWindow(conversation.id);
    onClose();
  };

  const renderConversationItem = (conversation: Conversation) => {
    const participant = conversation.participants.find(p => p.id !== user?.id);
    const lastMessage = conversation.lastMessage;
    const unreadCount = conversation.unreadCount || 0;

    return (
      <Box
        key={conversation.id}
        style={{
          padding: '12px',
          cursor: 'pointer',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          backgroundColor: activeTab === conversation.id ? 'var(--mantine-color-gray-1)' : 'transparent',
          position: 'relative',
        }}
        onClick={() => setActiveTab(conversation.id)}
        onDoubleClick={() => handleConversationClick(conversation)}
      >
        <Group gap="sm" align="flex-start">
          <Box style={{ position: 'relative' }}>
            <Avatar
              size="md"
              src={conversation.avatar || participant?.avatar}
              alt={conversation.name || participant?.firstName}
            >
              {participant?.firstName?.charAt(0) || 'U'}
            </Avatar>
            
            {/* Online status indicator */}
            {participant?.isOnline && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#44ff44',
                  border: '2px solid white',
                }}
              />
            )}
          </Box>
          
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="flex-start">
              <Group gap="xs" align="center">
                <Text size="sm" fw={500} truncate>
                  {conversation.name || participant?.firstName || 'Unknown'}
                </Text>
                
                {/* Conversation status indicators */}
                {conversation.isPinned && (
                  <Tooltip label="Pinned">
                    <IconPin size={12} color="var(--mantine-color-yellow-6)" />
                  </Tooltip>
                )}
                {conversation.isMuted && (
                  <Tooltip label="Muted">
                    <IconVolumeOff size={12} color="var(--mantine-color-gray-6)" />
                  </Tooltip>
                )}
                {conversation.isArchived && (
                  <Tooltip label="Archived">
                    <IconArchive size={12} color="var(--mantine-color-gray-6)" />
                  </Tooltip>
                )}
              </Group>
              
              <Group gap="xs" align="center">
                {lastMessage && (
                  <Text size="xs" c="dimmed">
                    {formatTime(lastMessage.createdAt)}
                  </Text>
                )}
                
                {unreadCount > 0 && (
                  <Badge
                    size="xs"
                    variant="filled"
                    color="primary"
                    style={{ minWidth: 18, height: 18 }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Group>
            </Group>
            
            {lastMessage && (
              <Text size="xs" c="dimmed" truncate>
                {lastMessage.content}
              </Text>
            )}
          </Box>
          
          {unreadCount > 0 && (
            <Badge
              size="xs"
              variant="filled"
              color="red"
              style={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Group>
      </Box>
    );
  };

  return (
    <Paper
      shadow="xl"
      style={{
        width: isMobile ? '100%' : 400,
        height: isMobile ? '100%' : 600,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
        borderRadius: isMobile ? 0 : undefined,
      }}
    >
      {/* Header */}
      <Group justify="space-between" p="md">
        <Group gap="xs">
          <IconMessage size={20} />
          <Text fw={600}>Messages</Text>
        </Group>
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={16} />
        </ActionIcon>
      </Group>

      {/* Content */}
      <Box style={{ flex: 1, display: 'flex' }}>
        {/* Conversations List */}
        <Box style={{ 
          width: activeTab ? (isMobile ? '0%' : '40%') : '100%', 
          borderRight: activeTab && !isMobile ? '1px solid var(--mantine-color-gray-3)' : 'none',
          display: activeTab && isMobile ? 'none' : 'block',
        }}>
          <Stack gap={0} style={{ height: '100%' }}>
                        {/* Search bar */}
            <TextInput
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              size="sm"
              m="xs"
            />

            {/* Followed Users Chat Section */}
            <FollowedUsersChat />

            {/* Conversations */}
            <ScrollArea style={{ flex: 1 }}>
              {filteredConversations?.length === 0 ? (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--mantine-color-gray-6)',
                    padding: '20px',
                  }}
                >
                  <Text size="sm" ta="center">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </Text>
                </Box>
              ) : (
                filteredConversations?.map(renderConversationItem)
              )}
            </ScrollArea>
          </Stack>
        </Box>

        {/* Active Chat */}
        {activeTab && (
          <Box style={{ 
            width: isMobile ? '100%' : '60%', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            {/* Mobile back button */}
            {isMobile && (
              <Group p="xs">
                <ActionIcon 
                  variant="subtle" 
                  onClick={() => setActiveTab(null)}
                  size="sm"
                >
                  <IconX size={16} />
                </ActionIcon>
                <Text size="sm" fw={500}>
                  {conversations?.find(c => c.id === activeTab)?.name || 'Chat'}
                </Text>
              </Group>
            )}
            
            <ChatMessages conversationId={activeTab} />
            <ChatInput conversationId={activeTab} />
          </Box>
        )}
      </Box>
    </Paper>
  );
}
