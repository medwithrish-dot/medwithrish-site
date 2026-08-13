import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InterviewWorkspacePage,
  type InterviewWorkspacePageProps,
} from "../../_components/InterviewWorkspacePage";

const universityPages = {
  manchester: {
    title: "Manchester Interview",
    subtitle:
      "MMI preparation focused on Manchester themes, timing and station confidence.",
    activeLabel: "Universities",
    stats: [
      { label: "Readiness", value: "82%" },
      { label: "Time left", value: "18 days" },
      { label: "Planned", value: "6 stations" },
    ],
    primaryAction: {
      title: "Manchester Mock #2",
      description: "Open your latest Manchester mock report and action points.",
      href: "/phloemai/interviews/reports/manchester-mock-2",
      action: "Open report",
    },
    cards: [
      {
        title: "School practice",
        description: "Run a Manchester-style MMI station.",
        href: "/phloemai/interviews/stations/ethics-ai-station",
        action: "Start station",
      },
      {
        title: "Question bank",
        description: "Open Manchester interview prompt sets.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
      {
        title: "Plan",
        description: "Review the next tasks before interview day.",
        href: "/phloemai/interviews/plan",
        action: "Open plan",
      },
    ],
  },
  sheffield: {
    title: "Sheffield Interview",
    subtitle:
      "Track Sheffield-specific practice, expected themes and readiness before interview day.",
    activeLabel: "Universities",
    stats: [
      { label: "Readiness", value: "71%" },
      { label: "Time left", value: "32 days" },
      { label: "Planned", value: "5 stations" },
    ],
    primaryAction: {
      title: "Ethics - Resource Allocation",
      description: "Review your latest ethics performance for Sheffield prep.",
      href: "/phloemai/interviews/reports/ethics-resource-allocation",
      action: "Open report",
    },
    cards: [
      {
        title: "Ethics practice",
        description: "Resource allocation and patient communication scenarios.",
        href: "/phloemai/interviews/stations/ethics-confidentiality",
        action: "Practise",
      },
      {
        title: "Guides",
        description: "School format notes and common interview themes.",
        href: "/phloemai/interviews/guides",
        action: "Open guides",
      },
      {
        title: "Progress",
        description: "Check readiness movement for Sheffield prep.",
        href: "/phloemai/interviews/progress",
        action: "View progress",
      },
    ],
  },
  birmingham: {
    title: "Birmingham Interview",
    subtitle:
      "Build Birmingham readiness with core MMI practice while your date is still pending.",
    activeLabel: "Universities",
    stats: [
      { label: "Readiness", value: "61%" },
      { label: "Time left", value: "Date not set" },
      { label: "Planned", value: "4 stations" },
    ],
    primaryAction: {
      title: "Motivation - Personal Why",
      description: "Polish your personal motivation answer for panel questions.",
      href: "/phloemai/interviews/reports/motivation-personal-why",
      action: "Open report",
    },
    cards: [
      {
        title: "Motivation",
        description: "Personal why, reflection and work experience prompts.",
        href: "/phloemai/interviews/stations/motivation-question",
        action: "Practise",
      },
      {
        title: "Question bank",
        description: "Browse Birmingham-style interview prompts.",
        href: "/phloemai/interviews/question-bank",
        action: "Open prompts",
      },
      {
        title: "Groups",
        description: "Find peer practice for group-style discussion.",
        href: "/phloemai/interviews/groups",
        action: "Open groups",
      },
    ],
  },
} satisfies Record<string, InterviewWorkspacePageProps>;

const universityPageMap: Record<
  string,
  InterviewWorkspacePageProps | undefined
> = universityPages;

export function generateStaticParams() {
  return Object.keys(universityPages).map((university) => ({ university }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university: string }>;
}): Promise<Metadata> {
  const { university } = await params;
  const page = universityPageMap[university];

  return {
    title: `${page?.title ?? "University Interview"} | PhloemAI`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ university: string }>;
}) {
  const { university } = await params;
  const page = universityPageMap[university];

  if (!page) notFound();

  return <InterviewWorkspacePage {...page} />;
}
