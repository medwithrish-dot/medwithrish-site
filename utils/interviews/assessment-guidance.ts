import { findReviewQuestion, getQuestionMarkScheme } from "@/app/medicforest/interview/_lib/question-review";
import { getQuestionStimulus } from "@/app/medicforest/interview/_data/interview-stimuli";

/** Built from server-owned question IDs and authored content, never client rubrics. */
export function assessmentGuidance(questions: readonly { question: string; id?: string | null }[]) {
  return questions.flatMap(({ question: text, id }) => {
    const question = findReviewQuestion(id, text);
    if (!question) return [];
    const stimulus = getQuestionStimulus(question.id);
    return [{
      questionId: question.id,
      askedQuestion: text,
      markingSections: getQuestionMarkScheme(question),
      checklistPoints: getQuestionMarkScheme(question).filter(section => section.title !== "Mistakes").flatMap(section => section.items.map(item => ({ id: `${section.title}-${item}`, label: item }))),
      stimulus: stimulus ? { title: stimulus.title, facts: stimulus.description } : null,
    }];
  });
}
