import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Button,
} from "@mantine/core";
import { IconEye, IconTrash, IconX, IconHeart, IconShare } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useStatusStore } from "../../stores/statusStore";
import { Status } from "../../types";

interface StatusCardProps {
  status: Status;
  autoPlay?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showProgress?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

export function StatusCard({
  status,
  autoPlay = false,
  onClose,
  onNext,
  onPrevious,
  showProgress = false,
  currentIndex = 0,
  totalCount = 1,
}: StatusCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { viewStatus, deleteStatus } = useStatusStore();
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const isAuthor = user?.id === status.author.id;
  const duration = status.media.type === "video" ? status.media.duration || 5 : 5;

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 100 / (duration * 10);
          if (newProgress >= 100) {
            setIsPlaying(false);
            if (onNext) {
              setTimeout(() => onNext(), 500);
            }
            return 0;
          }
          return newProgress;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration, onNext]);

  useEffect(() => {
    if (autoPlay && !status.isViewed && isAuthenticated && user) {
      viewStatus(status.id, user.id);
      setIsPlaying(true);
    }
  }, [autoPlay, status.isViewed, status.id, isAuthenticated, user, viewStatus]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleDelete = () => {
    deleteStatus(status.id);
    setShowDeleteConfirm(false);
    if (onClose) onClose();
  };

  const handleClick = () => {
    if (!isPlaying && !status.isViewed && isAuthenticated && user) {
      viewStatus(status.id, user.id);
    }
    setIsPlaying(!isPlaying);
  };

  const getTimeRemaining = () => {
    const expiresAt = new Date(status.expiresAt);
    const now = new Date();
    const diffInHours = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Expires soon";
    return `${diffInHours}h left`;
  };

  return (
    <>
      <Box
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#000",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header with progress bars */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
            padding: "16px",
          }}
        >
          {/* Progress indicators */}
          {showProgress && totalCount > 1 && (
            <Group gap="4px" mb="md">
              {Array.from({ length: totalCount }).map((_, index) => (
                <Box
                  key={index}
                  style={{
                    height: "2px",
                    borderRadius: "1px",
                    backgroundColor: index < currentIndex
                      ? "rgba(255, 255, 255, 0.9)"
                      : index === currentIndex
                        ? `rgba(255, 255, 255, ${0.3 + (progress / 100) * 0.6})`
                        : "rgba(255, 255, 255, 0.3)",
                    flex: 1,
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Group>
          )}

          {/* Header content */}
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Avatar
                src={status.author.avatar}
                alt={status.author.firstName || "User"}
                size={40}
                radius="xl"
                style={{ border: "2px solid rgba(255, 255, 255, 0.2)" }}
              >
                {(status.author.firstName || "U").charAt(0)}
              </Avatar>
              <Box>
                <Group gap="xs" align="center">
                  <Text fw={600} size="sm" c="white">
                    {status.author.firstName} {status.author.lastName}
                  </Text>
                  {status.author.isVerified && (
                    <Badge size="xs" color="blue" variant="light">
                      ✓
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="rgba(255, 255, 255, 0.7)">
                  {formatTimeAgo(status.createdAt)} • {getTimeRemaining()}
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              {isAuthor && (
                <ActionIcon
                  variant="subtle"
                  color="white"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}

              {onClose && (
                <ActionIcon
                  variant="subtle"
                  color="white"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Box>

        {/* Media content */}
        <Box
          style={{
            position: "relative",
            width: "100%",
            height: "600px",
            cursor: "pointer",
          }}
          onClick={handleClick}
        >
          {status.media.type === "image" ? (
            <Image
              src={status.media.url}
              alt="Status"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <video
              src={status.media.url}
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
          )}

          {/* Navigation areas */}
          {onPrevious && (
            <Box
              style={{
                position: "absolute",
                left: 0,
                top: 80,
                bottom: 80,
                width: "25%",
                zIndex: 5,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
            />
          )}

          {onNext && (
            <Box
              style={{
                position: "absolute",
                right: 0,
                top: 80,
                bottom: 80,
                width: "25%",
                zIndex: 5,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            />
          )}

          {/* Play/Pause indicator */}
          {!isPlaying && status.media.type === "video" && (
            <Box
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60px",
                height: "60px",
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
                  borderLeft: "12px solid white",
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  marginLeft: "3px",
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
            background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
            padding: "20px 16px 16px",
            zIndex: 10,
          }}
        >
          {/* Content text */}
          {status.content && (
            <Text
              c="white"
              size="sm"
              mb="md"
              style={{
                lineHeight: 1.5,
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                wordBreak: "break-word",
              }}
            >
              {status.content}
            </Text>
          )}

          {/* Action buttons */}
          <Group justify="space-between" align="center">
            <Group gap="md">
              {!isAuthor && (
                <>
                  <ActionIcon
                    variant="subtle"
                    color={isLiked ? "red" : "white"}
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(!isLiked);
                    }}
                  >
                    <IconHeart size={20} fill={isLiked ? "currentColor" : "none"} />
                  </ActionIcon>

                  <ActionIcon
                    variant="subtle"
                    color="white"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle share
                    }}
                  >
                    <IconShare size={20} />
                  </ActionIcon>
                </>
              )}
            </Group>

            {/* View count for author */}
            {isAuthor && (
              <Group gap="xs" align="center">
                <IconEye size={16} color="rgba(255, 255, 255, 0.7)" />
                <Text size="sm" c="rgba(255, 255, 255, 0.7)" fw={500}>
                  {status.viewsCount} {status.viewsCount === 1 ? "view" : "views"}
                </Text>
              </Group>
            )}
          </Group>
        </Box>
      </Box>

      {/* Delete confirmation modal */}
      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Status"
        size="sm"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete this status? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
