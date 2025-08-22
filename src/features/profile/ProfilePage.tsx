import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  Loader,
  Center,
  Modal,
  TextInput,
  Textarea,
} from "@mantine/core";
import {
  IconCalendar,
  IconLink,
  IconSettings,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUser, useUserProfile, useUpdateProfile } from "../../hooks/useUser";
import { useUserPosts } from "../../hooks/usePosts";
import { PostCard } from "../posts/PostCard";
import { UpdateProfileRequest } from "../../services/api";
import { useForm } from "@mantine/form";

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("posts");
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  // Fetch user data
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = isOwnProfile ? useUserProfile() : useUser(profileUserId!);

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useUserPosts(
    profileUserId!,
    {
      limit: 10,
    },
  );

  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();

  // Form for editing profile
  const editForm = useForm<UpdateProfileRequest>({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      username: user?.username || "",
      email: user?.email || "",
      whatsapp: user?.whatsapp || "",
      twitterLink: user?.twitterLink || "",
      tiktokLink: user?.tiktokLink || "",
      instagramLink: user?.instagramLink || "",
    },
  });

  // Update form values when user data changes
  if (user && editForm.values.firstName !== user.firstName) {
    editForm.setValues({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      username: user.username || "",
      email: user.email || "",
      whatsapp: user.whatsapp || "",
      twitterLink: user.twitterLink || "",
      tiktokLink: user.tiktokLink || "",
      instagramLink: user.instagramLink || "",
    });
  }

  const posts = postsData?.pages.flatMap((page) => page.data) || [];

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
    return num.toString();
  };

  const handleFollow = () => {
    console.log("Follow/Unfollow user");
    // TODO: Implement follow/unfollow functionality
  };

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

  if (userLoading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading profile...</Text>
        </Stack>
      </Center>
    );
  }

  if (userError || !user) {
    return (
      <Card
        withBorder
        p="xl"
        radius="md"
        style={{ borderColor: "var(--mantine-color-red-3)" }}
      >
        <Stack align="center" gap="md">
          <Text size="lg" fw={500} c="red">
            Profile not found
          </Text>
          <Text c="dimmed" ta="center">
            The profile you're looking for doesn't exist or has been removed.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <Stack gap="lg">
        <Card withBorder p="xl">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Group>
                <Avatar
                  src={user.avatar}
                  alt={user.firstName}
                  size="xl"
                  radius="xl"
                >
                  {user.firstName?.charAt(0)}
                </Avatar>
                <Box>
                  <Group gap="xs" align="center">
                    <Title order={2} size="h3">
                      {user.firstName} {user.lastName}
                    </Title>
                    {user.isVerified && (
                      <Badge color="blue" variant="light" size="sm">
                        Verified
                      </Badge>
                    )}
                  </Group>
                  <Text c="dimmed" size="sm">
                    @{user.username}
                  </Text>
                  {user.bio && (
                    <Text size="sm" mt="xs" style={{ lineHeight: 1.5 }}>
                      {user.bio}
                    </Text>
                  )}
                </Box>
              </Group>

              <Group>
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    leftSection={<IconSettings size={16} />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={user?.isFollowing ? "outline" : "filled"}
                    leftSection={
                      user?.isFollowing ? (
                        <IconUserMinus size={16} />
                      ) : (
                        <IconUserPlus size={16} />
                      )
                    }
                    onClick={handleFollow}
                  >
                    {user?.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </Group>
            </Group>

            <Group gap="xl">
              <Box ta="center">
                <Text fw={700} size="lg">
                  {formatNumber(user.postsCount)}
                </Text>
                <Text size="sm" c="dimmed">
                  Posts
                </Text>
              </Box>
              <Box ta="center">
                <Text fw={700} size="lg">
                  {formatNumber(user.followersCount)}
                </Text>
                <Text size="sm" c="dimmed">
                  Followers
                </Text>
              </Box>
              <Box ta="center">
                <Text fw={700} size="lg">
                  {formatNumber(user.followingCount)}
                </Text>
                <Text size="sm" c="dimmed">
                  Following
                </Text>
              </Box>
            </Group>

            <Group gap="lg">
              {user.twitterLink && (
                <Group gap="xs">
                  <IconLink size={16} />
                  <Text
                    size="sm"
                    component="a"
                    href={user.twitterLink}
                    target="_blank"
                  >
                    Twitter
                  </Text>
                </Group>
              )}
              {user.instagramLink && (
                <Group gap="xs">
                  <IconLink size={16} />
                  <Text
                    size="sm"
                    component="a"
                    href={user.instagramLink}
                    target="_blank"
                  >
                    Instagram
                  </Text>
                </Group>
              )}
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm">Joined {formatDate(user.createdAt)}</Text>
              </Group>
            </Group>
          </Stack>
        </Card>

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "posts")}
        >
          <Tabs.List>
            <Tabs.Tab value="posts">Posts</Tabs.Tab>
            <Tabs.Tab value="media">Media</Tabs.Tab>
            <Tabs.Tab value="likes">Likes</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="posts" pt="md">
            <Stack gap="md">
              {postsLoading ? (
                <Center py="md">
                  <Stack align="center" gap="sm">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">
                      Loading posts...
                    </Text>
                  </Stack>
                </Center>
              ) : posts.length === 0 ? (
                <Card withBorder p="md">
                  <Text c="dimmed" ta="center">
                    No posts yet
                  </Text>
                </Card>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="media" pt="md">
            <Text c="dimmed" ta="center" py="xl">
              No media posts yet
            </Text>
          </Tabs.Panel>

          <Tabs.Panel value="likes" pt="md">
            <Text c="dimmed" ta="center" py="xl">
              No liked posts yet
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Edit Profile Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile"
        size="lg"
      >
        <form onSubmit={editForm.onSubmit(handleSaveProfile)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                {...editForm.getInputProps("firstName")}
              />
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                {...editForm.getInputProps("lastName")}
              />
            </Group>

            <TextInput
              label="Username"
              placeholder="Enter username"
              {...editForm.getInputProps("username")}
            />

            <TextInput
              label="Email"
              placeholder="Enter email"
              type="email"
              {...editForm.getInputProps("email")}
            />

            <Textarea
              label="Bio"
              placeholder="Tell us about yourself"
              minRows={3}
              {...editForm.getInputProps("bio")}
            />

            <TextInput
              label="WhatsApp"
              placeholder="Enter WhatsApp number"
              {...editForm.getInputProps("whatsapp")}
            />

            <TextInput
              label="Twitter Link"
              placeholder="Enter Twitter profile URL"
              {...editForm.getInputProps("twitterLink")}
            />

            <TextInput
              label="Instagram Link"
              placeholder="Enter Instagram profile URL"
              {...editForm.getInputProps("instagramLink")}
            />

            <TextInput
              label="TikTok Link"
              placeholder="Enter TikTok profile URL"
              {...editForm.getInputProps("tiktokLink")}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updateProfileMutation.isPending}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
