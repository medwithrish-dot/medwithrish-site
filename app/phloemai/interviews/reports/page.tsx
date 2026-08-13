import type { Metadata } from "next";
import { InterviewWorkspacePage } from "../_components/InterviewWorkspacePage";

export const metadata: Metadata = {
  title: "Interview Reports | PhloemAI",
};

export default function Page() {
  return (
    <InterviewWorkspacePage
      title="Reports"
      subtitle="Review recent station scores, feedback themes and the next fixes to practise."
      activeLabel="Progress"
      primaryAction={{
        title: "Manchester Mock #2",
        description: "78% overall with a stronger communication score.",
        href: "/phloemai/interviews/reports/manchester-mock-2",
        action: "Open latest",
      }}
      cards={[
        {
          title: "Ethics report",
          description: "Resource allocation feedback and model answer notes.",
          href: "/phloemai/interviews/reports/ethics-resource-allocation",
          action: "Open report",
        },
        {
          title: "Motivation report",
          description: "Personal why structure and reflection feedback.",
          href: "/phloemai/interviews/reports/motivation-personal-why",
          action: "Open report",
        },
        {
          title: "Teamwork report",
          description: "Group discussion clarity and collaboration feedback.",
          href: "/phloemai/interviews/reports/teamwork-group-discussion",
          action: "Open report",
        },
      ]}
      rows={[
        {
          label: "Manchester Mock #2",
          meta: "3 days ago",
          href: "/phloemai/interviews/reports/manchester-mock-2",
        },
        {
          label: "Ethics - Resource Allocation",
          meta: "5 days ago",
          href: "/phloemai/interviews/reports/ethics-resource-allocation",
        },
        {
          label: "Motivation - Personal Why",
          meta: "1 week ago",
          href: "/phloemai/interviews/reports/motivation-personal-why",
        },
        {
          label: "Teamwork - Group Discussion",
          meta: "1 week ago",
          href: "/phloemai/interviews/reports/teamwork-group-discussion",
        },
      ]}
    />
  );
}
