import {
  ActionIcon,
  Box,
  Button,
  FileInput,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  Textarea,
  Avatar,
  Card,
  Progress,
  Badge,
} from "@mantine/core";
import {
  IconPhoto,
  IconSend,
  IconX,
  IconVideo,
  IconUpload
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useStatusStore } from "../../stores/statusStore";
import { Status } from "../../types";

interface CreateStatusProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateStatus({ opened, onClose }: CreateStatusProps) {
  const { user } = useAuthStore();
  const { addStatus } = useStatusStore();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (file: File | null) => {
    if (!file) return;

    const isValidType =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit

    if (!isValidType) {
      alert("Please select a valid image or video file");
      return;
    }

    if (!isValidSize) {
      alert("File size must be less than 100MB");
      return;
    }

    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setMedia(null);
    setPreviewUrl("");
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!media) {
      alert("Please select an image or video to share");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      let duration: number | undefined;
      if (media.type.startsWith("video/")) {
        duration = await getVideoDuration(media);
      }

      const newStatus: Status = {
        id: Date.now().toString(),
        author: {
          id: user?.id || "1",
          phoneNumber: user?.phoneNumber || "",
          username: user?.firstName?.toLowerCase() || "user",
          firstName: user?.firstName || "User",
          lastName: user?.lastName || "",
          avatar: user?.avatar,
          isVerified: user?.isVerified || false,
          isProfileComplete: user?.isProfileComplete || false,
          createdAt: user?.createdAt || new Date().toISOString(),
          updatedAt: user?.updatedAt || new Date().toISOString(),
          followersCount: user?.followersCount || 0,
          followingCount: user?.followingCount || 0,
          postsCount: user?.postsCount || 0,
        },
        media: {
          id: `media-${Date.now()}`,
          url: URL.createObjectURL(media),
          type: media.type.startsWith("image/") ? "image" : "video",
          filename: media.name,
          size: media.size,
          duration: duration,
          createdAt: new Date().toISOString(),
        },
        content: content.trim() || undefined,
        viewsCount: 0,
        views: [],
        isViewed: false,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpired: false,
      };

      addStatus(newStatus);

      setContent("");
      removeMedia();
      onClose();
    } catch (error) {
      console.error("Error creating status:", error);
      alert("Failed to create status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleClose = () => {
    if (content.trim() || media) {
      if (window.confirm("Are you sure you want to discard this status?")) {
        setContent("");
        removeMedia();
        onClose();
      }
    } else {
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm" align="center">
          <Avatar
            src={user?.avatar}
            alt={user?.firstName || "User"}
            size={36}
            radius="xl"
          >
            {user?.firstName?.charAt(0) || "U"}
          </Avatar>
          <Box>
            <Text fw={600} size="sm">
              Create Status
            </Text>
            <Text size="xs" c="dimmed">
              Share a moment that lasts 24 hours
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      styles={{
        title: {
          width: "100%",
        },
        header: {
          paddingBottom: 12,
          borderBottom: "1px solid #e9ecef",
        },
      }}
    >
      <LoadingOverlay visible={isSubmitting} />

      <Stack gap="lg" mt="md">
        {/* User info */}
        <Group gap="sm">
          <Avatar
            src={user?.avatar}
            alt={user?.firstName || "User"}
            size={48}
            radius="xl"
            style={{
              border: "2px solid #e9ecef",
            }}
          >
            {user?.firstName?.charAt(0) || "U"}
          </Avatar>
          <Box>
            <Group gap="xs" align="center">
              <Text fw={600} size="md">
                {user?.firstName} {user?.lastName}
              </Text>
              {user?.isVerified && (
                <Badge size="xs" color="blue" variant="light">
                  ✓
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              Status will be visible for 24 hours
            </Text>
          </Box>
        </Group>

        {/* Media preview */}
        {media && previewUrl && (
          <Card p="md" withBorder radius="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text fw={500} size="sm">
                  Media Preview
                </Text>
                <ActionIcon
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={removeMedia}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Group>

              {uploadProgress < 100 && (
                <Box>
                  <Progress value={uploadProgress} size="sm" radius="xl" />
                  <Text size="xs" c="dimmed" ta="center" mt="xs">
                    Uploading... {uploadProgress}%
                  </Text>
                </Box>
              )}

              <Box
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  maxHeight: 300,
                  position: "relative",
                }}
              >
                {media.type.startsWith("image/") ? (
                  <Image
                    src={previewUrl}
                    alt="Status preview"
                    fit="cover"
                    style={{ maxHeight: 300 }}
                  />
                ) : (
                  <video
                    src={previewUrl}
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "cover",
                    }}
                    controls
                  />
                )}
              </Box>

              <Group gap="xs" justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  {media.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatFileSize(media.size)}
                </Text>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Media upload section */}
        {!media && (
          <Card p="xl" withBorder radius="md" style={{ border: "2px dashed #e9ecef" }}>
            <Stack gap="lg" align="center">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUpload size={32} color="#868e96" />
              </Box>

              <Box ta="center">
                <Text fw={500} size="lg" mb="xs">
                  Add Photo or Video
                </Text>
                <Text size="sm" c="dimmed" maw={300}>
                  Share a moment with your friends. Choose an image or video to get started.
                </Text>
              </Box>

              <Group gap="sm">
                <FileInput
                  ref={fileInputRef as any}
                  accept="image/*"
                  onChange={handleMediaUpload}
                  style={{ display: "none" }}
                />
                <Button
                  variant="light"
                  leftSection={<IconPhoto size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  radius="xl"
                >
                  Choose Photo
                </Button>

                <FileInput
                  accept="video/*"
                  onChange={handleMediaUpload}
                  style={{ display: "none" }}
                />
                <Button
                  variant="light"
                  leftSection={<IconVideo size={16} />}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "video/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement)?.files?.[0];
                      if (file) handleMediaUpload(file);
                    };
                    input.click();
                  }}
                  radius="xl"
                >
                  Choose Video
                </Button>
              </Group>

              <Text size="xs" c="dimmed" ta="center">
                Supported formats: JPG, PNG, MP4, MOV • Max size: 100MB
              </Text>
            </Stack>
          </Card>
        )}

        {/* Caption input */}
        <Box>
          <Text fw={500} size="sm" mb="xs">
            Caption (Optional)
          </Text>
          <Textarea
            placeholder="Write a caption for your status..."
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            minRows={3}
            maxRows={5}
            autosize
            styles={{
              input: {
                border: "2px solid #e9ecef",
                borderRadius: 12,
                fontSize: 14,
                "&:focus": {
                  borderColor: "#228be6",
                },
              },
            }}
          />
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              Share what's on your mind
            </Text>
            <Text size="xs" c={content.length > 500 ? "red" : "dimmed"}>
              {content.length}/500
            </Text>
          </Group>
        </Box>

        {/* Action buttons */}
        <Group justify="space-between" pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
          <Button
            variant="light"
            onClick={handleClose}
            radius="xl"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!media || content.length > 500}
            leftSection={<IconSend size={16} />}
            radius="xl"
            size="md"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
          >
            Share Status
          </Button>
        </Group>

        {/* Footer info */}
        <Box ta="center" pt="sm" style={{ borderTop: "1px solid #f1f3f4" }}>
          <Text size="xs" c="dimmed">
            🔒 Your status will automatically disappear after 24 hours
          </Text>
        </Box>
      </Stack>
    </Modal>
  );
}
