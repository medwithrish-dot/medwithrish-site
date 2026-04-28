export type QuestionData = {
  sectionA?: string;
  sectionB?: string;
  passage?: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

export function getStemText(question: QuestionData) {
  if (question.sectionA && question.sectionB) {
    return `${question.sectionA}\n\n${question.sectionB}`;
  }

  return question.passage ?? "";
}

export async function fetchUCATQuestion() {
  const response = await fetch("/api/rishbot/question");

  if (!response.ok) {
    throw new Error("Could not fetch UCAT question");
  }

  return (await response.json()) as QuestionData;
}
