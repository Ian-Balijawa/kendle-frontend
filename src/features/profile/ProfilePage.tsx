import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
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
  UnstyledButton,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
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
import { useUserPosts } from "../../hooks/usePosts";
import { useUpdateProfile, useUser, useUserProfile } from "../../hooks/useUser";
import { UpdateProfileRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { User } from "../../types/auth";
import { PostCard } from "../posts/PostCard";

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("posts");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = isOwnProfile ? useUserProfile() : useUser(profileUserId!);

  const { data: postsData, isLoading: postsLoading } = useUserPosts(
    profileUserId!,
    {
      limit: 10,
    }
  );

  const updateProfileMutation = useUpdateProfile();

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

  useEffect(() => {
    if (user) {
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
  }, [user]);

  const posts = postsData?.pages.flatMap((page) => page.posts) || [];

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

  const handleFollow = () => {
    console.log("Follow/Unfollow user");
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

  const socialLinks = [
    {
      key: "whatsapp",
      url: `https://wa.me/${user?.whatsapp}`,
      icon: IconBrandWhatsapp,
      label: "WhatsApp",
      color: "#25D366",
    },
    {
      key: "twitterLink",
      url: user?.twitterLink,
      icon: IconBrandTwitter,
      label: "Twitter",
      color: "#1DA1F2",
    },
    {
      key: "instagramLink",
      url: user?.instagramLink,
      icon: IconBrandInstagram,
      label: "Instagram",
      color: "#E4405F",
    },
    {
      key: "tiktokLink",
      url: user?.tiktokLink,
      icon: IconBrandTiktok,
      label: "TikTok",
      color: "#000000",
    },
  ].filter((link) => user?.[link.key as keyof User]);

  if (userLoading) {
    return (
      <Container size="xl">
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
      </Container>
    );
  }

  if (userError || !user) {
    return (
      <Container size="xl">
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
                  background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
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
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Box
        style={{
          height: 200,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
        }}
      >
        <Avatar
          src={user.avatar || "/user.png"}
          alt={user.firstName || ""}
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
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </Text>
        </Avatar>
      </Box>

      <Box py="xl" pt={80}>
        <Group justify="space-between" align="flex-start" mb="lg">
          <Box style={{ flex: 1 }}>
            <Group gap="sm" align="center" mb="xs">
              <Title order={1} size={rem(28)} fw={700}>
                {user.firstName} {user.lastName}
              </Title>
              {user.isVerified && (
                <Badge
                  color="blue"
                  variant="light"
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #4dabf7, #339af0)",
                    color: "white",
                    border: "none",
                  }}
                >
                  <IconCheck size={14} style={{ marginRight: 4 }} />
                  Verified
                </Badge>
              )}
            </Group>

            <Text c="dimmed" size="lg" mb="md" fw={500}>
              @{user.username}
            </Text>

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
              <IconCalendar size={18} color="#868e96" />
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
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  border: "none",
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={user?.isFollowing ? "light" : "filled"}
                leftSection={
                  user?.isFollowing ? (
                    <IconUserCheck size={18} />
                  ) : (
                    <IconUserPlus size={18} />
                  )
                }
                onClick={handleFollow}
                radius="xl"
                style={
                  user?.isFollowing
                    ? { color: "#667eea", borderColor: "#667eea" }
                    : {
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        border: "none",
                      }
                }
              >
                {user?.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Group>
        </Group>

        <Grid mb="lg">
          <Grid.Col span={4}>
            <UnstyledButton
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f8f9ff, #f1f3ff)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Stack align="center" gap="xs">
                <Text fw={700} size="xl" c="#667eea">
                  {formatNumber(user.postsCount)}
                </Text>
                <Text size="sm" c="dimmed" fw={500}>
                  Posts
                </Text>
              </Stack>
            </UnstyledButton>
          </Grid.Col>

          <Grid.Col span={4}>
            <UnstyledButton
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #fff8f0, #fff0e6)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Stack align="center" gap="xs">
                <Text fw={700} size="xl" c="#fd7e14">
                  {formatNumber(user.followersCount)}
                </Text>
                <Text size="sm" c="dimmed" fw={500}>
                  Followers
                </Text>
              </Stack>
            </UnstyledButton>
          </Grid.Col>

          <Grid.Col span={4}>
            <UnstyledButton
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f0fff4, #e6fffa)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Stack align="center" gap="xs">
                <Text fw={700} size="xl" c="#20c997">
                  {formatNumber(user.followingCount)}
                </Text>
                <Text size="sm" c="dimmed" fw={500}>
                  Following
                </Text>
              </Stack>
            </UnstyledButton>
          </Grid.Col>
        </Grid>

        {socialLinks.length > 0 && (
          <>
            <Divider mb="lg" />
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
                  radius="xl"
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
        radius="xl"
      >
        <Tabs.List
          style={{
            background: "#f8f9fa",
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
                radius="xl"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #f1f3ff)",
                  border: "none",
                }}
              >
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "rgba(102, 126, 234, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconMessage size={32} color="#667eea" />
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
          <Card
            p="xl"
            radius="xl"
            style={{
              background: "linear-gradient(135deg, #fff8f0, #fff0e6)",
              border: "none",
            }}
          >
            <Stack align="center" gap="md">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(253, 126, 20, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconPhoto size={32} color="#fd7e14" />
              </Box>
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">
                  No media posts yet
                </Text>
                <Text c="dimmed" ta="center" size="sm">
                  Media posts will appear here when available.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="likes" pt="xl">
          <Card
            p="xl"
            radius="xl"
            style={{
              background: "linear-gradient(135deg, #fff5f5, #ffe0e6)",
              border: "none",
            }}
          >
            <Stack align="center" gap="md">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(224, 49, 49, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconHeart size={32} color="#e03131" />
              </Box>
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">
                  No liked posts yet
                </Text>
                <Text c="dimmed" ta="center" size="sm">
                  Liked posts will appear here when available.
                </Text>
              </Stack>
            </Stack>
          </Card>
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
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
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
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
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
                    borderColor: "#667eea",
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
                    borderColor: "#667eea",
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
                    borderColor: "#667eea",
                    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
              {...editForm.getInputProps("bio")}
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
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
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
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
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
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
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
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
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
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none",
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
