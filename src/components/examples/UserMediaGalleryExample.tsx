import { Box, Container, Title, Text, Stack } from "@mantine/core";
import { UserMediaGallery } from "../ui/UserMediaGallery";

interface UserMediaGalleryExampleProps {
  userId: string;
}

export function UserMediaGalleryExample({
  userId,
}: UserMediaGalleryExampleProps) {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={2} mb="sm">
            User Media Gallery Example
          </Title>
          <Text c="dimmed" mb="lg">
            This example demonstrates how to display another user's media using
            the UserMediaGallery component. The component fetches media from the
            API endpoint: <code>/api/v1/posts/user/{userId}/media</code>
          </Text>
        </Box>

        <Box>
          <Title order={3} mb="md">
            User ID: {userId}
          </Title>
          <UserMediaGallery userId={userId} limit={20} />
        </Box>
      </Stack>
    </Container>
  );
}
