import { Box, Card, Group, Skeleton, Stack } from "@mantine/core";

export function PostSkeleton() {
  return (
    <Card withBorder p="md" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <Skeleton height={40} width={40} radius="xl" />
            <Box>
              <Skeleton height={16} width={120} mb={4} />
              <Skeleton height={12} width={80} />
            </Box>
          </Group>
          <Skeleton height={24} width={24} />
        </Group>

        <Stack gap="xs">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="85%" />
          <Skeleton height={16} width="70%" />
        </Stack>

        <Skeleton height={200} width="100%" radius="md" />

        <Group gap="xs">
          <Skeleton height={12} width={40} />
          <Skeleton height={12} width={40} />
          <Skeleton height={12} width={40} />
        </Group>

        <Group justify="space-between">
          <Group gap="lg">
            <Group gap={4}>
              <Skeleton height={24} width={24} />
              <Skeleton height={16} width={20} />
              <Skeleton height={24} width={24} />
            </Group>
            <Group gap="xs">
              <Skeleton height={24} width={24} />
              <Skeleton height={16} width={20} />
            </Group>
            <Group gap="xs">
              <Skeleton height={24} width={24} />
              <Skeleton height={16} width={20} />
            </Group>
            <Group gap="xs">
              <Skeleton height={24} width={24} />
              <Skeleton height={16} width={20} />
            </Group>
          </Group>
          <Skeleton height={24} width={24} />
        </Group>

        <Skeleton height={36} width="100%" radius="sm" />
      </Stack>
    </Card>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </Stack>
  );
}
