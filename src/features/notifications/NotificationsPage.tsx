import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBell,
  IconCheck,
  IconDotsVertical,
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "like",
    title: "John Doe liked your post",
    message:
      'John Doe liked your post "Just launched our new social media platform!"',
    actor: {
      id: "1",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      avatar: null,
    },
    postId: "1",
    createdAt: "2024-01-15T10:30:00Z",
    isRead: false,
  },
  {
    id: "2",
    type: "comment",
    title: "Jane Doe commented on your post",
    message: 'Jane Doe commented: "This looks amazing! Great work!"',
    actor: {
      id: "2",
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      avatar: null,
    },
    postId: "1",
    createdAt: "2024-01-15T09:15:00Z",
    isRead: false,
  },
  {
    id: "3",
    type: "follow",
    title: "Mike Johnson started following you",
    message: "Mike Johnson started following you",
    actor: {
      id: "3",
      username: "mikejohnson",
      firstName: "Mike",
      lastName: "Johnson",
      avatar: null,
    },
    createdAt: "2024-01-15T08:45:00Z",
    isRead: true,
  },
  {
    id: "4",
    type: "mention",
    title: "Sarah Wilson mentioned you in a post",
    message: "Sarah Wilson mentioned you in their post",
    actor: {
      id: "4",
      username: "sarahwilson",
      firstName: "Sarah",
      lastName: "Wilson",
      avatar: null,
    },
    postId: "2",
    createdAt: "2024-01-15T07:30:00Z",
    isRead: true,
  },
  {
    id: "5",
    type: "share",
    title: "Alex Chen shared your post",
    message: "Alex Chen shared your post with their followers",
    actor: {
      id: "5",
      username: "alexchen",
      firstName: "Alex",
      lastName: "Chen",
      avatar: null,
    },
    postId: "1",
    createdAt: "2024-01-14T16:20:00Z",
    isRead: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <IconHeart size={16} color="var(--mantine-color-red-6)" />;
    case "comment":
      return (
        <IconMessageCircle size={16} color="var(--mantine-color-blue-6)" />
      );
    case "follow":
      return <IconUserPlus size={16} color="var(--mantine-color-green-6)" />;
    case "mention":
      return <IconBell size={16} color="var(--mantine-color-purple-6)" />;
    case "share":
      return <IconShare size={16} color="var(--mantine-color-orange-6)" />;
    default:
      return <IconBell size={16} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "like":
      return "red";
    case "comment":
      return "blue";
    case "follow":
      return "green";
    case "mention":
      return "purple";
    case "share":
      return "orange";
    default:
      return "gray";
  }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Box>
            <Title order={1} size="h2">
              Notifications
            </Title>
            <Text c="dimmed" size="sm">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
          </Box>
          {unreadCount > 0 && (
            <Button variant="light" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Group>

        {/* Notifications List */}
        <Stack gap="md">
          {notifications.length === 0 ? (
            <Card withBorder p="xl">
              <Box ta="center" py="xl">
                <IconBell size={48} color="var(--mantine-color-gray-4)" />
                <Text size="lg" fw={500} mt="md">
                  No notifications yet
                </Text>
                <Text c="dimmed" size="sm">
                  When you get notifications, they'll show up here
                </Text>
              </Box>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                withBorder
                p="md"
                style={{
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : "var(--mantine-color-blue-0)",
                  borderLeft: notification.isRead
                    ? undefined
                    : `4px solid var(--mantine-color-${getNotificationColor(notification.type)}-6)`,
                }}
              >
                <Group align="flex-start" gap="md">
                  <Avatar
                    src={notification.actor.avatar}
                    alt={notification.actor.firstName}
                    size="md"
                  >
                    {notification.actor.firstName.charAt(0)}
                  </Avatar>

                  <Box style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                      <Box>
                        <Group gap="xs" align="center">
                          {getNotificationIcon(notification.type)}
                          <Text fw={500} size="sm">
                            {notification.title}
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed" mt={4}>
                          {notification.message}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {formatTime(notification.createdAt)}
                        </Text>
                      </Box>

                      <Group gap="xs">
                        {!notification.isRead && (
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <IconCheck size={14} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" size="sm">
                          <IconDotsVertical size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {/* Action Buttons for Follow Notifications */}
                    {notification.type === "follow" && !notification.isRead && (
                      <Group mt="sm">
                        <Button size="xs" variant="filled">
                          Follow Back
                        </Button>
                        <Button size="xs" variant="outline">
                          View Profile
                        </Button>
                      </Group>
                    )}
                  </Box>
                </Group>
              </Card>
            ))
          )}
        </Stack>

        {/* Load More */}
        {notifications.length > 0 && (
          <Box ta="center" py="lg">
            <Button variant="light" size="sm">
              Load More Notifications
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
