/** Pure validation shared by the provider adapter and route tests. */
export function validateFollowUp(value: unknown, existingQuestions: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid follow-up");
  const question = (value as { question?: unknown }).question;
  if (typeof question !== "string") throw new Error("Invalid follow-up");
  const trimmed = question.trim();
  if (trimmed.length < 15 || trimmed.length > 320 || trimmed.split(/\s+/).length > 55 ||
      !trimmed.endsWith("?") || (trimmed.match(/\?/g) ?? []).length !== 1 ||
      /[\r\n<>`]|https?:\/\//i.test(trimmed) ||
      existingQuestions.some((existing) => existing.trim().toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("Invalid follow-up");
  }
  return trimmed;
}

/** A labelled practice prompt remains available if the provider is busy. */
export function practiceFollowUp(answer: string, questionNumber: number) {
  const text = answer.toLowerCase();
  const options = /confidential|consent|privacy|patient information/.test(text)
    ? ["What would guide your decision if respecting confidentiality appeared to conflict with protecting someone from harm?", "How would you seek appropriate support while sharing only the information that was necessary?", "What would you explain to the person involved before taking your next step?"]
    : /team|colleague|listen|communicat/.test(text)
      ? ["What did your own contribution change in that situation, and how do you know?", "How would you adapt your approach if another team member saw the situation differently?", "What would you do differently in a similar situation, based on what you learned?"]
      : /fair|equit|equal|disab|discriminat|access/.test(text)
        ? ["How would you find out what support the individual actually needed before deciding on an approach?", "What would you consider if two people's needs appeared to conflict?", "How would you check whether your proposed approach was fair in practice?"]
        : /data|evidence|research|percent|statistic/.test(text)
          ? ["What additional evidence would most strengthen or change the conclusion you have drawn?", "What alternative explanation would you want to rule out before accepting that conclusion?", "How would you communicate the uncertainty in your answer to someone without a scientific background?"]
          : ["Which specific experience best supports the point you have made, and what did it teach you?", "What challenged your initial assumptions in that experience?", "How would the learning you have described change your approach as a medical student?"];
  return options[questionNumber % options.length];
}

// A server-owned marker in the existing nullable error field keeps provider calls
// bounded across processes. Answer autosaves never write this field. Grading clears
// it only once the attempt leaves in_progress, when follow-ups are no longer allowed.
export function followUpClaimMask(marker: unknown) {
  if (marker === null || marker === undefined) return 0;
  if (typeof marker !== "string" || !/^ai_followup:[0-7]$/.test(marker)) throw new Error("Invalid follow-up state");
  return Number(marker.slice("ai_followup:".length));
}

export function existingFollowUp(questions: readonly string[], mainQuestion: string, originals: readonly string[]) {
  const index = questions.indexOf(mainQuestion);
  const next = questions[index + 1];
  return index >= 0 && next && !originals.includes(next) ? next : null;
}
