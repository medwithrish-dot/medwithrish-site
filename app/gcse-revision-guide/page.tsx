import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["gcse-revision-guide"];

export const metadata: Metadata = {
  title: "GCSE Revision Guide | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/gcse-revision-guide" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
