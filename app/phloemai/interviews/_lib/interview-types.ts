export type InterviewMode = "free" | "university" | "station" | "reference";
export type InterviewAnswer = {
  question: string;
  answer: string;
  interviewerIntro?: string;
  interviewerPrompts?: { text: string; answerOffset: number }[];
};
export type InterviewFeedback = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  weaknesses?: string[];
  fixes?: string[];
  rubric: { criterion: string; score: number; reason: string }[];
};
export type InterviewAttempt = {
  id: string;
  mode: InterviewMode;
  universitySlug: string | null;
  stationSlug: string;
  title: string;
  status: "in_progress" | "submitted" | "grading" | "completed" | "failed";
  startedAt: string;
  completedAt: string | null;
  answerSubmittedAt?: string | null;
  preparationSeconds: number;
  stationSeconds: number;
  breakSeconds: number;
  stationIndex: number;
  stationCount: number;
  questions: string[];
  questionIds?: (string | null)[];
  answers: InterviewAnswer[];
  feedback: InterviewFeedback | null;
  metrics: Record<string, number>;
  nextAvailableAt: string | null;
  circuitId: string;
};
