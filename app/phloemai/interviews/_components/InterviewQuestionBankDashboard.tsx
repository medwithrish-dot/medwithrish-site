"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Drama,
  FileText,
  Flame,
  GraduationCap,
  Grid3X3,
  HeartHandshake,
  Keyboard,
  Lightbulb,
  Mic,
  MessagesSquare,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { InterviewAccountControls } from "../InterviewAccountControls";
import {
  INTERVIEW_QUESTIONS,
  type InterviewQuestion,
  type InterviewQuestionCategoryTitle,
  type InterviewQuestionStatus,
  type InterviewQuestionSubcategory,
} from "../_data/interviewQuestionBank";
import { InterviewSidebar } from "./InterviewSidebar";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";

type InterviewQuestionCategory = {
  title: InterviewQuestionCategoryTitle;
  description: string;
  subcategories: readonly InterviewQuestionSubcategory[];
  icon: LucideIcon;
  colour: string;
  tint: string;
  iconTint: string;
};

type InterviewQuestionCategorySummary = InterviewQuestionCategory & {
  questions: readonly InterviewQuestion[];
  completed: number;
  total: number;
};

type SummaryStatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

type QuestionStatus = InterviewQuestionStatus;
type StatusFilter = "answered" | "unanswered" | "review";
type QuestionStatusById = Map<string, QuestionStatus>;
type ProgressStorage = "browser" | "supabase";
type SupabaseBrowserClient = ReturnType<typeof createSupabaseClient>;

const defaultStatusFilter = "unanswered" satisfies StatusFilter;
const completedQuestionStorageKey = "phloemai-interview-question-completed";
const questionStatusStorageKey = "phloemai-interview-question-statuses";
const savedResponseStorageKeyPrefix = "phloemai-interview-question-response:";

const categories = [
  {
    title: "Personal & Motivation",
    description: "Work experience / resilience / motivation",
    subcategories: [
      "Motivation for Medicine",
      "Medical School & Course",
      "Work Experience & Reflection",
      "Personal Insight",
      "Strengths, Weaknesses & Resilience",
    ],
    icon: HeartHandshake,
    colour: "#0f9b7d",
    tint: "#f4fbf8",
    iconTint: "#e2f5ef",
  },
  {
    title: "Communication & Teamwork",
    description: "Teamwork / conflict / leadership",
    subcategories: [
      "Communication & Empathy",
      "Teamwork",
      "Leadership",
      "Conflict & Difficult Conversations",
      "Giving & Receiving Feedback",
      "Working in Healthcare Teams",
    ],
    icon: MessagesSquare,
    colour: "#2477ef",
    tint: "#f5f9ff",
    iconTint: "#e6f0ff",
  },
  {
    title: "Ethics & Professionalism",
    description: "Confidentiality / consent / dilemmas",
    subcategories: [
      "Core Medical Ethics",
      "Consent, Capacity & Confidentiality",
      "Safeguarding & Duty of Candour",
      "Professionalism & Professional Boundaries",
      "End-of-Life Care & Assisted Dying",
      "Organ Donation & Resource Allocation",
      "Ethical & Professional Scenarios",
      "Situational Judgement",
    ],
    icon: Scale,
    colour: "#ea5a1d",
    tint: "#fff8f3",
    iconTint: "#ffede3",
  },
  {
    title: "NHS & Healthcare",
    description: "NHS structure / policy / priorities",
    subcategories: [
      "NHS Structure & Challenges",
      "Role of a Doctor",
      "Health Inequalities",
      "Public Health",
      "Healthcare Policy & Funding",
      "Healthcare Resources & Priorities",
    ],
    icon: Stethoscope,
    colour: "#0f9b61",
    tint: "#f5fbf7",
    iconTint: "#e2f5ea",
  },
  {
    title: "Hot Topics & Current Affairs",
    description: "Current events / health policy / debate",
    subcategories: [
      "Current NHS Issues",
      "Technology, AI & Digital Health",
      "New Treatments & Innovation",
      "Public Health Debates",
      "Workforce Issues",
      "Ethics in the News",
    ],
    icon: Flame,
    colour: "#7c4dde",
    tint: "#faf7ff",
    iconTint: "#f0eaff",
  },
  {
    title: "Data, Research & Critical Thinking",
    description: "Graphs / statistics / evidence",
    subcategories: [
      "Data Interpretation",
      "Graphs & Trends",
      "Research & Evidence",
      "Critical Appraisal",
      "Article Analysis",
      "Critical Thinking",
    ],
    icon: ChartNoAxesColumnIncreasing,
    colour: "#169dad",
    tint: "#f4fbfc",
    iconTint: "#e3f5f8",
  },
  {
    title: "Practical MMI & Role Play",
    description: "Scenarios / empathy / stations",
    subcategories: [
      "Role Play",
      "Communication Tasks",
      "Group Discussion",
      "Group Tasks",
      "Prioritisation Stations",
      "Data Stations",
    ],
    icon: Drama,
    colour: "#e9487f",
    tint: "#fff6f9",
    iconTint: "#ffe6ef",
  },
  {
    title: "Curveballs & Quick-Fire",
    description: "Unexpected questions / rapid fire",
    subcategories: [
      "Personal Quick-Fire",
      "Creative Questions",
      "Hypotheticals",
      "Opinion Questions",
      "Unexpected Questions",
    ],
    icon: Sparkles,
    colour: "#f59e0b",
    tint: "#fffbf2",
    iconTint: "#fff1ce",
  },
] as const satisfies readonly InterviewQuestionCategory[];

const categoryTitleLines = {
  "Personal & Motivation": ["Personal &", "Motivation"],
  "Communication & Teamwork": ["Communication", "& Teamwork"],
  "Ethics & Professionalism": ["Ethics &", "Professionalism"],
  "NHS & Healthcare": ["NHS &", "Healthcare"],
  "Hot Topics & Current Affairs": ["Hot Topics &", "Current Affairs"],
  "Data, Research & Critical Thinking": ["Data, Research &", "Critical Thinking"],
  "Practical MMI & Role Play": ["Practical MMI", "& Role Play"],
  "Curveballs & Quick-Fire": ["Curveballs &", "Quick-Fire"],
} as const satisfies Record<InterviewQuestionCategoryTitle, readonly [string, string]>;

const subcategoryIcons = [
  Lightbulb,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  ShieldCheck,
  MessagesSquare,
  UsersRound,
  ChartNoAxesColumnIncreasing,
  FileText,
  Sparkles,
] as const satisfies readonly LucideIcon[];

const statusMeta = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    colour: "#0f9b7d",
  },
  review: {
    label: "Needs Review",
    icon: RefreshCw,
    colour: "#f59e0b",
  },
  "not-attempted": {
    label: "Not Attempted",
    icon: Circle,
    colour: "#b8c3ca",
  },
} as const satisfies Record<
  QuestionStatus,
  { label: string; icon: LucideIcon; colour: string }
>;

type QuestionPracticeMode = "text" | "voice";
type QuestionAttemptPhase = "idle" | "answering" | "review";
type QuestionCompletionReason = "manual" | "timer";

type SavedQuestionResponse = {
  questionId: string;
  answer: string;
  completedAt: string;
  elapsedSeconds: number;
  suggestedSeconds: number;
  mode: QuestionPracticeMode;
  completionReason: QuestionCompletionReason;
  wordCount: number;
};

type TranscriptSegment = {
  id: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
};

type MarkSchemeSection = {
  title: "General" | "Start" | "Middle" | "End";
  items: readonly string[];
};

type QuestionProgressSnapshot = {
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

type QuestionBankNavigationInput = {
  categoryTitle?: string | null;
  subcategoryIndex?: number | null;
  questionId?: string | null;
};

type QuestionBankNavigationState = {
  selectedCategoryTitle: string | null;
  selectedSubcategoryIndex: number;
  activeQuestionId: string | null;
  statusFilter: StatusFilter;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const questionBankPath = "/phloemai/interviews/question-bank";

const categoryRubric = {
  "Personal & Motivation": [
    {
      title: "General",
      items: [
        "Shows genuine motivation rather than a generic claim",
        "Uses specific experiences and explains what they taught you",
        "Links personal qualities to the realities of medical training and patient care",
      ],
    },
    {
      title: "Start",
      items: [
        "Answers the question directly in the first sentence",
        "Names one clear personal trigger, value or experience",
        "Sets a balanced tone without sounding over-rehearsed",
      ],
    },
    {
      title: "Middle",
      items: [
        "Develops one example with reflection, not just description",
        "Explains how your thinking or behaviour changed",
        "Connects strengths and limitations to the role of a doctor",
      ],
    },
    {
      title: "End",
      items: [
        "Summarises why medicine remains a considered choice",
        "Mentions ongoing learning or realistic preparation",
        "Finishes with a concise link back to patients or service",
      ],
    },
  ],
  "Communication & Teamwork": [
    {
      title: "General",
      items: [
        "Acknowledges the other person's perspective before acting",
        "Uses calm, clear and professional language",
        "Balances listening, teamwork and appropriate escalation",
      ],
    },
    {
      title: "Start",
      items: [
        "Identifies the communication problem or team goal",
        "Shows empathy for the person or colleague involved",
        "States the immediate priority clearly",
      ],
    },
    {
      title: "Middle",
      items: [
        "Explains how you would gather information and listen actively",
        "Describes a collaborative next step with clear reasoning",
        "Handles disagreement without blame or defensiveness",
      ],
    },
    {
      title: "End",
      items: [
        "Checks understanding or confirms shared agreement",
        "States when you would escalate or seek support",
        "Links the outcome back to safe patient-centred care",
      ],
    },
  ],
  "Ethics & Professionalism": [
    {
      title: "General",
      items: [
        "Identifies the main stakeholders and competing duties",
        "Balances autonomy, beneficence, non-maleficence and justice",
        "Keeps confidentiality, consent and safeguarding in view where relevant",
      ],
    },
    {
      title: "Start",
      items: [
        "States the ethical tension instead of jumping to a verdict",
        "Clarifies missing facts that would affect the decision",
        "Names the patient's safety and rights as priorities",
      ],
    },
    {
      title: "Middle",
      items: [
        "Weighs more than one reasonable perspective",
        "Applies professional guidance or escalation appropriately",
        "Explains consequences for the patient, staff and wider system",
      ],
    },
    {
      title: "End",
      items: [
        "Gives a justified decision or safe next step",
        "Documents, escalates or reviews where needed",
        "Maintains professionalism even when the situation is difficult",
      ],
    },
  ],
  "NHS & Healthcare": [
    {
      title: "General",
      items: [
        "Shows accurate understanding of the healthcare context",
        "Considers patients, staff and system pressures",
        "Balances benefits, limitations and trade-offs",
      ],
    },
    {
      title: "Start",
      items: [
        "Defines the issue in simple terms",
        "States why it matters to patients or clinicians",
        "Avoids unsupported statistics or sweeping claims",
      ],
    },
    {
      title: "Middle",
      items: [
        "Explains causes, effects and practical constraints",
        "Uses a realistic example from healthcare or work experience",
        "Considers fairness, resources and quality of care",
      ],
    },
    {
      title: "End",
      items: [
        "Gives a balanced final view rather than one-sided criticism",
        "Mentions teamwork, prevention or improvement where relevant",
        "Links back to the responsibilities of future doctors",
      ],
    },
  ],
  "Hot Topics & Current Affairs": [
    {
      title: "General",
      items: [
        "Explains why the issue matters now",
        "Considers more than one viewpoint",
        "Links the topic back to patients and healthcare workers",
      ],
    },
    {
      title: "Start",
      items: [
        "Introduces the topic accurately and neutrally",
        "States the main debate or tension",
        "Separates known facts from opinion",
      ],
    },
    {
      title: "Middle",
      items: [
        "Explores benefits, risks and unintended consequences",
        "Uses evidence-aware reasoning without pretending certainty",
        "Considers impact on trust, access and safety",
      ],
    },
    {
      title: "End",
      items: [
        "Offers a measured conclusion",
        "Identifies what further evidence or safeguards would help",
        "Brings the answer back to compassionate, effective care",
      ],
    },
  ],
  "Data, Research & Critical Thinking": [
    {
      title: "General",
      items: [
        "States the main trend or conclusion clearly",
        "Mentions limitations, bias or uncertainty",
        "Distinguishes evidence from assumption",
      ],
    },
    {
      title: "Start",
      items: [
        "Identifies what the data, article or prompt is asking",
        "States the key observation before detailed interpretation",
        "Defines any comparison, denominator or outcome clearly",
      ],
    },
    {
      title: "Middle",
      items: [
        "Explains patterns using cautious, logical reasoning",
        "Flags confounders, sample issues or missing context",
        "Connects interpretation to clinical or public health impact",
      ],
    },
    {
      title: "End",
      items: [
        "Summarises the safest conclusion supported by the evidence",
        "States what extra information would improve confidence",
        "Avoids overclaiming beyond the data provided",
      ],
    },
  ],
  "Practical MMI & Role Play": [
    {
      title: "General",
      items: [
        "Clarifies the task and the person's concern",
        "Uses empathy while keeping professional boundaries",
        "Keeps the response structured under pressure",
      ],
    },
    {
      title: "Start",
      items: [
        "Introduces yourself or frames the interaction respectfully",
        "Checks what the person understands or needs",
        "Sets a safe and calm tone",
      ],
    },
    {
      title: "Middle",
      items: [
        "Listens actively and responds to emotion",
        "Explains options or information in plain language",
        "Handles conflict, distress or uncertainty without rushing",
      ],
    },
    {
      title: "End",
      items: [
        "Agrees a safe next step or follow-up",
        "Checks understanding and invites questions",
        "Escalates appropriately if risk or safeguarding is present",
      ],
    },
  ],
  "Curveballs & Quick-Fire": [
    {
      title: "General",
      items: [
        "Answers the actual question directly",
        "Gives a brief reason or example",
        "Shows personality while remaining professional",
      ],
    },
    {
      title: "Start",
      items: [
        "Pauses briefly and chooses a clear angle",
        "Gives a direct first-line answer",
        "Avoids apologising for needing a moment to think",
      ],
    },
    {
      title: "Middle",
      items: [
        "Builds the answer with one focused reason",
        "Uses a short example if it adds value",
        "Keeps the response controlled rather than rambling",
      ],
    },
    {
      title: "End",
      items: [
        "Returns to the main point",
        "Ends confidently without adding unnecessary extras",
        "Keeps the closing professional and human",
      ],
    },
  ],
} as const satisfies Record<
  InterviewQuestionCategoryTitle,
  readonly MarkSchemeSection[]
>;

function getPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function getSuggestedAnswerSeconds(question: InterviewQuestion) {
  let seconds = 180;

  if (question.text.length > 180) seconds += 60;
  if (question.text.length > 320) seconds += 60;
  if (
    question.category === "Ethics & Professionalism" ||
    question.category === "Practical MMI & Role Play" ||
    question.subcategory === "Data Stations" ||
    question.subcategory === "Group Tasks"
  ) {
    seconds += 60;
  }
  if (question.difficulty === "advanced") seconds += 60;

  return Math.min(seconds, 480);
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getWordCount(value: string) {
  const words = value.trim().match(/\S+/g);

  return words?.length ?? 0;
}

function getSpokenMinutes(wordCount: number) {
  if (wordCount <= 0) return "0:00";

  return formatTimer(Math.round((wordCount / 130) * 60));
}

function appendTranscript(answer: string, transcript: string) {
  const trimmedTranscript = transcript.trim();
  if (!trimmedTranscript) return answer;

  const spacer = answer.trim() ? " " : "";

  return `${answer.trimEnd()}${spacer}${trimmedTranscript}`;
}

function getSavedResponseStorageKey(questionId: string) {
  return `${savedResponseStorageKeyPrefix}${questionId}`;
}

function isQuestionStatus(value: unknown): value is QuestionStatus {
  return (
    value === "completed" ||
    value === "review" ||
    value === "not-attempted"
  );
}

function readCompletedQuestionIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const saved = window.localStorage.getItem(completedQuestionStorageKey);
    const parsed: unknown = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set<string>();
  }
}

function writeCompletedQuestionIds(questionIds: ReadonlySet<string>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      completedQuestionStorageKey,
      JSON.stringify([...questionIds].sort())
    );
  } catch {
    // Local progress is best-effort; the attempt still completes in memory.
  }
}

function readQuestionStatusById(): QuestionStatusById {
  if (typeof window === "undefined") return new Map();

  const statusById: QuestionStatusById = new Map();

  try {
    const saved = window.localStorage.getItem(questionStatusStorageKey);
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

    readCompletedQuestionIds().forEach((questionId) => {
      if (!statusById.has(questionId)) {
        statusById.set(questionId, "completed");
      }
    });

    readSavedResponseQuestionIds().forEach((questionId) => {
      if (!statusById.has(questionId)) {
        statusById.set(questionId, "completed");
      }
    });
  } catch {
    return new Map();
  }

  return statusById;
}

function writeQuestionStatusById(statusById: ReadonlyMap<string, QuestionStatus>) {
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
      questionStatusStorageKey,
      JSON.stringify(savedStatuses)
    );
    writeCompletedQuestionIds(completedIds);
  } catch {
    // Local progress is best-effort; Supabase remains the preferred store.
  }
}

function readSavedQuestionResponse(questionId: string): SavedQuestionResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(getSavedResponseStorageKey(questionId));
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

function readSavedResponseQuestionIds() {
  if (typeof window === "undefined") return new Set<string>();

  const questionIds = new Set<string>();

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (!key?.startsWith(savedResponseStorageKeyPrefix)) continue;

      const questionId = key.slice(savedResponseStorageKeyPrefix.length);

      if (readSavedQuestionResponse(questionId)) {
        questionIds.add(questionId);
      }
    }
  } catch {
    return new Set<string>();
  }

  return questionIds;
}

function readSavedQuestionResponsesById() {
  const responsesByQuestionId = new Map<string, SavedQuestionResponse>();

  readSavedResponseQuestionIds().forEach((questionId) => {
    const response = readSavedQuestionResponse(questionId);

    if (response) {
      responsesByQuestionId.set(questionId, response);
    }
  });

  return responsesByQuestionId;
}

function writeSavedQuestionResponse(response: SavedQuestionResponse) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getSavedResponseStorageKey(response.questionId),
      JSON.stringify(response)
    );
  } catch {
    // Local response saving is best-effort; the review screen still shows it.
  }
}

function removeSavedQuestionResponse(questionId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getSavedResponseStorageKey(questionId));
  } catch {
    // Ignore storage failures; resetting still clears the visible attempt.
  }
}

function readBrowserQuestionProgress(): QuestionProgressSnapshot {
  const statusById = readQuestionStatusById();
  const savedResponsesByQuestionId = readSavedQuestionResponsesById();

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

function writeBrowserQuestionProgress(
  questionId: string,
  status: QuestionStatus,
  response?: SavedQuestionResponse
) {
  const statusById = readQuestionStatusById();

  if (status === "not-attempted") {
    statusById.delete(questionId);
    removeSavedQuestionResponse(questionId);
  } else {
    statusById.set(questionId, status);

    if (response) {
      writeSavedQuestionResponse(response);
    }
  }

  writeQuestionStatusById(statusById);
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

function mergeQuestionProgressSnapshots(
  remoteSnapshot: QuestionProgressSnapshot,
  browserSnapshot: QuestionProgressSnapshot
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

  return {
    statusById,
    savedResponsesByQuestionId,
  };
}

async function readSupabaseQuestionProgress(
  supabase: SupabaseBrowserClient
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
    );

  if (error) throw error;

  return rowsToQuestionProgressSnapshot(
    (data ?? []) as unknown as InterviewQuestionProgressRow[]
  );
}

async function writeSupabaseQuestionProgress({
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

async function syncBrowserProgressToSupabase({
  supabase,
  userId,
  browserSnapshot,
  remoteSnapshot,
}: {
  supabase: SupabaseBrowserClient;
  userId: string;
  browserSnapshot: QuestionProgressSnapshot;
  remoteSnapshot: QuestionProgressSnapshot;
}) {
  const questionIds = new Set([
    ...browserSnapshot.statusById.keys(),
    ...browserSnapshot.savedResponsesByQuestionId.keys(),
  ]);

  for (const questionId of questionIds) {
    if (
      remoteSnapshot.statusById.has(questionId) ||
      remoteSnapshot.savedResponsesByQuestionId.has(questionId)
    ) {
      continue;
    }

    await writeSupabaseQuestionProgress({
      supabase,
      userId,
      questionId,
      status: browserSnapshot.statusById.get(questionId) ?? "completed",
      response: browserSnapshot.savedResponsesByQuestionId.get(questionId),
    });
    writeBrowserQuestionProgress(questionId, "not-attempted");
  }
}

function buildQuestionBankUrl({
  categoryTitle,
  subcategoryIndex,
  questionId,
}: QuestionBankNavigationInput) {
  const params = new URLSearchParams();

  if (categoryTitle) params.set("category", categoryTitle);
  if (typeof subcategoryIndex === "number") {
    params.set("subcategory", String(subcategoryIndex));
  }
  if (questionId) params.set("question", questionId);

  const queryString = params.toString();

  return queryString ? `${questionBankPath}?${queryString}` : questionBankPath;
}

function resolveQuestionBankNavigationState(
  categoriesWithStats: readonly InterviewQuestionCategorySummary[],
  input: QuestionBankNavigationInput
): QuestionBankNavigationState {
  const questions = categoriesWithStats.flatMap((category) => category.questions);
  const question = input.questionId
    ? questions.find((item) => item.id === input.questionId)
    : undefined;
  const category = categoriesWithStats.find(
    (item) => item.title === (question?.category ?? input.categoryTitle)
  );

  if (!category) {
    return {
      selectedCategoryTitle: null,
      selectedSubcategoryIndex: 0,
      activeQuestionId: null,
      statusFilter: defaultStatusFilter,
    };
  }

  const questionSubcategoryIndex = question
    ? category.subcategories.findIndex(
        (subcategory) => subcategory === question.subcategory
      )
    : -1;
  const nextSubcategoryIndex =
    questionSubcategoryIndex >= 0
      ? questionSubcategoryIndex
      : Number.isInteger(input.subcategoryIndex) &&
          input.subcategoryIndex !== null &&
          input.subcategoryIndex !== undefined &&
          input.subcategoryIndex >= 0 &&
          input.subcategoryIndex < category.subcategories.length
        ? input.subcategoryIndex
        : 0;

  return {
    selectedCategoryTitle: category.title,
    selectedSubcategoryIndex: nextSubcategoryIndex,
    activeQuestionId: question?.id ?? null,
    statusFilter: question
      ? getFilterForQuestionStatus(question.status)
      : defaultStatusFilter,
  };
}

function getQuestionStatus(
  question: InterviewQuestion,
  statusById: ReadonlyMap<string, QuestionStatus>
): QuestionStatus {
  return statusById.get(question.id) ?? "not-attempted";
}

function getCompletedCount(questions: readonly InterviewQuestion[]) {
  return questions.filter((question) => question.status === "completed").length;
}

function getCategoryQuestions(
  categoryTitle: InterviewQuestionCategoryTitle,
  statusById: ReadonlyMap<string, QuestionStatus>
): InterviewQuestion[] {
  const questions: readonly InterviewQuestion[] = INTERVIEW_QUESTIONS;

  return questions.filter(
    (question) => question.category === categoryTitle
  ).map((question) => {
    const status = getQuestionStatus(question, statusById);

    return status === question.status ? question : { ...question, status };
  });
}

function withQuestionStats(
  category: InterviewQuestionCategory,
  statusById: ReadonlyMap<string, QuestionStatus>
): InterviewQuestionCategorySummary {
  const questions = getCategoryQuestions(category.title, statusById);

  return {
    ...category,
    questions,
    completed: getCompletedCount(questions),
    total: questions.length,
  };
}

function getSubcategoryQuestions(
  category: InterviewQuestionCategorySummary,
  subcategory: InterviewQuestionSubcategory
) {
  return category.questions.filter(
    (question) => question.subcategory === subcategory
  );
}

function getSubcategoryStats(
  category: InterviewQuestionCategorySummary,
  subcategory: InterviewQuestionSubcategory
) {
  const questions = getSubcategoryQuestions(category, subcategory);
  const completed = getCompletedCount(questions);
  const total = questions.length;

  return {
    total,
    completed,
    remaining: total - completed,
    percent: getPercent(completed, total),
  };
}

function getQuestionSearchText(question: InterviewQuestion) {
  return [
    question.text,
    question.category,
    question.subcategory,
    question.sourceSectionTitle,
    question.sourceTopic,
    question.difficulty,
    ...question.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFilterForQuestionStatus(status: QuestionStatus): StatusFilter {
  if (status === "completed") return "answered";
  if (status === "review") return "review";
  return "unanswered";
}

function getQuestionMarkScheme(question: InterviewQuestion): MarkSchemeSection[] {
  return categoryRubric[question.category].map((section) => ({
    title: section.title,
    items:
      section.title === "General"
        ? [
            ...section.items,
            `Addresses the ${question.subcategory.toLowerCase()} focus directly`,
            `Keeps the depth appropriate for a ${question.difficulty} question`,
          ]
        : section.items,
  }));
}

function scrollToTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function SummaryStat({ label, value, icon: Icon }: SummaryStatItem) {
  return (
    <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#08787b] shadow-sm ring-1 ring-[#d8e7e7]">
        <Icon className="h-5 w-5" strokeWidth={2.35} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black text-[#071923]">
          {value}
        </span>
        <span className="mt-1 block truncate text-xs font-medium text-[#5d707a]">
          {label}
        </span>
      </span>
    </div>
  );
}

function CategoryCard({
  category,
  onOpen,
}: {
  category: InterviewQuestionCategorySummary;
  onOpen: () => void;
}) {
  const Icon = category.icon;
  const percent = getPercent(category.completed, category.total);
  const remaining = category.total - category.completed;
  const visibleSubcategories = category.subcategories.slice(0, 3);
  const hiddenSubcategoryCount =
    category.subcategories.length - visibleSubcategories.length;
  const titleLines = categoryTitleLines[category.title];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${category.title} interview questions`}
      className="group relative flex h-[276px] w-full flex-col overflow-hidden rounded-xl border border-white/80 bg-white p-5 pt-[22px] text-left shadow-[0_1px_3px_rgba(7,25,35,0.08)] transition-all hover:-translate-y-0.5 hover:border-white hover:shadow-[0_10px_24px_rgba(7,25,35,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159a9d]/40"
      style={{
        background: `linear-gradient(135deg, ${category.tint} 0%, rgba(255,255,255,0.92) 54%, #ffffff 100%)`,
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: category.colour }}
        aria-hidden="true"
      />

      <div className="grid grid-cols-[52px_minmax(0,1fr)_32px] items-start gap-4">
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white ring-1 ring-white/70 transition-transform duration-200 group-hover:scale-[1.04]"
          style={{
            background: `linear-gradient(135deg, ${category.colour} 0%, ${category.colour} 72%, #071923 150%)`,
            boxShadow: `0 14px 24px ${category.colour}26`,
          }}
        >
          <span
            className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-white/25"
            aria-hidden="true"
          />
          <span
            className="absolute -bottom-4 -left-4 h-11 w-11 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25"
            aria-hidden="true"
          />
          <Icon
            className="relative h-7 w-7 drop-shadow-[0_1px_1px_rgba(0,0,0,0.16)]"
            strokeWidth={2.35}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="min-h-12 text-base font-black leading-6 text-[#071923]">
            {titleLines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <p
            className="mt-1 text-[11px] font-black uppercase leading-4 tracking-[0.08em]"
            style={{ color: category.colour }}
          >
            {category.subcategories.length} subcategories
          </p>
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-white/65 transition-transform group-hover:translate-x-0.5"
          style={{
            backgroundColor: category.iconTint,
            color: category.colour,
          }}
          aria-hidden="true"
        >
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.45} />
        </span>
      </div>

      <ul className="mt-[14px] grid gap-1 text-[11px] font-medium leading-[0.95rem] text-[#405562]">
        {visibleSubcategories.map((subcategory) => (
          <li key={subcategory} className="grid grid-cols-[7px_minmax(0,1fr)] gap-2">
            <span
              className="mt-[0.42rem] h-1 w-1 rounded-full"
              style={{ backgroundColor: category.colour }}
              aria-hidden="true"
            />
            <span>{subcategory}</span>
          </li>
        ))}
        {hiddenSubcategoryCount > 0 && (
          <li className="pl-[15px] pt-0.5 text-[10px] font-semibold leading-4 text-[#748791]">
            +{hiddenSubcategoryCount} more
          </li>
        )}
      </ul>

      <div className="mt-auto pt-4">
        <p className="text-sm font-semibold text-[#526976]">
          {category.total} questions
        </p>
        <div className="mt-[12px] h-1.5 overflow-hidden rounded-full bg-[#dfe8ea]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </div>
        <div className="mt-[10px] flex items-center justify-between gap-3 text-xs font-medium text-[#5d707a]">
          <p>{category.completed} done / {remaining} left</p>
          <p>{percent}% complete</p>
        </div>
      </div>
    </button>
  );
}

function SubcategoryCard({
  category,
  title,
  index,
  isActive,
  onSelect,
}: {
  category: InterviewQuestionCategorySummary;
  title: InterviewQuestionSubcategory;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = subcategoryIcons[index % subcategoryIcons.length];
  const stats = getSubcategoryStats(category, title);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className="flex min-h-[176px] w-[220px] shrink-0 flex-col rounded-xl border bg-white p-5 text-left shadow-[0_1px_3px_rgba(7,25,35,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(7,25,35,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159a9d]/40"
      style={{
        borderColor: isActive ? category.colour : "#d8e0e6",
        boxShadow: isActive
          ? `0 10px 24px ${category.colour}18`
          : undefined,
      }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-lg"
        style={{
          backgroundColor: category.iconTint,
          color: category.colour,
        }}
      >
        <Icon className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="mt-5 block text-base font-black leading-5 text-[#071923]">
        {title}
      </span>
      <span className="mt-auto pt-4 text-xs font-medium leading-5 text-[#4a6370]">
        {stats.total} questions
        <br />
        {stats.completed} done
      </span>
      <span className="mt-3 grid grid-cols-[minmax(0,1fr)_34px] items-center gap-3">
        <span className="h-1.5 overflow-hidden rounded-full bg-[#e2eaee]">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${stats.percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </span>
        <span className="text-right text-xs font-semibold text-[#405562]">
          {stats.percent}%
        </span>
      </span>
    </button>
  );
}

function StatusIcon({ status }: { status: QuestionStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <Icon
      className="h-5 w-5"
      strokeWidth={status === "not-attempted" ? 0 : 2.2}
      fill={status === "not-attempted" ? meta.colour : "none"}
      style={{ color: meta.colour }}
      aria-label={meta.label}
    />
  );
}

function ChecklistToggle({
  id,
  label,
  isChecked,
  onToggle,
}: {
  id: string;
  label: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-pressed={isChecked}
      className={`grid w-full grid-cols-[24px_minmax(0,1fr)] items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
        isChecked
          ? "border-[#b9dcda] bg-[#f1fbfa]"
          : "border-[#d8e0e6] bg-white hover:border-[#b9dcda] hover:bg-[#f8fbfb]"
      }`}
    >
      {isChecked ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0f9b7d]" strokeWidth={2.2} />
      ) : (
        <Circle className="mt-1 h-4 w-4 text-[#b8c3ca]" fill="#b8c3ca" strokeWidth={0} />
      )}
      <span className="text-sm font-medium leading-5 text-[#314956]">
        {label}
      </span>
    </button>
  );
}

function QuestionPracticeView({
  category,
  selectedSubcategory,
  question,
  questionNumber,
  showPremiumCard,
  initialSavedResponse,
  onBackToQuestions,
  onQuestionResponseSaved,
  onQuestionReset,
  onQuestionStatusChange,
}: {
  category: InterviewQuestionCategorySummary;
  selectedSubcategory: InterviewQuestionSubcategory;
  question: InterviewQuestion;
  questionNumber: number;
  showPremiumCard: boolean;
  initialSavedResponse: SavedQuestionResponse | null;
  onBackToQuestions: () => void;
  onQuestionResponseSaved: (response: SavedQuestionResponse) => void;
  onQuestionReset: (questionId: string) => void;
  onQuestionStatusChange: (questionId: string, status: QuestionStatus) => void;
}) {
  const Icon = category.icon;
  const suggestedSeconds = getSuggestedAnswerSeconds(question);
  const [answer, setAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(suggestedSeconds);
  const [attemptPhase, setAttemptPhase] =
    useState<QuestionAttemptPhase>("idle");
  const [hasStarted, setHasStarted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceMode, setPracticeMode] = useState<QuestionPracticeMode>("text");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(() => {
    if (typeof window === "undefined") return false;

    const speechWindow = window as SpeechRecognitionWindow;

    return Boolean(
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    );
  });
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set());
  const [savedResponse, setSavedResponse] =
    useState<SavedQuestionResponse | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingElapsedSeconds, setRecordingElapsedSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >(() => []);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingOnStopRef = useRef(false);
  const recordingUrlRef = useRef<string | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingElapsedBeforeStartRef = useRef(0);
  const recordingTickerRef = useRef<number | null>(null);
  const answerRef = useRef("");
  const interimTranscriptRef = useRef("");
  const transcriptSegmentsRef = useRef<TranscriptSegment[]>([]);
  const transcriptSegmentCounterRef = useRef(0);
  const timeRemainingRef = useRef(suggestedSeconds);
  const attemptPhaseRef = useRef<QuestionAttemptPhase>("idle");
  const wordCount = getWordCount(answer);
  const elapsedSeconds = Math.max(0, suggestedSeconds - timeRemaining);
  const timerPercent = getPercent(elapsedSeconds, suggestedSeconds);
  const rubricGroups = getQuestionMarkScheme(question);
  const totalChecklistItems = rubricGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );
  const checkedCount = checkedItems.size;
  const checklistPercent = getPercent(checkedCount, totalChecklistItems);
  const draftAnswer = appendTranscript(answer, interimTranscript);
  const canFinish = Boolean(draftAnswer.trim());
  const isReviewing = attemptPhase === "review";
  const primaryTimerActionLabel =
    isTimerRunning || isListening ? "Pause" : hasStarted ? "Resume" : "Start";
  const savedAnswer = savedResponse?.answer ?? answer;
  const savedWordCount = savedResponse?.wordCount ?? getWordCount(savedAnswer);
  const reviewElapsedSeconds = savedResponse?.elapsedSeconds ?? elapsedSeconds;
  const completionLabel =
    savedResponse?.completionReason === "timer"
      ? "Timer ended"
      : "Submitted manually";
  const reviewStatusOptions = [
    { label: "Answered", status: "completed", icon: CheckCircle2 },
    { label: "Review", status: "review", icon: RefreshCw },
    { label: "Unanswered", status: "not-attempted", icon: Circle },
  ] as const satisfies readonly {
    label: string;
    status: QuestionStatus;
    icon: LucideIcon;
  }[];
  const activePlaybackSegmentId =
    transcriptSegments.find(
      (segment) =>
        playbackSeconds >= segment.startSeconds &&
        playbackSeconds <= segment.endSeconds
    )?.id ?? null;

  const beginAttempt = useCallback(() => {
    if (
      attemptPhaseRef.current === "review" ||
      timeRemainingRef.current <= 0
    ) {
      return false;
    }

    attemptPhaseRef.current = "answering";
    setAttemptPhase("answering");
    setHasStarted(true);
    setSavedResponse(null);
    setIsTimerRunning(true);

    return true;
  }, []);

  const getRecordingElapsedMs = useCallback(() => {
    const activeElapsedMs =
      recordingStartedAtRef.current === null
        ? 0
        : Date.now() - recordingStartedAtRef.current;

    return recordingElapsedBeforeStartRef.current + activeElapsedMs;
  }, []);

  const stopRecordingTicker = useCallback(() => {
    if (recordingTickerRef.current === null) return;

    window.clearInterval(recordingTickerRef.current);
    recordingTickerRef.current = null;
  }, []);

  const startRecordingTicker = useCallback(() => {
    stopRecordingTicker();
    setRecordingElapsedSeconds(Math.round(getRecordingElapsedMs() / 1000));
    recordingTickerRef.current = window.setInterval(() => {
      setRecordingElapsedSeconds(Math.round(getRecordingElapsedMs() / 1000));
    }, 250);
  }, [getRecordingElapsedMs, stopRecordingTicker]);

  const revokeRecordingUrl = useCallback(() => {
    if (!recordingUrlRef.current) return;

    window.URL.revokeObjectURL(recordingUrlRef.current);
    recordingUrlRef.current = null;
    setRecordingUrl(null);
  }, []);

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const stopAudioRecording = useCallback(() => {
    if (recordingStartedAtRef.current !== null) {
      recordingElapsedBeforeStartRef.current +=
        Date.now() - recordingStartedAtRef.current;
      recordingStartedAtRef.current = null;
    }

    stopRecordingTicker();
    setRecordingElapsedSeconds(Math.round(getRecordingElapsedMs() / 1000));

    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      mediaRecorderRef.current = null;
      stopMediaStream();
      setIsRecordingAudio(false);
      return;
    }

    try {
      recorder.stop();
    } catch {
      mediaRecorderRef.current = null;
      stopMediaStream();
      setIsRecordingAudio(false);
    }
  }, [getRecordingElapsedMs, stopMediaStream, stopRecordingTicker]);

  const clearAudioRecording = useCallback(() => {
    discardRecordingOnStopRef.current = true;
    stopAudioRecording();
    audioChunksRef.current = [];
    recordingElapsedBeforeStartRef.current = 0;
    recordingStartedAtRef.current = null;
    transcriptSegmentsRef.current = [];
    transcriptSegmentCounterRef.current = 0;
    setRecordingElapsedSeconds(0);
    setPlaybackSeconds(0);
    setTranscriptSegments([]);
    setRecordingError(null);
    revokeRecordingUrl();
  }, [revokeRecordingUrl, stopAudioRecording]);

  const startAudioRecording = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !("MediaRecorder" in window)
    ) {
      setRecordingError("Audio recording is not available in this browser.");
      return;
    }

    const currentRecorder = mediaRecorderRef.current;

    if (currentRecorder && currentRecorder.state !== "inactive") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      discardRecordingOnStopRef.current = false;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const shouldDiscard = discardRecordingOnStopRef.current;

        mediaRecorderRef.current = null;
        stopMediaStream();
        setIsRecordingAudio(false);

        if (shouldDiscard) {
          discardRecordingOnStopRef.current = false;
          return;
        }

        const recordingBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (recordingBlob.size <= 0) return;

        revokeRecordingUrl();
        const nextRecordingUrl = window.URL.createObjectURL(recordingBlob);

        recordingUrlRef.current = nextRecordingUrl;
        setRecordingUrl(nextRecordingUrl);
      };

      recorder.start();
      recordingStartedAtRef.current = Date.now();
      setIsRecordingAudio(true);
      setRecordingError(null);
      startRecordingTicker();
    } catch {
      stopMediaStream();
      mediaRecorderRef.current = null;
      setIsRecordingAudio(false);
      setRecordingError("Audio recording could not start.");
    }
  }, [revokeRecordingUrl, startRecordingTicker, stopMediaStream]);

  const addTranscriptSegment = useCallback(
    (transcript: string) => {
      const cleanTranscript = transcript.trim();

      if (!cleanTranscript) return;

      const endSeconds = Math.max(0.4, getRecordingElapsedMs() / 1000);
      const spokenWordCount = getWordCount(cleanTranscript);
      const estimatedDuration = Math.max(0.8, spokenWordCount / 2.6);
      const previousEndSeconds =
        transcriptSegmentsRef.current.at(-1)?.endSeconds ?? 0;
      const startSeconds = Math.max(
        previousEndSeconds,
        endSeconds - estimatedDuration
      );
      const segment: TranscriptSegment = {
        id: `segment-${transcriptSegmentCounterRef.current}`,
        text: cleanTranscript,
        startSeconds,
        endSeconds: Math.max(endSeconds, startSeconds + 0.4),
      };

      transcriptSegmentCounterRef.current += 1;
      transcriptSegmentsRef.current = [
        ...transcriptSegmentsRef.current,
        segment,
      ];
      setTranscriptSegments(transcriptSegmentsRef.current);
    },
    [getRecordingElapsedMs]
  );

  const commitInterimTranscript = useCallback(() => {
    const interim = interimTranscriptRef.current.trim();

    if (!interim) return answerRef.current;

    const nextAnswer = appendTranscript(answerRef.current, interim);

    answerRef.current = nextAnswer;
    interimTranscriptRef.current = "";
    setAnswer(nextAnswer);
    setInterimTranscript("");
    addTranscriptSegment(interim);

    return nextAnswer;
  }, [addTranscriptSegment]);

  const stopListening = useCallback(
    ({ commitInterim = false }: { commitInterim?: boolean } = {}) => {
      if (commitInterim) {
        commitInterimTranscript();
      }

      const recognition = recognitionRef.current;

      recognitionRef.current = null;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;

        try {
          recognition.stop();
        } catch {
          // The browser may already have stopped recognition.
        }
      }

      setIsListening(false);
      stopAudioRecording();

      if (!commitInterim) {
        interimTranscriptRef.current = "";
        setInterimTranscript("");
      }
    },
    [commitInterimTranscript, stopAudioRecording]
  );

  const completeAttempt = useCallback(
    (completionReason: QuestionCompletionReason) => {
      if (attemptPhaseRef.current === "review") return;

      const finalAnswer = appendTranscript(
        answerRef.current,
        interimTranscriptRef.current
      );
      const finalInterimTranscript = interimTranscriptRef.current;
      const remainingSeconds =
        completionReason === "timer" ? 0 : timeRemainingRef.current;
      const completedAt = new Date().toISOString();
      const response: SavedQuestionResponse = {
        questionId: question.id,
        answer: finalAnswer,
        completedAt,
        elapsedSeconds: Math.min(
          suggestedSeconds,
          Math.max(0, suggestedSeconds - remainingSeconds)
        ),
        suggestedSeconds,
        mode: practiceMode,
        completionReason,
        wordCount: getWordCount(finalAnswer),
      };

      attemptPhaseRef.current = "review";
      answerRef.current = finalAnswer;
      interimTranscriptRef.current = "";
      timeRemainingRef.current = remainingSeconds;
      setAnswer(finalAnswer);
      setInterimTranscript("");
      setSavedResponse(response);
      setAttemptPhase("review");
      setHasStarted(true);
      setIsTimerRunning(false);
      setTimeRemaining(remainingSeconds);
      addTranscriptSegment(finalInterimTranscript);
      stopListening();
      onQuestionResponseSaved(response);
      scrollToTop();
    },
    [
      addTranscriptSegment,
      onQuestionResponseSaved,
      practiceMode,
      question.id,
      stopListening,
      suggestedSeconds,
    ]
  );

  const startListening = useCallback(() => {
    if (
      typeof window === "undefined" ||
      attemptPhaseRef.current === "review" ||
      timeRemainingRef.current <= 0
    ) {
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError("Voice transcription is not available in this browser.");
      return;
    }

    if (recognitionRef.current) {
      stopListening({ commitInterim: true });
    }
    setSpeechSupported(true);
    setSpeechError(null);
    setPracticeMode("voice");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";
    recognition.onresult = (event) => {
      if (
        recognitionRef.current !== recognition ||
        attemptPhaseRef.current === "review"
      ) {
        return;
      }

      let finalTranscript = "";
      let interim = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript.trim()) {
        const nextAnswer = appendTranscript(answerRef.current, finalTranscript);

        answerRef.current = nextAnswer;
        setAnswer(nextAnswer);
        setSavedResponse(null);
        addTranscriptSegment(finalTranscript);
      }

      interimTranscriptRef.current = interim.trim();
      setInterimTranscript(interim.trim());
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;

      commitInterimTranscript();
      recognitionRef.current = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      setSpeechError(
        event.error
          ? `Voice transcription stopped: ${event.error}.`
          : "Voice transcription stopped."
      );
      setIsListening(false);
      stopAudioRecording();
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;

      commitInterimTranscript();
      recognitionRef.current = null;
      setIsListening(false);
      stopAudioRecording();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      void startAudioRecording();
      setIsListening(true);
      beginAttempt();
    } catch {
      recognitionRef.current = null;
      setSpeechError("Voice transcription could not start.");
      setIsListening(false);
    }
  }, [
    addTranscriptSegment,
    beginAttempt,
    commitInterimTranscript,
    startAudioRecording,
    stopAudioRecording,
    stopListening,
  ]);

  const pauseAttempt = useCallback(() => {
    setIsTimerRunning(false);
    stopListening({ commitInterim: true });
  }, [stopListening]);

  const resumeAttempt = useCallback(() => {
    if (practiceMode === "voice") {
      startListening();
      return;
    }

    beginAttempt();
  }, [beginAttempt, practiceMode, startListening]);

  const resetAttempt = useCallback(() => {
    stopListening();
    clearAudioRecording();
    answerRef.current = "";
    interimTranscriptRef.current = "";
    timeRemainingRef.current = suggestedSeconds;
    attemptPhaseRef.current = "idle";
    setAnswer("");
    setTimeRemaining(suggestedSeconds);
    setAttemptPhase("idle");
    setHasStarted(false);
    setIsTimerRunning(false);
    setSavedResponse(null);
    setSpeechError(null);
    setCheckedItems(new Set());
    removeSavedQuestionResponse(question.id);
    onQuestionReset(question.id);
  }, [
    clearAudioRecording,
    onQuestionReset,
    question.id,
    stopListening,
    suggestedSeconds,
  ]);

  const handleReviewStatusChange = (status: QuestionStatus) => {
    if (status === "not-attempted") {
      resetAttempt();
      return;
    }

    onQuestionStatusChange(question.id, status);
  };

  const handlePrimaryTimerAction = () => {
    if (isTimerRunning || isListening) {
      pauseAttempt();
      return;
    }

    resumeAttempt();
  };

  const handleAnswerChange = (value: string) => {
    answerRef.current = value;
    setAnswer(value);
    setSavedResponse(null);
    transcriptSegmentsRef.current = [];
    setTranscriptSegments([]);
    setPlaybackSeconds(0);

    if (value.trim() && attemptPhaseRef.current === "idle") {
      beginAttempt();
    }
  };

  const handleBackToQuestions = () => {
    setIsTimerRunning(false);
    stopListening({ commitInterim: true });
    onBackToQuestions();
  };

  const switchToTextMode = () => {
    setPracticeMode("text");
    setSpeechError(null);
    stopListening({ commitInterim: true });
  };

  const toggleVoiceMode = () => {
    if (isListening) {
      stopListening({ commitInterim: true });
      return;
    }

    startListening();
  };

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    attemptPhaseRef.current = attemptPhase;
  }, [attemptPhase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const saved = initialSavedResponse ?? readSavedQuestionResponse(question.id);

      if (!saved) return;

      const remainingSeconds = Math.max(
        0,
        suggestedSeconds - Math.min(saved.elapsedSeconds, suggestedSeconds)
      );

      answerRef.current = saved.answer;
      interimTranscriptRef.current = "";
      timeRemainingRef.current = remainingSeconds;
      attemptPhaseRef.current = "review";
      setAnswer(saved.answer);
      setInterimTranscript("");
      setSavedResponse(saved);
      setTimeRemaining(remainingSeconds);
      setAttemptPhase("review");
      setHasStarted(true);
      setIsTimerRunning(false);
      stopListening();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialSavedResponse, question.id, stopListening, suggestedSeconds]);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      const recorder = mediaRecorderRef.current;

      recognitionRef.current = null;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;

        try {
          recognition.stop();
        } catch {
          // The browser may already have stopped recognition.
        }
      }

      discardRecordingOnStopRef.current = true;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        try {
          recorder.stop();
        } catch {
          // The recorder may already have stopped.
        }
      }
      stopMediaStream();
      stopRecordingTicker();

      if (recordingUrlRef.current) {
        window.URL.revokeObjectURL(recordingUrlRef.current);
        recordingUrlRef.current = null;
      }
    };
  }, [stopMediaStream, stopRecordingTicker]);

  useEffect(() => {
    if (!isTimerRunning || attemptPhase !== "answering") return undefined;

    const intervalId = window.setInterval(() => {
      setTimeRemaining((current) => {
        const next = Math.max(0, current - 1);

        timeRemainingRef.current = next;
        if (next === 0) {
          setIsTimerRunning(false);
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attemptPhase, isTimerRunning]);

  useEffect(() => {
    if (attemptPhase === "answering" && timeRemaining === 0) {
      completeAttempt("timer");
    }
  }, [attemptPhase, completeAttempt, timeRemaining]);

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const renderTranscriptText = () => {
    const hasSegments = transcriptSegments.length > 0;
    const hasAnswer = Boolean(answer.trim());
    const hasInterim = Boolean(interimTranscript.trim());

    if (!hasSegments && !hasAnswer && !hasInterim) {
      return (
        <span className="text-[#8091a0]">
          Start speaking and your transcript will appear here...
        </span>
      );
    }

    if (hasSegments) {
      return (
        <>
          {transcriptSegments.map((segment) => {
            const isPlaybackActive = segment.id === activePlaybackSegmentId;

            return (
              <span
                key={segment.id}
                className={`rounded px-0.5 transition-colors ${
                  isPlaybackActive
                    ? "bg-[#dff7ef] text-[#056d57] ring-1 ring-[#9ad8c7]"
                    : "text-[#071923]"
                }`}
              >
                {segment.text}{" "}
              </span>
            );
          })}
          {hasInterim && (
            <span className="rounded bg-[#e2f5ef] px-1 font-semibold text-[#0f9b7d]">
              {interimTranscript}
            </span>
          )}
        </>
      );
    }

    return (
      <>
        {hasAnswer && <span className="text-[#071923]">{answer} </span>}
        {hasInterim && (
          <span className="rounded bg-[#e2f5ef] px-1 font-semibold text-[#0f9b7d]">
            {interimTranscript}
          </span>
        )}
      </>
    );
  };

  const renderVoiceRecorderPanel = () => (
    <div className="mt-4 rounded-xl border border-[#cfe2df] bg-[#fbfdfd] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-black ${
              isListening || isRecordingAudio
                ? "bg-[#e2f5ef] text-[#08787b]"
                : "bg-[#eef3f4] text-[#4a6370]"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isListening || isRecordingAudio
                  ? "animate-pulse bg-[#0f9b7d]"
                  : "bg-[#b8c8cf]"
              }`}
              aria-hidden="true"
            />
            {isRecordingAudio ? "Recording" : isListening ? "Listening" : "Voice ready"}
          </span>
          <span className="text-sm font-black text-[#071923]">
            {formatTimer(recordingElapsedSeconds)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-[#4a6370]">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#071923]" aria-hidden="true" />
          Confirmed
          <span className="ml-3 h-2.5 w-2.5 rounded-sm bg-[#0f9b7d]" aria-hidden="true" />
          Live
        </div>
      </div>

      {recordingError && (
        <p className="mt-3 rounded-lg border border-[#f5d5a5] bg-[#fff8ec] px-3 py-2 text-sm font-medium text-[#8a5600]">
          {recordingError}
        </p>
      )}

      {recordingUrl && (
        <audio
          controls
          src={recordingUrl}
          onTimeUpdate={(event) =>
            setPlaybackSeconds(event.currentTarget.currentTime)
          }
          onSeeked={(event) =>
            setPlaybackSeconds(event.currentTarget.currentTime)
          }
          onEnded={() => setPlaybackSeconds(0)}
          className="mt-4 w-full"
        />
      )}

      <div className="mt-4 min-h-[104px] rounded-xl border border-[#d8e0e6] bg-white p-4 text-base font-medium leading-7 text-[#071923]">
        {renderTranscriptText()}
      </div>
    </div>
  );

  const renderMarkScheme = () => (
    <aside className="space-y-5">
      <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-black text-[#071923]">
            Mark Scheme
          </h2>
          <span className="text-sm font-black text-[#08787b]">
            {checklistPercent}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe8ea]">
          <div
            className="h-full rounded-full bg-[#159a9d]"
            style={{ width: `${checklistPercent}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-[#4a6370]">
          {checkedCount} / {totalChecklistItems} covered
        </p>
        <a
          href="/phloemai/interview-question-markscheme-rubrics.pdf"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#b8c8cf] bg-white px-4 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Rubric PDF
        </a>
      </section>

      {rubricGroups.map((group) => (
        <section
          key={group.title}
          className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]"
        >
          <h3 className="text-sm font-black text-[#08787b]">
            {group.title}
          </h3>
          <div className="mt-4 space-y-3">
            {group.items.map((item) => {
              const id = `${group.title}-${item}`;

              return (
                <ChecklistToggle
                  key={id}
                  id={id}
                  label={item}
                  isChecked={checkedItems.has(id)}
                  onToggle={toggleChecklistItem}
                />
              );
            })}
          </div>
        </section>
      ))}
    </aside>
  );

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBackToQuestions}
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#08787b] transition-colors hover:text-[#042724]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to questions
              </button>
              <InterviewAccountControls />
            </div>

            <section className="mt-5 rounded-xl border border-[#d8e0e6] bg-white/90 p-5 shadow-[0_1px_3px_rgba(7,25,35,0.08)]">
              <div className="grid gap-5 xl:grid-cols-[80px_minmax(0,1fr)_260px] xl:items-center">
                <div
                  className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl text-white ring-1 ring-white/70"
                  style={{
                    background: `linear-gradient(135deg, ${category.colour} 0%, ${category.colour} 72%, #071923 150%)`,
                    boxShadow: `0 18px 30px ${category.colour}26`,
                  }}
                >
                  <span className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/25" aria-hidden="true" />
                  <span className="absolute -bottom-5 -left-5 h-14 w-14 rounded-full bg-white/10" aria-hidden="true" />
                  <Icon className="relative h-10 w-10" strokeWidth={2.3} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#08787b]">
                    {category.title} / {selectedSubcategory}
                  </p>
                  <h1 className="mt-3 text-2xl font-black leading-tight text-[#071923]">
                    {question.text}
                  </h1>
                  <p className="mt-3 text-sm font-medium text-[#4a6370]">
                    Question {String(questionNumber).padStart(2, "0")}{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {question.difficulty}{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    section {question.sourceSection}
                  </p>
                </div>
                <div className="rounded-xl border border-[#d8e0e6] bg-[#f8fbfb] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#4a6370]">
                      Timer
                    </span>
                    <span className="text-2xl font-black text-[#071923]">
                      {formatTimer(timeRemaining)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe8ea]">
                    <div
                      className="h-full rounded-full bg-[#159a9d]"
                      style={{ width: `${timerPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#5d707a]">
                    Suggested {formatTimer(suggestedSeconds)} answer
                  </p>
                </div>
              </div>
            </section>

            {isReviewing ? (
              <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                  <section className="rounded-xl border border-[#b9dcda] bg-[#f1fbfa] p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-base font-black text-[#071923]">
                          Review Saved Answer
                        </h2>
                        <p className="mt-2 text-sm font-medium text-[#4a6370]">
                          {completionLabel} / {savedWordCount} words /{" "}
                          {formatTimer(reviewElapsedSeconds)} used
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#d8e0e6] bg-white/70 px-4 text-sm font-black text-[#748791] shadow-sm"
                        >
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          AI Feedback
                        </button>
                        <button
                          type="button"
                          onClick={resetAttempt}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#159a9d] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#08787b]"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Retry This Question
                        </button>
                        <button
                          type="button"
                          onClick={handleBackToQuestions}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#b8c8cf] bg-white px-4 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Done
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 min-h-[240px] whitespace-pre-wrap rounded-xl border border-[#b9dcda] bg-white p-4 text-base font-medium leading-7 text-[#071923]">
                      {savedAnswer.trim() ||
                        "No response was captured before the timer ended."}
                    </div>
                    {(recordingUrl || transcriptSegments.length > 0) &&
                      renderVoiceRecorderPanel()}
                  </section>

                  <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <h2 className="text-base font-black text-[#071923]">
                      Status
                    </h2>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {reviewStatusOptions.map((option) => {
                        const OptionIcon = option.icon;
                        const isActive = question.status === option.status;

                        return (
                          <button
                            key={option.status}
                            type="button"
                            onClick={() => handleReviewStatusChange(option.status)}
                            aria-pressed={isActive}
                            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-black shadow-sm transition-colors ${
                              isActive
                                ? "border-[#159a9d] bg-[#159a9d] text-white"
                                : "border-[#d8e0e6] bg-white text-[#071923] hover:border-[#08787b] hover:text-[#08787b]"
                            }`}
                          >
                            <OptionIcon
                              className="h-4 w-4"
                              strokeWidth={option.status === "not-attempted" ? 0 : 2.2}
                              fill={option.status === "not-attempted" ? "currentColor" : "none"}
                              aria-hidden="true"
                            />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#4a6370]">
                      Response saved. Check it against the mark scheme before moving on.
                    </p>
                  </section>
                </div>

                {renderMarkScheme()}
              </section>
            ) : (
              <section className="mt-5 max-w-5xl">
                <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-base font-black text-[#071923]">
                        Your Response
                      </h2>
                      <p className="mt-2 text-sm font-medium text-[#4a6370]">
                        {wordCount} words / about {getSpokenMinutes(wordCount)} spoken
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrimaryTimerAction}
                        disabled={timeRemaining === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06254a] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#071923] disabled:cursor-not-allowed disabled:bg-[#b8c8cf]"
                      >
                        {isTimerRunning || isListening ? (
                          <Pause className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Play className="h-4 w-4" aria-hidden="true" />
                        )}
                        {primaryTimerActionLabel}
                      </button>
                      <button
                        type="button"
                        onClick={resetAttempt}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#b8c8cf] bg-white px-4 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex w-fit overflow-hidden rounded-lg border border-[#d8e0e6] bg-white">
                    <button
                      type="button"
                      onClick={switchToTextMode}
                      aria-pressed={practiceMode === "text"}
                      className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-black transition-colors ${
                        practiceMode === "text"
                          ? "bg-[#06254a] text-white"
                          : "text-[#071923] hover:bg-[#f4f8f8]"
                      }`}
                    >
                      <Keyboard className="h-4 w-4" aria-hidden="true" />
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoiceMode}
                      aria-pressed={practiceMode === "voice"}
                      disabled={timeRemaining === 0 || !speechSupported}
                      className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:text-[#8fa0a8] ${
                        practiceMode === "voice"
                          ? "bg-[#06254a] text-white disabled:bg-[#b8c8cf] disabled:text-white"
                          : "text-[#071923] hover:bg-[#f4f8f8]"
                      }`}
                    >
                      <Mic className="h-4 w-4" aria-hidden="true" />
                      {isListening ? "Listening" : "Voice"}
                    </button>
                  </div>

                  {speechError && (
                    <p className="mt-3 rounded-lg border border-[#f5d5a5] bg-[#fff8ec] px-3 py-2 text-sm font-medium text-[#8a5600]">
                      {speechError}
                    </p>
                  )}
                  {practiceMode === "voice" ? (
                    renderVoiceRecorderPanel()
                  ) : (
                    <textarea
                      value={answer}
                      onChange={(event) =>
                        handleAnswerChange(event.target.value)
                      }
                      className="mt-4 min-h-[330px] w-full resize-y rounded-xl border border-[#d8e0e6] bg-[#fbfdfd] p-4 text-base font-medium leading-7 text-[#071923] outline-none transition-colors placeholder:text-[#8091a0] focus:border-[#159a9d] focus:bg-white focus:ring-2 focus:ring-[#159a9d]/15"
                      placeholder="Start typing your answer..."
                    />
                  )}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-[#4a6370]">
                      {timeRemaining === 0
                        ? "Time is up"
                        : isTimerRunning || isListening
                          ? "Attempt in progress"
                          : hasStarted
                            ? "Paused"
                            : "Ready to start"}
                    </p>
                    <button
                      type="button"
                      disabled={!canFinish}
                      onClick={() => completeAttempt("manual")}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#159a9d] px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#08787b] disabled:cursor-not-allowed disabled:bg-[#b8c8cf]"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Finish & Review
                    </button>
                  </div>
                </section>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuestionBankCategoryView({
  category,
  selectedSubcategoryIndex,
  statusFilter,
  questionQuery,
  savedResponseQuestionIds,
  showPremiumCard,
  onBack,
  onSelectSubcategory,
  onStatusFilterChange,
  onQuestionQueryChange,
  onOpenQuestion,
}: {
  category: InterviewQuestionCategorySummary;
  selectedSubcategoryIndex: number;
  statusFilter: StatusFilter;
  questionQuery: string;
  savedResponseQuestionIds: ReadonlySet<string>;
  showPremiumCard: boolean;
  onBack: () => void;
  onSelectSubcategory: (index: number) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onQuestionQueryChange: (query: string) => void;
  onOpenQuestion: (question: InterviewQuestion) => void;
}) {
  const Icon = category.icon;
  const questionListRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoreTimeoutRef = useRef<number | null>(null);
  const [temporaryListMinHeight, setTemporaryListMinHeight] =
    useState<number | null>(null);
  const percent = getPercent(category.completed, category.total);
  const selectedSubcategory =
    category.subcategories[selectedSubcategoryIndex] ??
    category.subcategories[0] ??
    "Motivation for Medicine";
  const selectedStats = getSubcategoryStats(category, selectedSubcategory);
  const questions = useMemo(
    () => getSubcategoryQuestions(category, selectedSubcategory),
    [category, selectedSubcategory]
  );
  const questionNumbers = useMemo(
    () =>
      new Map(
        questions.map((question, index) => [question.id, index + 1] as const)
      ),
    [questions]
  );
  const normalisedQuestionQuery = questionQuery.trim().toLowerCase();
  const filteredQuestions = questions.filter((question) => {
    const matchesStatus =
      (statusFilter === "answered" && question.status === "completed") ||
      (statusFilter === "unanswered" &&
        question.status === "not-attempted") ||
      (statusFilter === "review" && question.status === "review");
    const matchesQuery =
      !normalisedQuestionQuery ||
      getQuestionSearchText(question).includes(normalisedQuestionQuery);

    return matchesStatus && matchesQuery;
  });
  const savedResponseQuestions = questions.filter((question) =>
    savedResponseQuestionIds.has(question.id)
  );
  const firstSavedResponseQuestion = savedResponseQuestions[0] ?? null;
  const statusCounts = questions.reduce(
    (acc, question) => ({
      ...acc,
      [question.status]: acc[question.status] + 1,
    }),
    { completed: 0, review: 0, "not-attempted": 0 } satisfies Record<
      QuestionStatus,
      number
    >
  );
  const remaining = category.total - category.completed;

  const selectSubcategory = (index: number) => {
    onSelectSubcategory(index);
    onStatusFilterChange(defaultStatusFilter);
    onQuestionQueryChange("");
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    if (filter === statusFilter) return;

    const scrollY = window.scrollY;
    const listHeight = questionListRef.current?.getBoundingClientRect().height;

    if (listHeight && listHeight > 0) {
      setTemporaryListMinHeight(listHeight);
    }

    onStatusFilterChange(filter);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });

      if (scrollRestoreTimeoutRef.current !== null) {
        window.clearTimeout(scrollRestoreTimeoutRef.current);
      }

      scrollRestoreTimeoutRef.current = window.setTimeout(() => {
        setTemporaryListMinHeight(null);
        window.requestAnimationFrame(() => {
          const maxScrollY = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight
          );

          window.scrollTo({
            top: Math.min(scrollY, maxScrollY),
            behavior: "auto",
          });
        });
      }, 120);
    });
  };

  const openRandomQuestion = () => {
    const nextSubcategoryIndex = Math.floor(
      Math.random() * category.subcategories.length
    );
    const nextSubcategory =
      category.subcategories[nextSubcategoryIndex] ?? category.subcategories[0];
    if (!nextSubcategory) return;
    const nextQuestions = getSubcategoryQuestions(category, nextSubcategory);
    const nextQuestion =
      nextQuestions[Math.floor(Math.random() * nextQuestions.length)] ??
      nextQuestions[0];

    if (nextQuestion) onOpenQuestion(nextQuestion);
  };

  const resumePractice = () => {
    const nextQuestion =
      questions.find((question) => question.status === "not-attempted") ??
      questions[0];

    if (nextQuestion) onOpenQuestion(nextQuestion);
  };

  const filterOptions = [
    { label: `Answered (${statusCounts.completed})`, value: "answered" },
    {
      label: `Unanswered (${statusCounts["not-attempted"]})`,
      value: "unanswered",
    },
    { label: `Review (${statusCounts.review})`, value: "review" },
  ] as const satisfies readonly { label: string; value: StatusFilter }[];

  useEffect(() => {
    return () => {
      if (scrollRestoreTimeoutRef.current !== null) {
        window.clearTimeout(scrollRestoreTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#08787b] transition-colors hover:text-[#042724]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all categories
              </button>
              <InterviewAccountControls />
            </div>

            <section className="mt-5 rounded-xl border border-[#d8e0e6] bg-white/90 p-5 shadow-[0_1px_3px_rgba(7,25,35,0.08)]">
              <div className="grid gap-5 lg:grid-cols-[88px_minmax(0,1fr)_auto] lg:items-center">
                <div
                  className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl text-white ring-1 ring-white/70"
                  style={{
                    background: `linear-gradient(135deg, ${category.colour} 0%, ${category.colour} 72%, #071923 150%)`,
                    boxShadow: `0 18px 30px ${category.colour}26`,
                  }}
                >
                  <span
                    className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/25"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute -bottom-5 -left-5 h-14 w-14 rounded-full bg-white/10"
                    aria-hidden="true"
                  />
                  <Icon className="relative h-10 w-10" strokeWidth={2.3} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-black leading-tight text-[#071923] sm:text-3xl">
                    {category.title}
                  </h1>
                  <p className="mt-3 text-sm font-medium text-[#4a6370]">
                    {category.total} questions{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {category.completed} done{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {remaining} left{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {percent}% complete
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <button
                    type="button"
                    onClick={openRandomQuestion}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[#06254a] px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#071923]"
                  >
                    <Shuffle className="h-5 w-5" aria-hidden="true" />
                    Random Question
                  </button>
                  <button
                    type="button"
                    onClick={resumePractice}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-[#b8c8cf] bg-white px-5 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
                  >
                    <Play className="h-5 w-5" aria-hidden="true" />
                    Resume Practice
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-base font-black text-[#071923]">
                Subcategories ({category.subcategories.length})
              </h2>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {category.subcategories.map((subcategory, index) => (
                  <SubcategoryCard
                    key={subcategory}
                    category={category}
                    title={subcategory}
                    index={index}
                    isActive={index === selectedSubcategoryIndex}
                    onSelect={() => selectSubcategory(index)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-6 border-t border-[#d8e0e6] pt-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,520px)_minmax(260px,330px)] lg:items-center lg:justify-between">
                <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-[#d8e0e6] bg-white">
                  {filterOptions.map((option) => {
                    const isActive = option.value === statusFilter;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusFilterChange(option.value)}
                        aria-pressed={isActive}
                        className={`h-10 px-3 text-xs font-black transition-colors ${
                          isActive
                            ? "bg-[#06254a] text-white"
                            : "text-[#071923] hover:bg-[#f4f8f8]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <label className="flex h-10 min-w-0 items-center gap-3 rounded-lg border border-[#d8e0e6] bg-white px-3">
                  <input
                    value={questionQuery}
                    onChange={(event) =>
                      onQuestionQueryChange(event.target.value)
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#071923] outline-none placeholder:text-[#8091a0]"
                    placeholder="Search questions..."
                  />
                  <Search className="h-5 w-5 shrink-0 text-[#071923]" aria-hidden="true" />
                </label>
              </div>

              {firstSavedResponseQuestion && (
                <div className="mt-4 grid gap-3 rounded-xl border border-[#b9dcda] bg-[#f1fbfa] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[#08787b]">
                      Review
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#071923]">
                      {savedResponseQuestions.length === 1
                        ? "1 saved answer is ready to check."
                        : `${savedResponseQuestions.length} saved answers are ready to check.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenQuestion(firstSavedResponseQuestion)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#159a9d] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#08787b]"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Check Saved Answer
                  </button>
                </div>
              )}

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div
                  ref={questionListRef}
                  className="overflow-hidden rounded-xl border border-[#d8e0e6] bg-white shadow-[0_1px_3px_rgba(7,25,35,0.05)]"
                  style={{
                    minHeight: temporaryListMinHeight ?? undefined,
                  }}
                >
                  {filteredQuestions.map((question, index) => {
                    const hasSavedResponse = savedResponseQuestionIds.has(question.id);

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onOpenQuestion(question)}
                        className={`grid min-h-[70px] w-full grid-cols-[40px_minmax(0,1fr)_32px_18px] items-center gap-4 bg-white px-5 py-3 text-left transition-colors hover:bg-[#f8fbfb] ${
                          index === filteredQuestions.length - 1
                            ? ""
                            : "border-b border-[#edf1f3]"
                        } ${hasSavedResponse ? "bg-[#fbfffe]" : ""}`}
                      >
                        <span className="text-sm font-medium text-[#526976]">
                          {String(
                            questionNumbers.get(question.id) ?? index + 1
                          ).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-5 text-[#071923]">
                            {question.text}
                          </span>
                          <span className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#748791]">
                            {question.difficulty} / section{" "}
                            {question.sourceSection}
                            {question.sourceTopic
                              ? ` / ${question.sourceTopic}`
                              : ""}
                          </span>
                          {hasSavedResponse && (
                            <span className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#e2f5ef] px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#08787b]">
                              Review / Check saved answer
                            </span>
                          )}
                        </span>
                        <StatusIcon status={question.status} />
                        <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
                      </button>
                    );
                  })}
                  {filteredQuestions.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm font-black text-[#071923]">
                        No questions found
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#4a6370]">
                        Try a different filter or search term.
                      </p>
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <h2 className="text-sm font-black text-[#071923]">
                      Status
                    </h2>
                    <div className="mt-4 space-y-4">
                      {(
                        [
                          "completed",
                          "review",
                          "not-attempted",
                        ] as const satisfies readonly QuestionStatus[]
                      ).map((status) => (
                        <div
                          key={status}
                          className="grid grid-cols-[24px_minmax(0,1fr)_28px] items-center gap-3"
                        >
                          <StatusIcon status={status} />
                          <span className="text-xs font-medium text-[#4a6370]">
                            {statusMeta[status].label}
                          </span>
                          <span className="text-right text-xs font-black text-[#071923]">
                            {statusCounts[status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <h2 className="text-sm font-black text-[#071923]">
                      Progress
                    </h2>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#4a6370]">
                      {selectedStats.completed} done / {selectedStats.remaining} left
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e2eaee]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedStats.percent}%`,
                          backgroundColor: category.colour,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#5d707a]">
                      {selectedStats.percent}% complete
                    </p>
                  </section>
                </aside>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function InterviewQuestionBankDashboard({
  showPremiumCard,
  initialCategoryTitle,
  initialSubcategoryIndex,
  initialQuestionId,
}: {
  showPremiumCard: boolean;
  initialCategoryTitle?: string;
  initialSubcategoryIndex?: number;
  initialQuestionId?: string;
}) {
  const [query, setQuery] = useState("");
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );
  const progressStorageRef = useRef<ProgressStorage>("browser");
  const progressUserRef = useRef<User | null>(null);
  const [questionStatusById, setQuestionStatusById] =
    useState<QuestionStatusById>(() => new Map());
  const [savedResponsesByQuestionId, setSavedResponsesByQuestionId] = useState(
    () => new Map<string, SavedQuestionResponse>()
  );
  const categoriesWithStats = useMemo(
    () =>
      categories.map((category) =>
        withQuestionStats(category, questionStatusById)
      ),
    [questionStatusById]
  );
  const savedResponseQuestionIds = useMemo(
    () => new Set(savedResponsesByQuestionId.keys()),
    [savedResponsesByQuestionId]
  );
  const initialNavigationState = useMemo(
    () =>
      resolveQuestionBankNavigationState(categoriesWithStats, {
        categoryTitle: initialCategoryTitle,
        subcategoryIndex: initialSubcategoryIndex,
        questionId: initialQuestionId,
      }),
    [
      categoriesWithStats,
      initialCategoryTitle,
      initialQuestionId,
      initialSubcategoryIndex,
    ]
  );
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<
    string | null
  >(initialNavigationState.selectedCategoryTitle);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(
    initialNavigationState.selectedSubcategoryIndex
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialNavigationState.statusFilter
  );
  const [questionQuery, setQuestionQuery] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    initialNavigationState.activeQuestionId
  );

  useEffect(() => {
    if (!supabase) {
      const timeoutId = window.setTimeout(() => {
        const localSnapshot = readBrowserQuestionProgress();

        progressStorageRef.current = "browser";
        progressUserRef.current = null;
        setQuestionStatusById(localSnapshot.statusById);
        setSavedResponsesByQuestionId(localSnapshot.savedResponsesByQuestionId);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    let isMounted = true;
    const client = supabase;

    async function loadProgressForUser(user: User | null) {
      if (!user) {
        const localSnapshot = readBrowserQuestionProgress();

        if (!isMounted) return;
        progressStorageRef.current = "browser";
        progressUserRef.current = null;
        setQuestionStatusById(localSnapshot.statusById);
        setSavedResponsesByQuestionId(localSnapshot.savedResponsesByQuestionId);
        return;
      }

      try {
        const browserSnapshot = readBrowserQuestionProgress();
        const remoteSnapshot = await readSupabaseQuestionProgress(client);
        const mergedSnapshot = mergeQuestionProgressSnapshots(
          remoteSnapshot,
          browserSnapshot
        );

        if (!isMounted) return;
        progressStorageRef.current = "supabase";
        progressUserRef.current = user;
        setQuestionStatusById(mergedSnapshot.statusById);
        setSavedResponsesByQuestionId(mergedSnapshot.savedResponsesByQuestionId);
        void syncBrowserProgressToSupabase({
          supabase: client,
          userId: user.id,
          browserSnapshot,
          remoteSnapshot,
        }).catch(() => undefined);
      } catch {
        const localSnapshot = readBrowserQuestionProgress();

        if (!isMounted) return;
        progressStorageRef.current = "browser";
        progressUserRef.current = user;
        setQuestionStatusById(localSnapshot.statusById);
        setSavedResponsesByQuestionId(localSnapshot.savedResponsesByQuestionId);
      }
    }

    void client.auth.getSession().then(({ data }) => {
      void loadProgressForUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      void loadProgressForUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const totals = useMemo(
    () =>
      categoriesWithStats.reduce(
        (acc, category) => ({
          total: acc.total + category.total,
          completed: acc.completed + category.completed,
        }),
        { total: 0, completed: 0 }
      ),
    [categoriesWithStats]
  );
  const overallPercent = getPercent(totals.completed, totals.total);
  const remaining = totals.total - totals.completed;
  const summaryStats = [
    {
      label: "Categories",
      value: String(categoriesWithStats.length),
      icon: Grid3X3,
    },
    { label: "Total Questions", value: String(totals.total), icon: FileText },
    { label: "Completed", value: String(totals.completed), icon: CheckCircle2 },
    { label: "Remaining", value: String(remaining), icon: Clock },
  ] satisfies readonly SummaryStatItem[];
  const normalisedQuery = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalisedQuery) return categoriesWithStats;
    return categoriesWithStats.filter((category) =>
      [
        category.title,
        category.description,
        ...category.subcategories,
        ...category.questions.map((question) => getQuestionSearchText(question)),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalisedQuery)
    );
  }, [categoriesWithStats, normalisedQuery]);
  const selectedCategory = selectedCategoryTitle
    ? categoriesWithStats.find(
        (category) => category.title === selectedCategoryTitle
      )
    : undefined;
  const questionsWithProgress = useMemo(
    () => categoriesWithStats.flatMap((category) => category.questions),
    [categoriesWithStats]
  );
  const activeQuestion = activeQuestionId
    ? questionsWithProgress.find((question) => question.id === activeQuestionId)
    : undefined;
  const selectedSubcategory =
    selectedCategory?.subcategories[selectedSubcategoryIndex] ??
    selectedCategory?.subcategories[0];
  const activeQuestionNumber =
    selectedCategory && selectedSubcategory && activeQuestion
      ? Math.max(
          1,
          getSubcategoryQuestions(selectedCategory, selectedSubcategory).findIndex(
            (question) => question.id === activeQuestion.id
          ) + 1
        )
      : 1;

  const updateQuestionBankUrl = (
    nextState: {
      categoryTitle?: string | null;
      subcategoryIndex?: number;
      questionId?: string | null;
    },
    mode: "push" | "replace" = "push"
  ) => {
    if (typeof window === "undefined") return;

    const url = buildQuestionBankUrl(nextState);

    if (mode === "replace") {
      window.history.replaceState(null, "", url);
    } else {
      window.history.pushState(null, "", url);
    }
  };

  const resetQuestionState = () => {
    setStatusFilter(defaultStatusFilter);
    setQuestionQuery("");
    setActiveQuestionId(null);
  };

  const openCategory = (
    category: InterviewQuestionCategorySummary,
    mode: "push" | "replace" = "push"
  ) => {
    setSelectedCategoryTitle(category.title);
    setSelectedSubcategoryIndex(0);
    resetQuestionState();
    updateQuestionBankUrl(
      { categoryTitle: category.title, subcategoryIndex: 0 },
      mode
    );
    scrollToTop();
  };

  const selectSubcategory = (
    index: number,
    categoryTitle = selectedCategory?.title
  ) => {
    setSelectedSubcategoryIndex(index);
    resetQuestionState();
    updateQuestionBankUrl({ categoryTitle, subcategoryIndex: index });
  };

  const openQuestion = (
    question: InterviewQuestion,
    mode: "push" | "replace" = "push"
  ) => {
    const category = categoriesWithStats.find(
      (item) => item.title === question.category
    );
    if (!question || !category) return;
    const subcategoryIndex = Math.max(
      0,
      category.subcategories.findIndex(
        (subcategory) => subcategory === question.subcategory
      )
    );

    setSelectedCategoryTitle(category.title);
    setSelectedSubcategoryIndex(subcategoryIndex);
    setStatusFilter(getFilterForQuestionStatus(question.status));
    setQuestionQuery("");
    setActiveQuestionId(question.id);
    updateQuestionBankUrl(
      {
        categoryTitle: category.title,
        subcategoryIndex,
        questionId: question.id,
      },
      mode
    );
    scrollToTop();
  };

  const openRandomQuestion = () => {
    const question =
      questionsWithProgress[
        Math.floor(Math.random() * questionsWithProgress.length)
      ] ?? questionsWithProgress[0];

    if (question) openQuestion(question);
  };

  const persistQuestionProgress = useCallback(
    async (
      questionId: string,
      status: QuestionStatus,
      response?: SavedQuestionResponse
    ) => {
      const user = progressUserRef.current;

      if (!supabase || !user || progressStorageRef.current !== "supabase") {
        return false;
      }

      try {
        await writeSupabaseQuestionProgress({
          supabase,
          userId: user.id,
          questionId,
          status,
          response,
        });
        return true;
      } catch {
        progressStorageRef.current = "browser";
        return false;
      }
    },
    [supabase]
  );

  const updateQuestionProgress = useCallback(
    (
      questionId: string,
      status: QuestionStatus,
      response?: SavedQuestionResponse
    ) => {
      setQuestionStatusById((current) => {
        const next = new Map(current);

        if (status === "not-attempted") {
          next.delete(questionId);
        } else {
          next.set(questionId, status);
        }

        return next;
      });
      setSavedResponsesByQuestionId((current) => {
        const next = new Map(current);

        if (status === "not-attempted") {
          next.delete(questionId);
        } else if (response) {
          next.set(questionId, response);
        }

        return next;
      });

      if (progressStorageRef.current !== "supabase") {
        writeBrowserQuestionProgress(questionId, status, response);
        return;
      }

      void persistQuestionProgress(questionId, status, response).then(
        (savedToSupabase) => {
          if (!savedToSupabase) {
            writeBrowserQuestionProgress(questionId, status, response);
          } else {
            writeBrowserQuestionProgress(questionId, "not-attempted");
          }
        }
      );
    },
    [persistQuestionProgress]
  );

  const saveQuestionResponse = useCallback(
    (response: SavedQuestionResponse) => {
      updateQuestionProgress(response.questionId, "completed", response);
    },
    [updateQuestionProgress]
  );

  const resetQuestionCompletion = useCallback(
    (questionId: string) => {
      updateQuestionProgress(questionId, "not-attempted");
    },
    [updateQuestionProgress]
  );

  const updateQuestionStatus = useCallback(
    (questionId: string, status: QuestionStatus) => {
      updateQuestionProgress(
        questionId,
        status,
        savedResponsesByQuestionId.get(questionId)
      );
    },
    [savedResponsesByQuestionId, updateQuestionProgress]
  );

  const backToQuestionList = () => {
    setActiveQuestionId(null);
    updateQuestionBankUrl(
      {
        categoryTitle: selectedCategory?.title,
        subcategoryIndex: selectedSubcategoryIndex,
      },
      "replace"
    );
    scrollToTop();
  };

  const backToCategories = () => {
    setSelectedCategoryTitle(null);
    setSelectedSubcategoryIndex(0);
    resetQuestionState();
    updateQuestionBankUrl({}, "push");
    scrollToTop();
  };

  useEffect(() => {
    const applyUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const subcategoryParam = params.get("subcategory");
      const nextState = resolveQuestionBankNavigationState(
        categoriesWithStats,
        {
          categoryTitle: params.get("category"),
          subcategoryIndex:
            subcategoryParam === null ? null : Number(subcategoryParam),
          questionId: params.get("question"),
        }
      );

      setSelectedCategoryTitle(nextState.selectedCategoryTitle);
      setSelectedSubcategoryIndex(nextState.selectedSubcategoryIndex);
      setStatusFilter(nextState.statusFilter);
      setQuestionQuery("");
      setActiveQuestionId(nextState.activeQuestionId);
    };

    window.addEventListener("popstate", applyUrlState);

    return () => window.removeEventListener("popstate", applyUrlState);
  }, [categoriesWithStats]);

  if (selectedCategory && selectedSubcategory && activeQuestion) {
    return (
      <QuestionPracticeView
        key={activeQuestion.id}
        category={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        question={activeQuestion}
        questionNumber={activeQuestionNumber}
        showPremiumCard={showPremiumCard}
        initialSavedResponse={
          savedResponsesByQuestionId.get(activeQuestion.id) ?? null
        }
        onBackToQuestions={backToQuestionList}
        onQuestionResponseSaved={saveQuestionResponse}
        onQuestionReset={resetQuestionCompletion}
        onQuestionStatusChange={updateQuestionStatus}
      />
    );
  }

  if (selectedCategory) {
    return (
      <QuestionBankCategoryView
        category={selectedCategory}
        selectedSubcategoryIndex={selectedSubcategoryIndex}
        statusFilter={statusFilter}
        questionQuery={questionQuery}
        savedResponseQuestionIds={savedResponseQuestionIds}
        showPremiumCard={showPremiumCard}
        onBack={backToCategories}
        onSelectSubcategory={(index) => selectSubcategory(index)}
        onStatusFilterChange={setStatusFilter}
        onQuestionQueryChange={setQuestionQuery}
        onOpenQuestion={openQuestion}
      />
    );
  }

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#071923]">
                  Question Bank
                </h1>
                <p className="mt-2 text-sm font-medium text-[#4a6370]">
                  Explore {totals.total}+ interview questions across{" "}
                  {categoriesWithStats.length} categories.
                </p>
              </div>
              <InterviewAccountControls />
            </header>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg bg-white/80 px-4 ring-1 ring-[#d8e2e6]/60 sm:w-[420px]">
                <Search className="h-5 w-5 shrink-0 text-[#4a6370]" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#071923] outline-none placeholder:text-[#8091a0]"
                  placeholder="Search questions, topics or keywords..."
                />
              </label>
              <button
                type="button"
                onClick={openRandomQuestion}
                className="flex h-12 items-center justify-center gap-3 rounded-lg bg-[#edf7f6] px-5 text-sm font-black text-[#08787b] ring-1 ring-[#b9dcda]/60 transition-colors hover:bg-[#e2f2f0]"
              >
                <Shuffle className="h-5 w-5" aria-hidden="true" />
                Random Question
              </button>
            </div>

            <section className="mt-7 rounded-xl bg-white/80 p-[22px] shadow-[0_1px_3px_rgba(7,25,35,0.08)]">
              <div className="grid gap-[28px] xl:grid-cols-[minmax(280px,1fr)_1.4fr] xl:items-center">
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-base font-black text-[#071923]">
                      Overall Progress
                    </h2>
                    <span className="text-2xl font-black text-[#071923]">
                      {overallPercent}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#314956]">
                    {totals.completed} / {totals.total} completed
                  </p>
                  <div className="mt-[18px] h-2 overflow-hidden rounded-full bg-[#dfe8ea]">
                    <div
                      className="h-full rounded-full bg-[#159a9d]"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                  <p className="mt-[14px] text-xs font-medium text-[#5d707a]">
                    {remaining} questions remaining
                  </p>
                </div>
                <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
                  {summaryStats.map((item) => (
                    <SummaryStat
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                {normalisedQuery
                  ? `${filteredCategories.length} matching categories`
                  : "All categories"}
              </p>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-bold text-[#4a6370] hover:text-[#08787b]"
                >
                  Clear search
                </button>
              )}
            </div>

            <section className="mt-3 grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.title}
                  category={category}
                  onOpen={() => openCategory(category)}
                />
              ))}
              {filteredCategories.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#b9cbcf] bg-white p-8 text-center xl:col-span-4">
                  <p className="text-sm font-black text-[#071923]">
                    No categories found
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#4a6370]">
                    Try searching for ethics, teamwork, NHS, data or motivation.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
