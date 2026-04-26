import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhloemAI | MedWithRish",
  description:
    "AI-powered preparation for UCAT, medicine and dentistry interviews, built by @medwithrish — a leading Medical admissions specialist.",
};

export default function RishbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
