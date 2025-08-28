import { Box, Group, Skeleton, Stack } from "@mantine/core";

export function CommentSkeleton() {
  return (
    <Box
      p="sm"
      style={{
        border: "1px solid var(--mantine-color-gray-2)",
        borderRadius: "var(--mantine-radius-sm)",
        backgroundColor: "var(--mantine-color-gray-0)",
      }}
    >
      <Stack gap="sm">
        <Group gap="sm" align="flex-start">
          <Skeleton height={32} width={32} radius="xl" />
          <Box style={{ flex: 1 }}>
            <Group gap="xs" align="center" mb={4}>
              <Skeleton height={14} width={80} />
              <Skeleton height={12} width={50} />
            </Group>
            <Stack gap="xs">
              <Skeleton height={14} width="100%" />
              <Skeleton height={14} width="85%" />
            </Stack>
            <Skeleton height={12} width={60} mt={8} />
          </Box>
        </Group>

        <Group gap="xs">
          <Skeleton height={20} width={20} />
          <Skeleton height={12} width={20} />
          <Skeleton height={20} width={20} />
          <Skeleton height={12} width={20} />
        </Group>
      </Stack>
    </Box>
  );
}

export function CommentSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </Stack>
  );
}
