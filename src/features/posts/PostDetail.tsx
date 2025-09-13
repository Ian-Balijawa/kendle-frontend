import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  Paper,
  rem,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconArrowLeft,
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
import { useNavigate, useParams } from "react-router-dom";
import { format } from "timeago.js";
import ReactPlayer from "react-player";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
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
          <Box p="sm" w="100%" maw={400}>
            <Stack align="center" gap="sm">
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

    const renderFormattedText = (
      text: string,
      size: "sm" | "md" | "lg" = "md",
    ) => {
      const lines = text.split("\n");

      return (
        <Box>
          {lines.map((line, index) => (
            <Text key={index} size={size}>
              {line || "\u00A0"}
            </Text>
          ))}
        </Box>
      );
    };

    const videoStreamUrl = `${import.meta.env.VITE_API_URL}/stream/video/${post.media?.[0]?.url.split("/").pop()}`;
    const imageStreamUrl = `${import.meta.env.VITE_API_URL}/stream/image/${post.media?.[0]?.url.split("/").pop()}`;

    const avatarURL = `${import.meta.env.VITE_API_URL}/stream/image/${post.author?.avatar?.split("/").pop()}`;

    return (
      <Box mx="auto" p="sm">
        <Paper p="sm">
          <Group justify="space-between" mb="md">
            <Group
              gap="sm"
              style={{ cursor: "pointer" }}
              onClick={handleAuthorClick}
            >
              <Avatar
                src={avatarURL || "/user.png"}
                alt={
                  post?.author?.firstName || post?.author?.username || "User"
                }
                size={48}
                radius="xl"
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
                    <Badge size="xs" color="blue" radius="sm" variant="filled">
                      ✓
                    </Badge>
                  )}
                  {post?.author?.isProfileComplete === false && (
                    <Badge size="xs" variant="light" color="orange" radius="sm">
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
                  {renderFormattedText(editContent, "md")}
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
            renderFormattedText(post.content, "md")
          )}

          {post?.media && post?.media?.length > 0 && (
            <Box mt="md">
              {post.media.length === 1 ? (
                <>
                  {post.media[0].type === "video" ? (
                    <ReactPlayer
                      src={videoStreamUrl}
                      width="100%"
                      height={
                        post.media[0].height
                          ? Math.min(post.media[0].height, 500)
                          : 400
                      }
                      playsInline
                      controls
                      autoPlay
                    />
                  ) : (
                    <Image
                      src={imageStreamUrl}
                      alt={post.media[0].filename || "Post media"}
                      radius="lg"
                        fit="contain"
                      style={{
                        maxHeight: 500,
                        objectFit: "contain",
                        width: "100%",
                      }}
                      onError={(e) => {
                        console.error("Failed to load image:", imageStreamUrl);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </>
              ) : (
                <Box>
                  {(() => {
                    const videos = post.media.filter(
                      (media) => media.type === "video",
                    );
                    const images = post.media.filter(
                      (media) => media.type === "image",
                    );

                    return (
                      <Stack gap="sm">
                        {videos.length > 0 && (
                          <Box
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                videos.length === 1
                                  ? "1fr"
                                  : videos.length === 2
                                    ? "1fr 1fr"
                                    : "1fr 1fr 1fr",
                              gap: "1rem",
                            }}
                          >
                            {videos.map((media, index) => {
                              const mediaVideoStreamUrl = `${import.meta.env.VITE_API_URL}/stream/video/${media.url.split("/").pop()}`;

                              return (
                                <Box
                                  key={media.id || `video-${index}`}
                                  style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease",
                                    borderRadius: "var(--mantine-radius-md)",
                                    overflow: "hidden",
                                  }}
                                  onClick={() => navigate(`/post/${post.id}`)}
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
                                    src={mediaVideoStreamUrl}
                                    width="100%"
                                    height={300}
                                    controls
                                    light={
                                      media.thumbnailUrl
                                        ? `${import.meta.env.VITE_API_URL}/stream/image/${media.thumbnailUrl.split("/").pop()}`
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
                                      width: "48px",
                                      height: "48px",
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
                                        borderLeft: "12px solid white",
                                        borderTop: "8px solid transparent",
                                        borderBottom: "8px solid transparent",
                                        marginLeft: "4px",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        )}

                        {/* Images in masonry layout */}
                        {images.length > 0 && (
                          <ResponsiveMasonry
                            columnsCountBreakPoints={{
                              350: 1,
                              750: 2,
                              900: 3,
                              1200: 4,
                            }}
                          >
                            <Masonry gutter="20px">
                              {images.map((media, index) => {
                                const mediaImageStreamUrl = `${import.meta.env.VITE_API_URL}/stream/image/${media.url.split("/").pop()}`;

                                return (
                                  <Box
                                    key={media.id || `image-${index}`}
                                    style={{
                                      position: "relative",
                                      cursor: "pointer",
                                      transition: "transform 0.2s ease",
                                      borderRadius: "var(--mantine-radius-md)",
                                      overflow: "hidden",
                                      marginBottom: "20px",
                                    }}
                                    onClick={() => navigate(`/post/${post.id}`)}
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
                                      src={mediaImageStreamUrl}
                                      alt={media.filename || "Post media"}
                                      radius="md"
                                      fit="contain"
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        objectFit: "fill",
                                        display: "block",
                                      }}
                                      onError={(e) => {
                                        console.error(
                                          "Failed to load image:",
                                          mediaImageStreamUrl,
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
                                        <Text size="xl" fw={600} c="white">
                                          +{images.length - 4}
                                        </Text>
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })}
                            </Masonry>
                          </ResponsiveMasonry>
                        )}
                      </Stack>
                    );
                  })()}
                </Box>
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

          <Box>
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

          <Group mt="sm" justify="space-between" align="center">
            <Group gap="xs" align="center">
              <Flex justify="space-between" align="end">
                <IconHeart
                  cursor="pointer"
                  onClick={handleLike}
                  color={post?.isLiked ? "currentColor" : "none"}
                  style={{
                    fill: post?.isLiked ? "currentColor" : "none",
                    stroke: "currentColor",
                  }}
                />
                <Text fz="sm">{post.likesCount}</Text>
              </Flex>

              <Flex justify="space-between" align="end">
                <IconMessageCircle
                  cursor="pointer"
                  onClick={() => {
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
                  style={{
                    fill: commentContent.trim() ? "currentColor" : "none",
                    stroke: "currentColor",
                  }}
                />
                <Text fz="sm">{post.commentsCount}</Text>
              </Flex>

              <Flex justify="space-between" align="end">
                <IconBookmark
                  cursor="pointer"
                  onClick={handleBookmark}
                  style={{
                    fill: post?.isBookmarked ? "currentColor" : "none",
                  }}
                />
                <Text fz="sm">{post.bookmarksCount}</Text>
              </Flex>
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

          <Box>
            {isAuthenticated ? (
              <TextInput
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.currentTarget.value)}
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
                      <IconArrowRight size={16} />
                    </ActionIcon>
                  ) : null
                }
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                w="100%"
              />
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

            {comments.length > 0 && (
              <Box data-interactive="true">
                <Text fw={600} size="md" my="sm">
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
                  <Box>
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
                  </Box>
                </ScrollArea>
              </Box>
            )}

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

            {commentsLoading && comments.length === 0 && (
              <CommentSkeletonList count={3} />
            )}
          </Box>
        </Paper>

        <Modal
          opened={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Post"
          radius="lg"
          centered
        >
          <Stack gap="sm">
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
        <Box p="sm" w="100%" maw={400}>
          <Stack align="center" gap="sm" w="100%">
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
