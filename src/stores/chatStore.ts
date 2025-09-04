import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";

export interface ChatWindowState {
  id: string;
  conversationId: string;
  isMinimized: boolean;
  isOpen: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface FloatingChatState {
  isWidgetOpen: boolean;
  chatHeads: string[]; // Array of conversation IDs that should show as heads
  chatWindows: ChatWindowState[];
  activeChatId: string | null;
  lastZIndex: number;
}

interface FloatingChatActions {
  // Widget actions
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;

  // Chat window actions
  openChatWindow: (conversationId: string) => void;
  closeChatWindow: (conversationId: string) => void;
  minimizeChatWindow: (conversationId: string) => void;
  maximizeChatWindow: (conversationId: string) => void;
  focusChatWindow: (conversationId: string) => void;
  updateChatWindowPosition: (
    conversationId: string,
    position: { x: number; y: number },
  ) => void;
  updateChatWindowSize: (
    conversationId: string,
    size: { width: number; height: number },
  ) => void;

  // Chat heads actions
  addChatHead: (conversationId: string) => void;
  removeChatHead: (conversationId: string) => void;

  // Utility actions
  getChatWindow: (conversationId: string) => ChatWindowState | undefined;
  getOpenChatWindows: () => ChatWindowState[];
  getMinimizedChatWindows: () => ChatWindowState[];
}

const defaultWindowSize = { width: 380, height: 600 };
const defaultWindowPosition = {
  x: window.innerWidth - 400,
  y: window.innerHeight - 650,
};

type FloatingChatStore = FloatingChatState & FloatingChatActions;

export const useFloatingChatStore = create<FloatingChatStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        isWidgetOpen: false,
        chatHeads: [],
        chatWindows: [],
        activeChatId: null,
        lastZIndex: 1000,

        // Widget actions
        openWidget: () => set({ isWidgetOpen: true }, false, "chat/openWidget"),
        closeWidget: () =>
          set({ isWidgetOpen: false }, false, "chat/closeWidget"),
        toggleWidget: () =>
          set(
            (state) => ({ isWidgetOpen: !state.isWidgetOpen }),
            false,
            "chat/toggleWidget",
          ),

        // Chat window actions
        openChatWindow: (conversationId: string) => {
          const state = get();
          const existingWindow = state.chatWindows.find(
            (w) => w.conversationId === conversationId,
          );

          if (existingWindow) {
            // If window exists but is minimized, maximize it
            if (existingWindow.isMinimized) {
              set(
                (state) => ({
                  chatWindows: state.chatWindows.map((w) =>
                    w.conversationId === conversationId
                      ? {
                          ...w,
                          isMinimized: false,
                          isOpen: true,
                          zIndex: state.lastZIndex + 1,
                        }
                      : w,
                  ),
                  activeChatId: conversationId,
                  lastZIndex: state.lastZIndex + 1,
                }),
                false,
                "chat/maximizeExistingWindow",
              );
            } else {
              // Focus the existing window
              set(
                (state) => ({
                  chatWindows: state.chatWindows.map((w) =>
                    w.conversationId === conversationId
                      ? { ...w, zIndex: state.lastZIndex + 1 }
                      : w,
                  ),
                  activeChatId: conversationId,
                  lastZIndex: state.lastZIndex + 1,
                }),
                false,
                "chat/focusExistingWindow",
              );
            }
          } else {
            // Create new window
            const newWindow: ChatWindowState = {
              id: `chat-window-${conversationId}`,
              conversationId,
              isMinimized: false,
              isOpen: true,
              position: {
                x: defaultWindowPosition.x - state.chatWindows.length * 20,
                y: defaultWindowPosition.y - state.chatWindows.length * 20,
              },
              size: defaultWindowSize,
              zIndex: state.lastZIndex + 1,
            };

            set(
              (state) => ({
                chatWindows: [...state.chatWindows, newWindow],
                activeChatId: conversationId,
                lastZIndex: state.lastZIndex + 1,
                chatHeads: state.chatHeads.filter(
                  (id) => id !== conversationId,
                ), // Remove from heads when opened
              }),
              false,
              "chat/openNewWindow",
            );
          }
        },

        closeChatWindow: (conversationId: string) => {
          set(
            (state) => ({
              chatWindows: state.chatWindows.filter(
                (w) => w.conversationId !== conversationId,
              ),
              activeChatId:
                state.activeChatId === conversationId
                  ? null
                  : state.activeChatId,
            }),
            false,
            "chat/closeWindow",
          );
        },

        minimizeChatWindow: (conversationId: string) => {
          set(
            (state) => ({
              chatWindows: state.chatWindows.map((w) =>
                w.conversationId === conversationId
                  ? { ...w, isMinimized: true }
                  : w,
              ),
              activeChatId:
                state.activeChatId === conversationId
                  ? null
                  : state.activeChatId,
              chatHeads: [...new Set([...state.chatHeads, conversationId])], // Add to heads when minimized
            }),
            false,
            "chat/minimizeWindow",
          );
        },

        maximizeChatWindow: (conversationId: string) => {
          set(
            (state) => ({
              chatWindows: state.chatWindows.map((w) =>
                w.conversationId === conversationId
                  ? { ...w, isMinimized: false, zIndex: state.lastZIndex + 1 }
                  : w,
              ),
              activeChatId: conversationId,
              lastZIndex: state.lastZIndex + 1,
              chatHeads: state.chatHeads.filter((id) => id !== conversationId), // Remove from heads when maximized
            }),
            false,
            "chat/maximizeWindow",
          );
        },

        focusChatWindow: (conversationId: string) => {
          set(
            (state) => ({
              chatWindows: state.chatWindows.map((w) =>
                w.conversationId === conversationId
                  ? { ...w, zIndex: state.lastZIndex + 1 }
                  : w,
              ),
              activeChatId: conversationId,
              lastZIndex: state.lastZIndex + 1,
            }),
            false,
            "chat/focusWindow",
          );
        },

        updateChatWindowPosition: (
          conversationId: string,
          position: { x: number; y: number },
        ) => {
          set(
            (state) => ({
              chatWindows: state.chatWindows.map((w) =>
                w.conversationId === conversationId ? { ...w, position } : w,
              ),
            }),
            false,
            "chat/updateWindowPosition",
          );
        },

        updateChatWindowSize: (
          conversationId: string,
          size: { width: number; height: number },
        ) => {
          set(
            (state) => ({
              chatWindows: state.chatWindows.map((w) =>
                w.conversationId === conversationId ? { ...w, size } : w,
              ),
            }),
            false,
            "chat/updateWindowSize",
          );
        },

        // Chat heads actions
        addChatHead: (conversationId: string) => {
          set(
            (state) => ({
              chatHeads: [...new Set([...state.chatHeads, conversationId])],
            }),
            false,
            "chat/addChatHead",
          );
        },

        removeChatHead: (conversationId: string) => {
          set(
            (state) => ({
              chatHeads: state.chatHeads.filter((id) => id !== conversationId),
            }),
            false,
            "chat/removeChatHead",
          );
        },

        // Utility actions
        getChatWindow: (conversationId: string) => {
          return get().chatWindows.find(
            (w) => w.conversationId === conversationId,
          );
        },

        getOpenChatWindows: () => {
          return get().chatWindows.filter((w) => w.isOpen && !w.isMinimized);
        },

        getMinimizedChatWindows: () => {
          return get().chatWindows.filter((w) => w.isMinimized);
        },
      })),
      {
        name: "floating-chat-store",
        partialize: (state) => ({
          chatHeads: state.chatHeads,
          // Don't persist chat windows as they should reset on page load
          // Don't persist widget state as it should start closed
        }),
      },
    ),
    {
      name: "Chat Store",
      enabled: true,
    },
  ),
);
