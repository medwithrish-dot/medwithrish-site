import type { InterviewQuestion } from "@/app/medicforest/interview/_data/interviewQuestionBank";
import type { InterviewUniversity } from "@/app/medicforest/interview/_data/universities";
import { INTERVIEW_QUESTIONS } from "@/app/medicforest/interview/_data/interviewQuestionBank";
import { interviewStations, interviewSetupStations } from "@/app/medicforest/interview/_data/interview-stations";
import { interviewUniversities } from "@/app/medicforest/interview/_data/universities";
import { DENTISTRY_QUESTIONS, DENTISTRY_STATIONS } from "@/app/medicforest/interview/_data/dentistry-question-bank";
import { dentistryUniversities } from "@/app/medicforest/interview/_data/dentistry-universities";
import { universityStationSlugs } from "@/app/medicforest/interview/_data/university-stations";
import type { InterviewPlatform } from "./platform";

export const questionsForPlatform = (platform: InterviewPlatform): readonly InterviewQuestion[] => platform === "dentistry" ? DENTISTRY_QUESTIONS : INTERVIEW_QUESTIONS;
export type InterviewStation = { slug: string; title: string; lobbyTitle: string; theme: string; questions: readonly string[] };
export const stationsForPlatform = (platform: InterviewPlatform): readonly InterviewStation[] => platform === "dentistry" ? DENTISTRY_STATIONS : interviewStations;
export const setupStationsForPlatform = (platform: InterviewPlatform): readonly InterviewStation[] => platform === "dentistry" ? DENTISTRY_STATIONS : interviewSetupStations;
export const universitiesForPlatform = (platform: InterviewPlatform): readonly InterviewUniversity[] => platform === "dentistry" ? dentistryUniversities : interviewUniversities;
export const motivationStation = (platform: InterviewPlatform) => platform === "dentistry" ? "why-dentistry" : "why-medicine";
export function platformUniversityStations(platform: InterviewPlatform, slug?: string) {
  if (platform === "medicine") return universityStationSlugs(slug);
  return slug && dentistryUniversities.some(u => u.slug === slug)
    ? ["why-dentistry", "dental-experience", "dental-communication", "dental-ethics", "dental-access"] : [];
}
