export function remainingQuestionMilliseconds(deadlineMs: number, nowMs: number): number {
  return Math.max(0, deadlineMs - nowMs);
}

export function remainingQuestionSeconds(deadlineMs: number, nowMs: number): number {
  return Math.ceil(remainingQuestionMilliseconds(deadlineMs, nowMs) / 1000);
}
