const FEEDBACK_RECIPIENT = process.env.FEEDBACK_TO_EMAIL?.trim() || "medwithrish@gmail.com";
const FEEDBACK_SENDER = process.env.FEEDBACK_FROM_EMAIL?.trim() || "MedicForest Feedback <onboarding@resend.dev>";
const MAX_BODY_BYTES = 12_000;
const MAX_MESSAGE_LENGTH = 5_000;

const feedbackCategories = new Set([
  "Bug or technical issue",
  "Question bank content",
  "AI feedback quality",
  "Feature request",
  "General feedback",
  "Other",
]);

function failure(error: string, status: number) {
  return Response.json({ error }, { status });
}

function cleanHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return failure("Invalid request origin.", 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return failure("A JSON request is required.", 415);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return failure("Your feedback is too long.", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure("Invalid request body.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return failure("Invalid request body.", 400);
  }

  const values = body as Record<string, unknown>;
  // A hidden field catches basic form bots without affecting real visitors.
  if (typeof values.website === "string" && values.website.trim()) {
    return Response.json({ ok: true });
  }

  const category = typeof values.category === "string" ? values.category.trim() : "";
  const message = typeof values.message === "string" ? values.message.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";

  if (category && !feedbackCategories.has(category)) {
    return failure("Choose a valid feedback category.", 400);
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return failure(`Feedback must be between 1 and ${MAX_MESSAGE_LENGTH.toLocaleString("en-GB")} characters.`, 400);
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return failure("Enter a valid email address.", 400);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("Feedback email is unavailable: RESEND_API_KEY is missing.");
    return failure("Feedback could not be sent right now. Please email us directly instead.", 503);
  }

  const safeCategory = cleanHeaderValue(category || "General feedback");
  const emailText = [
    `Category: ${safeCategory}`,
    `Reply to: ${email || "Not provided"}`,
    "",
    "Feedback:",
    message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FEEDBACK_SENDER,
        to: [FEEDBACK_RECIPIENT],
        subject: `[MedicForest Feedback] ${safeCategory}`,
        text: emailText,
        ...(email ? { reply_to: email } : {}),
      }),
    });

    if (!response.ok) {
      const providerError = await response.text().catch(() => "");
      console.error("Feedback email provider rejected the request.", {
        status: response.status,
        detail: providerError.slice(0, 500),
      });
      return failure("Feedback could not be sent right now. Please email us directly instead.", 502);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Feedback email request failed.", error);
    return failure("Feedback could not be sent right now. Please email us directly instead.", 502);
  }
}
