import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Image,
  Modal,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { IconEye, IconTrash, IconX } from "@tabler/icons-react";
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

  const isAuthor = user?.id === status.author.id;
  const duration =
    status.media.type === "video" ? status.media.duration || 5 : 5; // Default 5 seconds for images

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 100 / (duration * 10); // Update every 100ms
          if (newProgress >= 100) {
            setIsPlaying(false);
            if (onNext) {
              onNext();
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
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
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

  return (
    <>
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "500px",
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          cursor: "pointer",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
        onClick={handleClick}
      >
        {/* Progress bar */}
        {showProgress && (
          <Box
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              right: 8,
              zIndex: 2,
            }}
          >
            <Group gap="xs">
              {Array.from({ length: totalCount }).map((_, index) => (
                <Progress
                  key={index}
                  value={
                    index < currentIndex
                      ? 100
                      : index === currentIndex
                        ? progress
                        : 0
                  }
                  size="xs"
                  radius="xl"
                  style={{ flex: 1 }}
                  color="white"
                  bg="rgba(255, 255, 255, 0.3)"
                />
              ))}
            </Group>
          </Box>
        )}

        {/* Close button */}
        {onClose && (
          <ActionIcon
            variant="filled"
            color="rgba(0, 0, 0, 0.5)"
            size="lg"
            radius="xl"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 3,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <IconX size={18} color="white" />
          </ActionIcon>
        )}

        {/* Media */}
        {status.media.type === "image" ? (
          <Image
            src={status.media.url}
            alt="Status"
            fit="cover"
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
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Overlay gradient */}
        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
            zIndex: 1,
          }}
        />

        {/* Author info */}
        <Group
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 2,
          }}
          justify="space-between"
          align="flex-end"
        >
          <Group gap="sm">
            <Avatar
              src={status.author.avatar}
              alt={status.author.firstName || "User"}
              size="md"
              radius="xl"
              style={{
                border: "2px solid white",
              }}
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
                    Verified
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="rgba(255, 255, 255, 0.8)">
                {formatTimeAgo(status.createdAt)}
              </Text>
            </Box>
          </Group>

          {/* Actions */}
          <Stack align="center" gap="xs">
            {isAuthor && (
              <ActionIcon
                variant="filled"
                color="rgba(255, 255, 255, 0.2)"
                size="lg"
                radius="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
              >
                <IconTrash size={18} color="white" />
              </ActionIcon>
            )}

            {isAuthor && (
              <Group gap={4} align="center">
                <ActionIcon
                  variant="filled"
                  color="rgba(255, 255, 255, 0.2)"
                  size="md"
                  radius="xl"
                >
                  <IconEye size={14} color="white" />
                </ActionIcon>
                <Text size="xs" c="white" fw={500}>
                  {status.viewsCount}
                </Text>
              </Group>
            )}
          </Stack>
        </Group>

        {/* Content */}
        {status.content && (
          <Box
            style={{
              position: "absolute",
              bottom: 80,
              left: 16,
              right: 16,
              zIndex: 2,
            }}
          >
            <Text
              c="white"
              size="sm"
              style={{
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                lineHeight: 1.4,
              }}
            >
              {status.content}
            </Text>
          </Box>
        )}

        {/* Navigation areas for touch */}
        {onPrevious && (
          <Box
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "30%",
              zIndex: 1,
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
              top: 0,
              bottom: 0,
              width: "30%",
              zIndex: 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          />
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Status"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this status? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <ActionIcon
              variant="light"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </ActionIcon>
            <ActionIcon color="red" onClick={handleDelete}>
              Delete
            </ActionIcon>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
