export const interviewStations = [
  { slug: "why-medicine", title: "Why medicine?", theme: "Motivation", questions: [
    "Why do you want to study medicine and become a doctor?",
    "Which experience most challenged or strengthened your motivation, and what did you learn from it?",
    "Why does the role of a doctor suit you, and how have you explored its challenges and other healthcare careers?",
  ] },
  { slug: "work-experience", title: "Work experience and reflection", theme: "Reflection", questions: [
    "Tell me about an experience that helped you understand caring for others. What did you learn?",
    "Describe teamwork or communication you observed. How could you apply that learning?",
    "What surprised you about healthcare, and how has it changed your expectations of medicine?",
  ] },
  { slug: "disability-in-medicine", title: "Disability and access to medicine", theme: "Ethics", questions: [
    "How should medical schools ensure disabled applicants have a fair opportunity to study medicine?",
    "How would you approach reasonable adjustments while maintaining essential professional competencies and patient safety?",
    "An applicant is judged on assumptions about their disability. How should the admissions team respond?",
  ] },
  { slug: "equality-diversity-inclusion", title: "Equality, diversity and inclusion", theme: "Ethics", questions: [
    "What do equality, diversity and inclusion mean to you in medicine?",
    "Can you give an example where equitable care requires treating patients differently?",
    "How would you respond if you witnessed a discriminatory remark during a placement?",
  ] },
  { slug: "ozempic", title: "Hot topic: Ozempic and weight management", theme: "Hot topics", questions: [
    "What opportunities and concerns do medicines such as Ozempic raise for healthcare and society?",
    "How would you discuss evidence, risks, stigma and fair access without assuming a medicine is suitable for everyone?",
    "What information would you check before making claims about indications, availability or long-term outcomes?",
  ] },
  { slug: "ethics-confidentiality", title: "Ethics: confidentiality", theme: "Ethics", questions: [
    "A friend asks you about a patient you met on work experience. How would you respond?",
    "What would you do if you believed someone might be at risk of serious harm?",
    "Who would you seek support from, and how would you explain your approach to the patient?",
  ] },
  { slug: "nhs-waiting-lists", title: "NHS waiting lists", theme: "NHS knowledge", questions: [
    "How do long waiting lists affect patients, staff and the wider health service?",
    "How should a service balance clinical urgency with fairness when prioritising patients?",
    "What would you consider when evaluating a proposal to reduce waiting times?",
  ] },
  { slug: "teamwork-group-discussion", title: "Teamwork and disagreement", theme: "Teamwork", questions: [
    "Tell me about a disagreement in a team and how you approached it.",
    "How did you make sure quieter members could contribute?",
    "What would you do differently next time, and why?",
  ] },
  { slug: "data-analysis", title: "Data and evidence", theme: "Analysis", questions: [
    "A service reports that missed appointments fell from 20 out of 100 appointments to 15 out of 100. Explain this change clearly.",
    "What other information would you need before concluding that a reminder system caused the improvement?",
    "How would you explain the uncertainty to a patient representative?",
  ] },
] as const;

export function findInterviewStation(slug: string) {
  const aliases: Record<string, string> = { "motivation-question": "why-medicine", "ethics-ai-station": "disability-in-medicine" };
  return interviewStations.find((station) => station.slug === (aliases[slug] ?? slug));
}
