import GuidePage from "@/components/GuidePage";

export default function Page() {
  return (
    <GuidePage
      eyebrow="Tutoring"
      title="GCSE Tutoring"
      intro="Focused GCSE support for students who want stronger grades, better revision structure, and more confidence across key subjects."
      sections={[
        {
          title: "What support can include",
          points: [
            "Revision structure and weekly planning.",
            "Topic-by-topic teaching and exam question practice.",
            "Feedback on weaknesses and progress tracking.",
          ],
        },
        {
          title: "Who this suits",
          points: [
            "Students aiming to strengthen their academic foundations.",
            "Students who feel behind and need structure.",
            "Families who want consistent academic support.",
          ],
        },
      ]}
      ctaLabel="Contact for GCSE tutoring"
      ctaHref="/contact"
    />
  );
}