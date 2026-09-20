import type { Metadata } from "next";
import { PhloemAILandingPage } from "./_components/PhloemAIClient";

type LandingSearchParams = {
  preview?: string | string[];
};

export const metadata: Metadata = {
  title: {
    absolute: "PhloemAI | AI-powered medical admissions preparation",
  },
  description:
    "Explore PhloemAI features and pricing, then choose UCAT or medicine interview preparation.",
  alternates: {
    canonical: "/phloemai",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<LandingSearchParams>;
}) {
  const params = await searchParams;
  const preview = Array.isArray(params.preview) ? params.preview[0] : params.preview;
  const lockedArea = preview === "interview" || preview === "ucat" ? preview : null;

  return <PhloemAILandingPage lockedArea={lockedArea} />;
}
