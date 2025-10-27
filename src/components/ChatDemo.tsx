import React, { useState, useEffect } from 'react';
import { Button, Card, Text, Stack, TextInput, Group, Badge, Alert } from '@mantine/core';
import { useChatCombined } from '../hooks/useChatCombined';
import { useAuthStore } from '../stores/authStore';

export const ChatDemo: React.FC = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<string>('Not connected');
    const { token, user } = useAuthStore();

    const {
        isInitialized,
        isConnected,
        isLoading,
        error,
        conversations,
        unreadCount,
        typingUsers,
        onlineUsers,
        initialize,
        cleanup,
        sendMessage,
        setTyping,
        joinConversation,
        leaveConversation,
    } = useChatCombined();

    useEffect(() => {
        if (isConnected) {
            setStatus('✅ Connected to WebSocket');
        } else if (isLoading) {
            setStatus('🔄 Connecting...');
        } else if (error) {
            setStatus(`❌ Error: ${(error as Error)?.message || 'Unknown error'}`);
        } else {
            setStatus('❌ Not connected');
        }
    }, [isConnected, isLoading, error]);

    const handleConnect = async () => {
        try {
            await initialize();
            setStatus('🔄 Initializing...');
        } catch (err) {
            console.error('Failed to initialize chat:', err);
            setStatus(`❌ Failed to initialize: ${err}`);
        }
    };

    const handleDisconnect = () => {
        cleanup();
        setStatus('❌ Disconnected');
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            // For demo purposes, we'll send to a test conversation
            // In a real app, you'd have a selected conversation
            await sendMessage({
                content: message,
                conversationId: 'demo-conversation', // This would be a real conversation ID
                receiverId: 'demo-receiver', // This would be a real user ID
                messageType: 'text' as any,
            });
            setMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleSetTyping = async (isTyping: boolean) => {
        try {
            await setTyping('demo-conversation', isTyping);
        } catch (err) {
            console.error('Failed to set typing:', err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Stack gap="md">
                <Card withBorder>
                    <Stack gap="sm">
                        <Text size="lg" fw={600}>Chat Connection Demo</Text>

                        <Group>
                            <Badge color={isConnected ? 'green' : 'red'} size="lg">
                                {status}
                            </Badge>
                            {isLoading && <Text size="sm" c="dimmed">Loading...</Text>}
                        </Group>

                        {error && (
                            <Alert color="red" title="Connection Error">
                                {(error as Error)?.message || 'Unknown error'}
                            </Alert>
                        )}

                        <Group>
                            <Button
                                onClick={handleConnect}
                                disabled={isLoading || isConnected}
                                color="green"
                            >
                                Connect
                            </Button>
                            <Button
                                onClick={handleDisconnect}
                                disabled={!isConnected}
                                color="red"
                                variant="outline"
                            >
                                Disconnect
                            </Button>
                        </Group>
                    </Stack>
                </Card>

                {isConnected && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Connection Info</Text>

                            <Group>
                                <Text size="sm">
                                    <strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}
                                </Text>
                                <Text size="sm">
                                    <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
                                </Text>
                            </Group>

                            <Text size="sm">
                                <strong>Conversations:</strong> {conversations.length}
                            </Text>
                            <Text size="sm">
                                <strong>Unread Count:</strong> {unreadCount}
                            </Text>
                            <Text size="sm">
                                <strong>Online Users:</strong> {Array.from(onlineUsers).length}
                            </Text>
                            <Text size="sm">
                                <strong>Typing Users:</strong> {Array.from(typingUsers).length}
                            </Text>
                        </Stack>
                    </Card>
                )}

                {isConnected && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Test Message</Text>

                            <Group>
                                <TextInput
                                    placeholder="Type a test message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
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
                                    onClick={() => joinConversation('demo-conversation')}
                                >
                                    Join Demo Conversation
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => leaveConversation('demo-conversation')}
                                >
                                    Leave Demo Conversation
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                )}

                {token && (
                    <Card withBorder>
                        <Stack gap="sm">
                            <Text size="md" fw={600}>Auth Info</Text>
                            <Text size="sm">
                                <strong>User:</strong> {user?.username || 'Unknown'}
                            </Text>
                            <Text size="sm">
                                <strong>Token:</strong> {token ? 'Present' : 'Missing'}
                            </Text>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </div>
    );
};
