// Owner-controlled allowlist shared with the API: client requests cannot enable
// arbitrary stations. Each original question is still limited to one probe and
// the server caps an attempt at three probes.
export const FOLLOW_UP_STATIONS: readonly string[] = [
  "why-medicine",
  "work-experience",
  "disability-in-medicine",
  "equality-diversity-inclusion",
  "ozempic",
  "ethics-confidentiality",
  "nhs-waiting-lists",
  "teamwork-group-discussion",
  "data-analysis",
];
export const followUpsEnabled = (slug: string) => FOLLOW_UP_STATIONS.includes(slug);

// A short thinking interval for interview answers, followed by confirmation.
// This is a product default, not a scientifically validated interview threshold.
export const ANSWER_SILENCE_MS = 4_000;
export const DONE_PROMPT = "Done? Say yes or no.";

const QUESTION_TRANSITIONS = [
  "Great. Moving on to the next question.",
  "Thank you. Let's move on.",
  "Okay. Here's your next question.",
  "Thanks for sharing that. Let's continue.",
  "All right. Moving on to the next question.",
  "Thank you for your answer. Here's the next question.",
  "Okay, let's explore something else.",
  "Thanks. We'll move on now.",
] as const;
const PROBE_TRANSITIONS = [
  "Thank you. I'd like to explore that a little further.",
  "Let's look at that in a bit more detail.",
  "Thanks. I have a follow-up question for you.",
] as const;

export function questionTransition(questionIndex: number, followUp = false): string {
  if (questionIndex <= 0) return "";
  const phrases = followUp ? PROBE_TRANSITIONS : QUESTION_TRANSITIONS;
  return phrases[(questionIndex - 1) % phrases.length];
}

export function parseDoneReply(text: string): { done: boolean; continuation: string } {
  const cleaned = text.trim().replace(/[’‘]/g, "'").replace(/[.!?,]+$/g, "").replace(/[,!?]+\s*/g, " ").trim();
  if (/^(?:yes|yeah|yep|yup|yes please|(?:yes |yeah )?i(?:'m| am) (?:done|finished)|(?:yes )?that(?:'s| is) (?:all|everything)|yes thank you)$/i.test(cleaned)) return { done: true, continuation: "" };
  if (/^(?:no|nope|not yet|no not yet)$/i.test(cleaned)) return { done: false, continuation: "" };
  // Continuing an answer is also a "no"; do not discard its content.
  return { done: false, continuation: text.trim().replace(/^(?:no|nope)[,.]?\s+/i, "") };
}
