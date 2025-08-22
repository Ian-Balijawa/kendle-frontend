import { create } from "zustand";
import { chatService } from "../services/websocketService";
import {
  ChatSettings,
  OnlineStatus,
  TypingIndicator,
} from "../types/chat";

interface InboxStore {
  // State - simplified to work alongside React Query
  selectedConversationId: string | null;
  typingIndicators: TypingIndicator[];
  onlineStatuses: Record<string, OnlineStatus>;
  isConnected: boolean;
  chatSettings: ChatSettings;

  // Actions
  setSelectedConversationId: ( id: string | null ) => void;
  setTypingIndicator: ( indicator: TypingIndicator ) => void;
  removeTypingIndicator: ( userId: string, conversationId: string ) => void;
  setOnlineStatus: ( status: OnlineStatus ) => void;
  setConnected: ( connected: boolean ) => void;
  setChatSettings: ( settings: Partial<ChatSettings> ) => void;
  sendTypingIndicator: ( conversationId: string, isTyping: boolean ) => void;

  // Utility methods
  getTypingUsers: ( conversationId: string ) => TypingIndicator[];
  isUserOnline: ( userId: string ) => boolean;
  getUserLastSeen: ( userId: string ) => string | null;
}

export const useInboxStore = create<InboxStore>( ( set, get ) => ( {
  // Initial state
  selectedConversationId: null,
  typingIndicators: [],
  onlineStatuses: {},
  isConnected: false,
  chatSettings: {
    soundEnabled: true,
    notificationsEnabled: true,
    showOnlineStatus: true,
    showReadReceipts: true,
    showTypingIndicator: true,
  },

  // Actions
  setSelectedConversationId: ( id ) => {
    set( { selectedConversationId: id } );
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

  setChatSettings: ( settings ) => {
    set( ( state ) => ( {
      chatSettings: { ...state.chatSettings, ...settings },
    } ) );
  },

  sendTypingIndicator: ( conversationId, isTyping ) => {
    if ( get().chatSettings.showTypingIndicator ) {
      chatService.sendTypingIndicator( conversationId, isTyping );
    }
  },

  // Utility methods
  getTypingUsers: ( conversationId ) => {
    const { typingIndicators } = get();
    return typingIndicators.filter( ti =>
      ti.conversationId === conversationId && ti.isTyping
    );
  },

  isUserOnline: ( userId ) => {
    const { onlineStatuses } = get();
    return onlineStatuses[userId]?.isOnline || false;
  },

  getUserLastSeen: ( userId ) => {
    const { onlineStatuses } = get();
    return onlineStatuses[userId]?.lastSeen || null;
  },
} ) );
