// Main chat components
export { ChatPage } from "./ChatPage";
export { ChatWindow } from "./ChatWindow";
export { ConversationCard } from "./ConversationCard";
export { MessageCard } from "./MessageCard";

// Floating chat components
export { FloatingChatWidget } from "./FloatingChatWidget";
export { FloatingChatWindow } from "./FloatingChatWindow";
export { ChatHeads } from "./ChatHeads";
export { FloatingChatList } from "./FloatingChatList";

// Mobile components
export { MobileChatDrawer } from "./MobileChatDrawer";

// Chat hooks
export {
    useConversations,
    useConversation,
    useInfiniteMessages,
    useUnreadCount,
    useCreateConversation,
    useUpdateConversation,
    useSendMessage,
    useUpdateMessage,
    useDeleteMessage,
    useMarkMessageAsRead,
    useMarkConversationAsRead,
    useAddMessageReaction,
    useFindOrCreateDirectConversation,
    chatKeys,
} from "../../hooks/useChat";

// WebSocket integration
export { useWebSocketIntegration } from "../../hooks/useWebSocket";

// Chat store
export { useFloatingChatStore } from "../../stores/chatStore";

// Chat types
export type {
    Conversation,
    Message,
    MessageReaction,
    CreateConversationRequest,
    UpdateConversationRequest,
    SendMessageRequest,
    UpdateMessageRequest,
    AddReactionRequest,
    GetMessagesParams,
    UnreadCountResponse,
    WebSocketEvent,
    WebSocketEventType,
    TypingIndicator,
    OnlineStatus,
    ChatSettings,
    ConversationWithMetadata,
    MessageWithMetadata,
} from "../../types/chat";
