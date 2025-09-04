import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  SimpleGrid,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconCamera,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useStatusStore } from "../../stores/statusStore";
import { StatusCollection } from "../../types";
import { CreateStatus } from "./CreateStatus";
import { StatusCard } from "./StatusCard";

export function StatusesPage() {
  const { isAuthenticated, user } = useAuthStore();
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
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
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
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const currentStatus = selectedCollection?.statuses[currentStatusIndex];

  // Get user's own status collection
  const userStatusCollection = statusCollections.find(
    (collection) => collection.author.id === user?.id
  );

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

          {/* Status grid */}
          <Box>
            {/* My Status section */}
            {isAuthenticated && (
              <Box mb="xl">
                <Text fw={600} size="lg" mb="md" c="dark">
                  My Status
                </Text>
                <Card
                  p="md"
                  radius="lg"
                  withBorder
                  style={{
                    cursor: userStatusCollection ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: userStatusCollection ? "translateY(-2px)" : "none",
                      boxShadow: userStatusCollection
                        ? "0 8px 25px rgba(0, 0, 0, 0.1)"
                        : "none",
                    },
                  }}
                  onClick={() => userStatusCollection && handleCollectionClick(userStatusCollection)}
                >
                  <Group>
                    <Box style={{ position: "relative" }}>
                      <Avatar
                        src={user?.avatar}
                        alt={user?.firstName || "You"}
                        size={64}
                        radius="lg"
                        style={{
                          border: userStatusCollection?.hasUnviewed
                            ? "3px solid #228be6"
                            : "3px solid #e9ecef",
                        }}
                      >
                        {user?.firstName?.charAt(0) || "U"}
                      </Avatar>
                      {!userStatusCollection && (
                        <ActionIcon
                          size="sm"
                          radius="xl"
                          variant="filled"
                          color="blue"
                          style={{
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            border: "2px solid white",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateStatus();
                          }}
                        >
                          <IconCamera size={12} />
                        </ActionIcon>
                      )}
                    </Box>
                    <Box flex={1}>
                      <Group justify="space-between" align="center">
                        <Box>
                          <Text fw={600} size="md">
                            {userStatusCollection ? "My Status" : "Add Status"}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {userStatusCollection
                              ? `${userStatusCollection.statuses.length} update${userStatusCollection.statuses.length !== 1 ? "s" : ""} • ${formatTimeAgo(userStatusCollection.lastUpdated)}`
                              : "Tap to add status update"
                            }
                          </Text>
                        </Box>
                        {!userStatusCollection && (
                          <Button
                            size="sm"
                            radius="xl"
                            leftSection={<IconPlus size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateStatus();
                            }}
                          >
                            Create
                          </Button>
                        )}
                      </Group>
                    </Box>
                  </Group>
                </Card>
              </Box>
            )}

            {/* Recent updates section */}
            {statusCollections.filter(c => c.author.id !== user?.id).length > 0 && (
              <Box>
                <Text fw={600} size="lg" mb="md" c="dark">
                  Recent Updates
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {statusCollections
                    .filter(collection => collection.author.id !== user?.id)
                    .map((collection) => (
                      <Card
                        key={collection.author.id}
                        p="md"
                        radius="lg"
                        withBorder
                        style={{
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                        onClick={() => handleCollectionClick(collection)}
                      >
                        <Group>
                          <Box style={{ position: "relative" }}>
                            <Avatar
                              src={collection.author.avatar}
                              alt={collection.author.firstName || "User"}
                              size={56}
                              radius="lg"
                              style={{
                                border: collection.hasUnviewed
                                  ? "3px solid #228be6"
                                  : "3px solid #e9ecef",
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
                                  backgroundColor: "#228be6",
                                  border: "2px solid white",
                                }}
                              />
                            )}
                          </Box>
                          <Box flex={1}>
                            <Text fw={600} size="sm" lineClamp={1}>
                              {collection.author.firstName} {collection.author.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatTimeAgo(collection.lastUpdated)}
                            </Text>
                            <Text size="xs" c="dimmed" mt={2}>
                              {collection.statuses.length} update{collection.statuses.length !== 1 ? "s" : ""}
                            </Text>
                          </Box>
                        </Group>
                      </Card>
                    ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Empty state */}
            {statusCollections.filter(c => c.author.id !== user?.id).length === 0 && !userStatusCollection && (
              <Card withBorder p="xl" radius="lg" ta="center">
                <Stack gap="lg" align="center">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCamera size={32} color="#868e96" />
                  </Box>
                  <Box>
                    <Text size="lg" fw={600} c="dark" mb="xs">
                      No status updates yet
                    </Text>
                    <Text size="sm" c="dimmed" maw={400} mx="auto">
                      {isAuthenticated
                        ? "Be the first to share a moment! Your status will disappear after 24 hours."
                        : "Sign in to view and share status updates with your friends."
                      }
                    </Text>
                  </Box>
                  {isAuthenticated && (
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={() => setCreateStatusOpened(true)}
                      size="md"
                      radius="xl"
                    >
                      Create Your First Status
                    </Button>
                  )}
                </Stack>
              </Card>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Create Status Modal */}
      <CreateStatus
        opened={createStatusOpened}
        onClose={() => setCreateStatusOpened(false)}
      />

      {/* View Status Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        size="lg"
        padding="md"
        withCloseButton={false}
        centered
        styles={{
          content: {
            backgroundColor: "#000",
            border: "none",
          },
          body: {
            padding: 0,
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

            {/* Navigation arrows */}
            {(currentStatusIndex > 0 ||
              statusCollections.findIndex(
                (c) => c.author.id === selectedCollection?.author.id,
              ) > 0) && (
                <ActionIcon
                  variant="filled"
                color="rgba(255, 255, 255, 0.2)"
                size="xl"
                  radius="xl"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 20,
                    backdropFilter: "blur(10px)",
                  }}
                  onClick={handlePreviousStatus}
                >
                <IconChevronLeft size={24} color="white" />
                </ActionIcon>
              )}

            {(currentStatusIndex <
              (selectedCollection?.statuses.length || 1) - 1 ||
              statusCollections.findIndex(
                (c) => c.author.id === selectedCollection?.author.id,
              ) <
              statusCollections.length - 1) && (
                <ActionIcon
                  variant="filled"
                color="rgba(255, 255, 255, 0.2)"
                size="xl"
                radius="xl"
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 20,
                  backdropFilter: "blur(10px)",
                }}
                onClick={handleNextStatus}
              >
                  <IconChevronRight size={24} color="white" />
                </ActionIcon>
              )}
          </Box>
        )}
      </Modal>
    </>
  );
}
