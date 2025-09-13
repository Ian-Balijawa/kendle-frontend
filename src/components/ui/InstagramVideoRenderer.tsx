import React, { useState, useRef, useEffect } from "react";
import { Box, Text, Avatar, Button, ActionIcon } from "@mantine/core";
import { IconPlayerPlay, IconVolume, IconVolumeOff } from "@tabler/icons-react";
import "./InstagramVideoRenderer.css";

interface UserInfo {
  username: string;
  profilePicture: string;
  isVerified?: boolean;
}

interface VideoRendererProps {
  videoUrl: string;
  user: UserInfo;
  caption: string;
  autoPlay?: boolean;
  muted?: boolean;
  onVideoClick?: () => void;
  showUserInfo?: boolean;
  showFollowButton?: boolean;
  aspectRatio?: "portrait" | "landscape" | "square" | "auto";
  maxWidth?: string | number;
  maxHeight?: string | number;
}

const InstagramVideoRenderer: React.FC<VideoRendererProps> = ({
  videoUrl,
  user,
  caption,
  autoPlay = false,
  muted = true,
  onVideoClick,
  showUserInfo = true,
  showFollowButton = false,
  aspectRatio = "auto",
  maxWidth = "100%",
  maxHeight = "100%",
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showCaption, setShowCaption] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (onVideoClick) {
      onVideoClick();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const toggleCaption = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCaption(!showCaption);
  };

  const getAspectRatioClass = () => {
    if (aspectRatio === "auto" && videoDimensions) {
      const ratio = videoDimensions.width / videoDimensions.height;
      if (ratio > 1.2) return "landscape";
      if (ratio < 0.8) return "portrait";
      return "square";
    }
    return aspectRatio;
  };

  const getContainerStyle = () => {
    const aspectRatioClass = getAspectRatioClass();
    const baseStyle = {
      maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
      maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
    };

    if (aspectRatioClass === "landscape") {
      return {
        ...baseStyle,
        aspectRatio: "16/9",
        maxWidth: "600px",
      };
    } else if (aspectRatioClass === "portrait") {
      return {
        ...baseStyle,
        aspectRatio: "9/16",
        maxWidth: "400px",
      };
    } else if (aspectRatioClass === "square") {
      return {
        ...baseStyle,
        aspectRatio: "1/1",
        maxWidth: "400px",
      };
    }

    return baseStyle;
  };

  return (
    <Box
      className={`video-container ${getAspectRatioClass()}`}
      style={getContainerStyle()}
    >
      <Box className="video-wrapper">
        <video
          ref={videoRef}
          className="video-element"
          src={videoUrl}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          onLoadedData={() => {
            if (videoRef.current) {
              setVideoDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight,
              });
            }
          }}
          onError={(e) => {
            console.error("Video failed to load:", e);
          }}
        />

        {/* Background blur overlay */}
        <Box className="background-blur" />

        {/* Play button overlay */}
        {!isPlaying && (
          <Box className="play-button-overlay" onClick={togglePlay}>
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="white"
              className="play-button"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                color: "white",
                width: 64,
                height: 64,
              }}
            >
              <IconPlayerPlay size={24} />
            </ActionIcon>
          </Box>
        )}

        {/* Mute indicator */}
        {!isMuted && (
          <Box className="audio-indicator">
            <IconVolume size={16} />
          </Box>
        )}

        {/* Video controls on click */}
        <Box className="video-controls" onClick={togglePlay} />
      </Box>

      {/* Content overlay */}
      <Box className="content-overlay">
        {/* User info section */}
        {showUserInfo && (
          <Box className="user-info-section">
            <Box className="user-profile">
              <Avatar
                src={user.profilePicture}
                alt={`${user.username}'s profile`}
                size="sm"
                radius="xl"
                className="profile-picture"
              />
              <Text className="username" size="sm" fw={600}>
                {user.username}
              </Text>
              {user.isVerified && (
                <Text className="separator" size="sm" c="dimmed">
                  ✓
                </Text>
              )}
              {showFollowButton && (
                <>
                  <Text className="separator" size="sm" c="dimmed">
                    •
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    className="follow-button"
                    style={{
                      background: "transparent",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  >
                    Follow
                  </Button>
                </>
              )}
            </Box>

            {/* Mute button */}
            <ActionIcon
              size="sm"
              variant="subtle"
              className="mute-button"
              onClick={toggleMute}
              style={{
                background: "transparent",
                color: "white",
              }}
            >
              {isMuted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
            </ActionIcon>
          </Box>
        )}

        {/* Caption section */}
        {caption && (
          <Box className="caption-section">
            <Box className="caption-text" onClick={toggleCaption}>
              <Text className="caption-preview" size="sm" c="white">
                {showCaption ? caption : `${caption.slice(0, 50)}...`}
                {!showCaption && caption.length > 50 && (
                  <Text
                    component="span"
                    className="more-text"
                    c="dimmed"
                    size="sm"
                  >
                    more
                  </Text>
                )}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InstagramVideoRenderer;
