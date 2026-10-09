import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["ucat-score-tracker"];

export const metadata: Metadata = {
  title: "Free UCAT Mock Score Tracker | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/ucat-score-tracker" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
