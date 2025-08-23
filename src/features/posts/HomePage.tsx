import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { IconPlus, IconTrendingUp } from "@tabler/icons-react";
import { useState } from "react";
import { useInfinitePosts } from "../../hooks/usePosts";
import { useAuthStore } from "../../stores/authStore";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [createPostOpened, setCreatePostOpened] = useState(false);

  // Use infinite posts query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfinitePosts({ limit: 10, sortBy: "createdAt", sortOrder: "desc" });

  // Intersection observer for infinite scroll
  const { ref, entry } = useIntersection({
    threshold: 1,
  });

  // Fetch next page when intersection is observed
  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  // Flatten all posts from all pages
  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <Box>
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>Home Feed</Title>
        <Group>
          <Badge
            leftSection={<IconTrendingUp size={14} />}
            variant="light"
            color="blue"
            size="lg"
          >
            Trending
          </Badge>
          {isAuthenticated && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreatePostOpened(true)}
            >
              Create Post
            </Button>
          )}
        </Group>
      </Group>

      <Stack gap="md">
        {isError && (
          <Card
            withBorder
            p="xl"
            radius="md"
            style={{ borderColor: "var(--mantine-color-red-3)" }}
          >
            <Stack align="center" gap="md">
              <Text size="lg" fw={500} c="red">
                Failed to load posts
              </Text>
              <Text c="dimmed" ta="center">
                {error?.message || "Something went wrong while loading posts."}
              </Text>
              <Button variant="light" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        )}

        {!isLoading && posts.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text c="dimmed">Loading posts...</Text>
            </Stack>
          </Center>
        ) : posts.length === 0 && !isLoading ? (
          <Stack p="xl" style={{ borderColor: "var(--mantine-color-gray-3)" }}>
            <Stack align="center" gap="md">
              <Text size="lg" fw={500}>
                Welcome to Kendle!
              </Text>
              <Text c="dimmed" ta="center">
                Be the first to share something with the community.
              </Text>
              {isAuthenticated && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCreatePostOpened(true)}
                >
                  Create Your First Post
                </Button>
              )}
            </Stack>
          </Stack>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll trigger */}
            {hasNextPage && (
              <div ref={ref}>
                {isFetchingNextPage && (
                  <Center py="md">
                    <Stack align="center" gap="sm">
                      <Loader size="sm" />
                      <Text size="sm" c="dimmed">
                        Loading more posts...
                      </Text>
                    </Stack>
                  </Center>
                )}
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <Center py="md">
                <Text size="sm" c="dimmed">
                  You've reached the end!
                </Text>
              </Center>
            )}
          </>
        )}
      </Stack>

      <CreatePost
        opened={createPostOpened}
        onClose={() => setCreatePostOpened(false)}
      />
    </Box>
  );
}
