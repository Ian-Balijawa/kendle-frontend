import {
  ActionIcon,
  Badge,
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
import { usePostStore } from "../../stores/postStore";
import { CreatePostData, Post } from "../../types";

interface CreatePostProps {
  opened: boolean;
  onClose: () => void;
}

export function CreatePost({ opened, onClose }: CreatePostProps) {
  const { user } = useAuthStore();
  const { addPost } = usePostStore();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (files: File[] | null) => {
    if (!files) return;

    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit

      if (!isValidType) {
        return;
      }

      if (!isValidSize) {
        return;
      }

      return isValidType && isValidSize;
    });

    setMedia((prev) => [...prev, ...validFiles]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    const hashtag = hashtagInput.trim().replace(/^#/, "");
    if (hashtag && !hashtags.includes(hashtag) && hashtags.length < 10) {
      setHashtags((prev) => [...prev, hashtag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== hashtag));
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: CreatePostData = {
        content: content.trim(),
        media: media.length > 0 ? media : undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      };

      const newPost: Post = {
        id: Date.now().toString(),
        content: postData.content,
        author: {
          id: user?.id || "1",
          username: user?.firstName?.toLowerCase() || "user",
          firstName: user?.firstName || "User",
          lastName: user?.lastName || "",
          avatar: user?.avatar,
          isVerified: user?.isVerified || false,
          isProfileComplete: user?.isProfileComplete || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          followersCount: user?.followersCount || 0,
          followingCount: user?.followingCount || 0,
          postsCount: user?.postsCount || 0,
          phoneNumber: user?.phoneNumber || "",
        },
        media:
          postData.media?.map((file, index) => ({
            id: `media-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("image/") ? "image" : "video",
            filename: file.name,
            size: file.size,
            createdAt: new Date().toISOString(),
          })) || [],
        likes: [],
        comments: [],
        shares: [],
        upvotes: [],
        downvotes: [],
        isLiked: false,
        isShared: false,
        isBookmarked: false,
        isUpvoted: false,
        isDownvoted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          likes: 0,
          comments: 0,
          shares: 0,
          upvotes: 0,
          downvotes: 0,
        },
      };

      addPost(newPost as unknown as Post);

      setContent("");
      setMedia([]);
      setHashtags([]);
      setHashtagInput("");
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            <Text size="sm" fw={500}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              @{user?.firstName?.toLowerCase() || "user"}
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
          style={{ border: "none", fontSize: "16px" }}
        />

        {media.length > 0 && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Media ({media.length})
            </Text>
            <Group gap="xs">
              {media.map((file, index) => (
                <Box key={index} style={{ position: "relative" }}>
                  {file.type.startsWith("image/") ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width={80}
                      height={80}
                      fit="cover"
                      radius="sm"
                    />
                  ) : (
                    <Box
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "var(--mantine-color-gray-2)",
                        borderRadius: "var(--mantine-radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconVideo
                        size={24}
                        color="var(--mantine-color-gray-6)"
                      />
                    </Box>
                  )}
                  <ActionIcon
                    size="xs"
                    variant="filled"
                    color="red"
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                    }}
                    onClick={() => removeMedia(index)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          </Box>
        )}

        {hashtags.length > 0 && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Hashtags
            </Text>
            <Group gap="xs">
              {hashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="light"
                  color="blue"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={() => removeHashtag(hashtag)}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  #{hashtag}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        <Group gap="xs">
          <TextInput
            placeholder="Add hashtag..."
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.currentTarget.value)}
            onKeyPress={(e) => e.key === "Enter" && addHashtag()}
            leftSection={<IconHash size={16} />}
            style={{ flex: 1 }}
            size="sm"
          />
          <Button
            size="sm"
            variant="light"
            onClick={addHashtag}
            disabled={!hashtagInput.trim() || hashtags.length >= 10}
          >
            Add
          </Button>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <FileInput
              ref={fileInputRef as any}
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
              leftSection={<IconPhoto size={16} />}
              placeholder="Add media"
              size="sm"
              style={{ display: "none" }}
            />
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPhoto size={16} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= 5}
            >
              Media ({media.length}/5)
            </Button>
          </Group>

          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!content.trim() && media.length === 0}
            leftSection={<IconSend size={16} />}
          >
            Post
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          {content.length}/1000 characters
        </Text>
      </Stack>
    </Modal>
  );
}
