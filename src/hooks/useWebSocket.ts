import { useEffect, useCallback } from "react";
import { chatService } from "../services/websocketService";
import { useAuthStore } from "../stores/authStore";
import { chatKeys } from "./useChat";
import { Conversation, Message, WebSocketEvent } from "../types";
import { queryClient } from "../lib/queryClient";

// WebSocket integration with React Query
export function useWebSocketIntegration() {
  const { user, isAuthenticated } = useAuthStore();

  // Handle message received event
  const handleMessageReceived = useCallback((event: WebSocketEvent) => {
    const message: Message = event.data;

    // Add message to the appropriate conversation's messages
    queryClient.setQueriesData(
      { queryKey: chatKeys.messagesList(message.conversationId) },
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: Message[], index: number) => {
            if (index === 0) {
              // Check if message already exists to avoid duplicates
              const exists = page.some((m) => m.id === message.id);
              if (!exists) {
                return [message, ...page];
              }
            }
            return page;
          }),
        };
      },
    );

    // Update conversation's last message and unread count
    queryClient.setQueryData(
      chatKeys.conversations(),
      (old: Conversation[] | undefined) => {
        if (!old) return old;
        return old.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + 1,
                updatedAt: message.createdAt,
              }
            : conv,
        );
      },
    );

    // Update unread count
    queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
  }, []);

  // Handle message read event
  const handleMessageRead = useCallback((event: WebSocketEvent) => {
    const { messageId, conversationId } = event.data;

    // Update message read status
    queryClient.setQueriesData(
      { queryKey: chatKeys.messagesList(conversationId) },
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    isRead: true,
                    readAt: event.timestamp,
                    status: "read" as const,
                  }
                : msg,
            ),
          ),
        };
      },
    );

    // Update conversation unread count
    queryClient.setQueryData(
      chatKeys.conversations(),
      (old: Conversation[] | undefined) => {
        if (!old) return old;
        return old.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                unreadCount: Math.max(0, conv.unreadCount - 1),
              }
            : conv,
        );
      },
    );
  }, []);

  // Handle message delivered event
  const handleMessageDelivered = useCallback((event: WebSocketEvent) => {
    const { messageId, conversationId } = event.data;

    // Update message delivery status
    queryClient.setQueriesData(
      { queryKey: chatKeys.messagesList(conversationId) },
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    isDelivered: true,
                    deliveredAt: event.timestamp,
                    status: "delivered" as const,
                  }
                : msg,
            ),
          ),
        };
      },
    );
  }, []);

  // Handle conversation created event
  const handleConversationCreated = useCallback((event: WebSocketEvent) => {
    const conversation: Conversation = event.data;

    // Add new conversation to the list
    queryClient.setQueryData(
      chatKeys.conversations(),
      (old: Conversation[] | undefined) => {
        if (!old) return [conversation];

        const exists = old.some((conv) => conv.id === conversation.id);
        if (!exists) {
          return [conversation, ...old];
        }

        return old;
      },
    );

    // Cache the individual conversation
    queryClient.setQueryData(
      chatKeys.conversation(conversation.id),
      conversation,
    );
  }, []);

  // Handle message reaction added event
  const handleMessageReactionAdded = useCallback((event: WebSocketEvent) => {
    const { messageId, reaction, conversationId } = event.data;

    // Add reaction to message
    queryClient.setQueriesData(
      { queryKey: chatKeys.messagesList(conversationId) },
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reactions: [...msg.reactions, reaction],
                  }
                : msg,
            ),
          ),
        };
      },
    );
  }, []);

  // Handle message reaction removed event
  const handleMessageReactionRemoved = useCallback((event: WebSocketEvent) => {
    const { messageId, reactionId, conversationId } = event.data;

    // Remove reaction from message
    queryClient.setQueriesData(
      { queryKey: chatKeys.messagesList(conversationId) },
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reactions: msg.reactions.filter((r) => r.id !== reactionId),
                  }
                : msg,
            ),
          ),
        };
      },
    );
  }, []);

  // Handle typing indicators
  const handleTypingStart = useCallback((event: WebSocketEvent) => {
    const { conversationId, userId } = event.data;

    // Update conversation with typing indicator
    queryClient.setQueryData(
      chatKeys.conversation(conversationId),
      (old: Conversation | undefined) => {
        if (!old) return old;

        const typingUsers = old.typingUsers || [];
        if (!typingUsers.includes(userId)) {
          return {
            ...old,
            typingUsers: [...typingUsers, userId],
          };
        }
        return old;
      },
    );
  }, []);

  const handleTypingStop = useCallback((event: WebSocketEvent) => {
    const { conversationId, userId } = event.data;

    // Remove typing indicator from conversation
    queryClient.setQueryData(
      chatKeys.conversation(conversationId),
      (old: Conversation | undefined) => {
        if (!old) return old;

        const typingUsers = old.typingUsers || [];
        return {
          ...old,
          typingUsers: typingUsers.filter((id) => id !== userId),
        };
      },
    );
  }, []);

  // Handle user online/offline events
  const handleUserOnline = useCallback((event: WebSocketEvent) => {
    const { userId, isOnline, lastSeen } = event.data;

    // Update user online status in conversations
    queryClient.setQueryData(
      chatKeys.conversations(),
      (old: Conversation[] | undefined) => {
        if (!old) return old;

        return old.map((conv) => ({
          ...conv,
          participants: conv.participants.map((participant) =>
            participant.id === userId
              ? { ...participant, isOnline, lastSeen }
              : participant,
          ),
        }));
      },
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        await chatService.connect(user.id);
        console.log("WebSocket connected for user:", user.id);
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    };

    connectWebSocket();

    // Subscribe to WebSocket events
    chatService.on("message_received", handleMessageReceived);
    chatService.on("message_read", handleMessageRead);
    chatService.on("message_delivered", handleMessageDelivered);
    chatService.on("conversation_created", handleConversationCreated);
    chatService.on("message_reaction_added", handleMessageReactionAdded);
    chatService.on("message_reaction_removed", handleMessageReactionRemoved);
    chatService.on("typing_start", handleTypingStart);
    chatService.on("typing_stop", handleTypingStop);
    chatService.on("user_online", handleUserOnline);

    // Cleanup on unmount
    return () => {
      chatService.off("message_received", handleMessageReceived);
      chatService.off("message_read", handleMessageRead);
      chatService.off("message_delivered", handleMessageDelivered);
      chatService.off("conversation_created", handleConversationCreated);
      chatService.off("message_reaction_added", handleMessageReactionAdded);
      chatService.off("message_reaction_removed", handleMessageReactionRemoved);
      chatService.off("typing_start", handleTypingStart);
      chatService.off("typing_stop", handleTypingStop);
      chatService.off("user_online", handleUserOnline);

      chatService.disconnect();
    };
  }, [
    isAuthenticated,
    user,
    handleMessageReceived,
    handleMessageRead,
    handleMessageDelivered,
    handleConversationCreated,
    handleMessageReactionAdded,
    handleMessageReactionRemoved,
    handleTypingStart,
    handleTypingStop,
    handleUserOnline,
  ]);

  return {
    isConnected: chatService.isConnected,
    connectionState: chatService.connectionState,
    sendTypingIndicator: (conversationId: string, isTyping: boolean) =>
      chatService.sendTypingIndicator(conversationId, isTyping),
    joinConversation: (conversationId: string) =>
      chatService.joinConversation(conversationId),
    leaveConversation: (conversationId: string) =>
      chatService.leaveConversation(conversationId),
  };
}
