import {
  INTERVIEW_QUESTION_CATEGORIES,
  INTERVIEW_QUESTIONS,
  type InterviewQuestionCategoryTitle,
} from "@/app/medicforest/interview/_data/interviewQuestionBank";

export type InterviewQuestionProgressRow = {
  question_id: string;
  status: string | null;
};

export type InterviewQuestionCategoryProgress = {
  category: InterviewQuestionCategoryTitle;
  label: string;
  completed: number;
  review: number;
  total: number;
  percent: number;
};

const SHORT_LABELS: Record<InterviewQuestionCategoryTitle, string> = {
  "Personal & Motivation": "Personal",
  "Communication & Teamwork": "Communication",
  "Ethics & Professionalism": "Ethics",
  "NHS & Healthcare": "NHS",
  "Hot Topics & Current Affairs": "Hot topics",
  "Data, Research & Critical Thinking": "Data & research",
  "Practical MMI & Role Play": "Practical MMI",
  "Curveballs & Quick-Fire": "Curveballs",
};

function percentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function deriveInterviewQuestionProgress(rows: readonly InterviewQuestionProgressRow[]) {
  const knownQuestionIds = new Set<string>(INTERVIEW_QUESTIONS.map((question) => question.id));
  const completedIds = new Set<string>();
  const reviewIds = new Set<string>();

  for (const row of rows) {
    if (!knownQuestionIds.has(row.question_id)) continue;
    if (row.status === "completed") completedIds.add(row.question_id);
    if (row.status === "review") reviewIds.add(row.question_id);
  }

  const categories: InterviewQuestionCategoryProgress[] = INTERVIEW_QUESTION_CATEGORIES.map((category) => {
    const questions = INTERVIEW_QUESTIONS.filter((question) => question.category === category);
    const completed = questions.filter((question) => completedIds.has(question.id)).length;
    const review = questions.filter((question) => reviewIds.has(question.id)).length;
    return {
      category,
      label: SHORT_LABELS[category],
      completed,
      review,
      total: questions.length,
      percent: percentage(completed, questions.length),
    };
  });
  const total = INTERVIEW_QUESTIONS.length;
  const completed = completedIds.size;

  return {
    categories,
    completed,
    review: reviewIds.size,
    total,
    percent: percentage(completed, total),
  };
}
