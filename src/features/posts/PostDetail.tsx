import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconBookmark,
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
import { useAuthStore } from "../../stores/authStore";
import { CommentCard } from "./CommentCard";
import {
  usePost,
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
  useVotePost,
  useRemoveVote,
  useSharePost,
  useUpdatePost,
  useDeletePost,
} from "../../hooks/usePosts";
import { useInfiniteComments, useCreateComment } from "../../hooks/useComments";
import { CreateCommentRequest, UpdatePostRequest } from "../../services/api";

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

  // Loading states
  const isSubmitting =
    updatePostMutation.isPending || deletePostMutation.isPending;
  const isCommenting = createCommentMutation.isPending;

  // Flatten comments from all pages
  const comments = commentsData?.pages.flatMap((page) => page.data) || [];

  if (postLoading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading post...</Text>
        </Stack>
      </Center>
    );
  }

  if (postError || !post) {
    return (
      <Card
        withBorder
        p="xl"
        radius="md"
        style={{ borderColor: "var(--mantine-color-red-3)" }}
      >
        <Stack align="center" gap="md">
          <Text size="lg" fw={500} c="red">
            Post not found
          </Text>
          <Text c="dimmed" ta="center">
            The post you're looking for doesn't exist or has been removed.
          </Text>
          <Button variant="light" onClick={() => navigate("/dashboard")}>
            Go Back to Home
          </Button>
        </Stack>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
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
      },
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
        },
        onError: (error) => {
          console.error("Failed to post comment:", error);
        },
      },
    );
  };

  const isAuthor = user?.id === post.author.id;

  return (
    <>
      <Box>
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={500}>Post</Text>
          <Box />
        </Group>

        {/* Post Content */}
        <Card withBorder p="lg" radius="md" mb="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <Avatar
                  src={post.author.avatar}
                  alt={post.author.firstName || "User"}
                  size="lg"
                  radius="xl"
                >
                  {(post.author.firstName || "U").charAt(0)}
                </Avatar>
                <Box>
                  <Group gap="xs" align="center">
                    <Text fw={500} size="lg">
                      {post.author.firstName} {post.author.lastName}
                    </Text>
                    {post.author.isVerified && (
                      <Badge size="sm" color="blue" variant="light">
                        Verified
                      </Badge>
                    )}
                  </Group>
                  <Text c="dimmed" size="sm">
                    @{post.author.username || post.author.phoneNumber} •{" "}
                    {formatDate(post.createdAt)}
                    {post.updatedAt !== post.createdAt && " (edited)"}
                  </Text>
                </Box>
              </Group>

              {isAuthenticated && (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle">
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

            {isEditing ? (
              <Stack gap="md">
                <Textarea
                  placeholder="What's on your mind?"
                  value={editContent}
                  onChange={(e) => setEditContent(e.currentTarget.value)}
                  minRows={4}
                  maxRows={10}
                  autosize
                />
                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} loading={isSubmitting}>
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Text size="md" style={{ lineHeight: 1.6 }}>
                {post.content}
              </Text>
            )}

            {post.media && post.media.length > 0 && (
              <Box>
                {post.media.length === 1 ? (
                  <Image
                    src={post.media[0].url}
                    alt={post.media[0].filename}
                    radius="md"
                    style={{ maxHeight: 500, objectFit: "cover" }}
                  />
                ) : (
                  <Group gap="xs">
                    {post.media.map((media) => (
                      <Image
                        key={media.id}
                        src={media.url}
                        alt={media.filename}
                        radius="sm"
                        style={{ height: 200, objectFit: "cover", flex: 1 }}
                      />
                    ))}
                  </Group>
                )}
              </Box>
            )}

            {post.hashtags && post.hashtags.length > 0 && (
              <Group gap="xs">
                {post.hashtags.map((hashtag: string) => (
                  <Badge key={hashtag} variant="light" color="blue" size="sm">
                    #{hashtag}
                  </Badge>
                ))}
              </Group>
            )}

            {/* Actions */}
            <Group justify="space-between" pt="md">
              <Group gap="lg">
                {/* Upvote/Downvote */}
                <Group gap={4}>
                  <ActionIcon
                    variant={post.isUpvoted ? "filled" : "subtle"}
                    color={post.isUpvoted ? "green" : "gray"}
                    onClick={handleUpvote}
                    style={{
                      cursor: isAuthenticated ? "pointer" : "not-allowed",
                      opacity: isAuthenticated ? 1 : 0.6,
                    }}
                  >
                    <IconArrowUp size={18} />
                  </ActionIcon>
                  <Text
                    fw={500}
                    style={{ minWidth: "30px", textAlign: "center" }}
                  >
                    {post._count.upvotes - post._count.downvotes}
                  </Text>
                  <ActionIcon
                    variant={post.isDownvoted ? "filled" : "subtle"}
                    color={post.isDownvoted ? "red" : "gray"}
                    onClick={handleDownvote}
                    style={{
                      cursor: isAuthenticated ? "pointer" : "not-allowed",
                      opacity: isAuthenticated ? 1 : 0.6,
                    }}
                  >
                    <IconArrowDown size={18} />
                  </ActionIcon>
                </Group>

                {/* Like */}
                <Group gap="xs">
                  <ActionIcon
                    variant={post.isLiked ? "filled" : "subtle"}
                    color={post.isLiked ? "red" : "gray"}
                    onClick={handleLike}
                    style={{
                      cursor: isAuthenticated ? "pointer" : "not-allowed",
                      opacity: isAuthenticated ? 1 : 0.6,
                    }}
                  >
                    <IconHeart size={18} />
                  </ActionIcon>
                  <Text>{post._count.likes}</Text>
                </Group>

                {/* Comments */}
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="gray">
                    <IconMessageCircle size={18} />
                  </ActionIcon>
                  <Text>{post._count.comments}</Text>
                </Group>

                {/* Share */}
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={handleShare}
                    style={{
                      cursor: isAuthenticated ? "pointer" : "not-allowed",
                      opacity: isAuthenticated ? 1 : 0.6,
                    }}
                  >
                    <IconShare size={18} />
                  </ActionIcon>
                  <Text>{post._count.shares}</Text>
                </Group>
              </Group>

              {/* Bookmark */}
              <ActionIcon
                variant={post.isBookmarked ? "filled" : "subtle"}
                color={post.isBookmarked ? "yellow" : "gray"}
                onClick={handleBookmark}
                style={{
                  cursor: isAuthenticated ? "pointer" : "not-allowed",
                  opacity: isAuthenticated ? 1 : 0.6,
                }}
              >
                <IconBookmark size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        </Card>

        {/* Comment Input */}
        {isAuthenticated && (
          <Card withBorder p="md" radius="md" mb="md">
            <TextInput
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.currentTarget.value)}
              rightSection={
                <ActionIcon
                  onClick={handleComment}
                  loading={isCommenting}
                  disabled={!commentContent.trim()}
                  color="blue"
                >
                  <IconSend size={16} />
                </ActionIcon>
              }
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
            />
          </Card>
        )}

        {!isAuthenticated && (
          <Card
            withBorder
            p="md"
            radius="md"
            mb="md"
            style={{ backgroundColor: "var(--mantine-color-blue-0)" }}
          >
            <Text size="sm" c="blue" ta="center">
              Sign in to like, comment, and interact with this post
            </Text>
          </Card>
        )}

        {/* Comments */}
        <Stack gap="md">
          {commentsLoading && comments.length === 0 ? (
            <Center py="md">
              <Stack align="center" gap="sm">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading comments...
                </Text>
              </Stack>
            </Center>
          ) : comments.length === 0 ? (
            <Card withBorder p="md" radius="md">
              <Text c="dimmed" ta="center">
                No comments yet. Be the first to comment!
              </Text>
            </Card>
          ) : (
            <>
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                />
              ))}

              {/* Load more comments */}
              {hasNextPage && (
                <Center>
                  <Button
                    variant="light"
                    onClick={() => fetchNextPage()}
                    loading={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more comments"}
                  </Button>
                </Center>
              )}
            </>
          )}
        </Stack>
      </Box>

      {/* Edit Modal */}
      <Modal
        opened={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Post"
        size="lg"
      >
        <LoadingOverlay visible={isSubmitting} />
        <Stack gap="md">
          <Textarea
            placeholder="What's on your mind?"
            value={editContent}
            onChange={(e) => setEditContent(e.currentTarget.value)}
            minRows={3}
            maxRows={8}
            autosize
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} loading={isSubmitting}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Post"
        size="sm"
      >
        <LoadingOverlay visible={isSubmitting} />
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={isSubmitting}>
              Delete Post
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
