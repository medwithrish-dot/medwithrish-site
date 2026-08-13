import type { Metadata } from "next";
import { InterviewWorkspacePage } from "../_components/InterviewWorkspacePage";

export const metadata: Metadata = {
  title: "Interview Universities | PhloemAI",
};

export default function Page() {
  return (
    <InterviewWorkspacePage
      title="Universities"
      subtitle="Keep each medical school's interview format, dates and readiness score in one place."
      activeLabel="Universities"
      primaryAction={{
        title: "Manchester MMI",
        description: "18 days remaining with 82% readiness.",
        href: "/phloemai/interviews/universities/manchester",
        action: "Open Manchester",
      }}
      cards={[
        {
          title: "Manchester",
          description: "MMI practice, ethics stations and school notes.",
          href: "/phloemai/interviews/universities/manchester",
          action: "Open school",
        },
        {
          title: "Sheffield",
          description: "32 days remaining with interview practice queued.",
          href: "/phloemai/interviews/universities/sheffield",
          action: "Open school",
        },
        {
          title: "Birmingham",
          description: "Date not set. Build readiness with core MMI themes.",
          href: "/phloemai/interviews/universities/birmingham",
          action: "Open school",
        },
      ]}
      rows={[
        {
          label: "Manchester",
          meta: "18 days remaining",
          href: "/phloemai/interviews/universities/manchester",
        },
        {
          label: "Sheffield",
          meta: "32 days remaining",
          href: "/phloemai/interviews/universities/sheffield",
        },
        {
          label: "Birmingham",
          meta: "Date not set",
          href: "/phloemai/interviews/universities/birmingham",
        },
      ]}
    />
  );
}
