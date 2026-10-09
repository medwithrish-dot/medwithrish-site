import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["related-careers-guide"];

export const metadata: Metadata = {
  title: "Related Healthcare Careers Guide | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/related-careers-guide" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
