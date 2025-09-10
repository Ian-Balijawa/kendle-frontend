import { Avatar, Box, Button, Center, Group, Stack, Text } from "@mantine/core";
import { IconUserCheck, IconUserPlus } from "@tabler/icons-react";
import { User } from "../../types";

interface VerticalUserCardProps {
  user: User;
  isFollowing?: boolean;
  followLoading?: boolean;
  onFollow?: (userId: string, isFollowing: boolean) => void;
  onViewProfile?: (userId: string) => void;
  showActions?: boolean;
}

export function VerticalUserCard({
  user,
  isFollowing = false,
  followLoading = false,
  onFollow,
  onViewProfile,
  showActions = true,
}: VerticalUserCardProps) {
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFollow) {
      onFollow(user.id, isFollowing);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user.id);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString();
  };

  const avatarURL = `${import.meta.env.VITE_API_URL}/stream/image/${user.avatar?.split("/").pop()}`;

  return (
    <Box
      style={{
        position: "relative",
        width: "160px",
        flexShrink: 0,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
      p="sm"
      onClick={handleViewProfile}
    >
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "55%",
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          opacity: 0.1,
        }}
      />

      <Stack
        style={{ position: "relative", zIndex: 2, height: "100%" }}
        justify="space-between"
        align="center"
      >
        <Box pos="relative">
          <Center>
            <Avatar
              src={avatarURL || "/user.png"}
              alt={user.firstName || user.username || "User"}
              size={60}
              m="xs"
              radius="50%"
              style={{
                border: "3px solid rgba(255, 255, 255, 0.8)",
                boxShadow:
                  "0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
              }}
            >
              <Text size="lg" fw={700} c="gray.6" mt="xs">
                {user.firstName?.charAt(0).toUpperCase() || user.username?.charAt(0)}
                {user.lastName?.charAt(0).toUpperCase() || user.username?.charAt(1)}
              </Text>
            </Avatar>
          </Center>
          <Text size="sm" c="gray.8" ta="center" mb={"xs"}>
            @{user.username}
          </Text>
        </Box>

        <Stack
          gap="xs"
          align="center"
          style={{ flex: 1, justifyContent: "space-between" }}
        >
          <Group justify="center">
            <Box ta="center">
              <Text size="sm" fw={700} c="gray.8" lh={1}>
                {formatNumber(user.followersCount || 0)}
              </Text>
              <Text size="xs" c="gray.5" fw={500} style={{ fontSize: "10px" }}>
                Followers
              </Text>
            </Box>
            <Box
              style={{
                width: "1px",
                height: "24px",
                background:
                  "linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), transparent)",
              }}
            />
            <Box ta="center">
              <Text size="sm" fw={700} c="gray.8" lh={1}>
                {formatNumber(user.followingCount || 0)}
              </Text>
              <Text size="xs" c="gray.5" fw={500} style={{ fontSize: "10px" }}>
                Following
              </Text>
            </Box>
          </Group>
        </Stack>

        {showActions && (
          <Button
            size="xs"
            loading={followLoading}
            onClick={handleFollow}
            leftSection={
              isFollowing ? (
                <IconUserCheck size={14} />
              ) : (
                <IconUserPlus size={14} />
              )
            }
            style={{
              background: isFollowing
                ? "rgba(15, 23, 42, 0.05)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: isFollowing ? "#475569" : "white",
              border: isFollowing ? "1px solid rgba(15, 23, 42, 0.1)" : "none",
              fontWeight: 600,
              fontSize: "12px",
              width: "100%",
              boxShadow: isFollowing
                ? "none"
                : "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
