import type { Metadata } from "next";
import { UCATTutoringClient } from "./_client";

export const metadata: Metadata = {
  title: "1-to-1 UCAT Tutoring & Crash Course | MedWithRish",
  description:
    "Book 1-to-1 UCAT tutoring with @medwithrish or a specialist. Master calculator shortcuts, timing strategy, triage methods and weak subtests.",
  alternates: { canonical: "/ucat-tutoring" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const checkoutStatus =
    status === "success" || status === "cancelled" ? status : null;

  return <UCATTutoringClient checkoutStatus={checkoutStatus} />;
}
