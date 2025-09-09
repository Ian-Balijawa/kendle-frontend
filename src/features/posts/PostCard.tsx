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
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBookmark,
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconHeart,
  IconMapPin,
  IconMessageCircle,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "timeago.js";
import ReactPlayer from "react-player";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { CommentSkeletonList, PostEngagementButton } from "../../components/ui";
import { useInfiniteComments, useCreateComment } from "../../hooks/useComments";
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
  try {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    if (!post || !post.id) {
      console.error("PostCard: Invalid post data", post);
      return null;
    }

    const reactToPostMutation = useReactToPost();
    const removeReactionMutation = useRemoveReaction();
    const bookmarkPostMutation = useBookmarkPost();
    const unbookmarkPostMutation = useUnbookmarkPost();
    const updatePostMutation = useUpdatePost();
    const deletePostMutation = useDeletePost();
    const createCommentMutation = useCreateComment();

    const { data: commentsData, isLoading: commentsLoading } =
      useInfiniteComments(post.id, { limit: 3 });
    const comments = commentsData?.pages.flatMap((page) => page.comments) || [];

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");

    const isSubmitting =
      updatePostMutation.isPending || deletePostMutation.isPending;
    const isCommenting = createCommentMutation.isPending;

    const formatDate = (dateString: string) => {
      return format(new Date(dateString));
    };

    const handleLike = () => {
      if (!isAuthenticated) return;

      if (post.isLiked) {
        removeReactionMutation.mutate(post.id);
      } else {
        reactToPostMutation.mutate({
          id: post.id,
          data: { reactionType: "like" },
        });
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

    const handlePostClick = (e: React.MouseEvent) => {
      // Prevent navigation if clicking on interactive elements
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest(
        'button, a, input, textarea, [role="button"], [data-interactive]',
      );

      if (!isInteractiveElement) {
        navigate(`/post/${post.id}`);
      }
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (post.author?.id) {
        navigate(`/profile/${post.author.id}`);
      }
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
        },
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
        },
      );
    };

    const isAuthor = user?.id === post?.author?.id;

    // Ensure author data exists
    if (!post.author) {
      console.error("PostCard: Missing author data for post", post.id);
      return null;
    }

    // Helper function to render formatted text with newlines
    const renderFormattedText = (
      text: string,
      size: "sm" | "md" | "lg" = "sm",
      spacing: "xs" | "sm" | "md" = "xs",
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
                marginBottom:
                  index < lines.length - 1 ? spacingMap[spacing] : 0,
              }}
            >
              {line || "\u00A0"}
            </Text>
          ))}
        </Box>
      );
    };

    const getVideoStreamUrl = (url: string) => {
      return `${import.meta.env.VITE_API_URL}/stream/video/${url.split("/").pop()}`;
    };

    const getImageStreamUrl = (url: string) => {
      return `${import.meta.env.VITE_API_URL}/stream/image/${url.split("/").pop()}`;
    };

    return (
      <>
        <Card
          style={{
            transition: "all 0.2s ease",
            marginBottom: isFirst ? "0.5rem" : "0",
            cursor: "pointer",
            borderRadius: "var(--mantine-radius-lg)",
            boxShadow: "var(--mantine-shadow-xl)",
          }}
          onClick={handlePostClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Group
                gap="sm"
                style={{ cursor: "pointer" }}
                onClick={handleAuthorClick}
                data-interactive="true"
              >
                <Avatar
                  src={post.author?.avatar}
                  alt={
                    post.author?.firstName || post.author?.username || "User"
                  }
                  size={42}
                  radius="xl"
                >
                  {(
                    post.author?.firstName ||
                    post.author?.username ||
                    post.author?.phoneNumber ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>

                <Box>
                  <Group gap={6} align="center">
                    <Text fw={600} size="sm">
                      {post.author?.username && post.author?.lastName
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : post.author?.username
                          ? post.author.username
                          : post.author?.phoneNumber || "Unknown User"}
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
                    {post.author?.isProfileComplete === false && (
                      <Badge
                        size="xs"
                        variant="light"
                        color="orange"
                        radius="xl"
                      >
                        Incomplete
                      </Badge>
                    )}
                  </Group>
                  <Group gap={4} align="center">
                    <Text c="dimmed" size="xs">
                      @
                      {post.author?.username ||
                        post.author?.phoneNumber ||
                        "unknown"}
                    </Text>
                    <Text c="dimmed" size="xs">
                      •
                    </Text>
                    <Text c="dimmed" size="xs">
                      {formatDate(post?.createdAt)}
                      {post?.updatedAt !== post?.createdAt && " Edited"}
                    </Text>
                    {post.author?.status && (
                      <>
                        <Text c="dimmed" size="xs">
                          •
                        </Text>
                        <Badge
                          size="xs"
                          variant="light"
                          color={
                            post.author.status === "active" ? "green" : "yellow"
                          }
                          radius="sm"
                        >
                          {post.author.status}
                        </Badge>
                      </>
                    )}
                  </Group>
                </Box>
              </Group>

              {isAuthenticated && (
                <Group>
                  <UnstyledButton
                    onClick={handleBookmark}
                    disabled={!isAuthenticated || !post.allowBookmarks}
                    data-interactive="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.5rem",
                      borderRadius: "var(--mantine-radius-md)",
                      transition: "background-color 0.2s ease",
                      color: post?.isBookmarked
                        ? "var(--mantine-color-yellow-6)"
                        : "var(--mantine-color-gray-6)",
                      fontWeight: post?.isBookmarked ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated && post.allowBookmarks) {
                        e.currentTarget.style.backgroundColor =
                          "var(--mantine-color-gray-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <IconBookmark
                      size={18}
                      style={{
                        fill: post?.isBookmarked ? "currentColor" : "none",
                        stroke: "currentColor",
                      }}
                    />
                  </UnstyledButton>
                  <Menu
                    shadow="lg"
                    width={180}
                    position="bottom-end"
                    radius="lg"
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        radius="xl"
                        data-interactive="true"
                      >
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
                </Group>
              )}
            </Group>

            {/* Post Type and Status Indicators */}
            <Group gap="xs" mb="sm">
              <Badge
                size="xs"
                variant="light"
                color={
                  post.type === "text"
                    ? "blue"
                    : post.type === "image"
                      ? "green"
                      : post.type === "video"
                        ? "purple"
                        : "gray"
                }
                radius="sm"
              >
                {post.type}
              </Badge>
              <Badge
                size="xs"
                variant="light"
                color={post.status === "published" ? "green" : "yellow"}
                radius="sm"
              >
                {post.status}
              </Badge>
              {!post.isPublic && (
                <Badge size="xs" variant="light" color="red" radius="sm">
                  Private
                </Badge>
              )}
            </Group>

            <Box style={{ textAlign: "left" }} mb="sm">
              {renderFormattedText(post.content, "sm", "xs")}
            </Box>

            {post?.media && post?.media?.length > 0 && (
              <>
                {post?.media?.length === 1 ? (
                  <Box
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      borderRadius: "var(--mantine-radius-lg)",
                      overflow: "hidden",
                    }}
                    onClick={handlePostClick}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.01)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {post.media[0].type === "video" ? (
                      <ReactPlayer
                        src={getVideoStreamUrl(post.media[0].url)}
                        width="100%"
                        height={
                          post.media[0].height
                            ? Math.min(post.media[0].height, 400)
                            : 300
                        }
                        controls
                        playsInline
                        style={{
                          borderRadius: "var(--mantine-radius-lg)",
                        }}
                      />
                    ) : (
                      <Image
                        src={getImageStreamUrl(post.media[0].url)}
                        alt={post.media[0].filename || "Post media"}
                        radius="lg"
                        style={{
                          maxHeight: 400,
                          objectFit: "cover",
                          width: "100%",
                        }}
                        onError={(e) => {
                          console.error(
                            "Failed to load image:",
                            getImageStreamUrl(post.media?.[0]?.url || ""),
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </Box>
                ) : (
                  <Box>
                    {/* Separate videos and images */}
                    {(() => {
                      const videos = post.media.filter(
                        (media) => media.type === "video",
                      );
                      const images = post.media.filter(
                        (media) => media.type === "image",
                      );

                      return (
                        <Stack gap="sm">
                          {/* Videos in regular grid */}
                          {videos.length > 0 && (
                            <Box
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  videos.length === 1 ? "1fr" : "1fr 1fr",
                                gap: "0.5rem",
                              }}
                            >
                              {videos.slice(0, 2).map((media, index) => (
                                <Box
                                  key={media.id || `video-${index}`}
                                  style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease",
                                    borderRadius: "var(--mantine-radius-md)",
                                    overflow: "hidden",
                                  }}
                                  onClick={handlePostClick}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1.02)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1)";
                                  }}
                                >
                                  <ReactPlayer
                                    src={getVideoStreamUrl(media.url)}
                                    width="100%"
                                    height={200}
                                    controls
                                    light={
                                      media.thumbnailUrl
                                        ? getImageStreamUrl(media.thumbnailUrl)
                                        : undefined
                                    }
                                    playsInline
                                    style={{
                                      borderRadius: "var(--mantine-radius-md)",
                                    }}
                                  />

                                  {/* Video play indicator */}
                                  <Box
                                    style={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backdropFilter: "blur(10px)",
                                      zIndex: 2,
                                    }}
                                  >
                                    <Box
                                      style={{
                                        width: "0",
                                        height: "0",
                                        borderLeft: "10px solid white",
                                        borderTop: "6px solid transparent",
                                        borderBottom: "6px solid transparent",
                                        marginLeft: "3px",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}

                          {/* Images in masonry layout */}
                          {images.length > 0 && (
                            <ResponsiveMasonry
                              columnsCountBreakPoints={{
                                350: 1,
                                750: 2,
                                900: 3,
                              }}
                            >
                              <Masonry gutter="12px">
                                {images.slice(0, 4).map((media, index) => (
                                  <Box
                                    key={media.id || `image-${index}`}
                                    style={{
                                      position: "relative",
                                      cursor: "pointer",
                                      transition: "transform 0.2s ease",
                                      borderRadius: "var(--mantine-radius-md)",
                                      overflow: "hidden",
                                      marginBottom: "12px",
                                    }}
                                    onClick={handlePostClick}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform =
                                        "scale(1.02)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform =
                                        "scale(1)";
                                    }}
                                  >
                                    <Image
                                      src={getImageStreamUrl(media.url)}
                                      alt={media.filename || "Post media"}
                                      radius="md"
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                      onError={(e) => {
                                        console.error(
                                          "Failed to load image:",
                                          getImageStreamUrl(media.url),
                                        );
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />

                                    {/* More images indicator */}
                                    {index === 3 && images.length > 4 && (
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
                                          borderRadius:
                                            "var(--mantine-radius-md)",
                                          zIndex: 3,
                                        }}
                                      >
                                        <Text size="lg" fw={600} c="white">
                                          +{images.length - 4}
                                        </Text>
                                      </Box>
                                    )}
                                  </Box>
                                ))}
                              </Masonry>
                            </ResponsiveMasonry>
                          )}
                        </Stack>
                      );
                    })()}
                  </Box>
                )}
              </>
            )}

            {/* Tags */}
            {post?.tags && post?.tags?.length > 0 && (
              <Group gap="xs" mb="sm">
                {post?.tags?.map((tag: any) => (
                  <Badge
                    key={tag.id || tag.name}
                    variant="light"
                    color="blue"
                    size="sm"
                    radius="xl"
                    style={{ cursor: "pointer" }}
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </Group>
            )}

            {/* Legacy hashtags for backward compatibility */}
            {post?.hashtags && post?.hashtags?.length > 0 && (
              <Group gap="xs" mb="sm">
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

            {/* Mentions */}
            {post?.mentions && post?.mentions?.length > 0 && (
              <Group gap="xs" mb="sm">
                {post?.mentions?.map((mention: any) => (
                  <Badge
                    key={mention.id || mention.mentionedUserId}
                    variant="light"
                    color="green"
                    size="sm"
                    radius="xl"
                    style={{ cursor: "pointer" }}
                  >
                    @{mention.username || mention.mentionedUserId}
                  </Badge>
                ))}
              </Group>
            )}

            {/* Location */}
            {post?.location && (
              <Group gap="xs" mb="sm">
                <IconMapPin size={14} color="var(--mantine-color-blue-6)" />
                <Text size="xs" c="blue.6">
                  {post.location}
                </Text>
              </Group>
            )}

            <Group justify="start" mb="sm">
              <Group gap="xs">
                {post?.likesCount > 0 && (
                  <Group gap={4}>
                    <Text size="sm" c="dimmed">
                      👍
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      {post?.likesCount}
                    </Text>
                  </Group>
                )}
                {post?.sharesCount > 0 && (
                  <Group gap={4}>
                    <Text size="sm" c="dimmed">
                      📤
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      {post?.sharesCount} shares
                    </Text>
                  </Group>
                )}
              </Group>
            </Group>

            <Group justify="space-between" align="center">
              <Group gap="xs" align="center">
                <IconHeart
                  size={16}
                  onClick={handleLike}
                  data-interactive="true"
                  style={{
                    fill: post?.isLiked ? "currentColor" : "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                  }}
                />
                <IconMessageCircle
                  size={16}
                  onClick={() => setShowComments(!showComments)}
                  data-interactive="true"
                  style={{
                    fill: showComments ? "currentColor" : "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                  }}
                />
              </Group>

              <Group gap="sm" align="center">
                <PostEngagementButton
                  postId={post.id}
                  likesCount={post.likesCount || 0}
                  dislikesCount={post.dislikesCount || 0}
                  bookmarksCount={post.bookmarksCount || 0}
                  viewsCount={post.viewsCount || 0}
                />
              </Group>
            </Group>

            {!isAuthenticated && (
              <Box
                p="sm"
                mb="sm"
                style={{
                  background: "var(--mantine-color-blue-0)",
                  borderRadius: "var(--mantine-radius-lg)",
                }}
              >
                <Text size="sm" c="blue.7" ta="center" fw={500}>
                  Sign in to interact with posts
                </Text>
              </Box>
            )}

            {isAuthenticated && (
              <Box
                style={{
                  paddingTop: "0.5rem",
                  marginTop: "0.25rem",
                }}
                data-interactive="true"
              >
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.currentTarget.value)}
                  minRows={1}
                  maxRows={3}
                  autosize
                  w="100%"
                  radius="xl"
                  size="sm"
                  rightSection={
                    commentContent.trim() ? (
                      <ActionIcon
                        onClick={handleComment}
                        loading={isCommenting}
                        color="blue"
                        variant="filled"
                        radius="xl"
                      >
                        <IconArrowRight size={14} />
                      </ActionIcon>
                    ) : null
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                />
              </Box>
            )}

            <Collapse in={showComments}>
              <Box
                style={{
                  paddingTop: "0.5rem",
                  marginTop: "0.25rem",
                }}
                data-interactive="true"
              >
                <Stack gap="sm">
                  {commentsLoading ? (
                    <CommentSkeletonList count={2} />
                  ) : comments.length > 0 ? (
                    <>
                      {comments.slice(0, 3).map((comment: any) => (
                        <CommentCard
                          key={comment.id || `comment-${Math.random()}`}
                          comment={comment}
                          postId={post.id}
                        />
                      ))}
                      {post?.commentsCount > 3 && (
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={handlePostClick}
                          data-interactive="true"
                          style={{
                            alignSelf: "flex-start",
                            color: "var(--mantine-color-gray-6)",
                            fontWeight: 500,
                          }}
                          radius="md"
                          leftSection={<IconMessageCircle size={14} />}
                        >
                          View all {post?.commentsCount} comments
                        </Button>
                      )}
                    </>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No comments yet
                    </Text>
                  )}
                </Stack>
              </Box>
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
          <Stack gap="sm">
            <Textarea
              placeholder="What's on your mind? "
              value={editContent}
              onChange={(e) => setEditContent(e.currentTarget.value)}
              minRows={4}
              maxRows={10}
              autosize
              radius="lg"
            />

            {editContent.trim() && (
              <Box
                p="sm"
                style={{
                  backgroundColor: "var(--mantine-color-gray-1)",
                  borderRadius: "var(--mantine-radius-md)",
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
          <Stack gap="sm">
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
  } catch (error) {
    console.error("PostCard: Error rendering post", error, post);
    return (
      <Box p="sm" mb="md">
        <Text c="red" size="sm" w="100%">
          Error loading post. Please try refreshing the page.
        </Text>
      </Box>
    );
  }
}
