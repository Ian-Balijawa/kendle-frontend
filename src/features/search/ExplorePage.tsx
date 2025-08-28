import {
  Badge,
  Box,
  Card,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconHash,
  IconSearch,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { ProfileSwipe } from "../../components/ui";
import { useSuggestedUsers } from "../../hooks/useFollow";
import { useInfinitePosts } from "../../hooks/usePosts";
import { PostCard } from "../posts/PostCard";

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

  // Get suggested users for people discovery
  const { data: suggestedUsers, isLoading: usersLoading } =
    useSuggestedUsers(15);

  // Get trending posts
  const { data: trendingPosts, isLoading: postsLoading } = useInfinitePosts({
    limit: 10,
    sortBy: "likesCount",
    sortOrder: "desc",
  });

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
              {postsLoading ? (
                <Group justify="center" py="xl">
                  <Loader size="lg" />
                </Group>
              ) : trendingPosts?.pages[0]?.posts?.length &&
                trendingPosts.pages[0].posts.length > 0 ? (
                trendingPosts.pages[0].posts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isFirst={index === 0}
                  />
                ))
              ) : (
                <Card
                  p="xl"
                  radius="xl"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #f1f3ff)",
                    border: "none",
                  }}
                >
                  <Stack align="center" gap="md">
                    <IconTrendingUp size={48} color="#667eea" />
                    <Stack align="center" gap="xs">
                      <Text fw={600} size="lg">
                        No trending posts yet
                      </Text>
                      <Text c="dimmed" ta="center" size="sm">
                        Trending posts will appear here when available.
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="people" pt="md">
            {usersLoading ? (
              <Group justify="center" py="xl">
                <Loader size="lg" />
              </Group>
            ) : suggestedUsers && suggestedUsers.length > 0 ? (
              <ProfileSwipe
                users={suggestedUsers}
                title="Discover Amazing People"
                subtitle="Connect with creators and influencers in your community"
                showStats={true}
              />
            ) : (
              <Card
                p="xl"
                radius="xl"
                style={{
                  background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                  border: "none",
                }}
              >
                <Stack align="center" gap="md">
                  <IconUsers size={48} color="#0ea5e9" />
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      No users to discover
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      More amazing people will appear here as they join the
                      community!
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            )}
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
                        {hashtag.postsCount >= 1000000
                          ? `${(hashtag.postsCount / 1000000).toFixed(1)}M`
                          : hashtag.postsCount >= 1000
                          ? `${(hashtag.postsCount / 1000).toFixed(1)}K`
                          : hashtag.postsCount} posts
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
