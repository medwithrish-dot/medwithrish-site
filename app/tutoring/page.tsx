import type { Metadata } from "next";
import { TutoringPageClient } from "./_client";

export const metadata: Metadata = {
  title: "1-to-1 Medical School Admissions Tutoring | MedWithRish",
  description:
    "Book 1-to-1 medical school admissions tutoring with @medwithrish and specialists. Expert UCAT tuition, medicine interview coaching and complete admissions support.",
  alternates: { canonical: "/tutoring" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const checkoutStatus =
    status === "success" || status === "cancelled" ? status : null;

  return <TutoringPageClient checkoutStatus={checkoutStatus} />;
}

