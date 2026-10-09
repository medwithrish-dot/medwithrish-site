import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["ucat-timeline"];

export const metadata: Metadata = {
  title: "UCAT Preparation Timeline | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/ucat-timeline" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
