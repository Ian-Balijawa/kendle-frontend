import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconHeart,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { usePostStore } from "../../stores/postStore";
import { Comment } from "../../types";

interface CommentCardProps {
  comment: Comment;
  postId: string;
}

export function CommentCard({ comment, postId }: CommentCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { updateComment, deleteComment, likeComment } = usePostStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleEdit = () => {
    setEditContent(comment.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      updateComment(postId, comment.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      deleteComment(postId, comment.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) return;
    likeComment(postId, comment.id);
  };

  const isAuthor = user?.id === comment.author.id;

  if (isEditing) {
    return (
      <Box p="sm" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-sm)" }}>
        <Stack gap="sm">
          <Textarea
            placeholder="Edit your comment..."
            value={editContent}
            onChange={(e) => setEditContent(e.currentTarget.value)}
            minRows={2}
            maxRows={4}
            autosize
          />
          <Group justify="flex-end" gap="xs">
            <Button variant="light" size="xs" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="xs" onClick={handleSaveEdit} loading={isSubmitting}>
              Save
            </Button>
          </Group>
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Box
        p="sm"
        style={{
          border: "1px solid var(--mantine-color-gray-2)",
          borderRadius: "var(--mantine-radius-sm)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
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
                <Text size="sm" mt={4} style={{ lineHeight: 1.4 }}>
                  {comment.content}
                </Text>
                <Group gap="xs" mt={8}>
                  <Text size="xs" c="dimmed">
                    {formatDate(comment.createdAt)}
                  </Text>
                  {comment.updatedAt !== comment.createdAt && (
                    <Text size="xs" c="dimmed">
                      (edited)
                    </Text>
                  )}
                </Group>
              </Box>
            </Group>

            {isAuthenticated && (
              <Menu shadow="md" width={150} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" size="xs">
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
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xs"
              onClick={handleLike}
              style={{
                cursor: isAuthenticated ? "pointer" : "not-allowed",
                opacity: isAuthenticated ? 1 : 0.6,
              }}
            >
              <IconHeart size={14} />
            </ActionIcon>
            <Text size="xs" c="dimmed">
              {comment._count.likes}
            </Text>
          </Group>
        </Stack>
      </Box>

      {/* Delete Confirmation Modal */}
      <Menu
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        shadow="md"
        width={300}
        position="bottom"
      >
        <Menu.Dropdown>
          <Box p="md">
            <Text size="sm" mb="md">
              Are you sure you want to delete this comment? This action cannot be undone.
            </Text>
            <Group justify="flex-end" gap="xs">
              <Button variant="light" size="xs" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button color="red" size="xs" onClick={handleDelete} loading={isSubmitting}>
                Delete
              </Button>
            </Group>
          </Box>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
