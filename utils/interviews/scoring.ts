// Fixed v2 scale: the rubric average is displayed without a generosity boost.
// Saved v1 reports retain their stored scores; they are not silently regraded.
export function interviewPercentage(raw: number): number {
  if (!Number.isFinite(raw)) throw new Error("Invalid rubric score");
  return Math.min(99, Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10);
}

export const INTERVIEW_RUBRIC_VERSION = "why-medicine-v2";
export const RUBRIC_CRITERIA = ["Relevance and motivation", "Evidence and reflection", "Reasoning and balance", "Structure and clarity", "Insight and professionalism"] as const;

// Product practice standard, not a university cutoff. Compute it once on the server.
export function practiceResult(rubric: readonly { score: number }[]) {
  if (rubric.length !== RUBRIC_CRITERIA.length || rubric.some(row => !Number.isFinite(row.score) || row.score < 0 || row.score > 100)) throw new Error("Invalid practice rubric");
  const average = rubric.reduce((sum, row) => sum + row.score, 0) / rubric.length;
  const minimums = [40, 40, 50, 40, 50] as const;
  const reasons: string[] = [];
  if (average < 60) reasons.push("Your overall rubric average needs to reach 60/100.");
  rubric.forEach((row, index) => {
    if (row.score < minimums[index]) reasons.push(`${RUBRIC_CRITERIA[index]} needs to reach ${minimums[index]}/100. Review the evidence and fix for this criterion.`);
  });
  const margin = Math.min(average - 60, ...rubric.map((row, index) => row.score - minimums[index]));
  return {
    version: "practice-pass-v1" as const,
    outcome: reasons.length ? "fail" as const : "pass" as const,
    borderline: Math.abs(margin) <= 5,
    reasons: reasons.length ? reasons : ["You met the overall practice standard and every required criterion minimum. Keep developing the improvements below."],
  };
}

export function validateFeedback(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Feedback was incomplete. Please retry.");
  const data = value as Record<string, unknown>;
  const list = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.length <= 5 && v.every((s) => typeof s === "string" && s.trim().length > 0 && s.length <= 1200);
  const structured = data.weaknesses !== undefined || data.fixes !== undefined;
  const fixes = structured ? data.fixes : data.improvements;
  if (structured && (!list(data.weaknesses) || !list(data.fixes))) throw new Error("Feedback was incomplete. Please retry.");
  if (typeof data.summary !== "string" || !data.summary.trim() || data.summary.length > 2000 || !list(data.strengths) || !list(fixes) || !Array.isArray(data.rubric) || data.rubric.length !== RUBRIC_CRITERIA.length) throw new Error("Feedback was incomplete. Please retry.");
  const rubric = data.rubric.map((entry: unknown, index: number) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid feedback rubric");
    const row = entry as Record<string, unknown>;
    if (typeof row.score !== "number" || !Number.isFinite(row.score) || row.score < 0 || row.score > 100 || typeof row.reason !== "string" || !row.reason.trim() || row.reason.length > 1200) throw new Error("Invalid feedback rubric");
    return { criterion: RUBRIC_CRITERIA[index], score: row.score, reason: row.reason };
  });
  return { summary: data.summary, strengths: data.strengths, improvements: fixes as string[], ...(structured ? { weaknesses: data.weaknesses as string[], fixes: fixes as string[] } : {}), rubric, score: interviewPercentage(rubric.reduce((sum, r) => sum + r.score, 0) / rubric.length), practiceResult: practiceResult(rubric) };
}
