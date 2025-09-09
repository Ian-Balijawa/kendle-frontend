import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { usePostEngagement } from "../../hooks/usePosts";
import { PostEngagementButton } from "../ui";

interface PostEngagementExampleProps {
  postId: string;
}

/**
 * Example component demonstrating how to use the new post engagement features
 *
 * This component shows:
 * 1. How to fetch and display current user's engagement status
 * 2. How to use the PostEngagementButton to show engagement details
 * 3. How to integrate engagement data into your post components
 */
export function PostEngagementExample({ postId }: PostEngagementExampleProps) {
  const { data: engagement, isLoading, error } = usePostEngagement(postId);

  if (isLoading) {
    return <Text>Loading engagement data...</Text>;
  }

  if (error) {
    return <Text color="red">Error loading engagement data</Text>;
  }

  return (
    <Card withBorder p="sm">
      <Stack gap="sm">
        <Title order={4}>Post Engagement Example</Title>

        {/* Current User's Engagement Status */}
        {engagement && (
          <Card
            withBorder
            p="sm"
            style={{ backgroundColor: "var(--mantine-color-gray-0)" }}
          >
            <Text size="sm" fw={600} mb="xs">
              Your Engagement Status:
            </Text>
            <Group gap="sm">
              <Text size="sm" color={engagement.hasLiked ? "blue" : "dimmed"}>
                {engagement.hasLiked ? "✓ Liked" : "○ Not liked"}
              </Text>
              <Text
                size="sm"
                color={engagement.hasDisliked ? "orange" : "dimmed"}
              >
                {engagement.hasDisliked ? "✓ Disliked" : "○ Not disliked"}
              </Text>
              <Text
                size="sm"
                color={engagement.hasBookmarked ? "green" : "dimmed"}
              >
                {engagement.hasBookmarked ? "✓ Bookmarked" : "○ Not bookmarked"}
              </Text>
              <Text size="sm" color={engagement.hasViewed ? "cyan" : "dimmed"}>
                {engagement.hasViewed ? "✓ Viewed" : "○ Not viewed"}
              </Text>
            </Group>
            {engagement.reactionType && (
              <Text size="xs" color="dimmed" mt="xs">
                Reaction: {engagement.reactionType}
              </Text>
            )}
            {engagement.bookmarkNote && (
              <Text size="xs" color="dimmed" mt="xs">
                Bookmark note: {engagement.bookmarkNote}
              </Text>
            )}
            {engagement.lastViewedAt && (
              <Text size="xs" color="dimmed" mt="xs">
                Last viewed:{" "}
                {new Date(engagement.lastViewedAt).toLocaleString()}
              </Text>
            )}
          </Card>
        )}

        {/* Engagement Button - This would typically be added to your PostCard component */}
        <div>
          <Text size="sm" fw={600} mb="xs">
            Engagement Button (click to see details):
          </Text>
          <PostEngagementButton
            postId={postId}
            likesCount={0} // These would come from your post data
            dislikesCount={0}
            bookmarksCount={0}
            viewsCount={0}
          />
        </div>

        {/* Usage Instructions */}
        <Card
          withBorder
          p="sm"
          style={{ backgroundColor: "var(--mantine-color-blue-0)" }}
        >
          <Text size="sm" fw={600} mb="xs">
            How to integrate into your PostCard:
          </Text>
          <Text size="xs" color="dimmed">
            1. Import the PostEngagementButton from your UI components
            <br />
            2. Add it to your action buttons section
            <br />
            3. Pass the post ID and engagement counts
            <br />
            4. The modal will automatically handle fetching and displaying
            engagement data
          </Text>
        </Card>
      </Stack>
    </Card>
  );
}
