import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rishbot Tutor | MedWithRish",
  description:
    "AI Healthcare Admissions tutor designed by leading Medical admissions specialist @medwithrish. UCAT prep with eye-tracking insights.",
};

export default function RishbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
