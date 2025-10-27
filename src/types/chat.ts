export type MessageType = "text" | "image" | "audio" | "video" | "file" | "location";

export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export type ConversationType = "direct" | "group";

export interface User {
  id: string;
  phoneNumber: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  whatsapp?: string;
  twitterLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  avatar?: string;
  backgroundImage?: string;
  bio?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
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

export interface ConnectedEvent extends WebSocketMessage {
  type: 'connected';
  data: {
    success: boolean;
    message: string;
  };
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

export interface TypingIndicator {
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

export interface ChatSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
  showTypingIndicator: boolean;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ChatActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (data: SendMessageData) => Promise<void>;
  markMessageAsRead: (data: MarkMessageAsReadData) => Promise<void>;
  setTyping: (data: TypingIndicator) => Promise<void>;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  loadMessages: (conversationId: string, limit?: number, offset?: number) => Promise<Message[]>;
}

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
  participants: User[];
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
  reactions: MessageReaction[];
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
