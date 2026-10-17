import "server-only";

export class InterviewAiBusyError extends Error {
  constructor(public retryAfter = 15) {
    super("The AI service is busy. Your answers are saved; retry shortly.");
    this.name = "InterviewAiBusyError";
  }
}

export function providerCooldownSeconds(retryAfter: string | null, now = Date.now()) {
  const seconds = retryAfter ? Number(retryAfter) : NaN;
  const requested = Number.isFinite(seconds) ? seconds : retryAfter ? (Date.parse(retryAfter) - now) / 1000 : NaN;
  return Number.isFinite(requested) ? Math.ceil(Math.min(300, Math.max(15, requested))) : 15;
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
    if (now() < availableAt || active >= capacity()) throw new InterviewAiBusyError(Math.max(15, Math.ceil((availableAt - now()) / 1000)));
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
      const cooldown = providerCooldownSeconds(retryAfter, now()) * 1000;
      availableAt = Math.max(availableAt, now() + cooldown);
    },
  };
}

export const interviewProviderLoad = createInterviewProviderLoad();
