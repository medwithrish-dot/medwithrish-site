import type { Metadata } from "next";
import { publicPageMetadata } from "@/utils/medwithrish/metadata";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["year12-guide"];

export const metadata: Metadata = publicPageMetadata({
  title: `${guide.title} | MedWithRish`,
  description: guide.searchDescription ?? guide.intro,
  path: "/year12-guide",
  type: "article",
});

export default function Page() {
  return <GuidePage {...guide} />;
}
