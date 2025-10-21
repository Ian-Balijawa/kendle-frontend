import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconPlus, IconSend, IconX } from "@tabler/icons-react";
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

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = createPostMutation.isPending;

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
      const isValidSize = file.size <= 100 * 1024 * 1024;

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
          "bytes. Maximum allowed: 100MB",
        );
        alert(`File "${file.name}" is too large. Maximum file size is 100MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setMedia((prev) => [...prev, ...validFiles].slice(0, 10));

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
    if (index < thumbnail.length) {
      setThumbnail((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      return;
    }

    const postData: CreatePostRequest = {
      content: content.trim(),
      type:
        media.length > 0
          ? media.some((f) => f.type.startsWith("video/"))
            ? "video"
            : "image"
          : "text",
      media: media.length > 0 ? media : undefined,
      thumbnail: thumbnail.length > 0 ? thumbnail : undefined,
    };

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        setContent("");
        setMedia([]);
        setThumbnail([]);
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
        setContent("");
        setMedia([]);
        setThumbnail([]);
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
      size="xl"
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
      <Stack gap="sm">
        <Group gap="sm">
          <Avatar
            src={user?.avatar || user?.avatar}
            alt={user?.firstName || "User"}
            size={40}
            radius="xl"
          >
            {user?.firstName?.charAt(0).toUpperCase() || "U"}
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

        <Textarea
          placeholder="Create a post..."
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
              lineHeight: "1.6",
            },
          }}
        />

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
                    fit="contain"
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
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= 10}
              title="Add photos or videos"
              size="sm"
              leftSection={<IconPlus size={16} />}
            >
              Add media
            </Button>
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
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              {isGeneratingThumbnails ? "Generating thumbnails..." : "Post"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
