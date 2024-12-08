import { memo } from "react";

const SkeletonLoading = memo(() => {
  const skeletonItems = Array(5).fill(null);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-screen-md">
        {/* Skeleton for title */}
        <div className="mb-4 w-32 h-8 bg-gray-200 rounded-md animate-pulse"></div>

        <div className="flex overflow-x-auto items-start py-3 pb-2 space-x-3 scrollbar-hide">
          {/* Add Story Button Skeleton */}
          <div className="flex flex-col flex-shrink-0 items-center space-y-1">
            <div className="flex justify-center items-center w-16 h-16 rounded-full border-2 border-gray-200 border-dashed animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Story Skeletons */}
          {skeletonItems.map((_, index) => (
            <div
              key={index}
              className="flex flex-col flex-shrink-0 items-center space-y-1"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

SkeletonLoading.displayName = "SkeletonLoading";

export default SkeletonLoading;
