import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { admissionsGuides } from "@/utils/medwithrish/guides";

const guide = admissionsGuides["gateway-foundation-guide"];

export const metadata: Metadata = {
  title: "Gateway & Foundation Courses Guide | MedWithRish",
  description: guide.intro,
  alternates: { canonical: "/gateway-foundation-guide" },
};

export default function Page() {
  return <GuidePage {...guide} />;
}
