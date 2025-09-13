import { Box, Container, Title, Text, Stack } from "@mantine/core";
import InstagramVideoRenderer from "../ui/InstagramVideoRenderer";

interface InstagramVideoExampleProps {
  videoUrl?: string;
  username?: string;
  profilePicture?: string;
  caption?: string;
}

export function InstagramVideoExample({
  videoUrl = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  username = "test_user",
  profilePicture = "/user.png",
  caption = "This is a test video to demonstrate the Instagram-style video renderer functionality. Click to play/pause and interact with the video controls!",
}: InstagramVideoExampleProps) {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={2} mb="sm">
            Instagram Video Renderer Example
          </Title>
          <Text c="dimmed" mb="lg">
            This example demonstrates the custom Instagram-style video renderer
            component. Features include play/pause controls, mute/unmute,
            caption expansion, and smooth animations.
          </Text>
        </Box>

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Text size="sm" fw={600} mb="sm" ta="center">
              Portrait Video
            </Text>
            <InstagramVideoRenderer
              videoUrl={videoUrl}
              user={{
                username,
                profilePicture,
                isVerified: true,
              }}
              caption={caption}
              autoPlay={false}
              muted={true}
              showUserInfo={true}
              showFollowButton={true}
              onVideoClick={() => console.log("Portrait video clicked!")}
              aspectRatio="portrait"
              maxWidth="300px"
            />
          </Box>

          <Box>
            <Text size="sm" fw={600} mb="sm" ta="center">
              Landscape Video
            </Text>
            <InstagramVideoRenderer
              videoUrl={videoUrl}
              user={{
                username,
                profilePicture,
                isVerified: true,
              }}
              caption={caption}
              autoPlay={false}
              muted={true}
              showUserInfo={true}
              showFollowButton={true}
              onVideoClick={() => console.log("Landscape video clicked!")}
              aspectRatio="landscape"
              maxWidth="400px"
            />
          </Box>

          <Box>
            <Text size="sm" fw={600} mb="sm" ta="center">
              Square Video
            </Text>
            <InstagramVideoRenderer
              videoUrl={videoUrl}
              user={{
                username,
                profilePicture,
                isVerified: true,
              }}
              caption={caption}
              autoPlay={false}
              muted={true}
              showUserInfo={true}
              showFollowButton={true}
              onVideoClick={() => console.log("Square video clicked!")}
              aspectRatio="square"
              maxWidth="300px"
            />
          </Box>
        </Box>

        <Box>
          <Title order={3} mb="md">
            Features
          </Title>
          <Stack gap="sm">
            <Text size="sm">• Click to play/pause video</Text>
            <Text size="sm">• Mute/unmute controls</Text>
            <Text size="sm">• Expandable captions</Text>
            <Text size="sm">• Instagram-style UI design</Text>
            <Text size="sm">• Responsive layout</Text>
            <Text size="sm">• Smooth hover animations</Text>
            <Text size="sm">• User profile integration</Text>
            <Text size="sm">
              • Support for portrait, landscape, and square videos
            </Text>
            <Text size="sm">• Auto-detect video aspect ratio</Text>
            <Text size="sm">• Customizable dimensions</Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
