import {
  Box,
  Container,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconSearch,
  IconTrendingUp,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { ProfileSwipe } from "../../components/ui";
import {
  useFollowers,
  useFollowing,
  useSuggestedUsers,
} from "../../hooks/useFollow";
import { useInfinitePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUser";
import { PostCard } from "../posts/PostCard";

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const { data: currentUser } = useUserProfile();

  const { data: suggestedUsers, isLoading: usersLoading } =
    useSuggestedUsers(15);

  const { data: followersData, isLoading: followersLoading } = useFollowers(
    currentUser?.id || "",
    1,
    20,
  );
  const { data: followingData, isLoading: followingLoading } = useFollowing(
    currentUser?.id || "",
    1,
    20,
  );

  const { data: trendingPosts, isLoading: postsLoading } = useInfinitePosts({
    limit: 10,
    sortBy: "likesCount",
    sortOrder: "desc",
  });

  return (
    <Container size="xl" px="sm">
      <Stack gap="sm">
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
          </Tabs.List>

          <Tabs.Panel value="trending" pt="md">
            <Stack gap="sm">
              {postsLoading ? (
                <Group justify="center" py="xl">
                  <Loader size="lg" />
                </Group>
              ) : trendingPosts?.pages[0]?.posts?.length &&
                trendingPosts.pages[0].posts.length > 0 ? (
                trendingPosts.pages[0].posts.map((post, index) => (
                  <PostCard key={post.id} post={post} isFirst={index === 0} />
                ))
              ) : (
                <Box
                  p="sm"
                  style={{
                    border: "none",
                  }}
                >
                  <Stack align="center" gap="sm">
                    <IconTrendingUp
                      size={48}
                      color="var(--mantine-color-blue-6)"
                    />
                    <Stack align="center" gap="xs">
                      <Text fw={600} size="lg">
                        No trending posts yet
                      </Text>
                      <Text c="dimmed" ta="center" size="sm">
                        Trending posts will appear here when available.
                      </Text>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Tabs.Panel>

          <Stack my="md">
            {usersLoading ? (
              <Group justify="center" py="xl">
                <Loader size="lg" />
              </Group>
            ) : suggestedUsers && suggestedUsers.suggestions.length > 0 ? (
              <ProfileSwipe
                users={suggestedUsers.suggestions}
                title="Discover Amazing People"
                subtitle="Connect with creators and influencers in your community"
              />
            ) : (
              <Box
                p="sm"
                style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="sm">
                  <IconUsers size={48} color="var(--mantine-color-cyan-6)" />
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
              </Box>
            )}

            {followingLoading ? (
              <Group justify="center" py="xl">
                <Loader size="lg" />
              </Group>
            ) : followingData && followingData.following.length > 0 ? (
              <ProfileSwipe
                users={followingData.following}
                title="Peole you're following"
                subtitle="My followings"
              />
            ) : (
              <Box
                p="sm"
                style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="sm">
                  <IconUsers size={48} color="var(--mantine-color-cyan-6)" />
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      You're following no users at the moment
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      More amazing people will appear here as when you follow
                      them.
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            )}

            {followersLoading ? (
              <Group justify="center" py="xl">
                <Loader size="lg" />
              </Group>
            ) : followersData && followersData.followers.length > 0 ? (
              <ProfileSwipe
                users={followersData.followers}
                title="Your follower"
                subtitle="My followers"
              />
            ) : (
              <Box
                p="sm"
                style={{
                  border: "none",
                }}
              >
                <Stack align="center" gap="sm">
                  <IconUserPlus
                    size={48}
                    color="var(--mantine-color-yellow-6)"
                  />
                  <Stack align="center" gap="xs">
                    <Text fw={600} size="lg">
                      No followers yet
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                      Share your profile to start building your community!
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        </Tabs>
      </Stack>
    </Container>
  );
}
