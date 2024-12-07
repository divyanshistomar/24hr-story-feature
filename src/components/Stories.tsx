import React, { useState, useEffect, useRef } from "react";
import StoryViewer from "./StoryViewer";
import { Story } from "../types";

const Stories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStoriesFromLocalStorage();
    const cleanup = setInterval(cleanupExpiredStories, 60000); // Check every minute
    return () => clearInterval(cleanup);
  }, []);

  const loadStoriesFromLocalStorage = () => {
    const savedStories = localStorage.getItem("stories");
    if (savedStories) {
      const parsedStories = JSON.parse(savedStories);
      setStories(
        parsedStories.filter((story: Story) => {
          return Date.now() - story.timestamp < 24 * 60 * 60 * 1000;
        })
      );
    }
  };

  const cleanupExpiredStories = () => {
    setStories((prevStories) => {
      const validStories = prevStories.filter(
        (story) => Date.now() - story.timestamp < 24 * 60 * 60 * 1000
      );
      localStorage.setItem("stories", JSON.stringify(validStories));
      return validStories;
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    try {
      // Create image element to get dimensions
      const img = new Image();
      const imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      img.src = imageUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Resize image if needed
      let finalImageUrl = imageUrl;
      if (img.width > 1080 || img.height > 1920) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const ratio = Math.min(1080 / img.width, 1920 / img.height);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        finalImageUrl = canvas.toDataURL("image/jpeg", 0.9);
      }

      const newStory: Story = {
        id: Date.now().toString(),
        imageUrl: finalImageUrl,
        timestamp: Date.now(),
        viewed: false, // Set viewed to false for new stories
      };

      setStories((prevStories) => {
        const updatedStories = [...prevStories, newStory];
        localStorage.setItem("stories", JSON.stringify(updatedStories));
        return updatedStories;
      });
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try again.");
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const timeDiff = Date.now() - timestamp;
    const minutes = Math.floor(timeDiff / 1000 / 60);
    const hours = Math.floor(timeDiff / 1000 / 60 / 60);
    const days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Stories</h1>
        <div className="flex items-start space-x-3 py-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
              aria-label="Add new story"
            >
              <span className="text-2xl text-blue-400 group-hover:text-blue-500 transition-colors duration-300">
                +
              </span>
            </button>
            <span className="text-xs text-gray-500">Add Story</span>
          </div>

          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 flex-shrink-0"
            >
              <button
                onClick={() => {
                  setSelectedStoryIndex(index);
                  setStories((prevStories) => {
                    const updatedStories = [...prevStories];
                    updatedStories[index].viewed = true; // Mark story as viewed
                    localStorage.setItem("stories", JSON.stringify(updatedStories));
                    return updatedStories;
                  });
                }}
                className="w-16 h-16 rounded-full flex-shrink-0 transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <div
                  className={`w-full h-full rounded-full overflow-hidden border-2 ${story.viewed ? 'border-gray-400' : 'border-blue-400'}`}
                >
                  <img
                    src={story.imageUrl}
                    alt={`Story ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              <span className="text-[10px] text-gray-500 truncate max-w-[64px] text-center">
                {getTimeAgo(story.timestamp)}
              </span>
            </div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No stories yet. Click the + button to add your first story!</p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
};

export default Stories;
