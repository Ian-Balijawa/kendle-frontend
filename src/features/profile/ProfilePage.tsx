import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
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
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useUserPosts,
  useUserLikedPosts,
  useUserBookmarkedPosts,
} from "../../hooks/usePosts";
import { useUpdateProfile, useUser, useUserProfile } from "../../hooks/useUser";
import { useFollowStatus, useToggleFollow } from "../../hooks/useFollow";
import { UpdateProfileRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { User } from "../../types/auth";
import { PostCard } from "../posts/PostCard";

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("posts");
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  const updateProfileMutation = useUpdateProfile();

  const editForm = useForm<UpdateProfileRequest>({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || null,
      username: user?.username || "",
      email: user?.email || "",
      whatsapp: user?.whatsapp || "",
      twitterLink: user?.twitterLink || "",
      tiktokLink: user?.tiktokLink || "",
      instagramLink: user?.instagramLink || "",
    },
  });

  useEffect(() => {
    if (user) {
      editForm.setValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || null,
        username: user.username || "",
        email: user.email || "",
        whatsapp: user.whatsapp || "",
        twitterLink: user.twitterLink || "",
        tiktokLink: user.tiktokLink || "",
        instagramLink: user.instagramLink || "",
      });
    }
  }, [user]);

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

  // Debug logging
  console.log("ProfilePage Debug:", {
    userId,
    currentUserId: currentUser?.id,
    profileUserId,
    isOwnProfile,
    isAuthenticated,
    userLoading,
    userError,
    user: user
      ? { id: user.id, username: user.username, firstName: user.firstName }
      : null,
  });

  const handleEditProfile = () => {
    setEditModalOpen(true);
  };

  const handleSaveProfile = (values: UpdateProfileRequest) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        setEditModalOpen(false);
      },
      onError: (error) => {
        console.error("Failed to update profile:", error);
      },
    });
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
            p="xl"
            radius="xl"
            shadow="sm"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <Stack align="center" gap="lg">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--mantine-color-red-5), var(--mantine-color-orange-6))",
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
            p="xl"
            radius="xl"
            shadow="sm"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <Stack align="center" gap="lg">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--mantine-color-red-5), var(--mantine-color-orange-6))",
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
          <Stack align="center" gap="xl">
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
            p="xl"
            radius="xl"
            shadow="sm"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <Stack align="center" gap="lg">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--mantine-color-red-5), var(--mantine-color-orange-6))",
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

  return (
    <Box>
      <Box
        style={{
          height: 200,
          background:
            "linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-violet-6) 100%)",
          position: "relative",
        }}
      >
        <Avatar
          src={user.avatar || "/user.png"}
          alt={user.firstName || user.username || "User"}
          size={120}
          radius="50%"
          style={{
            position: "absolute",
            bottom: -60,
            left: 30,
            border: "4px solid white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Text size="2rem" fw={600} c="white">
            {(user.firstName || user.username || user.phoneNumber || "U")
              .charAt(0)
              .toUpperCase()}
          </Text>
        </Avatar>
      </Box>

      <Box py="xl" pt={80}>
        <Group justify="space-between" align="flex-start" mb="lg">
          <Box style={{ flex: 1 }}>
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

            <Group gap="xl" mb="lg" align="center">
              <Text c="dimmed" size="lg" fw={500}>
                @{user.username || user.phoneNumber || "unknown"}
              </Text>
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600} >
                  {formatNumber(user.postsCount)}
                </Text>{" "}
                posts
              </Text>
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600} >
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
            </Group>

            {user.bio && (
              <Text
                size="md"
                style={{ lineHeight: 1.6, maxWidth: 600 }}
                mb="lg"
              >
                {user.bio}
              </Text>
            )}

            <Group gap="xs" mb="lg">
              <IconCalendar size={18} color="var(--mantine-color-gray-6)" />
              <Text size="sm" c="dimmed">
                Joined {formatDate(user.createdAt)}
              </Text>
            </Group>
          </Box>

          <Group>
            {isOwnProfile ? (
              <Button
                variant="light"
                leftSection={<IconEdit size={18} />}
                onClick={handleEditProfile}
                radius="xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                  color: "white",
                  border: "none",
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
            <Group gap="md">
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
                  size="sm"
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
        <Tabs.List
          style={{
            padding: "4px",
            borderRadius: "16px",
          }}
        >
          <Tabs.Tab
            value="posts"
            leftSection={<IconMessage size={16} />}
            style={{
              borderRadius: "12px",
              fontWeight: 500,
            }}
          >
            Posts
          </Tabs.Tab>
          <Tabs.Tab
            value="media"
            leftSection={<IconPhoto size={16} />}
            style={{
              borderRadius: "12px",
              fontWeight: 500,
            }}
          >
            Media
          </Tabs.Tab>
          <Tabs.Tab
            value="likes"
            leftSection={<IconHeart size={16} />}
            style={{
              borderRadius: "12px",
              fontWeight: 500,
            }}
          >
            Likes
          </Tabs.Tab>
          <Tabs.Tab
            value="bookmarks"
            leftSection={<IconBookmark size={16} />}
            style={{
              borderRadius: "12px",
              fontWeight: 500,
            }}
          >
            Bookmarks
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="posts" pt="xl">
          <Stack gap="lg">
            {postsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading posts...
                  </Text>
                </Stack>
              </Center>
            ) : posts.length === 0 ? (
              <Card
                  p="xl"
                  style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="md">
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
          <Stack gap="lg">
            {postsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading media posts...
                  </Text>
                </Stack>
              </Center>
            ) : posts.filter((post) => post.media && post.media.length > 0)
                .length === 0 ? (
              <Card
                    p="xl"
                    style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "var(--mantine-color-orange-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconPhoto
                      size={32}
                      color="var(--mantine-color-orange-6)"
                    />
                  </Box>
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      No media posts yet
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      {isOwnProfile
                        ? "Posts with media will appear here!"
                        : "This user hasn't posted any media yet."}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            ) : (
              posts
                .filter((post) => post.media && post.media.length > 0)
                .map((post) => <PostCard key={post.id} post={post} />)
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="likes" pt="xl">
          <Stack gap="lg">
            {likedPostsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading liked posts...
                  </Text>
                </Stack>
              </Center>
            ) : likedPosts.length === 0 ? (
              <Card
                  p="xl"
                  style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="md">
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
          <Stack gap="lg">
            {bookmarkedPostsLoading ? (
              <Center py={60}>
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Loading bookmarked posts...
                  </Text>
                </Stack>
              </Center>
            ) : bookmarkedPosts.length === 0 ? (
              <Card
                  p="xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mantine-color-yellow-0), var(--mantine-color-yellow-1))",
                  border: "none",
                }}
              >
                <Stack align="center" gap="md">
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

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={
          <Group gap="sm">
            <IconEdit size={20} />
            <Text fw={600} size="lg">
              Edit Profile
            </Text>
          </Group>
        }
        size="lg"
        radius="xl"
        padding="xl"
      >
        <form onSubmit={editForm.onSubmit(handleSaveProfile)}>
          <Stack gap="lg">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  size="md"
                  radius="md"
                  styles={{
                    label: { fontWeight: 600, marginBottom: "0.5rem" },
                    input: {
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...editForm.getInputProps("firstName")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  size="md"
                  radius="md"
                  styles={{
                    label: { fontWeight: 600, marginBottom: "0.5rem" },
                    input: {
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...editForm.getInputProps("lastName")}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Username"
              placeholder="Enter username"
              size="md"
              radius="md"
              leftSection={
                <Text size="sm" c="dimmed">
                  @
                </Text>
              }
              styles={{
                label: { fontWeight: 600, marginBottom: "0.5rem" },
                input: {
                  "&:focus": {
                    borderColor: "var(--mantine-color-blue-6)",
                    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
              {...editForm.getInputProps("username")}
            />

            <TextInput
              label="Email"
              placeholder="Enter email"
              type="email"
              size="md"
              radius="md"
              styles={{
                label: { fontWeight: 600, marginBottom: "0.5rem" },
                input: {
                  "&:focus": {
                    borderColor: "var(--mantine-color-blue-6)",
                    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
              {...editForm.getInputProps("email")}
            />

            <Textarea
              label="Bio"
              placeholder="Tell us about yourself"
              minRows={3}
              size="md"
              radius="md"
              styles={{
                label: { fontWeight: 600, marginBottom: "0.5rem" },
                input: {
                  "&:focus": {
                    borderColor: "var(--mantine-color-blue-6)",
                    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
              {...editForm.getInputProps("bio")}
              value={editForm.getValues().bio || ""}
              onChange={(e) =>
                editForm.setFieldValue("bio", e.target.value || null)
              }
            />

            <Divider label="Social Media Links" labelPosition="center" />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="WhatsApp"
                  placeholder="Enter WhatsApp number"
                  leftSection={<IconBrandWhatsapp size={16} />}
                  size="md"
                  radius="md"
                  styles={{
                    label: { fontWeight: 600, marginBottom: "0.5rem" },
                    input: {
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...editForm.getInputProps("whatsapp")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Twitter Link"
                  placeholder="Enter Twitter profile URL"
                  leftSection={<IconBrandTwitter size={16} />}
                  size="md"
                  radius="md"
                  styles={{
                    label: { fontWeight: 600, marginBottom: "0.5rem" },
                    input: {
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...editForm.getInputProps("twitterLink")}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Instagram Link"
                  placeholder="Enter Instagram profile URL"
                  leftSection={<IconBrandInstagram size={16} />}
                  size="md"
                  radius="md"
                  styles={{
                    label: { fontWeight: 600, marginBottom: "0.5rem" },
                    input: {
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...editForm.getInputProps("instagramLink")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="TikTok Link"
                  placeholder="Enter TikTok profile URL"
                  leftSection={<IconBrandTiktok size={16} />}
                  size="md"
                  radius="md"
                  styles={{
                    label: { fontWeight: 600, marginBottom: "0.5rem" },
                    input: {
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...editForm.getInputProps("tiktokLink")}
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                onClick={() => setEditModalOpen(false)}
                size="md"
                radius="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateProfileMutation.isPending}
                size="md"
                radius="md"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                  border: "none",
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
