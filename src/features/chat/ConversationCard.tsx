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
import { useInboxStore } from "../../stores/inboxStore";
import { Conversation } from "../../types/chat";

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
  const { updateConversation, deleteConversation, onlineStatuses } =
    useInboxStore();
  const [showMenu, setShowMenu] = useState(false);

  const participant = conversation.participants[0];
  const isOnline = onlineStatuses[participant.id]?.isOnline || false;
  const lastSeen = onlineStatuses[participant.id]?.lastSeen;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
    }
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Online";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return "Offline";
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConversation(conversation.id, { isPinned: !conversation.isPinned });
    setShowMenu(false);
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConversation(conversation.id, { isMuted: !conversation.isMuted });
    setShowMenu(false);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConversation(conversation.id, {
      isArchived: !conversation.isArchived,
    });
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(conversation.id);
    }
    setShowMenu(false);
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + "...";
  };

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: isSelected
          ? "var(--mantine-color-blue-0)"
          : "transparent",
        border: isSelected
          ? "1px solid var(--mantine-color-blue-3)"
          : "1px solid transparent",
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
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
          {/* Avatar with online indicator */}
          <Box style={{ position: "relative" }}>
            <Avatar
              src={participant.avatar}
              alt={participant.firstName}
              size="md"
              radius="xl"
            >
              {participant.firstName?.charAt(0) || "U"}
            </Avatar>
            {isOnline && (
              <Box
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "var(--mantine-color-green-6)",
                  border: "2px solid white",
                }}
              />
            )}
          </Box>

          {/* Content */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" mb={4}>
              <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                <Text
                  fw={conversation.unreadCount > 0 ? 600 : 500}
                  size="sm"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {participant.firstName} {participant.lastName}
                </Text>

                {/* Indicators */}
                <Group gap={4}>
                  {participant.isVerified && (
                    <Badge size="xs" color="blue" variant="light">
                      ✓
                    </Badge>
                  )}
                  {conversation.isPinned && (
                    <IconPinFilled
                      size={12}
                      color="var(--mantine-color-orange-6)"
                    />
                  )}
                  {conversation.isMuted && (
                    <IconVolumeOff
                      size={12}
                      color="var(--mantine-color-gray-6)"
                    />
                  )}
                </Group>
              </Group>

              {/* Time and unread count */}
              <Group gap="xs" style={{ flexShrink: 0 }}>
                {conversation.lastMessage && (
                  <Text size="xs" c="dimmed">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </Text>
                )}
                {conversation.unreadCount > 0 && (
                  <Badge size="sm" color="blue" variant="filled">
                    {conversation.unreadCount > 99
                      ? "99+"
                      : conversation.unreadCount}
                  </Badge>
                )}
              </Group>
            </Group>

            {/* Last message or online status */}
            <Group justify="space-between">
              <Text
                size="xs"
                c="dimmed"
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                }}
              >
                {conversation.lastMessage
                  ? truncateMessage(conversation.lastMessage.content)
                  : isOnline
                    ? "Online"
                    : lastSeen
                      ? formatLastSeen(lastSeen)
                      : "No messages yet"}
              </Text>

              {/* Delivery status for last message */}
              {conversation.lastMessage && (
                <Group gap={4} style={{ flexShrink: 0 }}>
                  {conversation.lastMessage.isRead ? (
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "var(--mantine-color-blue-6)",
                      }}
                    />
                  ) : conversation.lastMessage.isDelivered ? (
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "var(--mantine-color-gray-4)",
                      }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "var(--mantine-color-yellow-6)",
                      }}
                    />
                  )}
                </Group>
              )}
            </Group>
          </Box>
        </Group>

        {/* More options menu */}
        <Menu
          opened={showMenu}
          onClose={() => setShowMenu(false)}
          shadow="md"
          width={200}
          position="right-start"
        >
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              style={{
                opacity: showMenu ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                conversation.isPinned ? (
                  <IconPin size={14} />
                ) : (
                  <IconPinFilled size={14} />
                )
              }
              onClick={handlePin}
            >
              {conversation.isPinned ? "Unpin" : "Pin"} Conversation
            </Menu.Item>

            <Menu.Item
              leftSection={<IconVolumeOff size={14} />}
              onClick={handleMute}
            >
              {conversation.isMuted ? "Unmute" : "Mute"} Notifications
            </Menu.Item>

            <Menu.Item
              leftSection={<IconArchive size={14} />}
              onClick={handleArchive}
            >
              {conversation.isArchived ? "Unarchive" : "Archive"} Conversation
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={handleDelete}
            >
              Delete Conversation
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </UnstyledButton>
  );
}
