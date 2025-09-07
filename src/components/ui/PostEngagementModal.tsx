import {
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconBookmark,
  IconEye,
  IconHeart,
  IconThumbDown,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  usePostBookmarkers,
  usePostDislikers,
  usePostEngagement,
  usePostLikers,
  usePostViewers,
} from "../../hooks/usePosts";
import { User } from "../../types";

interface PostEngagementModalProps {
  postId: string;
  opened: boolean;
  onClose: () => void;
}

export function PostEngagementModal({
  postId,
  opened,
  onClose,
}: PostEngagementModalProps) {
  const [activeTab, setActiveTab] = useState<string | null>("likers");

  // Fetch engagement data
  const { data: engagement } = usePostEngagement(postId);
  const {
    data: likersData,
    fetchNextPage: fetchNextLikers,
    hasNextPage: hasNextLikers,
  } = usePostLikers(postId);
  const {
    data: dislikersData,
    fetchNextPage: fetchNextDislikers,
    hasNextPage: hasNextDislikers,
  } = usePostDislikers(postId);
  const {
    data: bookmarkersData,
    fetchNextPage: fetchNextBookmarkers,
    hasNextPage: hasNextBookmarkers,
  } = usePostBookmarkers(postId);
  const {
    data: viewersData,
    fetchNextPage: fetchNextViewers,
    hasNextPage: hasNextViewers,
  } = usePostViewers(postId);

  // Flatten the paginated data
  const likers = likersData?.pages.flatMap((page) => page.users) || [];
  const dislikers = dislikersData?.pages.flatMap((page) => page.users) || [];
  const bookmarkers =
    bookmarkersData?.pages.flatMap((page) => page.users) || [];
  const viewers = viewersData?.pages.flatMap((page) => page.users) || [];

  const UserList = ({
    users,
    onLoadMore,
    hasMore,
  }: {
    users: User[];
    onLoadMore: () => void;
    hasMore: boolean;
  }) => (
    <Stack gap="sm">
      {users.map((user) => (
        <Group key={user.id} justify="space-between">
          <Group gap="sm">
            <Avatar src={user.avatar} size="sm" radius="xl">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Avatar>
            <div>
              <Text size="sm" fw={500}>
                {user.firstName} {user.lastName}
              </Text>
              <Text size="xs">@{user.username}</Text>
            </div>
          </Group>
          {user.isVerified && (
            <Badge size="xs" color="blue" variant="light">
              Verified
            </Badge>
          )}
        </Group>
      ))}
      {hasMore && (
        <Button variant="light" size="sm" onClick={onLoadMore}>
          Load More
        </Button>
      )}
    </Stack>
  );

  return (
    <Modal opened={opened} onClose={onClose} title="Post Engagement" size="md">
      <Stack gap="md">
        {/* Engagement Summary */}
        {engagement && (
          <Group
            justify="space-between"
            p="md"
            bg="gray.0"
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          >
            <Group gap="lg">
              <Group gap="xs">
                <IconHeart size={16} color="var(--mantine-color-red-6)" />
                <Text size="sm" c={engagement.hasLiked ? "red.6" : "dimmed"}>
                  {engagement.hasLiked ? "Liked" : "Not liked"}
                </Text>
              </Group>
              <Group gap="xs">
                <IconThumbDown
                  size={16}
                  color="var(--mantine-color-orange-6)"
                />
                <Text
                  size="sm"
                  c={engagement.hasDisliked ? "orange.6" : "dimmed"}
                >
                  {engagement.hasDisliked ? "Disliked" : "Not disliked"}
                </Text>
              </Group>
              <Group gap="xs">
                <IconBookmark size={16} color="var(--mantine-color-blue-6)" />
                <Text
                  size="sm"
                  c={engagement.hasBookmarked ? "blue.6" : "dimmed"}
                >
                  {engagement.hasBookmarked ? "Bookmarked" : "Not bookmarked"}
                </Text>
              </Group>
              <Group gap="xs">
                <IconEye size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" c={engagement.hasViewed ? "green.6" : "dimmed"}>
                  {engagement.hasViewed ? "Viewed" : "Not viewed"}
                </Text>
              </Group>
            </Group>
          </Group>
        )}

        {/* Tabs for different engagement types */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab
              value="likers"
              leftSection={
                <IconHeart size={16} color="var(--mantine-color-red-6)" />
              }
            >
              Likers ({likers.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="dislikers"
              leftSection={
                <IconThumbDown
                  size={16}
                  color="var(--mantine-color-orange-6)"
                />
              }
            >
              Dislikers ({dislikers.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="bookmarkers"
              leftSection={
                <IconBookmark size={16} color="var(--mantine-color-blue-6)" />
              }
            >
              Bookmarkers ({bookmarkers.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="viewers"
              leftSection={
                <IconEye size={16} color="var(--mantine-color-green-6)" />
              }
            >
              Viewers ({viewers.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="likers" pt="md">
            <ScrollArea.Autosize mah={400}>
              {likers.length > 0 ? (
                <UserList
                  users={likers}
                  onLoadMore={() => fetchNextLikers()}
                  hasMore={hasNextLikers || false}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No one has liked this post yet
                </Text>
              )}
            </ScrollArea.Autosize>
          </Tabs.Panel>

          <Tabs.Panel value="dislikers" pt="md">
            <ScrollArea.Autosize mah={400}>
              {dislikers.length > 0 ? (
                <UserList
                  users={dislikers}
                  onLoadMore={() => fetchNextDislikers()}
                  hasMore={hasNextDislikers || false}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No one has disliked this post
                </Text>
              )}
            </ScrollArea.Autosize>
          </Tabs.Panel>

          <Tabs.Panel value="bookmarkers" pt="md">
            <ScrollArea.Autosize mah={400}>
              {bookmarkers.length > 0 ? (
                <UserList
                  users={bookmarkers}
                  onLoadMore={() => fetchNextBookmarkers()}
                  hasMore={hasNextBookmarkers || false}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No one has bookmarked this post yet
                </Text>
              )}
            </ScrollArea.Autosize>
          </Tabs.Panel>

          <Tabs.Panel value="viewers" pt="md">
            <ScrollArea.Autosize mah={400}>
              {viewers.length > 0 ? (
                <UserList
                  users={viewers}
                  onLoadMore={() => fetchNextViewers()}
                  hasMore={hasNextViewers || false}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No one has viewed this post yet
                </Text>
              )}
            </ScrollArea.Autosize>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Modal>
  );
}
