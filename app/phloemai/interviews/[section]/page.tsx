import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { InterviewQuestionBankDashboard } from "../_components/InterviewQuestionBankDashboard";
import { InterviewShell } from "../_components/InterviewShell";
import { AIInterviewRunner } from "../_components/AIInterviewRunner";
import { InterviewGroups } from "../_components/InterviewGroups";
import { InterviewLeaderboard } from "../_components/InterviewLeaderboard";
import { InterviewHistoryViews } from "../_components/InterviewHistoryViews";
import { InterviewGuides } from "../_components/InterviewGuides";

const pages: Record<string, { title: string; subtitle: string; activeLabel: string }> = {
  "ai-interviews": { title: "Your next conversation starts here.", subtitle: "Practise aloud or type your answer. Get thoughtful feedback, one station at a time.", activeLabel: "AI Interviews" },
  "question-bank": { title: "Question Bank", subtitle: "Explore interview questions and practise your answers.", activeLabel: "Question Bank" },
  groups: { title: "Better practice, together.", subtitle: "Bring your friends into a study group and build your confidence as a team.", activeLabel: "Groups" },
  leaderboard: { title: "A little friendly competition.", subtitle: "The free Why medicine? challenge. Real attempts, personal bests, shared progress.", activeLabel: "Leaderboard" },
  guides: { title: "Make room for better answers.", subtitle: "Practical ideas for structuring your thoughts and reflecting on your experience.", activeLabel: "Guides" },
  progress: { title: "See how far you have come.", subtitle: "Your saved interview feedback, brought together. Practice scores are capped at 99%.", activeLabel: "Progress" },
  plan: { title: "One station at a time.", subtitle: "A focused route through five core interview themes.", activeLabel: "Plan" },
  notifications: { title: "Your interview updates.", subtitle: "Pick up a station or explore your latest feedback.", activeLabel: "Dashboard" },
};
type Search = Record<string, string | string[] | undefined>;
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: `${pages[section]?.activeLabel ?? "Med Interviews"} | PhloemAI` };
}
export default async function Page({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Search> }) {
  const { section } = await params;
  const config = pages[section];
  if (!config) notFound();
  const search = await searchParams;
  if (section === "question-bank") {
    const { isPremium } = await getPhloemEntitlements();
    const subcategory = single(search.subcategory);
    return <InterviewQuestionBankDashboard showPremiumCard={!isPremium} initialCategoryTitle={single(search.category)} initialSubcategoryIndex={subcategory === undefined ? undefined : Number(subcategory)} initialQuestionId={single(search.question)} />;
  }
  return <InterviewShell {...config}>
    {section === "ai-interviews" ? <AIInterviewRunner initialUniversitySlug={single(search.university)} initialStationSlug={single(search.station)} />
      : section === "groups" ? <InterviewGroups />
      : section === "leaderboard" ? <InterviewLeaderboard />
      : section === "guides" ? <InterviewGuides />
      : <InterviewHistoryViews view={section as "progress" | "plan" | "notifications"} />}
  </InterviewShell>;
}
