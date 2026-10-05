import type { Metadata } from "next";
import { ManageAccountClient } from "./_client";
import { safeInterviewReturnPath } from "@/utils/medicforest/feature-access";

export const metadata: Metadata = {
  title: "Manage Account | MedicForest",
  description:
    "Manage your MedicForest account settings, subscription billing, permissions, and platform access across UCAT and Med Interviews.",
  alternates: {
    canonical: "/account",
  },
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const search = await searchParams;
  return <ManageAccountClient initialAuthTab={search.mode === "signup" ? "signup" : "login"} returnTo={safeInterviewReturnPath(search.next)} />;
}
