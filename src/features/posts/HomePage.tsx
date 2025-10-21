import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Transition,
  Center,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import {
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconTrendingUp,
  IconHeart,
  IconFlame,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

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

  const { data: suggestedUsers } = useSuggestedUsers(10);

  const { data: statusData } = useInfiniteStatuses({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { ref, entry } = useIntersection({
    threshold: 1,
  });

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  const statusCollections =
    statusData?.pages.flatMap((page) => page.groupedStatuses) || [];

  statusCollections.sort((a, b) => {
    const aLastUpdated =
      a.lastUpdated || a.statuses[0]?.createdAt || new Date().toISOString();
    const bLastUpdated =
      b.lastUpdated || b.statuses[0]?.createdAt || new Date().toISOString();
    return new Date(bLastUpdated).getTime() - new Date(aLastUpdated).getTime();
  });

  statusCollections.forEach((collection) => {
    collection.statuses.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

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
    <Container size="xl" px="sm" style={{ position: "relative" }} pb="sm">
      <Transition mounted={mounted} transition="fade-down" duration={400}>
        {(styles) => (
          <Paper
            style={{
              ...styles,
            }}
          >
            <Group justify="space-between" py="sm" align="center">
              <Group gap="md">
                <Box
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-primary-8))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconFlame size={20} color="white" />
                </Box>
                <Stack gap={0}>
                  <Title order={3} size="h4" fw={700}>
                    Discover
                  </Title>
                  <Group gap="xs">
                    <Badge
                      leftSection={<IconTrendingUp size={12} />}
                      variant="light"
                      color="primary"
                      size="sm"
                      radius="xl"
                    >
                      Trending
                    </Badge>
                    <Badge
                      leftSection={<IconHeart size={12} />}
                      variant="light"
                      color="red"
                      size="sm"
                      radius="xl"
                    >
                      Popular
                    </Badge>
                  </Group>
                </Stack>
              </Group>

              <Group gap="xs">
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  radius="xl"
                  onClick={() => refetch()}
                  style={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "rotate(180deg)",
                    },
                  }}
                >
                  <IconRefresh size={18} />
                </ActionIcon>

                {isAuthenticated && (
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setCreatePostOpened(true)}
                    radius="xl"
                    size="md"
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-primary-8))",
                        border: "none",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, var(--mantine-color-primary-7), var(--mantine-color-primary-9))",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(14, 165, 233, 0.4)",
                        },
                      },
                    }}
                  >
                    Create Post
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>
        )}
      </Transition>

      <Transition mounted={mounted} transition="slide-up" duration={500}>
        {(styles) => (
          <Box style={styles} mb="lg">
            {isAuthenticated && (
              <StatusStories
                collections={statusCollections}
                currentUserAvatar={user?.avatar}
                onCreateStatus={handleCreateStatus}
                onStatusClick={handleStatusClick}
              />
            )}
          </Box>
        )}
      </Transition>

      {isAuthenticated &&
        suggestedUsers &&
        suggestedUsers.suggestions.length > 0 && (
          <Transition mounted={mounted} transition="slide-up" duration={500}>
            {(styles) => (
            <Box style={styles} mb="lg">
              <ProfileSwipe users={suggestedUsers.suggestions} />
              </Box>
            )}
          </Transition>
        )}

      <Stack gap="lg">
        {isError && (
          <Transition mounted={isError} transition="fade-up" duration={400}>
            {(styles) => (
              <Card
                style={{
                  ...styles,
                  background:
                    "linear-gradient(135deg, var(--mantine-color-red-0) 0%, var(--mantine-color-red-1) 100%)",
                  border: "1px solid var(--mantine-color-red-2)",
                  borderRadius: "var(--mantine-radius-xl)",
                  padding: "var(--mantine-spacing-xl)",
                }}
              >
                <Center>
                  <Stack align="center" gap="md">
                    <Box
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "var(--mantine-color-red-1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconSparkles
                        size={28}
                        color="var(--mantine-color-red-6)"
                      />
                    </Box>
                    <Stack gap="xs" align="center">
                      <Title order={4} c="red.7" fw={600}>
                        Oops! Something went wrong
                      </Title>
                      <Text c="red.6" ta="center" size="sm" maw={400}>
                        {error?.message ||
                          "We couldn't load the posts right now. Please try again."}
                      </Text>
                    </Stack>
                    <Button
                      variant="light"
                      color="red"
                      radius="xl"
                      onClick={() => refetch()}
                      leftSection={<IconRefresh size={16} />}
                    >
                      Try Again
                    </Button>
                  </Stack>
                </Center>
              </Card>
            )}
          </Transition>
        )}

        {isLoading && (
          <Transition mounted={isLoading} transition="fade-up" duration={300}>
            {(styles) => (
              <Box style={styles}>
                <PostSkeletonList count={5} />
              </Box>
            )}
          </Transition>
        )}

        {!isLoading && posts.length === 0 && !isError && (
          <Transition
            mounted={!isLoading && posts.length === 0}
            transition="fade-up"
            duration={500}
          >
            {(styles) => (
              <Card
                style={{
                  ...styles,
                  background:
                    "linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-cyan-1) 100%)",
                  border: "1px solid var(--mantine-color-primary-2)",
                  borderRadius: "var(--mantine-radius-xl)",
                  padding: "var(--mantine-spacing-xl)",
                }}
              >
                <Center>
                  <Stack align="center" gap="xl" py="xl">
                    <Box
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-cyan-6))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 32px rgba(14, 165, 233, 0.3)",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    >
                      <IconSparkles size={40} color="white" />
                    </Box>
                    <Stack gap="sm" align="center">
                      <Title order={2} c="primary.8" fw={700} ta="center">
                        Welcome to Kendle!
                      </Title>
                      <Text c="primary.6" size="lg" ta="center" maw={500}>
                        Be the first to share something amazing with our
                        community. Your story matters!
                      </Text>
                    </Stack>
                    {isAuthenticated && (
                      <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={() => setCreatePostOpened(true)}
                        radius="xl"
                        size="lg"
                        styles={{
                          root: {
                            background:
                              "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-cyan-6))",
                            border: "none",
                            fontWeight: 600,
                            fontSize: "16px",
                            height: "48px",
                            paddingLeft: "24px",
                            paddingRight: "24px",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 12px 32px rgba(14, 165, 233, 0.4)",
                            },
                          },
                        }}
                      >
                        Share Your First Post
                      </Button>
                    )}
                  </Stack>
                </Center>
              </Card>
            )}
          </Transition>
        )}

        {!isLoading && posts.length > 0 && (
          <Stack gap="lg">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
                ))}

                {hasNextPage && (
                  <div ref={ref}>
                    {isFetchingNextPage && (
                      <InfiniteScrollLoader count={2} variant="posts" />
                    )}
                  </div>
                )}
          </Stack>
        )}
      </Stack>

      <CreatePost
        opened={createPostOpened}
        onClose={() => setCreatePostOpened(false)}
      />

      <CreateStatus
        opened={createStatusOpened}
        onClose={() => setCreateStatusOpened(false)}
      />

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
