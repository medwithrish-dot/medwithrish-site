import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InterviewWorkspacePage,
  type InterviewWorkspacePageProps,
} from "../../_components/InterviewWorkspacePage";

const stationPages = {
  "ethics-confidentiality": {
    title: "Ethics - Confidentiality",
    subtitle:
      "A focused confidentiality station with timing, structure and feedback review links.",
    activeLabel: "AI Interviews",
    stats: [
      { label: "Length", value: "8 mins" },
      { label: "Theme", value: "Ethics" },
      { label: "Target", value: "70%+" },
    ],
    primaryAction: {
      title: "Start station",
      description: "Begin the confidentiality scenario and mark it after completion.",
      href: "/phloemai/interviews/reports/ethics-resource-allocation",
      action: "Start",
    },
    cards: [
      {
        title: "Prep guide",
        description: "Review confidentiality, safeguarding and escalation points.",
        href: "/phloemai/interviews/guides",
        action: "Open guide",
      },
      {
        title: "Question bank",
        description: "Open more ethics prompts before restarting.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
      {
        title: "Progress",
        description: "See how ethics is affecting your readiness score.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
      },
    ],
  },
  "motivation-question": {
    title: "Motivation Question",
    subtitle:
      "Practise a polished medicine motivation answer with clear evidence and reflection.",
    activeLabel: "AI Interviews",
    stats: [
      { label: "Length", value: "8 mins" },
      { label: "Theme", value: "Motivation" },
      { label: "Status", value: "Completed" },
    ],
    primaryAction: {
      title: "Review latest answer",
      description: "Open your motivation report and tighten the next version.",
      href: "/phloemai/interviews/reports/motivation-personal-why",
      action: "Review",
    },
    cards: [
      {
        title: "Try again",
        description: "Repeat the station with a sharper structure.",
        href: "/phloemai/interviews/ai-interviews",
        action: "Open AI interviews",
      },
      {
        title: "Birmingham",
        description: "Use this answer in Birmingham-specific prep.",
        href: "/phloemai/interviews/universities/birmingham",
        action: "Open school",
      },
      {
        title: "Plan",
        description: "Return to today's practice list.",
        href: "/phloemai/interviews/plan",
        action: "Open plan",
      },
    ],
  },
  "ethics-ai-station": {
    title: "Ethics AI Station",
    subtitle:
      "Run an ethics scenario and use the feedback to practise clearer decision-making.",
    activeLabel: "AI Interviews",
    stats: [
      { label: "Length", value: "8 mins" },
      { label: "Theme", value: "Ethics" },
      { label: "Ready", value: "Queued" },
    ],
    primaryAction: {
      title: "Start ethics station",
      description: "Resource allocation and patient-centred reasoning.",
      href: "/phloemai/interviews/reports/ethics-resource-allocation",
      action: "Start",
    },
    cards: [
      {
        title: "Confidentiality",
        description: "Practise a related confidentiality station.",
        href: "/phloemai/interviews/stations/ethics-confidentiality",
        action: "Open station",
      },
      {
        title: "Guides",
        description: "Review ethics concepts before another attempt.",
        href: "/phloemai/interviews/guides",
        action: "Open guides",
      },
      {
        title: "Reports",
        description: "Compare recent ethics performance.",
        href: "/phloemai/interviews/reports",
        action: "Open reports",
      },
    ],
  },
  "nhs-waiting-lists": {
    title: "Hot Topic - NHS Waiting Lists",
    subtitle:
      "Practise explaining current NHS pressures with balance, empathy and evidence.",
    activeLabel: "AI Interviews",
    stats: [
      { label: "Length", value: "8 mins" },
      { label: "Theme", value: "Hot topic" },
      { label: "Target", value: "65%+" },
    ],
    primaryAction: {
      title: "Start hot topic station",
      description: "Answer a waiting-list scenario under timed conditions.",
      href: "/phloemai/interviews/reports",
      action: "Start",
    },
    cards: [
      {
        title: "NHS guide",
        description: "Refresh workforce, funding and patient safety points.",
        href: "/phloemai/interviews/guides",
        action: "Open guide",
      },
      {
        title: "Question bank",
        description: "Browse more hot topic prompts.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
      {
        title: "Today's plan",
        description: "Return to the remaining interview tasks.",
        href: "/phloemai/interviews/plan",
        action: "Open plan",
      },
    ],
  },
  "teamwork-group-discussion": {
    title: "Teamwork - Group Discussion",
    subtitle:
      "Practise balanced contribution, listening and collaborative decision-making.",
    activeLabel: "Groups",
    stats: [
      { label: "Length", value: "10 mins" },
      { label: "Theme", value: "Teamwork" },
      { label: "Mode", value: "Group" },
    ],
    primaryAction: {
      title: "Open group room",
      description: "Join the teamwork practice flow from Groups.",
      href: "/phloemai/interviews/groups",
      action: "Open group",
    },
    cards: [
      {
        title: "Teamwork report",
        description: "Review your last group discussion feedback.",
        href: "/phloemai/interviews/reports/teamwork-group-discussion",
        action: "Open report",
      },
      {
        title: "Leaderboard",
        description: "See group practice consistency.",
        href: "/phloemai/interviews/leaderboard",
        action: "View board",
      },
      {
        title: "Question bank",
        description: "Find more teamwork prompts.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
    ],
  },
} satisfies Record<string, InterviewWorkspacePageProps>;

const stationPageMap: Record<string, InterviewWorkspacePageProps | undefined> =
  stationPages;

export function generateStaticParams() {
  return Object.keys(stationPages).map((station) => ({ station }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ station: string }>;
}): Promise<Metadata> {
  const { station } = await params;
  const page = stationPageMap[station];

  return {
    title: `${page?.title ?? "Interview Station"} | PhloemAI`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ station: string }>;
}) {
  const { station } = await params;
  const page = stationPageMap[station];

  if (!page) notFound();

  return <InterviewWorkspacePage {...page} />;
}
