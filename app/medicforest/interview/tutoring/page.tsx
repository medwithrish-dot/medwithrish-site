import type { Metadata } from "next";
import { InterviewShell } from "../_components/InterviewShell";
import { InterviewTutoringPageClient } from "./_client";

export const metadata: Metadata = {
  title: "1-1 Med Interview Tutoring | MedicForest",
  description:
    "Book personalised 1-to-1 medicine interview tutoring with realistic MMI and panel practice, detailed feedback and a tailored improvement plan.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const checkoutStatus =
    status === "success" || status === "cancelled" ? status : null;

  return (
    <InterviewShell
      title="1-1 Med Interview Tutoring"
      subtitle="Personal coaching for the interviews and stations you want to improve."
      activeLabel="1-1 Tutoring"
      heroHeader
    >
      <InterviewTutoringPageClient checkoutStatus={checkoutStatus} />
    </InterviewShell>
  );
}
