import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { usePostStore } from "../../stores/postStore";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";

export function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { posts, setPosts, isLoading } = usePostStore();
  const [createPostOpened, setCreatePostOpened] = useState(false);

  // Load initial posts on component mount
  useEffect(() => {
    if (posts.length === 0) {
      // Load mock posts if none exist
      const mockPosts = [
        {
          id: "1",
          content:
            "Just launched our new social media platform! 🚀 Excited to see how it helps people connect and share their stories. #Kendle #SocialMedia #Innovation",
          author: {
            id: "1",
            phoneNumber: "+1234567890",
            username: "johndoe",
            firstName: "John",
            lastName: "Doe",
            avatar: undefined,
            isVerified: true,
            isProfileComplete: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            followersCount: 42,
            followingCount: 38,
            postsCount: 15,
          },
          media: [],
          hashtags: ["Kendle", "SocialMedia", "Innovation"],
          likes: [],
          comments: [],
          shares: [],
          isLiked: false,
          isShared: false,
          isBookmarked: false,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          _count: {
            likes: 42,
            comments: 12,
            shares: 5,
          },
        },
        {
          id: "2",
          content: "Beautiful sunset today! Nature never fails to amaze me. 🌅",
          author: {
            id: "2",
            phoneNumber: "+1987654321",
            username: "janedoe",
            firstName: "Jane",
            lastName: "Doe",
            avatar: undefined,
            isVerified: false,
            isProfileComplete: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            followersCount: 28,
            followingCount: 45,
            postsCount: 8,
          },
          media: [],
          hashtags: [],
          likes: [],
          comments: [],
          shares: [],
          isLiked: true,
          isShared: false,
          isBookmarked: true,
          createdAt: "2024-01-15T09:15:00Z",
          updatedAt: "2024-01-15T09:15:00Z",
          _count: {
            likes: 28,
            comments: 8,
            shares: 3,
          },
        },
      ];
      setPosts(mockPosts);
    }
  }, [posts.length, setPosts]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      // Redirect to sign in
      return;
    }
    setCreatePostOpened(true);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Box>
            <Title order={1} size="h2">
              Home
            </Title>
            <Text c="dimmed" size="sm">
              {isAuthenticated
                ? `Welcome back, ${user?.firstName}! 👋`
                : "Welcome to Kendle! Sign in to interact with posts 👋"}
            </Text>
          </Box>
          {isAuthenticated && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreatePost}
            >
              Create Post
            </Button>
          )}
        </Group>

        {/* Trending Section */}
        <Card withBorder p="md">
          <Group gap="xs" mb="sm">
            <IconTrendingUp size={20} color="var(--mantine-color-orange-6)" />
            <Text fw={600}>Trending Today</Text>
          </Group>
          <Group gap="xs">
            <Badge variant="light" color="blue">
              #Kendle
            </Badge>
            <Badge variant="light" color="green">
              #SocialMedia
            </Badge>
            <Badge variant="light" color="purple">
              #Innovation
            </Badge>
            <Badge variant="light" color="orange">
              #Tech
            </Badge>
          </Group>
        </Card>

        {/* Posts Feed */}
        <Stack gap="md">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {posts.length === 0 && !isLoading && (
            <Card withBorder p="xl" ta="center">
              <Stack gap="md">
                <Text size="lg" fw={500} c="dimmed">
                  No posts yet
                </Text>
                <Text size="sm" c="dimmed">
                  {isAuthenticated
                    ? "Be the first to share something amazing!"
                    : "Sign in to create the first post!"}
                </Text>
                {isAuthenticated && (
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setCreatePostOpened(true)}
                    variant="light"
                  >
                    Create First Post
                  </Button>
                )}
              </Stack>
            </Card>
          )}
        </Stack>

        {/* Load More */}
        {posts.length > 0 && (
          <Box ta="center" py="lg">
            <Button variant="light" size="sm">
              Load More Posts
            </Button>
          </Box>
        )}
      </Stack>

      {/* Create Post Modal */}
      <CreatePost
        opened={createPostOpened}
        onClose={() => setCreatePostOpened(false)}
      />
    </Container>
  );
}
