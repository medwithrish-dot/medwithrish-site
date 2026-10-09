import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["personal-statements-guide"];

export const metadata: Metadata = {
  title: "Personal Statements Guide | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/personal-statements-guide" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
