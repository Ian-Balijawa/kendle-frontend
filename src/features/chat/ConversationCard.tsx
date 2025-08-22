import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArchive,
  IconDotsVertical,
  IconPin,
  IconPinFilled,
  IconTrash,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useState } from "react";
import { Conversation } from "../../types/chat";
import { useUpdateConversation } from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationCard({
  conversation,
  isSelected,
  onClick,
}: ConversationCardProps) {
  const { user } = useAuthStore();
  const updateConversationMutation = useUpdateConversation();
  const [showMenu, setShowMenu] = useState(false);

  // Get the other participant for direct conversations
  const participant =
    conversation.participants.find((p) => p.id !== user?.id) ||
    conversation.participants[0];

  // TODO: Get online status from WebSocket or API
  const isOnline = false; // This would come from WebSocket events
  const lastSeen = participant?.updatedAt;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      if (diffInMinutes < 1) return "Just now";
      return `${diffInMinutes}m`;
    }

    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConversationMutation.mutate({
      id: conversation.id,
      data: { isPinned: !conversation.isPinned },
    });
    setShowMenu(false);
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConversationMutation.mutate({
      id: conversation.id,
      data: { isMuted: !conversation.isMuted },
    });
    setShowMenu(false);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConversationMutation.mutate({
      id: conversation.id,
      data: { isArchived: !conversation.isArchived },
    });
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement delete conversation
    console.log("Delete conversation:", conversation.id);
    setShowMenu(false);
  };

  const getDisplayName = () => {
    if (conversation.name) return conversation.name;
    if (participant) {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return "Unknown User";
  };

  const getDisplayMessage = () => {
    if (!conversation.lastMessage) return "No messages yet";

    const message = conversation.lastMessage;
    const isOwn = message.senderId === user?.id;
    const prefix = isOwn ? "You: " : "";

    if (message.messageType === "text") {
      return `${prefix}${message.content}`;
    }

    return `${prefix}${message.messageType}`;
  };

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: "100%",
        padding: "var(--mantine-spacing-md)",
        borderRadius: 0,
        backgroundColor: isSelected
          ? "var(--mantine-color-blue-0)"
          : "transparent",
        borderLeft: isSelected
          ? "3px solid var(--mantine-color-blue-6)"
          : "3px solid transparent",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-0)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Box style={{ position: "relative" }}>
            <Avatar
              src={participant?.avatar}
              alt={participant?.firstName || "User"}
              size="md"
              radius="xl"
            >
              {(participant?.firstName || "U").charAt(0)}
            </Avatar>

            {/* Online Status Indicator */}
            {isOnline && (
              <Box
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "var(--mantine-color-green-6)",
                  border: "2px solid white",
                }}
              />
            )}
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center" mb={4}>
              <Text
                fw={500}
                size="sm"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                }}
              >
                {getDisplayName()}
              </Text>

              {participant?.isVerified && (
                <Badge size="xs" color="blue" variant="light">
                  ✓
                </Badge>
              )}

              {conversation.isPinned && (
                <IconPinFilled size={12} color="var(--mantine-color-blue-6)" />
              )}

              {conversation.isMuted && (
                <IconVolumeOff size={12} color="var(--mantine-color-gray-6)" />
              )}
            </Group>

            <Text
              size="xs"
              c="dimmed"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.4,
              }}
            >
              {getDisplayMessage()}
            </Text>

            {!isOnline && lastSeen && (
              <Text size="xs" c="dimmed" mt={2}>
                Last seen {formatLastSeen(lastSeen)}
              </Text>
            )}
          </Box>
        </Group>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <Group gap="xs" align="center">
            {conversation.lastMessage && (
              <Text size="xs" c="dimmed">
                {formatTime(conversation.lastMessage.createdAt)}
              </Text>
            )}

            <Menu
              opened={showMenu}
              onChange={setShowMenu}
              position="bottom-end"
              shadow="md"
              width={180}
            >
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    conversation.isPinned ? (
                      <IconPinFilled size={14} />
                    ) : (
                      <IconPin size={14} />
                    )
                  }
                  onClick={handlePin}
                >
                  {conversation.isPinned ? "Unpin" : "Pin"}
                </Menu.Item>

                <Menu.Item
                  leftSection={<IconVolumeOff size={14} />}
                  onClick={handleMute}
                >
                  {conversation.isMuted ? "Unmute" : "Mute"}
                </Menu.Item>

                <Menu.Item
                  leftSection={<IconArchive size={14} />}
                  onClick={handleArchive}
                >
                  {conversation.isArchived ? "Unarchive" : "Archive"}
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={handleDelete}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {conversation.unreadCount > 0 && (
            <Badge
              size="sm"
              color="blue"
              variant="filled"
              style={{
                minWidth: "20px",
                height: "20px",
                padding: "0 6px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </Box>
      </Group>
    </UnstyledButton>
  );
}
