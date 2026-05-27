import type {
  UCATChartVisual,
  UCATOptionKey,
  UCATQuestion,
  UCATQuestionTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

export type DmCuratedInput =
  | {
      kind: "single";
      subtype:
        | "dm-logic"
        | "dm-arguments"
        | "dm-venn-sets"
        | "dm-probability-data";
      leftTitle?: string;
      tags?: UCATQuestionTag[];
      stimulus: string[];
      visual?: UCATChartVisual;
      question: string;
      correct: string;
      distractors: string[];
      explanation: string;
    }
  | {
      kind: "yes-no";
      subtype: "dm-yes-no";
      leftTitle?: string;
      tags?: UCATQuestionTag[];
      stimulus: string[];
      visual?: UCATChartVisual;
      question: string;
      instruction: string;
      yesNoStatements: Array<{
        id: string;
        text: string;
        answer: "Yes" | "No";
      }>;
      explanation: string;
    }
  | {
      kind: "drag-category";
      subtype: "dm-syllogisms";
      leftTitle?: string;
      tags?: UCATQuestionTag[];
      stimulus: string[];
      question: string;
      instruction: string;
      categories: Array<{ id: string; label: string }>;
      categoryItems: Array<{
        id: string;
        text: string;
        answerCategory: string;
      }>;
      explanation: string;
    };

export const USER_CURATED_DM_INPUTS: DmCuratedInput[] = [
  // ===== PASTE NEW DM QUESTIONS BELOW THIS LINE =====

  // Each object must be one of three kinds:
  //   kind: "drag-category" — syllogisms (5 statements sorted into Yes/No categories)
  //   kind: "single"        — logic, arguments, venn, probability (one correct option + 3 distractors)
  //   kind: "yes-no"        — data-based Yes/No statements (include a visual table where possible)
  //
  // Verify every answer before writing. Explanations must be specific to the question.

  // --- Loop batch 1 ---

  {
    kind: "drag-category",
    subtype: "dm-syllogisms",
    leftTitle: "Syllogisms",
    stimulus: [
      "All consultant physicians are registered medical practitioners.",
      "All registered medical practitioners have completed a medical degree.",
      "Some registered medical practitioners are also pharmacists.",
      "No pharmacist is a surgeon.",
    ],
    question:
      "Assuming the statements above are true, which of the following conclusions follow beyond reasonable doubt?",
    instruction: "Drag each conclusion to the appropriate category.",
    categories: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    categoryItems: [
      {
        id: "dm-syl-med-01-a",
        text: "All consultant physicians have completed a medical degree.",
        answerCategory: "yes",
      },
      {
        id: "dm-syl-med-01-b",
        text: "Some registered medical practitioners are not surgeons.",
        answerCategory: "yes",
      },
      {
        id: "dm-syl-med-01-c",
        text: "No consultant physician is a pharmacist.",
        answerCategory: "no",
      },
      {
        id: "dm-syl-med-01-d",
        text: "All surgeons have completed a medical degree.",
        answerCategory: "no",
      },
      {
        id: "dm-syl-med-01-e",
        text: "Some pharmacists are registered medical practitioners.",
        answerCategory: "yes",
      },
    ],
    explanation:
      "A — YES: Consultant physicians → registered medical practitioners → completed a medical degree (chain of universal premises). Follows by transitivity.\n" +
      "B — YES: Premise 3 states some RMPs are pharmacists. Premise 4 states no pharmacist is a surgeon. Those pharmacist-RMPs are therefore not surgeons, so some RMPs are not surgeons.\n" +
      "C — NO: Consultants are a subset of RMPs. Because some RMPs are pharmacists, it is possible that some consultants are pharmacists. The premises give no basis for concluding 'no consultant is a pharmacist'.\n" +
      "D — NO: Surgeons are not stated to be RMPs or to have completed a medical degree. The only premise mentioning surgeons (premise 4) says pharmacists are not surgeons — this tells us nothing about surgeons' qualifications.\n" +
      "E — YES: Premise 3 ('some RMPs are pharmacists') is logically equivalent to 'some pharmacists are RMPs'. The conclusion follows directly.",
  },

  {
    kind: "yes-no",
    subtype: "dm-yes-no",
    leftTitle: "Energy Data",
    stimulus: [
      "The table below shows annual electricity generation (GWh) from renewable and non-renewable sources for five countries.",
    ],
    visual: {
      type: "table",
      title: "Annual electricity generation by source",
      headers: [
        "Country",
        "Renewable (GWh)",
        "Non-renewable (GWh)",
        "Total (GWh)",
      ],
      rows: [
        ["Arventa", "1,200", "800", "2,000"],
        ["Brenholm", "450", "1,550", "2,000"],
        ["Caldris", "780", "220", "1,000"],
        ["Dorvik", "2,100", "900", "3,000"],
        ["Estavia", "630", "270", "900"],
      ],
    },
    question:
      "For each of the following statements, select 'Yes' if it follows from the information given, or 'No' if it does not.",
    instruction: "Select Yes or No for each statement.",
    yesNoStatements: [
      {
        id: "dm-yn-energy-01-a",
        text: "Dorvik generates more renewable electricity than Arventa and Caldris combined.",
        answer: "Yes",
      },
      {
        id: "dm-yn-energy-01-b",
        text: "More than half of the countries have a renewable energy share above 65% of their total generation.",
        answer: "Yes",
      },
      {
        id: "dm-yn-energy-01-c",
        text: "Brenholm's non-renewable generation exceeds Estavia's total generation.",
        answer: "Yes",
      },
      {
        id: "dm-yn-energy-01-d",
        text: "The combined total generation of the two smallest producers exceeds 2,000 GWh.",
        answer: "No",
      },
      {
        id: "dm-yn-energy-01-e",
        text: "Arventa's renewable share is greater than the average renewable share across all five countries.",
        answer: "No",
      },
    ],
    explanation:
      "A — YES: Dorvik renewable = 2,100 GWh. Arventa + Caldris = 1,200 + 780 = 1,980 GWh. 2,100 > 1,980.\n" +
      "B — YES: Renewable shares — Arventa: 1,200/2,000 = 60%; Brenholm: 450/2,000 = 22.5%; Caldris: 780/1,000 = 78%; Dorvik: 2,100/3,000 = 70%; Estavia: 630/900 = 70%. Countries above 65%: Caldris, Dorvik, Estavia = 3 of 5. 3/5 = 60%, which is more than half.\n" +
      "C — YES: Brenholm non-renewable = 1,550 GWh. Estavia total = 900 GWh. 1,550 > 900.\n" +
      "D — NO: Two smallest producers by total output: Estavia (900 GWh) and Caldris (1,000 GWh). Combined = 1,900 GWh. 1,900 < 2,000.\n" +
      "E — NO: Arventa's renewable share = 1,200/2,000 = 60%. Average across all five countries = (60 + 22.5 + 78 + 70 + 70) / 5 = 300.5 / 5 = 60.1%. 60% < 60.1%, so Arventa's share is not greater than the average.",
  },

  {
    kind: "single",
    subtype: "dm-logic",
    leftTitle: "Scheduling",
    stimulus: [
      "A law firm schedules one client meeting per day across five consecutive days: Monday, Tuesday, Wednesday, Thursday, and Friday. Five clients — Farida, Grant, Heidi, Ivan, and Jasmine — are each assigned exactly one day. The following conditions apply:",
      "• Farida's meeting is earlier in the week than Grant's.",
      "• Heidi's meeting is on Wednesday.",
      "• Ivan's meeting is not on Monday or Friday.",
      "• Jasmine's meeting is later in the week than Grant's.",
      "• Ivan's meeting is not on Wednesday.",
    ],
    question: "Which of the following must be true?",
    correct: "Farida's meeting is on Monday.",
    distractors: [
      "Grant's meeting is on Tuesday.",
      "Ivan's meeting is on Thursday.",
      "Ivan's meeting is before Grant's.",
    ],
    explanation:
      "Heidi = Wednesday (given). Ivan ≠ Monday, Friday, or Wednesday → Ivan = Tuesday or Thursday.\n\n" +
      "The ordering constraint Farida < Grant < Jasmine, with Wednesday reserved for Heidi, means F, G, and J must occupy three of {Mon, Tue, Thu, Fri}.\n\n" +
      "Testing all valid triples in order:\n" +
      "• Mon < Tue < Thu: F=Mon, G=Tue, J=Thu → Ivan must take Fri — violates Ivan ≠ Fri. ✗\n" +
      "• Mon < Tue < Fri: F=Mon, G=Tue, J=Fri → Ivan = Thu ✓ → Arrangement 1: F=Mon, G=Tue, H=Wed, I=Thu, J=Fri.\n" +
      "• Mon < Thu < Fri: F=Mon, G=Thu, J=Fri → Ivan = Tue ✓ → Arrangement 2: F=Mon, I=Tue, H=Wed, G=Thu, J=Fri.\n" +
      "• Tue < Thu < Fri: F=Tue, G=Thu, J=Fri → Ivan = Mon — violates Ivan ≠ Mon. ✗\n\n" +
      "Only two arrangements are valid. In both, Farida is on Monday. Grant is Tuesday in arrangement 1 but Thursday in arrangement 2 (eliminates that distractor). Ivan is Thursday in 1 but Tuesday in 2 (eliminates that distractor). Ivan is after Grant in arrangement 1 (Thu > Tue) but before Grant in arrangement 2 (Tue < Thu), so neither ordering of Ivan vs Grant must be true. Only Farida = Monday holds in every valid scenario.",
  },

  // --- Loop batch 2 ---

  {
    kind: "drag-category",
    subtype: "dm-syllogisms",
    leftTitle: "Syllogisms",
    stimulus: [
      "All endangered species are protected by international law.",
      "Some species protected by international law are native to tropical rainforests.",
      "No species native to tropical rainforests is found in the Arctic.",
      "All species found in the Arctic are cold-adapted.",
    ],
    question:
      "Assuming the statements above are true, which of the following conclusions follow beyond reasonable doubt?",
    instruction: "Drag each conclusion to the appropriate category.",
    categories: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    categoryItems: [
      {
        id: "dm-syl-wildlife-02-a",
        text: "All endangered species are protected by international law.",
        answerCategory: "yes",
      },
      {
        id: "dm-syl-wildlife-02-b",
        text: "Some species protected by international law are not found in the Arctic.",
        answerCategory: "yes",
      },
      {
        id: "dm-syl-wildlife-02-c",
        text: "Some endangered species are native to tropical rainforests.",
        answerCategory: "no",
      },
      {
        id: "dm-syl-wildlife-02-d",
        text: "All cold-adapted species are found in the Arctic.",
        answerCategory: "no",
      },
      {
        id: "dm-syl-wildlife-02-e",
        text: "No species native to tropical rainforests is cold-adapted.",
        answerCategory: "no",
      },
    ],
    explanation:
      "A — YES: This restates premise 1 directly. All endangered species are protected by international law.\n" +
      "B — YES: Premise 2 states some protected species are tropical rainforest natives. Premise 3 states no rainforest native is found in the Arctic. Therefore those rainforest-native protected species are not Arctic — some protected species are not found in the Arctic.\n" +
      "C — NO: Endangered species are a subset of protected species, and some protected species are rainforest natives, but those two groups within 'protected' may not overlap. We cannot conclude any endangered species is a rainforest native.\n" +
      "D — NO: Premise 4 says all Arctic species are cold-adapted (Arctic ⊆ cold-adapted). This conclusion reverses the direction, claiming all cold-adapted are Arctic — a converse error. Cold-adaptation can exist outside the Arctic.\n" +
      "E — NO: Premises 3 and 4 together show no rainforest native is Arctic, and all Arctic species are cold-adapted. However, cold-adaptation is not exclusive to Arctic species — a rainforest native could conceivably be cold-adapted through other means. The premises do not rule this out.",
  },

  {
    kind: "yes-no",
    subtype: "dm-yes-no",
    leftTitle: "Sales Data",
    stimulus: [
      "The table below shows quarterly sales figures (£000s) for a retail company across four regions.",
    ],
    visual: {
      type: "table",
      title: "Quarterly regional sales (£000s)",
      headers: ["Region", "Q1", "Q2", "Q3", "Q4", "Annual Total"],
      rows: [
        ["North", "85", "90", "110", "95", "380"],
        ["South", "120", "115", "130", "140", "505"],
        ["East", "60", "75", "80", "65", "280"],
        ["West", "95", "100", "95", "110", "400"],
      ],
    },
    question:
      "For each of the following statements, select 'Yes' if it follows from the information given, or 'No' if it does not.",
    instruction: "Select Yes or No for each statement.",
    yesNoStatements: [
      {
        id: "dm-yn-retail-02-a",
        text: "The South region generated more than 30% of the company's total annual sales.",
        answer: "Yes",
      },
      {
        id: "dm-yn-retail-02-b",
        text: "Q3 was the strongest quarter for every region.",
        answer: "No",
      },
      {
        id: "dm-yn-retail-02-c",
        text: "The East region's annual sales were less than half of the South region's annual sales.",
        answer: "No",
      },
      {
        id: "dm-yn-retail-02-d",
        text: "Combined first-half sales (Q1 + Q2) across all regions exceeded combined second-half sales (Q3 + Q4).",
        answer: "No",
      },
      {
        id: "dm-yn-retail-02-e",
        text: "The West region had higher sales in Q4 than in Q1.",
        answer: "Yes",
      },
    ],
    explanation:
      "Grand total = 380 + 505 + 280 + 400 = £1,565,000.\n" +
      "A — YES: South = £505,000. 505 / 1,565 = 32.3%, which exceeds 30%.\n" +
      "B — NO: Q3 is indeed the peak for North (110) and East (80), but South's highest quarter is Q4 (140), not Q3 (130). The statement fails for South.\n" +
      "C — NO: Half of South = 505 / 2 = £252,500. East = £280,000. Since 280 > 252.5, East's sales are NOT less than half of South's.\n" +
      "D — NO: H1 (Q1+Q2) = (85+90) + (120+115) + (60+75) + (95+100) = 175 + 235 + 135 + 195 = £740,000. H2 (Q3+Q4) = (110+95) + (130+140) + (80+65) + (95+110) = 205 + 270 + 145 + 205 = £825,000. H1 (£740k) < H2 (£825k).\n" +
      "E — YES: West Q4 = £110,000; West Q1 = £95,000. 110 > 95.",
  },

  {
    kind: "single",
    subtype: "dm-arguments",
    leftTitle: "Argument",
    stimulus: [
      "A hospital trust is considering whether to introduce a mandatory annual influenza vaccination programme for all clinical staff.",
    ],
    question: "Select the strongest argument from the statements below.",
    correct:
      "Yes, because vaccinating clinical staff reduces the risk of transmitting influenza to vulnerable patients.",
    distractors: [
      "Yes, because influenza vaccines are stored in refrigerators.",
      "No, because some clinical staff prefer a different colour of uniform.",
      "No, because hospital car parks can be difficult to navigate during winter.",
    ],
    explanation:
      "The strongest argument must be directly relevant to the proposal and provide a meaningful reason that supports or opposes it on its merits.\n\n" +
      "The correct answer identifies a clinically significant outcome — protecting vulnerable patients from staff-transmitted influenza — which goes to the heart of why such a policy would be considered. This is relevant (patient safety), logical (transmission can occur from staff to patients), and proportionate.\n\n" +
      "The distractors are all irrelevant: vaccine storage temperature has no bearing on whether vaccination should be mandatory; staff uniform preferences are unrelated to the vaccination decision; and winter car park congestion is unconnected to the policy. These are classic examples of the 'irrelevant reason' flaw — each introduces a factual point that does not engage with the actual question of whether mandatory vaccination is justified.",
  },

  // ===== PASTE NEW DM QUESTIONS ABOVE THIS LINE =====
];
