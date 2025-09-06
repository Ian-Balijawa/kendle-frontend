import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Image,
  Modal,
  Text,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconHeart,
  IconShare,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { StatusCollection } from "../../types";

interface StatusDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  collection: StatusCollection | null;
  currentStatusIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onNextCollection: () => void;
  onPreviousCollection: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  canGoNextCollection: boolean;
  canGoPreviousCollection: boolean;
  onViewStatus: (statusId: string) => void;
}

export function StatusDetailsModal({
  opened,
  onClose,
  collection,
  currentStatusIndex,
  onNext,
  onPrevious,
  onNextCollection,
  onPreviousCollection,
  canGoNext,
  canGoPrevious,
  canGoNextCollection,
  canGoPreviousCollection,
  onViewStatus,
}: StatusDetailsModalProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const currentStatus = collection?.statuses[currentStatusIndex];

  useEffect(() => {
    if (!currentStatus) return;

    // Mark as viewed only if not already viewed
    if (!currentStatus.isViewed) {
      onViewStatus(currentStatus.id);
    }

    // Reset progress and start playing
    setProgress(0);
    setIsPlaying(true);

    const duration =
      currentStatus.media && currentStatus.media.length > 0 && currentStatus.media[0].mediaType === "video"
        ? currentStatus.media[0].duration || 5
        : 5;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (duration * 10);
        if (newProgress >= 100) {
          setIsPlaying(false);
          // Auto-advance to next status
          setTimeout(() => {
            if (canGoNext) {
              onNext();
            } else if (canGoNextCollection) {
              onNextCollection();
            } else {
              onClose();
            }
          }, 500);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [
    currentStatus?.id,
    canGoNext,
    canGoNextCollection,
    onNext,
    onNextCollection,
    onClose,
  ]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTimeRemaining = () => {
    if (!currentStatus) return "";
    const expiresAt = new Date(currentStatus.expiresAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Expires soon";
    return `${diffInHours}h left`;
  };

  if (!collection || !currentStatus) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="100%"
      padding={0}
      withCloseButton={false}
      centered
      styles={{
        content: {
          backgroundColor: "var(--mantine-color-dark-9)",
          border: "none",
          borderRadius: 0,
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Box
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          backgroundColor: "var(--mantine-color-dark-9)",
        }}
      >
        {/* Progress indicators */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "16px",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        >
          <Group gap="4px" mb="md">
            {collection.statuses.map((_, index) => (
              <Box
                key={index}
                style={{
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor:
                    index < currentStatusIndex
                      ? "rgba(255, 255, 255, 0.9)"
                      : index === currentStatusIndex
                        ? `rgba(255, 255, 255, ${0.3 + (progress / 100) * 0.6})`
                        : "rgba(255, 255, 255, 0.3)",
                  flex: 1,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Group>

          {/* Header */}
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Avatar
                src={collection.author.avatar}
                alt={collection.author.firstName || "User"}
                size={40}
                radius="xl"
                style={{ border: "2px solid rgba(255, 255, 255, 0.2)" }}
              >
                {(collection.author.firstName || "U").charAt(0)}
              </Avatar>
              <Box>
                <Group gap="xs" align="center">
                  <Text fw={600} size="sm" >
                    {collection.author.firstName} {collection.author.lastName}
                  </Text>
                  {collection.author.isVerified && (
                    <Badge size="xs" color="blue" variant="light">
                      ✓
                    </Badge>
                  )}
                </Group>
                <Text size="xs" opacity={0.7}>
                  {formatTimeAgo(currentStatus.createdAt)} •{" "}
                  {getTimeRemaining()}
                </Text>
              </Box>
            </Group>

            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={onClose}
            >
              <IconX size={20} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Media content */}
        <Box
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {currentStatus.media && currentStatus.media.length > 0 ? (
            currentStatus.media[0].mediaType === "image" ? (
              <Image
                src={currentStatus.media[0].url}
                alt="Status"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <video
                  src={currentStatus.media[0].url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  muted
                  loop
                  autoPlay={isPlaying}
                  playsInline
                  onEnded={() => setIsPlaying(false)}
                />
            )
          ) : (
            <Box
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--mantine-color-gray-1)",
              }}
            >
              <Text c="dimmed">No media available</Text>
            </Box>
          )}

          {/* Navigation areas */}
          <Box
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "30%",
              zIndex: 5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (canGoPrevious) {
                onPrevious();
              } else if (canGoPreviousCollection) {
                onPreviousCollection();
              }
            }}
          />

          <Box
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "30%",
              zIndex: 5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (canGoNext) {
                onNext();
              } else if (canGoNextCollection) {
                onNextCollection();
              }
            }}
          />

          {/* Play/Pause indicator */}
          {!isPlaying && currentStatus.media && currentStatus.media.length > 0 && currentStatus.media[0].mediaType === "video" && (
            <Box
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                zIndex: 3,
              }}
            >
              <Box
                style={{
                  width: "0",
                  height: "0",
                  borderLeft: "20px solid white",
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  marginLeft: "6px",
                }}
              />
            </Box>
          )}
        </Box>

        {/* Bottom section with content and actions */}
        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
            padding: "20px 16px 16px",
            zIndex: 10,
          }}
        >
          {/* Content text */}
          {currentStatus.content && (
            <Text

              size="md"
              mb="md"
              style={{
                lineHeight: 1.5,
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                wordBreak: "break-word",
              }}
            >
              {currentStatus.content}
            </Text>
          )}

          {/* Action buttons */}
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                color={isLiked ? "red" : "white"}
                size="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <IconHeart size={24} fill={isLiked ? "currentColor" : "none"} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="white"
                size="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle share
                }}
              >
                <IconShare size={24} />
              </ActionIcon>
            </Group>

            {/* View count */}
            <Group gap="xs" align="center">
              <Text size="sm" opacity={0.7} fw={500}>
                {currentStatus.viewsCount}{" "}
                {currentStatus.viewsCount === 1 ? "view" : "views"}
              </Text>
            </Group>
          </Group>
        </Box>

        {/* Navigation arrows */}
        {(canGoPrevious || canGoPreviousCollection) && (
          <ActionIcon
            variant="filled"
            color="rgba(255, 255, 255, 0.2)"
            size="xl"
            radius="xl"
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backdropFilter: "blur(10px)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (canGoPrevious) {
                onPrevious();
              } else if (canGoPreviousCollection) {
                onPreviousCollection();
              }
            }}
          >
            <IconChevronLeft size={24} color="white" />
          </ActionIcon>
        )}

        {(canGoNext || canGoNextCollection) && (
          <ActionIcon
            variant="filled"
            color="rgba(255, 255, 255, 0.2)"
            size="xl"
            radius="xl"
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backdropFilter: "blur(10px)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (canGoNext) {
                onNext();
              } else if (canGoNextCollection) {
                onNextCollection();
              }
            }}
          >
            <IconChevronRight size={24} color="white" />
          </ActionIcon>
        )}
      </Box>
    </Modal>
  );
}
