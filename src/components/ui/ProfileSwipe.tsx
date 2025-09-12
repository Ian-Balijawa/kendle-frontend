import { ActionIcon, Box, Card, Group, Stack, Text } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUserPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useToggleFollow } from "../../hooks/useFollow";
import { User } from "../../types";
import { useAuthStore } from "../../stores/authStore";
import { VerticalUserCard } from "./VerticalUserCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/a11y";

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
  const navigate = useNavigate();
  const { toggleFollow, isLoading } = useToggleFollow();
  const { user: currentUser } = useAuthStore();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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

  const handleSlidePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSlideNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    direction: "prev" | "next",
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (direction === "prev") {
        handleSlidePrev();
      } else {
        handleSlideNext();
      }
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
    <Box style={{ position: "relative" }}>
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

      <Box
        style={{
          position: "relative",
          width: "100%",
          overflow: "visible",
        }}
      >
        {!isBeginning && (
          <ActionIcon
            variant="filled"
            size="lg"
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onClick={handleSlidePrev}
            onKeyDown={(e) => handleKeyDown(e, "prev")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.95)";
            }}
            aria-label="Previous users"
            role="button"
            tabIndex={0}
          >
            <IconChevronLeft size={18} color="#475569" />
          </ActionIcon>
        )}

        {!isEnd && (
          <ActionIcon
            variant="filled"
            size="lg"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onClick={handleSlideNext}
            onKeyDown={(e) => handleKeyDown(e, "next")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.95)";
            }}
            aria-label="Next users"
            role="button"
            tabIndex={0}
          >
            <IconChevronRight size={18} color="#475569" />
          </ActionIcon>
        )}

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={handleSlideChange}
          modules={[Navigation, FreeMode, A11y]}
          spaceBetween={16}
          slidesPerView="auto"
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumBounce: false,
          }}
          grabCursor={true}
          centeredSlides={false}
          centeredSlidesBounds={false}
          watchSlidesProgress={true}
          watchOverflow={true}
          resistance={true}
          resistanceRatio={0.85}
          a11y={{
            enabled: true,
            prevSlideMessage: "Previous user",
            nextSlideMessage: "Next user",
            firstSlideMessage: "This is the first user",
            lastSlideMessage: "This is the last user",
          }}
          style={{
            paddingLeft: "0px",
            paddingRight: "0px",
            paddingBottom: "8px",
            overflow: "hidden",
            width: "100%",
            margin: 0,
          }}
          role="region"
          aria-label="User profiles carousel"
        >
          {users.map((user, index) => (
            <SwiperSlide
              key={user.id}
              style={{
                width: "160px",
                height: "auto",
                flexShrink: 0,
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`User profile ${index + 1} of ${users.length}`}
            >
              <VerticalUserCard
                user={user}
                isFollowing={Boolean(user.followers?.includes(currentUser?.id || ""))}
                onFollow={handleFollow}
                onViewProfile={handleViewProfile}
                followLoading={isLoading}
                showActions={true}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}
