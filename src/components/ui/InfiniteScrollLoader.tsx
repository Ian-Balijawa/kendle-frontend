import { Box, Skeleton, Stack } from "@mantine/core";

interface InfiniteScrollLoaderProps {
  count?: number;
  variant?: "posts" | "comments";
}

export function InfiniteScrollLoader({
  count = 2,
  variant = "posts",
}: InfiniteScrollLoaderProps) {
  if (variant === "posts") {
    return (
      <Stack gap="md">
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index}>
            <Stack gap="sm">
              <Box
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Skeleton height={32} width={32} radius="xl" />
                <Box style={{ flex: 1 }}>
                  <Skeleton height={14} width={100} mb={4} />
                  <Skeleton height={12} width={80} />
                </Box>
              </Box>
              <Skeleton height={16} width="90%" />
              <Skeleton height={16} width="70%" />
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  }

  // Comments variant
  return (
    <Stack gap="sm">
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          <Box
            style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
          >
            <Skeleton height={24} width={24} radius="xl" />
            <Box style={{ flex: 1 }}>
              <Skeleton height={12} width={60} mb={4} />
              <Skeleton height={12} width="100%" />
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
