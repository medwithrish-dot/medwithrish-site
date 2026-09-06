import { NextResponse } from "next/server";

export const dynamic = "force-static";

const FALLBACK = {
  sectionA:
    "A town clinic introduced a same-day triage desk after patients reported long waits for routine appointments. Under the new system, a nurse reviewed each request and directed patients to a pharmacist, telephone appointment, or in-person consultation. In the first month, the number of face-to-face appointments fell, but the average time spent on each in-person consultation increased.",
  sectionB:
    "Clinic staff said the longer consultations were expected because doctors were seeing a higher proportion of complex cases. Some patients welcomed the faster advice for minor conditions, while others disliked explaining symptoms before speaking to a doctor. The clinic plans to compare missed appointments, patient satisfaction, and urgent referrals before deciding whether to keep the system.",
  question:
    "Based on the passage, which statement can be most reliably inferred?",
  options: {
    A: "The triage desk reduced every patient's total time spent at the clinic.",
    B: "Doctors were likely seeing more complex patients after triage was introduced.",
    C: "The clinic has already decided to make the triage desk permanent.",
    D: "Patients preferred telephone appointments to in-person consultations.",
  },
  correct: "B",
  explanation:
    "B follows because staff linked longer doctor consultations to a higher proportion of complex cases. A, C, and D overstate outcomes the passage does not establish.",
};

export async function GET() {
  return NextResponse.json(FALLBACK);
}
