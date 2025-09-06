import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconUserPlus,
  IconUserX,
  IconSparkles,
} from "@tabler/icons-react";
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

  return (
    <Box
      style={{
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={handleViewProfile}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Gradient Background */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          opacity: 0.1,
        }}
      />

      {/* Floating Orbs */}
      <Box
        style={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1))",
          filter: "blur(8px)",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "20%",
          left: "10%",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(240, 147, 251, 0.15), rgba(102, 126, 234, 0.1))",
          filter: "blur(6px)",
        }}
      />

      {/* Content */}
      <Stack
        p="lg"
        style={{ position: "relative", zIndex: 2, height: "100%" }}
        justify="space-between"
        align="center"
      >
        {/* Avatar Section */}
        <Box style={{ position: "relative", marginTop: "8px" }}>
          <Avatar
            src={user.avatar || "/user.png"}
            alt={user.firstName || user.username || "User"}
            size={72}
            radius="xl"
            style={{
              border: "3px solid rgba(255, 255, 255, 0.8)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
            }}
          >
            <Text size="xl" fw={700} c="gray.6">
              {user.firstName?.charAt(0) || user.username?.charAt(0)}
              {user.lastName?.charAt(0) || user.username?.charAt(1)}
            </Text>
          </Avatar>

          {/* Enhanced Verification Badge */}
          {user.isVerified && (
            <Box
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1d9bf0, #0ea5e9)",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <IconSparkles size={12} color="white" />
            </Box>
          )}
        </Box>

        {/* User Info */}
        <Stack gap="xs" align="center" style={{ flex: 1, justifyContent: "center" }}>
          <Text
            size="md"
            fw={700}
            ta="center"
            c="gray.8"
            style={{
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%",
              letterSpacing: "-0.02em",
            }}
          >
            {user.firstName} {user.lastName}
          </Text>
          <Text
            size="sm"
            c="gray.5"
            ta="center"
            fw={500}
            style={{
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%",
            }}
          >
            @{user.username}
          </Text>

          {/* Enhanced Stats */}
          <Group gap="lg" justify="center" mt="xs">
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
                background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), transparent)",
              }}
            />
            <Box ta="center">
              <Text size="sm" fw={700} c="gray.8" lh={1}>
                {formatNumber(user.postsCount || 0)}
              </Text>
              <Text size="xs" c="gray.5" fw={500} style={{ fontSize: "10px" }}>
                Posts
              </Text>
            </Box>
            <Box
              style={{
                width: "1px",
                height: "24px",
                background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), transparent)",
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

        {/* Modern Follow/Unfollow Button */}
        {showActions && (
          <Button
            size="sm"
            radius="xl"
            loading={followLoading}
            onClick={handleFollow}
            leftSection={
              isFollowing ? (
                <IconUserX size={14} />
              ) : (
                <IconUserPlus size={14} />
              )
            }
            style={{
              background: isFollowing
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              fontWeight: 600,
              fontSize: "12px",
              padding: "8px 20px",
              height: "36px",
              width: "100%",
              boxShadow: isFollowing
                ? "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)"
                : "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (isFollowing) {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-1px)";
              } else {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (isFollowing) {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              } else {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
