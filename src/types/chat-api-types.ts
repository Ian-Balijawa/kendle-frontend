// TypeScript interfaces for the chat REST API
// Copy these types to your React frontend project

import { MessageType, MessageStatus, ConversationType } from '../types/chat';

// Request DTOs
export interface CreateConversationRequest {
    participantIds: string[];
    name?: string;
    description?: string;
}

export interface SendMessageRequest {
    content: string;
    receiverId: string;
    conversationId: string;
    messageType?: MessageType;
    replyToId?: string;
    metadata?: Record<string, any>;
}

export interface UpdateMessageRequest {
    content: string;
}

export interface AddReactionRequest {
    emoji: string;
    messageId: string;
}

export interface UpdateConversationRequest {
    isArchived?: boolean;
    isMuted?: boolean;
    isPinned?: boolean;
    name?: string;
    description?: string;
}

export interface CreateDirectConversationRequest {
    participantId: string;
}

// Response DTOs
export interface ConversationResponse {
    id: string;
    type: ConversationType;
    name?: string;
    avatar?: string;
    description?: string;
    participants: Array<{
        id: string;
        phoneNumber: string;
        username: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        isVerified: boolean;
        isProfileComplete: boolean;
        createdAt: string;
        updatedAt: string;
        followersCount: number;
        followingCount: number;
        postsCount: number;
    }>;
    lastMessage?: MessageResponse;
    unreadCount: number;
    isArchived: boolean;
    isMuted: boolean;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MessageResponse {
    id: string;
    content: string;
    messageType: MessageType;
    status: MessageStatus;
    senderId: string;
    receiverId: string;
    conversationId: string;
    isRead: boolean;
    isDelivered: boolean;
    isEdited: boolean;
    editedAt?: string;
    readAt?: string;
    deliveredAt?: string;
    replyToId?: string;
    metadata?: Record<string, any>;
    reactions: Array<{
        id: string;
        emoji: string;
        userId: string;
        createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface UnreadCountResponse {
    count: number;
}

// API Error Response
export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp: string;
    path: string;
}

// Pagination
export interface PaginationParams {
    limit?: number;
    offset?: number;
}

// API Hook State
export interface ChatApiState {
    isLoading: boolean;
    error: string | null;
    conversations: ConversationResponse[];
    currentConversation: ConversationResponse | null;
    messages: MessageResponse[];
    unreadCount: number;
}

// API Actions
export interface ChatApiActions {
    // Conversation operations
    createConversation: (data: CreateConversationRequest) => Promise<ConversationResponse>;
    getUserConversations: () => Promise<ConversationResponse[]>;
    getConversationById: (id: string) => Promise<ConversationResponse>;
    updateConversation: (id: string, data: UpdateConversationRequest) => Promise<ConversationResponse>;
    findOrCreateDirectConversation: (participantId: string) => Promise<ConversationResponse>;

    // Message operations
    sendMessage: (conversationId: string, data: SendMessageRequest) => Promise<MessageResponse>;
    getConversationMessages: (conversationId: string, params?: PaginationParams) => Promise<MessageResponse[]>;
    updateMessage: (messageId: string, data: UpdateMessageRequest) => Promise<MessageResponse>;
    deleteMessage: (messageId: string) => Promise<void>;
    markMessageAsRead: (messageId: string) => Promise<MessageResponse>;
    markConversationAsRead: (conversationId: string) => Promise<void>;
    addReaction: (messageId: string, emoji: string) => Promise<void>;

    // Utility operations
    getUnreadCount: () => Promise<number>;
    setCurrentConversation: (conversation: ConversationResponse | null) => void;
    clearError: () => void;
    refreshConversations: () => Promise<void>;
    refreshMessages: (conversationId: string) => Promise<void>;
}

// API Configuration
export interface ChatApiConfig {
    baseUrl: string;
    token: string;
    timeout?: number;
    onError?: (error: string) => void;
    onUnauthorized?: () => void;
}
