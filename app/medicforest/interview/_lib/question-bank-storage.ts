import type { InterviewQuestionStatus } from "../_data/interviewQuestionBank";
import type { createClient } from "@/utils/supabase/client";
import { stripSpeechPauseMarkers } from "./speech-delivery";
export type QuestionStatus = InterviewQuestionStatus;
export type QuestionStatusById = Map<string, QuestionStatus>;
export type QuestionPracticeMode = "text" | "voice";
export type QuestionCompletionReason = "manual" | "timer";
type SupabaseBrowserClient = ReturnType<typeof createClient>;
export type SavedQuestionResponse = {
  questionId: string;
  answer: string;
  completedAt: string;
  elapsedSeconds: number;
  suggestedSeconds: number;
  mode: QuestionPracticeMode;
  completionReason: QuestionCompletionReason;
  wordCount: number;
};

export type QuestionProgressSnapshot = {
  statusById: QuestionStatusById;
  savedResponsesByQuestionId: Map<string, SavedQuestionResponse>;
};

type InterviewQuestionProgressRow = {
  question_id: string;
  status: string | null;
  answer: string | null;
  completed_at: string | null;
  elapsed_seconds: number | null;
  suggested_seconds: number | null;
  mode: string | null;
  completion_reason: string | null;
  word_count: number | null;
};


const completedQuestionStorageKey = "medicforest-interview-question-completed";
const questionStatusStorageKey = "medicforest-interview-question-statuses";
const savedResponseStorageKeyPrefix = "medicforest-interview-question-response:";
const pendingStorageKey = "medicforest-interview-question-pending";
type PendingProgress = { status: QuestionStatus; response?: SavedQuestionResponse; version: string };
const writesByOwner = new Map<string, Promise<void>>();

function readPendingProgress(userId: string | null): Record<string, PendingProgress> {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(questionProgressStorageKey(pendingStorageKey, userId)) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => {
      if (!entry || typeof entry !== "object") return false;
      const candidate = entry as Partial<PendingProgress>;
      return isQuestionStatus(candidate.status) && typeof candidate.version === "string";
    })) as Record<string, PendingProgress>;
  } catch { return {}; }
}

export function hasPendingQuestionProgress(userId: string | null) {
  return Object.keys(readPendingProgress(userId)).length > 0;
}

function savePendingProgress(userId: string | null, pending: Record<string, PendingProgress>) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(questionProgressStorageKey(pendingStorageKey, userId), JSON.stringify(pending)); }
  catch { /* The UI retains the answer when browser storage is unavailable. */ }
}

function clearPendingProgress(userId: string, questionId: string, version: string) {
  const pending = readPendingProgress(userId);
  if (pending[questionId]?.version !== version) return;
  delete pending[questionId];
  savePendingProgress(userId, pending);
  clearBrowserQuestionProgress(questionId, userId);
}

function enqueueProgress(userId: string, write: () => Promise<void>) {
  const previous = writesByOwner.get(userId) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(write);
  writesByOwner.set(userId, next);
  void next.finally(() => {
    if (writesByOwner.get(userId) === next) writesByOwner.delete(userId);
  }).catch(() => undefined);
  return next;
}

export function getWordCount(value: string) {
  const words = stripSpeechPauseMarkers(value).trim().match(/\S+/g);

  return words?.length ?? 0;
}

// Legacy keys remain the guest store. Account stores use a disjoint prefix so
// a shared browser never imports another person's answers on sign-in.
function questionProgressStorageKey(key: string, userId: string | null) {
  return userId ? `medicforest-interview-account:${userId}:${key}` : key;
}

function getSavedResponseStorageKey(questionId: string, userId: string | null) {
  return questionProgressStorageKey(`${savedResponseStorageKeyPrefix}${questionId}`, userId);
}

function isQuestionStatus(value: unknown): value is QuestionStatus {
  return (
    value === "completed" ||
    value === "review" ||
    value === "not-attempted"
  );
}

function readCompletedQuestionIds(userId: string | null) {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const saved = window.localStorage.getItem(questionProgressStorageKey(completedQuestionStorageKey, userId));
    const parsed: unknown = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set<string>();
  }
}

function writeCompletedQuestionIds(questionIds: ReadonlySet<string>, userId: string | null) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      questionProgressStorageKey(completedQuestionStorageKey, userId),
      JSON.stringify([...questionIds].sort())
    );
  } catch {
    // Local progress is best-effort; the attempt still completes in memory.
  }
}

function readQuestionStatusById(userId: string | null): QuestionStatusById {
  if (typeof window === "undefined") return new Map();

  const statusById: QuestionStatusById = new Map();

  try {
    const saved = window.localStorage.getItem(questionProgressStorageKey(questionStatusStorageKey, userId));
    const parsed: unknown = saved ? JSON.parse(saved) : {};

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      Object.entries(parsed as Record<string, unknown>).forEach(
        ([questionId, status]) => {
          if (isQuestionStatus(status) && status !== "not-attempted") {
            statusById.set(questionId, status);
          }
        }
      );
    }

    readCompletedQuestionIds(userId).forEach((questionId) => {
      if (!statusById.has(questionId)) {
        statusById.set(questionId, "completed");
      }
    });

    readSavedResponseQuestionIds(userId).forEach((questionId) => {
      if (!statusById.has(questionId)) {
        statusById.set(questionId, "completed");
      }
    });
  } catch {
    return new Map();
  }

  return statusById;
}

function writeQuestionStatusById(statusById: ReadonlyMap<string, QuestionStatus>, userId: string | null) {
  if (typeof window === "undefined") return;

  try {
    const savedStatuses = Object.fromEntries(
      [...statusById.entries()]
        .filter(([, status]) => status !== "not-attempted")
        .sort(([firstId], [secondId]) => firstId.localeCompare(secondId))
    );
    const completedIds = new Set(
      [...statusById.entries()]
        .filter(([, status]) => status === "completed")
        .map(([questionId]) => questionId)
    );

    window.localStorage.setItem(
      questionProgressStorageKey(questionStatusStorageKey, userId),
      JSON.stringify(savedStatuses)
    );
    writeCompletedQuestionIds(completedIds, userId);
  } catch {
    // Local progress is best-effort; Supabase remains the preferred store.
  }
}

function readSavedQuestionResponse(questionId: string, userId: string | null): SavedQuestionResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(getSavedResponseStorageKey(questionId, userId));
    const parsed: unknown = saved ? JSON.parse(saved) : null;

    if (!parsed || typeof parsed !== "object") return null;

    const response = parsed as Partial<SavedQuestionResponse>;

    if (
      response.questionId !== questionId ||
      typeof response.answer !== "string" ||
      typeof response.completedAt !== "string" ||
      typeof response.elapsedSeconds !== "number" ||
      typeof response.suggestedSeconds !== "number" ||
      (response.mode !== "text" && response.mode !== "voice") ||
      (response.completionReason !== "manual" &&
        response.completionReason !== "timer") ||
      typeof response.wordCount !== "number"
    ) {
      return null;
    }

    return response as SavedQuestionResponse;
  } catch {
    return null;
  }
}

function readSavedResponseQuestionIds(userId: string | null) {
  if (typeof window === "undefined") return new Set<string>();

  const questionIds = new Set<string>();
  const prefix = questionProgressStorageKey(savedResponseStorageKeyPrefix, userId);

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (!key?.startsWith(prefix)) continue;

      const questionId = key.slice(prefix.length);

      if (readSavedQuestionResponse(questionId, userId)) {
        questionIds.add(questionId);
      }
    }
  } catch {
    return new Set<string>();
  }

  return questionIds;
}

function readSavedQuestionResponsesById(userId: string | null) {
  const responsesByQuestionId = new Map<string, SavedQuestionResponse>();

  readSavedResponseQuestionIds(userId).forEach((questionId) => {
    const response = readSavedQuestionResponse(questionId, userId);

    if (response) {
      responsesByQuestionId.set(questionId, response);
    }
  });

  return responsesByQuestionId;
}

function writeSavedQuestionResponse(response: SavedQuestionResponse, userId: string | null) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getSavedResponseStorageKey(response.questionId, userId),
      JSON.stringify(response)
    );
  } catch {
    // Local response saving is best-effort; the review screen still shows it.
  }
}

function removeSavedQuestionResponse(questionId: string, userId: string | null) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getSavedResponseStorageKey(questionId, userId));
  } catch {
    // Ignore storage failures; resetting still clears the visible attempt.
  }
}

export function readBrowserQuestionProgress(userId: string | null): QuestionProgressSnapshot {
  const statusById = readQuestionStatusById(userId);
  const savedResponsesByQuestionId = readSavedQuestionResponsesById(userId);

  savedResponsesByQuestionId.forEach((_response, questionId) => {
    if (!statusById.has(questionId)) {
      statusById.set(questionId, "completed");
    }
  });

  return {
    statusById,
    savedResponsesByQuestionId,
  };
}

export function writeBrowserQuestionProgress(
  questionId: string,
  status: QuestionStatus,
  response: SavedQuestionResponse | undefined,
  userId: string | null
) {
  const pending = readPendingProgress(userId);
  pending[questionId] = { status, response, version: crypto.randomUUID() };
  savePendingProgress(userId, pending);
  const statusById = readQuestionStatusById(userId);

  if (status === "not-attempted") {
    statusById.delete(questionId);
    removeSavedQuestionResponse(questionId, userId);
  } else {
    statusById.set(questionId, status);

    if (response) {
      writeSavedQuestionResponse(response, userId);
    }
  }

  writeQuestionStatusById(statusById, userId);
}

function clearBrowserQuestionProgress(questionId: string, userId: string) {
  const statuses = readQuestionStatusById(userId);
  statuses.delete(questionId);
  removeSavedQuestionResponse(questionId, userId);
  writeQuestionStatusById(statuses, userId);
}

function questionProgressRowToSavedResponse(
  row: InterviewQuestionProgressRow
): SavedQuestionResponse | null {
  if (row.answer === null) return null;

  return {
    questionId: row.question_id,
    answer: row.answer,
    completedAt: row.completed_at ?? "",
    elapsedSeconds: row.elapsed_seconds ?? 0,
    suggestedSeconds: row.suggested_seconds ?? 0,
    mode: row.mode === "voice" ? "voice" : "text",
    completionReason: row.completion_reason === "timer" ? "timer" : "manual",
    wordCount: row.word_count ?? getWordCount(row.answer),
  };
}

function rowsToQuestionProgressSnapshot(
  rows: readonly InterviewQuestionProgressRow[]
): QuestionProgressSnapshot {
  const statusById: QuestionStatusById = new Map();
  const savedResponsesByQuestionId = new Map<string, SavedQuestionResponse>();

  rows.forEach((row) => {
    if (!row.question_id) return;

    const status = isQuestionStatus(row.status)
      ? row.status
      : "not-attempted";
    const response = questionProgressRowToSavedResponse(row);

    if (status !== "not-attempted") {
      statusById.set(row.question_id, status);
    }
    if (response) {
      savedResponsesByQuestionId.set(row.question_id, response);
    }
  });

  return {
    statusById,
    savedResponsesByQuestionId,
  };
}

export function mergeQuestionProgressSnapshots(
  remoteSnapshot: QuestionProgressSnapshot,
  browserSnapshot: QuestionProgressSnapshot,
  userId: string | null = null,
): QuestionProgressSnapshot {
  const statusById = new Map(browserSnapshot.statusById);
  const savedResponsesByQuestionId = new Map(
    browserSnapshot.savedResponsesByQuestionId
  );

  remoteSnapshot.statusById.forEach((status, questionId) => {
    statusById.set(questionId, status);
  });
  remoteSnapshot.savedResponsesByQuestionId.forEach((response, questionId) => {
    savedResponsesByQuestionId.set(questionId, response);
  });
  // Unacknowledged edits, including resets, take precedence when recovering.
  for (const [questionId, pending] of Object.entries(readPendingProgress(userId))) {
    if (pending.status === "not-attempted") {
      statusById.delete(questionId);
      savedResponsesByQuestionId.delete(questionId);
    } else {
      statusById.set(questionId, pending.status);
      if (pending.response) savedResponsesByQuestionId.set(questionId, pending.response);
    }
  }

  return {
    statusById,
    savedResponsesByQuestionId,
  };
}

export async function readSupabaseQuestionProgress(
  supabase: SupabaseBrowserClient,
  userId: string
): Promise<QuestionProgressSnapshot> {
  const { data, error } = await supabase
    .from("interview_question_progress")
    .select(
      [
        "question_id",
        "status",
        "answer",
        "completed_at",
        "elapsed_seconds",
        "suggested_seconds",
        "mode",
        "completion_reason",
        "word_count",
      ].join(",")
    )
    .eq("user_id", userId);

  if (error) throw error;

  return rowsToQuestionProgressSnapshot(
    (data ?? []) as unknown as InterviewQuestionProgressRow[]
  );
}

async function writeRemoteQuestionProgress({
  supabase,
  userId,
  questionId,
  status,
  response,
}: {
  supabase: SupabaseBrowserClient;
  userId: string;
  questionId: string;
  status: QuestionStatus;
  response?: SavedQuestionResponse;
}) {
  if (status === "not-attempted") {
    const { error } = await supabase
      .from("interview_question_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("interview_question_progress").upsert(
    {
      user_id: userId,
      question_id: questionId,
      status,
      answer: response?.answer ?? null,
      completed_at: response?.completedAt ?? null,
      elapsed_seconds: response?.elapsedSeconds ?? 0,
      suggested_seconds: response?.suggestedSeconds ?? 0,
      mode: response?.mode ?? null,
      completion_reason: response?.completionReason ?? null,
      word_count: response?.wordCount ?? 0,
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) throw error;
}

export function writeSupabaseQuestionProgress(args: Parameters<typeof writeRemoteQuestionProgress>[0]) {
  const version = readPendingProgress(args.userId)[args.questionId]?.version;
  return enqueueProgress(args.userId, async () => {
    await writeRemoteQuestionProgress(args);
    if (version) clearPendingProgress(args.userId, args.questionId, version);
  });
}

export function syncBrowserProgressToSupabase({
  supabase, userId, browserSnapshot, remoteSnapshot,
}: {
  supabase: SupabaseBrowserClient;
  userId: string;
  browserSnapshot: QuestionProgressSnapshot;
  remoteSnapshot: QuestionProgressSnapshot;
}) {
  return enqueueProgress(userId, async () => {
    const pending = readPendingProgress(userId);
    const legacyIds = [...new Set([
      ...browserSnapshot.statusById.keys(), ...browserSnapshot.savedResponsesByQuestionId.keys(),
    ])].filter(id => !pending[id] && !remoteSnapshot.statusById.has(id) && !remoteSnapshot.savedResponsesByQuestionId.has(id));
    // Import legacy browser-only answers in bounded batches; another device wins.
    for (let offset = 0; offset < legacyIds.length; offset += 100) {
      const ids = legacyIds.slice(offset, offset + 100);
      const rows = ids.map(questionId => {
        const response = browserSnapshot.savedResponsesByQuestionId.get(questionId);
        return {
          user_id: userId, question_id: questionId,
          status: browserSnapshot.statusById.get(questionId) ?? "completed",
          answer: response?.answer ?? null, completed_at: response?.completedAt ?? null,
          elapsed_seconds: response?.elapsedSeconds ?? 0, suggested_seconds: response?.suggestedSeconds ?? 0,
          mode: response?.mode ?? null, completion_reason: response?.completionReason ?? null,
          word_count: response?.wordCount ?? 0,
        };
      });
      const { error } = await supabase.from("interview_question_progress")
        .upsert(rows, { onConflict: "user_id,question_id", ignoreDuplicates: true });
      if (error) throw error;
      for (const id of ids) {
        if (!readPendingProgress(userId)[id]) clearBrowserQuestionProgress(id, userId);
      }
    }
    for (const [questionId, entry] of Object.entries(pending)) {
      if (readPendingProgress(userId)[questionId]?.version !== entry.version) continue;
      await writeRemoteQuestionProgress({ supabase, userId, questionId, status: entry.status, response: entry.response });
      clearPendingProgress(userId, questionId, entry.version);
    }
  });
}
