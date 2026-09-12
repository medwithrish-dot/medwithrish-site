import type { InterviewAttempt } from "./interview-types";

export type SavedInterviewSummary = Pick<InterviewAttempt, "id" | "title" | "stationSlug" | "universitySlug" | "status"> & {
  universityName: string;
  startedAtLabel: string;
  feedbackScore: number | null;
  canResume: boolean;
};

export type SavedInterviewStatus = "all" | "feedback" | "saved" | "in_progress";

export function canResumeSavedInterview(
  attempt: Pick<InterviewAttempt, "status" | "startedAt" | "preparationSeconds" | "stationSeconds">,
  now: number,
) {
  return attempt.status === "in_progress"
    && now < Date.parse(attempt.startedAt) + (attempt.preparationSeconds + attempt.stationSeconds) * 1000;
}

export function filterSavedInterviews(
  attempts: SavedInterviewSummary[],
  query: string,
  university: string,
  status: SavedInterviewStatus,
) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return attempts.filter((attempt) => {
    const searchable = `${attempt.title} ${attempt.stationSlug.replaceAll("-", " ")} ${attempt.universityName} ${attempt.universitySlug ?? ""} ${attempt.startedAtLabel}`.toLowerCase();
    const matchesUniversity = university === "all" || (university === "general" ? !attempt.universitySlug : attempt.universitySlug === university);
    const matchesStatus = status === "all"
      || (status === "feedback" && attempt.feedbackScore !== null)
      || (status === "saved" && !attempt.canResume && attempt.feedbackScore === null)
      || (status === "in_progress" && attempt.canResume);
    return matchesUniversity && matchesStatus && words.every((word) => searchable.includes(word));
  });
}

export function savedInterviewHref(attempt: Pick<SavedInterviewSummary, "id" | "canResume">) {
  return attempt.canResume
    ? `/phloemai/interviews/ai-interviews?attempt=${encodeURIComponent(attempt.id)}`
    : `/phloemai/interviews/reports/${encodeURIComponent(attempt.id)}`;
}

export function savedInterviewStatus(attempt: Pick<SavedInterviewSummary, "canResume" | "feedbackScore">) {
  if (attempt.canResume) return "Ready to continue";
  if (attempt.feedbackScore !== null) return "Feedback ready";
  return "Transcript saved · Ready to review";
}
