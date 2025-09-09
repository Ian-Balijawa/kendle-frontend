import { Box, Card, Group, Skeleton, Stack } from "@mantine/core";

export function PostDetailSkeleton() {
  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Skeleton height={32} width={32} />
        <Skeleton height={20} width={60} />
        <Box />
      </Group>

      {/* Post Content */}
      <Card withBorder p="sm" radius="md" mb="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Group>
              <Skeleton height={48} width={48} radius="xl" />
              <Box>
                <Group gap="xs" align="center" mb={4}>
                  <Skeleton height={18} width={140} />
                  <Skeleton height={14} width={60} />
                </Group>
                <Skeleton height={14} width={120} />
              </Box>
            </Group>
            <Skeleton height={24} width={24} />
          </Group>

          <Stack gap="xs">
            <Skeleton height={16} width="100%" />
            <Skeleton height={16} width="90%" />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="60%" />
          </Stack>

          <Skeleton height={300} width="100%" radius="md" />

          <Group gap="xs">
            <Skeleton height={12} width={40} />
            <Skeleton height={12} width={40} />
            <Skeleton height={12} width={40} />
          </Group>

          {/* Actions */}
          <Group justify="space-between" pt="md">
            <Group gap="sm">
              <Group gap={4}>
                <Skeleton height={24} width={24} />
                <Skeleton height={18} width={30} />
                <Skeleton height={24} width={24} />
              </Group>
              <Group gap="xs">
                <Skeleton height={24} width={24} />
                <Skeleton height={18} width={20} />
              </Group>
              <Group gap="xs">
                <Skeleton height={24} width={24} />
                <Skeleton height={18} width={20} />
              </Group>
              <Group gap="xs">
                <Skeleton height={24} width={24} />
                <Skeleton height={18} width={20} />
              </Group>
            </Group>
            <Skeleton height={24} width={24} />
          </Group>
        </Stack>
      </Card>

      {/* Comment Input */}
      <Card withBorder p="sm" radius="md" mb="md">
        <Skeleton height={36} width="100%" radius="sm" />
      </Card>

      {/* Comments */}
      <Stack gap="sm">
        <CommentSkeletonList count={3} />
      </Stack>
    </Box>
  );
}

// Import CommentSkeletonList here to avoid circular dependency
import { CommentSkeletonList } from "./CommentSkeleton";
