import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  rem,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconHeart,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  useDeleteComment,
  useReactToComment,
  useRemoveReaction,
  useUpdateComment,
} from "../../hooks/useComments";
import { UpdateCommentRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Comment } from "../../types";

interface CommentCardProps {
  comment: Comment;
  postId: string;
}

export function CommentCard({ comment }: CommentCardProps) {
  try {
    // Defensive programming - check if comment exists
    if (!comment || !comment.id) {
      console.error("CommentCard: Invalid comment data", comment);
      return null;
    }

    // Check if author exists
    if (!comment.author) {
      console.error("CommentCard: Missing author data for comment", comment.id);
      return null;
    }

    const { user, isAuthenticated } = useAuthStore();

    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();
    const reactToCommentMutation = useReactToComment();
    const removeReactionMutation = useRemoveReaction();

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content || "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isSubmitting =
      updateCommentMutation.isPending || deleteCommentMutation.isPending;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );

      if (diffInHours < 1) return "now";
      if (diffInHours < 24) return `${diffInHours}h`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
      return date.toLocaleDateString();
    };

    const handleEdit = () => {
      setEditContent(comment.content || "");
      setIsEditing(true);
    };

    const handleSaveEdit = async () => {
      if (!editContent.trim()) return;

      const updateData: UpdateCommentRequest = {
        content: editContent.trim(),
      };

      updateCommentMutation.mutate(
        { id: comment.id, data: updateData },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
          onError: (error) => {
            console.error("Failed to update comment:", error);
          },
        },
      );
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditContent(comment.content || "");
    };

    const handleDelete = async () => {
      deleteCommentMutation.mutate(comment.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
        },
        onError: (error) => {
          console.error("Failed to delete comment:", error);
        },
      });
    };

    const handleLike = () => {
      if (!isAuthenticated) return;

      if (comment.isLiked) {
        removeReactionMutation.mutate(comment.id);
      } else {
        reactToCommentMutation.mutate({
          id: comment.id,
          data: { reactionType: "like" },
        });
      }
    };

    const handleDislike = () => {
      if (!isAuthenticated) return;

      if (comment.isDisliked) {
        removeReactionMutation.mutate(comment.id);
      } else {
        reactToCommentMutation.mutate({
          id: comment.id,
          data: { reactionType: "dislike" },
        });
      }
    };

    const isAuthor = user?.id === comment.author?.id;

    if (isEditing) {
      return (
        <Paper
          withBorder
          radius="lg"
          p="sm"
          style={{
            borderColor: "var(--mantine-color-blue-4)",
            backgroundColor: "var(--mantine-color-blue-1)",
          }}
        >
          <Stack gap="sm">
            <Group gap="sm">
              <Avatar
                src={comment.author.avatar}
                alt={
                  comment.author?.username?.charAt(0).toUpperCase() ||
                  comment.author?.firstName?.charAt(0).toUpperCase() ||
                  "User"
                }
                size={36}
                radius="xl"
              >
                <Text size="xs" fw={600}>
                  {comment.author?.username?.charAt(0).toUpperCase() ||
                    comment.author?.firstName?.charAt(0) ||
                    comment.author?.username?.charAt(0) ||
                    comment.author?.phoneNumber?.charAt(0) ||
                    "U"}
                </Text>
              </Avatar>
              <Text size="sm" fw={500} c="blue.7">
                Editing comment...
              </Text>
            </Group>

            <Textarea
              placeholder="Edit your comment..."
              value={editContent}
              onChange={(e) => setEditContent(e.currentTarget.value)}
              minRows={2}
              maxRows={6}
              autosize
              radius="md"
              style={{ fontSize: rem(14) }}
            />

            <Group justify="flex-end" gap="sm">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleCancelEdit}
                size="lg"
                radius="xl"
              >
                <IconX size={16} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={handleSaveEdit}
                loading={isSubmitting}
                size="lg"
                radius="xl"
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Paper>
      );
    }

    return (
      <>
        <Box>
          <Group align="flex-start" gap="sm">
            <Avatar
              src={comment.author.avatar}
              alt={
                comment.author?.username?.charAt(0).toUpperCase() ||
                comment.author?.firstName?.charAt(0).toUpperCase() ||
                "User"
              }
              size={32}
              radius="xl"
            >
              <Text size="xs" fw={600}>
                {comment.author?.username?.charAt(0).toUpperCase() +
                  "" +
                  comment.author?.lastName?.charAt(0).toUpperCase() ||
                  comment.author?.firstName?.charAt(0).toUpperCase() +
                    "" +
                    comment.author?.lastName?.charAt(0).toUpperCase() ||
                  comment.author?.username?.charAt(0).toUpperCase() ||
                  comment.author?.phoneNumber?.charAt(0) ||
                  "U"}
              </Text>
            </Avatar>

            <Box style={{ flex: 1, minWidth: 0 }}>
              {/* Facebook-style Comment Header */}
              <Group
                gap="xs"
                align="center"
                mb="xs"
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text fw={600} size="sm" truncate>
                  {comment.author?.username
                    ? `${comment.author.username}`
                    : comment.author?.phoneNumber
                      ? comment.author.phoneNumber
                      : comment.author?.phoneNumber || "Unknown User"}
                </Text>

                {comment.author?.isVerified && (
                  <Badge size="xs" color="blue" radius="sm" variant="filled">
                    ✓
                  </Badge>
                )}

                <Text c="dimmed" size="xs">
                  •
                </Text>

                <Text c="dimmed" size="xs">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && " Edited"}
                </Text>

                <Group gap="sm">
                  <IconHeart
                    size={12}
                    onClick={handleLike}
                    style={{
                      fill: comment.isLiked ? "currentColor" : "none",
                      stroke: "currentColor",
                      cursor: "pointer",
                    }}
                  />
                  {comment.likesCount > 0 && (
                    <Text size="xs" c="currentColor">
                      {comment.likesCount}
                    </Text>
                  )}

                  <IconChevronDown
                    size={12}
                    onClick={handleDislike}
                    style={{
                      fill: comment.isDisliked ? "currentColor" : "none",
                      stroke: "currentColor",
                      cursor: "pointer",
                    }}
                  />
                  {comment.dislikesCount > 0 && (
                    <Text size="xs" c="currentColor">
                      {comment.dislikesCount}
                    </Text>
                  )}
                </Group>

                {/* Menu Button */}
                {isAuthenticated && (
                  <Menu
                    shadow="lg"
                    width={160}
                    position="bottom-end"
                    radius="md"
                    styles={{
                      dropdown: {
                        backgroundColor: "var(--mantine-color-gray-1)",
                      },
                    }}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        radius="xl"
                        style={{
                          opacity: 0.6,
                          marginLeft: "auto",
                        }}
                      >
                        <IconDotsVertical size={12} />
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

              {/* Comment Content */}
              <Box mb="xs">
                {(comment.content || "").split("\n").map((line, index) => (
                  <Text
                    key={index}
                    size="sm"
                    style={{
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                      marginBottom:
                        index < (comment.content || "").split("\n").length - 1
                          ? "0.25rem"
                          : 0,
                    }}
                  >
                    {line || "\u00A0"}
                  </Text>
                ))}
              </Box>
            </Box>
          </Group>
        </Box>

        <Modal
          opened={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Comment"
          radius="lg"
          centered
          size="sm"
        >
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              This action cannot be undone. Your comment will be permanently
              deleted.
            </Text>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
                radius="xl"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
                loading={isSubmitting}
                radius="xl"
                size="sm"
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </>
    );
  } catch (error) {
    console.error("CommentCard: Error rendering comment", error, comment);
    return (
      <Paper
        withBorder
        radius="lg"
        p="sm"
        style={{ borderColor: "var(--mantine-color-red-3)" }}
      >
        <Text c="red" size="sm">
          Error loading comment. Please try refreshing the page.
        </Text>
      </Paper>
    );
  }
}
