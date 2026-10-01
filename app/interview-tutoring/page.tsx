import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Med Interview Tutoring | MedWithRish",
  description: "Practise medicine MMI and panel interviews with individual feedback.",
  alternates: { canonical: "/interview-tutoring" },
};

import GuidePage from "@/components/GuidePage";
import { contactHref } from "@/utils/medwithrish/site-links";

export default function Page() {
  return (
    <GuidePage
      eyebrow="Tutoring"
      title="Med Interview Tutoring"
      intro="Targeted support for MMI and panel interviews, with a focus on structure, confidence, and stronger answers."
      sections={[
        {
          title: "What support can include",
          points: [
            "MMI station practice and feedback.",
            "Panel Med interview structure and delivery.",
            "Ethics, reflection, communication, and confidence-building.",
          ],
        },
        {
          title: "Why it matters",
          points: [
            "Interviews often decide final outcomes.",
            "Preparation improves confidence under pressure.",
            "Strong structure helps answers sound more mature and convincing.",
          ],
        },
      ]}
      ctaLabel="Contact for Med interview tutoring"
      ctaHref={contactHref("interview-tutoring")}
    />
  );
}
