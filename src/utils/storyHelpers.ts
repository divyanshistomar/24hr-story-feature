import { Story } from "../types";

export const loadStoriesFromLocalStorage = async (): Promise<Story[]> => {
  return new Promise((resolve) => {
    const savedStories = localStorage.getItem("stories");
    if (savedStories) {
      const parsedStories = JSON.parse(savedStories);
      const filteredStories = parsedStories.filter((story: Story) => {
        return Date.now() - story.timestamp < 24 * 60 * 60 * 1000;
      });
      resolve(filteredStories);
    }
    resolve([]);
  });
};

export const saveStoriesToLocalStorage = (stories: Story[]) => {
  localStorage.setItem("stories", JSON.stringify(stories));
};

export const getTimeAgo = (timestamp: number): string => {
  const timeDiff = Date.now() - timestamp;
  const minutes = Math.floor(timeDiff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

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
