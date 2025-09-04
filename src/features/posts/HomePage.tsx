import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import {
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useState } from "react";
import { InfiniteScrollLoader, PostSkeletonList } from "../../components/ui";
import { ProfileSwipe } from "../../components/ui/ProfileSwipe";
import { useInfinitePosts } from "../../hooks/usePosts";
import { useSuggestedUsers } from "../../hooks/useFollow";
import { useAuthStore } from "../../stores/authStore";
import { useStatusStore } from "../../stores/statusStore";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { StatusStories } from "../statuses/StatusStories";

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const { statusCollections } = useStatusStore();
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
    refetch,
  } = useInfinitePosts({ limit: 10, sortBy: "createdAt", sortOrder: "desc" });

  // Get suggested users for discovery
  const { data: suggestedUsers } = useSuggestedUsers(10);

  // Intersection observer for infinite scroll
  const { ref, entry } = useIntersection({
    threshold: 1,
  });

  // Fetch next page when intersection is observed
  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  // Flatten all posts from all pages
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <Container size="xl" px="md">
      {/* Header Section */}
      <Group justify="space-between" align="center" mb="md">
        <Badge
          leftSection={<IconTrendingUp size={12} />}
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
          size="sm"
          radius="xl"
        >
          Trending
        </Badge>

        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="xl"
            onClick={() => refetch()}
          >
            <IconRefresh size={18} />
          </ActionIcon>

          {isAuthenticated && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreatePostOpened(true)}
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              size="sm"
            >
              Create Post
            </Button>
          )}
        </Group>
      </Group>

      {/* Status Stories Section */}
      <Box my="md">

      {isAuthenticated && statusCollections.length > 0 && (
        <StatusStories
            collections={statusCollections.filter(
              (collection) => collection.author.id !== user?.id,
            )}
            currentUserAvatar={user?.avatar}
            onCreateStatus={() => {
              // Navigate to status page or open create status modal
              window.location.href = "/statuses";
            }}
            onStatusClick={() => {
              // Navigate to status page with specific collection
              window.location.href = "/statuses";
            }}
        />
      )}
      </Box>

      {/* Profile Discovery Section */}
      {isAuthenticated &&
        suggestedUsers &&
        suggestedUsers.suggestions.length > 0 && (
          <ProfileSwipe
            users={suggestedUsers.suggestions}
            title="Discover People"
            subtitle="Find interesting people to follow"
            showStats={true}
          />
        )}

      {/* Content Section */}
      <Stack gap="lg">
        {/* Error State */}
        {isError && (
          <Card
            radius="lg"
            p="xl"
            style={{
              background: "linear-gradient(135deg, var(--mantine-color-red-0) 0%, var(--mantine-color-red-1) 100%)",
              border: "1px solid var(--mantine-color-red-2)",
            }}
          >
            <Stack align="center" gap="md">
              <Text size="lg" fw={600} c="red.7">
                Oops! Something went wrong
              </Text>
              <Text c="red.6" ta="center" size="sm">
                {error?.message || "We couldn't load the posts right now."}
              </Text>
              <Button
                variant="light"
                color="red"
                radius="xl"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </Stack>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && <PostSkeletonList count={5} />}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && !isError && (
          <Card
            radius="lg"
            p="xl"
            style={{
              background: "linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-cyan-1) 100%)",
              border: "1px solid var(--mantine-color-blue-2)",
              textAlign: "center",
            }}
          >
            <Stack align="center" gap="lg" py="xl">
              <IconSparkles size={48} color="var(--mantine-color-blue-6)" />
              <div>
                <Text size="xl" fw={600} c="blue.8" mb="xs">
                  Welcome to Kendle!
                </Text>
                <Text c="blue.6" size="sm">
                  Be the first to share something amazing with our community.
                </Text>
              </div>

              {isAuthenticated && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCreatePostOpened(true)}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                  size="md"
                >
                  Share Your First Post
                </Button>
              )}
            </Stack>
          </Card>
        )}

        {/* Posts List */}
        {!isLoading && posts.length > 0 && (
          <>
            {posts.map((post, index) => (
              <PostCard
                key={`post-${post.id}-${index}`}
                post={post}
                isFirst={index === 0}
              />
            ))}

            {/* Infinite scroll trigger */}
            {hasNextPage && (
              <div ref={ref}>
                {isFetchingNextPage && (
                  <InfiniteScrollLoader count={2} variant="posts" />
                )}
              </div>
            )}

            {/* End of feed */}
            {!hasNextPage && posts.length > 0 && null}
          </>
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
