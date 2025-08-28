import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Menu,
  rem,
  Text,
  UnstyledButton,
  useMantineTheme,
  Tooltip,
} from "@mantine/core";
import {
  IconArchive,
  IconDotsVertical,
  IconPin,
  IconPinFilled,
  IconTrash,
  IconVolumeOff,
  IconVolume,
  IconCheck,
  IconChecks,
  IconClock,
} from "@tabler/icons-react";
import { useState } from "react";
import { useUpdateConversation } from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
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
  const { user } = useAuthStore();
  const theme = useMantineTheme();
  const updateConversationMutation = useUpdateConversation();
  const [showMenu, setShowMenu] = useState(false);

  // Get the other participant for direct conversations
  const participant =
    conversation.participants.find((p) => p.id !== user?.id) ||
    conversation.participants[0];

  // Get online status and last seen
  const isOnline = participant?.isOnline || false;
  const lastSeen = participant?.lastSeen || participant?.updatedAt;

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
      (now.getTime() - date.getTime()) / (1000 * 60)
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

  const getMessageStatusIcon = () => {
    if (!conversation.lastMessage || conversation.lastMessage.senderId !== user?.id) {
      return null;
    }

    const message = conversation.lastMessage;
    switch (message.status) {
      case "sending":
        return <IconClock size={12} color={theme.colors.gray[5]} />;
      case "delivered":
        return <IconCheck size={12} color={theme.colors.gray[6]} />;
      case "read":
        return <IconChecks size={12} color={theme.colors.blue[6]} />;
      case "failed":
        return <IconClock size={12} color={theme.colors.red[6]} />;
      default:
        return <IconClock size={12} color={theme.colors.gray[5]} />;
    }
  };

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: "100%",
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        borderRadius: 0,
        backgroundColor: isSelected ? theme.colors.blue[0] : "transparent",
        borderLeft: isSelected
          ? `3px solid ${theme.colors.blue[6]}`
          : "3px solid transparent",
        position: "relative",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = theme.colors.gray[1];
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
              size="lg"
              radius="xl"
              style={{
                border: isSelected
                  ? `2px solid ${theme.colors.blue[3]}`
                  : `1px solid ${theme.colors.gray[3]}`,
                boxShadow: isSelected
                  ? `0 0 0 2px ${theme.colors.blue[1]}`
                  : "none",
              }}
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
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: theme.colors.green[5],
                  border: `2px solid ${theme.white}`,
                  boxShadow: `0 0 0 1px ${theme.colors.green[2]}`,
                }}
              />
            )}

            {/* Unread Count Badge on Avatar */}
            {conversation.unreadCount > 0 && !isSelected && (
              <Box
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: theme.colors.red[5],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  boxShadow: theme.shadows.sm,
                }}
              >
                <Text size="xs" c="white" fw={600}>
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </Text>
              </Box>
            )}
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center" mb={4}>
              <Text
                fw={600}
                size="sm"
                c={isSelected ? theme.colors.blue[7] : theme.colors.gray[8]}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                  fontSize: rem(14),
                }}
              >
                {getDisplayName()}
              </Text>

              {participant?.isVerified && (
                <Tooltip label="Verified User">
                  <Badge
                    size="xs"
                    color="blue"
                    variant="filled"
                    radius="xl"
                    style={{ fontSize: rem(10) }}
                  >
                    ✓
                  </Badge>
                </Tooltip>
              )}

              {conversation.isPinned && (
                <Tooltip label="Pinned conversation">
                  <IconPinFilled
                    size={14}
                    color={theme.colors.blue[6]}
                    style={{ opacity: 0.8 }}
                  />
                </Tooltip>
              )}

              {conversation.isMuted && (
                <Tooltip label="Muted conversation">
                  <IconVolumeOff
                    size={14}
                    color={theme.colors.gray[5]}
                    style={{ opacity: 0.6 }}
                  />
                </Tooltip>
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
                fontSize: rem(13),
                marginBottom: 4,
              }}
            >
              {getDisplayMessage()}
            </Text>

            {/* Online status or last seen */}
            <Group gap="xs" align="center">
              {isOnline ? (
                <Group gap={4}>
                  <Box
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.green[5],
                    }}
                  />
                  <Text size="xs" c="green" style={{ fontSize: rem(11) }}>
                    Online
                  </Text>
                </Group>
              ) : lastSeen ? (
                <Group gap={4}>
                  <IconClock size={10} color={theme.colors.gray[5]} />
                  <Text size="xs" c="dimmed" style={{ fontSize: rem(11) }}>
                    Last seen {formatLastSeen(lastSeen)}
                  </Text>
                </Group>
              ) : null}
            </Group>
          </Box>
        </Group>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <Group gap="xs" align="center">
            {conversation.lastMessage && (
              <Group gap={4} align="center">
                {getMessageStatusIcon()}
                <Text
                  size="xs"
                  c={isSelected ? theme.colors.blue[6] : "dimmed"}
                  style={{ fontSize: rem(11) }}
                >
                  {formatTime(conversation.lastMessage.createdAt)}
                </Text>
              </Group>
            )}

            <Menu
              opened={showMenu}
              onChange={setShowMenu}
              position="bottom-end"
              shadow="md"
              width={200}
              radius="lg"
            >
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  style={{
                    backgroundColor: "transparent",
                    color: theme.colors.gray[5],
                    opacity: 0.7,
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
                  leftSection={
                    conversation.isMuted ? (
                      <IconVolumeOff size={14} />
                    ) : (
                      <IconVolume size={14} />
                    )
                  }
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

          {/* Unread count badge - only show if not on avatar */}
          {conversation.unreadCount > 0 && isSelected && (
            <Badge
              size="sm"
              color="blue"
              variant="filled"
              radius="xl"
              style={{
                minWidth: "20px",
                height: "20px",
                padding: "0 6px",
                fontSize: rem(11),
                fontWeight: 600,
                boxShadow: theme.shadows.sm,
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
