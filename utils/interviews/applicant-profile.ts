export type ApplicantProfile = {
  entryRoute: "undergraduate" | "graduate" | null;
  gapYear: boolean | null;
  previousDegree: boolean | null;
  workExperience: boolean | null;
  volunteering: boolean | null;
  reapplicant: boolean | null;
  international: boolean | null;
  careerChanger: boolean | null;
};

export const emptyApplicant: ApplicantProfile = {
  entryRoute: null, gapYear: null, previousDegree: null, workExperience: null,
  volunteering: null, reapplicant: null, international: null, careerChanger: null,
};

export function readApplicant(value: unknown): ApplicantProfile {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    entryRoute: input.entryRoute === "graduate" || input.entryRoute === "undergraduate" ? input.entryRoute : null,
    ...Object.fromEntries(Object.keys(emptyApplicant).filter((key) => key !== "entryRoute")
      .map((key) => [key, typeof input[key] === "boolean" ? input[key] : null])),
  } as ApplicantProfile;
}

// Personal-history questions require an explicit saved confirmation. Hypothetical
// patient scenarios and general questions about medical degrees remain available.
export function questionEligible(text: string, profile: ApplicantProfile = emptyApplicant) {
  if (/\bgap[ -]year\b/i.test(text) && profile.gapYear !== true) return false;
  if (/(?:your|previous|prior|first|completed|undergraduate) degree|degree (?:you|has taught)|you(?:'ve| have) (?:already )?graduated/i.test(text) && profile.previousDegree !== true) return false;
  if (/\bgraduate[ -]entry\b|as a graduate|graduate applicant/i.test(text) && profile.entryRoute !== "graduate") return false;
  if (/your (?:work experience|clinical exposure|placement)|(?:you|you've|you have) (?:learned|learnt|observed|seen).{0,50}(?:placement|work experience)|during your (?:placement|clinical)/i.test(text) && profile.workExperience !== true) return false;
  if (/your volunteer|your volunteering|you.{0,25}(?:learned|learnt).{0,30}volunteer/i.test(text) && profile.volunteering !== true) return false;
  if (/you gained through employment or volunteering/i.test(text) && profile.workExperience !== true && profile.volunteering !== true && profile.careerChanger !== true) return false;
  if (/as (?:an? )?reapplicant|your previous application|since (?:your last|you last) appli/i.test(text) && profile.reapplicant !== true) return false;
  if (/as an international|your home country|why.{0,25}(?:leave your country|study in the uk)/i.test(text) && profile.international !== true) return false;
  if (/your previous career|changing careers|leaving your career/i.test(text) && profile.careerChanger !== true) return false;
  return true;
}
