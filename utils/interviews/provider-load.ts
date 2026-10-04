import "server-only";

export class InterviewAiBusyError extends Error {
  constructor() {
    super("The AI service is busy. Your answers are saved; retry shortly.");
    this.name = "InterviewAiBusyError";
  }
}

// Instance-local protection, not a substitute for the project's provider quotas.
export function createInterviewProviderLoad(now = Date.now) {
  let active = 0;
  let availableAt = 0;
  const capacity = () => {
    const configured = Number(process.env.INTERVIEW_AI_MAX_CONCURRENT ?? 20);
    return Number.isInteger(configured) && configured >= 1 && configured <= 100 ? configured : 20;
  };
  const assertAvailable = () => {
    if (now() < availableAt || active >= capacity()) throw new InterviewAiBusyError();
  };
  return {
    assertAvailable,
    acquire() {
      assertAvailable();
      active += 1;
      let released = false;
      return () => { if (!released) { released = true; active -= 1; } };
    },
    unavailable(status: number, retryAfter: string | null) {
      if (![429, 503].includes(status)) return;
      const seconds = retryAfter ? Number(retryAfter) : NaN;
      const retryDate = retryAfter ? Date.parse(retryAfter) : NaN;
      const requested = Number.isFinite(seconds) ? seconds * 1000 : retryDate - now();
      const cooldown = Number.isFinite(requested) ? Math.min(60_000, Math.max(15_000, requested)) : 15_000;
      availableAt = Math.max(availableAt, now() + cooldown);
    },
  };
}

export const interviewProviderLoad = createInterviewProviderLoad();
