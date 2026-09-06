import type { Metadata } from "next";
import { getInterviewDashboardData } from "@/utils/interviews/dashboard-data";
import { InterviewDashboard } from "./_components/InterviewDashboard";
import { InterviewShell } from "./_components/InterviewShell";

export const metadata: Metadata = {
  title: "Med Interviews | PhloemAI",
  description: "Your medicine interview preparation: university dates, a personal practice plan, saved feedback and progress.",
  alternates: { canonical: "/phloemai/interviews" },
};

export default async function Page() {
  const data = await getInterviewDashboardData();
  return <InterviewShell title="Make your next answer count." subtitle="Your universities, your practice and your next step — brought together in one place." activeLabel="Dashboard" eyebrow="Your interview preparation"><InterviewDashboard data={data} /></InterviewShell>;
}
