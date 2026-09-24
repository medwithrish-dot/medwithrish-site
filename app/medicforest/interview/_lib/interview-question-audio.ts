import { INTERVIEW_QUESTIONS } from "../_data/interviewQuestionBank";

export type InterviewerVoice = "female" | "male";

// questions.csv rows 1-561 are the interview bank in this exact order. The
// remaining rows are authored station/guide prompts that do not have bank IDs.
const SUPPLEMENTAL_AUDIO_QUESTIONS = [
  "Why do you want to study medicine and become a doctor?",
  "Which experience most challenged or strengthened your motivation, and what did you learn from it?",
  "Why does the role of a doctor suit you, and how have you explored its challenges and other healthcare careers?",
  "Tell me about an experience that helped you understand caring for others. What did you learn?",
  "Describe teamwork or communication you observed. How could you apply that learning?",
  "What surprised you about healthcare, and how has it changed your expectations of medicine?",
  "How should medical schools ensure disabled applicants have a fair opportunity to study medicine?",
  "How would you approach reasonable adjustments while maintaining essential professional competencies and patient safety?",
  "An applicant is judged on assumptions about their disability. How should the admissions team respond?",
  "What do equality, diversity and inclusion mean to you in medicine?",
  "Can you give an example where equitable care requires treating patients differently?",
  "How would you respond if you witnessed a discriminatory remark during a placement?",
  "What opportunities and concerns do medicines such as Ozempic raise for healthcare and society?",
  "How would you discuss evidence, risks, stigma and fair access without assuming a medicine is suitable for everyone?",
  "What information would you check before making claims about indications, availability or long-term outcomes?",
  "A friend asks you about a patient you met on work experience. How would you respond?",
  "What would you do if you believed someone might be at risk of serious harm?",
  "Who would you seek support from, and how would you explain your approach to the patient?",
  "How do long waiting lists affect patients, staff and the wider health service?",
  "How should a service balance clinical urgency with fairness when prioritising patients?",
  "What would you consider when evaluating a proposal to reduce waiting times?",
  "Tell me about a disagreement in a team and how you approached it.",
  "How did you make sure quieter members could contribute?",
  "What would you do differently next time, and why?",
  "Which experience most strengthened or challenged your motivation for medicine, and why?",
  "How would you adapt if a teaching method at this university challenged your usual way of learning?",
  "Tell me about something from your experience that changed your expectations of healthcare.",
  "Tell me about a setback and one change you made afterwards.",
  "How would you explain an unfamiliar process to someone who feels anxious?",
  "Describe a time you helped a team succeed without being its leader.",
  "What would you do if a team member repeatedly interrupted someone else?",
  "What feedback was difficult to hear, and how did you respond?",
  "What can go wrong at the boundary between hospital and community care?",
  "A colleague asks you to conceal a mistake. How would you respond?",
  "How would you respond if an adult refused treatment that the team strongly recommended?",
  "You notice a possible medication error while on placement. What would you do?",
  "How should a medical school respond to assumptions about a disabled applicant's abilities?",
  "What safeguards would you consider when discussing assisted dying?",
  "What are the opportunities and limitations of an opt-out donation system?",
  "Why can pressures in social care affect hospital waiting times?",
  "When might treating every patient in exactly the same way be unfair?",
  "Why might more screening not always lead to better health?",
  "How should a health service decide whether to fund an expensive new treatment?",
  "How can a service reduce waits while protecting patient safety and fairness?",
  "What would make a shift from hospital to community care successful?",
  "What would you need to know before trusting an AI system to support diagnosis?",
  "How should the NHS balance demand, evidence and fair access to weight-management medicines?",
  "What questions would you ask about a headline claiming a new treatment is a breakthrough?",
  "What should a hospital consider before introducing a new professional role?",
  "What can the Bawa-Garba case teach us about patient safety and accountability?",
  "Which lessons from COVID-19 would you prioritise for the next pandemic?",
  "What could a health service do to reduce barriers to mental healthcare?",
  "What ethical questions can arise when a genetic result also matters to a patient's family?",
  "Why does antimicrobial resistance require action beyond individual doctors?",
  "How would you approach a conversation with someone who is unsure about vaccination?",
  "How can public-health policy balance harm reduction with preventing youth vaping?",
  "Why should climate change be part of a discussion about health inequalities?",
  "How would you evaluate a plan to make all appointment booking digital?",
  "A risk falls from 2 in 100 to 1 in 100. Explain the change in two different ways.",
  "What would make you cautious about applying a trial result to every patient?",
  "What information would make you change your mind about a healthcare policy you currently support?",
  "Help a worried peer who thinks a recent setback means they cannot succeed.",
  "How would you help a group reach a decision when time is running out?",
  "How would you prioritise several requests when one may involve immediate harm?",
  "What is one belief you have reconsidered, and what changed your view?",
  "If you could introduce one change to improve your community's health, what would it be?",
  "Why do you want to study medicine?",
  "What experience helped you understand what being a doctor involves?",
  "What challenges do you expect, and how would you manage them?",
  "Tell us about an experience that changed your understanding of healthcare.",
  "What did you learn about teamwork and communication?",
  "How will you apply that learning as a medical student?",
  "How should medical schools support disabled applicants and students while maintaining safe professional standards?",
  "How would you approach reasonable adjustments, fairness and patient safety?",
  "What assumptions should an admissions team avoid?",
  "What do equality, diversity and inclusion mean in healthcare?",
  "Describe how a doctor could respond to discrimination within a team.",
  "How can fair access and individual patient needs be considered together?",
  "What ethical issues arise when discussing Ozempic and other medicines used for weight management?",
  "How would you weigh equitable access, individual circumstances and limited resources?",
  "How would you discuss a public health headline while recognising the limits of your knowledge?",
] as const;

export const INTERVIEW_AUDIO_QUESTION_COUNT = INTERVIEW_QUESTIONS.length + SUPPLEMENTAL_AUDIO_QUESTIONS.length;

const questionNumberById = new Map<string, number>(
  INTERVIEW_QUESTIONS.map((question, index) => [question.id, index + 1]),
);
const questionNumberByText = new Map<string, number>([
  ...INTERVIEW_QUESTIONS.map((question, index) => [question.text, index + 1] as const),
  ...SUPPLEMENTAL_AUDIO_QUESTIONS.map((question, index) => [question, INTERVIEW_QUESTIONS.length + index + 1] as const),
]);

export function getInterviewQuestionAudioSrc(
  questionId: string | null | undefined,
  questionText: string,
  voice: InterviewerVoice,
) {
  const questionNumber = (questionId ? questionNumberById.get(questionId) : undefined)
    ?? questionNumberByText.get(questionText);
  return questionNumber
    ? `/audio/${voice}/q${String(questionNumber).padStart(3, "0")}.mp3`
    : undefined;
}
