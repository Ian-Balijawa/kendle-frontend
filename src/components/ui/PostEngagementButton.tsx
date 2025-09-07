import { Text, UnstyledButton } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import { useState } from "react";
import { PostEngagementModal } from "./PostEngagementModal";

interface PostEngagementButtonProps {
  postId: string;
  likesCount: number;
  dislikesCount: number;
  bookmarksCount: number;
  viewsCount: number;
}

export function PostEngagementButton({
  postId,
  likesCount,
  dislikesCount,
  bookmarksCount,
  viewsCount,
}: PostEngagementButtonProps) {
  const [engagementModalOpened, setEngagementModalOpened] = useState(false);

  const totalEngagement =
    likesCount + dislikesCount + bookmarksCount + viewsCount;

  return (
    <>
      <UnstyledButton
        onClick={() => setEngagementModalOpened(true)}
        data-interactive="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "var(--mantine-radius-md)",
          transition: "all 0.2s ease",
          color: "var(--mantine-color-gray-6)",
          fontWeight: 500,
          backgroundColor: "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <IconChartBar size={16} />
        <Text size="sm" fw={500}>
          Engagement
        </Text>
        <Text size="xs" c="dimmed">
          ({totalEngagement})
        </Text>
      </UnstyledButton>

      <PostEngagementModal
        postId={postId}
        opened={engagementModalOpened}
        onClose={() => setEngagementModalOpened(false)}
      />
    </>
  );
}
