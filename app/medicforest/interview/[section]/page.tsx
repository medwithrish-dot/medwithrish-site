import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { AIInterviewLanding } from "../_components/AIInterviewLanding";
import { InterviewQuestionBankDashboard } from "../_components/InterviewQuestionBankDashboard";
import { InterviewShell } from "../_components/InterviewShell";
import { AIInterviewRunner } from "../_components/AIInterviewRunner";
import { InterviewGroups } from "../_components/InterviewGroups";
import { InterviewLeaderboard } from "../_components/InterviewLeaderboard";
import { InterviewPreparationViews } from "../_components/InterviewPreparationViews";
import { InterviewGuides } from "../_components/InterviewGuides";
import { isAcademicInterview } from "../_data/university-stations";

const pages: Record<string, { title: string; subtitle: string; activeLabel: string }> = {
  "ai-interviews": { title: "Start AI Interview Practice", subtitle: "Choose the free station, a university preset, or a focused interview topic.", activeLabel: "AI Interviews" },
  "question-bank": { title: "Question Bank", subtitle: "Explore interview questions and practise your answers.", activeLabel: "Question Bank" },
  groups: { title: "Better practice, together.", subtitle: "Bring your friends into a study group and build your confidence as a team.", activeLabel: "Groups" },
  leaderboard: { title: "The free AI interview challenge", subtitle: "Try the Why Medicine? station and beat Medwithrish’s score of 96%.", activeLabel: "Leaderboard" },
  guides: { title: "Interview guide library", subtitle: "Search explanations, station techniques and hot topics. Start with a featured guide or explore a subject.", activeLabel: "Guides" },
  progress: { title: "See how far you have come.", subtitle: "Your saved interview feedback, brought together. Practice scores are capped at 99%.", activeLabel: "Progress" },
  plan: { title: "One station at a time.", subtitle: "Master seven core stations with guides and practice questions, then move on to mock interviews.", activeLabel: "Plan" },
  notifications: { title: "Your interview updates.", subtitle: "Pick up a station or explore your latest feedback.", activeLabel: "Dashboard" },
};
type Search = Record<string, string | string[] | undefined>;
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: `${pages[section]?.activeLabel ?? "Med Interviews"} | MedicForest` };
}
export default async function Page({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Search> }) {
  const { section } = await params;
  const config = pages[section];
  if (!config) notFound();
  const search = await searchParams;
  if (section === "ai-interviews" && isAcademicInterview(single(search.university)) && !single(search.attempt)) {
    return <InterviewShell {...config}><p className="mb-5 text-sm text-[#526b72]">Oxford and Cambridge academic interviews will have a separate interview format.</p><AIInterviewLanding /></InterviewShell>;
  }
  if (section === "question-bank") {
    const { isPremium } = await getMedicForestEntitlements();
    const subcategory = single(search.subcategory);
    return <InterviewQuestionBankDashboard showPremiumCard={!isPremium} initialCategoryTitle={single(search.category)} initialSubcategoryIndex={subcategory === undefined ? undefined : Number(subcategory)} initialQuestionId={single(search.question)} />;
  }
  return <InterviewShell {...config} heroHeader={section === "ai-interviews"}>
    {section === "ai-interviews" ? (single(search.attempt) || single(search.university) || single(search.station) || single(search.setup)
      ? <AIInterviewRunner initialUniversitySlug={single(search.university)} initialStationSlug={single(search.station)} initialMockCircuit={single(search.setup) === "mock"} />
      : <AIInterviewLanding />)
      : section === "groups" ? <InterviewGroups />
      : section === "leaderboard" ? <InterviewLeaderboard />
      : section === "guides" ? <InterviewGuides />
      : <InterviewPreparationViews view={section as "progress" | "plan" | "notifications"} />}
  </InterviewShell>;
}
