// Owner-controlled allowlist shared with the API: client requests cannot enable
// arbitrary stations. Only Ethical dilemma stations qualify; Scenario station
// is excluded even though its question-bank theme is Ethics.
// Each original question is still limited to one probe and
// the server caps an attempt at three probes.
export const FOLLOW_UP_STATIONS: readonly string[] = [
  "disability-in-medicine",
  "equality-diversity-inclusion",
];
export const followUpsEnabled = (slug: string) => FOLLOW_UP_STATIONS.includes(slug);

// A short thinking interval for Med interview answers, followed by confirmation.
// This is a product default, not a scientifically validated Med interview threshold.
export const ANSWER_SILENCE_MS = 5_000;
export const DONE_PROMPT = "Done? Say yes or no.";

/** Only an explicit request can move speech back to a completed answer. */
export function parsePreviousAnswerInterrupt(text: string): string | null {
  const match = text.trim().match(/^(?:(?:wait|hold on)[,.!?]?\s+)?(?:please\s+)?(?:i (?:want|would like|need) to|can i|let me) (?:add (?:something |more )?to|continue|finish) (?:my |the )?(?:previous|last) answer\b[,.!?:]?\s*/i);
  return match ? text.trim().slice(match[0].length).trim() : null;
}

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

export function panelQuestionTransition(questionIndex: number, questionCount: number, questionId = "") {
  if (questionIndex <= 0) return "";
  if (questionIndex === questionCount - 1) return "To finish, let's bring this back to you and your development as a future medical student.";
  if (/ethic|consent|confidential|safeguard|professional.*boundar|organ-donation/.test(questionId)) return "Let's build on that by considering a related ethical or professional question.";
  if (/communicat/.test(questionId)) return "Let's connect this to how you would communicate with others.";
  if (/teamwork|healthcare-teams/.test(questionId)) return "Let's consider how these ideas apply to working with a team.";
  if (/nhs|health-inequal|resources|public-health/.test(questionId)) return "Let's look at how this connects to the wider health service.";
  if (/motivation|role-of-a-doctor|work-experience/.test(questionId)) return "Let's bring this back to your understanding of a career in medicine.";
  if (/technology|innovation/.test(questionId)) return "Let's consider how changes in healthcare might affect these ideas.";
  return "Let's take these ideas into the next question.";
}

export function parseDoneReply(text: string): { done: boolean; continuation: string } {
  const cleaned = text.trim().replace(/[’‘]/g, "'").replace(/[.!?,]+$/g, "").replace(/[,!?]+\s*/g, " ").trim();
  if (/^(?:yes|yeah|yep|yup|yes please|(?:yes |yeah )?i(?:'m| am) (?:done|finished)|(?:yes )?that(?:'s| is) (?:all|everything)|yes thank you)$/i.test(cleaned)) return { done: true, continuation: "" };
  if (/^(?:no|nope|not yet|no not yet)$/i.test(cleaned)) return { done: false, continuation: "" };
  // Continuing an answer is also a "no"; do not discard its content.
  return { done: false, continuation: text.trim().replace(/^(?:no|nope)[,.]?\s+/i, "") };
}
