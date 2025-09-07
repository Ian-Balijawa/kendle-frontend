import { Card, Stack, Text, Title } from "@mantine/core";
import { PostEngagementButton, PostEngagementModal } from "../ui";
import { usePostEngagement } from "../../hooks/usePosts";

interface PostEngagementIntegrationExampleProps {
  postId: string;
}

/**
 * Example component showing how to integrate post engagement features
 * into your own components
 */
export function PostEngagementIntegrationExample({
  postId,
}: PostEngagementIntegrationExampleProps) {
  const { data: engagement, isLoading, error } = usePostEngagement(postId);

  if (isLoading) {
    return <Text>Loading engagement data...</Text>;
  }

  if (error) {
    return <Text color="red">Error loading engagement data</Text>;
  }

  return (
    <Card withBorder p="md">
      <Stack gap="md">
        <Title order={4}>Post Engagement Integration Example</Title>

        <Text size="sm" c="dimmed">
          This example shows how to integrate the new post engagement features
          into your components.
        </Text>

        {/* Method 1: Using the PostEngagementButton component */}
        <div>
          <Text size="sm" fw={600} mb="xs">
            Method 1: PostEngagementButton Component
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            A ready-to-use button that shows engagement counts and opens the
            modal
          </Text>
          <PostEngagementButton
            postId={postId}
            likesCount={engagement?.hasLiked ? 1 : 0}
            dislikesCount={engagement?.hasDisliked ? 1 : 0}
            bookmarksCount={engagement?.hasBookmarked ? 1 : 0}
            viewsCount={engagement?.hasViewed ? 1 : 0}
          />
        </div>

        {/* Method 2: Using the hooks directly */}
        <div>
          <Text size="sm" fw={600} mb="xs">
            Method 2: Using Hooks Directly
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Access engagement data directly using the usePostEngagement hook
          </Text>
          {engagement && (
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "var(--mantine-color-gray-0)",
                borderRadius: "var(--mantine-radius-md)",
              }}
            >
              <Text size="xs">
                <strong>Your Engagement Status:</strong>
                <br />• Liked: {engagement.hasLiked ? "Yes" : "No"}
                <br />• Disliked: {engagement.hasDisliked ? "Yes" : "No"}
                <br />• Bookmarked: {engagement.hasBookmarked ? "Yes" : "No"}
                <br />• Viewed: {engagement.hasViewed ? "Yes" : "No"}
                <br />
                {engagement.reactionType &&
                  `• Reaction Type: ${engagement.reactionType}`}
                <br />
                {engagement.bookmarkNote &&
                  `• Bookmark Note: ${engagement.bookmarkNote}`}
                <br />
                {engagement.lastViewedAt &&
                  `• Last Viewed: ${new Date(engagement.lastViewedAt).toLocaleString()}`}
              </Text>
            </div>
          )}
        </div>

        {/* Method 3: Using the modal directly */}
        <div>
          <Text size="sm" fw={600} mb="xs">
            Method 3: PostEngagementModal Component
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Use the modal component directly for custom implementations
          </Text>
          <PostEngagementModal
            opened={false} // You would control this with state
            onClose={() => {}} // You would implement this
            postId={postId}
          />
        </div>

        <Text size="xs" c="dimmed" mt="md">
          💡 <strong>Tip:</strong> The PostEngagementButton is the easiest way
          to add engagement features to your posts. It handles all the state
          management and provides a consistent UI.
        </Text>
      </Stack>
    </Card>
  );
}
