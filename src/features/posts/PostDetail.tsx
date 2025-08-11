import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { usePostStore } from "../../stores/postStore";
import { Comment, Post } from "../../types";

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    posts,
    selectedPost,
    setSelectedPost,
    likePost,
    unlikePost,
    deletePost,
    updatePost,
    bookmarkPost,
    unbookmarkPost,
    sharePost,
  } = usePostStore();

  const [post, setPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (postId) {
      const foundPost = posts.find((p) => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
        setSelectedPost(foundPost);
      } else {
        notifications.show({
          title: "Post not found",
          message: "The post you're looking for doesn't exist",
          color: "red",
        });
        navigate("/dashboard");
      }
    }
  }, [postId, posts, setSelectedPost, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      notifications.show({
        title: "Sign in required",
        message: "Please sign in to like posts",
        color: "blue",
      });
      return;
    }

    if (post?.isLiked) {
      unlikePost(post.id);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: false,
              _count: {
                ...prev._count,
                likes: Math.max(0, prev._count.likes - 1),
              },
            }
          : null
      );
    } else {
      likePost(post!.id);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: true,
              _count: { ...prev._count, likes: prev._count.likes + 1 },
            }
          : null
      );
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      notifications.show({
        title: "Sign in required",
        message: "Please sign in to bookmark posts",
        color: "blue",
      });
      return;
    }

    if (post?.isBookmarked) {
      unbookmarkPost(post.id);
      setPost((prev) => (prev ? { ...prev, isBookmarked: false } : null));
    } else {
      bookmarkPost(post!.id);
      setPost((prev) => (prev ? { ...prev, isBookmarked: true } : null));
    }
  };

  const handleShare = () => {
    if (!isAuthenticated) {
      notifications.show({
        title: "Sign in required",
        message: "Please sign in to share posts",
        color: "blue",
      });
      return;
    }

    sharePost(post!.id);
    setPost((prev) =>
      prev
        ? {
            ...prev,
            isShared: true,
            _count: { ...prev._count, shares: prev._count.shares + 1 },
          }
        : null
    );
    notifications.show({
      title: "Post shared!",
      message: "Your post has been shared successfully",
      color: "green",
    });
  };

  const handleEdit = () => {
    if (post) {
      setEditContent(post.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !post) {
      notifications.show({
        title: "Empty content",
        message: "Post content cannot be empty",
        color: "red",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      updatePost(post.id, { content: editContent.trim() });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              content: editContent.trim(),
              updatedAt: new Date().toISOString(),
            }
          : null
      );
      notifications.show({
        title: "Post updated",
        message: "Your post has been updated successfully",
        color: "green",
      });
      setIsEditing(false);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update post",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    setIsSubmitting(true);
    try {
      deletePost(post.id);
      notifications.show({
        title: "Post deleted",
        message: "Your post has been deleted successfully",
        color: "green",
      });
      setShowDeleteConfirm(false);
      navigate("/dashboard");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete post",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim() || !post) {
      return;
    }

    setIsCommenting(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentContent.trim(),
        author: {
          id: user!.id,
          phoneNumber: user!.phoneNumber,
          username: user!.firstName?.toLowerCase(),
          firstName: user!.firstName,
          lastName: user!.lastName,
          avatar: user!.avatar,
          isVerified: user!.isVerified,
          isProfileComplete: user!.isProfileComplete,
          createdAt: user!.createdAt,
          updatedAt: user!.updatedAt,
          followersCount: user!.followersCount,
          followingCount: user!.followingCount,
          postsCount: user!.postsCount,
        },
        postId: post.id,
        replies: [],
        likes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          likes: 0,
          replies: 0,
        },
      };

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
              _count: { ...prev._count, comments: prev._count.comments + 1 },
            }
          : null
      );

      setCommentContent("");
      notifications.show({
        title: "Comment added!",
        message: "Your comment has been posted successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to post comment",
        color: "red",
      });
    } finally {
      setIsCommenting(false);
    }
  };

  if (!post) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  const isAuthor = user?.id === post.author.id;

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/dashboard")}
          style={{ alignSelf: "flex-start" }}
        >
          Back to Feed
        </Button>

        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <Avatar
                  src={post.author.avatar}
                  alt={post.author.firstName || "User"}
                  size="md"
                  radius="xl"
                >
                  {(post.author.firstName || "U").charAt(0)}
                </Avatar>
                <Box>
                  <Group gap="xs" align="center">
                    <Text fw={500} size="sm">
                      {post.author.firstName} {post.author.lastName}
                    </Text>
                    {post.author.isVerified && (
                      <Badge size="xs" color="blue" variant="light">
                        Verified
                      </Badge>
                    )}
                  </Group>
                  <Text c="dimmed" size="xs">
                    @{post.author.username || post.author.phoneNumber} •{" "}
                    {formatDate(post.createdAt)}
                    {post.updatedAt !== post.createdAt && " (edited)"}
                  </Text>
                </Box>
              </Group>

              {isAuthenticated && (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm">
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

            <Text size="sm" style={{ lineHeight: 1.6 }}>
              {post.content}
            </Text>

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
                    {post.media.map((media, index) => (
                      <Box
                        key={media.id}
                        style={{ position: "relative", flex: 1 }}
                      >
                        <Image
                          src={media.url}
                          alt={media.filename}
                          radius="sm"
                          style={{ height: 200, objectFit: "cover" }}
                        />
                      </Box>
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

            <Group justify="space-between">
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
                  <IconHeart size={16} />
                </ActionIcon>
                <Text size="xs" c="dimmed">
                  {post._count.likes}
                </Text>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  style={{
                    cursor: isAuthenticated ? "pointer" : "not-allowed",
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <IconMessageCircle size={16} />
                </ActionIcon>
                <Text size="xs" c="dimmed">
                  {post._count.comments}
                </Text>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleShare}
                  style={{
                    cursor: isAuthenticated ? "pointer" : "not-allowed",
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <IconShare size={16} />
                </ActionIcon>
                <Text size="xs" c="dimmed">
                  {post._count.shares}
                </Text>
              </Group>

              <ActionIcon
                variant={post.isBookmarked ? "filled" : "subtle"}
                color={post.isBookmarked ? "yellow" : "gray"}
                onClick={handleBookmark}
                style={{
                  cursor: isAuthenticated ? "pointer" : "not-allowed",
                  opacity: isAuthenticated ? 1 : 0.6,
                }}
              >
                <IconBookmark size={16} />
              </ActionIcon>
            </Group>

            {!isAuthenticated && (
              <Box
                p="sm"
                style={{
                  backgroundColor: "var(--mantine-color-blue-0)",
                  borderRadius: "var(--mantine-radius-sm)",
                  border: "1px solid var(--mantine-color-blue-2)",
                }}
              >
                <Text size="xs" c="blue" ta="center">
                  Sign in to like, comment, and interact with posts
                </Text>
              </Box>
            )}
          </Stack>
        </Card>

        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Text fw={600} size="lg">
              Comments ({post._count.comments})
            </Text>

            {isAuthenticated && (
              <Box>
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
              </Box>
            )}

            <Stack gap="md">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <Box key={comment.id}>
                    <Group gap="sm" align="flex-start">
                      <Avatar
                        src={comment.author.avatar}
                        alt={comment.author.firstName || "User"}
                        size="sm"
                        radius="xl"
                      >
                        {(comment.author.firstName || "U").charAt(0)}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Group gap="xs" align="center">
                          <Text fw={500} size="sm">
                            {comment.author.firstName} {comment.author.lastName}
                          </Text>
                          {comment.author.isVerified && (
                            <Badge size="xs" color="blue" variant="light">
                              Verified
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" mt={4}>
                          {comment.content}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {formatDate(comment.createdAt)}
                        </Text>
                      </Box>
                    </Group>
                  </Box>
                ))
              ) : (
                <Text c="dimmed" ta="center" py="md">
                  No comments yet. Be the first to comment!
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>
      </Stack>

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
    </Container>
  );
}
