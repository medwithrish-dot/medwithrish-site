import { findInterviewUniversity } from "../../app/phloemai/interviews/_data/universities";

export const PREPARATION_THEMES = ["motivation", "reflection", "ethics", "teamwork", "nhs", "hot-topics", "analysis"] as const;

export function validatePreparation(value: Record<string, unknown>) {
  if (!["starting", "practising", "polishing"].includes(String(value.experience))) {
    throw new Error("Choose where you are in your preparation.");
  }
  if (!Number.isInteger(value.weeklyTarget) || Number(value.weeklyTarget) < 1 || Number(value.weeklyTarget) > 14) {
    throw new Error("Choose a weekly goal between 1 and 14 stations.");
  }
  if (!Array.isArray(value.focusThemes) || value.focusThemes.length > 3 || value.focusThemes.some((theme) => !PREPARATION_THEMES.includes(theme)) || new Set(value.focusThemes).size !== value.focusThemes.length) {
    throw new Error("Choose up to three different areas to focus on.");
  }
  if (!Array.isArray(value.targets) || value.targets.length > 10) {
    throw new Error("You can save up to ten university choices.");
  }
  const seen = new Set<string>();
  const targets = value.targets.map((entry: unknown) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Choose a university from the list.");
    const target = entry as Record<string, unknown>;
    if (typeof target.universitySlug !== "string" || !findInterviewUniversity(target.universitySlug)) throw new Error("Choose a university from the list.");
    if (seen.has(target.universitySlug)) throw new Error("Each university can only be added once.");
    seen.add(target.universitySlug);
    const date = target.interviewDate;
    if (date !== null) {
      if (typeof date !== "string" || !/^20\d{2}-\d{2}-\d{2}$/.test(date)) throw new Error("Enter an interview date or choose date not confirmed.");
      const parsed = new Date(`${date}T12:00:00.000Z`);
      if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error("Enter a valid calendar date.");
    }
    return { universitySlug: target.universitySlug, interviewDate: date as string | null };
  });
  return {
    experience: value.experience as "starting" | "practising" | "polishing",
    focusThemes: value.focusThemes as (typeof PREPARATION_THEMES)[number][],
    weeklyTarget: Number(value.weeklyTarget),
    targets,
  };
}
