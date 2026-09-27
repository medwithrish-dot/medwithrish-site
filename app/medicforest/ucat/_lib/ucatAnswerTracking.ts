import type { UCATQuestion } from "./ucatQuestionBank";

type AnswerSelectionEvent = {
  payload?: {
    answer?: unknown;
    itemId?: unknown;
    statementId?: unknown;
    slot?: unknown;
  };
};

export function countAnswerSwitches(
  question: UCATQuestion,
  events: AnswerSelectionEvent[]
) {
  const previousByPart = new Map<string, string>();
  let switches = 0;

  for (const event of events) {
    const answer = event.payload?.answer;
    if (typeof answer !== "string" || !answer) continue;

    const part = question.questionType === "drag-category"
      ? event.payload?.itemId
      : question.questionType === "yes-no"
        ? event.payload?.statementId
        : question.questionType === "most-least"
          ? event.payload?.slot
          : "single";
    if (typeof part !== "string" || !part) continue;

    const previous = previousByPart.get(part);
    if (previous !== undefined && previous !== answer) switches += 1;
    previousByPart.set(part, answer);
  }

  return switches;
}
