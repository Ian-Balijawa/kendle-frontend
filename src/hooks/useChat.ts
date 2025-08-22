import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  apiService,
  CreateConversationRequest,
  UpdateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  GetMessagesParams,
} from "../services/api";
import { Conversation, Message } from "../types";
import { useAuthStore } from "../stores/authStore";
import { queryClient } from "../lib/queryClient";

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversation: (id: string) => [...chatKeys.all, "conversation", id] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
  messagesList: (conversationId: string, params?: GetMessagesParams) =>
    [...chatKeys.messages(conversationId), "list", params] as const,
  unreadCount: () => [...chatKeys.all, "unreadCount"] as const,
};

// Get all conversations
export function useConversations() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => apiService.getConversations(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

// Get single conversation
export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: () => apiService.getConversation(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get messages for a conversation with infinite scroll
export function useInfiniteMessages(
  conversationId: string,
  params: GetMessagesParams = {},
) {
  return useInfiniteQuery({
    queryKey: chatKeys.messagesList(conversationId, params),
    queryFn: ({ pageParam = 0 }) =>
      apiService.getMessages(conversationId, { ...params, offset: pageParam }),
    getNextPageParam: (lastPage: Message[], allPages) => {
      // If we got fewer messages than the limit, we've reached the end
      const limit = params.limit || 20;
      if (lastPage.length < limit) {
        return undefined;
      }
      // Return the offset for the next page
      return allPages.length * limit;
    },
    initialPageParam: 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => page.reverse()), // Reverse each page to show newest first
    }),
  });
}

// Get unread count
export function useUnreadCount() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => apiService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Create conversation mutation
export function useCreateConversation() {
  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      apiService.createConversation(data),
    onMutate: async (newConversation) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

      // Create optimistic conversation
      const optimisticConversation: Conversation = {
        id: `temp-${Date.now()}`,
        type: newConversation.participantIds.length > 1 ? "group" : "direct",
        name: newConversation.name,
        description: newConversation.description,
        participants: [], // Would be populated with actual user data
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return [optimisticConversation];
          return [optimisticConversation, ...old];
        },
      );

      return { optimisticConversation };
    },
    onError: (_err, _newConversation, context) => {
      // Revert the optimistic update
      if (context?.optimisticConversation) {
        queryClient.setQueryData(
          chatKeys.conversations(),
          (old: Conversation[] | undefined) => {
            if (!old) return old;
            return old.filter(
              (conv) => conv.id !== context.optimisticConversation.id,
            );
          },
        );
      }
    },
    onSuccess: (newConversation, _variables, context) => {
      // Replace the optimistic conversation with the real one
      if (context?.optimisticConversation) {
        queryClient.setQueryData(
          chatKeys.conversations(),
          (old: Conversation[] | undefined) => {
            if (!old) return old;
            return old.map((conv) =>
              conv.id === context.optimisticConversation.id
                ? newConversation
                : conv,
            );
          },
        );
      }

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Update conversation mutation
export function useUpdateConversation() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateConversationRequest;
    }) => apiService.updateConversation(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.conversation(id) });
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

      // Snapshot the previous value
      const previousConversation = queryClient.getQueryData(
        chatKeys.conversation(id),
      );

      // Optimistically update the single conversation
      queryClient.setQueryData(
        chatKeys.conversation(id),
        (old: Conversation | undefined) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        },
      );

      // Optimistically update in conversations list
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === id
              ? { ...conv, ...data, updatedAt: new Date().toISOString() }
              : conv,
          );
        },
      );

      return { previousConversation };
    },
    onError: (_err, { id }, context) => {
      // Revert the optimistic updates
      if (context?.previousConversation) {
        queryClient.setQueryData(
          chatKeys.conversation(id),
          context.previousConversation,
        );
      }
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onSuccess: (updatedConversation, { id }) => {
      // Update the cache with the server response
      queryClient.setQueryData(chatKeys.conversation(id), updatedConversation);
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Send message mutation
export function useSendMessage() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: SendMessageRequest;
    }) => apiService.sendMessage(conversationId, data),
    onMutate: async ({ conversationId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: chatKeys.messagesList(conversationId),
      });
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: data.content,
        messageType: data.messageType || "text",
        status: "sending",
        senderId: user!.id,
        receiverId: data.receiverId,
        conversationId: data.conversationId,
        isRead: false,
        isDelivered: false,
        isEdited: false,
        replyToId: data.replyToId,
        metadata: data.metadata,
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update messages list
      queryClient.setQueriesData(
        { queryKey: chatKeys.messagesList(conversationId) },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: Message[], index: number) => {
              if (index === 0) {
                return [optimisticMessage, ...page];
              }
              return page;
            }),
          };
        },
      );

      // Update conversation's last message
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: optimisticMessage,
                  updatedAt: new Date().toISOString(),
                }
              : conv,
          );
        },
      );

      return { optimisticMessage };
    },
    onError: (_err, { conversationId }, context) => {
      // Update the optimistic message status to failed
      if (context?.optimisticMessage) {
        queryClient.setQueriesData(
          { queryKey: chatKeys.messagesList(conversationId) },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map((msg) =>
                  msg.id === context.optimisticMessage.id
                    ? { ...msg, status: "failed" as const }
                    : msg,
                ),
              ),
            };
          },
        );
      }
    },
    onSuccess: (newMessage, { conversationId }, context) => {
      // Replace the optimistic message with the real one
      if (context?.optimisticMessage) {
        queryClient.setQueriesData(
          { queryKey: chatKeys.messagesList(conversationId) },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map((msg) =>
                  msg.id === context.optimisticMessage.id ? newMessage : msg,
                ),
              ),
            };
          },
        );
      }

      // Update conversation's last message
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: newMessage,
                  updatedAt: newMessage.createdAt,
                }
              : conv,
          );
        },
      );

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

// Update message mutation
export function useUpdateMessage() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      apiService.updateMessage(id, data),
    onMutate: async ({ id, data }) => {
      // Find and update the message optimistically
      queryClient.setQueriesData({ queryKey: chatKeys.all }, (old: any) => {
        if (!old) return old;

        // Handle infinite query structure
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: Message[]) =>
              page.map((msg) =>
                msg.id === id
                  ? {
                      ...msg,
                      ...data,
                      isEdited: true,
                      editedAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                  : msg,
              ),
            ),
          };
        }

        return old;
      });
    },
    onError: (_err, _id) => {
      // Invalidate all message queries to revert changes
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onSuccess: (updatedMessage) => {
      // Update the cache with the server response
      queryClient.setQueriesData({ queryKey: chatKeys.all }, (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: Message[]) =>
              page.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg,
              ),
            ),
          };
        }

        return old;
      });
    },
  });
}

// Delete message mutation
export function useDeleteMessage() {
  return useMutation({
    mutationFn: (id: string) => apiService.deleteMessage(id),
    onMutate: async (id) => {
      // Find the message to get its conversation ID
      let conversationId: string | null = null;
      const messageQueries = queryClient.getQueriesData({
        queryKey: chatKeys.all,
      });

      for (const [_queryKey, data] of messageQueries) {
        if (data && typeof data === "object") {
          const queryData = data as any;
          const pages = queryData.pages || [queryData];

          for (const page of pages) {
            if (Array.isArray(page)) {
              const message = page.find((m: Message) => m.id === id);
              if (message) {
                conversationId = message.conversationId;
                break;
              }
            }
          }
          if (conversationId) break;
        }
      }

      // Optimistically remove the message
      queryClient.setQueriesData({ queryKey: chatKeys.all }, (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: Message[]) =>
              page.filter((msg) => msg.id !== id),
            ),
          };
        }

        return old;
      });

      return { conversationId };
    },
    onError: (_err, _id, _context) => {
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onSuccess: (_, _id, context) => {
      // Invalidate related queries
      if (context?.conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(context.conversationId),
        });
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      }
    },
  });
}

// Mark message as read mutation
export function useMarkMessageAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiService.markMessageAsRead(id),
    onMutate: async (id) => {
      // Optimistically update message read status
      queryClient.setQueriesData({ queryKey: chatKeys.all }, (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: Message[]) =>
              page.map((msg) =>
                msg.id === id
                  ? {
                      ...msg,
                      isRead: true,
                      readAt: new Date().toISOString(),
                      status: "read" as const,
                    }
                  : msg,
              ),
            ),
          };
        }

        return old;
      });
    },
    onError: (_err, _id, _context) => {
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onSuccess: () => {
      // Update unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Mark conversation as read mutation
export function useMarkConversationAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiService.markConversationAsRead(id),
    onMutate: async (id) => {
      // Optimistically update conversation unread count
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === id ? { ...conv, unreadCount: 0 } : conv,
          );
        },
      );

      // Mark all messages in the conversation as read
      queryClient.setQueriesData(
        { queryKey: chatKeys.messages(id) },
        (old: any) => {
          if (!old) return old;

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map((msg) => ({
                  ...msg,
                  isRead: true,
                  readAt: new Date().toISOString(),
                  status: "read" as const,
                })),
              ),
            };
          }

          return old;
        },
      );
    },
    onError: (_err, id, _context) => {
      // Revert the optimistic updates
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(id) });
    },
    onSuccess: () => {
      // Update unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

// Add message reaction mutation
export function useAddMessageReaction() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddReactionRequest }) =>
      apiService.addMessageReaction(id, data),
    onMutate: async ({ id, data }) => {
      // Create optimistic reaction
      const optimisticReaction = {
        id: `temp-${Date.now()}`,
        userId: user!.id,
        messageId: id,
        emoji: data.emoji,
        createdAt: new Date().toISOString(),
        user: user!,
      };

      // Optimistically update message reactions
      queryClient.setQueriesData({ queryKey: chatKeys.all }, (old: any) => {
        if (!old) return old;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: Message[]) =>
              page.map((msg) =>
                msg.id === id
                  ? {
                      ...msg,
                      reactions: [...msg.reactions, optimisticReaction],
                    }
                  : msg,
              ),
            ),
          };
        }

        return old;
      });

      return { optimisticReaction };
    },
    onError: (_err, { id }, context) => {
      // Remove the optimistic reaction
      if (context?.optimisticReaction) {
        queryClient.setQueriesData({ queryKey: chatKeys.all }, (old: any) => {
          if (!old) return old;

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map((msg) =>
                  msg.id === id
                    ? {
                        ...msg,
                        reactions: msg.reactions.filter(
                          (r) => r.id !== context.optimisticReaction.id,
                        ),
                      }
                    : msg,
                ),
              ),
            };
          }

          return old;
        });
      }
    },
  });
}

// Find or create direct conversation mutation
export function useFindOrCreateDirectConversation() {
  return useMutation({
    mutationFn: (participantId: string) =>
      apiService.findOrCreateDirectConversation(participantId),
    onSuccess: (conversation) => {
      // Add the conversation to the cache if it's new
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return [conversation];

          const exists = old.some((conv) => conv.id === conversation.id);
          if (exists) {
            return old.map((conv) =>
              conv.id === conversation.id ? conversation : conv,
            );
          }

          return [conversation, ...old];
        },
      );

      // Cache the individual conversation
      queryClient.setQueryData(
        chatKeys.conversation(conversation.id),
        conversation,
      );
    },
  });
}
