import {
    ActionIcon,
    Box,
    Group,
    Paper,
    rem,
    Text,
    Transition,
} from "@mantine/core";
import {
    IconMinus,
    IconX,
    IconMaximize,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useConversations } from "../../hooks/useChat";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { ChatWindow } from "./ChatWindow";

interface FloatingChatWindowProps {
  conversationId: string;
}

export function FloatingChatWindow({ conversationId }: FloatingChatWindowProps) {
  const { user } = useAuthStore();
  const { data: conversations = [] } = useConversations();
  const {
    getChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    maximizeChatWindow,
    focusChatWindow,
    updateChatWindowPosition,
    updateChatWindowSize,
  } = useFloatingChatStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });

  const windowRef = useRef<HTMLDivElement>(null);
  const conversation = conversations.find(conv => conv.id === conversationId);
  const chatWindowState = getChatWindow(conversationId);

  // Don't render if conversation or window state doesn't exist
  if (!conversation || !chatWindowState) {
    return null;
  }

  const otherParticipant = conversation.participants.find(p => p.id !== user?.id);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // Only drag on header

    setIsDragging(true);
    setDragStart({
      x: e.clientX - chatWindowState.position.x,
      y: e.clientY - chatWindowState.position.y,
    });
    focusChatWindow(conversationId);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Constrain to viewport
        const maxX = window.innerWidth - chatWindowState.size.width;
        const maxY = window.innerHeight - 60; // Leave space for header

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        updateChatWindowPosition(conversationId, {
          x: constrainedX,
          y: constrainedY,
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(320, chatWindowState.size.width + deltaX);
        const newHeight = Math.max(400, chatWindowState.size.height + deltaY);

        updateChatWindowSize(conversationId, {
          width: newWidth,
          height: newHeight,
        });

        setResizeStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    conversationId,
    chatWindowState.size,
    updateChatWindowPosition,
    updateChatWindowSize,
  ]);

  // Handle resize mouse down
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  const handleClose = () => {
    closeChatWindow(conversationId);
  };

  const handleMinimize = () => {
    minimizeChatWindow(conversationId);
  };

  const handleMaximize = () => {
    if (chatWindowState.isMinimized) {
      maximizeChatWindow(conversationId);
    }
  };

  if (chatWindowState.isMinimized) {
    return null; // Minimized windows are handled by ChatHeads
  }

  return (
    <Transition
      mounted={chatWindowState.isOpen}
      transition="scale"
      duration={200}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          ref={windowRef}
          shadow="lg"
          className={`floating-chat-window ${isDragging ? "dragging" : ""}`}
          style={{
            ...styles,
            position: "fixed",
            left: chatWindowState.position.x,
            top: chatWindowState.position.y,
            width: chatWindowState.size.width,
            height: chatWindowState.size.height,
            zIndex: chatWindowState.zIndex,
            borderRadius: rem(12),
            overflow: "hidden",
            border: "1px solid var(--mantine-color-gray-2)",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          {/* Window Header */}
          <Paper
            p="xs"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-2)",
              backgroundColor: "var(--mantine-color-gray-0)",
              cursor: "grab",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
          >
            <Group justify="space-between" align="center">
              <Group gap="xs" align="center">
                <Text size="sm" fw={600} lineClamp={1}>
                  {conversation.name ||
                    `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                </Text>
                {conversation.unreadCount > 0 && (
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-blue-6)",
                    }}
                  />
                )}
              </Group>

              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  onClick={handleMinimize}
                  style={{ color: "var(--mantine-color-gray-6)" }}
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  onClick={handleMaximize}
                  style={{ color: "var(--mantine-color-gray-6)" }}
                >
                  <IconMaximize size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  onClick={handleClose}
                  style={{ color: "var(--mantine-color-gray-6)" }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>

          {/* Chat Content */}
          <Box style={{ flex: 1, overflow: "hidden" }}>
            <ChatWindow
              conversation={conversation}
              onBack={handleClose}
              showBackButton={false}
            />
          </Box>

          {/* Resize Handle */}
          <Box
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              cursor: "nw-resize",
              backgroundColor: "transparent",
            }}
            onMouseDown={handleResizeMouseDown}
          >
            <Box
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderBottom: "8px solid var(--mantine-color-gray-4)",
              }}
            />
          </Box>
        </Paper>
      )}
    </Transition>
  );
}
