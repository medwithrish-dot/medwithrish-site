import type { Metadata } from "next";
import { InterviewShell } from "../_components/InterviewShell";
import { UniversityCatalogue } from "./UniversityCatalogue";
import { productPageMetadata } from "@/utils/medicforest/metadata";

export const metadata: Metadata = productPageMetadata({
  title: "Medical School Interview Formats by University | MedicForest",
  description: "Explore UK medical school interview formats, timing notes and official admissions links. Compare university practice presets before your MMI or panel interview.",
  path: "/interviews/universities",
});

export default function Page() {
  return (
    <InterviewShell title="University Med Interview Formats" subtitle="Explore timing notes, format sources, and official admissions links before choosing where to practise." activeLabel="Universities" eyebrow="Medical schools">
      <UniversityCatalogue />
    </InterviewShell>
  );
}
