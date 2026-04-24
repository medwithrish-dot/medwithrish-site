import GuidePage from "@/components/GuidePage";

export default function Page() {
  return (
    <GuidePage
      eyebrow="Tutoring"
      title="Interview Tutoring"
      intro="Targeted support for MMI and panel interviews, with a focus on structure, confidence, and stronger answers."
      sections={[
        {
          title: "What support can include",
          points: [
            "MMI station practice and feedback.",
            "Panel interview structure and delivery.",
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
      ctaLabel="Contact for interview tutoring"
      ctaHref="/contact"
    />
  );
}