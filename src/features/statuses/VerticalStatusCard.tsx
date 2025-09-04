import { Avatar, Box, Image, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { StatusCollection } from "../../types";

interface VerticalStatusCardProps {
  collection?: StatusCollection;
  isCreateCard?: boolean;
  onClick?: () => void;
  currentUserAvatar?: string;
}

export function VerticalStatusCard({
  collection,
  isCreateCard = false,
  onClick,
  currentUserAvatar,
}: VerticalStatusCardProps) {
  if (isCreateCard) {
    return (
      <Box
        style={{
          position: "relative",
          width: "100px",
          height: "180px",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "pointer",
          background: "linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-violet-6) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
      >
        {/* Background image if user has avatar */}
        {currentUserAvatar && (
          <Image
            src={currentUserAvatar}
            alt="Background"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.3,
            }}
          />
        )}

        {/* Overlay gradient */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)",
          }}
        />

        {/* Content */}
        <Stack
          align="center"
          gap="xs"
          style={{ position: "relative", zIndex: 2 }}
        >
          <Box
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <IconPlus size={20} color="white" />
          </Box>
          <Text
            size="xs"
            fw={600}
            c="white"
            ta="center"
            style={{
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
              lineHeight: 1.2,
            }}
          >
            Create Story
          </Text>
        </Stack>
      </Box>
    );
  }

  if (!collection) return null;

  const latestStatus = collection.statuses[0];
  const hasUnviewed = collection.hasUnviewed;

  return (
    <Box
      style={{
        position: "relative",
        width: "100px",
        height: "180px",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hasUnviewed
          ? "0 4px 12px rgba(34, 139, 230, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.15)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        border: hasUnviewed ? "2px solid var(--mantine-color-blue-6)" : "2px solid transparent",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = hasUnviewed
          ? "0 8px 20px rgba(34, 139, 230, 0.4)"
          : "0 8px 20px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = hasUnviewed
          ? "0 4px 12px rgba(34, 139, 230, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.15)";
      }}
    >
      {/* Background image from latest status */}
      {latestStatus.media.type === "image" ? (
        <Image
          src={latestStatus.media.url}
          alt="Status background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <video
          src={latestStatus.media.url}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          muted
          loop
          playsInline
        />
      )}

      {/* Overlay gradient */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Top avatar */}
      <Box
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          zIndex: 3,
        }}
      >
        <Avatar
          src={collection.author.avatar}
          alt={collection.author.firstName || "User"}
          size={32}
          radius="xl"
          style={{
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {(collection.author.firstName || "U").charAt(0)}
        </Avatar>
      </Box>

      {/* Unviewed indicator */}
      {hasUnviewed && (
        <Box
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-blue-6)",
            border: "2px solid white",
            zIndex: 3,
          }}
        />
      )}

      {/* Bottom username */}
      <Box
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          right: "8px",
          zIndex: 3,
        }}
      >
        <Text
          size="xs"
          fw={600}
          c="white"
          ta="center"
          style={{
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {collection.author.firstName} {collection.author.lastName}
        </Text>
      </Box>

      {/* Video play indicator */}
      {latestStatus.media.type === "video" && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            zIndex: 3,
          }}
        >
          <Box
            style={{
              width: "0",
              height: "0",
              borderLeft: "6px solid white",
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              marginLeft: "2px",
            }}
          />
        </Box>
      )}
    </Box>
  );
}
