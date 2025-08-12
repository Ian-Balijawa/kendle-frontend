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
} from "@mantine/core";
import { IconPhoto, IconSend, IconX } from "@tabler/icons-react";
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

    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setMedia(null);
    setPreviewUrl("");
  };

  const handleSubmit = async () => {
    if (!media) {
      alert("Please select an image or video to share");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Get video duration if it's a video
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

      // Reset form
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Status"
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <LoadingOverlay visible={isSubmitting} />

      <Stack gap="md">
        <Group gap="sm">
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "var(--mantine-color-primary-6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {user?.firstName?.charAt(0) || "U"}
          </Box>
          <Box>
            <Text size="sm" fw={500}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              Status • Visible for 24 hours
            </Text>
          </Box>
        </Group>

        {media && previewUrl && (
          <Box style={{ position: "relative" }}>
            <Text size="sm" fw={500} mb="xs">
              Preview
            </Text>
            <Box
              style={{
                position: "relative",
                borderRadius: "var(--mantine-radius-md)",
                overflow: "hidden",
                maxHeight: 300,
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
              <ActionIcon
                size="sm"
                variant="filled"
                color="red"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
                onClick={removeMedia}
              >
                <IconX size={12} />
              </ActionIcon>
            </Box>
          </Box>
        )}

        {!media && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Add Media
            </Text>
            <Group gap="xs">
              <FileInput
                ref={fileInputRef as any}
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                style={{ display: "none" }}
              />
              <Button
                variant="light"
                leftSection={<IconPhoto size={16} />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
              >
                Choose Photo or Video
              </Button>
            </Group>
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              Max size: 100MB • Supported: JPG, PNG, MP4, MOV
            </Text>
          </Box>
        )}

        <Textarea
          placeholder="Add a caption... (optional)"
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={2}
          maxRows={4}
          autosize
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!media}
            leftSection={<IconSend size={16} />}
          >
            Share Status
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          Your status will be visible to your followers for 24 hours
        </Text>
      </Stack>
    </Modal>
  );
}
