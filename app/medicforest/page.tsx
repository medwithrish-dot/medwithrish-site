import type { Metadata } from "next";
import InterviewsPage from "./interviews/page";

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest Interviews | 550+ free questions with markschemes",
  },
  description:
    "Start practising immediately with 550+ free medicine interview questions and markschemes. No payment or subscription needed. Explore AI interviews and personalised preparation tools.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MedicForest Interviews | 550+ Free Med Interview Questions",
    description:
      "Start practising immediately with 550+ free medicine interview questions and markschemes. No payment or subscription needed. Explore AI interviews and personalised preparation tools.",
    url: "/",
    siteName: "MedicForest",
    type: "website",
  },
};

export default function Page() {
  return <InterviewsPage />;
}

