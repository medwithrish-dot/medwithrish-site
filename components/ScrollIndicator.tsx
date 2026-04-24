export default function ScrollIndicator() {
  return (
    <div className="mt-6 flex flex-col items-center text-white/70">

      {/* Arrow */}
      <svg
        className="h-6 w-6 animate-bounce"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>

    </div>
  );
}