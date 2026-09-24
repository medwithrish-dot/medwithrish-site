// A fixed date keeps permanent curriculum progress separate from daily dashboard tasks.
// Reuses the owner-protected table; IDs remain stable when the learner returns later.
export const PATHWAY_STORAGE_DATE = "2000-01-01";
export const PATHWAY_GUEST_KEY = "medicforest:interview-pathway:v1:guest";

export const INTERVIEW_PATHWAY = [
  {
    id: "motivation", title: "Why Medicine?", description: "Build a personal, informed answer about becoming a doctor.",
    guides: ["why-medicine", "medical-school-and-course"],
    questions: ["iq-01-001-motivation-for-medicine", "iq-01-002-motivation-for-medicine", "iq-01-007-motivation-for-medicine"],
    readiness: "I can explain why medicine suits me, support it with an honest example and discuss the challenges without reading a script.",
    mockStation: "why-medicine",
  },
  {
    id: "reflection", title: "Work experience & reflection", description: "Turn experiences and setbacks into evidence of what you have learnt.",
    guides: ["work-experience-reflection", "personal-insight-and-resilience"],
    questions: ["iq-01-004-work-experience-and-reflection", "iq-01-005-work-experience-and-reflection", "iq-06-001-personal-insight"],
    readiness: "I can reflect on two specific experiences, explain my own contribution and describe something I changed afterwards.",
    mockStation: "work-experience",
  },
  {
    id: "ethics", title: "Ethics & professionalism", description: "Practise balanced reasoning, patient safety and recognising your limits.",
    guides: ["medical-ethics", "consent-capacity-confidentiality", "safeguarding-and-candour"],
    questions: ["iq-08-001-core-medical-ethics", "iq-07-027-consent-capacity-and-confidentiality", "iq-07-028-consent-capacity-and-confidentiality"],
    readiness: "I can consider different perspectives, apply ethical principles and explain when to seek senior help.",
    mockStation: "ethics-confidentiality",
  },
  {
    id: "communication", title: "Communication, teamwork & role play", description: "Listen carefully, explain clearly and work through a disagreement.",
    guides: ["communication-and-empathy", "teamwork-and-leadership", "role-play-and-communication-tasks"],
    questions: ["iq-02-004-communication-and-empathy", "iq-05-002-teamwork", "iq-17-002-role-play"],
    readiness: "I can show active listening in a role play and reflect on how I helped a team without taking all the credit.",
    mockStation: "teamwork-group-discussion",
  },
  {
    id: "nhs", title: "NHS & healthcare", description: "Understand how care is organised and why access and fairness matter.",
    guides: ["nhs-structure", "health-inequalities", "nhs-funding-and-priorities"],
    questions: ["iq-07-001-nhs-structure-and-challenges", "iq-07-002-nhs-structure-and-challenges", "iq-07-013-health-inequalities"],
    readiness: "I can explain the main levels of care and discuss a healthcare challenge from patient, staff and service perspectives.",
    mockStation: "nhs-waiting-lists",
  },
  {
    id: "hot-topics", title: "Hot topics & current affairs", description: "Explain an issue, weigh the evidence and connect it to patient care.",
    guides: ["bawa-garba-case", "ai-in-healthcare", "vaccination-and-misinformation"],
    questions: ["iq-01-018-technology-ai-and-digital-health", "iq-12-018-ethics-in-the-news", "iq-12-059-ethics-in-the-news"],
    readiness: "I can discuss two hot topics with a balanced view, explain lessons from the Bawa-Garba case and identify facts I should check.",
    mockStation: "ozempic",
  },
  {
    id: "analysis", title: "Data, research & evidence", description: "Explain findings simply and question what the evidence can establish.",
    guides: ["data-and-graphs", "research-and-critical-appraisal", "critical-thinking"],
    questions: ["iq-11-001-research-and-evidence", "iq-11-007-critical-appraisal", "iq-11-008-critical-appraisal"],
    readiness: "I can explain a trend, distinguish association from causation and describe limitations of a study without overstating its findings.",
    mockStation: "data-analysis",
  },
] as const;

export type PathwayStationId = (typeof INTERVIEW_PATHWAY)[number]["id"];
export type PathwayTask = { id: string; title: string; href: string; kind: "guide" | "question" };
export type PathwayStation = { id: PathwayStationId; title: string; description: string; readiness: string; tasks: PathwayTask[] };

export function pathwayTaskId(station: string, kind: "guide" | "question" | "ready", resource = "") {
  return `pathway:v1:${station}:${kind}${resource ? `:${resource}` : ""}`;
}

export function pathwayResourceIds(station: (typeof INTERVIEW_PATHWAY)[number]) {
  return [...station.guides.map((slug) => pathwayTaskId(station.id, "guide", slug)), ...station.questions.map((id) => pathwayTaskId(station.id, "question", id))];
}

export const PATHWAY_TASK_IDS = INTERVIEW_PATHWAY.flatMap((station) => [...pathwayResourceIds(station), pathwayTaskId(station.id, "ready")]);
const allowedIds = new Set(PATHWAY_TASK_IDS);

export function sanitisePathwayProgress(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowedIds.has(id)))] : [];
}

export function derivePathwayProgress(value: unknown) {
  const completed = new Set(sanitisePathwayProgress(value));
  let previousComplete = true;
  const stations = INTERVIEW_PATHWAY.map((station) => {
    const ids = pathwayResourceIds(station);
    const resourceCount = ids.filter((id) => completed.has(id)).length;
    const ready = resourceCount === ids.length && completed.has(pathwayTaskId(station.id, "ready"));
    const unlocked = previousComplete;
    const complete = unlocked && ready;
    previousComplete = complete;
    return { id: station.id, unlocked, complete, resourceCount, resourceTotal: ids.length };
  });
  return { stations, completedCount: stations.filter((station) => station.complete).length, currentIndex: stations.findIndex((station) => !station.complete), allComplete: previousComplete };
}

export function changePathwayTask(value: unknown, taskId: unknown, completed: unknown) {
  if (typeof taskId !== "string" || !allowedIds.has(taskId) || typeof completed !== "boolean") throw new Error("Choose a task from your station pathway.");
  const current = sanitisePathwayProgress(value);
  const station = INTERVIEW_PATHWAY.find((entry) => [...pathwayResourceIds(entry), pathwayTaskId(entry.id, "ready")].includes(taskId))!;
  const state = derivePathwayProgress(current).stations.find((entry) => entry.id === station.id)!;
  if (completed && !state.unlocked) throw new Error("Finish the previous station's readiness check first.");
  const readyId = pathwayTaskId(station.id, "ready");
  if (completed && taskId === readyId && state.resourceCount !== state.resourceTotal) throw new Error("Read the guides and practise each question before your readiness check.");
  const removeIds = completed ? [] : [...new Set([taskId, readyId])];
  const next = completed ? [...new Set([...current, taskId])] : current.filter((id) => !removeIds.includes(id));
  return { completedTaskIds: next, removeIds };
}

export function changePathwayStation(
  value: unknown,
  stationId: unknown,
  completed: unknown
) {
  if (typeof stationId !== "string" || typeof completed !== "boolean") {
    throw new Error("Choose a station from your interview pathway.");
  }

  const stationIndex = INTERVIEW_PATHWAY.findIndex(
    (station) => station.id === stationId
  );
  if (stationIndex < 0) {
    throw new Error("Choose a station from your interview pathway.");
  }

  const current = sanitisePathwayProgress(value);
  const station = INTERVIEW_PATHWAY[stationIndex];
  const stationTaskIds = [
    ...pathwayResourceIds(station),
    pathwayTaskId(station.id, "ready"),
  ];

  if (completed) {
    const state = derivePathwayProgress(current).stations[stationIndex];
    if (!state.unlocked) {
      throw new Error("Tick off the previous pathway step first.");
    }
    return {
      completedTaskIds: [...new Set([...current, ...stationTaskIds])],
      addIds: stationTaskIds.filter((id) => !current.includes(id)),
      removeIds: [] as string[],
    };
  }

  const removeIds = INTERVIEW_PATHWAY.slice(stationIndex).flatMap((entry) => [
    ...pathwayResourceIds(entry),
    pathwayTaskId(entry.id, "ready"),
  ]);
  return {
    completedTaskIds: current.filter((id) => !removeIds.includes(id)),
    addIds: [] as string[],
    removeIds,
  };
}
