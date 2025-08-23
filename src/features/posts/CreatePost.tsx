import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconHash,
  IconPhoto,
  IconSend,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCreatePost } from "../../hooks/usePosts";
import { CreatePostRequest } from "../../services/api";

interface CreatePostProps {
  opened: boolean;
  onClose: () => void;
}

export function CreatePost({ opened, onClose }: CreatePostProps) {
  const { user } = useAuthStore();
  const createPostMutation = useCreatePost();

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = createPostMutation.isPending;

  const handleMediaUpload = (files: File[] | null) => {
    if (!files) return;

    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit

      if (!isValidType) {
        console.error("Invalid file type:", file.type);
        return false;
      }

      if (!isValidSize) {
        console.error("File too large:", file.size);
        return false;
      }

      return true;
    });

    setMedia((prev) => [...prev, ...validFiles].slice(0, 4)); // Max 4 files
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHashtagAdd = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags((prev) => [...prev, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleHashtagAdd();
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    // Create the post data
    const postData: CreatePostRequest = {
      content: content.trim(),
      type: "text",
      isPublic: true,
      allowComments: true,
      allowLikes: true,
      allowShares: true,
      allowBookmarks: true,
      allowVoting: true,
    };

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        // Reset form
        setContent("");
        setMedia([]);
        setHashtags([]);
        setHashtagInput("");

        // Close modal
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create post:", error);
        // You could show a notification here
      },
    });
  };

  const handleClose = () => {
    if (content.trim() || media.length > 0) {
      if (window.confirm("Are you sure you want to discard this post?")) {
        setContent("");
        setMedia([]);
        setHashtags([]);
        setHashtagInput("");
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
      title="Create Post"
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
            <Text fw={500} size="sm">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text c="dimmed" size="xs">
              @{user?.username || user?.phoneNumber}
            </Text>
          </Box>
        </Group>

        <Textarea
          placeholder="What's on your mind?"
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
            },
          }}
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Media ({media.length}/4)
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
                    onClick={() => removeMedia(index)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          </Stack>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <Group gap="xs">
            {hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="light"
                color="blue"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => removeHashtag(tag)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
              >
                #{tag}
              </Badge>
            ))}
          </Group>
        )}

        {/* Hashtag Input */}
        <TextInput
          placeholder="Add hashtags (press Enter or comma to add)"
          value={hashtagInput}
          onChange={(e) => setHashtagInput(e.currentTarget.value)}
          onKeyPress={handleHashtagKeyPress}
          leftSection={<IconHash size={16} />}
          rightSection={
            hashtagInput.trim() && (
              <ActionIcon onClick={handleHashtagAdd} variant="light">
                <IconSend size={16} />
              </ActionIcon>
            )
          }
        />

        {/* Actions */}
        <Group justify="space-between">
          <Group gap="sm">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                handleMediaUpload(Array.from(e.target.files || []))
              }
              style={{ display: "none" }}
            />
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= 4}
            >
              <IconPhoto size={20} />
            </ActionIcon>
            <ActionIcon variant="light" size="lg" disabled>
              <IconVideo size={20} />
            </ActionIcon>
          </Group>

          <Group gap="sm">
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              loading={isSubmitting}
              leftSection={<IconSend size={16} />}
            >
              Post
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
