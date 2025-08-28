import { User } from "./auth";

export interface Message {
  id: string;
  content: string;
  messageType: "text" | "image" | "video" | "audio" | "file";
  status: "sending" | "delivered" | "read" | "failed";
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
  metadata?: any;
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  mediaUrl?: string;
  mediaSize?: number;
  mediaFileName?: string;
  replyToMessage?: {
    id: string;
    content: string;
    senderId: string;
  };
}

export interface MessageReaction {
  id: string;
  userId: string;
  messageId: string;
  emoji: string;
  createdAt: string;
  user?: User; // Include user info for display
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string;
  avatar?: string;
  description?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreateConversationRequest {
  participantIds: string[];
  name?: string;
  description?: string;
}

export interface UpdateConversationRequest {
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  content: string;
  receiverId: string;
  conversationId: string;
  messageType?: "text" | "image" | "video" | "audio" | "file";
  replyToId?: string;
  metadata?: any;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface AddReactionRequest {
  emoji: string;
  messageId: string;
}

export interface GetMessagesParams {
  limit?: number;
  offset?: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface CreateMessageData {
  content: string;
  receiverId: string;
  conversationId: string;
  messageType?: "text" | "image" | "video" | "audio" | "file";
  replyToId?: string;
  metadata?: any;
  // Legacy fields for backward compatibility
  mediaFile?: File;
  replyToMessageId?: string;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

// WebSocket Event Types
export type WebSocketEventType =
  | "message_sent"
  | "message_received"
  | "message_read"
  | "message_delivered"
  | "typing_start"
  | "typing_stop"
  | "user_online"
  | "user_offline"
  | "conversation_created"
  | "message_reaction_added"
  | "message_reaction_removed"
  | "message_edited"
  | "message_deleted";

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: "sending" | "delivered" | "read" | "failed";
  timestamp: string;
}

export interface ChatSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
  showTypingIndicator: boolean;
}

// Enhanced types for better UI experience
export interface ConversationWithMetadata extends Conversation {
  isOnline?: boolean;
  lastSeen?: string;
  typingUsers?: string[];
  unreadMessages?: Message[];
}

export interface MessageWithMetadata extends Message {
  sender?: User;
  isGroupedWithPrevious?: boolean;
  isGroupedWithNext?: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
}
