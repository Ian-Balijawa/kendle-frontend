import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Image,
  Modal,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconLocation,
  IconMapPin,
  IconPhoto,
  IconSend,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useCreatePost } from "../../hooks/usePosts";
import { CreatePostRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";

interface CreatePostProps {
  opened: boolean;
  onClose: () => void;
}

export function CreatePost({ opened, onClose }: CreatePostProps) {
  const { user } = useAuthStore();
  const createPostMutation = useCreatePost();

  // Main form state
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File[]>([]);
  const [location, setLocation] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  // Post settings
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowShares, setAllowShares] = useState(true);
  const [allowBookmarks, setAllowBookmarks] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = createPostMutation.isPending;

  // Geolocation function
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude},${longitude}`);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please try again.");
        setIsGettingLocation(false);
      },
    );
  };

  // Helper function to convert base64 to File
  const base64ToFile = (
    base64String: string,
    filename: string,
    mimeType: string,
  ): File => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
  };

  // Media handling
  const handleMediaUpload = async (files: File[] | null) => {
    if (!files) return;

    console.log("Selected files:", files);
    files.forEach((file) => {
      console.log(
        `File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`,
      );
    });

    const supportedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const supportedVideoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/webm",
      "video/quicktime",
    ];

    const validFiles = files.filter((file) => {
      const isValidImageType = supportedImageTypes.includes(
        file.type.toLowerCase(),
      );
      const isValidVideoType = supportedVideoTypes.includes(
        file.type.toLowerCase(),
      );

      // Fallback: check file extension if MIME type is not detected
      const fileExtension = file.name.toLowerCase().split(".").pop();
      const supportedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const supportedVideoExtensions = ["mp4", "avi", "mov", "wmv", "webm"];

      const isValidImageExtension = supportedImageExtensions.includes(
        fileExtension || "",
      );
      const isValidVideoExtension = supportedVideoExtensions.includes(
        fileExtension || "",
      );

      const isValidType =
        isValidImageType ||
        isValidVideoType ||
        isValidImageExtension ||
        isValidVideoExtension;
      const isValidSize = file.size <= 500 * 1024 * 1024; // 50MB limit

      if (!isValidType) {
        console.error(
          "Invalid file type:",
          file.type,
          "Extension:",
          fileExtension,
        );
        alert(
          `File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, AVI, MOV, WMV, WebM).`,
        );
        return false;
      }

      if (!isValidSize) {
        console.error(
          "File too large:",
          file.size,
          "bytes. Maximum allowed: 50MB",
        );
        alert(`File "${file.name}" is too large. Maximum file size is 50MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setMedia((prev) => [...prev, ...validFiles].slice(0, 10)); // Max 10 files

      // Generate thumbnails for video files
      const videoFiles = validFiles.filter(
        (file) =>
          file.type.startsWith("video/") ||
          ["mp4", "avi", "mov", "wmv", "webm"].includes(
            file.name.toLowerCase().split(".").pop() || "",
          ),
      );

      if (videoFiles.length > 0) {
        setIsGeneratingThumbnails(true);
        try {
          for (const videoFile of videoFiles) {
            console.log(`Generating thumbnail for: ${videoFile.name}`);
            const thumbnails = await generateVideoThumbnails(
              videoFile,
              1,
              "base64",
            );

            if (thumbnails && thumbnails.length > 0) {
              const thumbnailFile = base64ToFile(
                thumbnails[0],
                `${videoFile.name.split(".")[0]}_thumbnail.jpg`,
                "image/jpeg",
              );

              setThumbnail((prev) => [...prev, thumbnailFile].slice(0, 10));
              console.log(`Generated thumbnail for: ${videoFile.name}`);
            }
          }
        } catch (error) {
          console.error("Error generating thumbnails:", error);
          alert(
            "Failed to generate video thumbnails. Videos will be uploaded without thumbnails.",
          );
        } finally {
          setIsGeneratingThumbnails(false);
        }
      }
    }
  };

  const removeThumbnail = (index: number) => {
    setThumbnail((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMediaAndThumbnail = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
    // Also remove corresponding thumbnail if it exists
    if (index < thumbnail.length) {
      setThumbnail((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      return;
    }

    // Create the post data
    const postData: CreatePostRequest = {
      content: content.trim(),
      type:
        media.length > 0
          ? media.some((f) => f.type.startsWith("video/"))
            ? "video"
            : "image"
          : "text",
      isPublic,
      allowComments,
      allowLikes,
      allowShares,
      allowBookmarks,
      allowReactions,
      media: media.length > 0 ? media : undefined,
      thumbnail: thumbnail.length > 0 ? thumbnail : undefined,
      location: location || undefined,
    };

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        // Reset form
        setContent("");
        setMedia([]);
        setThumbnail([]);
        setLocation("");
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create post:", error);
      },
    });
  };

  const handleClose = () => {
    if (content.trim() || media.length > 0) {
      if (window.confirm("Are you sure you want to discard this post?")) {
        // Reset all state
        setContent("");
        setMedia([]);
        setThumbnail([]);
        setLocation("");
        onClose();
      }
    } else {
      onClose();
    }
  };

  const canSubmit = content.trim() || media.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Post"
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
      styles={{
        content: {
          backgroundColor: "var(--mantine-color-body)",
        },
        header: {
          backgroundColor: "var(--mantine-color-body)",
        },
      }}
    >
      <Stack gap="md">
        {/* Author Header */}
        <Group gap="sm">
          <Avatar
            src={user?.avatar}
            alt={user?.firstName || "User"}
            size={40}
            radius="xl"
          >
            {user?.firstName?.charAt(0) || "U"}
          </Avatar>
          <Box>
            <Text fw={500} size="sm">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text c="dimmed" size="xs">
              @{user?.username || user?.phoneNumber}
            </Text>
          </Box>
        </Group>

        {/* Main Content */}
        <Textarea
          placeholder="What's on your mind? Use Enter for new lines..."
          size="sm"
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={3}
          maxRows={8}
          autosize
          styles={{
            input: {
              border: "none",
              fontSize: "16px",
              padding: 0,
              lineHeight: "1.6",
            },
          }}
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Media ({media.length}/10)
            </Text>
            <Group gap="sm">
              {media.map((file, index) => (
                <Box key={index} style={{ position: "relative" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    radius="md"
                  />
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="filled"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                    }}
                    onClick={() => removeMediaAndThumbnail(index)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          </Stack>
        )}

        {/* Thumbnail Preview */}
        {thumbnail.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Thumbnails ({thumbnail.length}/10)
            </Text>
            <Group gap="sm">
              {thumbnail.map((file, index) => (
                <Box key={index} style={{ position: "relative" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                    radius="md"
                  />
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="filled"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                    }}
                    onClick={() => removeThumbnail(index)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          </Stack>
        )}

        {/* Location */}
        {location && (
          <Group gap="xs">
            <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm" c="blue.6">
              {location}
            </Text>
            <ActionIcon
              size="xs"
              color="red"
              variant="subtle"
              onClick={() => setLocation("")}
            >
              <IconX size={12} />
            </ActionIcon>
          </Group>
        )}

        {/* Post Settings */}
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Post Settings
          </Text>
          <Group grow>
            <Switch
              label="Public"
              checked={isPublic}
              size="sm"
              onChange={(e) => setIsPublic(e.currentTarget.checked)}
            />
            <Switch
              label="Allow Comments"
              checked={allowComments}
              size="sm"
              onChange={(e) => setAllowComments(e.currentTarget.checked)}
            />
            <Switch
              label="Allow Likes"
              checked={allowLikes}
              size="sm"
              onChange={(e) => setAllowLikes(e.currentTarget.checked)}
            />
          </Group>
          <Group grow>
            <Switch
              label="Allow Shares"
              checked={allowShares}
              size="sm"
              onChange={(e) => setAllowShares(e.currentTarget.checked)}
            />
            <Switch
              label="Allow Bookmarks"
              checked={allowBookmarks}
              size="sm"
              onChange={(e) => setAllowBookmarks(e.currentTarget.checked)}
            />
            <Switch
              label="Allow Reactions"
              checked={allowReactions}
              size="sm"
              onChange={(e) => setAllowReactions(e.currentTarget.checked)}
            />
          </Group>
        </Stack>

        {/* Location Input */}
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Location
          </Text>
          <Group gap="sm">
            <TextInput
              placeholder="Add location manually"
              value={location}
              size="sm"
              onChange={(e) => setLocation(e.currentTarget.value)}
              leftSection={<IconLocation size={16} />}
              style={{ flex: 1 }}
            />
            <Button
              variant="light"
              onClick={getCurrentLocation}
              loading={isGettingLocation}
              leftSection={<IconMapPin size={16} />}
              size="sm"
            >
              Use Current Location
            </Button>
          </Group>
        </Stack>

        {/* Actions */}
        <Group justify="space-between">
          <Group gap="sm">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/avi,video/mov,video/wmv,video/webm,video/quicktime,.mp4,.avi,.mov,.wmv,.webm"
              onChange={(e) =>
                handleMediaUpload(Array.from(e.target.files || []))
              }
              style={{ display: "none" }}
            />
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= 10}
              title="Add photos or videos"
            >
              <Group gap={2}>
                <IconPhoto size={16} />
                <IconVideo size={16} />
              </Group>
            </ActionIcon>
            {isGeneratingThumbnails && (
              <Text size="sm" c="dimmed">
                Generating thumbnails...
              </Text>
            )}
          </Group>

          <Group gap="sm">
            <Button variant="light" onClick={handleClose} size="sm">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit || isGeneratingThumbnails}
              loading={isSubmitting || isGeneratingThumbnails}
              leftSection={<IconSend size={16} />}
            >
              {isGeneratingThumbnails ? "Generating thumbnails..." : "Post"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
