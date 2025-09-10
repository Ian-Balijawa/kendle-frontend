import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHash,
  IconSearch,
  IconTrendingUp,
  IconUsers,
  IconUserCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSwipe } from "../../components/ui";
import { VerticalUserCard } from "../../components/ui/VerticalUserCard";
import {
  useFollowers,
  useFollowing,
  useSuggestedUsers,
  useToggleFollow,
} from "../../hooks/useFollow";
import { useInfinitePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUser";
import { User } from "../../types/auth";
import { PostCard } from "../posts/PostCard";

const mockTrendingHashtags = [
  { name: "Kendle", postsCount: 15420 },
  { name: "SocialMedia", postsCount: 8920 },
  { name: "Innovation", postsCount: 6540 },
  { name: "Tech", postsCount: 5430 },
  { name: "Design", postsCount: 4320 },
];

interface CompactUserListProps {
  users: User[];
  onFollow: (userId: string, isFollowing: boolean) => void;
  onViewProfile: (userId: string) => void;
  followLoading: boolean;
  title?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

function CompactUserList({
  users,
  onFollow,
  onViewProfile,
  followLoading,
  title,
  emptyMessage,
  emptyIcon,
}: CompactUserListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollAreaRef.current) return;

    const scrollAmount = 176; // Card width (160px) + gap (16px)
    const currentScroll = scrollAreaRef.current.scrollLeft;
    const maxScroll =
      scrollAreaRef.current.scrollWidth - scrollAreaRef.current.clientWidth;

    if (direction === "left") {
      scrollAreaRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: "smooth",
      });
    } else {
      scrollAreaRef.current.scrollTo({
        left: Math.min(maxScroll, currentScroll + scrollAmount),
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (!users.length) {
    return (
      <Box
        p="sm"
        style={{
          border: "none",
        }}
      >
        <Stack align="center" gap="sm">
          {emptyIcon}
          <Stack align="center" gap="xs">
            <Text fw={600} size="lg">
              {emptyMessage || "No users found"}
            </Text>
            <Text c="dimmed" ta="center" size="sm">
              {title
                ? `No ${title.toLowerCase()} to display`
                : "Check back later for updates!"}
            </Text>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ position: "relative" }}>
      {canScrollLeft && (
        <ActionIcon
          variant="filled"
          color="white"
          size="lg"
          radius="xl"
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--mantine-color-gray-3)",
          }}
          onClick={() => scroll("left")}
        >
          <IconChevronLeft size={16} color="var(--mantine-color-gray-7)" />
        </ActionIcon>
      )}

      {canScrollRight && (
        <ActionIcon
          variant="filled"
          color="white"
          size="lg"
          radius="xl"
          style={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--mantine-color-gray-3)",
          }}
          onClick={() => scroll("right")}
        >
          <IconChevronRight size={16} color="var(--mantine-color-gray-7)" />
        </ActionIcon>
      )}

      <ScrollArea
        ref={scrollAreaRef}
        onScrollPositionChange={handleScroll}
        scrollbarSize={0}
        type="scroll"
        style={{
          paddingRight: "16px",
        }}
      >
        <Group gap="sm" style={{ paddingBottom: "8px" }}>
          {users.map((user) => (
            <VerticalUserCard
              key={user.id}
              user={user}
              onFollow={onFollow}
              onViewProfile={onViewProfile}
              followLoading={followLoading}
              showActions={true}
            />
          ))}
        </Group>
      </ScrollArea>
    </Box>
  );
}

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [peopleTab, setPeopleTab] = useState("suggestions");
  const navigate = useNavigate();

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

  console.log(followingData);
  console.log(followersData);

  const { toggleFollow, isLoading: followLoading } = useToggleFollow();

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
            <Tabs.Tab value="hashtags" leftSection={<IconHash size={16} />}>
              Hashtags
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

          <Tabs.Panel value="people" pt="md">
            <Stack gap="sm">
              <Tabs
                value={peopleTab}
                onChange={(value) => setPeopleTab(value || "suggestions")}
                variant="pills"
              >
                <Tabs.List
                  style={{
                    borderRadius: "16px",
                  }}
                >
                  <Tabs.Tab
                    size="sm"
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
                    size="sm"
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
                    size="sm"
                    leftSection={<IconUserPlus size={16} />}
                    style={{
                      borderRadius: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Followers
                  </Tabs.Tab>
                </Tabs.List>

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
                    />
                  ) : (
                    <Box
                          p="sm"
                      style={{
                        border: "none",
                      }}
                    >
                          <Stack align="center" gap="sm">
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

                <Tabs.Panel value="following" pt="md">
                  {followingLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : followingData && followingData.following.length > 0 ? (
                    <CompactUserList
                      users={followingData.following}
                      onFollow={handleFollowUser}
                      onViewProfile={handleViewProfile}
                      followLoading={followLoading}
                      title="Following"
                    />
                  ) : (
                    <Box
                          p="sm"
                      style={{
                        border: "none",
                      }}
                    >
                          <Stack align="center" gap="sm">
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

                <Tabs.Panel value="followers" pt="md">
                  {followersLoading ? (
                    <Group justify="center" py="xl">
                      <Loader size="lg" />
                    </Group>
                  ) : followersData && followersData.followers.length > 0 ? (
                    <CompactUserList
                      users={followersData.followers}
                      onFollow={handleFollowUser}
                      onViewProfile={handleViewProfile}
                      followLoading={followLoading}
                      title="Followers"
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
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="hashtags" pt="md">
            <Stack gap="sm">
              {mockTrendingHashtags.map((hashtag, index) => (
                <Box key={hashtag.name} p="sm">
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
