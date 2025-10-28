import {
  Box,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Center,
} from "@mantine/core";
import { IconSearch, IconTrendingUp, IconUsers, IconPhoto } from "@tabler/icons-react";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { ProfileSwipe } from "../../components/ui";
import {
  useFollowers,
  useFollowing,
  useSuggestedUsers,
} from "../../hooks/useFollow";
import { useInfinitePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUser";
import { useSearch } from "../../hooks/useSearch";
import { PostCard } from "../posts/PostCard";

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

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

  // Search functionality
  const { data: searchResults, isLoading: searchLoading } = useSearch({
    q: debouncedSearchQuery,
    type: activeTab === "people" ? "users" : activeTab === "posts" ? "posts" : "all",
    limit: 20,
  });

  const isSearching = debouncedSearchQuery.trim().length > 0;

  return (
    <Stack gap="sm" p="sm">
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
          <Tabs.Tab value="posts" leftSection={<IconPhoto size={16} />}>
            Posts
          </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="trending" pt="md">
            <Stack gap="sm">
            {isSearching ? (
              // Show search results for trending tab
              <>
                {searchLoading ? (
                  <Center py="xl">
                    <Stack align="center" gap="sm">
                      <Loader size="lg" />
                      <Text size="sm" c="dimmed">
                        Searching...
                      </Text>
                    </Stack>
                  </Center>
                ) : searchResults ? (
                  <>
                    {searchResults.posts.length > 0 && (
                      <Stack gap="sm">
                        <Text fw={600} size="sm" c="dimmed">
                          Posts ({searchResults.posts.length})
                        </Text>
                        {searchResults.posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </Stack>
                    )}
                    {searchResults.users.length > 0 && (
                      <Stack gap="sm">
                        <Text fw={600} size="sm" c="dimmed">
                          People ({searchResults.users.length})
                        </Text>
                        <ProfileSwipe
                          users={searchResults.users}
                          title=""
                          subtitle=""
                        />
                      </Stack>
                    )}
                    {searchResults.posts.length === 0 && searchResults.users.length === 0 && (
                      <Center py="xl">
                        <Stack align="center" gap="sm">
                          <IconSearch
                            size={48}
                            color="var(--mantine-color-gray-4)"
                          />
                          <Stack align="center" gap="xs">
                            <Text fw={600} size="lg">
                              No results found
                            </Text>
                            <Text c="dimmed" ta="center" size="sm">
                              Try searching with different keywords
                            </Text>
                          </Stack>
                        </Stack>
                      </Center>
                    )}
                  </>
                ) : null}
              </>
            ) : (
              // Show trending posts when not searching
              <>
                  {postsLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : trendingPosts?.pages[0]?.posts?.length &&
                    trendingPosts.pages[0].posts.length > 0 ? (
                    trendingPosts.pages[0].posts.map((post) => (
                      <PostCard key={post.id} post={post} />
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
                          color="var(--mantine-color-colors-6)"
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
              </>
            )}
            </Stack>
          </Tabs.Panel>

        <Tabs.Panel value="people" pt="md">
          <Stack gap="sm">
            {isSearching ? (
              // Show search results for people tab
              <>
                {searchLoading ? (
                  <Center py="xl">
                    <Stack align="center" gap="sm">
                      <Loader size="lg" />
                      <Text size="sm" c="dimmed">
                        Searching people...
                      </Text>
                    </Stack>
                  </Center>
                ) : searchResults ? (
                  <>
                    {searchResults.users.length > 0 ? (
                      <ProfileSwipe
                        users={searchResults.users}
                        title={`Found ${searchResults.users.length} people`}
                        subtitle=""
                      />
                    ) : (
                      <Center py="xl">
                        <Stack align="center" gap="sm">
                          <IconUsers
                            size={48}
                            color="var(--mantine-color-gray-4)"
                          />
                          <Stack align="center" gap="xs">
                            <Text fw={600} size="lg">
                              No people found
                            </Text>
                            <Text c="dimmed" ta="center" size="sm">
                              Try searching with different keywords
                            </Text>
                          </Stack>
                        </Stack>
                      </Center>
                    )}
                  </>
                ) : null}
              </>
            ) : (
              // Show suggested users when not searching
              <>
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
                  ) : null}

                  {followingLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : followingData && followingData.following.length > 0 ? (
                    <ProfileSwipe
                      users={followingData.following}
                      title="People you're following"
                      subtitle="My followings"
                    />
                  ) : null}

                  {followersLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : followersData && followersData.followers.length > 0 ? (
                    <ProfileSwipe
                      users={followersData.followers}
                      title="Your followers"
                      subtitle="My followers"
                    />
                  ) : null}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="posts" pt="md">
          <Stack gap="sm">
            {isSearching ? (
              // Show search results for posts tab
              <>
                {searchLoading ? (
                  <Center py="xl">
                    <Stack align="center" gap="sm">
                      <Loader size="lg" />
                      <Text size="sm" c="dimmed">
                        Searching posts...
                      </Text>
                    </Stack>
                  </Center>
                ) : searchResults ? (
                  <>
                    {searchResults.posts.length > 0 ? (
                      <>
                        <Text fw={600} size="sm" c="dimmed">
                          Found {searchResults.posts.length} posts
                        </Text>
                        {searchResults.posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </>
                    ) : (
                      <Center py="xl">
                        <Stack align="center" gap="sm">
                          <IconPhoto
                            size={48}
                            color="var(--mantine-color-gray-4)"
                          />
                          <Stack align="center" gap="xs">
                            <Text fw={600} size="lg">
                              No posts found
                            </Text>
                            <Text c="dimmed" ta="center" size="sm">
                              Try searching with different keywords
                            </Text>
                          </Stack>
                        </Stack>
                      </Center>
                    )}
                  </>
                ) : null}
              </>
            ) : (
              // Show trending posts when not searching
              <>
                {postsLoading ? (
                  <Group justify="center" py="xl">
                    <Loader size="lg" />
                  </Group>
                ) : trendingPosts?.pages[0]?.posts?.length &&
                  trendingPosts.pages[0].posts.length > 0 ? (
                  trendingPosts.pages[0].posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <Box
                    p="sm"
                    style={{
                      border: "none",
                    }}
                  >
                    <Stack align="center" gap="sm">
                      <IconPhoto
                        size={48}
                        color="var(--mantine-color-colors-6)"
                      />
                      <Stack align="center" gap="xs">
                        <Text fw={600} size="lg">
                          No posts available
                        </Text>
                        <Text c="dimmed" ta="center" size="sm">
                          Posts will appear here when available.
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>
        </Tabs>
    </Stack>
  );
}
