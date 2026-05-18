import GuidePage from "@/components/GuidePage";

export default function Page() {
  return (
    <GuidePage
      eyebrow="Tutoring"
      title="A-Level Tutoring"
      intro="A-Level support designed to help students improve grades, stay consistent, and meet offer conditions."
      sections={[
        {
          title: "What support can include",
          points: [
            "Topic teaching, exam technique, and revision planning.",
            "Support for weaker topics before they become major problems.",
            "Guidance on staying consistent through Year 12 and Year 13.",
          ],
        },
        {
          title: "Best suited for",
          points: [
            "Students aiming to strengthen predicted grades.",
            "Students working towards conditional offers.",
            "Students who need more structure and accountability.",
          ],
        },
      ]}
      ctaLabel="Contact for A-Level tutoring"
      ctaHref="/contact"
    />
  );
}
