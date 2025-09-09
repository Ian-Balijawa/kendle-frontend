import { useState } from "react";
import {
  Box,
  Group,
  Avatar,
  Text,
  ActionIcon,
  Stack,
  ScrollArea,
  Badge,
  Tooltip,
} from "@mantine/core";
import { IconMessage, IconUserPlus } from "@tabler/icons-react";
import { useFollowing } from "../../hooks/useFollow";
import { useFindOrCreateDirectConversation } from "../../hooks/useChat";
import { useAuthStore } from "../../stores/authStore";
import { useFloatingChatStore } from "../../stores/chatStore";

interface FollowedUsersChatProps {
  onStartConversation?: (userId: string) => void;
}

export function FollowedUsersChat({
  onStartConversation,
}: FollowedUsersChatProps) {
  const { user } = useAuthStore();
  const { openChatWindow } = useFloatingChatStore();
  const [expanded, setExpanded] = useState(false);

  // Get the first page of following users
  const { data: followingData } = useFollowing(user?.id || "", 1, 10);
  const createConversation = useFindOrCreateDirectConversation();

  const handleStartConversation = async (targetUserId: string) => {
    try {
      const conversation = await createConversation.mutateAsync(targetUserId);
      openChatWindow(conversation.id);
      onStartConversation?.(targetUserId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  if (
    !user ||
    !followingData?.following ||
    followingData.following.length === 0
  ) {
    return null;
  }

  const following = followingData.following;

  return (
    <Box>
      {/* Header */}
      <Group
        justify="space-between"
        p="xs"
        style={{
          cursor: "pointer",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Group gap="xs">
          <IconUserPlus size={16} />
          <Text size="sm" fw={500}>
            Start Chat
          </Text>
          <Badge size="xs" variant="light" color="blue">
            {following.length}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {expanded ? "Hide" : "Show"} followed users
        </Text>
      </Group>

      {/* Followed Users List */}
      {expanded && (
        <ScrollArea h={200}>
          <Stack gap={0}>
            {following.map((followedUser) => (
              <Box
                key={followedUser.id}
                p="xs"
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid var(--mantine-color-gray-1)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--mantine-color-gray-1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => handleStartConversation(followedUser.id)}
              >
                <Group gap="sm" align="center">
                  <Box style={{ position: "relative" }}>
                    <Avatar
                      size="sm"
                      src={followedUser.avatar}
                      alt={followedUser.firstName}
                    >
                      {followedUser.firstName?.charAt(0) || "U"}
                    </Avatar>

                    {/* Online status indicator */}
                    {followedUser.isOnline && (
                      <Box
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "var(--mantine-color-green-5)",
                          border: "2px solid var(--mantine-color-white)",
                        }}
                      />
                    )}
                  </Box>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {followedUser.firstName} {followedUser.lastName}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      @{followedUser.username || "no-username"}
                    </Text>
                  </Box>

                  <Tooltip label="Start conversation">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="primary"
                      loading={createConversation.isPending}
                    >
                      <IconMessage size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Box>
            ))}

            {following.length === 0 && (
              <Box
                p="sm"
                style={{
                  textAlign: "center",
                  color: "var(--mantine-color-gray-6)",
                }}
              >
                <Text size="sm">No users to chat with yet</Text>
                <Text size="xs" c="dimmed">
                  Follow some users to start conversations
                </Text>
              </Box>
            )}
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
}
