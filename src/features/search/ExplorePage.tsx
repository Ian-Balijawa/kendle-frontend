import {
  Avatar,
  Badge,
  Box,
  Button,
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
  IconUserCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSwipe } from "../../components/ui";
import {
  useFollowers,
  useFollowing,
  useSuggestedUsers,
  useToggleFollow,
} from "../../hooks/useFollow";
import { useInfinitePosts } from "../../hooks/usePosts";
import { useUser, useUserProfile } from "../../hooks/useUser";
import { User } from "../../types/auth";
import { PostCard } from "../posts/PostCard";

const mockTrendingHashtags = [
  { name: "Kendle", postsCount: 15420 },
  { name: "SocialMedia", postsCount: 8920 },
  { name: "Innovation", postsCount: 6540 },
  { name: "Tech", postsCount: 5430 },
  { name: "Design", postsCount: 4320 },
];

// UserCard component for displaying individual users
interface UserCardProps {
  userId: string;
  onFollow: (userId: string, isFollowing: boolean) => void;
  onViewProfile: (userId: string) => void;
  isFollowing: boolean;
  followLoading: boolean;
}

function UserCard({
  userId,
  onFollow,
  onViewProfile,
  isFollowing,
  followLoading,
}: UserCardProps) {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <Box p="md">
        <Group>
          <Avatar size="md" radius="xl" />
          <Box style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Loading...
            </Text>
          </Box>
        </Group>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box p="md" style={{ cursor: "pointer" }}>
      <Group justify="space-between" align="center">
        <Group
          gap="md"
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => onViewProfile(user.id)}
        >
          <Avatar
            src={user.avatar}
            alt={user.firstName || user.username || "User"}
            size="md"
            radius="xl"
            style={{
              border: user.isVerified
                ? "2px solid var(--mantine-color-blue-5)"
                : "none",
            }}
          >
            {(user.firstName || user.username || user.phoneNumber || "U")
              .charAt(0)
              .toUpperCase()}
          </Avatar>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center" mb="xs">
              <Text fw={600} size="sm" truncate>
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username
                    ? user.username
                    : user.phoneNumber || "Unknown User"}
              </Text>
              {user.isVerified && (
                <Badge size="xs" color="blue" radius="sm" variant="filled">
                  ✓
                </Badge>
              )}
            </Group>

            <Group gap="xs" mb="xs">
              <Text size="xs" c="dimmed">
                @{user.username || user.phoneNumber || "unknown"}
              </Text>
              {user.bio && (
                <>
                  <Text size="xs" c="dimmed">
                    •
                  </Text>
                  <Text size="xs" c="dimmed" truncate style={{ maxWidth: 200 }}>
                    {user.bio}
                  </Text>
                </>
              )}
            </Group>

            <Group gap="md">
              <Text size="xs" c="dimmed">
                {user.followersCount || 0} followers
              </Text>
              <Text size="xs" c="dimmed">
                {user.postsCount || 0} posts
              </Text>
            </Group>
          </Box>
        </Group>

        <Button
          variant={isFollowing ? "light" : "filled"}
          size="sm"
          radius="xl"
          loading={followLoading}
          onClick={(e) => {
            e.stopPropagation();
            onFollow(user.id, isFollowing);
          }}
          leftSection={
            isFollowing ? (
              <IconUserCheck size={14} />
            ) : (
              <IconUserPlus size={14} />
            )
          }
          style={
            isFollowing
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
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </Group>
    </Box>
  );
}

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [peopleTab, setPeopleTab] = useState("suggestions");
  const navigate = useNavigate();

  // Get current user profile
  const { data: currentUser } = useUserProfile();

  // Get suggested users for people discovery
  const { data: suggestedUsers, isLoading: usersLoading } =
    useSuggestedUsers(15);

  // Get followers and following
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

  console.log(followingData);
  console.log(followersData);

  // Follow functionality
  const { toggleFollow, isLoading: followLoading } = useToggleFollow();

  // Get trending posts
  const { data: trendingPosts, isLoading: postsLoading } = useInfinitePosts({
    limit: 10,
    sortBy: "likesCount",
    sortOrder: "desc",
  });

  const handleFollowUser = async (userId: string, isFollowing: boolean) => {
    await toggleFollow(userId, isFollowing);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
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
                      p="xl"
                      style={{
                    border: "none",
                  }}
                >
                  <Stack align="center" gap="md">
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

          <Tabs.Panel value="people" pt="md">
            <Stack gap="lg">
              {/* People Tab Navigation */}
              <Tabs
                value={peopleTab}
                onChange={(value) => setPeopleTab(value || "suggestions")}
                variant="pills" 
              >
                <Tabs.List
                  style={{
                    padding: "4px",
                    borderRadius: "16px",
                  }}
                >
                  <Tabs.Tab
                    value="suggestions"
                    leftSection={<IconUsers size={16} />}
                    style={{
                      borderRadius: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Discover
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="following"
                    leftSection={<IconUserCheck size={16} />}
                    style={{
                      borderRadius: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Following
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="followers"
                    leftSection={<IconUserPlus size={16} />}
                    style={{
                      borderRadius: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Followers
                  </Tabs.Tab>
                </Tabs.List>

                {/* Suggestions Tab */}
                <Tabs.Panel value="suggestions" pt="md">
                  {usersLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : suggestedUsers &&
                    suggestedUsers.suggestions.length > 0 ? (
                    <ProfileSwipe
                      users={suggestedUsers.suggestions}
                      title="Discover Amazing People"
                      subtitle="Connect with creators and influencers in your community"
                      showStats={true}
                    />
                  ) : (
                        <Box
                          p="xl"
                          style={{
                        border: "none",
                      }}
                    >
                      <Stack align="center" gap="md">
                        <IconUsers
                          size={48}
                          color="var(--mantine-color-cyan-6)"
                        />
                        <Stack align="center" gap="xs">
                          <Text fw={600} size="lg">
                            No users to discover
                          </Text>
                          <Text c="dimmed" ta="center" size="sm">
                            More amazing people will appear here as they join
                            the community!
                          </Text>
                        </Stack>
                      </Stack>
                        </Box>
                  )}
                </Tabs.Panel>

                {/* Following Tab */}
                <Tabs.Panel value="following" pt="md">
                  {followingLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : followingData && followingData.following.length > 0 ? (
                      <Stack gap="md">
                      {followingData.following.map((user: User) => (
                        <UserCard
                          key={user.id}
                          userId={user.id}
                          onFollow={handleFollowUser}
                          onViewProfile={handleViewProfile}
                          isFollowing={true}
                          followLoading={followLoading}
                        />
                      ))}
                    </Stack>
                  ) : (
                        <Box
                          p="xl"
                          style={{
                        border: "none",
                      }}
                    >
                      <Stack align="center" gap="md">
                        <IconUserCheck
                          size={48}
                          color="var(--mantine-color-green-6)"
                        />
                        <Stack align="center" gap="xs">
                          <Text fw={600} size="lg">
                            Not following anyone yet
                          </Text>
                          <Text c="dimmed" ta="center" size="sm">
                            Start following people to see their posts in your
                            feed!
                          </Text>
                        </Stack>
                      </Stack>
                        </Box>
                  )}
                </Tabs.Panel>

                {/* Followers Tab */}
                <Tabs.Panel value="followers" pt="md">
                  {followersLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : followersData && followersData.followers.length > 0 ? (
                      <Stack gap="md">
                      {followersData.followers.map((user: User) => (
                        <UserCard
                          key={user.id}
                          userId={user.id}
                          onFollow={handleFollowUser}
                          onViewProfile={handleViewProfile}
                          isFollowing={false}
                          followLoading={followLoading}
                        />
                      ))}
                    </Stack>
                  ) : (
                        <Box
                          p="xl"
                          style={{
                        border: "none",
                      }}
                    >
                      <Stack align="center" gap="md">
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
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>


          <Tabs.Panel value="hashtags" pt="md">
            <Stack gap="md">
              {mockTrendingHashtags.map((hashtag, index) => (
                <Box key={hashtag.name} p="md">
                  <Group justify="space-between" align="center">
                    <Group>
                      <Badge size="lg" variant="light" color="blue">
                        #{hashtag.name}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {hashtag.postsCount >= 1000000
                          ? `${(hashtag.postsCount / 1000000).toFixed(1)}M`
                          : hashtag.postsCount >= 1000
                            ? `${(hashtag.postsCount / 1000).toFixed(1)}K`
                            : hashtag.postsCount}{" "}
                        posts
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" fw={500}>
                      #{index + 1}
                    </Text>
                  </Group>
                </Box>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}
