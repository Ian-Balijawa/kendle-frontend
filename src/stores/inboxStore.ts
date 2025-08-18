import { create } from "zustand";
import { chatService } from "../services/websocketService";
import {
  ChatSettings,
  Conversation,
  Message,
  OnlineStatus,
  TypingIndicator,
  WebSocketEvent,
} from "../types/chat";

interface InboxStore {
  // State
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages[]
  selectedConversationId: string | null;
  typingIndicators: TypingIndicator[];
  onlineStatuses: Record<string, OnlineStatus>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  chatSettings: ChatSettings;

  // Actions
  setConversations: ( conversations: Conversation[] ) => void;
  addConversation: ( conversation: Conversation ) => void;
  updateConversation: ( id: string, updates: Partial<Conversation> ) => void;
  deleteConversation: ( id: string ) => void;

  setMessages: ( conversationId: string, messages: Message[] ) => void;
  addMessage: ( message: Message ) => void;
  updateMessage: ( messageId: string, updates: Partial<Message> ) => void;
  deleteMessage: ( messageId: string ) => void;
  markMessageAsRead: ( messageId: string ) => void;
  markConversationAsRead: ( conversationId: string ) => void;

  setSelectedConversationId: ( id: string | null ) => void;

  sendMessage: (
    conversationId: string,
    receiverId: string,
    content: string
  ) => void;
  sendTypingIndicator: ( conversationId: string, isTyping: boolean ) => void;

  setTypingIndicator: ( indicator: TypingIndicator ) => void;
  removeTypingIndicator: ( userId: string, conversationId: string ) => void;

  setOnlineStatus: ( status: OnlineStatus ) => void;

  setConnected: ( connected: boolean ) => void;
  setLoading: ( loading: boolean ) => void;
  setError: ( error: string | null ) => void;
  clearError: () => void;

  setSearchQuery: ( query: string ) => void;
  setChatSettings: ( settings: Partial<ChatSettings> ) => void;

  connectWebSocket: ( userId: string ) => Promise<void>;
  disconnectWebSocket: () => void;

  initializeInbox: () => void;
  getFilteredConversations: () => Conversation[];
  getUnreadCount: () => number;
  createOrGetConversation: ( participantId: string ) => Promise<Conversation>;
}

export const useInboxStore = create<InboxStore>( ( set, get ) => ( {
  // Initial state
  conversations: [],
  messages: {},
  selectedConversationId: null,
  typingIndicators: [],
  onlineStatuses: {},
  isConnected: false,
  isLoading: false,
  error: null,
  searchQuery: "",
  chatSettings: {
    soundEnabled: true,
    notificationsEnabled: true,
    showOnlineStatus: true,
    showReadReceipts: true,
    showTypingIndicator: true,
  },

  // Actions
  setConversations: ( conversations ) => {
    set( { conversations } );
  },

  addConversation: ( conversation ) => {
    set( ( state ) => ( {
      conversations: [
        conversation,
        ...state.conversations.filter( ( c ) => c.id !== conversation.id ),
      ],
    } ) );
  },

  updateConversation: ( id, updates ) => {
    set( ( state ) => ( {
      conversations: state.conversations.map( ( conv ) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    } ) );
  },

  deleteConversation: ( id ) => {
    set( ( state ) => ( {
      conversations: state.conversations.filter( ( conv ) => conv.id !== id ),
      messages: { ...state.messages, [id]: [] },
      selectedConversationId:
        state.selectedConversationId === id
          ? null
          : state.selectedConversationId,
      typingIndicators: state.typingIndicators.filter(
        ( ti ) => ti.conversationId !== id
      ),
    } ) );
  },

  setMessages: ( conversationId, messages ) => {
    set( ( state ) => ( {
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    } ) );
  },

  addMessage: ( message ) => {
    set( ( state ) => {
      const conversationMessages = state.messages[message.conversationId] || [];
      const updatedMessages = [
        message,
        ...conversationMessages.filter( ( m ) => m.id !== message.id ),
      ];

      // Update conversation's last message and unread count
      const updatedConversations = state.conversations.map( ( conv ) => {
        if ( conv.id === message.conversationId ) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount:
              message.senderId !== get().selectedConversationId
                ? conv.unreadCount + 1
                : conv.unreadCount,
            updatedAt: message.createdAt,
          };
        }
        return conv;
      } );

      return {
        messages: {
          ...state.messages,
          [message.conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    } );
  },

  updateMessage: ( messageId, updates ) => {
    set( ( state ) => {
      const newMessages = { ...state.messages };

      Object.keys( newMessages ).forEach( ( conversationId ) => {
        newMessages[conversationId] = newMessages[conversationId].map( ( msg ) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
      } );

      return { messages: newMessages };
    } );
  },

  deleteMessage: ( messageId ) => {
    set( ( state ) => {
      const newMessages = { ...state.messages };

      Object.keys( newMessages ).forEach( ( conversationId ) => {
        newMessages[conversationId] = newMessages[conversationId].filter(
          ( msg ) => msg.id !== messageId
        );
      } );

      return { messages: newMessages };
    } );
  },

  markMessageAsRead: ( messageId ) => {
    get().updateMessage( messageId, { isRead: true } );
    chatService.markMessageAsRead(
      messageId,
      get().selectedConversationId || ""
    );
  },

  markConversationAsRead: ( conversationId ) => {
    set( ( state ) => {
      const conversationMessages = state.messages[conversationId] || [];
      const updatedMessages = conversationMessages.map( ( msg ) => ( {
        ...msg,
        isRead: true,
      } ) );

      const updatedConversations = state.conversations.map( ( conv ) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      );

      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    } );
  },

  setSelectedConversationId: ( id ) => {
    set( { selectedConversationId: id } );
    if ( id ) {
      get().markConversationAsRead( id );
    }
  },

  sendMessage: ( conversationId, receiverId, content ) => {
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: "", // Will be set by the current user
      receiverId,
      conversationId,
      messageType: "text",
      isRead: false,
      isDelivered: false,
      isEdited: false,
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add temporary message immediately for optimistic UI
    get().addMessage( tempMessage );

    // Send via WebSocket
    chatService.sendTextMessage( conversationId, receiverId, content );
  },

  sendTypingIndicator: ( conversationId, isTyping ) => {
    chatService.sendTypingIndicator( conversationId, isTyping );
  },

  setTypingIndicator: ( indicator ) => {
    set( ( state ) => {
      const filteredIndicators = state.typingIndicators.filter(
        ( ti ) =>
          !(
            ti.userId === indicator.userId &&
            ti.conversationId === indicator.conversationId
          )
      );

      return {
        typingIndicators: indicator.isTyping
          ? [...filteredIndicators, indicator]
          : filteredIndicators,
      };
    } );
  },

  removeTypingIndicator: ( userId, conversationId ) => {
    set( ( state ) => ( {
      typingIndicators: state.typingIndicators.filter(
        ( ti ) => !( ti.userId === userId && ti.conversationId === conversationId )
      ),
    } ) );
  },

  setOnlineStatus: ( status ) => {
    set( ( state ) => ( {
      onlineStatuses: {
        ...state.onlineStatuses,
        [status.userId]: status,
      },
    } ) );
  },

  setConnected: ( connected ) => {
    set( { isConnected: connected } );
  },

  setLoading: ( loading ) => {
    set( { isLoading: loading } );
  },

  setError: ( error ) => {
    set( { error } );
  },

  clearError: () => {
    set( { error: null } );
  },

  setSearchQuery: ( query ) => {
    set( { searchQuery: query } );
  },

  setChatSettings: ( settings ) => {
    set( ( state ) => ( {
      chatSettings: { ...state.chatSettings, ...settings },
    } ) );
  },

  connectWebSocket: async ( userId ) => {
    try {
      set( { isLoading: true, error: null } );
      await chatService.connect( userId );
      set( { isConnected: true, isLoading: false } );

      // Set up event listeners
      const handleWebSocketEvent = ( event: WebSocketEvent ) => {
        const store = get();

        switch ( event.type ) {
          case "message_received":
            store.addMessage( event.data );
            break;
          case "message_read":
            store.updateMessage( event.data.messageId, { isRead: true } );
            break;
          case "message_delivered":
            store.updateMessage( event.data.messageId, { isDelivered: true } );
            break;
          case "typing_start":
            store.setTypingIndicator( {
              userId: event.data.userId,
              conversationId: event.data.conversationId,
              isTyping: true,
              timestamp: event.timestamp,
            } );
            break;
          case "typing_stop":
            store.removeTypingIndicator(
              event.data.userId,
              event.data.conversationId
            );
            break;
          case "user_online":
            store.setOnlineStatus( {
              userId: event.data.userId,
              isOnline: true,
              lastSeen: event.timestamp,
            } );
            break;
          case "user_offline":
            store.setOnlineStatus( {
              userId: event.data.userId,
              isOnline: false,
              lastSeen: event.timestamp,
            } );
            break;
          case "conversation_created":
            store.addConversation( event.data );
            break;
        }
      };

      // Subscribe to all relevant events
      const eventTypes = [
        "message_received",
        "message_read",
        "message_delivered",
        "typing_start",
        "typing_stop",
        "user_online",
        "user_offline",
        "conversation_created",
      ];

      eventTypes.forEach( ( eventType ) => {
        chatService.on( eventType as any, handleWebSocketEvent );
      } );
    } catch ( error ) {
      set( {
        error: "Failed to connect to chat service",
        isLoading: false,
        isConnected: false,
      } );
    }
  },

  disconnectWebSocket: () => {
    chatService.disconnect();
    set( { isConnected: false } );
  },

  initializeInbox: () => {
    // Load mock conversations and messages
    const mockConversations: Conversation[] = [
      {
        id: "1",
        participants: [
          {
            id: "2",
            phoneNumber: "+1987654321",
            username: "janedoe",
            firstName: "Jane",
            lastName: "Doe",
            avatar: undefined,
            isVerified: false,
            isProfileComplete: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            followersCount: 28,
            followingCount: 45,
            postsCount: 8,
          },
        ],
        lastMessage: {
          id: "1",
          content: "Hey! How are you doing?",
          senderId: "2",
          receiverId: "current",
          conversationId: "1",
          messageType: "text",
          isRead: false,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 30 * 60 * 1000 ).toISOString(), // 30 minutes ago
          updatedAt: new Date( Date.now() - 30 * 60 * 1000 ).toISOString(),
        },
        unreadCount: 2,
        isArchived: false,
        isMuted: false,
        isPinned: false,
        createdAt: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ).toISOString(), // 2 days ago
        updatedAt: new Date( Date.now() - 30 * 60 * 1000 ).toISOString(),
      },
      {
        id: "2",
        participants: [
          {
            id: "3",
            phoneNumber: "+1555123456",
            username: "mike",
            firstName: "Mike",
            lastName: "Smith",
            avatar: undefined,
            isVerified: true,
            isProfileComplete: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            followersCount: 15,
            followingCount: 22,
            postsCount: 5,
          },
        ],
        lastMessage: {
          id: "2",
          content: "Thanks for the help! 👍",
          senderId: "3",
          receiverId: "current",
          conversationId: "2",
          messageType: "text",
          isRead: true,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString(), // 2 hours ago
          updatedAt: new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString(),
        },
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        isPinned: true,
        createdAt: new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ).toISOString(), // 5 days ago
        updatedAt: new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString(),
      },
    ];

    const mockMessages: Record<string, Message[]> = {
      "1": [
        {
          id: "1",
          content: "Hey! How are you doing?",
          senderId: "2",
          receiverId: "current",
          conversationId: "1",
          messageType: "text",
          isRead: false,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 30 * 60 * 1000 ).toISOString(),
          updatedAt: new Date( Date.now() - 30 * 60 * 1000 ).toISOString(),
        },
        {
          id: "2",
          content: "I'm doing great! How about you?",
          senderId: "current",
          receiverId: "2",
          conversationId: "1",
          messageType: "text",
          isRead: true,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 25 * 60 * 1000 ).toISOString(),
          updatedAt: new Date( Date.now() - 25 * 60 * 1000 ).toISOString(),
        },
        {
          id: "3",
          content: "Pretty good! Working on some exciting projects. 🚀",
          senderId: "2",
          receiverId: "current",
          conversationId: "1",
          messageType: "text",
          isRead: false,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 20 * 60 * 1000 ).toISOString(),
          updatedAt: new Date( Date.now() - 20 * 60 * 1000 ).toISOString(),
        },
      ],
      "2": [
        {
          id: "4",
          content: "Could you help me with the design review?",
          senderId: "current",
          receiverId: "3",
          conversationId: "2",
          messageType: "text",
          isRead: true,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 3 * 60 * 60 * 1000 ).toISOString(),
          updatedAt: new Date( Date.now() - 3 * 60 * 60 * 1000 ).toISOString(),
        },
        {
          id: "5",
          content: "Of course! Send me the details.",
          senderId: "3",
          receiverId: "current",
          conversationId: "2",
          messageType: "text",
          isRead: true,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 2.5 * 60 * 60 * 1000 ).toISOString(),
          updatedAt: new Date( Date.now() - 2.5 * 60 * 60 * 1000 ).toISOString(),
        },
        {
          id: "6",
          content: "Thanks for the help! 👍",
          senderId: "3",
          receiverId: "current",
          conversationId: "2",
          messageType: "text",
          isRead: true,
          isDelivered: true,
          isEdited: false,
          reactions: [],
          createdAt: new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString(),
          updatedAt: new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString(),
        },
      ],
    };

    set( {
      conversations: mockConversations,
      messages: mockMessages,
    } );
  },

  getFilteredConversations: () => {
    const { conversations, searchQuery } = get();

    if ( !searchQuery.trim() ) {
      return conversations.sort( ( a, b ) => {
        // Pinned conversations first
        if ( a.isPinned && !b.isPinned ) return -1;
        if ( !a.isPinned && b.isPinned ) return 1;

        // Then by last update time
        return (
          new Date( b.updatedAt ).getTime() - new Date( a.updatedAt ).getTime()
        );
      } );
    }

    const query = searchQuery.toLowerCase();
    return conversations
      .filter( ( conv ) => {
        const participant = conv.participants[0];
        const participantName =
          `${participant.firstName} ${participant.lastName}`.toLowerCase();
        const lastMessageContent =
          conv.lastMessage?.content.toLowerCase() || "";

        return (
          participantName.includes( query ) || lastMessageContent.includes( query )
        );
      } )
      .sort(
        ( a, b ) =>
          new Date( b.updatedAt ).getTime() - new Date( a.updatedAt ).getTime()
      );
  },

  getUnreadCount: () => {
    const { conversations } = get();
    return conversations.reduce( ( total, conv ) => total + conv.unreadCount, 0 );
  },

  createOrGetConversation: async (
    participantId: string
  ): Promise<Conversation> => {
    const { conversations } = get();

    // Check if conversation already exists
    const existingConv = conversations.find( ( conv ) =>
      conv.participants.some( ( p ) => p.id === participantId )
    );

    if ( existingConv ) {
      return existingConv;
    }

    // Create new conversation (in real app, this would be an API call)
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participants: [
        // This would be populated with the actual user data
        {
          id: participantId,
          phoneNumber: "",
          username: "",
          firstName: "New",
          lastName: "User",
          avatar: undefined,
          isVerified: false,
          isProfileComplete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        },
      ],
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    get().addConversation( newConversation );
    return newConversation;
  },
} ) );
