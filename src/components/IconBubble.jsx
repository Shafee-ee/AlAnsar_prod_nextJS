export function IconBubble({ children, variant = "soft" }) {
  const isPrimary = variant === "primary";
  const isSoft = variant === "soft";

  return (
    <div className="relative flex items-center justify-center">
      {/* glow */}
      <div
        className={`absolute ${
          isPrimary ? "w-20 h-20 blur-xl" : "w-14 h-14 blur-md"
        } rounded-full ${isPrimary ? "bg-blue-300/40" : "bg-blue-100/20"}`}
      />

      {/* inner */}
      <div
        className={`flex items-center justify-center ${
          isPrimary
            ? "w-16 h-16 rounded-full bg-blue-600 shadow-lg"
            : "w-12 h-12 rounded-xl bg-blue-50 shadow-[0_4px_8px_rgba(37,99,235,0.35)]"
        }`}
      >
        {isPrimary && (
          <>
            <span className="absolute -left-2 -bottom-1 text-blue-400 text-[2px">
              ✦
            </span>
            <span className="absolute -right-4 -top-1 text-blue-300 text-[25px]">
              ✦
            </span>
          </>
        )}
        {children}
      </div>
    </div>
  );
}
