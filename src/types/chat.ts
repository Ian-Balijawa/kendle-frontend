import { User } from "./auth";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  messageType: "text" | "image" | "video" | "audio" | "file";
  mediaUrl?: string;
  mediaSize?: number;
  mediaFileName?: string;
  isRead: boolean;
  isDelivered: boolean;
  isEdited: boolean;
  replyToMessage?: {
    id: string;
    content: string;
    senderId: string;
  };
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface MessageReaction {
  id: string;
  userId: string;
  messageId: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  content: string;
  receiverId: string;
  messageType?: "text" | "image" | "video" | "audio" | "file";
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
