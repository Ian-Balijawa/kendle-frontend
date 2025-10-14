import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Group,
  Text,
  ActionIcon,
  Transition,
  Avatar,
  Tooltip,
} from "@mantine/core";
import {
  IconMinus,
  IconX,
  IconGripVertical,
} from "@tabler/icons-react";
import { useFloatingChatStore } from "../../stores/chatStore";
import { useConversation } from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatWindowProps {
  conversationId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export function ChatWindow({
  conversationId,
  position,
  size,
  zIndex,
}: ChatWindowProps) {
  const [mounted, setMounted] = useState(false);

  const {
    minimizeChatWindow,
    closeChatWindow,
    focusChatWindow,
    updateChatWindowPosition,
    updateChatWindowSize,
  } = useFloatingChatStore();

  const { data: conversation } = useConversation(conversationId);
  const { user } = useAuthStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const participant = conversation?.participants.find((p) => p.id !== user?.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle window dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === windowRef.current ||
      (e.target as HTMLElement).closest("[data-drag-handle]")
    ) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      focusChatWindow(conversationId);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && windowRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;

      updateChatWindowPosition(conversationId, {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Handle window resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    focusChatWindow(conversationId);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const newHeight = e.clientY - rect.top;

      // Minimum size constraints
      const minWidth = 300;
      const minHeight = 400;
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;

      updateChatWindowSize(conversationId, {
        width: Math.max(minWidth, Math.min(newWidth, maxWidth)),
        height: Math.max(minHeight, Math.min(newHeight, maxHeight)),
      });
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener(
        "mousemove",
        isDragging ? handleMouseMove : handleResizeMouseMove,
      );
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener(
          "mousemove",
          isDragging ? handleMouseMove : handleResizeMouseMove,
        );
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position, size]);

  if (!conversation) return null;

  return (
    <Transition
      mounted={mounted}
      transition="scale"
      duration={200}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Paper
          ref={windowRef}
          shadow="xl"
          radius="lg"
          style={{
            ...styles,
            position: "fixed",
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex,
            display: "flex",
            flexDirection: "column",
            cursor: isDragging ? "grabbing" : "default",
            userSelect: "none",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            overflow: "hidden",
            transition: "all 0.2s ease",
            transform: isDragging ? "scale(1.02)" : "scale(1)",
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <Group
            justify="space-between"
            p="md"
            style={{
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              cursor: "grab",
              minHeight: 60,
            }}
            data-drag-handle
          >
            <Group gap="sm">
              <Avatar
                src={participant?.avatar}
                size="sm"
                radius="xl"
                style={{
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                {participant?.firstName?.[0]}
              </Avatar>

              <Box>
                <Text size="sm" fw={600} c="gray.8" truncate>
                  {conversation.name || participant?.firstName || "Chat"}
                </Text>
                {participant?.isOnline && (
                  <Group gap={4} align="center">
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "var(--mantine-color-green-5)",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <Text size="xs" c="green.6" fw={500}>
                      Online
                    </Text>
                  </Group>
                )}
              </Box>
            </Group>

            <Group gap={2}>
              <Tooltip label="Minimize" position="bottom">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  radius="md"
                  onClick={() => minimizeChatWindow(conversationId)}
                  style={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <IconMinus size={14} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Close" position="bottom">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  radius="md"
                  onClick={() => closeChatWindow(conversationId)}
                  style={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {/* Messages Area */}
          <Box
            style={{
              flex: 1,
              overflow: "hidden",
              background: "rgba(248, 250, 252, 0.5)",
            }}
          >
            <ChatMessages conversationId={conversationId} />
          </Box>

          {/* Input Area */}
          <Box
            p="md"
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ChatInput conversationId={conversationId} />
          </Box>

          {/* Resize Handle */}
          <Tooltip label="Resize" position="top-end">
            <Box
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 20,
                height: 20,
                cursor: "nw-resize",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
                opacity: 0.6,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                },
              }}
              onMouseDown={handleResizeMouseDown}
            >
              <IconGripVertical
                size={12}
                style={{ transform: "rotate(45deg)" }}
              />
            </Box>
          </Tooltip>
        </Paper>
      )}
    </Transition>
  );
}
