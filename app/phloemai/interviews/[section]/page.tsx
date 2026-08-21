import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InterviewWorkspacePage,
  type InterviewWorkspacePageProps,
} from "../_components/InterviewWorkspacePage";
import { InterviewQuestionBankDashboard } from "../_components/InterviewQuestionBankDashboard";
import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";

const sectionPages = {
  "ai-interviews": {
    title: "AI Interviews",
    subtitle:
      "Run timed interview stations, review model feedback and build a steady MMI routine.",
    activeLabel: "AI Interviews",
    primaryAction: {
      title: "Ethics - Confidentiality",
      description: "8 minute station focused on patient confidentiality.",
      href: "/phloemai/interviews/stations/ethics-confidentiality",
      action: "Start station",
    },
    cards: [
      {
        title: "Scenario queue",
        description: "Ethics, teamwork, motivation and hot topic stations.",
        href: "/phloemai/interviews/plan",
        action: "Open queue",
      },
      {
        title: "University mode",
        description: "Practise with station styles matched to target schools.",
        href: "/phloemai/interviews/universities",
        action: "Choose school",
      },
      {
        title: "Recent feedback",
        description: "Revisit your latest interview marks and action points.",
        href: "/phloemai/interviews/reports",
        action: "View feedback",
      },
    ],
    rows: [
      {
        label: "Ethics AI station",
        meta: "8 mins",
        href: "/phloemai/interviews/stations/ethics-ai-station",
      },
      {
        label: "Motivation question",
        meta: "Completed today",
        href: "/phloemai/interviews/stations/motivation-question",
      },
      {
        label: "Hot topic: NHS waiting lists",
        meta: "8 mins",
        href: "/phloemai/interviews/stations/nhs-waiting-lists",
      },
    ],
  },
  "question-bank": {
    title: "Question Bank",
    subtitle:
      "Browse interview prompts by theme, station type and university style.",
    activeLabel: "Question Bank",
    primaryAction: {
      title: "Ethics question set",
      description: "Confidentiality, capacity, consent and prioritisation.",
      href: "/phloemai/interviews/stations/ethics-confidentiality",
      action: "Open set",
    },
    cards: [
      {
        title: "Your next best action",
        description: "Ethics - Confidentiality. Start with the prompt that best targets your weaker area.",
        href: "/phloemai/interviews/stations/ethics-confidentiality",
        action: "Start station",
      },
      {
        title: "Your interviews",
        description: "Manchester, Sheffield and Birmingham prompts grouped with readiness scores.",
        href: "/phloemai/interviews/universities",
        action: "View schools",
      },
      {
        title: "Today's plan",
        description: "Motivation question, Ethics AI station and NHS waiting-list topic.",
        href: "/phloemai/interviews/plan",
        action: "Open plan",
      },
      {
        title: "Strengths & weaknesses",
        description: "Communication, motivation, teamwork, ethics, NHS knowledge and hot topics.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
      },
      {
        title: "Recent performance",
        description: "Manchester Mock #2, ethics allocation and personal why reports.",
        href: "/phloemai/interviews/reports",
        action: "View reports",
      },
      {
        title: "Weekly insight",
        description: "A quick summary of what improved and what to practise next.",
        href: "/phloemai/interviews/reports",
        action: "See insight",
      },
    ],
  },
  guides: {
    title: "Guides",
    subtitle:
      "Structured interview notes for MMI technique, ethics, NHS knowledge and school-specific preparation.",
    activeLabel: "Guides",
    primaryAction: {
      title: "MMI fundamentals",
      description: "Clear structure for reading, planning and answering stations.",
      href: "/phloemai/interviews/ai-interviews",
      action: "Practise now",
    },
    cards: [
      {
        title: "Ethics guide",
        description: "Autonomy, beneficence, confidentiality and escalation.",
        href: "/phloemai/interviews/stations/ethics-confidentiality",
        action: "Open guide",
      },
      {
        title: "University guide",
        description: "Keep track of formats, timings and themes by school.",
        href: "/phloemai/interviews/universities",
        action: "Open guide",
      },
      {
        title: "Report guide",
        description: "Turn feedback into specific follow-up practice.",
        href: "/phloemai/interviews/reports",
        action: "Open reports",
      },
    ],
  },
  groups: {
    title: "Groups",
    subtitle:
      "Find peer practice rooms, group discussions and shared interview prep sessions.",
    activeLabel: "Groups",
    primaryAction: {
      title: "Teamwork practice",
      description: "Group discussion prompts and teamwork scoring notes.",
      href: "/phloemai/interviews/stations/teamwork-group-discussion",
      action: "Open room",
    },
    cards: [
      {
        title: "Manchester room",
        description: "Applicants preparing for Manchester MMI stations.",
        href: "/phloemai/interviews/universities/manchester",
        action: "Open group",
      },
      {
        title: "Ethics circle",
        description: "Short peer debates and scenario walkthroughs.",
        href: "/phloemai/interviews/stations/ethics-ai-station",
        action: "Open group",
      },
      {
        title: "Leaderboard",
        description: "Weekly consistency and practice streaks.",
        href: "/phloemai/interviews/leaderboard",
        action: "View board",
      },
    ],
  },
  leaderboard: {
    title: "Leaderboard",
    subtitle:
      "Track weekly consistency across interview stations, reports and group practice.",
    activeLabel: "Leaderboard",
    stats: [
      { label: "Weekly rank", value: "#12" },
      { label: "Stations", value: "9" },
      { label: "Streak", value: "4 days" },
    ],
    primaryAction: {
      title: "Improve your rank",
      description: "Complete today's plan to add another station to your score.",
      href: "/phloemai/interviews/plan",
      action: "Open plan",
    },
    cards: [
      {
        title: "Top improver",
        description: "Rishoo improved by 6% this week.",
        href: "/phloemai/interviews/reports",
        action: "View report",
      },
      {
        title: "Group standings",
        description: "Compare station completion across practice groups.",
        href: "/phloemai/interviews/groups",
        action: "View groups",
      },
      {
        title: "Progress",
        description: "See score movement by interview theme.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
      },
    ],
  },
  plan: {
    title: "Today's Plan",
    subtitle:
      "A focused set of interview tasks for your next session.",
    activeLabel: "Dashboard",
    primaryAction: {
      title: "Ethics AI station",
      description: "8 minute scenario with feedback after completion.",
      href: "/phloemai/interviews/stations/ethics-ai-station",
      action: "Start task",
    },
    cards: [
      {
        title: "Motivation question",
        description: "Completed. Review your wording and mark scheme.",
        href: "/phloemai/interviews/stations/motivation-question",
        action: "Review",
      },
      {
        title: "Hot topic",
        description: "NHS waiting lists and resource pressure.",
        href: "/phloemai/interviews/stations/nhs-waiting-lists",
        action: "Start",
      },
      {
        title: "Full report",
        description: "See where today's work changes your readiness.",
        href: "/phloemai/interviews/reports",
        action: "Open report",
      },
    ],
  },
  progress: {
    title: "Progress",
    subtitle:
      "Review readiness, strengths and weaker themes across your interview preparation.",
    activeLabel: "Progress",
    stats: [
      { label: "Overall", value: "78%" },
      { label: "Best theme", value: "Communication" },
      { label: "Next focus", value: "Ethics" },
    ],
    primaryAction: {
      title: "Strengths and weaknesses",
      description: "Communication 84%, Motivation 79%, Ethics 72%.",
      href: "/phloemai/interviews/reports",
      action: "Open report",
    },
    cards: [
      {
        title: "Ethics",
        description: "Prioritise confidentiality and resource allocation.",
        href: "/phloemai/interviews/stations/ethics-confidentiality",
        action: "Practise",
      },
      {
        title: "NHS knowledge",
        description: "Refresh waiting lists, workforce and funding themes.",
        href: "/phloemai/interviews/stations/nhs-waiting-lists",
        action: "Practise",
      },
      {
        title: "Recent performance",
        description: "Open the most recent station-level reports.",
        href: "/phloemai/interviews/reports",
        action: "View all",
      },
    ],
  },
  notifications: {
    title: "Notifications",
    subtitle:
      "Interview reminders, station feedback and plan updates in one place.",
    activeLabel: "Dashboard",
    primaryAction: {
      title: "Manchester interview reminder",
      description: "18 days remaining. Your next school-specific station is ready.",
      href: "/phloemai/interviews/universities/manchester",
      action: "Open reminder",
    },
    cards: [
      {
        title: "Feedback ready",
        description: "Manchester Mock #2 has new action points.",
        href: "/phloemai/interviews/reports/manchester-mock-2",
        action: "View feedback",
      },
      {
        title: "Plan update",
        description: "Ethics AI station added to today's plan.",
        href: "/phloemai/interviews/plan",
        action: "Open plan",
      },
      {
        title: "Group invite",
        description: "A new peer practice group is available.",
        href: "/phloemai/interviews/groups",
        action: "Open groups",
      },
    ],
  },
} satisfies Record<string, InterviewWorkspacePageProps>;

const sectionPageMap: Record<string, InterviewWorkspacePageProps | undefined> =
  sectionPages;

type QuestionBankSearchParams = {
  category?: string | string[];
  subcategory?: string | string[];
  question?: string | string[];
};

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];

  return value;
}

export function generateStaticParams() {
  return Object.keys(sectionPages).map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const page = sectionPageMap[section];

  return {
    title: `${page?.title ?? "Med Interviews"} | PhloemAI`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<QuestionBankSearchParams>;
}) {
  const { section } = await params;
  const page = sectionPageMap[section];

  if (!page) notFound();

  if (section === "question-bank") {
    const questionBankSearchParams = await searchParams;
    const subcategoryParam = getSingleSearchParam(
      questionBankSearchParams.subcategory
    );
    const { isPremium } = await getPhloemEntitlements();

    return (
      <InterviewQuestionBankDashboard
        showPremiumCard={!isPremium}
        initialCategoryTitle={getSingleSearchParam(
          questionBankSearchParams.category
        )}
        initialSubcategoryIndex={
          subcategoryParam === undefined ? undefined : Number(subcategoryParam)
        }
        initialQuestionId={getSingleSearchParam(questionBankSearchParams.question)}
      />
    );
  }

  return <InterviewWorkspacePage {...page} />;
}
