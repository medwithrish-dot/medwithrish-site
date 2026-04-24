import GuidePage from "@/components/GuidePage";

export default function Page() {
  return (
    <GuidePage
      eyebrow="Tutoring"
      title="1-to-1 Personal Statement Session"
      intro="A focused support session to improve structure, clarity, reflection, and overall competitiveness."
      sections={[
        {
          title: "What a session can cover",
          points: [
            "Improving structure and paragraph flow.",
            "Strengthening reflection and insight.",
            "Making the statement sound clearer, sharper, and more specific.",
          ],
        },
        {
          title: "Good fit for",
          points: [
            "Students with a draft that needs feedback.",
            "Students unsure how to begin.",
            "Students wanting stronger clarity and direction before submission.",
          ],
        },
      ]}
      ctaLabel="Contact for a 1-to-1 session"
      ctaHref="/contact"
    />
  );
}