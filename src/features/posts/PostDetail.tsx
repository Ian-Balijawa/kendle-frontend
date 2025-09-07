import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  rem,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBookmark,
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconHeart,
  IconMapPin,
  IconMessageCircle,
  IconSend,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "timeago.js";
import ReactPlayer from "react-player";
import {
  CommentSkeletonList,
  PostDetailSkeleton,
  PostEngagementButton,
} from "../../components/ui";
import { useCreateComment, useInfiniteComments } from "../../hooks/useComments";
import {
  useBookmarkPost,
  useDeletePost,
  useReactToPost,
  useRemoveReaction,
  usePost,
  useSharePost,
  useUnbookmarkPost,
  useUpdatePost,
} from "../../hooks/usePosts";
import { CreateCommentRequest, UpdatePostRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { CommentCard } from "./CommentCard";

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  try {
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
    const reactToPostMutation = useReactToPost();
    const removeReactionMutation = useRemoveReaction();
    const bookmarkPostMutation = useBookmarkPost();
    const unbookmarkPostMutation = useUnbookmarkPost();
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
    const comments = commentsData?.pages.flatMap((page) => page.comments) || [];

    if (postLoading) {
      return <PostDetailSkeleton />;
    }

    if (postError || !post) {
      return (
        <Center py={60}>
          <Box p="xl" w="100%" maw={400}>
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
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </Stack>
          </Box>
        </Center>
      );
    }

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

    const handleShare = () => {
      if (!isAuthenticated) return;
      sharePostMutation.mutate({ id: post.id });
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
          navigate("/");
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

    const handleAuthorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (post.author?.id) {
        navigate(`/profile/${post.author.id}`);
      }
    };

    const isAuthor = user?.id === post?.author?.id;

    // Helper function to render formatted text with newlines
    const renderFormattedText = (
      text: string,
      size: "sm" | "md" | "lg" = "md",
      spacing: "xs" | "sm" | "md" = "sm",
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

    const videoStreamUrl = `${import.meta.env.VITE_API_URL}/stream/video/${post.media?.[0]?.url.split("/").pop()}`;
    const imageStreamUrl = `${import.meta.env.VITE_API_URL}/stream/image/${post.media?.[0]?.url.split("/").pop()}`;

    return (
      <Box mx="auto" p="md">
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <ActionIcon
            variant="light"
            size="lg"
            radius="xl"
            onClick={() => navigate(-1)}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text fw={600} size="lg" style={{ maxWidth: "60%" }}>
            {post.content.split("\n")[0].slice(0, 50)}
            {post.content.split("\n")[0].length > 50 ? "..." : ""}
          </Text>
          <Box w={40} />
        </Group>

        {/* Main Post Card */}
        <Box
          p={0}
          mb="lg"
          style={{
            overflow: "hidden",
            borderRadius: "var(--mantine-radius-lg)",
            boxShadow: "var(--mantine-shadow-xl)",
          }}
        >
          <Box p="lg">
            {/* Author Header */}
            <Group justify="space-between" mb="md">
              <Group
                gap="md"
                style={{ cursor: "pointer" }}
                onClick={handleAuthorClick}
              >
                <Avatar
                  src={post?.author?.avatar}
                  alt={
                    post?.author?.firstName || post?.author?.username || "User"
                  }
                  size={48}
                  radius="xl"
                  color="white"
                  style={{
                    border: post?.author?.isVerified
                      ? "2px solid var(--mantine-color-blue-6)"
                      : "none",
                  }}
                >
                  {(
                    post?.author?.firstName ||
                    post?.author?.username ||
                    post?.author?.phoneNumber ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <Box>
                  <Group gap="xs" align="center">
                    <Text fw={600} size="md">
                      {post?.author?.firstName && post?.author?.lastName
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : post?.author?.username
                          ? post.author.username
                          : post?.author?.phoneNumber || "Unknown User"}
                    </Text>
                    {post?.author?.isVerified && (
                      <Badge
                        size="xs"
                        color="blue"
                        radius="sm"
                        variant="filled"
                      >
                        ✓
                      </Badge>
                    )}
                    {post?.author?.isProfileComplete === false && (
                      <Badge
                        size="xs"
                        variant="light"
                        color="orange"
                        radius="sm"
                      >
                        Incomplete
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs" align="center">
                    <Text c="dimmed" size="sm">
                      @
                      {post?.author?.username ||
                        post?.author?.phoneNumber ||
                        "unknown"}
                    </Text>
                    <Text c="dimmed" size="xs">
                      •
                    </Text>
                    <Text c="dimmed" size="sm">
                      {formatDate(post?.createdAt)}
                      {post?.updatedAt !== post?.createdAt && " Edited"}
                    </Text>
                    {post?.author?.status && (
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
                <Menu shadow="lg" width={180} position="bottom-end" radius="md">
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      size="md"
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

            {/* Post Type and Status Indicators */}
            <Group gap="xs" mb="sm">
              <Badge
                size="sm"
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
                size="sm"
                variant="light"
                color={post.status === "published" ? "green" : "yellow"}
                radius="sm"
              >
                {post.status}
              </Badge>
              {!post.isPublic && (
                <Badge size="sm" variant="light" color="red" radius="sm">
                  Private
                </Badge>
              )}
              {post.scheduledAt && (
                <Badge size="sm" variant="light" color="purple" radius="sm">
                  Scheduled
                </Badge>
              )}
            </Group>

            {/* Post Content */}
            {isEditing ? (
              <Stack gap="sm">
                <Textarea
                  placeholder="What's on your mind? "
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
                    p="sm"
                    style={{
                      backgroundColor: "var(--mantine-color-gray-1)",
                      borderRadius: "var(--mantine-radius-md)",
                      border: "1px solid var(--mantine-color-gray-3)",
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
              <Box mb="md">{renderFormattedText(post.content, "md", "sm")}</Box>
            )}

            {/* Media */}
            {post?.media && post?.media?.length > 0 && (
              <Box mb="md">
                {post.media.length === 1 ? (
                  <Box
                    style={{
                      borderRadius: "var(--mantine-radius-lg)",
                      overflow: "hidden",
                    }}
                  >
                    {post.media[0].type === "video" ? (
                      <ReactPlayer
                        src={videoStreamUrl}
                        width="100%"
                        height={
                          post.media[0].height
                            ? Math.min(post.media[0].height, 500)
                            : 400
                        }
                        controls
                        light={post.media[0].thumbnailUrl}
                        playsInline
                        style={{
                          borderRadius: "var(--mantine-radius-lg)",
                        }}
                      />
                    ) : (
                      <Image
                          src={imageStreamUrl}
                        alt={post.media[0].filename || "Post media"}
                        radius="lg"
                        style={{
                          maxHeight: 500,
                          objectFit: "cover",
                          width: "100%",
                        }}
                        onError={(e) => {
                          console.error(
                            "Failed to load image:",
                            imageStreamUrl,
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </Box>
                ) : (
                  <Group gap="xs">
                    {post.media.map((media) => (
                      <Box key={media.id} style={{ flex: 1 }}>
                        {media.type === "video" ? (
                          <Box
                            style={{
                              height: 200,
                              borderRadius: "var(--mantine-radius-md)",
                              overflow: "hidden",
                            }}
                          >
                            <ReactPlayer
                              src={videoStreamUrl}
                              width="100%"
                              height="100%"
                              controls
                              light={imageStreamUrl}
                              playsInline
                              style={{
                                borderRadius: "var(--mantine-radius-md)",
                              }}
                            />
                          </Box>
                        ) : (
                          <Image
                            src={media.url}
                            alt={media.filename || "Post media"}
                            radius="md"
                            style={{
                              height: 200,
                              objectFit: "cover",
                              width: "100%",
                            }}
                            onError={(e) => {
                              console.error("Failed to load image:", media.url);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Group>
                )}
              </Box>
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
                    radius="md"
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
                    radius="md"
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
                    radius="md"
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
                <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm" c="blue.6">
                  {post.location}
                </Text>
              </Group>
            )}
          </Box>

          <Box px="lg" pb="sm">
            {(!post.allowComments ||
              !post.allowLikes ||
              !post.allowShares ||
              !post.allowBookmarks ||
              !post.allowReactions) && (
              <Group gap="xs" mb="sm">
                <Text size="sm" c="dimmed">
                  Restrictions:
                </Text>
                {!post.allowComments && (
                  <Badge size="sm" variant="light" color="red">
                    No Comments
                  </Badge>
                )}
                {!post.allowLikes && (
                  <Badge size="sm" variant="light" color="red">
                    No Likes
                  </Badge>
                )}
                {!post.allowShares && (
                  <Badge size="sm" variant="light" color="red">
                    No Shares
                  </Badge>
                )}
                {!post.allowBookmarks && (
                  <Badge size="sm" variant="light" color="red">
                    No Bookmarks
                  </Badge>
                )}
                {!post.allowReactions && (
                  <Badge size="sm" variant="light" color="red">
                    No Reactions
                  </Badge>
                )}
              </Group>
            )}
          </Box>

          <Box px="lg" pb="md">
            <Group justify="space-between" mb="sm">
              <Group gap="md">
                {post?.likesCount > 0 && (
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      👍
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      {post?.likesCount}
                    </Text>
                  </Group>
                )}
                {post?.commentsCount > 0 && (
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      💬
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      {post?.commentsCount} comments
                    </Text>
                  </Group>
                )}
                {post?.sharesCount > 0 && (
                  <Group gap="xs">
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

            {/* Action Buttons */}
            <Group justify="space-between" align="center">
              {/* Action Buttons */}
              <Group gap="xs" align="center">
                <UnstyledButton
                  onClick={handleLike}
                  disabled={!isAuthenticated || !post.allowLikes}
                  data-interactive="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 0.2s ease",
                    color: post?.isLiked
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-6)",
                    fontWeight: post?.isLiked ? 600 : 500,
                    backgroundColor: post?.isLiked
                      ? "var(--mantine-color-blue-1)"
                      : "transparent",
                    border: post?.isLiked
                      ? "1px solid var(--mantine-color-blue-3)"
                      : "1px solid transparent",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (isAuthenticated && post.allowLikes) {
                      e.currentTarget.style.backgroundColor = post?.isLiked
                        ? "var(--mantine-color-blue-2)"
                        : "var(--mantine-color-gray-1)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = post?.isLiked
                      ? "var(--mantine-color-blue-1)"
                      : "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <IconHeart
                    size={16}
                    style={{
                      fill: post?.isLiked ? "currentColor" : "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                    }}
                  />
                  <Text size="sm" fw={post?.isLiked ? 600 : 500}>
                    Like
                  </Text>
                </UnstyledButton>

                <UnstyledButton
                  onClick={() => {
                    // Scroll to comment input
                    const commentInput = document.querySelector(
                      'input[placeholder="Write a comment..."]',
                    );
                    if (commentInput) {
                      commentInput.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      (commentInput as HTMLInputElement).focus();
                    }
                  }}
                  disabled={!post.allowComments}
                  data-interactive="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 0.2s ease",
                    color: commentContent.trim()
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-gray-6)",
                    fontWeight: commentContent.trim() ? 600 : 500,
                    backgroundColor: commentContent.trim()
                      ? "var(--mantine-color-blue-1)"
                      : "transparent",
                    border: commentContent.trim()
                      ? "1px solid var(--mantine-color-blue-3)"
                      : "1px solid transparent",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (post.allowComments) {
                      e.currentTarget.style.backgroundColor =
                        commentContent.trim()
                          ? "var(--mantine-color-blue-2)"
                          : "var(--mantine-color-gray-1)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor =
                      commentContent.trim()
                        ? "var(--mantine-color-blue-1)"
                        : "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <IconMessageCircle
                    size={16}
                    style={{
                      fill: commentContent.trim() ? "currentColor" : "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                    }}
                  />
                  <Text size="sm" fw={commentContent.trim() ? 600 : 500}>
                    Comment
                  </Text>
                </UnstyledButton>

                <UnstyledButton
                  onClick={handleShare}
                  disabled={!isAuthenticated || !post.allowShares}
                  data-interactive="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 0.2s ease",
                    color: "var(--mantine-color-gray-6)",
                    fontWeight: 500,
                    backgroundColor: "transparent",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (isAuthenticated && post.allowShares) {
                      e.currentTarget.style.backgroundColor =
                        "var(--mantine-color-gray-1)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <IconShare
                    size={16}
                    style={{
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                    }}
                  />
                  <Text size="sm" fw={500}>
                    Share
                  </Text>
                </UnstyledButton>

                <UnstyledButton
                  onClick={handleBookmark}
                  disabled={!isAuthenticated || !post.allowBookmarks}
                  data-interactive="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 0.2s ease",
                    color: post?.isBookmarked
                      ? "var(--mantine-color-yellow-6)"
                      : "var(--mantine-color-gray-6)",
                    fontWeight: post?.isBookmarked ? 600 : 500,
                    backgroundColor: post?.isBookmarked
                      ? "var(--mantine-color-yellow-1)"
                      : "transparent",
                    border: post?.isBookmarked
                      ? "1px solid var(--mantine-color-yellow-3)"
                      : "1px solid transparent",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (isAuthenticated && post.allowBookmarks) {
                      e.currentTarget.style.backgroundColor = post?.isBookmarked
                        ? "var(--mantine-color-yellow-2)"
                        : "var(--mantine-color-gray-1)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = post?.isBookmarked
                      ? "var(--mantine-color-yellow-1)"
                      : "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <IconBookmark
                    size={16}
                    style={{
                      fill: post?.isBookmarked ? "currentColor" : "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                    }}
                  />
                  <Text size="sm" fw={post?.isBookmarked ? 600 : 500}>
                    Save
                  </Text>
                </UnstyledButton>
              </Group>

              {/* Post Statistics */}
              <Group gap="md" align="center">
                <PostEngagementButton
                  postId={post.id}
                  likesCount={post.likesCount || 0}
                  dislikesCount={post.dislikesCount || 0}
                  bookmarksCount={post.bookmarksCount || 0}
                  viewsCount={post.viewsCount || 0}
                />
              </Group>
            </Group>
          </Box>

          {/* Facebook-style Comment Input - Embedded in Post */}
          <Box
            px="lg"
            pb="md"
            style={{
              paddingTop: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            {isAuthenticated ? (
              <Group
                align="flex-start"
                gap="sm"
                mb="sm"
                data-interactive="true"
              >
                <Avatar
                  src={user?.avatar}
                  size="md"
                  radius="xl"
                  style={{ flexShrink: 0 }}
                >
                  {user?.firstName?.charAt(0) || "U"}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <TextInput
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.currentTarget.value)}
                    style={{ flex: 1 }}
                    radius="xl"
                    rightSection={
                      commentContent.trim() ? (
                        <ActionIcon
                          onClick={handleComment}
                          loading={isCommenting}
                          color="blue"
                          variant="filled"
                          radius="xl"
                          size="sm"
                        >
                          <IconSend size={16} />
                        </ActionIcon>
                      ) : null
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    styles={{
                      input: {
                        backgroundColor: "var(--mantine-color-gray-1)",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </Box>
              </Group>
            ) : (
              <Box
                p="sm"
                mb="sm"
                style={{
                  background: "var(--mantine-color-blue-0)",
                  borderRadius: "var(--mantine-radius-lg)",
                }}
              >
                <Text size="sm" c="blue.7" ta="center" fw={500}>
                  Sign in to comment on this post
                </Text>
              </Box>
            )}

            {/* Embedded Comments Section with Scroll */}
            {comments.length > 0 && (
              <Box data-interactive="true">
                <Text fw={600} size="md" mb="sm">
                  Comments ({post?.commentsCount})
                </Text>

                <ScrollArea
                  h={400}
                  type="scroll"
                  scrollbarSize={6}
                  styles={{
                    scrollbar: {
                      '&[data-orientation="vertical"] .mantine-ScrollArea-thumb':
                        {
                          backgroundColor: "var(--mantine-color-gray-5)",
                        },
                    },
                  }}
                >
                  <Stack gap="xs" pr="xs">
                    {comments
                      .filter((comment) => comment && comment.id)
                      .map((comment, index) => (
                        <CommentCard
                          key={
                            comment.id || `comment-${index}-${Math.random()}`
                          }
                          comment={comment}
                          postId={post.id}
                        />
                      ))}

                    {hasNextPage && (
                      <Center pt="md" pb="md">
                        {isFetchingNextPage ? (
                          <Loader size="sm" />
                        ) : (
                          <Button
                            variant="subtle"
                            onClick={() => fetchNextPage()}
                            radius="xl"
                            size="sm"
                            data-interactive="true"
                          >
                            Load more comments
                          </Button>
                        )}
                      </Center>
                    )}
                  </Stack>
                </ScrollArea>
              </Box>
            )}

            {/* No Comments State */}
            {comments.length === 0 && !commentsLoading && (
              <Center py="lg">
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
            )}

            {/* Loading State */}
            {commentsLoading && comments.length === 0 && (
              <CommentSkeletonList count={3} />
            )}
          </Box>
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
              This action cannot be undone. Your post will be permanently
              deleted.
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
  } catch (error) {
    console.error("PostDetail: Error rendering component", error);
    return (
      <Center py={60}>
        <Box p="xl" w="100%" maw={400}>
          <Stack align="center" gap="lg" w="100%">
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
                Something went wrong
              </Text>
              <Text c="dimmed" ta="center" size="sm">
                There was an error loading this post. Please try refreshing the
                page.
              </Text>
            </Stack>
            <Button
              variant="light"
              size="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </Stack>
        </Box>
      </Center>
    );
  }
}
