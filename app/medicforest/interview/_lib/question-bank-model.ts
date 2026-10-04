import { type QuestionStatus } from "../_lib/question-bank-storage";

import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  Circle,
  Drama,
  FileText,
  Flame,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MessagesSquare,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  INTERVIEW_QUESTIONS,
  type InterviewQuestion,
  type InterviewQuestionCategoryTitle,
  type InterviewQuestionSubcategory,
} from "../_data/interviewQuestionBank";

export type InterviewQuestionCategory = {
  title: InterviewQuestionCategoryTitle;
  description: string;
  subcategories: readonly InterviewQuestionSubcategory[];
  icon: LucideIcon;
  colour: string;
  tint: string;
  iconTint: string;
};

export type InterviewQuestionCategorySummary = InterviewQuestionCategory & {
  questions: readonly InterviewQuestion[];
  completed: number;
  total: number;
};

export type SummaryStatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type StatusFilter = "answered" | "unanswered" | "review";
export type ProgressStorage = "browser" | "supabase";

export const defaultStatusFilter = "unanswered" satisfies StatusFilter;

export const categories = [
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

export const categoryTitleLines = {
  "Personal & Motivation": ["Personal &", "Motivation"],
  "Communication & Teamwork": ["Communication", "& Teamwork"],
  "Ethics & Professionalism": ["Ethics &", "Professionalism"],
  "NHS & Healthcare": ["NHS &", "Healthcare"],
  "Hot Topics & Current Affairs": ["Hot Topics &", "Current Affairs"],
  "Data, Research & Critical Thinking": ["Data, Research &", "Critical Thinking"],
  "Practical MMI & Role Play": ["Practical MMI", "& Role Play"],
  "Curveballs & Quick-Fire": ["Curveballs &", "Quick-Fire"],
} as const satisfies Record<InterviewQuestionCategoryTitle, readonly [string, string]>;

export const subcategoryIcons = [
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

export const statusMeta = {
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

export type QuestionAttemptPhase = "idle" | "answering" | "review";

export type TranscriptSegment = {
  id: string;
  kind: "speech" | "pause";
  text: string;
  startSeconds: number;
  endSeconds: number;
};

export type QuestionBankNavigationInput = {
  categoryTitle?: string | null;
  subcategoryIndex?: number | null;
  questionId?: string | null;
};

export type QuestionBankNavigationState = {
  selectedCategoryTitle: string | null;
  selectedSubcategoryIndex: number;
  activeQuestionId: string | null;
  statusFilter: StatusFilter;
};

export type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
    confidence?: number;
  };
};

export type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};
export const subscribeSpeechSupport = () => () => {};
export const serverSpeechSupport = () => false;
export const browserSpeechSupport = () => {
  const speechWindow = window as SpeechRecognitionWindow;
  return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
};

export const questionBankPath = "/medicforest/interview/question-bank";

export function getPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getSuggestedAnswerSeconds(question: InterviewQuestion) {
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

export function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getSpokenMinutes(wordCount: number) {
  if (wordCount <= 0) return "0:00";

  return formatTimer(Math.round((wordCount / 130) * 60));
}

export function appendTranscript(answer: string, transcript: string) {
  const trimmedTranscript = transcript.trim();
  if (!trimmedTranscript) return answer;

  const spacer = answer.trim() ? " " : "";

  return `${answer.trimEnd()}${spacer}${trimmedTranscript}`;
}

export function buildQuestionBankUrl({
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

export function resolveQuestionBankNavigationState(
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

export function getQuestionStatus(
  question: InterviewQuestion,
  statusById: ReadonlyMap<string, QuestionStatus>
): QuestionStatus {
  return statusById.get(question.id) ?? "not-attempted";
}

export function getCompletedCount(questions: readonly InterviewQuestion[]) {
  return questions.filter((question) => question.status === "completed").length;
}

export function getCategoryQuestions(
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

export function withQuestionStats(
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

export function getSubcategoryQuestions(
  category: InterviewQuestionCategorySummary,
  subcategory: InterviewQuestionSubcategory
) {
  return category.questions.filter(
    (question) => question.subcategory === subcategory
  );
}

export function getSubcategoryStats(
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

export function getQuestionSearchText(question: InterviewQuestion) {
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

export function getFilterForQuestionStatus(status: QuestionStatus): StatusFilter {
  if (status === "completed") return "answered";
  if (status === "review") return "review";
  return "unanswered";
}

export function scrollToTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

