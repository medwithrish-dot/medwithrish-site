import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function rateLimitExceeded(request: Request) {
  const now = Date.now();
  const key = getClientKey(request);
  const current = requestCounts.get(key);

  if (!current || current.resetAt <= now) {
    requestCounts.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function isGeneratedQuestion(value: unknown): value is typeof FALLBACK {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const record = value as Record<string, unknown>;
  const options = record.options;
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return false;
  }

  const optionRecord = options as Record<string, unknown>;

  return (
    typeof record.sectionA === "string" &&
    typeof record.sectionB === "string" &&
    typeof record.question === "string" &&
    ["A", "B", "C", "D"].includes(String(record.correct)) &&
    typeof record.explanation === "string" &&
    ["A", "B", "C", "D"].every((key) => typeof optionRecord[key] === "string")
  );
}

export async function GET(request: Request) {
  const aiDemoEnabled = process.env.RISHBOT_AI_DEMO_ENABLED === "1";

  if (!aiDemoEnabled || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(FALLBACK);
  }

  if (rateLimitExceeded(request)) {
    return NextResponse.json(FALLBACK, {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    });
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

    const data = JSON.parse(cleaned) as unknown;
    if (!isGeneratedQuestion(data)) {
      throw new Error("AI returned an invalid question shape.");
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
