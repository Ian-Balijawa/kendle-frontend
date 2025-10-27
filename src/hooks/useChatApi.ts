import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateConversationRequest,
  UpdateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  MessageResponse,
  ConversationResponse,
  PaginationParams,
} from "../types/chat";

// Mock API service - replace with your actual API service
const API_BASE_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8084/api';

const apiService = {
  // Conversation operations
  getConversations: async (): Promise<ConversationResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  },

  getConversation: async (id: string): Promise<ConversationResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch conversation');
    return response.json();
  },

  createConversation: async (data: CreateConversationRequest): Promise<ConversationResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  },

  updateConversation: async (id: string, data: UpdateConversationRequest): Promise<ConversationResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    return response.json();
  },

  findOrCreateDirectConversation: async (participantId: string): Promise<ConversationResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ participantId })
    });
    if (!response.ok) throw new Error('Failed to create direct conversation');
    return response.json();
  },

  // Message operations
  getMessages: async (conversationId: string, params: PaginationParams = {}): Promise<MessageResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<MessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  updateMessage: async (messageId: string, data: UpdateMessageRequest): Promise<MessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update message');
    return response.json();
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to delete message');
  },

  markMessageAsRead: async (messageId: string): Promise<MessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return response.json();
  },

  markConversationAsRead: async (conversationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to mark conversation as read');
  },

  addMessageReaction: async (messageId: string, data: AddReactionRequest): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add reaction');
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await fetch(`${API_BASE_URL}/chat/unread-count`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
  },
};

// Query keys for chat operations
export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversation: (id: string) => [...chatKeys.conversations(), id] as const,
  messages: (conversationId: string) => [...chatKeys.all, "messages", conversationId] as const,
  unreadCount: () => [...chatKeys.all, "unreadCount"] as const,
};

// Hook to get all conversations
export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => apiService.getConversations(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to get a specific conversation
export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: () => apiService.getConversation(id),
    enabled: !!id,
  });
}

// Hook to get messages for a conversation with infinite scroll
export function useInfiniteMessages(conversationId: string, params: PaginationParams = {}) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam = 0 }) =>
      apiService.getMessages(conversationId, { ...params, offset: pageParam }),
    getNextPageParam: (lastPage: MessageResponse[], allPages: MessageResponse[][]) => {
      if (lastPage.length < (params.limit || 20)) {
        return undefined;
      }
      return allPages.length * (params.limit || 20);
    },
    initialPageParam: 0,
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Hook to get messages for a conversation (regular query)
export function useMessages(conversationId: string, params: PaginationParams = {}) {
  return useQuery({
    queryKey: [...chatKeys.messages(conversationId), params],
    queryFn: () => apiService.getMessages(conversationId, params),
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Hook to get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => apiService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Mutation to create a conversation
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => apiService.createConversation(data),
    onSuccess: (newConversation) => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      // Add the new conversation to the cache
      queryClient.setQueryData(chatKeys.conversation(newConversation.id), newConversation);
    },
  });
}

// Mutation to update a conversation
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationRequest }) =>
      apiService.updateConversation(id, data),
    onSuccess: (updatedConversation) => {
      // Update the specific conversation in cache
      queryClient.setQueryData(chatKeys.conversation(updatedConversation.id), updatedConversation);
      // Invalidate conversations list to ensure consistency
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Mutation to find or create direct conversation
export function useFindOrCreateDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: string) => apiService.findOrCreateDirectConversation(participantId),
    onSuccess: (conversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      // Add the conversation to cache
      queryClient.setQueryData(chatKeys.conversation(conversation.id), conversation);
    },
  });
}

// Mutation to send a message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) =>
      apiService.sendMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

// Mutation to update a message
export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      apiService.updateMessage(id, data),
    onSuccess: (updatedMessage) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(updatedMessage.conversationId) });
    },
  });
}

// Mutation to delete a message
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => apiService.deleteMessage(messageId),
    onSuccess: () => {
      // We need to find which conversation this message belongs to
      // For now, invalidate all message queries
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

// Mutation to mark message as read
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => apiService.markMessageAsRead(messageId),
    onSuccess: (updatedMessage) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(updatedMessage.conversationId) });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

// Mutation to mark conversation as read
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => apiService.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      // Invalidate conversations to update unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

// Mutation to add reaction to message
export function useAddMessageReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: AddReactionRequest }) =>
      apiService.addMessageReaction(messageId, data),
    onSuccess: () => {
      // Invalidate all message queries to update reactions
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

// Combined hook for chat operations (backward compatibility)
export function useChatApi() {
  const conversations = useConversations();
  const unreadCount = useUnreadCount();

  const createConversation = useCreateConversation();
  const updateConversation = useUpdateConversation();
  const findOrCreateDirectConversation = useFindOrCreateDirectConversation();

  const sendMessage = useSendMessage();
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();
  const markMessageAsRead = useMarkMessageAsRead();
  const markConversationAsRead = useMarkConversationAsRead();
  const addReaction = useAddMessageReaction();

  return {
    // State
    conversations: conversations.data || [],
    unreadCount: unreadCount.data?.count || 0,
    isLoading: conversations.isLoading || unreadCount.isLoading,
    error: conversations.error || unreadCount.error,

    // Actions
    createConversation: createConversation.mutateAsync,
    updateConversation: ({ id, data }: { id: string; data: UpdateConversationRequest }) =>
      updateConversation.mutateAsync({ id, data }),
    findOrCreateDirectConversation: findOrCreateDirectConversation.mutateAsync,

    sendMessage: ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) =>
      sendMessage.mutateAsync({ conversationId, data }),
    updateMessage: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      updateMessage.mutateAsync({ id, data }),
    deleteMessage: deleteMessage.mutateAsync,
    markMessageAsRead: markMessageAsRead.mutateAsync,
    markConversationAsRead: markConversationAsRead.mutateAsync,
    addReaction: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      addReaction.mutateAsync({ messageId, data: { emoji, messageId } }),

    // Utility functions
    refreshConversations: () => conversations.refetch(),
    refreshUnreadCount: () => unreadCount.refetch(),
  };
}
