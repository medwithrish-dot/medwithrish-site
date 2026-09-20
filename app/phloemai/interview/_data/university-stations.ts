import { findInterviewUniversity, interviewUniversities } from "./universities";
import type { interviewStations } from "./interview-stations";

type StationSlug = (typeof interviewStations)[number]["slug"];
type Preset = { stations: StationSlug[]; source: string };

export const isAcademicInterview = (slug: string | null | undefined) => slug === "oxford" || slug === "cambridge";
export const standardInterviewUniversities = interviewUniversities.filter((university) => !isAcademicInterview(university.slug));

// Mappings are our practice-topic interpretation of published criteria, not a
// claim to reproduce confidential stations. No evidence means no automatic ticks.
// Checked 2026-09-16; retain the exact source with each mapping.
export const universityStationPresets: Record<string, Preset> = {
  manchester: { stations: ["why-medicine", "work-experience", "ozempic", "ethics-confidentiality"], source: "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/" },
  birmingham: { stations: ["why-medicine", "work-experience", "equality-diversity-inclusion", "ethics-confidentiality", "data-analysis"], source: "https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates" },
  "imperial-college-london": { stations: ["why-medicine", "work-experience", "ethics-confidentiality", "teamwork-group-discussion"], source: "https://www.imperial.ac.uk/medicine/study/undergraduate/medicine-mbbs-programmes/mmi/" },
  "kings-college-london": { stations: ["why-medicine", "equality-diversity-inclusion", "ethics-confidentiality"], source: "https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements" },
  "anglia-ruskin": { stations: ["why-medicine", "work-experience", "ethics-confidentiality"], source: "https://www.aru.ac.uk/study/admissions/interviews-auditions-and-portfolios/medicine-interview-process" },
  dundee: { stations: ["teamwork-group-discussion", "equality-diversity-inclusion"], source: "https://www.dundee.ac.uk/undergraduate/medicine/interview" },
  southampton: { stations: ["why-medicine", "work-experience", "teamwork-group-discussion"], source: "https://www.southampton.ac.uk/medicine/undergraduate/apply.page" },
  "hull-york": { stations: ["why-medicine", "ozempic", "ethics-confidentiality", "nhs-waiting-lists", "teamwork-group-discussion"], source: "https://www.hyms.ac.uk/medicine/interviews" },
  cardiff: { stations: ["why-medicine", "ethics-confidentiality", "nhs-waiting-lists", "teamwork-group-discussion"], source: "https://www.cardiff.ac.uk/documents/2734195-admissions-information-for-studying-medicine-at-cardiff" },
};

export function universityStationSlugs(slug: string | undefined): string[] {
  const university = findInterviewUniversity(slug);
  return [...(universityStationPresets[university?.slug ?? ""]?.stations ?? [])];
}
