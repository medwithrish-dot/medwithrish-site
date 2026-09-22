import type { Metadata } from "next";
import { getProductSiteUrl } from "@/utils/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getProductSiteUrl()),
  title: "PhloemAI",
  description:
    "AI-powered UCAT preparation with practice questions, mock exams, diagnostics, study tasks and skills trainers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PhloemAI",
    description:
      "AI-powered UCAT preparation with mock exams, diagnostics and practice questions.",
    url: "/",
    siteName: "PhloemAI",
    type: "website",
  },
};

export default function RishbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
