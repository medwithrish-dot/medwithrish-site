import type { InterviewAnswer } from "./interview-types";
import { DONE_PROMPT, questionTransition } from "./station-flow";

const intros = new Set(Array.from({ length: 16 }, (_, index) => [questionTransition(index), questionTransition(index, true)]).flat());

export function interviewerSpeech(value: Record<string, unknown>, saved?: InterviewAnswer): Pick<InterviewAnswer, "interviewerIntro" | "interviewerPrompts"> {
  const intro = typeof value.interviewerIntro === "string" && intros.has(value.interviewerIntro) ? value.interviewerIntro : saved?.interviewerIntro;
  const prompts = Array.isArray(value.interviewerPrompts) ? value.interviewerPrompts : saved?.interviewerPrompts;
  return {
    ...(intro ? { interviewerIntro: intro } : {}),
    ...(prompts ? { interviewerPrompts: prompts.filter((item) => item && item.text === DONE_PROMPT && Number.isInteger(item.answerOffset) && item.answerOffset >= 0 && item.answerOffset <= 8000).slice(0, 12) } : {}),
  };
}

export function answerConversation(answer: InterviewAnswer) {
  const turns: { speaker: "You" | "Interviewer"; text: string }[] = [];
  let offset = 0;
  for (const prompt of answer.interviewerPrompts ?? []) {
    const end = Math.max(offset, Math.min(answer.answer.length, prompt.answerOffset));
    if (end > offset) turns.push({ speaker: "You", text: answer.answer.slice(offset, end).trim() });
    turns.push({ speaker: "Interviewer", text: prompt.text });
    offset = end;
  }
  if (offset < answer.answer.length || !turns.length) turns.push({ speaker: "You", text: answer.answer.slice(offset).trim() });
  return turns;
}
