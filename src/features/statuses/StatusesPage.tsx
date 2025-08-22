import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useStatusStore } from "../../stores/statusStore";
import { StatusCollection } from "../../types";
import { CreateStatus } from "./CreateStatus";
import { StatusCard } from "./StatusCard";

export function StatusesPage() {
  const { isAuthenticated } = useAuthStore();
  const { statusCollections, setStatusCollections, cleanupExpiredStatuses } =
    useStatusStore();

  const [createStatusOpened, setCreateStatusOpened] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<StatusCollection | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [viewModalOpened, setViewModalOpened] = useState(false);

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
              ).toISOString(), // 2 hours ago
              expiresAt: new Date(
                Date.now() + 22 * 60 * 60 * 1000,
              ).toISOString(), // 22 hours from now
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
              ).toISOString(), // 4 hours ago
              expiresAt: new Date(
                Date.now() + 20 * 60 * 60 * 1000,
              ).toISOString(), // 20 hours from now
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
    } else {
      const currentCollectionIndex = statusCollections.findIndex(
        (c) => c.author.id === selectedCollection?.author.id,
      );
      if (currentCollectionIndex < statusCollections.length - 1) {
        setSelectedCollection(statusCollections[currentCollectionIndex + 1]);
        setCurrentStatusIndex(0);
      } else {
        setViewModalOpened(false);
      }
    }
  };

  const handlePreviousStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
    } else {
      const currentCollectionIndex = statusCollections.findIndex(
        (c) => c.author.id === selectedCollection?.author.id,
      );
      if (currentCollectionIndex > 0) {
        const prevCollection = statusCollections[currentCollectionIndex - 1];
        setSelectedCollection(prevCollection);
        setCurrentStatusIndex(prevCollection.statuses.length - 1);
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const currentStatus = selectedCollection?.statuses[currentStatusIndex];

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Box>
            <Title order={1} size="h2">
              Statuses
            </Title>
            <Text c="dimmed" size="sm">
              Share moments that disappear in 24 hours
            </Text>
          </Box>
          {isAuthenticated && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateStatus}
              variant="gradient"
              gradient={{ from: "blue", to: "purple" }}
            >
              Add Status
            </Button>
          )}
        </Group>

        <ScrollArea>
          <Group gap="md" wrap="nowrap" style={{ paddingBottom: 16 }}>
            {isAuthenticated && (
              <Box style={{ minWidth: 80, textAlign: "center" }}>
                <Box
                  style={{
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={handleCreateStatus}
                >
                  <Avatar
                    size={64}
                    radius="xl"
                    style={{
                      border: "3px dashed var(--mantine-color-gray-4)",
                    }}
                  >
                    <IconPlus size={24} color="var(--mantine-color-gray-6)" />
                  </Avatar>
                </Box>
                <Text size="xs" mt={4} ta="center" c="dimmed">
                  Your Status
                </Text>
              </Box>
            )}

            {statusCollections.map((collection) => (
              <Box
                key={collection.author.id}
                style={{ minWidth: 80, textAlign: "center", cursor: "pointer" }}
                onClick={() => handleCollectionClick(collection)}
              >
                <Box style={{ position: "relative" }}>
                  <Avatar
                    src={collection.author.avatar}
                    alt={collection.author.firstName || "User"}
                    size={64}
                    radius="xl"
                    style={{
                      border: collection.hasUnviewed
                        ? "3px solid var(--mantine-color-blue-6)"
                        : "3px solid var(--mantine-color-gray-3)",
                    }}
                  >
                    {(collection.author.firstName || "U").charAt(0)}
                  </Avatar>
                  {collection.hasUnviewed && (
                    <Box
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: "var(--mantine-color-blue-6)",
                        border: "2px solid white",
                      }}
                    />
                  )}
                </Box>
                <Text size="xs" mt={4} ta="center" c="dimmed" truncate>
                  {collection.author.firstName}
                </Text>
                <Text size="xs" ta="center" c="dimmed">
                  {formatTimeAgo(collection.lastUpdated)}
                </Text>
              </Box>
            ))}
          </Group>
        </ScrollArea>

        {statusCollections.length === 0 && (
          <Card withBorder p="xl" ta="center">
            <Stack gap="md">
              <Text size="lg" fw={500} c="dimmed">
                No statuses yet
              </Text>
              <Text size="sm" c="dimmed">
                {isAuthenticated
                  ? "Share your first moment that disappears in 24 hours!"
                  : "Sign in to view and share statuses!"}
              </Text>
              {isAuthenticated && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCreateStatusOpened(true)}
                  variant="light"
                >
                  Create First Status
                </Button>
              )}
            </Stack>
          </Card>
        )}
      </Stack>

      <CreateStatus
        opened={createStatusOpened}
        onClose={() => setCreateStatusOpened(false)}
      />

      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        size="lg"
        padding={0}
        withCloseButton={false}
        styles={{
          content: {
            backgroundColor: "black",
          },
        }}
      >
        {currentStatus && (
          <Box style={{ position: "relative" }}>
            <StatusCard
              status={currentStatus}
              autoPlay={true}
              onClose={() => setViewModalOpened(false)}
              onNext={handleNextStatus}
              onPrevious={
                currentStatusIndex > 0 ||
                statusCollections.findIndex(
                  (c) => c.author.id === selectedCollection?.author.id,
                ) > 0
                  ? handlePreviousStatus
                  : undefined
              }
              showProgress={true}
              currentIndex={currentStatusIndex}
              totalCount={selectedCollection?.statuses.length || 1}
            />

            {currentStatusIndex > 0 ||
              (statusCollections.findIndex(
                (c) => c.author.id === selectedCollection?.author.id,
              ) > 0 && (
                <ActionIcon
                  variant="filled"
                  color="rgba(255, 255, 255, 0.3)"
                  size="lg"
                  radius="xl"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                  }}
                  onClick={handlePreviousStatus}
                >
                  <IconChevronLeft size={20} color="white" />
                </ActionIcon>
              ))}

            {(currentStatusIndex <
              (selectedCollection?.statuses.length || 1) - 1 ||
              statusCollections.findIndex(
                (c) => c.author.id === selectedCollection?.author.id,
              ) <
                statusCollections.length - 1) && (
              <ActionIcon
                variant="filled"
                color="rgba(255, 255, 255, 0.3)"
                size="lg"
                radius="xl"
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                }}
                onClick={handleNextStatus}
              >
                <IconChevronRight size={20} color="white" />
              </ActionIcon>
            )}
          </Box>
        )}
      </Modal>
    </>
  );
}
