import { ActionIcon, Box } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { StatusCollection } from "../../types";
import { VerticalStatusCard } from "./VerticalStatusCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/a11y";

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
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlidePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSlideNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    direction: "prev" | "next",
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (direction === "prev") {
        handleSlidePrev();
      } else {
        handleSlideNext();
      }
    }
  };

  return (
    <Box style={{ position: "relative" }}>
      <Box
        style={{
          position: "relative",
          width: "100%",
          overflow: "visible",
        }}
      >
        {!isBeginning && (
          <ActionIcon
            variant="filled"
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onClick={handleSlidePrev}
            onKeyDown={(e) => handleKeyDown(e, "prev")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.95)";
            }}
            aria-label="Previous statuses"
            role="button"
            tabIndex={0}
          >
            <IconChevronLeft size={18} color="#475569" />
          </ActionIcon>
        )}

        {!isEnd && (
          <ActionIcon
            variant="filled"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onClick={handleSlideNext}
            onKeyDown={(e) => handleKeyDown(e, "next")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.95)";
            }}
            aria-label="Next statuses"
            role="button"
            tabIndex={0}
          >
            <IconChevronRight size={18} color="#475569" />
          </ActionIcon>
        )}

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={handleSlideChange}
          modules={[Navigation, FreeMode, A11y]}
          spaceBetween={8}
          slidesPerView="auto"
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumBounce: false,
          }}
          grabCursor={true}
          centeredSlides={false}
          centeredSlidesBounds={false}
          watchSlidesProgress={true}
          watchOverflow={true}
          resistance={true}
          resistanceRatio={0.85}
          a11y={{
            enabled: true,
            prevSlideMessage: "Previous status",
            nextSlideMessage: "Next status",
            firstSlideMessage: "This is the first status",
            lastSlideMessage: "This is the last status",
          }}
          style={{
            paddingLeft: "0px",
            paddingRight: "0px",
            paddingBottom: "8px",
            overflow: "hidden",
            width: "100%",
            margin: 0,
          }}
          role="region"
          aria-label="Status stories carousel"
        >
          <SwiperSlide
            style={{
              width: "120px",
              height: "auto",
              flexShrink: 0,
            }}
            role="group"
            aria-roledescription="slide"
            aria-label="Create new status"
          >
            <VerticalStatusCard
              isCreateCard={true}
              currentUserAvatar={currentUserAvatar}
              onClick={onCreateStatus}
            />
          </SwiperSlide>

          {collections.map((collection, index) => (
            <SwiperSlide
              key={collection.author.id}
              style={{
                width: "120px",
                height: "auto",
                flexShrink: 0,
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Status story ${index + 1} of ${collections.length}`}
            >
              <VerticalStatusCard
                collection={collection}
                onClick={() => onStatusClick?.(collection)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}
