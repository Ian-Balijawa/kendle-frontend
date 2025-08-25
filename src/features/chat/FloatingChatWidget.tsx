import {
  ActionIcon,
  Badge,
  Paper,
  Transition,
  useMantineTheme,
  rem,
} from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useConversations, useUnreadCount } from "../../hooks/useChat";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { ChatHeads } from "./ChatHeads";
import { FloatingChatWindow } from "./FloatingChatWindow";
import { FloatingChatList } from "./FloatingChatList";
import { MobileChatDrawer } from "./MobileChatDrawer";
import { useWebSocketIntegration } from "../../hooks/useWebSocket";
import "./chat-animations.css";

export function FloatingChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const theme = useMantineTheme();
  const { data: unreadData } = useUnreadCount();
  const { data: conversations = [] } = useConversations();
  const { isConnected } = useWebSocketIntegration();

  const {
    isWidgetOpen,
    chatWindows,
    toggleWidget,
    chatHeads,
    addChatHead,
  } = useFloatingChatStore();

  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Close mobile drawer when switching to desktop
      if (!mobile && showMobileDrawer) {
        setShowMobileDrawer(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showMobileDrawer]);

  const handleMainButtonClick = () => {
    if (isMobile) {
      setShowMobileDrawer(true);
    } else {
      toggleWidget();
    }
  };

  // Auto-add recent conversations to chat heads when user has unread messages
  useEffect(() => {
    if (!isAuthenticated || conversations.length === 0) return;

    const recentConversations = conversations
      .filter(conv => conv.unreadCount > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3); // Add up to 3 recent conversations with unread messages

    recentConversations.forEach(conv => {
      if (!chatHeads.includes(conv.id) && !chatWindows.some(w => w.conversationId === conv.id)) {
        addChatHead(conv.id);
      }
    });
  }, [conversations, isAuthenticated, chatHeads, chatWindows, addChatHead]);

  if (!isAuthenticated) {
    return null;
  }

  const totalUnreadCount = unreadData?.count || 0;

  return (
    <>
      {/* Main Chat Button */}
      <Paper
        shadow="lg"
        style={{
          position: "fixed",
          bottom: rem(20),
          right: rem(20),
          zIndex: 999,
          borderRadius: "50%",
          overflow: "visible",
        }}
      >
        <ActionIcon
          variant="filled"
          color="blue"
          size="xl"
          radius="xl"
          onClick={handleMainButtonClick}
          className={`chat-widget-button ${totalUnreadCount > 0 ? "new-messages" : ""}`}
          style={{
            position: "relative",
            border: "3px solid white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <IconMessageCircle size={24} />

          {/* Unread count badge */}
          {totalUnreadCount > 0 && (
            <Badge
              size="sm"
              color="red"
              variant="filled"
              className="notification-badge"
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
                borderRadius: "50%",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: rem(11),
              }}
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}

          {/* Connection status indicator */}
          <div
            className={`connection-status ${isConnected ? "connected" : "disconnected"}`}
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: isConnected ? theme.colors.green[5] : theme.colors.red[5],
              border: "2px solid white",
            }}
          />
        </ActionIcon>
      </Paper>

      {/* Desktop Components - Only show on desktop */}
      {!isMobile && (
        <>
          {/* Chat List Widget */}
          <Transition
            mounted={isWidgetOpen}
            transition="slide-up"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <div
                style={{
                  ...styles,
                  position: "fixed",
                  bottom: rem(90),
                  right: rem(20),
                  zIndex: 998,
                }}
              >
                <FloatingChatList />
              </div>
            )}
          </Transition>

          {/* Chat Heads */}
          <ChatHeads />

          {/* Floating Chat Windows */}
          {chatWindows
            .filter(window => window.isOpen)
            .map((window) => (
              <FloatingChatWindow
                key={window.id}
                conversationId={window.conversationId}
              />
            ))}
        </>
      )}

      {/* Mobile Components - Only show on mobile */}
      <MobileChatDrawer
        opened={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
      />
    </>
  );
}
