import type { Metadata } from "next";
import { PersonalStatementClient } from "./_client";

export const metadata: Metadata = {
  title: "1-to-1 Personal Statement Support & Review | MedWithRish",
  description:
    "Improve the structure, clarity and medical reflection in your medicine or dentistry personal statement with dedicated 1-to-1 review.",
  alternates: { canonical: "/personal-statement-session" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const checkoutStatus =
    status === "success" || status === "cancelled" ? status : null;

  return <PersonalStatementClient checkoutStatus={checkoutStatus} />;
}
