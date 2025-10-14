import {
  Box,
  Card,
  Center,
  Loader,
  Stack,
  Text,
  Image,
  ActionIcon,
  Modal,
  Badge,
} from "@mantine/core";
import {
  IconPhoto,
  IconPlayerPlay,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { useState, useCallback } from "react";
import { useUserMediaByUserId } from "../../hooks/useMedia";
import VideoPlayer from "./VideoPlayer";
import { User } from "../../types";

export interface UserMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  originalUrl: string;
  mediaType: "image" | "video";
}

interface MediaGalleryProps {
  userId: string;
  type?: "image" | "video";
  limit?: number;
  user: User | null;
}

interface MediaItemProps {
  media: UserMediaItem;
  onClick: () => void;
}

function MediaItem({ media, onClick }: MediaItemProps) {
  const isVideo = media.type === "video" || media.mediaType === "video";
  const displayUrl = media.thumbnailUrl || media.url;

  return (
    <Card
      p={0}
      radius="md"
      shadow="sm"
      onClick={onClick}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        breakInside: "avoid",
        marginBottom: "16px",
        position: "relative",
      }}
    >
      <Image
        src={displayUrl}
        alt={isVideo ? "Video thumbnail" : "Image"}
        style={{
          width: "100%",
          display: "block",
        }}
      />

      {isVideo && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActionIcon size="xl" radius="xl" color="white" variant="filled">
            <IconPlayerPlay size={24} />
          </ActionIcon>
        </Box>
      )}

      <Badge
        size="xs"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
        color={isVideo ? "blue" : "green"}
      >
        {isVideo ? "VIDEO" : "IMAGE"}
      </Badge>
    </Card>
  );
}

interface MediaModalProps {
  media: UserMediaItem | null;
  allMedia: UserMediaItem[];
  opened: boolean;
  user: User | null;
  onClose: () => void;
}

function MediaModal({
  media,
  allMedia,
  opened,
  onClose,
  user,
}: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || !opened) return null;

  const currentMedia = allMedia[currentIndex] || media;
  const isVideo =
    currentMedia.type === "video" || currentMedia.mediaType === "video";

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="90vw"
      centered
      withCloseButton={false}
      styles={{
        content: {
          background: "rgba(0, 0, 0, 0.95)",
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Box style={{ position: "relative", minHeight: "70vh" }}>
        <ActionIcon
          size="lg"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
          }}
          onClick={onClose}
        >
          <IconX size={20} />
        </ActionIcon>

        {allMedia.length > 1 && (
          <>
            <ActionIcon
              size="lg"
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
              }}
              onClick={handlePrevious}
            >
              <IconChevronLeft size={20} />
            </ActionIcon>

            <ActionIcon
              size="lg"
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
              }}
              onClick={handleNext}
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          </>
        )}

        <Center style={{ minHeight: "70vh", padding: 20 }}>
          {isVideo ? (
            <VideoPlayer
              videoUrl={currentMedia.url}
              caption={currentMedia.type}
              autoPlay
              user={{
                profilePicture: user?.avatar ?? "",
                username: user?.username ?? "",
                isVerified: user?.isVerified,
              }}
            />
          ) : (
            <Image
              src={currentMedia.url}
              alt="Media"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
        </Center>

        {allMedia.length > 1 && (
          <Text
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "white",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "4px 12px",
              borderRadius: 4,
            }}
            size="sm"
          >
            {currentIndex + 1} of {allMedia.length}
          </Text>
        )}
      </Box>
    </Modal>
  );
}

export function MediaGallery({
  userId,
  type,
  limit = 20,
  user,
}: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<UserMediaItem | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);

  const { data, isLoading, isError } = useUserMediaByUserId(userId, {
    type,
    limit,
  });
  const allMedia = data?.pages.flatMap((page) => page.media) || [];

  const handleMediaClick = useCallback(
    (media: UserMediaItem) => {
      const index = allMedia.findIndex((item) => item.id === media.id);
      setCurrentIndex(index !== -1 ? index : 0);
      setSelectedMedia(media);
      setModalOpened(true);
    },
    [allMedia],
  );

  const [_currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <Center py={60}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading media...</Text>
        </Stack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center py={60}>
        <Stack align="center" gap="md">
          <IconPhoto size={48} color="gray" />
          <Text color="red">Failed to load media</Text>
        </Stack>
      </Center>
    );
  }

  if (allMedia.length === 0) {
    return (
      <Center py={60}>
        <Stack align="center" gap="md">
          <IconPhoto size={48} color="gray" />
          <Text>No media found</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <style>
        {`
          .masonry-container {
            column-count: 1;
            column-gap: 16px;
            padding: 16px;
            width: 100%;
          }

          @media (min-width: 576px) {
            .masonry-container {
              column-count: 2;
            }
          }

          @media (min-width: 768px) {
            .masonry-container {
              column-count: 3;
            }
          }

          @media (min-width: 1024px) {
            .masonry-container {
              column-count: 4;
            }
          }

          @media (min-width: 1280px) {
            .masonry-container {
              column-count: 5;
            }
          }
        `}
      </style>

      <Box className="masonry-container">
        {allMedia.map((media) => (
          <MediaItem
            key={media.id}
            media={media}
            onClick={() => handleMediaClick(media)}
          />
        ))}
      </Box>

      <MediaModal
        media={selectedMedia}
        allMedia={allMedia}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setSelectedMedia(null);
        }}
        user={user}
      />
    </>
  );
}
