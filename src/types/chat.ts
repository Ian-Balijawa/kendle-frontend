// TypeScript interfaces for the chat client
// Copy these types to your React frontend project

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  LOCATION = 'location',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export interface User {
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
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  createdAt: string;
}

export interface Message {
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
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
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

// WebSocket event types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface MessageReceivedEvent extends WebSocketMessage {
  type: 'message_received';
  data: Message;
}

export interface MessageDeliveredEvent extends WebSocketMessage {
  type: 'message_delivered';
  data: {
    messageId: string;
    conversationId: string;
  };
}

export interface MessageReadEvent extends WebSocketMessage {
  type: 'message_read';
  data: {
    messageId: string;
    userId: string;
  };
}

export interface TypingStartEvent extends WebSocketMessage {
  type: 'typing_start';
  data: {
    userId: string;
    conversationId: string;
  };
}

export interface TypingStopEvent extends WebSocketMessage {
  type: 'typing_stop';
  data: {
    userId: string;
    conversationId: string;
  };
}

export interface UserOnlineEvent extends WebSocketMessage {
  type: 'user_online';
  data: {
    userId: string;
  };
}

export interface UserOfflineEvent extends WebSocketMessage {
  type: 'user_offline';
  data: {
    userId: string;
  };
}

export interface ConversationCreatedEvent extends WebSocketMessage {
  type: 'conversation_created';
  data: Conversation;
}

export interface ErrorEvent extends WebSocketMessage {
  type: 'error';
  data: {
    message: string;
  };
}

// Client-side message sending types
export interface SendMessageData {
  content: string;
  receiverId: string;
  conversationId: string;
  messageType?: MessageType;
  replyToId?: string;
  metadata?: Record<string, any>;
}

export interface TypingIndicatorData {
  conversationId: string;
  isTyping: boolean;
}

export interface MarkMessageAsReadData {
  messageId: string;
  conversationId: string;
}

// Hook state types
export interface ChatState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  typingUsers: Set<string>;
  onlineUsers: Set<string>;
}

export interface ChatActions {
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (data: SendMessageData) => Promise<void>;
  markMessageAsRead: (data: MarkMessageAsReadData) => Promise<void>;
  setTyping: (data: TypingIndicatorData) => Promise<void>;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  loadMessages: (conversationId: string, limit?: number, offset?: number) => Promise<Message[]>;
}
