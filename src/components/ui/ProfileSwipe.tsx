import {
  ActionIcon,
  Box,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUserPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToggleFollow } from "../../hooks/useFollow";
import { User } from "../../types";
import { VerticalUserCard } from "./VerticalUserCard";

interface ProfileSwipeProps {
  users: User[];
  title?: string;
  subtitle?: string;
  onUserClick?: (userId: string) => void;
}

export function ProfileSwipe({
  users,
  subtitle = "Find interesting people to follow",
  onUserClick,
}: ProfileSwipeProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();
  const { toggleFollow, isLoading } = useToggleFollow();

  const scroll = (direction: "left" | "right") => {
    if (!scrollAreaRef.current) return;
    const scrollAmount = 180; // Updated for new card width + gap
    const currentScroll = scrollAreaRef.current.scrollLeft;
    const maxScroll =
      scrollAreaRef.current.scrollWidth - scrollAreaRef.current.clientWidth;

    if (direction === "left") {
      scrollAreaRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: "smooth",
      });
    } else {
      scrollAreaRef.current.scrollTo({
        left: Math.min(maxScroll, currentScroll + scrollAmount),
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    await toggleFollow(userId, isFollowing);
  };

  const handleViewProfile = (userId: string) => {
    if (onUserClick) {
      onUserClick(userId);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  if (!users.length) {
    return (
      <Card
        radius="24"
        p="sm"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Stack align="center" gap="sm" py="xl">
          <Box
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <IconUserPlus size={40} color="#667eea" />
            <Box
              style={{
                position: "absolute",
                top: "10%",
                right: "15%",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(240, 147, 251, 0.3), rgba(102, 126, 234, 0.2))",
                filter: "blur(4px)",
              }}
            />
          </Box>
          <Stack align="center" gap="xs">
            <Text fw={700} size="xl">
              No users to discover
            </Text>
            <Text ta="center" size="sm" maw={300}>
              Check back later for new people to follow and expand your network!
            </Text>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Box>
      <Box mb="xl" style={{ position: "relative" }}>
        <Group align="center" gap="xs">
          <IconSparkles size={24} color="#667eea" />
          <Text size="sm" fw={500} mt={2}>
            {subtitle}
          </Text>
        </Group>

        <Box
          style={{
            position: "absolute",
            bottom: -8,
            left: 0,
            width: "60px",
            height: "3px",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
          }}
        />
      </Box>

      <Box style={{ position: "relative" }}>
        {canScrollLeft && (
          <ActionIcon
            variant="transparent"
            style={{
              position: "absolute",
              left: -24,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 15,
            }}
            onClick={() => scroll("left")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <IconChevronLeft size={18} color="#475569" />
          </ActionIcon>
        )}

        {canScrollRight && (
          <ActionIcon
            variant="transparent"
            style={{
              position: "absolute",
              right: -24,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 15,
            }}
            onClick={() => scroll("right")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <IconChevronRight />
          </ActionIcon>
        )}

        <ScrollArea
          ref={scrollAreaRef}
          onScrollPositionChange={handleScroll}
          scrollbarSize={0}
          style={{
            paddingRight: "20px",
            paddingLeft: "4px",
          }}
        >
          <Group pb="sm">
            {users.map((user) => (
              <Box key={user.id} style={{ flexShrink: 0 }}>
                <VerticalUserCard
                  user={user}
                  onFollow={handleFollow}
                  onViewProfile={handleViewProfile}
                  followLoading={isLoading}
                  showActions={true}
                />
              </Box>
            ))}
          </Group>
        </ScrollArea>
      </Box>
    </Box>
  );
}
