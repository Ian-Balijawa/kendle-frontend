import { ActionIcon, Box, Group, ScrollArea } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { StatusCollection } from "../../types";
import { VerticalStatusCard } from "./VerticalStatusCard";

interface StatusStoriesProps {
  collections: StatusCollection[];
  currentUserAvatar?: string;
  onCreateStatus?: () => void;
  onStatusClick?: (collection: StatusCollection) => void;
}

export function StatusStories({
  collections,
  currentUserAvatar,
  onCreateStatus,
  onStatusClick,
}: StatusStoriesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollAreaRef.current) return;

    const scrollAmount = 120; // Width of one card + gap
    const currentScroll = scrollAreaRef.current.scrollLeft;
    const maxScroll =
      scrollAreaRef.current.scrollWidth - scrollAreaRef.current.clientWidth;

    if (direction === "left") {
      scrollAreaRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: "smooth",
      });
    } else {
      scrollAreaRef.current.scrollTo({
        left: Math.min(maxScroll, currentScroll + scrollAmount),
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  return (
    <Box style={{ position: "relative" }}>
      {canScrollLeft && (
        <ActionIcon
          variant="filled"
          color="white"
          size="lg"
          radius="xl"
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e9ecef",
          }}
          onClick={() => scroll("left")}
        >
          <IconChevronLeft size={16} color="#495057" />
        </ActionIcon>
      )}

      {canScrollRight && (
        <ActionIcon
          variant="filled"
          color="white"
          size="lg"
          radius="xl"
          style={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e9ecef",
          }}
          onClick={() => scroll("right")}
        >
          <IconChevronRight size={16} color="#495057" />
        </ActionIcon>
      )}

      <ScrollArea
        ref={scrollAreaRef}
        onScrollPositionChange={handleScroll}
        scrollbarSize={0}
        style={{
          paddingRight: "16px",
        }}
      >
        <Group gap="md" style={{ paddingBottom: "8px" }}>
          <VerticalStatusCard
            isCreateCard={true}
            currentUserAvatar={currentUserAvatar}
            onClick={onCreateStatus}
          />

          {collections.map((collection) => (
            <VerticalStatusCard
              key={collection.author.id}
              collection={collection}
              onClick={() => onStatusClick?.(collection)}
            />
          ))}
        </Group>
      </ScrollArea>
    </Box>
  );
}
