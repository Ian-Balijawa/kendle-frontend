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
  useLikeComment,
  useUnlikeComment,
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
  const { user, isAuthenticated } = useAuthStore();

  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting =
    updateCommentMutation.isPending || deleteCommentMutation.isPending;

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

  const handleEdit = () => {
    setEditContent(comment.content);
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
      }
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
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
      unlikeCommentMutation.mutate(comment.id);
    } else {
      likeCommentMutation.mutate(comment.id);
    }
  };

  const isAuthor = user?.id === comment.author.id;

  if (isEditing) {
    return (
      <Paper
        withBorder
        radius="lg"
        p="md"
        style={{
          borderColor: "var(--mantine-color-blue-3)",
          backgroundColor: "var(--mantine-color-blue-0)",
        }}
      >
        <Stack gap="md">
          <Group gap="sm">
            <Avatar
              src={comment.author?.avatar}
              alt={comment.author?.firstName || "User"}
              size={36}
              radius="xl"
            >
              {(comment.author?.firstName || "U").charAt(0)}
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
      <Paper withBorder={false} radius="lg" p="md">
        <Group align="flex-start" gap="md">
          <Avatar
            src={comment.author?.avatar}
            alt={comment.author?.firstName || "User"}
            size={36}
            radius="xl"
            style={{
              border: comment.author?.isVerified
                ? "2px solid var(--mantine-color-blue-4)"
                : "none",
              flexShrink: 0,
            }}
          >
            {(comment.author?.firstName || "U").charAt(0)}
          </Avatar>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <Group gap="xs" align="center" style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} size="sm" c="dark.8" truncate>
                  {comment.author?.firstName} {comment.author?.lastName}
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
                  {comment.updatedAt !== comment.createdAt && " (edited)"}
                </Text>
              </Group>

              <Stack>
                {isAuthenticated && (
                  <Menu
                    shadow="lg"
                    width={160}
                    position="bottom-end"
                    radius="md"
                    styles={{
                      dropdown: {
                        backgroundColor: "var(--mantine-color-gray-0)",
                      },
                    }}
                  >
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm" radius="xl">
                        <IconDotsVertical size={14} />
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
              </Stack>
            </Group>

            <Text
              size="sm"
              style={{
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
              c="dark.7"
              mb="sm"
            >
              {comment.content}
            </Text>

            <Group gap="md">
              <Group
                gap="xs"
                style={{ cursor: isAuthenticated ? "pointer" : "default" }}
                onClick={handleLike}
              >
                <ActionIcon
                  variant={comment.isLiked ? "filled" : "subtle"}
                  color={comment.isLiked ? "red" : "gray"}
                  size="sm"
                  radius="xl"
                  disabled={!isAuthenticated}
                  style={{
                    transition: "all 150ms ease",
                    transform: comment.isLiked ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <IconHeart
                    size={14}
                    style={{
                      fill: comment.isLiked ? "currentColor" : "none",
                    }}
                  />
                </ActionIcon>

                {comment.likesCount > 0 && (
                  <Text
                    size="xs"
                    c={comment.isLiked ? "red.6" : "dimmed"}
                    fw={comment.isLiked ? 500 : 400}
                  >
                    {comment.likesCount}
                  </Text>
                )}
              </Group>
            </Group>
          </Box>
        </Group>
      </Paper>

      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Comment"
        radius="lg"
        centered
        size="sm"
      >
        <Stack gap="lg">
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
}
