import type { InterviewAttempt } from "./interview-types";

export const QUESTION_BANK_FEEDBACK_STATION = "question-bank-feedback";
export const FREE_QUESTION_FEEDBACK_USED = "You've used your free AI feedback report. Upgrade to Premium for more personalised feedback.";
export type QuestionFeedbackAccess = {
  isPremium: boolean;
  freeUsed: boolean;
  attempt: InterviewAttempt | null;
};
