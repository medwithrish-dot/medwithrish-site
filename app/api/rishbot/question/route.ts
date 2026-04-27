import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Shown when ANTHROPIC_API_KEY is absent or the API call fails
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
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(FALLBACK);
  }

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate an original UCAT Verbal Reasoning question. Do not copy or closely paraphrase any copyrighted source, official UCAT material, question bank, article, textbook, or web page. Respond with ONLY a raw JSON object - no markdown, no code fences, no explanation text before or after.

{
  "sectionA": "The first half of a fully original 130-160 word prose passage on a medical, ethical, or scientific topic. Dense, realistic, UCAT-style writing.",
  "sectionB": "The second half of the same fully original passage. It must continue Section A and contain information needed to answer the question.",
  "question": "An inference or 'which statement follows' question that requires logical deduction from the passage, not just fact retrieval.",
  "options": {
    "A": "Complete sentence answer option",
    "B": "Complete sentence answer option",
    "C": "Complete sentence answer option",
    "D": "Complete sentence answer option"
  },
  "correct": "B",
  "explanation": "One sentence explaining why the correct answer is right and why each other option is wrong."
}

Requirements: all four options must be plausible. Only one can be correct based solely on the two passage sections. Vary which letter is correct.`,
        },
      ],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
