import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Group,
  Image,
  Menu,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowDown, IconBookmark,
  IconBookmarkFilled,
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconSend,
  IconTrash
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommentSkeletonList } from "../../components/ui";
import { useComments, useCreateComment } from "../../hooks/useComments";
import {
  useBookmarkPost,
  useDeletePost,
  useReactToPost,
  useRemoveReaction,
  useUnbookmarkPost,
  useUpdatePost,
} from "../../hooks/usePosts";
import { CreateCommentRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Post } from "../../types";
import { CommentCard } from "./CommentCard";

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
  isFirst?: boolean;
}

export function PostCard({ post, onUpdate, isFirst = false }: PostCardProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const reactToPostMutation = useReactToPost();
  const removeReactionMutation = useRemoveReaction();
  const bookmarkPostMutation = useBookmarkPost();
  const unbookmarkPostMutation = useUnbookmarkPost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();

  const { data: commentsData, isLoading: commentsLoading } = useComments(
    post.id,
    { limit: 3 }
  );
  const comments = commentsData?.comments || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const isSubmitting =
    updatePostMutation.isPending || deletePostMutation.isPending;
  const isCommenting = createCommentMutation.isPending;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    if (!isAuthenticated) return;

    if (post.isLiked) {
      removeReactionMutation.mutate(post.id);
    } else {
      reactToPostMutation.mutate({ id: post.id, data: { reactionType: "like" } });
    }
  };

  const handleDislike = () => {
    if (!isAuthenticated) return;

    if (post.isDisliked) {
      removeReactionMutation.mutate(post.id);
    } else {
      reactToPostMutation.mutate({ id: post.id, data: { reactionType: "dislike" } });
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) return;

    if (post.isBookmarked) {
      unbookmarkPostMutation.mutate(post.id);
    } else {
      bookmarkPostMutation.mutate({ id: post.id });
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleEdit = () => {
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    updatePostMutation.mutate(
      { id: post.id, data: { content: editContent.trim() } },
      {
        onSuccess: (updatedPost) => {
          if (onUpdate) onUpdate(updatedPost);
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = async () => {
    deletePostMutation.mutate(post.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;

    const commentData: CreateCommentRequest = {
      content: commentContent.trim(),
    };

    createCommentMutation.mutate(
      { postId: post.id, data: commentData },
      {
        onSuccess: () => {
          setCommentContent("");
          if (!showComments) setShowComments(true);
        },
      }
    );
  };

  const isAuthor = user?.id === post?.author?.id;

  // Helper function to render formatted text with newlines
  const renderFormattedText = (
    text: string,
    size: "sm" | "md" | "lg" = "sm",
    spacing: "xs" | "sm" | "md" = "xs"
  ) => {
    const lines = text.split("\n");
    const spacingMap = { xs: "0.25rem", sm: "0.5rem", md: "0.75rem" };

    return (
      <Box>
        {lines.map((line, index) => (
          <Text
            key={index}
            size={size}
            style={{
              lineHeight: 1.6,
              marginBottom: index < lines.length - 1 ? spacingMap[spacing] : 0,
            }}
          >
            {line || "\u00A0"}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <>
      <Card
        style={{
          border: "1px solid var(--mantine-color-gray-2)",
          background: "#ffffff",
          transition: "all 0.2s ease",
          marginBottom: isFirst ? "0.5rem" : "0",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <Avatar
                src={post.author?.avatar}
                alt={post.author?.firstName || "User"}
                size={42}
                radius="xl"
                style={{
                  border: "2px solid var(--mantine-color-gray-1)",
                }}
              >
                {(post.author?.firstName || "U").charAt(0)}
              </Avatar>

              <Box>
                <Group gap={6} align="center">
                  <Text fw={600} size="sm" c="dark.8">
                    {post.author?.firstName} {post.author?.lastName}
                  </Text>
                  {post.author?.isVerified && (
                    <Badge
                      size="xs"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                      radius="xl"
                    >
                      ✓
                    </Badge>
                  )}
                </Group>
                <Group gap={4} align="center">
                  <Text c="dimmed" size="xs">
                    @{post.author?.username || post.author?.phoneNumber}
                  </Text>
                  <Text c="dimmed" size="xs">
                    •
                  </Text>
                  <Text c="dimmed" size="xs">
                    {formatDate(post?.createdAt)}
                    {post?.updatedAt !== post?.createdAt && " (edited)"}
                  </Text>
                </Group>
              </Box>
            </Group>

            {isAuthenticated && (
              <Menu shadow="lg" width={180} position="bottom-end" radius="lg">
                <Menu.Target>
                  <ActionIcon variant="subtle" size="sm" radius="xl">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {isAuthor && (
                    <>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={handleEdit}
                      >
                        Edit Post
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Post
                      </Menu.Item>
                      <Menu.Divider />
                    </>
                  )}
                  <Menu.Item
                    leftSection={<IconFlag size={14} />}
                    color="orange"
                  >
                    Report Post
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          <UnstyledButton
            onClick={handlePostClick}
            style={{
              textAlign: "left",
              borderRadius: "var(--mantine-radius-md)",
              padding: "0.5rem",
              margin: "-0.5rem",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--mantine-color-gray-0)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {renderFormattedText(post.content, "sm", "xs")}
          </UnstyledButton>

          {post?.media && post?.media?.length > 0 && (
            <Box>
              {post?.media?.length === 1 ? (
                <Image
                  src={post?.media[0]?.url}
                  alt={post?.media[0]?.filename}
                  radius="lg"
                  style={{
                    maxHeight: 400,
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onClick={handlePostClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.01)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              ) : (
                <Group gap="xs">
                  {post?.media?.slice(0, 4).map((media, index) => (
                    <Box
                      key={media.id}
                      style={{ position: "relative", flex: 1 }}
                    >
                      <Image
                        src={media.url}
                        alt={media.filename}
                        radius="md"
                        style={{
                          height: 150,
                          objectFit: "cover",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onClick={handlePostClick}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                      {index === 3 &&
                        post?.media &&
                        post?.media?.length > 4 && (
                          <Box
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "var(--mantine-radius-md)",
                            }}
                          >
                            <Text size="lg" fw={600} c="white">
                              +{post?.media?.length - 4}
                            </Text>
                          </Box>
                        )}
                    </Box>
                  ))}
                </Group>
              )}
            </Box>
          )}

          {post?.hashtags && post?.hashtags?.length > 0 && (
            <Group gap="xs">
              {post?.hashtags?.map((hashtag: string) => (
                <Badge
                  key={hashtag}
                  variant="light"
                  color="blue"
                  size="sm"
                  radius="xl"
                  style={{ cursor: "pointer" }}
                >
                  #{hashtag}
                </Badge>
              ))}
            </Group>
          )}

          <Group justify="space-between" align="center">
            <Group gap="lg">
              <Group gap={4}>
                <ActionIcon
                  variant={post?.isLiked ? "filled" : "subtle"}
                  color="red"
                  onClick={handleLike}
                  size="lg"
                  radius="xl"
                  disabled={!isAuthenticated}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                >
                  {post?.isLiked ? (
                    <IconHeartFilled size={16} />
                  ) : (
                    <IconHeart size={16} />
                  )}
                </ActionIcon>
                <Text size="sm" c="dimmed" fw={500}>
                  {post?.likesCount}
                </Text>
              </Group>

              <Group gap={4}>
                <ActionIcon
                  variant={post?.isDisliked ? "filled" : "subtle"}
                  color="gray"
                  onClick={handleDislike}
                  size="lg"
                  radius="xl"
                  disabled={!isAuthenticated}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                >
                  <IconArrowDown size={16} />
                </ActionIcon>
                <Text size="sm" c="dimmed" fw={500}>
                  {post?.dislikesCount}
                </Text>
              </Group>

              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setShowComments(!showComments)}
                  size="lg"
                  radius="xl"
                  style={{
                    transition: "all 0.2s ease",
                  }}
                >
                  <IconMessageCircle size={16} />
                </ActionIcon>
                <Text size="sm" c="dimmed" fw={500}>
                  {post?.commentsCount}
                </Text>
              </Group>
            </Group>

            <ActionIcon
              variant={post?.isBookmarked ? "filled" : "subtle"}
              color="yellow"
              onClick={handleBookmark}
              size="lg"
              radius="xl"
              disabled={!isAuthenticated}
              style={{
                transition: "all 0.2s ease",
              }}
            >
              {post?.isBookmarked ? (
                <IconBookmarkFilled size={16} />
              ) : (
                <IconBookmark size={16} />
              )}
            </ActionIcon>
          </Group>

          {!isAuthenticated && (
            <Box
              p="md"
              style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: "var(--mantine-radius-lg)",
                border: "1px solid var(--mantine-color-blue-2)",
              }}
            >
              <Text size="sm" c="blue.7" ta="center" fw={500}>
                Sign in to interact with posts
              </Text>
            </Box>
          )}

          {isAuthenticated && (
            <Group gap="sm">
              <Avatar size="sm" src={user?.avatar} radius="xl">
                {user?.firstName?.charAt(0)}
              </Avatar>
              <TextInput
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.currentTarget.value)}
                rightSection={
                  <ActionIcon
                    onClick={handleComment}
                    loading={isCommenting}
                    disabled={!commentContent.trim()}
                    color="blue"
                    variant="subtle"
                    radius="xl"
                  >
                    <IconSend size={14} />
                  </ActionIcon>
                }
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                radius="xl"
                style={{ flex: 1 }}
              />
            </Group>
          )}

          <Collapse in={showComments}>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600} c="dark.6">
                  Comments ({post?.commentsCount})
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  rightSection={
                    showComments ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    )
                  }
                  onClick={() => setShowComments(!showComments)}
                  radius="xl"
                >
                  {showComments ? "Hide" : "Show"}
                </Button>
              </Group>

              <Stack gap="sm">
                {commentsLoading ? (
                  <CommentSkeletonList count={2} />
                ) : comments.length > 0 ? (
                  <>
                    {comments.slice(0, 3).map((comment: any) => (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        postId={post.id}
                      />
                    ))}
                    {post?.commentsCount > 3 && (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={handlePostClick}
                        style={{ alignSelf: "center" }}
                        radius="xl"
                      >
                        View all {post?.commentsCount} comments
                      </Button>
                    )}
                  </>
                ) : (
                  <Text size="sm" c="dimmed" ta="center" py="lg">
                    Be the first to comment! 💬
                  </Text>
                )}
              </Stack>
            </Stack>
          </Collapse>
        </Stack>
      </Card>

      <Modal
        opened={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Post"
        size="lg"
        radius="xl"
        centered
      >
        <Stack gap="lg">
          <Textarea
            placeholder="What's on your mind? Use Enter for new lines..."
            value={editContent}
            onChange={(e) => setEditContent(e.currentTarget.value)}
            minRows={4}
            maxRows={10}
            autosize
            radius="lg"
          />

          {/* Preview of edited content */}
          {editContent.trim() && (
            <Box
              p="md"
              style={{
                backgroundColor: "var(--mantine-color-gray-0)",
                borderRadius: "var(--mantine-radius-md)",
                border: "1px solid var(--mantine-color-gray-2)",
              }}
            >
              <Text size="xs" c="dimmed" mb="xs" fw={500}>
                Preview:
              </Text>
              {renderFormattedText(editContent, "sm", "xs")}
            </Box>
          )}

          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              onClick={() => setIsEditing(false)}
              radius="xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              loading={isSubmitting}
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Post"
        size="sm"
        radius="xl"
        centered
      >
        <Stack gap="lg">
          <Text>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              onClick={() => setShowDeleteConfirm(false)}
              radius="xl"
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={isSubmitting}
              radius="xl"
            >
              Delete Post
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
