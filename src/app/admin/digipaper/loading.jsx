export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
