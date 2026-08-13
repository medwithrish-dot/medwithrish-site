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
  "data-analysis": {
    title: "Data & Analysis",
    subtitle:
      "Practise explaining graphs, statistics, research evidence and uncertainty in interview answers.",
    activeLabel: "Question Bank",
    stats: [
      { label: "Questions", value: "120+" },
      { label: "Completed", value: "32" },
      { label: "Readiness", value: "27%" },
    ],
    primaryAction: {
      title: "Start data interpretation",
      description: "Work through a short graph or statistics prompt with follow-up questions.",
      href: "/phloemai/interviews/reports",
      action: "Start",
    },
    cards: [
      {
        title: "Common prompts",
        description: "Graphs, audit results, research quality and communicating risk.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
      {
        title: "Guides",
        description: "Review how to structure evidence-based interview answers.",
        href: "/phloemai/interviews/guides",
        action: "Open guides",
      },
      {
        title: "Progress",
        description: "See how data questions affect your interview readiness.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
      },
    ],
  },
  "role-play-mmi-tasks": {
    title: "Role Play & MMI Tasks",
    subtitle:
      "Practise scenario-based stations with clear communication, empathy and task management.",
    activeLabel: "Question Bank",
    stats: [
      { label: "Questions", value: "100+" },
      { label: "Completed", value: "24" },
      { label: "Readiness", value: "24%" },
    ],
    primaryAction: {
      title: "Start role-play station",
      description: "Open a scenario prompt and practise the first minute of your response.",
      href: "/phloemai/interviews/ai-interviews",
      action: "Start",
    },
    cards: [
      {
        title: "Communication",
        description: "Practise checking understanding, signposting and responding to emotion.",
        href: "/phloemai/interviews/stations/teamwork-group-discussion",
        action: "Practise",
      },
      {
        title: "Question bank",
        description: "Return to the full set of interview prompt categories.",
        href: "/phloemai/interviews/question-bank",
        action: "Open bank",
      },
      {
        title: "Reports",
        description: "Review role-play feedback and next action points.",
        href: "/phloemai/interviews/reports",
        action: "View reports",
      },
    ],
  },
  "curveballs-quick-fire": {
    title: "Curveballs & Quick-Fire",
    subtitle:
      "Build confidence with unexpected questions, quick reasoning prompts and follow-ups.",
    activeLabel: "Question Bank",
    stats: [
      { label: "Questions", value: "80+" },
      { label: "Completed", value: "16" },
      { label: "Readiness", value: "20%" },
    ],
    primaryAction: {
      title: "Start quick-fire practice",
      description: "Answer a short prompt under time pressure, then review your structure.",
      href: "/phloemai/interviews/ai-interviews",
      action: "Start",
    },
    cards: [
      {
        title: "Hot topics",
        description: "Move from quick-fire answers into current healthcare topics.",
        href: "/phloemai/interviews/stations/nhs-waiting-lists",
        action: "Practise",
      },
      {
        title: "Question bank",
        description: "Return to all interview question categories.",
        href: "/phloemai/interviews/question-bank",
        action: "Open bank",
      },
      {
        title: "Progress",
        description: "Track how quick-fire practice changes your readiness.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
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
