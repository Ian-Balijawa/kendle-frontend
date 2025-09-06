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
  IconUpload,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCreateStatus } from "../../hooks/useStatuses";
import { CreateStatusData } from "../../types";

interface CreateStatusProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateStatus({ opened, onClose }: CreateStatusProps) {
  const { user } = useAuthStore();
  const createStatusMutation = useCreateStatus();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<"public" | "followers" | "close_friends" | "private">("public");
  const [type, setType] = useState<"image" | "video" | "text">("text");
  const [location, setLocation] = useState("");
  const [expirationHours, setExpirationHours] = useState(24);
  const [allowReplies, setAllowReplies] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowShares, setAllowShares] = useState(true);
  const [allowScreenshots, setAllowScreenshots] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (files: File[] | null) => {
    if (!files || files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit

      if (!isValidType) {
        alert(`File ${file.name} is not a valid image or video`);
        return false;
      }

      if (!isValidSize) {
        alert(`File ${file.name} is too large (max 100MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

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

    setMedia(validFiles);
    setPreviewUrls(validFiles.map(file => URL.createObjectURL(file)));
    setType(validFiles[0].type.startsWith("image/") ? "image" : "video");
  };

  const removeMedia = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setMedia([]);
    setPreviewUrls([]);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      alert("Please add some content or media to share");
      return;
    }

    try {
      const statusData: CreateStatusData = {
        content: content.trim(),
        type: type,
        privacy: privacy,
        media: media.length > 0 ? media : undefined,
        location: location.trim() || undefined,
        allowReplies: allowReplies,
        allowReactions: allowReactions,
        allowShares: allowShares,
        allowScreenshots: allowScreenshots,
        expirationHours: expirationHours,
      };

      await createStatusMutation.mutateAsync(statusData);

      // Reset form
      setContent("");
      setMedia([]);
      setPreviewUrls([]);
      setLocation("");
      setUploadProgress(0);

      onClose();
    } catch (error) {
      console.error("Error creating status:", error);
      alert("Failed to create status. Please try again.");
    }
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
        },
        content: {
          backgroundColor: "var(--mantine-color-body)",
        },
      }}
    >
      <LoadingOverlay visible={createStatusMutation.isPending} />

      <Stack gap="lg" mt="md">
        {/* User info */}
        <Group gap="sm">
          <Avatar
            src={user?.avatar}
            alt={user?.firstName || "User"}
            size={48}
            radius="xl"
            style={{
              border: "2px solid var(--mantine-color-gray-3)",
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
        {media.length > 0 && previewUrls.length > 0 && (
          <Card p="md" withBorder radius="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text fw={500} size="sm">
                  Media Preview ({media.length} file{media.length > 1 ? 's' : ''})
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {previewUrls.map((url, index) => (
                  <Box
                    key={index}
                    style={{
                      borderRadius: 8,
                      overflow: "hidden",
                      maxHeight: 200,
                      position: "relative",
                    }}
                  >
                    {media[index].type.startsWith("image/") ? (
                      <Image
                        src={url}
                        alt={`Status preview ${index + 1}`}
                        fit="cover"
                        style={{ maxHeight: 200 }}
                      />
                    ) : (
                      <video
                          src={url}
                          style={{
                            width: "100%",
                          maxHeight: 200,
                          objectFit: "cover",
                        }}
                        controls
                      />
                    )}
                  </Box>
                ))}
              </div>

              <Group gap="xs" justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  {media.length} file{media.length > 1 ? 's' : ''} selected
                </Text>
                <Text size="xs" c="dimmed">
                  {formatFileSize(media.reduce((total, file) => total + file.size, 0))}
                </Text>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Media upload section */}
        {media.length === 0 && (
          <Card
            p="xl"
            radius="md"
          >
            <Stack gap="lg" align="center">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "var(--mantine-color-gray-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUpload size={32} color="var(--mantine-color-gray-6)" />
              </Box>

              <Box ta="center">
                <Text fw={500} size="lg" mb="xs">
                  Add Photo or Video
                </Text>
                <Text size="sm" c="dimmed" maw={300}>
                  Share a moment with your friends. Choose an image or video to
                  get started.
                </Text>
              </Box>

              <Group gap="sm">
                <FileInput
                  ref={fileInputRef as any}
                  accept="image/*,video/*"
                  multiple
                  onChange={(files) => handleMediaUpload(files)}
                  style={{ display: "none" }}
                />
                <Button
                  variant="light"
                  leftSection={<IconPhoto size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  radius="xl"
                >
                  Choose Media
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
                border: "2px solid var(--mantine-color-gray-3)",
                borderRadius: 12,
                fontSize: 14,
                "&:focus": {
                  borderColor: "var(--mantine-color-blue-6)",
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

        {/* Additional settings */}
        <Box>
          <Text fw={500} size="sm" mb="xs">
            Settings
          </Text>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm">Privacy</Text>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="public">Public</option>
                <option value="followers">Followers Only</option>
                <option value="close_friends">Close Friends</option>
                <option value="private">Private</option>
              </select>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Expires in</Text>
              <select
                value={expirationHours}
                onChange={(e) => setExpirationHours(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--mantine-color-gray-3)',
                  fontSize: '14px',
                }}
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Allow replies</Text>
              <input
                type="checkbox"
                checked={allowReplies}
                onChange={(e) => setAllowReplies(e.target.checked)}
              />
            </Group>

            <Group justify="space-between">
              <Text size="sm">Allow reactions</Text>
              <input
                type="checkbox"
                checked={allowReactions}
                onChange={(e) => setAllowReactions(e.target.checked)}
              />
            </Group>

            <Group justify="space-between">
              <Text size="sm">Allow shares</Text>
              <input
                type="checkbox"
                checked={allowShares}
                onChange={(e) => setAllowShares(e.target.checked)}
              />
            </Group>

            <Group justify="space-between">
              <Text size="sm">Allow screenshots</Text>
              <input
                type="checkbox"
                checked={allowScreenshots}
                onChange={(e) => setAllowScreenshots(e.target.checked)}
              />
            </Group>
          </Stack>
        </Box>

        {/* Action buttons */}
        <Group
          justify="space-between"
          pt="md"
        >
          <Button variant="light" onClick={handleClose} radius="xl" size="md">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createStatusMutation.isPending}
            disabled={(!content.trim() && media.length === 0) || content.length > 500}
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
        <Box
          ta="center"
          pt="sm"
        >
          <Text size="xs" c="dimmed">
            🔒 Your status will automatically disappear after 24 hours
          </Text>
        </Box>
      </Stack>
    </Modal>
  );
}
