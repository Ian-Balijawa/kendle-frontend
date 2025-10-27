import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
    ChatState,
    ChatActions,
    Message,
    Conversation,
    SendMessageData,
    TypingIndicatorData,
    MarkMessageAsReadData,
    MessageReceivedEvent,
    MessageDeliveredEvent,
    MessageReadEvent,
    TypingStartEvent,
    TypingStopEvent,
    UserOnlineEvent,
    UserOfflineEvent,
    ConversationCreatedEvent,
    ErrorEvent,
    MessageType,
    MessageStatus,
} from '../types/chat';
import { useAuthStore } from '../stores/authStore';

interface UseChatSocketOptions {
    serverUrl: string;
    autoConnect?: boolean;
    onError?: (error: string) => void;
    onMessageReceived?: (message: Message) => void;
    onUserOnline?: (userId: string) => void;
    onUserOffline?: (userId: string) => void;
}

export const useChatSocket = (options: UseChatSocketOptions) => {
    const { serverUrl, autoConnect = false, onError, onMessageReceived, onUserOnline, onUserOffline } = options;

    const { token } = useAuthStore();

    const socketRef = useRef<Socket | null>(null);
    const [state, setState] = useState<ChatState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        conversations: [],
        currentConversation: null,
        messages: [],
        typingUsers: new Set(),
        onlineUsers: new Set(),
    });

    // Connect to the WebSocket server
    const connect = useCallback(async () => {
        if (socketRef.current?.connected) {
            return;
        }

        if (!token) {
            throw new Error('Token is required for connection');
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const socket = io(serverUrl, {
                extraHeaders: {
                    token: token,
                },
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true,
            });

            socketRef.current = socket;

            // Connection event handlers
            socket.on('connect', () => {
                console.log('Connected to chat server');
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    error: null
                }));
            });

            socket.on('disconnect', (reason) => {
                console.log('Disconnected from chat server:', reason);
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false
                }));
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                const errorMessage = error.message || 'Failed to connect to chat server';
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false,
                    error: errorMessage
                }));
                onError?.(errorMessage);
            });

            // Message event handlers
            socket.on('message_received', (event: MessageReceivedEvent) => {
                const message = event.data;
                console.log('Message received:', message);

                setState(prev => ({
                    ...prev,
                    messages: prev.messages.concat(message),
                }));

                onMessageReceived?.(message);
            });

            socket.on('message_delivered', (event: MessageDeliveredEvent) => {
                console.log('Message delivered:', event.data);
                setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg =>
                        msg.id === event.data.messageId
                            ? { ...msg, status: MessageStatus.DELIVERED, isDelivered: true }
                            : msg
                    ),
                }));
            });

            socket.on('message_read', (event: MessageReadEvent) => {
                console.log('Message read:', event.data);
                setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg =>
                        msg.id === event.data.messageId
                            ? { ...msg, status: MessageStatus.READ, isRead: true, readAt: new Date().toISOString() }
                            : msg
                    ),
                }));
            });

            // Typing indicator handlers
            socket.on('typing_start', (event: TypingStartEvent) => {
                console.log('User started typing:', event.data);
                setState(prev => ({
                    ...prev,
                    typingUsers: new Set([...prev.typingUsers, event.data.userId]),
                }));
            });

            socket.on('typing_stop', (event: TypingStopEvent) => {
                console.log('User stopped typing:', event.data);
                setState(prev => {
                    const newTypingUsers = new Set(prev.typingUsers);
                    newTypingUsers.delete(event.data.userId);
                    return {
                        ...prev,
                        typingUsers: newTypingUsers,
                    };
                });
            });

            // Presence handlers
            socket.on('user_online', (event: UserOnlineEvent) => {
                console.log('User online:', event.data);
                setState(prev => ({
                    ...prev,
                    onlineUsers: new Set([...prev.onlineUsers, event.data.userId]),
                }));
                onUserOnline?.(event.data.userId);
            });

            socket.on('user_offline', (event: UserOfflineEvent) => {
                console.log('User offline:', event.data);
                setState(prev => {
                    const newOnlineUsers = new Set(prev.onlineUsers);
                    newOnlineUsers.delete(event.data.userId);
                    return {
                        ...prev,
                        onlineUsers: newOnlineUsers,
                    };
                });
                onUserOffline?.(event.data.userId);
            });

            // Conversation handlers
            socket.on('conversation_created', (event: ConversationCreatedEvent) => {
                console.log('New conversation created:', event.data);
                setState(prev => ({
                    ...prev,
                    conversations: [event.data, ...prev.conversations],
                }));
            });

            // Error handler
            socket.on('error', (event: ErrorEvent) => {
                console.error('Socket error:', event.data);
                const errorMessage = event.data.message || 'An error occurred';
                setState(prev => ({ ...prev, error: errorMessage }));
                onError?.(errorMessage);
            });

        } catch (error) {
            console.error('Failed to create socket connection:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: errorMessage
            }));
            onError?.(errorMessage);
        }
    }, [serverUrl, onError, onMessageReceived, onUserOnline, onUserOffline]);

    // Disconnect from the WebSocket server
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setState(prev => ({
                ...prev,
                isConnected: false,
                isConnecting: false
            }));
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(async (data: SendMessageData) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to chat server');
        }

        const messageData = {
            content: data.content,
            receiverId: data.receiverId,
            conversationId: data.conversationId,
            messageType: data.messageType || MessageType.TEXT,
            replyToId: data.replyToId,
            metadata: data.metadata,
        };

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('send_message', messageData, (response: any) => {
                if (response?.success) {
                    resolve();
                } else {
                    reject(new Error(response?.error || 'Failed to send message'));
                }
            });
        });
    }, []);

    // Mark message as read
    const markMessageAsRead = useCallback(async (data: MarkMessageAsReadData) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to chat server');
        }

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('mark_message_read', data, (response: any) => {
                if (response?.success) {
                    resolve();
                } else {
                    reject(new Error(response?.error || 'Failed to mark message as read'));
                }
            });
        });
    }, []);

    // Set typing indicator
    const setTyping = useCallback(async (data: TypingIndicatorData) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to chat server');
        }

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('typing_indicator', data, (response: any) => {
                if (response?.success) {
                    resolve();
                } else {
                    reject(new Error(response?.error || 'Failed to set typing indicator'));
                }
            });
        });
    }, []);

    // Join a conversation
    const joinConversation = useCallback(async (conversationId: string) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to chat server');
        }

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('join_conversation', { conversationId }, (response: any) => {
                if (response?.success) {
                    resolve();
                } else {
                    reject(new Error(response?.error || 'Failed to join conversation'));
                }
            });
        });
    }, []);

    // Leave a conversation
    const leaveConversation = useCallback(async (conversationId: string) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to chat server');
        }

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('leave_conversation', { conversationId }, (response: any) => {
                if (response?.success) {
                    resolve();
                } else {
                    reject(new Error(response?.error || 'Failed to leave conversation'));
                }
            });
        });
    }, []);

    // Set current conversation
    const setCurrentConversation = useCallback((conversation: Conversation | null) => {
        setState(prev => ({ ...prev, currentConversation: conversation }));
    }, []);

    // Load messages for a conversation (this would typically call your REST API)
    const loadMessages = useCallback(async (
        conversationId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<Message[]> => {
        // This would typically make an HTTP request to your REST API
        // For now, return empty array - implement based on your API
        console.log(`Loading messages for conversation ${conversationId}, limit: ${limit}, offset: ${offset}`);
        return [];
    }, []);

    // Auto-connect if enabled
    useEffect(() => {
        if (autoConnect && !socketRef.current) {
            // You would need to provide a token here
            // connect('your-jwt-token');
        }
    }, [autoConnect, connect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const actions: ChatActions = {
        connect,
        disconnect,
        sendMessage,
        markMessageAsRead,
        setTyping,
        joinConversation,
        leaveConversation,
        setCurrentConversation,
        loadMessages,
    };

    return {
        ...state,
        ...actions,
    };
};
