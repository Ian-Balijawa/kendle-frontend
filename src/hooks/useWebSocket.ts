import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/websocketService';
import { useAuthStore } from '../stores/authStore';
import { chatKeys } from './useChat';
import { Conversation, Message, WebSocketEvent } from '../types';

// WebSocket integration with React Query
export function useWebSocketIntegration() {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthStore();

    useEffect( () => {
        if ( !isAuthenticated || !user ) return;

        // Connect to WebSocket
        const connectWebSocket = async () => {
            try {
                await chatService.connect( user.id );
                console.log( 'WebSocket connected for user:', user.id );
            } catch ( error ) {
                console.error( 'Failed to connect WebSocket:', error );
            }
        };

        connectWebSocket();

        // Set up event handlers
        const handleMessageReceived = ( event: WebSocketEvent ) => {
            const message: Message = event.data;

            // Add message to the appropriate conversation's messages
            queryClient.setQueriesData(
                { queryKey: chatKeys.messagesList( message.conversationId ) },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: Message[], index: number ) => {
                            if ( index === 0 ) {
                                // Check if message already exists to avoid duplicates
                                const exists = page.some( m => m.id === message.id );
                                if ( !exists ) {
                                    return [message, ...page];
                                }
                            }
                            return page;
                        } ),
                    };
                }
            );

            // Update conversation's last message and unread count
            queryClient.setQueryData( chatKeys.conversations(), ( old: Conversation[] | undefined ) => {
                if ( !old ) return old;
                return old.map( conv =>
                    conv.id === message.conversationId
                        ? {
                            ...conv,
                            lastMessage: message,
                            unreadCount: conv.unreadCount + 1,
                            updatedAt: message.createdAt,
                        }
                        : conv
                );
            } );

            // Update unread count
            queryClient.invalidateQueries( { queryKey: chatKeys.unreadCount() } );
        };

        const handleMessageRead = ( event: WebSocketEvent ) => {
            const { messageId } = event.data;

            // Update message read status
            queryClient.setQueriesData(
                { queryKey: chatKeys.all },
                ( old: any ) => {
                    if ( !old ) return old;

                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: Message[] ) =>
                                page.map( msg =>
                                    msg.id === messageId
                                        ? {
                                            ...msg,
                                            isRead: true,
                                            readAt: event.timestamp,
                                            status: 'read' as const,
                                        }
                                        : msg
                                )
                            ),
                        };
                    }

                    return old;
                }
            );
        };

        const handleMessageDelivered = ( event: WebSocketEvent ) => {
            const { messageId } = event.data;

            // Update message delivery status
            queryClient.setQueriesData(
                { queryKey: chatKeys.all },
                ( old: any ) => {
                    if ( !old ) return old;

                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: Message[] ) =>
                                page.map( msg =>
                                    msg.id === messageId
                                        ? {
                                            ...msg,
                                            isDelivered: true,
                                            deliveredAt: event.timestamp,
                                            status: 'delivered' as const,
                                        }
                                        : msg
                                )
                            ),
                        };
                    }

                    return old;
                }
            );
        };

        const handleConversationCreated = ( event: WebSocketEvent ) => {
            const conversation: Conversation = event.data;

            // Add new conversation to the list
            queryClient.setQueryData( chatKeys.conversations(), ( old: Conversation[] | undefined ) => {
                if ( !old ) return [conversation];

                const exists = old.some( conv => conv.id === conversation.id );
                if ( !exists ) {
                    return [conversation, ...old];
                }

                return old;
            } );

            // Cache the individual conversation
            queryClient.setQueryData( chatKeys.conversation( conversation.id ), conversation );
        };

        const handleMessageReactionAdded = ( event: WebSocketEvent ) => {
            const { messageId, reaction } = event.data;

            // Add reaction to message
            queryClient.setQueriesData(
                { queryKey: chatKeys.all },
                ( old: any ) => {
                    if ( !old ) return old;

                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: Message[] ) =>
                                page.map( msg =>
                                    msg.id === messageId
                                        ? {
                                            ...msg,
                                            reactions: [...msg.reactions, reaction],
                                        }
                                        : msg
                                )
                            ),
                        };
                    }

                    return old;
                }
            );
        };

        const handleMessageReactionRemoved = ( event: WebSocketEvent ) => {
            const { messageId, reactionId } = event.data;

            // Remove reaction from message
            queryClient.setQueriesData(
                { queryKey: chatKeys.all },
                ( old: any ) => {
                    if ( !old ) return old;

                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: Message[] ) =>
                                page.map( msg =>
                                    msg.id === messageId
                                        ? {
                                            ...msg,
                                            reactions: msg.reactions.filter( r => r.id !== reactionId ),
                                        }
                                        : msg
                                )
                            ),
                        };
                    }

                    return old;
                }
            );
        };

        // Subscribe to WebSocket events
        chatService.on( 'message_received', handleMessageReceived );
        chatService.on( 'message_read', handleMessageRead );
        chatService.on( 'message_delivered', handleMessageDelivered );
        chatService.on( 'conversation_created', handleConversationCreated );
        chatService.on( 'message_reaction_added', handleMessageReactionAdded );
        chatService.on( 'message_reaction_removed', handleMessageReactionRemoved );

        // Cleanup on unmount
        return () => {
            chatService.off( 'message_received', handleMessageReceived );
            chatService.off( 'message_read', handleMessageRead );
            chatService.off( 'message_delivered', handleMessageDelivered );
            chatService.off( 'conversation_created', handleConversationCreated );
            chatService.off( 'message_reaction_added', handleMessageReactionAdded );
            chatService.off( 'message_reaction_removed', handleMessageReactionRemoved );

            chatService.disconnect();
        };
    }, [isAuthenticated, user, queryClient] );

    return {
        isConnected: chatService.isConnected,
        connectionState: chatService.connectionState,
    };
}
