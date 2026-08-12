export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />

        <p className="text-sm text-white/70">Loading DigiPaper...</p>
      </div>
    </div>
  );
}
