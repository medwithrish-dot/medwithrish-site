import type { InterviewQuestion, InterviewQuestionCategoryTitle } from "../_data/interviewQuestionBank";

export type MarkSchemeSection = {
  title: "General" | "Start" | "Middle" | "End";
  items: readonly string[];
};

export const categoryRubric = {
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

export function getQuestionMarkScheme(question: InterviewQuestion): MarkSchemeSection[] {
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

