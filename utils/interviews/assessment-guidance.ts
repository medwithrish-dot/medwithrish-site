import { findReviewQuestion, getQuestionMarkScheme } from "@/app/phloemai/interview/_lib/question-review";
import { getQuestionStimulus } from "@/app/phloemai/interview/_data/interview-stimuli";

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
      stimulus: stimulus ? { title: stimulus.title, facts: stimulus.description } : null,
    }];
  });
}
