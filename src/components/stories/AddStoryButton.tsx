import { memo } from "react";

interface AddStoryButtonProps {
  onClick: () => void;
}

const AddStoryButton = memo(({ onClick }: AddStoryButtonProps) => (
  <div className="flex flex-col flex-shrink-0 items-center space-y-1">
    <button
      onClick={onClick}
      className="flex justify-center items-center w-16 h-16 rounded-full border-2 border-blue-400 border-dashed transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 group"
      aria-label="Add new story"
    >
      <span className="text-2xl text-blue-400 transition-colors duration-300 group-hover:text-blue-500">
        +
      </span>
    </button>
    <span className="text-xs text-gray-500">Add Story</span>
  </div>
));

AddStoryButton.displayName = "AddStoryButton";

export default AddStoryButton;
