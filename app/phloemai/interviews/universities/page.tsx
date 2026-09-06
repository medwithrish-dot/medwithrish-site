import type { Metadata } from "next";
import { InterviewShell } from "../_components/InterviewShell";
import { UniversityCatalogue } from "./UniversityCatalogue";

export const metadata: Metadata = { title: "Interview Universities | PhloemAI" };

export default function Page() {
  return (
    <InterviewShell title="University Interview Formats" subtitle="Explore timing notes, format sources, and official admissions links before choosing where to practise." activeLabel="Universities" eyebrow="Medical schools">
      <UniversityCatalogue />
    </InterviewShell>
  );
}
