import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Shown when ANTHROPIC_API_KEY is absent or the API call fails
const FALLBACK = {
  passage:
    "The introduction of antibiotic-resistant bacteria represents one of the most significant public health challenges of the 21st century. Overuse of antibiotics in both human medicine and agricultural settings has accelerated the development of resistance, rendering previously effective treatments ineffective. The World Health Organization estimates that without decisive action, antimicrobial resistance could cause ten million deaths annually by 2050, surpassing cancer as a leading cause of mortality. Research funding for new antibiotic development has historically lagged behind other pharmaceutical fields due to relatively low profit margins, as antibiotics are typically taken for short periods compared to chronic disease medications. Several countries have implemented stewardship programmes requiring prescriptions for antibiotic purchases, while others continue to allow over-the-counter sales.",
  question:
    "Based on the passage, which of the following can be most reliably inferred?",
  options: {
    A: "Antibiotic resistance will definitely cause ten million deaths per year by 2050.",
    B: "Economic factors have contributed to insufficient research into new antibiotics.",
    C: "Agricultural use of antibiotics is more harmful than medical use.",
    D: "Prescription requirements have successfully reduced antibiotic resistance globally.",
  },
  correct: "B",
  explanation:
    "The passage explicitly states that research funding has lagged due to 'relatively low profit margins', directly supporting B. Option A overstates the WHO estimate ('could cause'). Options C and D go beyond what the passage states.",
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
          content: `Generate a UCAT Verbal Reasoning question. Respond with ONLY a raw JSON object — no markdown, no code fences, no explanation text before or after.

{
  "passage": "A 130-160 word prose passage on a medical, ethical, or scientific topic. Dense, realistic, UCAT-style writing.",
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

Requirements: all four options must be plausible. Only one can be correct based solely on the passage. Vary which letter is correct.`,
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
