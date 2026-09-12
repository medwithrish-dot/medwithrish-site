import { findInterviewStation, interviewStations } from "../_data/interview-stations";
import type { InterviewQuestionCategoryTitle } from "../_data/interviewQuestionBank";
import { categoryRubric, type MarkSchemeSection } from "./question-review";

export type StationReviewGuidance = {
  category: InterviewQuestionCategoryTitle;
  framework: readonly {
    title: string;
    items: readonly string[];
  }[];
  rubric: readonly MarkSchemeSection[];
  sourceLabel: string;
};

type StationSlug = (typeof interviewStations)[number]["slug"];
type StationFramework = Pick<StationReviewGuidance, "category" | "framework">;

// Adapted from our question-bank rubrics, the worked structures in
// public/phloemai/interview-question-markscheme-rubrics.txt, and interviewGuides.ts.
// These are practice frameworks, not university-specific marking criteria.
const stationFrameworks = {
  "why-medicine": {
    category: "Personal & Motivation",
    framework: [
      {
        title: "Start with your motivation",
        items: [
          "Give a direct, personal reason for choosing medicine, then name an experience or value that made it meaningful.",
          "Explain what attracts you to the doctor's combination of scientific reasoning, patient care, teamwork and responsibility.",
        ],
      },
      {
        title: "Show how you tested the choice",
        items: [
          "Use one or two honest experiences from caring, volunteering, work experience or exploring the profession.",
          "Explain what you learnt and how your expectations changed. Acknowledge the challenges and respect the roles of other healthcare professionals.",
        ],
      },
      {
        title: "Connect reflection to your future",
        items: [
          "Explain why medicine remains a considered choice and how you will continue preparing for it.",
          "Finish with the contribution you hope to make to patients, using your own experiences rather than a memorised story.",
        ],
      },
    ],
  },
  "work-experience": {
    category: "Personal & Motivation",
    framework: [
      {
        title: "Choose one meaningful lesson",
        items: [
          "Name the main lesson and briefly set the context, keeping any patient details anonymous.",
          "Be clear about your role and the limits of what you could observe.",
        ],
      },
      {
        title: "Explain why the moment mattered",
        items: [
          "Describe a specific interaction involving care, communication or teamwork, then spend more time on reflection than description.",
          "Explain what surprised you and how it changed your understanding of patients, staff or the demands of medicine.",
        ],
      },
      {
        title: "Turn the lesson into action",
        items: [
          "State how you would apply the learning as a medical student and what you still need to understand.",
          "Connect that change in your behaviour to respectful, patient-centred care.",
        ],
      },
    ],
  },
  "disability-in-medicine": {
    category: "Ethics & Professionalism",
    framework: [
      {
        title: "Frame the question around fairness",
        items: [
          "Identify the applicant's opportunity to participate, the barriers they face and the essential competencies being assessed.",
          "Ask about the person's actual needs and abilities rather than making assumptions from a disability label.",
        ],
      },
      {
        title: "Explore an individual approach",
        items: [
          "Discuss appropriate adjustments with the applicant and relevant support teams, alongside professional competencies and patient safety.",
          "Consider how an assessment can evaluate the required skills fairly, and respond respectfully to assumptions or discriminatory remarks.",
        ],
      },
      {
        title: "Explain a fair next step",
        items: [
          "Recommend a clear, individual assessment with appropriate advice and a way to review the support provided.",
          "Link the approach to dignity, inclusion and safe participation in medical training.",
        ],
      },
    ],
  },
  "equality-diversity-inclusion": {
    category: "Ethics & Professionalism",
    framework: [
      {
        title: "Explain what fair care means",
        items: [
          "Explain equality, diversity and inclusion in practical terms, recognising that people may need different support to access care fairly.",
          "Identify a specific barrier instead of relying on a broad statement about treating everyone the same.",
        ],
      },
      {
        title: "Use a practical example",
        items: [
          "Consider accessible information, interpreters, appointment flexibility or an alternative to online booking, according to the person's needs.",
          "For a discriminatory remark, consider its effect on dignity and safety, address it respectfully and seek appropriate supervision.",
        ],
      },
      {
        title: "Check the effect of your approach",
        items: [
          "Involve the people affected and explain how you would check that the change improves access.",
          "Finish with respectful care and fair opportunities, recognising that one intervention will not remove every barrier.",
        ],
      },
    ],
  },
  ozempic: {
    category: "Hot Topics & Current Affairs",
    framework: [
      {
        title: "Set out the opportunity and debate",
        items: [
          "Introduce weight-management medicines as a question about evidence, patient outcomes and access.",
          "Distinguish between products and indications; identify claims about eligibility or availability that need current official guidance.",
        ],
      },
      {
        title: "Weigh benefits, risks and access",
        items: [
          "Discuss potential benefits alongside adverse effects, long-term evidence, treatment support and affordability.",
          "Consider fair prioritisation, stigma and different barriers to obtaining care without assuming a medicine is suitable for everyone.",
        ],
      },
      {
        title: "Give a measured conclusion",
        items: [
          "State what evidence or guidance you would check before reaching a firmer view.",
          "Link your conclusion to informed discussion, appropriate follow-up and equitable care.",
        ],
      },
    ],
  },
  "ethics-confidentiality": {
    category: "Ethics & Professionalism",
    framework: [
      {
        title: "Protect the patient's privacy",
        items: [
          "Explain that you would not share information about a patient with a friend, including details that might identify them indirectly.",
          "State why confidentiality matters to trust, while recognising that serious safety concerns may require appropriate help.",
        ],
      },
      {
        title: "Clarify risk and seek support",
        items: [
          "If harm is a concern, clarify the immediate safety issue and seek advice from the responsible clinician or safeguarding lead.",
          "Work within your role and the relevant professional guidance instead of investigating or making disclosure decisions alone.",
        ],
      },
      {
        title: "Explain the proportionate next step",
        items: [
          "Where sharing is justified, discuss sharing only necessary information with appropriate people and recording the reasoning.",
          "Explain how you would involve the patient and communicate the next steps when appropriate.",
        ],
      },
    ],
  },
  "nhs-waiting-lists": {
    category: "NHS & Healthcare",
    framework: [
      {
        title: "Describe the impact of waiting",
        items: [
          "Explain the effect on patients, staff and the wider service, including uncertainty or deterioration while waiting.",
          "Define which service and waiting measure you mean; use statistics only when you can explain their source and date.",
        ],
      },
      {
        title: "Balance urgency and fairness",
        items: [
          "Discuss clinical need, likely benefit and transparent prioritisation rather than relying only on time already waited.",
          "Assess a proposed improvement through staffing, diagnostics, follow-up capacity, quality and unequal access.",
        ],
      },
      {
        title: "Explain what success would look like",
        items: [
          "Choose patient outcomes and experience to evaluate alongside waiting times, and consider possible unintended consequences.",
          "Finish with a realistic improvement, clear communication with patients and a plan to review its effect.",
        ],
      },
    ],
  },
  "teamwork-group-discussion": {
    category: "Communication & Teamwork",
    framework: [
      {
        title: "Set the scene and shared goal",
        items: [
          "Briefly explain the team task, your role and the disagreement without blaming others.",
          "Identify the shared goal and show that you understand more than one perspective.",
        ],
      },
      {
        title: "Show what you contributed",
        items: [
          "Describe how you listened, clarified facts and invited quieter members to contribute without putting them under pressure.",
          "Explain how the team worked towards agreement and when support from a leader would be appropriate.",
        ],
      },
      {
        title: "Reflect on the outcome",
        items: [
          "Describe the outcome honestly, acknowledge others' contributions and identify something you would do differently.",
          "Link that learning to reliable teamwork and safe patient care.",
        ],
      },
    ],
  },
  "data-analysis": {
    category: "Data, Research & Critical Thinking",
    framework: [
      {
        title: "State the change accurately",
        items: [
          "Missed appointments fell from 20% to 15%: five fewer missed appointments per 100, a five percentage-point fall.",
          "The relative reduction is 25% of the original rate. Keep the denominator clear and distinguish this from percentage points.",
        ],
      },
      {
        title: "Test the explanation",
        items: [
          "Ask about the time period, comparable groups, sample size and other changes that might have affected attendance.",
          "A fall after a reminder system was introduced does not by itself establish that the reminder caused it.",
        ],
      },
      {
        title: "Communicate a cautious conclusion",
        items: [
          "Explain the observed improvement in plain language and state what remains uncertain.",
          "Describe what further information would help, including whether the change continues and who benefits or misses out.",
        ],
      },
    ],
  },
} as const satisfies Record<StationSlug, StationFramework>;

export function getStationReviewGuidance(stationSlug: string): StationReviewGuidance | null {
  const station = findInterviewStation(stationSlug);
  if (!station) return null;

  const guidance = stationFrameworks[station.slug];
  return {
    ...guidance,
    rubric: categoryRubric[guidance.category],
    sourceLabel: "PhloemAI practice framework and question-bank rubric",
  };
}
