// Fixed v2 scale: the rubric average is displayed without a generosity boost.
// Saved v1 reports retain their stored scores; they are not silently regraded.
export function interviewPercentage(raw: number): number {
  if (!Number.isFinite(raw)) throw new Error("Invalid rubric score");
  return Math.min(99, Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10);
}

export const INTERVIEW_RUBRIC_VERSION = "why-medicine-v2";
export const RUBRIC_CRITERIA = ["Relevance and motivation", "Evidence and reflection", "Reasoning and balance", "Structure and clarity", "Insight and professionalism"] as const;
export const PRACTICE_PASS_AVERAGE = 75;

// Product practice standard, not a university cutoff. Compute it once on the server.
export function practiceResult(rubric: readonly { score: number }[]) {
  if (rubric.length !== RUBRIC_CRITERIA.length || rubric.some(row => !Number.isFinite(row.score) || row.score < 0 || row.score > 100)) throw new Error("Invalid practice rubric");
  const average = rubric.reduce((sum, row) => sum + row.score, 0) / rubric.length;
  const minimums = [40, 40, 50, 40, 50] as const;
  const reasons: string[] = [];
  if (average < PRACTICE_PASS_AVERAGE) reasons.push(`Your overall rubric average needs to reach ${PRACTICE_PASS_AVERAGE}/100.`);
  rubric.forEach((row, index) => {
    if (row.score < minimums[index]) reasons.push(`${RUBRIC_CRITERIA[index]} needs to reach ${minimums[index]}/100. Review the evidence and fix for this criterion.`);
  });
  const margin = Math.min(average - PRACTICE_PASS_AVERAGE, ...rubric.map((row, index) => row.score - minimums[index]));
  return {
    version: "practice-pass-v2" as const,
    outcome: reasons.length ? "fail" as const : "pass" as const,
    borderline: Math.abs(margin) <= 5,
    reasons: reasons.length ? reasons : ["You met the overall practice standard and every required criterion minimum. Keep developing the improvements below."],
  };
}

export function validateFeedback(value: unknown, expectedAnswers?: number, guidance?: readonly { questionId: string; checklistPoints: readonly { id: string }[] }[]) {
  if (!value || typeof value !== "object") throw new Error("Feedback was incomplete. Please retry.");
  const data = value as Record<string, unknown>;
  let coveredMarkScheme: { questionId: string; pointIds: string[] }[] | undefined;
  if (data.coveredMarkScheme !== undefined || guidance !== undefined) {
    if (!Array.isArray(data.coveredMarkScheme) || data.coveredMarkScheme.length > 16) throw new Error("Invalid mark scheme coverage");
    const seen = new Set<string>();
    coveredMarkScheme = data.coveredMarkScheme.map((entry: unknown) => {
      if (!entry || typeof entry !== "object") throw new Error("Invalid mark scheme coverage");
      const row = entry as Record<string, unknown>;
      if (typeof row.questionId !== "string" || !row.questionId || seen.has(row.questionId) || !Array.isArray(row.pointIds) || row.pointIds.length > 100 || row.pointIds.some(id => typeof id !== "string" || !id || id.length > 2000)) throw new Error("Invalid mark scheme coverage");
      seen.add(row.questionId);
      const trusted = guidance?.find(question => question.questionId === row.questionId);
      if (guidance && (!trusted || row.pointIds.some(id => !trusted.checklistPoints.some(point => point.id === id)))) throw new Error("Unknown mark scheme point");
      return { questionId: row.questionId, pointIds: [...new Set(row.pointIds as string[])] };
    });
    if (guidance?.some(question => !seen.has(question.questionId))) throw new Error("Missing mark scheme coverage");
  }
  const list = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.length <= 5 && v.every((s) => typeof s === "string" && s.trim().length > 0 && s.length <= 1200);
  const structured = data.weaknesses !== undefined || data.fixes !== undefined;
  const fixes = structured ? data.fixes : data.improvements;
  if (structured && (!list(data.weaknesses) || !list(data.fixes))) throw new Error("Feedback was incomplete. Please retry.");
  if (typeof data.summary !== "string" || !data.summary.trim() || data.summary.length > 2000 || !list(data.strengths) || !list(fixes) || !Array.isArray(data.rubric) || data.rubric.length !== RUBRIC_CRITERIA.length) throw new Error("Feedback was incomplete. Please retry.");
  const enhanced = data.rewrittenAnswers !== undefined || data.transcriptionWarning !== undefined || expectedAnswers !== undefined;
  let rewrittenAnswers: { answerIndex: number; text: string }[] | undefined;
  if (enhanced) {
    if (typeof data.transcriptionWarning !== "boolean" || !Array.isArray(data.rewrittenAnswers) || data.rewrittenAnswers.length > 16) throw new Error("Invalid answer rewrite");
    const seen = new Set<number>();
    rewrittenAnswers = data.rewrittenAnswers.map((entry: unknown) => {
      if (!entry || typeof entry !== "object") throw new Error("Invalid answer rewrite");
      const row = entry as Record<string, unknown>;
      if (typeof row.answerIndex !== "number" || !Number.isInteger(row.answerIndex) || row.answerIndex < 0 || row.answerIndex >= (expectedAnswers ?? 16) || seen.has(row.answerIndex)
        || typeof row.text !== "string" || !row.text.trim() || row.text.length > 6000) throw new Error("Invalid answer rewrite");
      seen.add(row.answerIndex);
      return { answerIndex: row.answerIndex, text: row.text.trim() };
    });
    if (expectedAnswers !== undefined && rewrittenAnswers.length !== expectedAnswers) throw new Error("Missing answer rewrite");
  }
  const rubric = data.rubric.map((entry: unknown, index: number) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid feedback rubric");
    const row = entry as Record<string, unknown>;
    if (typeof row.score !== "number" || !Number.isFinite(row.score) || row.score < 0 || row.score > 100 || typeof row.reason !== "string" || !row.reason.trim() || row.reason.length > 1200) throw new Error("Invalid feedback rubric");
    return { criterion: RUBRIC_CRITERIA[index], score: row.score, reason: row.reason };
  });
  return { ...(coveredMarkScheme ? { coveredMarkScheme } : {}), summary: data.summary, strengths: data.strengths, improvements: fixes as string[], ...(structured ? { weaknesses: data.weaknesses as string[], fixes: fixes as string[] } : {}), ...(enhanced ? { transcriptionWarning: data.transcriptionWarning as boolean, rewrittenAnswers } : {}), rubric, score: interviewPercentage(rubric.reduce((sum, r) => sum + r.score, 0) / rubric.length), practiceResult: practiceResult(rubric) };
}
