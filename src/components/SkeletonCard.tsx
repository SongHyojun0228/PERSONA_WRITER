export const SkeletonCard = () => {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg bg-paper dark:bg-forest-sub h-full flex flex-col animate-pulse">
      {/* Cover image skeleton */}
      <div className="w-full h-40 bg-gray-300 dark:bg-gray-700" />

      {/* Content skeleton */}
      <div className="p-4 flex-grow space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />

        {/* Author and date */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        </div>

        {/* Stats */}
        <div className="flex space-x-3 mt-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonCardGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
