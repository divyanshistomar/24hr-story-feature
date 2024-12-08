import React, { useState, useEffect, useRef, useCallback } from "react";
import StoryViewer from "./StoryViewer";
import SkeletonLoading from "./stories/SkeletonLoading";
import StoryItem from "./stories/StoryItem";
import AddStoryButton from "./stories/AddStoryButton";
import { useImageUpload } from "../hooks/useImageUpload";
import { loadStoriesFromLocalStorage, saveStoriesToLocalStorage, getTimeAgo } from "../utils/storyHelpers";
import { Story } from "../types";

const Stories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleImageUpload } = useImageUpload();

  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      try {
        const loadedStories = await loadStoriesFromLocalStorage();
        setStories(loadedStories);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    loadStories();
    const cleanup = setInterval(cleanupExpiredStories, 60000);
    return () => clearInterval(cleanup);
  }, []);

  const cleanupExpiredStories = useCallback(() => {
    setStories((prevStories) => {
      const filteredStories = prevStories.filter(
        (story) => Date.now() - story.timestamp < 24 * 60 * 60 * 1000
      );
      if (filteredStories.length !== prevStories.length) {
        saveStoriesToLocalStorage(filteredStories);
      }
      return filteredStories;
    });
  }, []);

  const handleStoryClick = useCallback((index: number) => {
    setStories((prevStories) => {
      const updatedStories = prevStories.map((story, i) => {
        if (i === index && !story.viewed) {
          return { ...story, viewed: true };
        }
        return story;
      });
      saveStoriesToLocalStorage(updatedStories);
      return updatedStories;
    });
    setSelectedStoryIndex(index);
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newStory = await handleImageUpload(file);
      if (newStory) {
        setStories((prevStories) => {
          const updatedStories = [...prevStories, newStory];
          saveStoriesToLocalStorage(updatedStories);
          return updatedStories;
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Error uploading image");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [handleImageUpload]);

  const handleAddStoryClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Stories</h1>
        <div className="flex items-start space-x-3 py-3 overflow-x-auto pb-2 scrollbar-hide">
          <AddStoryButton onClick={handleAddStoryClick} />
          
          {stories.map((story, index) => (
            <StoryItem
              key={story.id}
              story={story}
              index={index}
              onStoryClick={handleStoryClick}
              getTimeAgo={getTimeAgo}
            />
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
