import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconHeart,
  IconUserPlus,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToggleFollow } from "../../hooks/useFollow";
import { User } from "../../types";

interface ProfileSwipeProps {
  users: User[];
  title?: string;
  subtitle?: string;
  showStats?: boolean;
  onUserClick?: (userId: string) => void;
}

export function ProfileSwipe({
  users,
  title = "Discover People",
  subtitle = "Find interesting people to follow",
  showStats = true,
  onUserClick,
}: ProfileSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { toggleFollow, isLoading } = useToggleFollow();

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      if (direction === "left") {
        setCurrentIndex((prev) => (prev + 1) % users.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + users.length) % users.length);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    await toggleFollow(currentUser.id, false); // Assume not following initially
  };

  const handleViewProfile = () => {
    if (currentUser) {
      if (onUserClick) {
        onUserClick(currentUser.id);
      } else {
        navigate(`/profile/${currentUser.id}`);
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString();
  };

  if (!users.length) {
    return (
      <Card
        radius="xl"
        p="xl"
        style={{
          background: "linear-gradient(135deg, #f8f9ff, #f1f3ff)",
          border: "none",
        }}
      >
        <Stack align="center" gap="md">
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(102, 126, 234, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUserPlus size={32} color="#667eea" />
          </Box>
          <Stack align="center" gap="xs">
            <Text fw={600} size="lg">
              No users to discover
            </Text>
            <Text c="dimmed" ta="center" size="sm">
              Check back later for new people to follow!
            </Text>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Box>
        <Text size="xl" fw={700}>
          {title}
        </Text>
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      </Box>

      {/* Main Profile Card */}
      <Card
        radius="xl"
        p={0}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden",
          minHeight: 320,
        }}
      >
        {/* Background Pattern */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            opacity: 0.3,
          }}
        />

        {/* Profile Content */}
        <Stack p="xl" style={{ position: "relative", zIndex: 1 }} gap="lg">
          {/* Avatar and Name */}
          <Group justify="center">
            <Box style={{ position: "relative" }}>
              <Avatar
                src={currentUser?.avatar || "/user.png"}
                alt={currentUser?.firstName || ""}
                size={120}
                radius="50%"
                style={{
                  border: "4px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              >
                <Text size="2rem" fw={600} >
                  {currentUser?.firstName?.charAt(0)}
                  {currentUser?.lastName?.charAt(0)}
                </Text>
              </Avatar>

              {/* Verification Badge */}
              {currentUser?.isVerified && (
                <Badge
                  color="cyan"
                  variant="filled"
                  size="sm"
                  radius="xl"
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  }}
                >
                  ✓
                </Badge>
              )}
            </Box>
          </Group>

          {/* User Info */}
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700} ta="center">
              {currentUser?.firstName} {currentUser?.lastName}
            </Text>
            <Text opacity={0.9} size="lg" fw={500}>
              @{currentUser?.username}
            </Text>
            {currentUser?.bio && (
              <Text opacity={0.8} size="sm" ta="center" lineClamp={2}>
                {currentUser.bio}
              </Text>
            )}
          </Stack>

          {/* Stats */}
          {showStats && (
            <Group justify="center" gap="xl">
              <Box ta="center">
                <Text size="lg" fw={700} >
                  {formatNumber(currentUser?.postsCount || 0)}
                </Text>
                <Text size="xs" opacity={0.8}>
                  Posts
                </Text>
              </Box>
              <Box ta="center">
                <Text size="lg" fw={700} >
                  {formatNumber(currentUser?.followersCount || 0)}
                </Text>
                <Text size="xs" opacity={0.8}>
                  Followers
                </Text>
              </Box>
              <Box ta="center">
                <Text size="lg" fw={700} >
                  {formatNumber(currentUser?.followingCount || 0)}
                </Text>
                <Text size="xs" opacity={0.8}>
                  Following
                </Text>
              </Box>
            </Group>
          )}

          {/* Action Buttons */}
          <Group justify="center" gap="md">
            <ActionIcon
              variant="light"
              size="xl"
              radius="xl"
              onClick={handleViewProfile}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
              }}
            >
              <IconZoomIn size={20} />
            </ActionIcon>

            <Button
              leftSection={<IconUserPlus size={18} />}
              onClick={handleFollow}
              loading={isLoading}
              size="lg"
              radius="xl"
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "#667eea",
                border: "none",
                fontWeight: 600,
              }}
            >
              Follow
            </Button>

            <ActionIcon
              variant="light"
              size="xl"
              radius="xl"
              onClick={() => handleSwipe("left")}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
              }}
            >
              <IconHeart size={20} />
            </ActionIcon>
          </Group>
        </Stack>

        {/* Navigation Dots */}
        <Group
          justify="center"
          gap="xs"
          style={{ position: "absolute", bottom: 20, left: 0, right: 0 }}
        >
          {users.slice(0, 5).map((_, index) => (
            <Box
              key={index}
              style={{
                width: index === currentIndex % 5 ? 12 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  index === currentIndex % 5
                    ? "white"
                    : "rgba(255,255,255,0.5)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Group>
      </Card>

      {/* Quick Navigation */}
      <Group justify="space-between" gap="xs">
        <UnstyledButton
          onClick={() => handleSwipe("right")}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            background: "var(--mantine-color-gray-0)",
            border: "1px solid var(--mantine-color-gray-2)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-2px)";
            e.currentTarget.style.background = "var(--mantine-color-gray-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.background = "var(--mantine-color-gray-0)";
          }}
        >
          <Group gap="xs">
            <IconX size={16} />
            <Text size="sm" fw={500}>
              Previous
            </Text>
          </Group>
        </UnstyledButton>

        <UnstyledButton
          onClick={() => handleSwipe("left")}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            background: "var(--mantine-color-blue-0)",
            border: "1px solid var(--mantine-color-blue-2)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(2px)";
            e.currentTarget.style.background = "var(--mantine-color-blue-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.background = "var(--mantine-color-blue-0)";
          }}
        >
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Next
            </Text>
            <IconHeart size={16} color="var(--mantine-color-blue-6)" />
          </Group>
        </UnstyledButton>
      </Group>

      {/* Preview of Next User */}
      {nextUser && (
        <Card
          radius="lg"
          p="md"
          style={{
            background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
            border: "1px solid var(--mantine-color-gray-2)",
            opacity: 0.7,
            transform: "scale(0.95)",
          }}
        >
          <Group gap="sm">
            <Avatar
              src={nextUser.avatar || "/user.png"}
              alt={nextUser.firstName || ""}
              size="md"
              radius="xl"
            >
              {nextUser.firstName?.charAt(0)}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {nextUser.firstName} {nextUser.lastName}
              </Text>
              <Text size="xs" c="dimmed">
                @{nextUser.username}
              </Text>
            </Box>
            <Badge variant="dot" color="blue" size="sm">
              Next
            </Badge>
          </Group>
        </Card>
      )}
    </Stack>
  );
}
