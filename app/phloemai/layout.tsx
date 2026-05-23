import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhloemAI",
  description:
    "AI-powered UCAT preparation with practice questions, mock exams, diagnostics, study tasks and skills trainers.",
  alternates: {
    canonical: "/phloemai",
  },
  openGraph: {
    title: "PhloemAI",
    description:
      "AI-powered UCAT preparation with mock exams, diagnostics and practice questions.",
    url: "/phloemai",
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
