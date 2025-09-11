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
import { useInfiniteStatuses } from "../../hooks/useStatuses";
import { useAuthStore } from "../../stores/authStore";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { StatusStories } from "../statuses/StatusStories";
import { CreateStatus } from "../statuses/CreateStatus";
import { StatusDetailsModal } from "../statuses/StatusDetailsModal";
import { StatusCollection } from "../../types";

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [createPostOpened, setCreatePostOpened] = useState(false);
  const [createStatusOpened, setCreateStatusOpened] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);

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

  // Get statuses
  const { data: statusData } = useInfiniteStatuses({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

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

  // Get grouped statuses from all pages (server already groups them)
  const statusCollections =
    statusData?.pages.flatMap((page) => page.groupedStatuses) || [];

  // Sort collections by last updated (fallback to first status's createdAt)
  statusCollections.sort((a, b) => {
    const aLastUpdated =
      a.lastUpdated || a.statuses[0]?.createdAt || new Date().toISOString();
    const bLastUpdated =
      b.lastUpdated || b.statuses[0]?.createdAt || new Date().toISOString();
    return new Date(bLastUpdated).getTime() - new Date(aLastUpdated).getTime();
  });

  // Sort statuses within each collection by creation date (newest first)
  statusCollections.forEach((collection) => {
    collection.statuses.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  // Status handlers
  const handleCreateStatus = () => {
    if (!isAuthenticated) {
      return;
    }
    setCreateStatusOpened(true);
  };

  const handleStatusClick = (collection: StatusCollection) => {
    const collectionIndex = statusCollections.findIndex(
      (c) => c.author.id === collection.author.id,
    );
    setCurrentCollectionIndex(collectionIndex);
    setSelectedStatus(collection);
    setCurrentStatusIndex(0);
    setViewModalOpened(true);
  };

  const handleNextStatus = () => {
    if (
      selectedStatus &&
      currentStatusIndex < selectedStatus.statuses.length - 1
    ) {
      setCurrentStatusIndex(currentStatusIndex + 1);
    }
  };

  const handlePreviousStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
    }
  };

  const handleNextCollection = () => {
    if (currentCollectionIndex < statusCollections.length - 1) {
      const nextCollection = statusCollections[currentCollectionIndex + 1];
      setCurrentCollectionIndex(currentCollectionIndex + 1);
      setSelectedStatus(nextCollection);
      setCurrentStatusIndex(0);
    } else {
      setViewModalOpened(false);
    }
  };

  const handlePreviousCollection = () => {
    if (currentCollectionIndex > 0) {
      const prevCollection = statusCollections[currentCollectionIndex - 1];
      setCurrentCollectionIndex(currentCollectionIndex - 1);
      setSelectedStatus(prevCollection);
      setCurrentStatusIndex(prevCollection.statuses.length - 1);
    }
  };

  const canGoNext = selectedStatus
    ? currentStatusIndex < selectedStatus.statuses.length - 1
    : false;
  const canGoPrevious = currentStatusIndex > 0;
  const canGoNextCollection =
    currentCollectionIndex < statusCollections.length - 1;
  const canGoPreviousCollection = currentCollectionIndex > 0;

  return (
    <Container size="xl" px="sm">
      {/* Header Section */}
      <Group justify="space-between" align="center" mb="md">
        <Badge
          leftSection={<IconTrendingUp size={12} />}
          variant="outline"
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
              size="sm"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontWeight: 600,
                fontSize: "12px",
                boxShadow:
                  "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              Create Post
            </Button>
          )}
        </Group>
      </Group>

      {/* Status Stories Section */}
      <Box my="md">
        {isAuthenticated && (
          <StatusStories
            collections={statusCollections}
            currentUserAvatar={user?.avatar}
            onCreateStatus={handleCreateStatus}
            onStatusClick={handleStatusClick}
          />
        )}
      </Box>

      {isAuthenticated &&
        suggestedUsers &&
        suggestedUsers.suggestions.length > 0 && (
          <ProfileSwipe users={suggestedUsers.suggestions} />
        )}

      {/* Content Section */}
      <Stack gap="sm">
        {/* Error State */}
        {isError && (
          <Card
            radius="lg"
            p="sm"
            style={{
              background:
                "linear-gradient(135deg, var(--mantine-color-red-0) 0%, var(--mantine-color-red-1) 100%)",
              border: "1px solid var(--mantine-color-red-2)",
            }}
          >
            <Stack align="center" gap="sm">
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
            p="sm"
            style={{
              background:
                "linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-cyan-1) 100%)",
              border: "1px solid var(--mantine-color-blue-2)",
              textAlign: "center",
            }}
          >
            <Stack align="center" gap="sm" py="xl">
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

      {/* Create Status Modal */}
      <CreateStatus
        opened={createStatusOpened}
        onClose={() => setCreateStatusOpened(false)}
      />

      {/* Status Details Modal */}
      <StatusDetailsModal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        collection={selectedStatus}
        currentStatusIndex={currentStatusIndex}
        onNext={handleNextStatus}
        onPrevious={handlePreviousStatus}
        onNextCollection={handleNextCollection}
        onPreviousCollection={handlePreviousCollection}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        canGoNextCollection={canGoNextCollection}
        canGoPreviousCollection={canGoPreviousCollection}
      />
    </Container>
  );
}
