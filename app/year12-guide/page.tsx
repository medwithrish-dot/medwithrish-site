import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["year12-guide"];

export const metadata: Metadata = {
  title: "Year 12 Application Guide | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/year12-guide" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
