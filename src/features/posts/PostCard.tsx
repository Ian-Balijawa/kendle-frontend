import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  Menu,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconBookmark,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconFlag,
  IconSend,
  IconChevronDown,
  IconChevronUp,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "../../stores/postStore";
import { useAuthStore } from "../../stores/authStore";
import { Post, Comment } from "../../types";
import { CommentCard } from "./CommentCard";

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    likePost,
    unlikePost,
    deletePost,
    updatePost,
    bookmarkPost,
    unbookmarkPost,
    sharePost,
    addComment,
    upvotePost,
    downvotePost,
    removeVote,
  } = usePostStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

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
      return;
    }

    if (post.isLiked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      return;
    }

    if (post.isBookmarked) {
      unbookmarkPost(post.id);
    } else {
      bookmarkPost(post.id);
    }
  };

  const handleShare = () => {
    if (!isAuthenticated) {
      return;
    }

    sharePost(post.id);
  };

  const handleUpvote = () => {
    if (!isAuthenticated) {
      return;
    }

    if (post.isUpvoted) {
      removeVote(post.id);
    } else {
      upvotePost(post.id);
    }
  };

  const handleDownvote = () => {
    if (!isAuthenticated) {
      return;
    }

    if (post.isDownvoted) {
      removeVote(post.id);
    } else {
      downvotePost(post.id);
    }
  };

  const handlePostClick = () => {
    navigate(`/dashboard/post/${post.id}`);
  };

  const handleEdit = () => {
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      updatePost(post.id, { content: editContent.trim() });
      if (onUpdate) {
        onUpdate({ ...post, content: editContent.trim() });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      deletePost(post.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim()) {
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

      // Add comment to store
      addComment(post.id, newComment);
      
      // Clear input
      setCommentContent("");
      
      // Show comments if not already visible
      if (!showComments) {
        setShowComments(true);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const isAuthor = user?.id === post.author.id;

  return (
    <>
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

          <Text
            size="sm"
            style={{
              lineHeight: 1.6,
              cursor: "pointer",
              padding: "8px",
              borderRadius: "var(--mantine-radius-sm)",
              transition: "background-color 0.2s ease",
            }}
            onClick={handlePostClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--mantine-color-gray-0)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {post.content}
          </Text>

          {post.media && post.media.length > 0 && (
            <Box>
              {post.media.length === 1 ? (
                <Image
                  src={post.media[0].url}
                  alt={post.media[0].filename}
                  radius="md"
                  style={{
                    maxHeight: 400,
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                  }}
                  onClick={handlePostClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                />
              ) : (
                <Group gap="xs">
                  {post.media.slice(0, 4).map((media, index) => (
                    <Box
                      key={media.id}
                      style={{ position: "relative", flex: 1 }}
                    >
                      <Image
                        src={media.url}
                        alt={media.filename}
                        radius="sm"
                        style={{
                          height: 150,
                          objectFit: "cover",
                          cursor: "pointer",
                          transition: "opacity 0.2s ease",
                        }}
                        onClick={handlePostClick}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "0.9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                      />
                      {index === 3 && post.media && post.media.length > 4 && (
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
                            borderRadius: "var(--mantine-radius-sm)",
                          }}
                        >
                          <Text size="lg" fw={600} c="white">
                            +{post.media.length - 4}
                          </Text>
                        </Box>
                      )}
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
              {/* Upvote/Downvote Section */}
              <Group gap={2}>
                <ActionIcon
                  variant={post.isUpvoted ? "filled" : "subtle"}
                  color={post.isUpvoted ? "green" : "gray"}
                  onClick={handleUpvote}
                  size="sm"
                  style={{
                    cursor: isAuthenticated ? "pointer" : "not-allowed",
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <IconArrowUp size={14} />
                </ActionIcon>
                <Text size="xs" c="dimmed" fw={500} style={{ minWidth: "20px", textAlign: "center" }}>
                  {post._count.upvotes - post._count.downvotes}
                </Text>
                <ActionIcon
                  variant={post.isDownvoted ? "filled" : "subtle"}
                  color={post.isDownvoted ? "red" : "gray"}
                  onClick={handleDownvote}
                  size="sm"
                  style={{
                    cursor: isAuthenticated ? "pointer" : "not-allowed",
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <IconArrowDown size={14} />
                </ActionIcon>
              </Group>

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
                onClick={() => setShowComments(!showComments)}
                style={{
                  cursor: "pointer",
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

          {/* Comment Input */}
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

          {/* Comments Section */}
          {showComments && post.comments.length > 0 && (
            <Box>
              <Group justify="space-between" align="center" mb="sm">
                <Text size="sm" fw={500}>
                  Comments ({post.comments.length})
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
                >
                  {showComments ? "Hide" : "Show"}
                </Button>
              </Group>
              
              <Stack gap="sm">
                {post.comments.slice(0, 3).map((comment) => (
                  <CommentCard key={comment.id} comment={comment} postId={post.id} />
                ))}
                
                {post.comments.length > 3 && (
                  <Button
                    variant="light"
                    size="xs"
                    onClick={handlePostClick}
                    style={{ alignSelf: "center" }}
                  >
                    View all {post.comments.length} comments
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Card>

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
    </>
  );
}
