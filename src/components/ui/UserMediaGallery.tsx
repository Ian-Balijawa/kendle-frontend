import {
  Box,
  Card,
  Center,
  Loader,
  Stack,
  Text,
  Image,
  ActionIcon,
  Modal,
  Group,
  Badge,
  Skeleton,
  Transition,
  UnstyledButton,
  Tooltip,
} from "@mantine/core";
import {
  IconPhoto,
  IconPlayerPlay,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconMaximize,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { useUserMediaByUserId } from "../../hooks/useMedia";
import { getImageUrl, getVideoUrl } from "../../lib/stream-urls";

export interface UserMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  streamingUrl: string;
  originalUrl: string;
  mediaType: "image" | "video";
}

interface UserMediaGalleryProps {
  userId: string;
  type?: "image" | "video";
  limit?: number;
}

interface MediaItemProps {
  media: UserMediaItem;
  onClick: () => void;
  index: number;
}

function MediaItem({ media, onClick, index }: MediaItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isVideo = media.type === "video" || media.mediaType === "video";
  const displayUrl =
    typeof media.streamingUrl === "string"
      ? getImageUrl(media.streamingUrl.split("/").pop() as string)
      : undefined;
  const aspectRatio = isVideo ? "16/9" : "auto";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Transition
      mounted={true}
      transition="fade"
      duration={400}
      timingFunction="ease-out"
    >
      {(styles) => (
        <UnstyledButton
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...styles,
            display: "block",
            width: "100%",
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Card
            p={0}
            radius="lg"
            shadow={isHovered ? "xl" : "md"}
            style={{
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
              width: "100%",
              // background: "var(--mantine-color-gray-0)",
              transform: isHovered
                ? "translateY(-4px) scale(1.02)"
                : "translateY(0) scale(1)",
              transition: "all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              // minHeight: 200,
              aspectRatio: aspectRatio,
              border: isHovered
                ? "2px solid var(--mantine-color-blue-4)"
                : "2px solid transparent",
            }}
          >
            {/* Loading skeleton */}
            {!imageLoaded && !imageError && (
              <Skeleton
                height="100%"
                width="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
                animate
              />
            )}

            {/* Media content */}
            <Box
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 200,
              }}
            >
              <Image
                src={displayUrl}
                alt={isVideo ? "Video thumbnail" : "Image"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: imageLoaded ? 1 : 0,
                  transition: "opacity 0.4s ease-in-out",
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />

              {/* Video overlay */}
              {isVideo && (
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <ActionIcon
                    size={48}
                    radius="xl"
                    variant="filled"
                    color="white"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      color: "var(--mantine-color-dark-8)",
                      backdropFilter: "blur(10px)",
                      transform: isHovered ? "scale(1.1)" : "scale(1)",
                      transition: "transform 200ms ease",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <IconPlayerPlay size={20} />
                  </ActionIcon>
                </Box>
              )}

              <Badge
                variant="filled"
                color={isVideo ? "blue" : "green"}
                size="xs"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 3,
                  textTransform: "uppercase",
                  fontSize: "10px",
                  fontWeight: 700,
                  opacity: isHovered ? 1 : 0.8,
                  transition: "opacity 200ms ease",
                }}
              >
                {isVideo ? "VIDEO" : "IMAGE"}
              </Badge>

              {/* Date badge */}
              <Badge
                variant="light"
                color="dark"
                size="sm"
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  zIndex: 3,
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  fontSize: "10px",
                  opacity: isHovered ? 1 : 0.7,
                  transition: "opacity 200ms ease",
                }}
              >
                {formatDate(media.createdAt)}
              </Badge>

              {/* Error state */}
              {imageError && (
                <Center
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "var(--mantine-color-gray-1)",
                    zIndex: 2,
                  }}
                >
                  <Stack align="center" gap="xs">
                    <IconPhoto size={32} color="var(--mantine-color-gray-5)" />
                    <Text size="xs" c="dimmed" fw={500}>
                      Failed to load
                    </Text>
                  </Stack>
                </Center>
              )}

              {/* Hover overlay */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 300ms ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 4,
                  backdropFilter: "blur(2px)",
                }}
              >
                <Group gap="sm">
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    variant="filled"
                    color="white"
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      color: "var(--mantine-color-dark-8)",
                      transform: isHovered ? "scale(1)" : "scale(0.8)",
                      transition: "transform 200ms ease",
                    }}
                  >
                    {isVideo ? (
                      <IconPlayerPlay size={16} />
                    ) : (
                      <IconMaximize size={16} />
                    )}
                  </ActionIcon>
                </Group>
              </Box>
            </Box>
          </Card>
        </UnstyledButton>
      )}
    </Transition>
  );
}

interface MediaModalProps {
  media: UserMediaItem | null;
  allMedia: UserMediaItem[];
  opened: boolean;
  onClose: () => void;
}

function MediaModal({ media, allMedia, opened, onClose }: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (media && allMedia.length > 0) {
      const index = allMedia.findIndex((item) => item.id === media.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [media, allMedia]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!opened) return;

      switch (event.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          onClose();
          break;
        case " ":
          event.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [opened, currentIndex, allMedia.length]);

  if (!media || allMedia.length === 0) return null;

  const currentMedia = allMedia[currentIndex];
  const isVideo =
    currentMedia.type === "video" || currentMedia.mediaType === "video";

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
  };

  const toggleMute = () => {
    setIsVideoMuted(!isVideoMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="95vw"
      centered
      padding={0}
      radius="lg"
      withCloseButton={false}
      styles={{
        content: {
          maxHeight: "95vh",
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(10px)",
        },
        body: {
          padding: 0,
        },
      }}
      transitionProps={{
        transition: "fade",
        duration: 300,
      }}
    >
      <Box
        style={{
          position: "relative",
          background: "black",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Close button */}
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="dark"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 20,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            color: "white",
          }}
          onClick={onClose}
        >
          <IconX size={24} />
        </ActionIcon>

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <Tooltip label="Previous (←)" position="right">
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="dark"
                style={{
                  position: "absolute",
                  left: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 15,
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  transition: "all 200ms ease",
                }}
                onClick={handlePrevious}
              >
                <IconChevronLeft size={24} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Next (→)" position="left">
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="dark"
                style={{
                  position: "absolute",
                  right: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 15,
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  transition: "all 200ms ease",
                }}
                onClick={handleNext}
              >
                <IconChevronRight size={24} />
              </ActionIcon>
            </Tooltip>
          </>
        )}

        {/* Top bar with info */}
        <Box
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 80,
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Media counter */}
          {allMedia.length > 1 && (
            <Badge
              variant="filled"
              color="dark"
              size="lg"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                padding: "8px 16px",
              }}
            >
              {currentIndex + 1} of {allMedia.length}
            </Badge>
          )}

          {/* Action buttons */}
          <Group gap="xs">
            {isVideo && (
              <Tooltip label={isVideoMuted ? "Unmute" : "Mute"}>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  variant="filled"
                  color="dark"
                  style={{
                    background: "rgba(0, 0, 0, 0.7)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                  }}
                  onClick={toggleMute}
                >
                  {isVideoMuted ? (
                    <IconVolumeOff size={16} />
                  ) : (
                    <IconVolume size={16} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Box>

        {/* Media Content */}
        <Box
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px 20px 20px",
          }}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              muted={isVideoMuted}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(95vh - 120px)",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <source
                src={getVideoUrl(
                  currentMedia.streamingUrl?.split("/").pop() ?? "",
                )}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
                src={getImageUrl(
                  currentMedia.streamingUrl?.split("/").pop() ?? "",
                )}
              alt="Media"
              style={{
                maxWidth: "100%",
                maxHeight: "calc(95vh - 120px)",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)",
              }}
            />
          )}
        </Box>

        {/* Bottom info bar */}
        <Box
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Group gap="sm">
            <Badge variant="light" color="blue" size="sm">
              {isVideo ? "Video" : "Image"}
            </Badge>
            <Text size="sm" c="white" fw={500}>
              {new Date(currentMedia.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Group>
        </Box>
      </Box>
    </Modal>
  );
}

export function UserMediaGallery({
  userId,
  type,
  limit = 20,
}: UserMediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<UserMediaItem | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);

  const { data, isLoading, isError, isFetchingNextPage } = useUserMediaByUserId(
    userId,
    { type, limit },
  );

  const allMedia = data?.pages.flatMap((page) => page.media) || [];

  const handleMediaClick = (media: UserMediaItem) => {
    setSelectedMedia(media);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedMedia(null);
  };

  if (isLoading) {
    return (
      <Center py={80}>
        <Stack align="center" gap="lg">
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "linear-gradient(45deg, var(--mantine-color-blue-4), var(--mantine-color-purple-4))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite",
            }}
          >
            <Loader size="lg" color="white" />
          </Box>
          <Stack align="center" gap="xs">
            <Text fw={600} size="lg" c="dark">
              Loading media gallery
            </Text>
            <Text c="dimmed" ta="center" size="sm">
              Please wait while we fetch the content...
            </Text>
          </Stack>
        </Stack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center py={80}>
        <Stack align="center" gap="lg">
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--mantine-color-red-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPhoto size={36} color="var(--mantine-color-red-6)" />
          </Box>
          <Stack align="center" gap="xs">
            <Text fw={700} size="xl" c="red">
              Unable to load media
            </Text>
            <Text c="dimmed" ta="center" size="sm" maw={400}>
              We encountered an error while loading this user's media gallery.
              Please check your connection and try again.
            </Text>
          </Stack>
        </Stack>
      </Center>
    );
  }

  if (allMedia.length === 0) {
    return (
      <Center py={80}>
        <Stack align="center" gap="lg">
          <Box
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background:
                "linear-gradient(45deg, var(--mantine-color-blue-1), var(--mantine-color-purple-1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPhoto size={40} color="var(--mantine-color-blue-6)" />
          </Box>
          <Stack align="center" gap="sm">
            <Text fw={700} size="xl" c="dark">
              No media found
            </Text>
            <Text c="dimmed" ta="center" size="sm" maw={350}>
              {type === "video"
                ? "This user hasn't shared any videos yet. Check back later!"
                : type === "image"
                  ? "This user hasn't shared any images yet. Check back later!"
                  : "This user hasn't shared any media yet. Check back later!"}
            </Text>
          </Stack>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .masonry-grid {
          column-count: 1;
          column-gap: 16px;
          padding: 16px;
        }
        
        @media (min-width: 576px) {
          .masonry-grid { column-count: 2; }
        }
        
        @media (min-width: 768px) {
          .masonry-grid { column-count: 3; }
        }
        
        @media (min-width: 1024px) {
          .masonry-grid { column-count: 4; }
        }
        
        @media (min-width: 1280px) {
          .masonry-grid { column-count: 5; }
        }
        
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 16px;
          display: inline-block;
          width: 100%;
        }
      `}</style>

      <Box className="masonry-grid">
        {allMedia.map((media, index) => (
          <Box key={media.id} className="masonry-item">
            <MediaItem
              media={media}
              onClick={() => handleMediaClick(media)}
              index={index}
            />
          </Box>
        ))}
      </Box>

      {isFetchingNextPage && (
        <Center mt="xl" py="lg">
          <Stack align="center" gap="sm">
            <Loader size="md" />
            <Text size="sm" c="dimmed" fw={500}>
              Loading more content...
            </Text>
          </Stack>
        </Center>
      )}

      <MediaModal
        media={selectedMedia}
        allMedia={allMedia}
        opened={modalOpened}
        onClose={handleCloseModal}
      />
    </>
  );
}
