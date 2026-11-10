export type InterviewPlatform = "medicine" | "dentistry";

// Keep medicine's user_id primary key and older deployed callers compatible.
export function preparationTable(platform: InterviewPlatform) {
  return platform === "dentistry" ? "interview_dentistry_preparation_profiles" : "interview_preparation_profiles";
}

export function platformFromPath(path: string): InterviewPlatform {
  return /^\/(?:medicforest\/)?dentistry(?:\/|$)/.test(path) ? "dentistry" : "medicine";
}

export class InvalidInterviewPlatform extends Error { readonly status = 400; }

export function requestInterviewPlatform(request: Request): InterviewPlatform {
  const platform = new URL(request.url).searchParams.get("platform");
  if (platform !== null && platform !== "medicine" && platform !== "dentistry") throw new InvalidInterviewPlatform("Invalid interview platform");
  return platform ?? "medicine";
}

export function interviewBase(platform: InterviewPlatform) {
  return platform === "dentistry" ? "/medicforest/dentistry/interviews" : "/medicforest/interview";
}

export function interviewApiHref(path: string, platform: InterviewPlatform) {
  if (platform === "medicine" || !path.startsWith("/api/interviews/")) return path;
  return `${path}${path.includes("?") ? "&" : "?"}platform=dentistry`;
}

/** Scope each request without changing global fetch or sharing mutable platform state. */
export function interviewRequestPath(path: string) {
  const platform = typeof window === "undefined" ? "medicine" : platformFromPath(window.location.pathname);
  return interviewApiHref(path, platform);
}
