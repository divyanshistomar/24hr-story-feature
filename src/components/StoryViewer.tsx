import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Story } from "../types";

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 3000; // 3 seconds in milliseconds

// Memoized Progress Bar Component
const ProgressBar = memo(({ 
  index, 
  currentIndex, 
  isPlaying 
}: { 
  index: number; 
  currentIndex: number; 
  isPlaying: boolean;
}) => (
  <div className="h-0.5 flex-1 mx-0.5">
    <div className="h-full bg-white/30 rounded-full overflow-hidden">
      <div
        className="h-full bg-white"
        style={{
          width: `${
            index < currentIndex
              ? "100%"
              : index === currentIndex
              ? isPlaying
                ? "100%"
                : "0%"
              : "0%"
          }`,
          transition:
            index === currentIndex && isPlaying
              ? `width ${STORY_DURATION}ms linear`
              : "none",
        }}
      />
    </div>
  </div>
));

ProgressBar.displayName = 'ProgressBar';

// Memoized Navigation Button Component
const NavigationButton = memo(({ 
  direction, 
  onClick 
}: { 
  direction: 'left' | 'right'; 
  onClick: () => void;
}) => (
  <button
    className="p-4 text-white/50 hover:text-white transition-colors"
    onClick={onClick}
    aria-label={direction === 'left' ? "Previous story" : "Next story"}
  >
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === 'left' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  </button>
));

NavigationButton.displayName = 'NavigationButton';

const StoryViewer: React.FC<StoryViewerProps> = memo(({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressTimeout = useRef<number>();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Function to mark story as viewed
  const markStoryAsViewed = useCallback((index: number) => {
    const savedStories = localStorage.getItem("stories");
    if (savedStories) {
      const allStories = JSON.parse(savedStories);
      const storyToUpdate = allStories.find((s: Story) => s.id === stories[index].id);
      if (storyToUpdate) {
        storyToUpdate.viewed = true;
        localStorage.setItem("stories", JSON.stringify(allStories));
      }
    }
  }, [stories]);

  // Mark story as viewed when index changes
  useEffect(() => {
    markStoryAsViewed(currentIndex);
  }, [currentIndex, markStoryAsViewed]);

  const startProgress = useCallback(() => {
    if (progressTimeout.current) {
      window.clearTimeout(progressTimeout.current);
    }

    progressTimeout.current = window.setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, STORY_DURATION);
  }, [currentIndex, stories.length, onClose]);

  useEffect(() => {
    if (isPlaying) {
      startProgress();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (progressTimeout.current) {
        window.clearTimeout(progressTimeout.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, isPlaying, stories.length, onClose, startProgress]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsPlaying(false);
    setTouchEnd(null);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPlaying(true);
    if (!touchStart || !touchEnd) return;

    const xDiff = touchStart.x - touchEnd.x;
    const yDiff = touchStart.y - touchEnd.y;

    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
      if (xDiff > 0 && currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (xDiff < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentIndex, stories.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, stories.length]);

  return (
    <div
      className="fixed inset-0 bg-black/95 touch-pan-y z-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex p-2 z-10">
        {stories.map((_, idx) => (
          <ProgressBar
            key={idx}
            index={idx}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white z-30 p-2"
        onClick={onClose}
        aria-label="Close story"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Left/Right Navigation */}
      <div className="absolute inset-y-0 left-0 flex items-center z-20">
        {currentIndex > 0 && (
          <NavigationButton direction="left" onClick={handlePrevious} />
        )}
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-20">
        {currentIndex < stories.length - 1 && (
          <NavigationButton direction="right" onClick={handleNext} />
        )}
      </div>

      {/* Story image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={stories[currentIndex].imageUrl}
          alt={`Story ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Time indicator */}
      <div className="absolute bottom-4 left-4 text-white/70 text-sm">
        {new Date(stories[currentIndex].timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
});

StoryViewer.displayName = 'StoryViewer';

export default StoryViewer;
