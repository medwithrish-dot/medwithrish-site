import Anthropic from "@anthropic-ai/sdk";

import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

const PREMIUM_AI_CREDIT_INTERVAL_MS = 24 * 60 * 60 * 1000;

type DiagnosticIssue = {
  label: string;
  cause?: string;
  evidence?: string[];
  fix?: string;
};

type DiagnosticFeedbackBody = {
  attemptId?: string;
  section?: string;
  accuracy?: number;
  scorePoints?: number;
  maxScore?: number;
  answeredQuestions?: number;
  totalQuestions?: number;
  avgSecondsPerQuestion?: number;
  issues?: DiagnosticIssue[];
  strengths?: string[];
  questionTimings?: Array<{
    label: string;
    avgSeconds: number;
    correct: number;
    questions: number;
  }>;
};
type DiagnosticQuestionTiming = NonNullable<
  DiagnosticFeedbackBody["questionTimings"]
>[number];

type DiagnosticAttemptRow = {
  id: string;
  user_id: string;
  ai_feedback: string | null;
  ai_feedback_requested_at: string | null;
  ai_feedback_status: string | null;
  metadata: unknown;
};

type ProfileRow = {
  current_plan: string | null;
  diagnostic_credits: number | null;
  ai_diagnostic_last_used_at: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseIssues(value: unknown): DiagnosticIssue[] {
  if (!Array.isArray(value)) return [];

  const issues: DiagnosticIssue[] = [];

  value.forEach((item) => {
    const record = asRecord(item);
    const label = asString(record.label);
    if (!label) return;

    issues.push({
      label,
      cause: asString(record.cause),
      evidence: asStringArray(record.evidence),
      fix: asString(record.fix),
    });
  });

  return issues;
}

function parseQuestionTimings(value: unknown): DiagnosticQuestionTiming[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = asRecord(item);
      const label = asString(record.label);
      const avgSeconds = asNumber(record.avgSeconds);
      const correct = asNumber(record.correct);
      const questions = asNumber(record.questions);
      if (!label || avgSeconds === undefined || correct === undefined || questions === undefined) {
        return null;
      }

      return { label, avgSeconds, correct, questions };
    })
    .filter(
      (item): item is DiagnosticQuestionTiming =>
        Boolean(item)
    );
}

function getNextAvailableAt(lastUsedAt?: string | null) {
  if (!lastUsedAt) return null;

  const usedMs = Date.parse(lastUsedAt);
  if (!Number.isFinite(usedMs)) return null;

  return new Date(usedMs + PREMIUM_AI_CREDIT_INTERVAL_MS).toISOString();
}

function getCreditSnapshot(profile: ProfileRow, nowMs = Date.now()) {
  const plan = profile.current_plan === "premium" ? "premium" : "free";

  if (plan === "premium") {
    const nextAvailableAt = getNextAvailableAt(profile.ai_diagnostic_last_used_at);
    const nextMs = nextAvailableAt ? Date.parse(nextAvailableAt) : Number.NaN;
    const creditAvailable = !Number.isFinite(nextMs) || nextMs <= nowMs;

    return {
      plan,
      credits: creditAvailable ? 1 : 0,
      nextAvailableAt: creditAvailable ? null : nextAvailableAt,
    };
  }

  return {
    plan,
    credits:
      typeof profile.diagnostic_credits === "number"
        ? Math.min(1, Math.max(0, profile.diagnostic_credits))
        : 1,
    nextAvailableAt: null,
  };
}

function buildPromptData(
  body: DiagnosticFeedbackBody,
  metadata: Record<string, unknown>
) {
  const summary = asRecord(metadata.summary);
  const insights = asRecord(metadata.insights);
  const savedIssues = parseIssues(insights.issues);
  const savedStrengths = asStringArray(insights.strengths);
  const savedQuestionTimings = parseQuestionTimings(summary.timingBySubtype);

  return {
    section: asString(summary.section) ?? body.section,
    accuracy: asNumber(summary.accuracy) ?? body.accuracy,
    scorePoints: asNumber(summary.scorePoints) ?? body.scorePoints,
    maxScore: asNumber(summary.maxScore) ?? body.maxScore,
    answeredQuestions:
      asNumber(summary.answeredQuestions) ?? body.answeredQuestions,
    totalQuestions: asNumber(summary.totalQuestions) ?? body.totalQuestions,
    avgSecondsPerQuestion:
      asNumber(summary.avgSecondsPerQuestion) ?? body.avgSecondsPerQuestion,
    issues: savedIssues.length ? savedIssues : body.issues ?? [],
    strengths: savedStrengths.length ? savedStrengths : body.strengths ?? [],
    questionTimings: savedQuestionTimings.length
      ? savedQuestionTimings
      : body.questionTimings ?? [],
  };
}

function buildUserPrompt(data: DiagnosticFeedbackBody) {
  const issuesText =
    data.issues
      ?.map((issue, idx) => {
        const evidence =
          issue.evidence && issue.evidence.length > 0
            ? `\n    Evidence: ${issue.evidence.join("; ")}`
            : "";
        const cause = issue.cause ? `\n    Cause hint: ${issue.cause}` : "";
        return `  ${idx + 1}. ${issue.label}${cause}${evidence}`;
      })
      .join("\n") ?? "  (none reported)";

  const strengthsText = data.strengths?.length
    ? data.strengths.map((s) => `  - ${s}`).join("\n")
    : "  (none reported)";

  const timingText = data.questionTimings?.length
    ? data.questionTimings
        .map(
          (t) =>
            `  - ${t.label}: ${t.avgSeconds}s avg, ${t.correct}/${t.questions} correct`
        )
        .join("\n")
    : "  (no breakdown)";

  return `A UCAT student has just finished a ${
    data.section?.toUpperCase() ?? "UCAT"
  } diagnostic. Write personalised, direct feedback they can act on tonight.

Their result:
- Score: ${data.scorePoints ?? "?"}/${data.maxScore ?? "?"}
- Accuracy: ${data.accuracy ?? "?"}%
- Answered: ${data.answeredQuestions ?? "?"}/${data.totalQuestions ?? "?"}
- Average time per question: ${data.avgSecondsPerQuestion ?? "?"}s

Detected issues:
${issuesText}

Detected strengths:
${strengthsText}

Per question type timing:
${timingText}

Write 4-7 short paragraphs of feedback in plain prose. No headings, no bullet lists, no labels like "Main cause" or "Evidence". Speak directly to the student. Reference their actual numbers. Tell them what to drill, what timing target to aim for next session, and what to stop doing. Avoid generic UCAT advice; tie every sentence to their data. Do not pad. Output the feedback only - no preamble. The main idea is to just humanise an explanation of the issues generated BY the data.`;
}

export async function POST(request: Request) {
  let body: DiagnosticFeedbackBody;
  try {
    body = (await request.json()) as DiagnosticFeedbackBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.attemptId) {
    return Response.json(
      { error: "A saved diagnostic attempt is required." },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return Response.json(
      { error: "Supabase is not configured for AI feedback." },
      { status: 503 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json(
      { error: "Log in before requesting AI feedback." },
      { status: 401 }
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json(
      { error: "AI feedback credit enforcement is not configured." },
      { status: 503 }
    );
  }

  const { data: attempt, error: attemptError } = await admin
    .from("diagnostic_attempts")
    .select(
      "id,user_id,ai_feedback,ai_feedback_requested_at,ai_feedback_status,metadata"
    )
    .eq("id", body.attemptId)
    .maybeSingle();

  if (attemptError) {
    return Response.json({ error: attemptError.message }, { status: 500 });
  }

  if (!attempt || (attempt as DiagnosticAttemptRow).user_id !== user.id) {
    return Response.json(
      { error: "Diagnostic attempt not found." },
      { status: 404 }
    );
  }

  const attemptRow = attempt as DiagnosticAttemptRow;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("current_plan,diagnostic_credits,ai_diagnostic_last_used_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  const profileRow: ProfileRow = {
    current_plan:
      typeof profile?.current_plan === "string" ? profile.current_plan : "free",
    diagnostic_credits:
      typeof profile?.diagnostic_credits === "number"
        ? profile.diagnostic_credits
        : 1,
    ai_diagnostic_last_used_at:
      typeof profile?.ai_diagnostic_last_used_at === "string"
        ? profile.ai_diagnostic_last_used_at
        : null,
  };

  const metadata = asRecord(attemptRow.metadata);
  const existingFeedback =
    typeof metadata.aiFeedbackText === "string"
      ? metadata.aiFeedbackText
      : attemptRow.ai_feedback;

  if (existingFeedback) {
    const snapshot = getCreditSnapshot(profileRow);
    return Response.json({
      feedback: existingFeedback,
      requestedAt:
        attemptRow.ai_feedback_requested_at ??
        asString(metadata.aiFeedbackRequestedAt) ??
        null,
      status: "ready",
      ...snapshot,
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "AI feedback is not configured yet. Set ANTHROPIC_API_KEY to enable generation.",
      },
      { status: 503 }
    );
  }

  const plan = profileRow.current_plan === "premium" ? "premium" : "free";
  const previousLastUsedAt = profileRow.ai_diagnostic_last_used_at;
  const requestedAt = new Date().toISOString();
  const currentSnapshot = getCreditSnapshot(profileRow);

  if (currentSnapshot.credits <= 0) {
    return Response.json(
      {
        error:
          plan === "premium"
            ? "Your daily AI diagnostic credit is not available yet."
            : "No diagnostic AI feedback credit remaining.",
        ...currentSnapshot,
      },
      { status: 429 }
    );
  }

  const reserveQuery = admin
    .from("profiles")
    .update(
      plan === "premium"
        ? { ai_diagnostic_last_used_at: requestedAt }
        : {
            diagnostic_credits: Math.max(0, currentSnapshot.credits - 1),
            ai_diagnostic_last_used_at: requestedAt,
          }
    )
    .eq("id", user.id);

  if (plan === "premium") {
    if (previousLastUsedAt) {
      reserveQuery.eq("ai_diagnostic_last_used_at", previousLastUsedAt);
    } else {
      reserveQuery.is("ai_diagnostic_last_used_at", null);
    }
  } else {
    reserveQuery.eq("diagnostic_credits", currentSnapshot.credits);
  }

  const { data: reservedProfile, error: reserveError } = await reserveQuery
    .select("current_plan,diagnostic_credits,ai_diagnostic_last_used_at")
    .maybeSingle();

  if (reserveError) {
    return Response.json({ error: reserveError.message }, { status: 500 });
  }

  if (!reservedProfile) {
    const nextSnapshot = getCreditSnapshot(profileRow);
    return Response.json(
      {
        error: "AI diagnostic credit was already used. Refresh and try again.",
        ...nextSnapshot,
      },
      { status: 429 }
    );
  }

  const reservedSnapshot = getCreditSnapshot(reservedProfile as ProfileRow);

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: buildUserPrompt(buildPromptData(body, metadata)) }],
    });

    const text = msg.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text) throw new Error("AI returned an empty response.");

    const nextMetadata = {
      ...metadata,
      aiFeedbackRequested: true,
      aiFeedbackStatus: "ready",
      aiFeedbackRequestedAt: requestedAt,
      aiFeedbackText: text,
      aiFeedbackNextAvailableAt: reservedSnapshot.nextAvailableAt,
    };

    const { error: updateError } = await admin
      .from("diagnostic_attempts")
      .update({
        ai_feedback: text,
        ai_feedback_requested_at: requestedAt,
        ai_feedback_status: "ready",
        metadata: nextMetadata,
      })
      .eq("id", attemptRow.id)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return Response.json({
      feedback: text,
      requestedAt,
      status: "ready",
      ...reservedSnapshot,
    });
  } catch (error) {
    await admin
      .from("profiles")
      .update(
        plan === "premium"
          ? { ai_diagnostic_last_used_at: previousLastUsedAt }
          : {
              diagnostic_credits: currentSnapshot.credits,
              ai_diagnostic_last_used_at: previousLastUsedAt,
            }
      )
      .eq("id", user.id);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI feedback generation failed.",
        ...currentSnapshot,
      },
      { status: 502 }
    );
  }
}
