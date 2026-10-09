import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["work-experience-guide"];

export const metadata: Metadata = {
  title: "Work Experience Guide | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/work-experience-guide" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
