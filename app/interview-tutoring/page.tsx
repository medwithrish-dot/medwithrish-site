import type { Metadata } from "next";
import { InterviewTutoringClient } from "./_client";

export const metadata: Metadata = {
  title: "1-to-1 Med Interview Tutoring | MedWithRish",
  description:
    "Personal 1-to-1 medicine interview coaching with @medwithrish and specialists. Realistic MMI and panel mock practice, station scorecards and structured technique.",
  alternates: { canonical: "/interview-tutoring" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const checkoutStatus =
    status === "success" || status === "cancelled" ? status : null;

  return <InterviewTutoringClient checkoutStatus={checkoutStatus} />;
}
