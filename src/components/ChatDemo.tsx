import React, { useState, useEffect } from 'react';
import { Button, Card, Text, Stack, TextInput, Group, Badge, Alert, Code, Divider } from '@mantine/core';
import { useChatCombined } from '../hooks/useChatCombined';
import { useAuthStore } from '../stores/authStore';
import { SendMessageData } from '../types/chat';

export const ChatDemo: React.FC = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<string>('Not connected');
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

    const { user, token } = useAuthStore();

    // Use the combined hook with token
    const chat = useChatCombined({
        token: token || '',
        serverUrl: import.meta.env.VITE_WS_URL || 'http://localhost:8084',
        autoConnect: false
    });

    // Update status based on connection state
    useEffect(() => {
        if (chat.isConnected) {
            setStatus('✅ Connected to WebSocket');
        } else if (chat.isLoading) {
            setStatus('🔄 Connecting...');
        } else if (chat.error) {
            setStatus(`❌ Error: ${(chat.error as Error)?.message || 'Unknown error'}`);
        } else if (chat.isInitialized) {
            setStatus('🔄 Initializing...');
        } else {
            setStatus('❌ Not connected');
        }
    }, [chat.isConnected, chat.isLoading, chat.error, chat.isInitialized]);

    const handleConnect = async () => {
        try {
            await chat.initialize();
            setStatus('🔄 Initializing...');
        } catch (err) {
            console.error('Failed to initialize chat:', err);
            setStatus(`❌ Failed to initialize: ${err}`);
        }
    };

    const handleDisconnect = () => {
        chat.cleanup();
        setStatus('❌ Disconnected');
        setSelectedConversation(null);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedConversation) {
            alert('Please select a conversation or create one first');
            return;
        }

        try {
            const messageData: SendMessageData = {
                content: message,
              conversationId: selectedConversation,
              receiverId: 'demo-receiver', // In real app, this would come from the conversation
              messageType: 'text' as any,
            };
            await chat.sendMessage(messageData);
            setMessage('');
            console.log('Message sent successfully');
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message. Check console for details.');
        }
    };

    const handleSetTyping = async (isTyping: boolean) => {
        if (!selectedConversation) return;
        try {
            await chat.setTyping(selectedConversation, isTyping);
        } catch (err) {
            console.error('Failed to set typing:', err);
        }
    };

    const handleJoinConversation = async (conversationId: string) => {
        try {
            await chat.joinConversation(conversationId);
            setSelectedConversation(conversationId);
            console.log('Joined conversation:', conversationId);
        } catch (err) {
            console.error('Failed to join conversation:', err);
        }
    };

    const handleLeaveConversation = async () => {
        if (!selectedConversation) return;
        try {
            await chat.leaveConversation(selectedConversation);
            setSelectedConversation(null);
            console.log('Left conversation');
        } catch (err) {
            console.error('Failed to leave conversation:', err);
        }
    };

    const handleRefreshConversations = async () => {
        try {
            await chat.refreshConversations();
            console.log('Conversations refreshed');
        } catch (err) {
            console.error('Failed to refresh conversations:', err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Stack gap="md">
                {/* Header Card */}
                <Card withBorder>
                    <Stack gap="sm">
                        <Text size="lg" fw={600}>Chat Connection Demo</Text>
                        <Text size="sm" c="dimmed">
                            This demonstrates the useChatCombined hook with both WebSocket and REST API integration
                        </Text>

                        <Divider />

                        <Group>
                            <Badge color={chat.isConnected ? 'green' : chat.isLoading ? 'yellow' : 'red'} size="lg">
                                {status}
                            </Badge>
                            {chat.isLoading && <Text size="sm" c="dimmed">Loading...</Text>}
                        </Group>

                        {chat.error && (
                            <Alert color="red" title="Connection Error">
                                {(chat.error as Error)?.message || 'Unknown error'}
                            </Alert>
                        )}

                        <Group>
                            <Button
                                onClick={handleConnect} 
                                disabled={chat.isLoading || chat.isConnected || !token}
                                color="green"
                            >
                                Connect
                            </Button>
                            <Button
                                onClick={handleDisconnect} 
                                disabled={!chat.isConnected}
                                color="red"
                                variant="outline"
                            >
                                Disconnect
                            </Button>
                            <Button
                                onClick={handleRefreshConversations}
                                disabled={!chat.isInitialized}
                                variant="light"
                            >
                                Refresh Conversations
                            </Button>
                        </Group>
                    </Stack>
                </Card>

                {/* Connection Info */}
                {chat.isInitialized && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Connection Info</Text>

                            <Group>
                                <Text size="sm">
                                    <strong>Initialized:</strong> {chat.isInitialized ? '✅ Yes' : '❌ No'}
                                </Text>
                                <Text size="sm">
                                    <strong>Connected:</strong> {chat.isConnected ? '✅ Yes' : '❌ No'}
                                </Text>
                            </Group>

                            <Divider />

                            <Group>
                                <Text size="sm">
                                    <strong>Conversations:</strong> {chat.conversations.length}
                                </Text>
                                <Text size="sm">
                                    <strong>Unread Count:</strong> {chat.unreadCount}
                                </Text>
                            </Group>

                            <Group>
                                <Text size="sm">
                                    <strong>Online Users:</strong> {Array.from(chat.onlineUsers).length}
                                </Text>
                                <Text size="sm">
                                    <strong>Typing Users:</strong> {Array.from(chat.typingUsers).length}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                )}

                {/* Conversations List */}
                {chat.conversations.length > 0 && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Your Conversations</Text>
                            <Text size="sm" c="dimmed">
                                Click on a conversation to select it for messaging
                            </Text>

                            <Stack gap="xs">
                                {chat.conversations.map((conv, index) => (
                                    <Card
                                        key={conv.id || index}
                                        withBorder
                                        p="sm"
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedConversation === conv.id ? '#f0f0f0' : 'transparent'
                                        }}
                                        onClick={() => handleJoinConversation(conv.id)}
                                    >
                                        <Group justify="space-between">
                                            <div>
                                                <Text fw={500}>{conv.name || 'Direct Message'}</Text>
                                                <Text size="xs" c="dimmed">
                                                    ID: {conv.id}
                                                </Text>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <Badge color="blue">{conv.unreadCount}</Badge>
                                            )}
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    </Card>
                )}

                {/* Message Input */}
                {chat.isConnected && selectedConversation && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Send Message</Text>

                            <Group>
                                <TextInput
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    style={{ flex: 1 }}
                                />
                                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                                    Send
                                </Button>
                            </Group>

                            <Group>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onMouseDown={() => handleSetTyping(true)}
                                    onMouseUp={() => handleSetTyping(false)}
                                    onMouseLeave={() => handleSetTyping(false)}
                                >
                                    Hold to Type
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleLeaveConversation()}
                                >
                                    Leave Conversation
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                )}

                {/* No Conversation Selected */}
                {chat.isConnected && !selectedConversation && (
                    <Card withBorder>
                        <Stack gap="sm" align="center">
                            <Text size="sm" c="dimmed">
                                Select a conversation above to start messaging, or use the API to create a new one
                            </Text>
                        </Stack>
                    </Card>
                )}

                {/* Auth Info */}
                {token && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Auth Info</Text>
                            <Text size="sm">
                                <strong>User:</strong> {user?.username || user?.firstName || 'Unknown'}
                            </Text>
                            <Text size="sm">
                                <strong>Token:</strong> <Code>{token.substring(0, 20)}...</Code>
                            </Text>
                        </Stack>
                    </Card>
                )}

                {/* Instructions */}
                {!chat.isConnected && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>How to Use</Text>
                            <Text size="sm" c="dimmed">
                                1. Make sure you're authenticated<br />
                                2. Click "Connect" to establish WebSocket connection<br />
                                3. Select a conversation from the list<br />
                                4. Start sending messages in real-time
                            </Text>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </div>
    );
};
