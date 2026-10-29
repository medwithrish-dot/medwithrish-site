import type { Metadata } from "next";
import { publicPageMetadata } from "@/utils/medwithrish/metadata";
import { TutoringPageClient } from "./_client";

export const metadata: Metadata = publicPageMetadata({
  title: "1-to-1 Medical School Admissions Tutoring | MedWithRish",
  description:
    "Book 1-to-1 medical school admissions tutoring with @medwithrish and specialists. Expert UCAT tuition, medicine interview coaching and complete admissions support.",
  path: "/tutoring",
});

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

