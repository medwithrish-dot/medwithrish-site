export type QuestionData = {
  sectionA?: string;
  sectionB?: string;
  passage?: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

export function getPassageSections(question: QuestionData) {
  if (question.sectionA && question.sectionB) {
    return {
      sectionA: question.sectionA,
      sectionB: question.sectionB,
    };
  }

  const passage = question.passage ?? "";
  const paragraphs = passage
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) {
    return {
      sectionA: paragraphs[0],
      sectionB: paragraphs.slice(1).join("\n\n"),
    };
  }

  const midpoint = Math.ceil(passage.length / 2);
  const splitAt = passage.indexOf(". ", midpoint);
  const fallbackSplit = splitAt > 0 ? splitAt + 1 : midpoint;

  return {
    sectionA: passage.slice(0, fallbackSplit).trim(),
    sectionB: passage.slice(fallbackSplit).trim(),
  };
}

export async function fetchUCATQuestion(signal?: AbortSignal) {
  const response = await fetch("/api/rishbot/question", { signal });

  if (!response.ok) {
    throw new Error("Could not fetch UCAT question");
  }

  return (await response.json()) as QuestionData;
}
