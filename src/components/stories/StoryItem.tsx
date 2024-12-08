import { memo, useCallback } from "react";
import { Story } from "../../types";

interface StoryItemProps {
  story: Story;
  index: number;
  onStoryClick: (index: number) => void;
  getTimeAgo: (timestamp: number) => string;
}

const StoryItem = memo(
  ({ story, index, onStoryClick, getTimeAgo }: StoryItemProps) => {
    const handleClick = useCallback(() => {
      onStoryClick(index);
    }, [index, onStoryClick]);

    return (
      <div className="flex flex-col flex-shrink-0 items-center space-y-1">
        <button
          onClick={handleClick}
          className="flex-shrink-0 w-16 h-16 rounded-full transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <div
            className={`w-full h-full rounded-full overflow-hidden border-2 ${
              story.viewed ? "border-gray-400" : "border-blue-400"
            }`}
          >
            <img
              src={story.imageUrl}
              alt={`Story ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        </button>
        <span className="text-[10px] text-gray-500 truncate max-w-[64px] text-center">
          {getTimeAgo(story.timestamp)}
        </span>
      </div>
    );
  }
);

StoryItem.displayName = "StoryItem";

export default StoryItem;
