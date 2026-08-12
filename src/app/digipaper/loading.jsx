export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Filters skeleton */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>

        {/* Showing info skeleton */}
        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mb-6" />

        {/* Issue cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white shadow p-3">
              <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />

              <div className="mt-3 space-y-2">
                <div className="h-3 w-3/4 mx-auto bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/2 mx-auto bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
