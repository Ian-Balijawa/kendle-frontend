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
} from "@mantine/core";
import {
    IconPhoto,
    IconPlayerPlay,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
// Custom masonry implementation will be added here
import { useUserMediaByUserId } from "../../hooks/useMedia";
import { UserMediaItem } from "../../types/post";
import { getImageUrl, getVideoUrl } from "../../lib/stream-urls";

interface UserMediaGalleryProps {
    userId: string;
    type?: "image" | "video";
    limit?: number;
}

interface MediaItemProps {
    media: UserMediaItem;
    onClick: () => void;
}

function MediaItem({ media, onClick }: MediaItemProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isVideo = media.type === "video" || media.mediaType === "video";
    const imageUrl = getImageUrl(media.url?.split('/').pop() || '') || media.streamingUrl;

    return (
        <Card
            p={0}
            radius="md"
            style={{
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
                width: "100%",
                background: "var(--mantine-color-dark-8)",
                transition: "transform 100ms ease-in-out, box-shadow 100ms ease-in-out",
                minHeight: 200,
            }}
            onClick={onClick}
            className="media-card"
        >
            {isVideo ? (
                <Box
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        minHeight: 200,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ActionIcon
                        size="xl"
                        radius="xl"
                        variant="filled"
                        color="white"
                        style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            transition: "transform 100ms ease-in-out",
                        }}
                    >
                        <IconPlayerPlay size={24} />
                    </ActionIcon>
                    {media.thumbnailUrl && (
                        <Image
                            src={media.thumbnailUrl}
                            alt="Video thumbnail"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                zIndex: 1,
                            }}
                        />
                    )}
                </Box>
            ) : (
                <Box style={{ position: "relative", width: "100%", height: "100%", minHeight: 200 }}>
                    {!imageLoaded && !imageError && (
                        <Center
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "var(--mantine-color-gray-1)",
                                zIndex: 2,
                            }}
                        >
                            <Loader size="sm" />
                        </Center>
                    )}
                    <Image
                        src={imageUrl}
                        alt="Media"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: imageLoaded ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                    {imageError && (
                        <Center
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "var(--mantine-color-gray-1)",
                                zIndex: 2,
                            }}
                        >
                            <Stack align="center" gap="xs">
                                <IconPhoto size={32} color="var(--mantine-color-gray-5)" />
                                <Text size="sm" c="dimmed">
                                    Failed to load
                                </Text>
                            </Stack>
                        </Center>
                    )}
                </Box>
            )}

            {/* Hover overlay */}
            <Box
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.3)",
                    opacity: 0,
                    transition: "opacity 100ms ease-in-out",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 3,
                }}
                className="hover-overlay"
            >
                {isVideo ? (
                    <ActionIcon
                        size="xl"
                        radius="xl"
                        variant="filled"
                        color="white"
                        style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            color: "var(--mantine-color-dark-8)",
                        }}
                    >
                        <IconPlayerPlay size={24} />
                    </ActionIcon>
                ) : (
                    <ActionIcon
                        size="xl"
                        radius="xl"
                        variant="filled"
                        color="white"
                        style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            color: "var(--mantine-color-dark-8)",
                        }}
                    >
                        <IconPhoto size={24} />
                    </ActionIcon>
                )}
            </Box>
        </Card>
    );
}

interface MediaModalProps {
    media: UserMediaItem | null;
    allMedia: UserMediaItem[];
    opened: boolean;
    onClose: () => void;
}

function MediaModal({ media, allMedia, opened, onClose }: MediaModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Update current index when media changes
    useEffect(() => {
        if (media && allMedia.length > 0) {
            const index = allMedia.findIndex(item => item.id === media.id);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
    }, [media, allMedia]);

    if (!media || allMedia.length === 0) return null;

    const currentMedia = allMedia[currentIndex];
    const isVideo = currentMedia.type === "video" || currentMedia.mediaType === "video";

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowLeft") {
            handlePrevious();
        } else if (event.key === "ArrowRight") {
            handleNext();
        } else if (event.key === "Escape") {
            onClose();
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
            centered
            padding={0}
            radius="md"
            withCloseButton={false}
            onKeyDown={handleKeyDown}
        >
            <Box
                style={{
                    position: "relative",
                    background: "black",
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {/* Navigation Arrows */}
                {allMedia.length > 1 && (
                    <>
                        <ActionIcon
                            size="xl"
                            radius="xl"
                            variant="filled"
                            color="white"
                            style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 10,
                                background: "rgba(0, 0, 0, 0.5)",
                                backdropFilter: "blur(10px)",
                                opacity: 0.8,
                                transition: "opacity 0.2s ease",
                            }}
                            onClick={handlePrevious}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
                        >
                            <IconChevronLeft size={24} />
                        </ActionIcon>

                        <ActionIcon
                            size="xl"
                            radius="xl"
                            variant="filled"
                            color="white"
                            style={{
                                position: "absolute",
                                right: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 10,
                                background: "rgba(0, 0, 0, 0.5)",
                                backdropFilter: "blur(10px)",
                                opacity: 0.8,
                                transition: "opacity 0.2s ease",
                            }}
                            onClick={handleNext}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
                        >
                            <IconChevronRight size={24} />
                        </ActionIcon>
                    </>
                )}

                {/* Media Counter */}
                {allMedia.length > 1 && (
                    <Box
                        style={{
                            position: "absolute",
                            top: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 10,
                            background: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(10px)",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: 500,
                        }}
                    >
                        {currentIndex + 1} / {allMedia.length}
                    </Box>
                )}

                {/* Media Content */}
                <Box
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    {isVideo ? (
                        <video
                            style={{
                                maxWidth: "100%",
                                maxHeight: "70vh",
                                objectFit: "contain",
                            }}
                            autoPlay
                        >
                            <source src={getVideoUrl(currentMedia.url?.split("/").pop() || '') || currentMedia.streamingUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <Image
                            src={getImageUrl(currentMedia.url?.split("/").pop() || '') || currentMedia.streamingUrl}
                            alt="Media"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "70vh",
                                objectFit: "contain",
                            }}
                        />
                    )}
                </Box>
            </Box>
        </Modal>
    );
}

export function UserMediaGallery({ userId, type, limit = 20 }: UserMediaGalleryProps) {
    const [selectedMedia, setSelectedMedia] = useState<UserMediaItem | null>(null);
    const [modalOpened, setModalOpened] = useState(false);

    const {
        data,
        isLoading,
        isError,
        isFetchingNextPage,
    } = useUserMediaByUserId(userId, { type, limit });

    const allMedia = data?.pages.flatMap((page) => page.media) || [];

    const handleMediaClick = (media: UserMediaItem) => {
        setSelectedMedia(media);
        setModalOpened(true);
    };

    const handleCloseModal = () => {
        setModalOpened(false);
        setSelectedMedia(null);
    };

    // Handle infinite scroll - will be implemented in custom masonry
    // const maybeLoadMore = (_startIndex: number, stopIndex: number, items: UserMediaItem[]) => {
    //     if (hasNextPage && stopIndex >= items.length - 1) {
    //         fetchNextPage();
    //     }
    // };

    if (isLoading) {
        return (
            <Center py={60}>
                <Stack align="center" gap="sm">
                    <Loader size="lg" />
                    <Text size="sm" c="dimmed" fw={500}>
                        Loading media...
                    </Text>
                </Stack>
            </Center>
        );
    }

    if (isError) {
        return (
            <Center py={60}>
                <Stack align="center" gap="sm">
                    <Box
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: "var(--mantine-color-red-1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconPhoto size={32} color="var(--mantine-color-red-6)" />
                    </Box>
                    <Stack align="center" gap="xs">
                        <Text fw={600} size="lg">
                            Failed to load media
                        </Text>
                        <Text c="dimmed" ta="center" size="sm">
                            There was an error loading this user's media. Please try again.
                        </Text>
                    </Stack>
                </Stack>
            </Center>
        );
    }

    if (allMedia.length === 0) {
        return (
            <Center py={60}>
                <Stack align="center" gap="sm">
                    <Box
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: "var(--mantine-color-blue-1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconPhoto size={32} color="var(--mantine-color-blue-6)" />
                    </Box>
                    <Stack align="center" gap="xs">
                        <Text fw={600} size="lg">
                            No media yet
                        </Text>
                        <Text c="dimmed" ta="center" size="sm">
                            {type === "video"
                                ? "This user hasn't posted any videos yet."
                                : type === "image"
                                    ? "This user hasn't posted any images yet."
                                    : "This user hasn't posted any media yet."}
                        </Text>
                    </Stack>
                </Stack>
            </Center>
        );
    }

    return (
        <>
            <style>{`
                .media-card:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                }
                
                .media-card:hover .hover-overlay {
                    opacity: 1;
                }
                
                .masonic-container {
                    padding: 8px;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                
                @media (max-width: 768px) {
                    .masonic-container {
                        padding: 4px;
                    }
                }
            `}</style>

            <Box
                className="masonic-container"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "8px",
                    padding: "8px",
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                {allMedia.map((media) => (
                    <Box
                        key={media.id}
                        onClick={() => handleMediaClick(media)}
                        style={{ minHeight: "200px" }}
                    >
                        <MediaItem media={media} onClick={() => handleMediaClick(media)} />
                    </Box>
                ))}

                {isFetchingNextPage && (
                    <Box mt="xl">
                        <Center>
                            <Stack align="center" gap="sm">
                                <Loader size="md" />
                                <Text size="sm" c="dimmed">
                                    Loading more media...
                                </Text>
                            </Stack>
                        </Center>
                    </Box>
                )}
            </Box>

            <MediaModal
                media={selectedMedia}
                allMedia={allMedia}
                opened={modalOpened}
                onClose={handleCloseModal}
            />
        </>
    );
}
