import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCalendar,
  IconHeart,
  IconLink,
  IconMapPin,
  IconMessageCircle,
  IconSettings,
  IconShare,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";

// Mock user data
const mockUser = {
  id: "1",
  username: "johndoe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  avatar: null,
  bio: "Software developer passionate about creating amazing user experiences. Building the future of social media with Kendle! 🚀",
  isVerified: true,
  createdAt: "2023-01-15T00:00:00Z",
  followersCount: 1247,
  followingCount: 892,
  postsCount: 156,
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  isFollowing: false,
  isOwnProfile: true,
};

const mockPosts = [
  {
    id: "1",
    content:
      "Just launched our new social media platform! 🚀 Excited to see how it helps people connect and share their stories. #Kendle #SocialMedia #Innovation",
    createdAt: "2024-01-15T10:30:00Z",
    _count: { likes: 42, comments: 12, shares: 5 },
    isLiked: false,
  },
  {
    id: "2",
    content: "Beautiful sunset today! Nature never fails to amaze me. 🌅",
    createdAt: "2024-01-14T18:15:00Z",
    _count: { likes: 28, comments: 8, shares: 3 },
    isLiked: true,
  },
];

export function ProfilePage() {
  // const { userId } = useParams()
  // const { user: currentUser } = useAuthStore()
  const [user] = useState(mockUser);
  const [posts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState("posts");

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
    // TODO: Implement follow/unfollow functionality
    console.log("Follow/Unfollow user");
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Profile Header */}
        <Card withBorder p="xl">
          <Stack gap="lg">
            {/* Profile Info */}
            <Group justify="space-between" align="flex-start">
              <Group>
                <Avatar
                  src={user.avatar}
                  alt={user.firstName}
                  size="xl"
                  radius="xl"
                >
                  {user.firstName.charAt(0)}
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
                {user.isOwnProfile ? (
                  <Button
                    variant="outline"
                    leftSection={<IconSettings size={16} />}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={user.isFollowing ? "outline" : "filled"}
                    leftSection={
                      user.isFollowing ? (
                        <IconUserMinus size={16} />
                      ) : (
                        <IconUserPlus size={16} />
                      )
                    }
                    onClick={handleFollow}
                  >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </Group>
            </Group>

            {/* Stats */}
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

            {/* Additional Info */}
            <Group gap="lg">
              {user.location && (
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text size="sm">{user.location}</Text>
                </Group>
              )}
              {user.website && (
                <Group gap="xs">
                  <IconLink size={16} />
                  <Text
                    size="sm"
                    component="a"
                    href={user.website}
                    target="_blank"
                  >
                    {user.website}
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

        {/* Tabs */}
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
              {posts.map((post) => (
                <Card key={post.id} withBorder p="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text c="dimmed" size="xs">
                        {formatDate(post.createdAt)}
                      </Text>
                    </Group>

                    <Text size="sm" style={{ lineHeight: 1.6 }}>
                      {post.content}
                    </Text>

                    <Group justify="space-between">
                      <Group gap="xs">
                        <ActionIcon
                          variant={post.isLiked ? "filled" : "subtle"}
                          color={post.isLiked ? "red" : "gray"}
                        >
                          <IconHeart size={16} />
                        </ActionIcon>
                        <Text size="xs" c="dimmed">
                          {formatNumber(post._count.likes)}
                        </Text>

                        <ActionIcon variant="subtle" color="gray">
                          <IconMessageCircle size={16} />
                        </ActionIcon>
                        <Text size="xs" c="dimmed">
                          {formatNumber(post._count.comments)}
                        </Text>

                        <ActionIcon variant="subtle" color="gray">
                          <IconShare size={16} />
                        </ActionIcon>
                        <Text size="xs" c="dimmed">
                          {formatNumber(post._count.shares)}
                        </Text>
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              ))}
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
    </Container>
  );
}
