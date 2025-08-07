import { useState } from 'react'
import {
    Container,
    Stack,
    Title,
    Group,
    Text,
    Card,
    Avatar,
    TextInput, Box, ActionIcon,
    Badge,
    ScrollArea
} from '@mantine/core'
import {
    IconSend,
    IconSearch,
    IconDotsVertical,
    IconPhone,
    IconVideo,
    IconPaperclip,
    IconMoodSmile as IconSmile,
} from '@tabler/icons-react'

// Mock data
const mockConversations = [
  {
    id: '1',
    participants: [
      {
        id: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        avatar: null,
        isOnline: true,
      },
    ],
    lastMessage: {
      content: 'Hey! How are you doing?',
      senderId: '1',
      createdAt: '2024-01-15T10:30:00Z',
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: '2',
    participants: [
      {
        id: '2',
        username: 'janedoe',
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: null,
        isOnline: false,
      },
    ],
    lastMessage: {
      content: 'Thanks for the help!',
      senderId: '2',
      createdAt: '2024-01-15T09:15:00Z',
      isRead: true,
    },
    unreadCount: 0,
  },
]

const mockMessages = [
  {
    id: '1',
    content: 'Hey! How are you doing?',
    senderId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    isRead: true,
  },
  {
    id: '2',
    content: 'I\'m doing great! How about you?',
    senderId: 'current',
    createdAt: '2024-01-15T10:32:00Z',
    isRead: true,
  },
  {
    id: '3',
    content: 'Pretty good! Working on some exciting projects.',
    senderId: '1',
    createdAt: '2024-01-15T10:35:00Z',
    isRead: false,
  },
]

export function ChatPage() {
  const [conversations] = useState(mockConversations)
  const [selectedChat, setSelectedChat] = useState(conversations[0])
  const [messages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Implement send message functionality
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  return (
    <Container size="xl" py="md" h="calc(100vh - 120px)">
      <Card withBorder h="100%">
        <Group h="100%" gap={0}>
          {/* Conversations List */}
          <Box w={300} h="100%" style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
            <Stack h="100%" gap={0}>
              {/* Header */}
              <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Title order={3} size="h4">
                  Messages
                </Title>
              </Box>

              {/* Search */}
              <Box p="md">
                <TextInput
                  placeholder="Search conversations..."
                  leftSection={<IconSearch size={16} />}
                  size="sm"
                />
              </Box>

              {/* Conversations */}
              <ScrollArea style={{ flex: 1 }}>
                <Stack gap={0}>
                  {conversations.map((conversation) => (
                    <Box
                      key={conversation.id}
                      p="md"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedChat?.id === conversation.id
                          ? 'var(--mantine-color-blue-0)'
                          : 'transparent',
                        borderBottom: '1px solid var(--mantine-color-gray-2)',
                      }}
                      onClick={() => setSelectedChat(conversation)}
                    >
                      <Group>
                        <Avatar
                          src={conversation.participants[0].avatar}
                          alt={conversation.participants[0].firstName}
                          size="md"
                          style={{ position: 'relative' }}
                        >
                          {conversation.participants[0].firstName.charAt(0)}
                        </Avatar>
                        {conversation.participants[0].isOnline && (
                          <Badge
                            size="xs"
                            color="green"
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              border: '2px solid white',
                            }}
                          />
                        )}
                        <Box style={{ flex: 1 }}>
                          <Group justify="space-between">
                            <Text fw={500} size="sm">
                              {conversation.participants[0].firstName} {conversation.participants[0].lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </Text>
                          </Group>
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                              {conversation.lastMessage.content}
                            </Text>
                            {conversation.unreadCount > 0 && (
                              <Badge size="xs" color="blue">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </Group>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </ScrollArea>
            </Stack>
          </Box>

          {/* Chat Area */}
          <Box style={{ flex: 1 }} h="100%">
            <Stack h="100%" gap={0}>
              {/* Chat Header */}
              <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Group justify="space-between">
                  <Group>
                    <Avatar
                      src={selectedChat?.participants[0].avatar}
                      alt={selectedChat?.participants[0].firstName}
                      size="md"
                    >
                      {selectedChat?.participants[0].firstName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Text fw={500}>
                        {selectedChat?.participants[0].firstName} {selectedChat?.participants[0].lastName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {selectedChat?.participants[0].isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </Box>
                  </Group>
                  <Group>
                    <ActionIcon variant="subtle" size="sm">
                      <IconPhone size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm">
                      <IconVideo size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Box>

              {/* Messages */}
              <ScrollArea style={{ flex: 1 }} p="md">
                <Stack gap="md">
                  {messages.map((message) => (
                    <Group
                      key={message.id}
                      justify={message.senderId === 'current' ? 'flex-end' : 'flex-start'}
                    >
                      <Box
                        style={{
                          maxWidth: '70%',
                          backgroundColor: message.senderId === 'current'
                            ? 'var(--mantine-color-blue-6)'
                            : 'var(--mantine-color-gray-2)',
                          color: message.senderId === 'current' ? 'white' : 'inherit',
                          padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
                          borderRadius: 'var(--mantine-radius-md)',
                        }}
                      >
                        <Text size="sm">{message.content}</Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {formatTime(message.createdAt)}
                        </Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea>

              {/* Message Input */}
              <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <Group gap="sm">
                  <ActionIcon variant="subtle" size="sm">
                    <IconPaperclip size={16} />
                  </ActionIcon>
                  <TextInput
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.currentTarget.value)}
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        handleSendMessage()
                      }
                    }}
                    style={{ flex: 1 }}
                    size="sm"
                  />
                  <ActionIcon variant="subtle" size="sm">
                    <IconSmile size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <IconSend size={16} />
                  </ActionIcon>
                </Group>
              </Box>
            </Stack>
          </Box>
        </Group>
      </Card>
    </Container>
  )
}
