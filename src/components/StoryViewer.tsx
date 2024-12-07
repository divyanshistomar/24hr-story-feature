import React, { useState, useEffect, useRef } from "react";
import { Story } from "../types";

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 3000; // 3 seconds in milliseconds

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressTimeout = useRef<number>();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    if (isPlaying) {
      startProgress();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (progressTimeout.current) {
        window.clearTimeout(progressTimeout.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, isPlaying]);

  const startProgress = () => {
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
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (e.key === "ArrowRight" && currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPlaying(false);
    setTouchEnd(null);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
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
  };

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
          <div key={idx} className="h-0.5 flex-1 mx-0.5">
            <div className="h-full bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: `${
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                      ? isPlaying
                        ? "100%"
                        : "0%"
                      : "0%"
                  }`,
                  transition:
                    idx === currentIndex && isPlaying
                      ? `width ${STORY_DURATION}ms linear`
                      : "none",
                }}
              />
            </div>
          </div>
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

      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center z-20">
        {currentIndex > 0 && (
          <button
            className="p-4 text-white/50 hover:text-white transition-colors"
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            aria-label="Previous story"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-20">
        {currentIndex < stories.length - 1 && (
          <button
            className="p-4 text-white/50 hover:text-white transition-colors"
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            aria-label="Next story"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
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
};

export default StoryViewer;
