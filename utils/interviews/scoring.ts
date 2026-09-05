// The inverse of exponential effort: each extra point needs more rubric evidence.
// Fixed v1 mapping, shared by all candidates. No relative/population-based scores.
export function interviewPercentage(raw: number): number {
  if (!Number.isFinite(raw)) throw new Error("Invalid rubric score");
  const quality = Math.min(100, Math.max(0, raw)) / 100;
  return Math.min(99, Math.round((99 * Math.log1p(9 * quality) / Math.log(10)) * 10) / 10);
}

export const INTERVIEW_RUBRIC_VERSION = "why-medicine-v1";
export const RUBRIC_CRITERIA = ["Relevance and motivation", "Evidence and reflection", "Reasoning and balance", "Structure and clarity", "Insight and professionalism"] as const;

export function validateFeedback(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Feedback was incomplete. Please retry.");
  const data = value as Record<string, unknown>;
  const list = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.length <= 5 && v.every((s) => typeof s === "string" && s.trim().length > 0 && s.length <= 1200);
  if (typeof data.summary !== "string" || !data.summary.trim() || data.summary.length > 2000 || !list(data.strengths) || !list(data.improvements) || !Array.isArray(data.rubric) || data.rubric.length !== RUBRIC_CRITERIA.length) throw new Error("Feedback was incomplete. Please retry.");
  const rubric = data.rubric.map((entry: unknown, index: number) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid feedback rubric");
    const row = entry as Record<string, unknown>;
    if (typeof row.score !== "number" || !Number.isFinite(row.score) || row.score < 0 || row.score > 100 || typeof row.reason !== "string" || !row.reason.trim() || row.reason.length > 1200) throw new Error("Invalid feedback rubric");
    return { criterion: RUBRIC_CRITERIA[index], score: row.score, reason: row.reason };
  });
  return { summary: data.summary, strengths: data.strengths, improvements: data.improvements, rubric, score: interviewPercentage(rubric.reduce((sum, r) => sum + r.score, 0) / rubric.length) };
}
