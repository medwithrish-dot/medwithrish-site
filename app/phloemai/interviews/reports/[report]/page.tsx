import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InterviewWorkspacePage,
  type InterviewWorkspacePageProps,
} from "../../_components/InterviewWorkspacePage";

const reportPages = {
  "manchester-mock-2": {
    title: "Manchester Mock #2",
    subtitle:
      "Your latest Manchester mock report, with score breakdown and focused follow-up tasks.",
    activeLabel: "Progress",
    stats: [
      { label: "Overall", value: "78%" },
      { label: "Best area", value: "Communication" },
      { label: "Focus", value: "Ethics" },
    ],
    primaryAction: {
      title: "Next best action",
      description: "Run an ethics station to improve confidentiality handling.",
      href: "/phloemai/interviews/stations/ethics-confidentiality",
      action: "Start station",
    },
    cards: [
      {
        title: "Communication",
        description: "Clear signposting and calm explanation scored strongly.",
        href: "/phloemai/interviews/progress",
        action: "View theme",
      },
      {
        title: "Ethics",
        description: "Add clearer patient autonomy and escalation reasoning.",
        href: "/phloemai/interviews/stations/ethics-ai-station",
        action: "Practise",
      },
      {
        title: "University notes",
        description: "Review Manchester MMI priorities before your next mock.",
        href: "/phloemai/interviews/universities/manchester",
        action: "Open notes",
      },
    ],
  },
  "ethics-resource-allocation": {
    title: "Ethics - Resource Allocation",
    subtitle:
      "Feedback for prioritisation, fairness and explaining difficult trade-offs.",
    activeLabel: "Progress",
    stats: [
      { label: "Score", value: "72%" },
      { label: "Timing", value: "Good" },
      { label: "Focus", value: "Structure" },
    ],
    primaryAction: {
      title: "Repeat ethics station",
      description: "Practise a related confidentiality and resources scenario.",
      href: "/phloemai/interviews/stations/ethics-confidentiality",
      action: "Practise",
    },
    cards: [
      {
        title: "Model points",
        description: "Justice, transparency, clinical urgency and communication.",
        href: "/phloemai/interviews/guides",
        action: "Open guide",
      },
      {
        title: "School context",
        description: "Apply this feedback to Sheffield-style questioning.",
        href: "/phloemai/interviews/universities/sheffield",
        action: "Open school",
      },
      {
        title: "Plan",
        description: "Add another ethics task to today's plan.",
        href: "/phloemai/interviews/plan",
        action: "Open plan",
      },
    ],
  },
  "motivation-personal-why": {
    title: "Motivation - Personal Why",
    subtitle:
      "Feedback on your medicine motivation answer, reflection and evidence.",
    activeLabel: "Progress",
    stats: [
      { label: "Score", value: "81%" },
      { label: "Strength", value: "Reflection" },
      { label: "Focus", value: "Specificity" },
    ],
    primaryAction: {
      title: "Motivation question",
      description: "Practise a cleaner version of your personal why answer.",
      href: "/phloemai/interviews/stations/motivation-question",
      action: "Practise",
    },
    cards: [
      {
        title: "Work experience",
        description: "Connect examples to values and patient-centred care.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
      {
        title: "Birmingham prep",
        description: "Use this answer in school-specific practice.",
        href: "/phloemai/interviews/universities/birmingham",
        action: "Open school",
      },
      {
        title: "Progress",
        description: "Compare motivation score movement over time.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
      },
    ],
  },
  "teamwork-group-discussion": {
    title: "Teamwork - Group Discussion",
    subtitle:
      "Feedback on collaboration, listening, contribution and balanced leadership.",
    activeLabel: "Progress",
    stats: [
      { label: "Score", value: "74%" },
      { label: "Strength", value: "Listening" },
      { label: "Focus", value: "Initiative" },
    ],
    primaryAction: {
      title: "Group practice",
      description: "Open peer rooms and teamwork station prompts.",
      href: "/phloemai/interviews/groups",
      action: "Open groups",
    },
    cards: [
      {
        title: "Teamwork station",
        description: "Practise a collaborative decision-making scenario.",
        href: "/phloemai/interviews/stations/teamwork-group-discussion",
        action: "Practise",
      },
      {
        title: "Leaderboard",
        description: "Track consistency across group tasks.",
        href: "/phloemai/interviews/leaderboard",
        action: "View board",
      },
      {
        title: "Reports",
        description: "Return to the full report list.",
        href: "/phloemai/interviews/reports",
        action: "View all",
      },
    ],
  },
} satisfies Record<string, InterviewWorkspacePageProps>;

const reportPageMap: Record<string, InterviewWorkspacePageProps | undefined> =
  reportPages;

export function generateStaticParams() {
  return Object.keys(reportPages).map((report) => ({ report }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ report: string }>;
}): Promise<Metadata> {
  const { report } = await params;
  const page = reportPageMap[report];

  return {
    title: `${page?.title ?? "Interview Report"} | PhloemAI`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ report: string }>;
}) {
  const { report } = await params;
  const page = reportPageMap[report];

  if (!page) notFound();

  return <InterviewWorkspacePage {...page} />;
}
