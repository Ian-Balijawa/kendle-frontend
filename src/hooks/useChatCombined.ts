import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatApi, chatKeys } from './useChatApi';
import { useChatSocket } from './useChatSocket';
import { SendMessageData } from '../types/chat';

interface UseChatCombinedOptions {
  token: string;
  serverUrl?: string;
  autoConnect?: boolean;
}

// Combined hook that uses both API and WebSocket functionality
export const useChatCombined = (options: UseChatCombinedOptions = { token: '', autoConnect: false }) => {
  const { token, serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8084', autoConnect = false } = options;
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // API Hook for REST operations
  const api = useChatApi();

  // WebSocket Hook for real-time operations
  const socket = useChatSocket({
    serverUrl,
    token: token as string,
    autoConnect,
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    onMessageReceived: (message) => {
      // Invalidate relevant queries when a message is received via WebSocket
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(message.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
    onUserOnline: (userId) => {
      console.log(`User ${userId} is now online`);
    },
    onUserOffline: (userId) => {
      console.log(`User ${userId} is now offline`);
    },
  });

  // Initialize the chat system
  const initialize = useCallback(() => {
    if (!token) {
      throw new Error('Token is required for initialization');
    }

    try {
      // Connect to WebSocket
      socket.connect(token);

      // The API hooks will automatically load data when components mount
      // No need to manually call API methods since React Query handles this
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      throw error;
    }
  }, [socket, token]);

  // Send message using the best available method
  const sendMessage = useCallback(async (data: SendMessageData) => {
    // Prefer WebSocket for real-time sending, fallback to API
    if (socket.isConnected) {
      return socket.sendMessage(data);
    } else {
      // Fallback to API
      const apiData = {
        content: data.content,
        receiverId: data.receiverId,
        conversationId: data.conversationId,
        messageType: data.messageType,
        replyToId: data.replyToId,
        metadata: data.metadata,
      };
      return api.sendMessage({ conversationId: data.conversationId, data: apiData });
    }
  }, [socket, api]);

  // Mark message as read using the best available method
  const markMessageAsRead = useCallback(async (messageId: string, conversationId: string) => {
    if (socket.isConnected) {
      return socket.markMessageAsRead({ messageId, conversationId });
    } else {
      return api.markMessageAsRead(messageId);
    }
  }, [socket, api]);

  // Set typing indicator (WebSocket only)
  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (socket.isConnected) {
      return socket.setTyping({ conversationId, isTyping });
    }
  }, [socket]);

  // Join conversation (WebSocket only)
  const joinConversation = useCallback(async (conversationId: string) => {
    if (socket.isConnected) {
      return socket.joinConversation(conversationId);
    }
  }, [socket]);

  // Leave conversation (WebSocket only)
  const leaveConversation = useCallback(async (conversationId: string) => {
    if (socket.isConnected) {
      return socket.leaveConversation(conversationId);
    }
  }, [socket]);

  // Cleanup function
  const cleanup = useCallback(() => {
    socket.disconnect();
    setIsInitialized(false);
  }, [socket]);

  // Auto-initialize when token is available and autoConnect is enabled
  useEffect(() => {
    if (autoConnect && token && !isInitialized) {
      initialize();
    }
  }, [autoConnect, token, isInitialized, initialize]);

  return {
    // State
    isInitialized,
    isConnected: socket.isConnected,
    isLoading: api.isLoading || socket.isConnecting,
    error: api.error || socket.error,

    // Data
    conversations: api.conversations,
    unreadCount: api.unreadCount,
    typingUsers: socket.typingUsers,
    onlineUsers: socket.onlineUsers,

    // Actions
    initialize,
    cleanup,

    // Message operations
    sendMessage,
    markMessageAsRead,
    setTyping,

    // Conversation operations
    joinConversation,
    leaveConversation,

    // API operations (using new React Query-based hooks)
    createConversation: api.createConversation,
    updateConversation: api.updateConversation,
    findOrCreateDirectConversation: api.findOrCreateDirectConversation,
    updateMessage: api.updateMessage,
    deleteMessage: api.deleteMessage,
    markConversationAsRead: api.markConversationAsRead,
    addReaction: api.addReaction,
    refreshConversations: api.refreshConversations,
    refreshUnreadCount: api.refreshUnreadCount,
  };
};
