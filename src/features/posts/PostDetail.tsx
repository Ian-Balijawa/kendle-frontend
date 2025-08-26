import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  Paper,
  rem,
  Stack,
  Text,
  Textarea,
  TextInput,
  Transition,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBookmark,
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconHeart,
  IconMessageCircle,
  IconSend,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommentSkeletonList, PostDetailSkeleton } from "../../components/ui";
import { useCreateComment, useInfiniteComments } from "../../hooks/useComments";
import {
  useBookmarkPost,
  useDeletePost,
  useLikePost,
  usePost,
  useRemoveVote,
  useSharePost,
  useUnbookmarkPost,
  useUnlikePost,
  useUpdatePost,
  useVotePost,
} from "../../hooks/usePosts";
import { CreateCommentRequest, UpdatePostRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { CommentCard } from "./CommentCard";

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // React Query hooks
  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = usePost(postId!);
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: commentsLoading,
  } = useInfiniteComments(postId!, { limit: 20 });

  // Mutations
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const bookmarkPostMutation = useBookmarkPost();
  const unbookmarkPostMutation = useUnbookmarkPost();
  const votePostMutation = useVotePost();
  const removeVoteMutation = useRemoveVote();
  const sharePostMutation = useSharePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  // Loading states
  const isSubmitting =
    updatePostMutation.isPending || deletePostMutation.isPending;
  const isCommenting = createCommentMutation.isPending;

  // Flatten comments from all pages
  const comments = commentsData?.pages.flatMap((page) => page.comments) || [];

  if (postLoading) {
    return <PostDetailSkeleton />;
  }

  if (postError || !post) {
    return (
      <Center py={60}>
        <Paper p="xl" radius="lg" withBorder w="100%" maw={400}>
          <Stack align="center" gap="lg">
            <Box
              w={60}
              h={60}
              bg="red.1"
              style={{
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="xl" c="red.6">
                !
              </Text>
            </Box>
            <Stack gap="xs" align="center">
              <Text size="lg" fw={600} c="red.6">
                Post not found
              </Text>
              <Text c="dimmed" ta="center" size="sm">
                This post doesn't exist or has been removed.
              </Text>
            </Stack>
            <Button
              variant="light"
              size="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/dashboard")}
            >
              Back to Home
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    if (!isAuthenticated) return;
    if (post.isLiked) {
      unlikePostMutation.mutate(post.id);
    } else {
      likePostMutation.mutate(post.id);
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

  const handleShare = () => {
    if (!isAuthenticated) return;
    sharePostMutation.mutate({ id: post.id });
  };

  const handleUpvote = () => {
    if (!isAuthenticated) return;
    if (post.isUpvoted) {
      removeVoteMutation.mutate(post.id);
    } else {
      votePostMutation.mutate({ id: post.id, data: { voteType: "upvote" } });
    }
  };

  const handleDownvote = () => {
    if (!isAuthenticated) return;
    if (post.isDownvoted) {
      removeVoteMutation.mutate(post.id);
    } else {
      votePostMutation.mutate({ id: post.id, data: { voteType: "downvote" } });
    }
  };

  const handleEdit = () => {
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    const updateData: UpdatePostRequest = {
      content: editContent.trim(),
    };

    updatePostMutation.mutate(
      { id: post.id, data: updateData },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (error) => {
          console.error("Failed to update post:", error);
        },
      }
    );
  };

  const handleDelete = async () => {
    deletePostMutation.mutate(post.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        navigate("/dashboard");
      },
      onError: (error) => {
        console.error("Failed to delete post:", error);
      },
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
          setShowCommentInput(false);
        },
        onError: (error) => {
          console.error("Failed to post comment:", error);
        },
      }
    );
  };

  const isAuthor = user?.id === post?.author?.id;
  const netScore = post?.upvotesCount - post?.downvotesCount;

  // Helper function to render formatted text with newlines
  const renderFormattedText = (
    text: string,
    size: "sm" | "md" | "lg" = "md",
    spacing: "xs" | "sm" | "md" = "sm"
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
            c="dark.7"
          >
            {line || "\u00A0"}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <Box mx="auto" p="md">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <ActionIcon
          variant="light"
          size="lg"
          radius="xl"
          onClick={() => navigate(-1)}
        >
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Text fw={600} size="lg" c="dark.7" style={{ maxWidth: "60%" }}>
          {post.content.split("\n")[0].slice(0, 50)}
          {post.content.split("\n")[0].length > 50 ? "..." : ""}
        </Text>
        <Box w={40} />
      </Group>

      {/* Main Post Card */}
      <Paper
        withBorder
        radius="xl"
        p={0}
        mb="xl"
        style={{ overflow: "hidden" }}
      >
        <Box p="xl">
          {/* Author Header */}
          <Group justify="space-between" mb="lg">
            <Group gap="md">
              <Avatar
                src={post?.author?.avatar}
                alt={post?.author?.firstName || "User"}
                size={48}
                radius="xl"
                style={{
                  border: post?.author?.isVerified
                    ? "2px solid var(--mantine-color-blue-5)"
                    : "none",
                }}
              >
                {(post?.author?.firstName || "U").charAt(0)}
              </Avatar>
              <Box>
                <Group gap="xs" align="center">
                  <Text fw={600} size="md" c="dark.8">
                    {post?.author?.firstName} {post?.author?.lastName}
                  </Text>
                  {post?.author?.isVerified && (
                    <Badge size="xs" color="blue" radius="sm" variant="filled">
                      ✓
                    </Badge>
                  )}
                </Group>
                <Group gap="xs" align="center">
                  <Text c="dimmed" size="sm">
                    @{post?.author?.username || post?.author?.phoneNumber}
                  </Text>
                  <Text c="dimmed" size="xs">
                    •
                  </Text>
                  <Text c="dimmed" size="sm">
                    {formatDate(post?.createdAt)}
                    {post?.updatedAt !== post?.createdAt && " (edited)"}
                  </Text>
                </Group>
              </Box>
            </Group>

            {isAuthenticated && (
              <Menu shadow="lg" width={180} position="bottom-end" radius="md">
                <Menu.Target>
                  <ActionIcon variant="subtle" size="md" radius="xl">
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
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete
                      </Menu.Item>
                      <Menu.Divider />
                    </>
                  )}
                  <Menu.Item
                    leftSection={<IconFlag size={14} />}
                    color="orange"
                  >
                    Report
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          {/* Post Content */}
          {isEditing ? (
            <Stack gap="md">
              <Textarea
                placeholder="What's on your mind? Use Enter for new lines..."
                value={editContent}
                onChange={(e) => setEditContent(e.currentTarget.value)}
                minRows={4}
                maxRows={10}
                autosize
                radius="md"
                style={{ fontSize: rem(15) }}
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
                  {renderFormattedText(editContent, "md", "sm")}
                </Box>
              )}

              <Group justify="flex-end" gap="sm">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => setIsEditing(false)}
                  radius="xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  loading={isSubmitting}
                  radius="xl"
                >
                  Save
                </Button>
              </Group>
            </Stack>
          ) : (
            <Box mb="lg">{renderFormattedText(post.content, "md", "sm")}</Box>
          )}

          {/* Media */}
          {post?.media && post?.media?.length > 0 && (
            <Box mb="lg">
              {post?.media?.length === 1 ? (
                <Image
                  src={post.media[0].url}
                  alt={post.media[0].filename}
                  radius="lg"
                  style={{ maxHeight: 400, objectFit: "cover" }}
                />
              ) : (
                <Group gap="xs">
                  {post?.media?.map((media) => (
                    <Image
                      key={media.id}
                      src={media.url}
                      alt={media.filename}
                      radius="md"
                      style={{ height: 180, objectFit: "cover", flex: 1 }}
                    />
                  ))}
                </Group>
              )}
            </Box>
          )}

          {/* Hashtags */}
          {post?.hashtags && post?.hashtags?.length > 0 && (
            <Group gap="xs" mb="lg">
              {post?.hashtags?.map((hashtag: string) => (
                <Badge
                  key={hashtag}
                  variant="light"
                  color="blue"
                  size="sm"
                  radius="md"
                  style={{ cursor: "pointer" }}
                >
                  #{hashtag}
                </Badge>
              ))}
            </Group>
          )}
        </Box>

        {/* Actions Bar */}
        <Box px="xl" pb="lg">
          <Divider mb="lg" />
          <Group justify="space-between">
            <Group gap="xl">
              {/* Vote Score */}
              <Group gap="xs">
                <ActionIcon
                  variant={post?.isUpvoted ? "filled" : "subtle"}
                  color={post?.isUpvoted ? "green" : "gray"}
                  onClick={handleUpvote}
                  disabled={!isAuthenticated}
                  size="lg"
                  radius="xl"
                >
                  <IconChevronUp size={18} />
                </ActionIcon>
                <Text
                  fw={600}
                  size="sm"
                  c={netScore > 0 ? "green" : netScore < 0 ? "red" : "dimmed"}
                >
                  {netScore > 0 ? `+${netScore}` : netScore}
                </Text>
                <ActionIcon
                  variant={post?.isDownvoted ? "filled" : "subtle"}
                  color={post?.isDownvoted ? "red" : "gray"}
                  onClick={handleDownvote}
                  disabled={!isAuthenticated}
                  size="lg"
                  radius="xl"
                >
                  <IconChevronDown size={18} />
                </ActionIcon>
              </Group>

              {/* Interactions */}
              <Group gap="lg">
                <Group gap="xs" style={{ cursor: "pointer" }}>
                  <ActionIcon
                    variant={post?.isLiked ? "filled" : "subtle"}
                    color={post?.isLiked ? "red" : "gray"}
                    onClick={handleLike}
                    disabled={!isAuthenticated}
                    size="lg"
                    radius="xl"
                  >
                    <IconHeart size={18} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">
                    {post?.likesCount}
                  </Text>
                </Group>

                <Group
                  gap="xs"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowCommentInput(true)}
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                  >
                    <IconMessageCircle size={18} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">
                    {post?.commentsCount}
                  </Text>
                </Group>

                <Group gap="xs" style={{ cursor: "pointer" }}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={handleShare}
                    disabled={!isAuthenticated}
                    size="lg"
                    radius="xl"
                  >
                    <IconShare size={18} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">
                    {post?.sharesCount}
                  </Text>
                </Group>
              </Group>
            </Group>

            {/* Bookmark */}
            <ActionIcon
              variant={post?.isBookmarked ? "filled" : "subtle"}
              color={post?.isBookmarked ? "yellow" : "gray"}
              onClick={handleBookmark}
              disabled={!isAuthenticated}
              size="lg"
              radius="xl"
            >
              <IconBookmark size={18} />
            </ActionIcon>
          </Group>
        </Box>
      </Paper>

      {/* Comment Input */}
      <Transition
        mounted={showCommentInput && isAuthenticated}
        transition="slide-up"
      >
        {(styles) => (
          <Paper withBorder radius="xl" p="md" mb="xl" style={styles}>
            <Group>
              <Avatar src={user?.avatar} size="md" radius="xl">
                {user?.firstName?.charAt(0) || "U"}
              </Avatar>
              <TextInput
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.currentTarget.value)}
                style={{ flex: 1 }}
                radius="xl"
                rightSection={
                  <ActionIcon
                    onClick={handleComment}
                    loading={isCommenting}
                    disabled={!commentContent.trim()}
                    color="blue"
                    variant={commentContent.trim() ? "filled" : "subtle"}
                    radius="xl"
                  >
                    <IconSend size={16} />
                  </ActionIcon>
                }
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
            </Group>
          </Paper>
        )}
      </Transition>

      {/* Auth Prompt */}
      {!isAuthenticated && (
        <Paper
          withBorder
          radius="xl"
          p="lg"
          mb="xl"
          bg="blue.0"
          style={{ borderColor: "var(--mantine-color-blue-2)" }}
        >
          <Center>
            <Text size="sm" c="blue.7" fw={500}>
              Sign in to interact with this post
            </Text>
          </Center>
        </Paper>
      )}

      {/* Comments Section */}
      <Box>
        <Text fw={600} size="lg" mb="lg" c="dark.7">
          Comments ({post?.commentsCount})
        </Text>

        {commentsLoading && comments.length === 0 ? (
          <CommentSkeletonList count={3} />
        ) : comments.length === 0 ? (
          <Center py="xl">
            <Paper p="lg" radius="lg" bg="gray.0" w="100%" maw={300}>
              <Center>
                <Stack align="center" gap="sm">
                  <Box
                    w={40}
                    h={40}
                    bg="gray.2"
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconMessageCircle
                      size={20}
                      color="var(--mantine-color-gray-6)"
                    />
                  </Box>
                  <Text c="dimmed" size="sm" ta="center">
                    No comments yet. Be the first!
                  </Text>
                </Stack>
              </Center>
            </Paper>
          </Center>
        ) : (
          <Stack gap="md">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                postId={post.id}
              />
            ))}

            {hasNextPage && (
              <Center pt="md">
                {isFetchingNextPage ? (
                  <Loader size="sm" />
                ) : (
                  <Button
                    variant="subtle"
                    onClick={() => fetchNextPage()}
                    radius="xl"
                    size="sm"
                  >
                    Load more comments
                  </Button>
                )}
              </Center>
            )}
          </Stack>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Post"
        radius="lg"
        centered
      >
        <Stack gap="lg">
          <Text c="dimmed">
            This action cannot be undone. Your post will be permanently deleted.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
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
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
