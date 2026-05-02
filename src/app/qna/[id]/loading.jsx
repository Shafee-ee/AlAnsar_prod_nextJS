export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero / image placeholder */}
      <div className="w-full h-56 bg-gray-200 animate-pulse rounded-xl" />

      {/* Title / badge */}
      <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded" />

      {/* Source / meta */}
      <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />

      {/* Answer blocks */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-11/12 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-10/12 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-9/12 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Related */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-xl" />
        <div className="h-32 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
