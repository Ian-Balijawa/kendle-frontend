import {
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useStatusStore } from "../../stores/statusStore";
import { StatusCollection } from "../../types";
import { CreateStatus } from "./CreateStatus";
import { StatusDetailsModal } from "./StatusDetailsModal";
import { StatusStories } from "./StatusStories";

export function StatusesPage() {
  const { isAuthenticated, user } = useAuthStore();
  const {
    statusCollections,
    setStatusCollections,
    cleanupExpiredStatuses,
    viewStatus,
  } = useStatusStore();

  const [createStatusOpened, setCreateStatusOpened] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<StatusCollection | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);

  useEffect(() => {
    cleanupExpiredStatuses();

    if (statusCollections.length === 0) {
      const mockCollections: StatusCollection[] = [
        {
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
          statuses: [
            {
              id: "status1",
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
              media: {
                id: "media1",
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
                type: "image",
                filename: "mountain-view.jpg",
                size: 1024000,
                createdAt: new Date().toISOString(),
              },
              content: "Beautiful sunrise from the mountains! 🌅",
              viewsCount: 15,
              views: [],
              isViewed: false,
              createdAt: new Date(
                Date.now() - 2 * 60 * 60 * 1000,
              ).toISOString(),
              expiresAt: new Date(
                Date.now() + 22 * 60 * 60 * 1000,
              ).toISOString(),
              isExpired: false,
            },
          ],
          hasUnviewed: true,
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
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
          statuses: [
            {
              id: "status2",
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
              media: {
                id: "media2",
                url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=600&fit=crop",
                type: "image",
                filename: "forest-lake.jpg",
                size: 856000,
                createdAt: new Date().toISOString(),
              },
              content: "Perfect day for a lake adventure! 🚣‍♀️",
              viewsCount: 23,
              views: [],
              isViewed: false,
              createdAt: new Date(
                Date.now() - 4 * 60 * 60 * 1000,
              ).toISOString(),
              expiresAt: new Date(
                Date.now() + 20 * 60 * 60 * 1000,
              ).toISOString(),
              isExpired: false,
            },
          ],
          hasUnviewed: true,
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setStatusCollections(mockCollections);
    }
  }, [statusCollections.length, setStatusCollections, cleanupExpiredStatuses]);

  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredStatuses();
    }, 60000);

    return () => clearInterval(interval);
  }, [cleanupExpiredStatuses]);

  const handleCreateStatus = () => {
    if (!isAuthenticated) {
      return;
    }
    setCreateStatusOpened(true);
  };

  const handleCollectionClick = (collection: StatusCollection) => {
    const collectionIndex = statusCollections.findIndex(
      (c) => c.author.id === collection.author.id,
    );
    setCurrentCollectionIndex(collectionIndex);
    setSelectedCollection(collection);
    setCurrentStatusIndex(0);
    setViewModalOpened(true);
  };

  const handleNextStatus = () => {
    if (
      selectedCollection &&
      currentStatusIndex < selectedCollection.statuses.length - 1
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
      setSelectedCollection(nextCollection);
      setCurrentStatusIndex(0);
    } else {
      setViewModalOpened(false);
    }
  };

  const handlePreviousCollection = () => {
    if (currentCollectionIndex > 0) {
      const prevCollection = statusCollections[currentCollectionIndex - 1];
      setCurrentCollectionIndex(currentCollectionIndex - 1);
      setSelectedCollection(prevCollection);
      setCurrentStatusIndex(prevCollection.statuses.length - 1);
    }
  };

  // Filter collections to exclude user's own collection for the stories display
  const otherCollections = statusCollections.filter(
    (collection) => collection.author.id !== user?.id,
  );

  const canGoNext = selectedCollection
    ? currentStatusIndex < selectedCollection.statuses.length - 1
    : false;
  const canGoPrevious = currentStatusIndex > 0;
  const canGoNextCollection =
    currentCollectionIndex < statusCollections.length - 1;
  const canGoPreviousCollection = currentCollectionIndex > 0;

  return (
    <>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Box>
            <Group justify="space-between" align="center" mb="md">
              <Box>
                <Title order={1} size="h2" fw={700} c="dark">
                  Status Updates
                </Title>
                <Text c="dimmed" size="sm" mt={4}>
                  Share moments that disappear in 24 hours
                </Text>
              </Box>
              {isAuthenticated && (
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={handleCreateStatus}
                  size="md"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                >
                  Add Status
                </Button>
              )}
            </Group>
          </Box>

          {/* Status Stories */}
          <Box>
            <Text fw={600} size="lg" mb="md" c="dark">
              Stories
            </Text>
            <StatusStories
              collections={otherCollections}
              currentUserAvatar={user?.avatar}
              onCreateStatus={handleCreateStatus}
              onStatusClick={handleCollectionClick}
            />
          </Box>

          {/* Empty state */}
          {statusCollections.length === 0 && (
            <Box ta="center" py="xl">
              <Text size="lg" fw={600} c="dark" mb="xs">
                No status updates yet
              </Text>
              <Text size="sm" c="dimmed" maw={400} mx="auto" mb="lg">
                {isAuthenticated
                  ? "Be the first to share a moment! Your status will disappear after 24 hours."
                  : "Sign in to view and share status updates with your friends."}
              </Text>
              {isAuthenticated && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleCreateStatus}
                  size="md"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                >
                  Create Your First Status
                </Button>
              )}
            </Box>
          )}
        </Stack>
      </Container>

      {/* Create Status Modal */}
      <CreateStatus
        opened={createStatusOpened}
        onClose={() => setCreateStatusOpened(false)}
      />

      {/* Status Details Modal */}
      <StatusDetailsModal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        collection={selectedCollection}
        currentStatusIndex={currentStatusIndex}
        onNext={handleNextStatus}
        onPrevious={handlePreviousStatus}
        onNextCollection={handleNextCollection}
        onPreviousCollection={handlePreviousCollection}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        canGoNextCollection={canGoNextCollection}
        canGoPreviousCollection={canGoPreviousCollection}
        onViewStatus={(statusId) => viewStatus(statusId, user?.id || "")}
      />
    </>
  );
}
