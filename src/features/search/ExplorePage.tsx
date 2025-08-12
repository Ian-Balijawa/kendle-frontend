import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconHash,
  IconHeart,
  IconMessageCircle,
  IconSearch,
  IconShare,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";

const mockTrendingPosts = [
  {
    id: "1",
    content: "Amazing sunset at the beach today! 🌅 #Sunset #Beach #Nature",
    author: {
      id: "1",
      username: "naturelover",
      firstName: "Sarah",
      lastName: "Wilson",
      avatar: null,
    },
    createdAt: "2024-01-15T08:30:00Z",
    _count: { likes: 156, comments: 23, shares: 12 },
  },
  {
    id: "2",
    content:
      "Just finished reading this incredible book! Highly recommend. 📚 #Books #Reading",
    author: {
      id: "2",
      username: "bookworm",
      firstName: "Mike",
      lastName: "Johnson",
      avatar: null,
    },
    createdAt: "2024-01-15T07:15:00Z",
    _count: { likes: 89, comments: 15, shares: 8 },
  },
];

const mockTrendingUsers = [
  {
    id: "1",
    username: "techguru",
    firstName: "Alex",
    lastName: "Chen",
    avatar: null,
    followersCount: 15420,
    isFollowing: false,
  },
  {
    id: "2",
    username: "travelbug",
    firstName: "Emma",
    lastName: "Davis",
    avatar: null,
    followersCount: 8920,
    isFollowing: true,
  },
];

const mockTrendingHashtags = [
  { name: "Kendle", postsCount: 15420 },
  { name: "SocialMedia", postsCount: 8920 },
  { name: "Innovation", postsCount: 6540 },
  { name: "Tech", postsCount: 5430 },
  { name: "Design", postsCount: 4320 },
];

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Explore
          </Title>
          <Text c="dimmed" size="sm">
            Discover trending content and people
          </Text>
        </Box>

        <TextInput
          placeholder="Search posts, people, or hashtags..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          size="md"
          radius="xl"
        />

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "trending")}
        >
          <Tabs.List>
            <Tabs.Tab
              value="trending"
              leftSection={<IconTrendingUp size={16} />}
            >
              Trending
            </Tabs.Tab>
            <Tabs.Tab value="people" leftSection={<IconUsers size={16} />}>
              People
            </Tabs.Tab>
            <Tabs.Tab value="hashtags" leftSection={<IconHash size={16} />}>
              Hashtags
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="trending" pt="md">
            <Stack gap="md">
              {mockTrendingPosts.map((post) => (
                <Card key={post.id} withBorder p="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Group>
                        <Avatar
                          src={post.author.avatar}
                          alt={post.author.firstName}
                          size="md"
                        >
                          {post.author.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Text fw={500} size="sm">
                            {post.author.firstName} {post.author.lastName}
                          </Text>
                          <Text c="dimmed" size="xs">
                            @{post.author.username} •{" "}
                            {formatDate(post.createdAt)}
                          </Text>
                        </Box>
                      </Group>
                    </Group>

                    <Text size="sm" style={{ lineHeight: 1.6 }}>
                      {post.content}
                    </Text>

                    <Group justify="space-between">
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="gray">
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

          <Tabs.Panel value="people" pt="md">
            <Grid>
              {mockTrendingUsers.map((user) => (
                <Grid.Col key={user.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card withBorder p="md">
                    <Group>
                      <Avatar
                        src={user.avatar}
                        alt={user.firstName}
                        size="lg"
                        radius="xl"
                      >
                        {user.firstName.charAt(0)}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text fw={500} size="sm">
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text c="dimmed" size="xs">
                          @{user.username}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatNumber(user.followersCount)} followers
                        </Text>
                      </Box>
                      <Badge
                        variant={user.isFollowing ? "filled" : "light"}
                        color={user.isFollowing ? "gray" : "blue"}
                        size="sm"
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </Badge>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="hashtags" pt="md">
            <Stack gap="md">
              {mockTrendingHashtags.map((hashtag, index) => (
                <Card key={hashtag.name} withBorder p="md">
                  <Group justify="space-between">
                    <Group>
                      <Badge size="lg" variant="light" color="blue">
                        #{hashtag.name}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {formatNumber(hashtag.postsCount)} posts
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" fw={500}>
                      #{index + 1}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}
