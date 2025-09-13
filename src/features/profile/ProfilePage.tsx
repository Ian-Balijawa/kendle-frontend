import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
  rem,
  ActionIcon,
  Container,
} from "@mantine/core";
import {
  IconBookmark,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconCalendar,
  IconCheck,
  IconEdit,
  IconExternalLink,
  IconHeart,
  IconMessage,
  IconPhoto,
  IconUserCheck,
  IconUserPlus,
  IconCamera,
  IconTrash,
} from "@tabler/icons-react";
import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUserPosts,
  useUserLikedPosts,
  useUserBookmarkedPosts,
} from "../../hooks/usePosts";
import { useUser, useUserProfile } from "../../hooks/useUser";
import { useFollowStatus, useToggleFollow } from "../../hooks/useFollow";
import { useAuthStore } from "../../stores/authStore";
import { User } from "../../types/auth";
import { PostCard } from "../posts/PostCard";
import {
  useUploadAvatar,
  useUploadBackgroundImage,
  useDeleteBackgroundImage,
} from "../../hooks/useMedia";
import { UserMediaGallery } from "../../components/ui/UserMediaGallery";

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  // File input refs for direct access
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // Image management hooks
  const uploadAvatar = useUploadAvatar();
  const uploadBackgroundImage = useUploadBackgroundImage();
  const deleteBackgroundImage = useDeleteBackgroundImage();

  // Determine if this is the current user's own profile
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  // Fetch user data - use different hooks based on whether it's own profile or another user's
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = isOwnProfile ? useUserProfile() : useUser(profileUserId!);

  // Only fetch posts and follow data if we have a valid profileUserId
  const { data: postsData, isLoading: postsLoading } = useUserPosts(
    profileUserId!,
    {
      limit: 10,
    },
  );
  const { data: likedPostsData, isLoading: likedPostsLoading } =
    useUserLikedPosts(profileUserId!, {
      limit: 10,
    });
  const { data: bookmarkedPostsData, isLoading: bookmarkedPostsLoading } =
    useUserBookmarkedPosts(profileUserId!, {
      limit: 10,
    });

  // Follow functionality - only for other users' profiles
  const { data: followStatus } = useFollowStatus(profileUserId!);
  const { toggleFollow, isLoading: followLoading } = useToggleFollow();

  const posts = postsData?.pages.flatMap((page) => page.posts) || [];
  const likedPosts = likedPostsData?.pages.flatMap((page) => page.posts) || [];
  const bookmarkedPosts =
    bookmarkedPostsData?.pages.flatMap((page) => page.posts) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString();
  };

  const handleFollow = async () => {
    if (!profileUserId || isOwnProfile) return;
    await toggleFollow(profileUserId, followStatus?.isFollowing || false);
  };

  const handleEditProfile = () => {
    navigate("/settings");
  };

  // Avatar management handlers
  const handleAvatarButtonClick = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar.mutateAsync(file);
      } catch (error) {
        console.error("Failed to upload avatar:", error);
      } finally {
        // Reset the input value to allow selecting the same file again
        event.target.value = "";
      }
    }
  };

  // Background image management handlers - FIXED
  const handleBackgroundUpload = () => {
    backgroundFileInputRef.current?.click();
  };

  const handleBackgroundFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadBackgroundImage.mutateAsync(file);
      } catch (error) {
        console.error("Failed to upload background image:", error);
      } finally {
        // Reset the input value to allow selecting the same file again
        event.target.value = "";
      }
    }
  };

  const handleBackgroundDelete = async () => {
    try {
      await deleteBackgroundImage.mutateAsync();
    } catch (error) {
      console.error("Failed to delete background image:", error);
    }
  };

  const socialLinks = [
    {
      key: "whatsapp",
      url: `https://wa.me/${user?.whatsapp}`,
      icon: IconBrandWhatsapp,
      label: "WhatsApp",
      color: "var(--mantine-color-green-6)",
    },
    {
      key: "twitterLink",
      url: user?.twitterLink,
      icon: IconBrandTwitter,
      label: "Twitter",
      color: "var(--mantine-color-blue-5)",
    },
    {
      key: "instagramLink",
      url: user?.instagramLink,
      icon: IconBrandInstagram,
      label: "Instagram",
      color: "var(--mantine-color-pink-6)",
    },
    {
      key: "tiktokLink",
      url: user?.tiktokLink,
      icon: IconBrandTiktok,
      label: "TikTok",
      color: "var(--mantine-color-dark-8)",
    },
  ].filter((link) => user?.[link.key as keyof User]);

  // Handle unauthenticated users trying to view profiles
  if (!isAuthenticated && !isOwnProfile) {
    return (
      <Box>
        <Center py={100}>
          <Card
            withBorder
            p="sm"
            radius="xl"
            shadow="sm"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <Stack align="center" gap="sm">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--mantine-color-red-5), var(--mantine-color-orange-6))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUserCheck size={40} color="white" />
              </Box>
              <Stack align="center" gap="xs">
                <Text size="xl" fw={600} c="red">
                  Authentication Required
                </Text>
                <Text c="dimmed" ta="center" size="sm">
                  Please sign in to view user profiles.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Center>
      </Box>
    );
  }

  // Handle missing profileUserId
  if (!profileUserId) {
    return (
      <Box>
        <Center py={100}>
          <Card
            withBorder
            p="sm"
            radius="xl"
            shadow="sm"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <Stack align="center" gap="sm">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--mantine-color-red-5), var(--mantine-color-orange-6))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUserCheck size={40} color="white" />
              </Box>
              <Stack align="center" gap="xs">
                <Text size="xl" fw={600} c="red">
                  Profile Not Found
                </Text>
                <Text c="dimmed" ta="center" size="sm">
                  Unable to determine which profile to display.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Center>
      </Box>
    );
  }

  if (userLoading) {
    return (
      <Box>
        <Center py={100}>
          <Stack align="center" gap="sm">
            <Loader size={60} />
            <Stack align="center" gap="xs">
              <Text size="lg" fw={500}>
                Loading profile...
              </Text>
              <Text c="dimmed" size="sm">
                Please wait while we fetch the profile data
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (userError || !user) {
    return (
      <Box>
        <Center>
          <Card
            withBorder
            p="sm"
            radius="xl"
            shadow="sm"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <Stack align="center" gap="sm">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--mantine-color-red-5), var(--mantine-color-orange-6))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUserCheck size={40} color="white" />
              </Box>
              <Stack align="center" gap="xs">
                <Text size="xl" fw={600} c="red">
                  Profile not found
                </Text>
                <Text c="dimmed" ta="center" size="sm">
                  The profile you're looking for doesn't exist or has been
                  removed.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Center>
      </Box>
    );
  }

  const avatarURL = `${import.meta.env.VITE_API_URL}/stream/image/${user.avatar?.split("/").pop()}`;
  const backgroundURL = `${import.meta.env.VITE_API_URL}/stream/image/${user.backgroundImage?.split("/").pop()}`;

  return (
    <Container size="xl" px="sm">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={avatarFileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarFileChange}
      />
      <input
        type="file"
        ref={backgroundFileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleBackgroundFileChange}
      />

      <Box
        style={{
          height: 150,
          background: user.backgroundImage
            ? `url(${backgroundURL})`
            : "linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-violet-6) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          borderBottomLeftRadius: "2rem",
        }}
      >
        {/* Background image overlay for better text readability */}
        {user.backgroundImage && (
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderBottomLeftRadius: "2rem",
              background: "rgba(0, 0, 0, 0.3)",
            }}
          />
        )}

        {/* Background image edit buttons for own profile */}
        {isOwnProfile && (
          <Group
            gap="xs"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
          >
            <ActionIcon
              variant="filled"
              color="dark"
              size="lg"
              radius="xl"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
                zIndex: 10000
              }}
              loading={
                uploadBackgroundImage.isPending ||
                deleteBackgroundImage.isPending
              }
              onClick={handleBackgroundUpload}
            >
              <IconCamera size={18} />
            </ActionIcon>
            {user.backgroundImage && (
              <ActionIcon
                variant="filled"
                color="red"
                size="lg"
                radius="xl"
                style={{
                  background: "rgba(255, 0, 0, 0.6)",
                  backdropFilter: "blur(10px)",
                  zIndex: 10000
                }}
                loading={deleteBackgroundImage.isPending}
                onClick={handleBackgroundDelete}
              >
                <IconTrash size={18} />
              </ActionIcon>
            )}
          </Group>
        )}

        <Box style={{ position: "relative" }}>
          <Avatar
            src={avatarURL || "/user.png"}
            alt={user.firstName || user.username || "User"}
            size={120}
            radius="50%"
            style={{
              bottom: -70,
              border: "4px solid white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Text size="2rem" fw={600}>
              {(user.firstName || user.username || user.phoneNumber || "U")
                .charAt(0)
                .toUpperCase()}
            </Text>
          </Avatar>

          {/* Avatar edit button for own profile */}
          {isOwnProfile && (
            <ActionIcon
              variant="filled"
              color="blue"
              size="lg"
              radius="xl"
              style={{
                position: "absolute",
                bottom: -40,
                left: 100,
                border: "3px solid white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
              onClick={handleAvatarButtonClick}
              loading={uploadAvatar.isPending}
            >
              <IconCamera size={18} />
            </ActionIcon>
          )}
        </Box>
      </Box>

      <Box py="xl" pt={80}>
        <Group justify="space-between" align="flex-start" mb="lg">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group gap="sm" align="center" mb="xs">
              <Title order={1} size={rem(28)} fw={700}>
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username
                    ? user.username
                    : user.phoneNumber || "Unknown User"}
              </Title>
              {user.isVerified && (
                <Badge
                  color="blue"
                  variant="light"
                  size="lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--mantine-color-blue-5), var(--mantine-color-blue-6))",
                    color: "white",
                    border: "none",
                  }}
                >
                  <IconCheck size={14} style={{ marginRight: 4 }} />
                  Verified
                </Badge>
              )}
              {user.isProfileComplete === false && (
                <Badge size="sm" variant="light" color="orange" radius="sm">
                  Incomplete Profile
                </Badge>
              )}
            </Group>

            <Group align="center">
              <Text c="dimmed" size="lg" fw={500}>
                @{user.username || user.phoneNumber || "unknown"}
              </Text>
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600}>
                  {formatNumber(user.postsCount)}
                </Text>{" "}
                posts
              </Text>
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600}>
                  {formatNumber(user.followersCount)}
                </Text>{" "}
                followers
              </Text>
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600}>
                  {formatNumber(user.followingCount)}
                </Text>{" "}
                following
              </Text>
              <Group>
                <IconCalendar size={18} color="var(--mantine-color-gray-6)" />
                <Text size="sm" c="dimmed">
                  Joined {formatDate(user.createdAt)}
                </Text>
              </Group>
            </Group>

            {user.bio && (
              <Text size="md" style={{ lineHeight: 1.6, maxWidth: 600 }}>
                {user.bio}
              </Text>
            )}
          </Stack>

          <Group>
            {isOwnProfile ? (
              <Button
                leftSection={<IconEdit size={18} />}
                onClick={handleEditProfile}
                radius="xl"
                size="sm"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontWeight: 600,
                  fontSize: "12px",
                  boxShadow:
                    "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={followStatus?.isFollowing ? "light" : "filled"}
                leftSection={
                  followStatus?.isFollowing ? (
                    <IconUserCheck size={18} />
                  ) : (
                    <IconUserPlus size={18} />
                  )
                }
                onClick={handleFollow}
                loading={followLoading}
                radius="xl"
                size="sm"
                style={
                  followStatus?.isFollowing
                    ? {
                      color: "var(--mantine-color-blue-6)",
                      borderColor: "var(--mantine-color-blue-6)",
                    }
                    : {
                      background:
                        "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                      border: "none",
                    }
                }
              >
                {followStatus?.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Group>
        </Group>

        {socialLinks.length > 0 && (
          <>
            <Group gap="sm">
              {socialLinks.map(({ key, url, icon: Icon, label, color }) => (
                <Button
                  key={key}
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  leftSection={<Icon size={16} />}
                  rightSection={<IconExternalLink size={14} />}
                  size="xs"
                  style={{
                    color: color,
                    borderColor: color + "30",
                    backgroundColor: color + "10",
                  }}
                >
                  {label}
                </Button>
              ))}
            </Group>
          </>
        )}
      </Box>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || "posts")}
        variant="pills"
      >
        <Tabs.List>
          <Tabs.Tab value="posts" leftSection={<IconMessage size={16} />}>
            Posts
          </Tabs.Tab>
          <Tabs.Tab value="media" leftSection={<IconPhoto size={16} />}>
            Media
          </Tabs.Tab>
          <Tabs.Tab value="likes" leftSection={<IconHeart size={16} />}>
            Likes
          </Tabs.Tab>
          <Tabs.Tab value="bookmarks" leftSection={<IconBookmark size={16} />}>
            Bookmarks
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="posts" pt="xl">
          <Stack gap="sm">
            {postsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="sm">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading posts...
                  </Text>
                </Stack>
              </Center>
            ) : posts.length === 0 ? (
              <Card
                p="sm"
                style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="sm">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "var(--mantine-color-blue-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconMessage
                      size={32}
                      color="var(--mantine-color-blue-6)"
                    />
                  </Box>
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      No posts yet
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      {isOwnProfile
                        ? "Share your first post to get started!"
                        : "This user hasn't posted anything yet."}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="media" pt="xl">
          <Box style={{ width: "100%", overflow: "hidden" }}>
            <UserMediaGallery userId={profileUserId!} limit={20} />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="likes" pt="xl">
          <Stack gap="sm">
            {likedPostsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="sm">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading liked posts...
                  </Text>
                </Stack>
              </Center>
            ) : likedPosts.length === 0 ? (
              <Card
                p="sm"
                style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="sm">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "var(--mantine-color-red-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconHeart size={32} color="var(--mantine-color-red-6)" />
                  </Box>
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      No liked posts yet
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      {isOwnProfile
                        ? "Posts you like will appear here!"
                        : "This user hasn't liked any posts yet."}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            ) : (
              likedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="bookmarks" pt="xl">
          <Stack gap="sm">
            {bookmarkedPostsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="sm">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading bookmarked posts...
                  </Text>
                </Stack>
              </Center>
            ) : bookmarkedPosts.length === 0 ? (
              <Card
                p="sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mantine-color-yellow-0), var(--mantine-color-yellow-1))",
                  border: "none",
                }}
              >
                <Stack align="center" gap="sm">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "var(--mantine-color-yellow-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconBookmark
                      size={32}
                      color="var(--mantine-color-yellow-6)"
                    />
                  </Box>
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      No bookmarked posts yet
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      {isOwnProfile
                        ? "Posts you bookmark will appear here!"
                        : "This user hasn't bookmarked any posts yet."}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            ) : (
              bookmarkedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
