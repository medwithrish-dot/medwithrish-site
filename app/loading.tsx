export default function Loading() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-blue-100"
    >
      <div className="h-full w-1/2 animate-[phloem-loading_1s_ease-in-out_infinite] rounded-r-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-400 shadow-[0_0_18px_rgba(37,99,235,0.45)]" />
    </div>
  );
}
