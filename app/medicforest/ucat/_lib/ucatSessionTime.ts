export function getRestoredSessionTime(
  remaining: unknown,
  duration: unknown,
  fallbackDuration: number
) {
  const durationSeconds =
    typeof duration === "number" && Number.isFinite(duration) && duration > 0
      ? Math.floor(duration)
      : Math.max(0, Math.floor(fallbackDuration));
  const remainingSeconds =
    typeof remaining === "number" && Number.isFinite(remaining) && remaining >= 0
      ? Math.min(durationSeconds, Math.floor(remaining))
      : durationSeconds;

  return { durationSeconds, remainingSeconds };
}
