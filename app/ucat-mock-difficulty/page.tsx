import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["ucat-mock-difficulty"];

export const metadata: Metadata = {
  title: "UCAT Mock Difficulty Spreadsheet | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/ucat-mock-difficulty" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
