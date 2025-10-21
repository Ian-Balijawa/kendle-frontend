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

export function useConversations() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => apiService.getConversations(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: () => apiService.getConversation(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInfiniteMessages(
  conversationId: string,
  params: GetMessagesParams = {},
) {
  return useInfiniteQuery({
    queryKey: chatKeys.messagesList(conversationId, params),
    queryFn: ({ pageParam = 0 }) =>
      apiService.getMessages(conversationId, { ...params, offset: pageParam }),
    getNextPageParam: (lastPage: Message[], allPages) => {
      const limit = params.limit || 20;
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length * limit;
    },
    initialPageParam: 0,
    staleTime: 1 * 60 * 1000,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => page.reverse()),
    }),
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => apiService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      apiService.createConversation(data),
    onMutate: async (newConversation) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

      const optimisticConversation: Conversation = {
        id: `temp-${Date.now()}`,
        type: newConversation.participantIds.length > 1 ? "group" : "direct",
        name: newConversation.name,
        description: newConversation.description,
        participants: [],
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

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
      await queryClient.cancelQueries({ queryKey: chatKeys.conversation(id) });
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

      const previousConversation = queryClient.getQueryData(
        chatKeys.conversation(id),
      );

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
      if (context?.previousConversation) {
        queryClient.setQueryData(
          chatKeys.conversation(id),
          context.previousConversation,
        );
      }
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onSuccess: (updatedConversation, { id }) => {
      queryClient.setQueryData(chatKeys.conversation(id), updatedConversation);
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

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
      await queryClient.cancelQueries({
        queryKey: chatKeys.messagesList(conversationId),
      });
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

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

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

export function useUpdateMessage() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      apiService.updateMessage(id, data),
    onMutate: async ({ id, data }) => {
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
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onSuccess: (updatedMessage) => {          
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

export function useDeleteMessage() {
  return useMutation({
    mutationFn: (id: string) => apiService.deleteMessage(id),
    onMutate: async (id) => {
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
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onSuccess: (_, _id, context) => {
      if (context?.conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(context.conversationId),
        });
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      }
    },
  });
}

export function useMarkMessageAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiService.markMessageAsRead(id),
    onMutate: async (id) => {
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
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

export function useMarkConversationAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiService.markConversationAsRead(id),
    onMutate: async (id) => {
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === id ? { ...conv, unreadCount: 0 } : conv,
          );
        },
      );

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
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(id) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

export function useAddMessageReaction() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddReactionRequest }) =>
      apiService.addMessageReaction(id, data),
    onMutate: async ({ id, data }) => {
      const optimisticReaction = {
        id: `temp-${Date.now()}`,
        userId: user!.id,
        messageId: id,
        emoji: data.emoji,
        createdAt: new Date().toISOString(),
        user: user!,
      };

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

export function useFindOrCreateDirectConversation() {
  return useMutation({
    mutationFn: (participantId: string) =>
      apiService.findOrCreateDirectConversation(participantId),
    onSuccess: (conversation) => {
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

      queryClient.setQueryData(
        chatKeys.conversation(conversation.id),
        conversation,
      );
    },
  });
}
