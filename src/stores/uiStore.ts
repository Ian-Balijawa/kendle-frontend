import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { Notification } from "../types";

interface UIStore {
  theme: "light" | "dark";
  notifications: Notification[];
  unreadCount: number;

  // Actions
  setTheme: (theme: "light" | "dark") => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        theme: "light",
        notifications: [],
        unreadCount: 0,

        setTheme: (theme: "light" | "dark") => {
          set({ theme }, false, "ui/setTheme");
          // Update document class for theme
          document.documentElement.classList.toggle("dark", theme === "dark");
        },

        addNotification: (notification: Notification) => {
          set(
            (state) => ({
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
            }),
            false,
            "ui/addNotification",
          );
        },

        markNotificationAsRead: (id: string) => {
          set(
            (state) => ({
              notifications: state.notifications.map((notification) =>
                notification.id === id
                  ? { ...notification, isRead: true }
                  : notification,
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }),
            false,
            "ui/markNotificationAsRead",
          );
        },

        markAllNotificationsAsRead: () => {
          set(
            (state) => ({
              notifications: state.notifications.map((notification) => ({
                ...notification,
                isRead: true,
              })),
              unreadCount: 0,
            }),
            false,
            "ui/markAllNotificationsAsRead",
          );
        },

        removeNotification: (id: string) => {
          set(
            (state) => {
              const notification = state.notifications.find((n) => n.id === id);
              return {
                notifications: state.notifications.filter((n) => n.id !== id),
                unreadCount: state.unreadCount - (notification?.isRead ? 0 : 1),
              };
            },
            false,
            "ui/removeNotification",
          );
        },

        clearNotifications: () => {
          set(
            { notifications: [], unreadCount: 0 },
            false,
            "ui/clearNotifications",
          );
        },
      })),
      {
        name: "ui-storage",
        partialize: (state) => ({
          theme: state.theme,
        }),
      },
    ),
    {
      name: "UI Store",
      enabled: true,
    },
  ),
);
