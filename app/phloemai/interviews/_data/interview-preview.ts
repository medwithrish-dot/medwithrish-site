import type { InterviewFeedback } from "../_lib/interview-types";

/** Illustrative content for the explicitly labelled, unsaved room preview only. */
export const previewInterviewFeedback: InterviewFeedback = {
  score: 76,
  summary: "An example of a thoughtful answer with clear motivation and a personal perspective. The next opportunity is to connect each experience to what it taught you about the realities of medicine.",
  strengths: ["Grounding your motivation in a specific experience makes it easier to understand your perspective.", "Recognising the contribution of the wider healthcare team shows a realistic view of patient care.", "Reflecting on a challenge helps explain how your understanding has developed."],
  improvements: ["Choose one experience and finish with exactly what you learned and what you would do differently.", "Connect your example to the responsibilities of a doctor, including the difficult parts of the role.", "Give your answer a clear closing sentence that returns to the question."],
  rubric: [
    { criterion: "Relevance and motivation", score: 85, reason: "Example: a clear reason for pursuing medicine, with room to explain why the doctor's role is the right fit." },
    { criterion: "Reflection and insight", score: 78, reason: "Example: describes learning from experience; a more specific change in understanding would add depth." },
    { criterion: "Structure and clarity", score: 82, reason: "Example: ideas follow a clear order; a concise conclusion would tie them together." },
    { criterion: "Professional awareness", score: 81, reason: "Example: recognises teamwork and care, with scope to discuss the challenges of practice." },
    { criterion: "Evidence and examples", score: 80, reason: "Example: uses a relevant experience; more detail about personal actions would strengthen the evidence." },
  ],
};
