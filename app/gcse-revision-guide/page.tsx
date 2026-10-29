import type { Metadata } from "next";
import { publicPageMetadata } from "@/utils/medwithrish/metadata";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["gcse-revision-guide"];

export const metadata: Metadata = publicPageMetadata({
  title: `${guide.title} | MedWithRish`,
  description: guide.searchDescription ?? guide.intro,
  path: "/gcse-revision-guide",
  type: "article",
});

export default function Page() {
  return <GuidePage {...guide} />;
}
