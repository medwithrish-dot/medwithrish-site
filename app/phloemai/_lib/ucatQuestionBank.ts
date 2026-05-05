export type UCATSection = "vr" | "dm" | "qr" | "sjt";
export type UCATOptionKey = "A" | "B" | "C" | "D";

export type UCATSubtypeId =
  | "vr-tfc"
  | "vr-inference"
  | "vr-author"
  | "vr-detail"
  | "vr-summary"
  | "dm-syllogisms"
  | "dm-logic"
  | "dm-arguments"
  | "dm-probability-data"
  | "dm-yes-no"
  | "dm-venn-sets"
  | "qr-graphs"
  | "qr-percentages"
  | "qr-rates-ratios"
  | "qr-averages"
  | "qr-units-geometry"
  | "qr-estimation"
  | "qr-calculator-strategy"
  | "sjt-appropriateness"
  | "sjt-importance"
  | "sjt-communication"
  | "sjt-integrity"
  | "sjt-ordering";

export type UCATChartVisual =
  | {
      type: "bar";
      title: string;
      yLabel: string;
      categories: Array<{ label: string; value: number }>;
      max: number;
      note?: string;
    }
  | {
      type: "line";
      title: string;
      yLabel: string;
      points: Array<{ label: string; value: number }>;
      max: number;
      note?: string;
    }
  | {
      type: "table";
      title: string;
      headers: string[];
      rows: string[][];
      note?: string;
    };

type UCATQuestionBase = {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  title: string;
  leftTitle?: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  question: string;
  explanation: string;
};

export type UCATSingleQuestion = UCATQuestionBase & {
  questionType?: "single";
  options: Array<{ key: UCATOptionKey; text: string }>;
  answer: UCATOptionKey;
};

export type UCATDragOrderQuestion = UCATQuestionBase & {
  questionType: "drag-order";
  dragItems: Array<{ id: string; text: string }>;
  answerOrder: string[];
  instruction: string;
};

export type UCATQuestion = UCATSingleQuestion | UCATDragOrderQuestion;

export const UCAT_SECTIONS: Array<{
  slug: UCATSection;
  code: string;
  title: string;
  bankTitle: string;
  description: string;
  secondsPerQuestion: number;
}> = [
  {
    slug: "vr",
    code: "VR",
    title: "Verbal Reasoning",
    bankTitle: "PhloemAI Verbal Reasoning",
    description: "Passage comprehension, inference and author attitude.",
    secondsPerQuestion: 64,
  },
  {
    slug: "dm",
    code: "DM",
    title: "Decision Making",
    bankTitle: "PhloemAI Decision Making",
    description: "Logic, syllogisms, probability, data and arguments.",
    secondsPerQuestion: 64,
  },
  {
    slug: "qr",
    code: "QR",
    title: "Quantitative Reasoning",
    bankTitle: "PhloemAI Quantitative Reasoning",
    description: "Numerical problem solving across graphs, rates and data.",
    secondsPerQuestion: 41,
  },
  {
    slug: "sjt",
    code: "SJT",
    title: "Situational Judgement",
    bankTitle: "PhloemAI Situational Judgement",
    description: "Appropriateness, importance and professional judgement.",
    secondsPerQuestion: 26,
  },
];

export const UCAT_SUBTYPES: Record<
  UCATSection,
  Array<{ id: UCATSubtypeId; label: string; description: string }>
> = {
  vr: [
    {
      id: "vr-tfc",
      label: "True / false / can't tell",
      description: "Judge whether a statement follows from the passage.",
    },
    {
      id: "vr-inference",
      label: "Inference",
      description: "Choose the statement best supported by the text.",
    },
    {
      id: "vr-author",
      label: "Author's opinion",
      description: "Identify tone, attitude or likely author agreement.",
    },
    {
      id: "vr-detail",
      label: "Main idea and detail",
      description: "Find the purpose, detail or central reason in the passage.",
    },
    {
      id: "vr-summary",
      label: "Summary and structure",
      description: "Select the best summary, title or structural role.",
    },
  ],
  dm: [
    {
      id: "dm-syllogisms",
      label: "Syllogisms",
      description: "Decide what must logically follow.",
    },
    {
      id: "dm-logic",
      label: "Logic puzzles",
      description: "Apply rules, ordering and constraints.",
    },
    {
      id: "dm-arguments",
      label: "Arguments",
      description: "Strengthen, weaken or evaluate reasoning.",
    },
    {
      id: "dm-probability-data",
      label: "Probability and data",
      description: "Use probabilities, sets and short data displays.",
    },
    {
      id: "dm-yes-no",
      label: "Yes / no statements",
      description: "Evaluate several conclusions against the same information.",
    },
    {
      id: "dm-venn-sets",
      label: "Venn and sets",
      description: "Work with overlaps, exclusions and grouped information.",
    },
  ],
  qr: [
    {
      id: "qr-graphs",
      label: "Data displays",
      description: "Interpret charts, tables, text-only data and visual trends.",
    },
    {
      id: "qr-percentages",
      label: "Percentages, fractions and finance",
      description: "Use percentage change, fractions, discounts, tax and margins.",
    },
    {
      id: "qr-rates-ratios",
      label: "Rates, ratios and proportions",
      description: "Scale quantities, speeds, unit costs and rates.",
    },
    {
      id: "qr-averages",
      label: "Averages, totals and spread",
      description: "Use mean, median, mode, range, totals and missing values.",
    },
    {
      id: "qr-units-geometry",
      label: "Units, geometry and scale",
      description: "Handle conversions, area, volume and scaled measurements.",
    },
    {
      id: "qr-estimation",
      label: "Estimation and mental maths",
      description: "Round, approximate and spot whether an answer is reasonable.",
    },
    {
      id: "qr-calculator-strategy",
      label: "Calculator and working strategy",
      description: "Choose efficient calculator, noteboard and multi-step methods.",
    },
  ],
  sjt: [
    {
      id: "sjt-appropriateness",
      label: "Appropriateness",
      description: "Judge whether an action is suitable in context.",
    },
    {
      id: "sjt-importance",
      label: "Importance",
      description: "Judge how important a consideration or action is.",
    },
    {
      id: "sjt-communication",
      label: "Communication and teamwork",
      description: "Respond respectfully to patients, peers and colleagues.",
    },
    {
      id: "sjt-integrity",
      label: "Integrity and confidentiality",
      description: "Protect trust, fairness and sensitive information.",
    },
    {
      id: "sjt-ordering",
      label: "Rank / order actions",
      description: "Drag actions into the best professional order.",
    },
  ],
};

export const UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> = {
  vr: [
    {
      id: "vr-tfc-001",
      section: "vr",
      subtype: "vr-tfc",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "A city council introduced a cycle-hire scheme after a survey found that many residents made short journeys by car. The first docking stations were placed near rail stops and university buildings. During the first six months, most journeys lasted less than twenty minutes, and usage was highest on weekdays.",
        "Transport officers cautioned that the scheme's effect on congestion was difficult to measure. Bus passenger numbers also changed during the same period, but a new bus timetable had been introduced at almost the same time. The council plans to compare data over three years before deciding whether to expand the scheme.",
      ],
      question:
        "The cycle-hire scheme caused a fall in bus use. According to the passage, this statement is:",
      options: [
        { key: "A", text: "True" },
        { key: "B", text: "False" },
        { key: "C", text: "Can't tell" },
      ],
      answer: "C",
      explanation:
        "Bus passenger numbers changed, but the passage says a timetable change happened at almost the same time, so the cycle scheme cannot be identified as the cause.",
    },
    {
      id: "vr-tfc-002",
      section: "vr",
      subtype: "vr-tfc",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "A coastal town restored a disused pier using a mixture of charitable donations and council funding. The restored pier now hosts craft stalls, a small exhibition space and seasonal music events. Local hotels reported higher weekend bookings in the summer after it reopened.",
        "However, the restoration did not solve all of the town's economic problems. Several shops on the high street remained empty, and winter footfall was still low. The council argued that the pier should be viewed as one part of a wider plan rather than a complete solution.",
      ],
      question:
        "The restored pier eliminated the town's economic difficulties. According to the passage, this statement is:",
      options: [
        { key: "A", text: "True" },
        { key: "B", text: "False" },
        { key: "C", text: "Can't tell" },
      ],
      answer: "B",
      explanation:
        "The passage says empty shops and low winter footfall remained, so the pier did not eliminate the economic difficulties.",
    },
    {
      id: "vr-inference-001",
      section: "vr",
      subtype: "vr-inference",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "In the late nineteenth century, several towns in northern England built covered market halls. These buildings were not simply places to buy food. They were also civic statements, designed to show that a town was orderly, prosperous and modern. Stallholders paid rent to the council, and inspectors checked weights, measures and hygiene more regularly than they had in open-air markets.",
        "Some traders complained that the halls made selling more expensive. Others welcomed the change because bad weather no longer reduced trade. Historians disagree about whether the halls mainly improved public health or whether they were built to raise municipal income. In many towns, both motives appear to have been present.",
      ],
      question: "According to the passage, covered market halls:",
      options: [
        { key: "A", text: "were introduced only to improve public health." },
        { key: "B", text: "could benefit traders by reducing the effect of poor weather." },
        { key: "C", text: "removed the need for council inspection." },
        { key: "D", text: "were opposed by all stallholders because rents increased." },
      ],
      answer: "B",
      explanation:
        "The passage says some traders welcomed the halls because bad weather no longer reduced trade. The other options use absolute claims not supported by the passage.",
    },
    {
      id: "vr-inference-002",
      section: "vr",
      subtype: "vr-inference",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "Researchers testing a new honey-based wound dressing found that it reduced bacterial growth in laboratory samples. The dressing was cheaper than some synthetic alternatives, but it had not yet been tested in large clinical trials. Nurses who used early samples said it was easy to apply, although some patients disliked its smell.",
        "The research team argued that the dressing was promising but should not replace standard products until stronger evidence was available. They also noted that cost savings would matter only if the dressing performed at least as well as existing treatments in real patients.",
      ],
      question: "Which statement is best supported by the passage?",
      options: [
        { key: "A", text: "The dressing is ready to replace all standard wound products." },
        { key: "B", text: "The dressing has shown potential but needs stronger clinical evidence." },
        { key: "C", text: "Patients preferred the dressing to every synthetic alternative." },
        { key: "D", text: "The dressing was more expensive than existing treatments." },
      ],
      answer: "B",
      explanation:
        "The team calls the dressing promising but says it should not replace standard products until better evidence is available.",
    },
    {
      id: "vr-author-001",
      section: "vr",
      subtype: "vr-author",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "Octopuses are often described as solitary animals, but this label can be misleading. In the wild, many species spend long periods alone, yet they also interact with rivals, potential mates and predators in complex ways. Some can change colour rapidly, not only to hide but also to signal aggression or uncertainty.",
        "Researchers are cautious about calling these signals a language. Unlike human speech, the displays do not appear to have fixed meanings in every context. A dark colour pattern, for example, may precede an attack in one situation but simply reflect stress in another. The same behaviour can therefore be informative without being symbolic.",
      ],
      question:
        "The author's attitude towards describing octopus colour displays as a language is best described as:",
      options: [
        { key: "A", text: "enthusiastic, because the displays always have fixed meanings." },
        { key: "B", text: "dismissive, because octopuses rarely communicate." },
        { key: "C", text: "cautious, because the displays vary with context." },
        { key: "D", text: "certain, because the displays match human speech." },
      ],
      answer: "C",
      explanation:
        "The passage says researchers are cautious and explains that the same display can mean different things in different contexts.",
    },
    {
      id: "vr-author-002",
      section: "vr",
      subtype: "vr-author",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "Several schools have replaced annual prize ceremonies with smaller termly recognition events. Supporters argue that pupils who improve steadily are more likely to be noticed, rather than only those who finish top of a year group. Critics worry that frequent awards reduce the meaning of success.",
        "The author notes that both concerns have some force, but suggests that the design of the awards matters more than their frequency. A certificate for every minor task may feel empty, whereas a carefully chosen recognition of effort or contribution can reinforce the behaviour a school values.",
      ],
      question: "Which view would the author most likely support?",
      options: [
        { key: "A", text: "Frequent awards are always harmful." },
        { key: "B", text: "Only academic winners should receive recognition." },
        { key: "C", text: "Recognition can be useful if it is selective and meaningful." },
        { key: "D", text: "Schools should avoid recognising effort or contribution." },
      ],
      answer: "C",
      explanation:
        "The author does not reject frequent awards entirely, but stresses that awards should be carefully chosen and meaningful.",
    },
    {
      id: "vr-detail-001",
      section: "vr",
      subtype: "vr-detail",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "A small island museum recently stopped displaying a set of navigational charts. The charts were fragile, and light exposure had begun to fade the ink. Instead, the museum created high-resolution digital copies and placed the originals in climate-controlled storage.",
        "Visitor numbers did not fall after the change. In fact, the digital display allowed visitors to zoom into details that had previously been difficult to see. Some regular visitors missed the atmosphere of seeing the original objects, but the museum argued that preservation had to take priority over display.",
      ],
      question: "The museum's decision was mainly based on:",
      options: [
        { key: "A", text: "a need to protect the original charts from damage." },
        { key: "B", text: "a fall in visitor numbers." },
        { key: "C", text: "the belief that digital images are always more valuable than originals." },
        { key: "D", text: "a lack of public interest in navigational history." },
      ],
      answer: "A",
      explanation:
        "The passage emphasises fragility, fading ink and preservation. It explicitly says visitor numbers did not fall.",
    },
    {
      id: "vr-detail-002",
      section: "vr",
      subtype: "vr-detail",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "A university archive began recruiting volunteers to describe old photographs. Many images had been donated without dates, locations or names. Volunteers were asked to record visible details such as street signs, clothing and shop fronts, which professional archivists could later check against other records.",
        "The project did not allow volunteers to make final identifications. Archive staff said this prevented confident but inaccurate guesses from entering the catalogue. The aim was to speed up research while keeping the final record reliable.",
      ],
      question: "Why were volunteers asked to record visible details?",
      options: [
        { key: "A", text: "So they could replace professional archivists." },
        { key: "B", text: "So archivists could later compare the details with other records." },
        { key: "C", text: "So the archive could avoid checking their work." },
        { key: "D", text: "So photographs without dates could be discarded." },
      ],
      answer: "B",
      explanation:
        "The passage says volunteers recorded details that professional archivists could later check against other records.",
    },
    {
      id: "vr-summary-001",
      section: "vr",
      subtype: "vr-summary",
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: [
        "Some hospitals have introduced quiet handover rooms where clinical staff exchange information at the end of a shift. The rooms are designed to reduce interruptions from phone calls, passing colleagues and corridor noise. Early feedback suggests staff feel less rushed when discussing complex patients.",
        "However, managers have not claimed that quiet rooms alone prevent mistakes. Written notes, clear responsibility and enough overlap between shifts remain essential. The strongest argument for the rooms is that they remove one avoidable source of distraction from an already demanding process.",
      ],
      question: "Which option best summarises the passage?",
      options: [
        { key: "A", text: "Quiet handover rooms are useful because they reduce distraction, but they are not a complete solution." },
        { key: "B", text: "Quiet handover rooms have been proven to eliminate clinical errors during shift changes." },
        { key: "C", text: "Written notes are no longer necessary if handovers take place in quiet rooms." },
        { key: "D", text: "Managers introduced quiet rooms mainly because staff disliked written records." },
      ],
      answer: "A",
      explanation:
        "The passage presents quiet rooms as helpful for reducing interruptions, while stressing that other safety measures remain essential.",
    },
  ],
  dm: [
    {
      id: "dm-logic-001",
      section: "dm",
      subtype: "dm-logic",
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "A clinic runs four appointment types: blood test, review, vaccination and dressing change. Blood tests are always before 10:30. Reviews are never on Friday. Dressing changes are only on Tuesday or Thursday. Vaccinations can be on any weekday except Tuesday.",
      ],
      question:
        "Which of the following appointments could be scheduled on a Tuesday at 11:00?",
      options: [
        { key: "A", text: "Blood test only" },
        { key: "B", text: "Dressing change only" },
        { key: "C", text: "Dressing change or review" },
        { key: "D", text: "Vaccination or dressing change" },
      ],
      answer: "C",
      explanation:
        "A blood test must be before 10:30, so it cannot be 11:00. Vaccinations cannot be on Tuesday. Dressing changes can be Tuesday, and reviews are allowed on Tuesday because they are only excluded on Friday.",
    },
    {
      id: "dm-logic-002",
      section: "dm",
      subtype: "dm-logic",
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "Four students, Hana, Idris, Maya and Theo, each give one presentation. Hana presents before Theo. Maya presents immediately after Idris. Theo does not present last.",
      ],
      question: "Which order is possible?",
      options: [
        { key: "A", text: "Hana, Idris, Maya, Theo" },
        { key: "B", text: "Idris, Maya, Theo, Hana" },
        { key: "C", text: "Maya, Idris, Hana, Theo" },
        { key: "D", text: "Hana, Theo, Idris, Maya" },
      ],
      answer: "D",
      explanation:
        "Hana is before Theo, Maya is immediately after Idris, and Theo is not last. Only Hana, Theo, Idris, Maya satisfies all three rules.",
    },
    {
      id: "dm-arguments-001",
      section: "dm",
      subtype: "dm-arguments",
      title: "Decision Making Practice",
      leftTitle: "Argument",
      stimulus: [
        "A local council is considering extending library opening hours. Supporters say students need quiet study spaces after school. Opponents say online resources mean longer opening hours are unnecessary.",
      ],
      question:
        "Which statement, if true, most strengthens the case for extending opening hours?",
      options: [
        { key: "A", text: "Most local students have reliable quiet study space at home." },
        { key: "B", text: "Library use is highest between 3:30 pm and 6:30 pm." },
        { key: "C", text: "The library's online catalogue was recently updated." },
        { key: "D", text: "A neighbouring town reduced its library opening hours last year." },
      ],
      answer: "B",
      explanation:
        "High use after school directly supports the claim that students need access during later hours. The other options either weaken, distract from, or do not directly support the argument.",
    },
    {
      id: "dm-arguments-002",
      section: "dm",
      subtype: "dm-arguments",
      title: "Decision Making Practice",
      leftTitle: "Argument",
      stimulus: [
        "A hospital manager argues that reminder texts should be stopped because missed appointment rates were unchanged in one small department last month. The manager says the texts are therefore pointless.",
      ],
      question: "Which option best identifies a weakness in the manager's argument?",
      options: [
        { key: "A", text: "The argument uses one small department and one month to judge the whole policy." },
        { key: "B", text: "The argument explains how reminder texts are written." },
        { key: "C", text: "The argument proves that patients dislike text messages." },
        { key: "D", text: "The argument compares reminder texts with phone calls." },
      ],
      answer: "A",
      explanation:
        "The conclusion is too broad for the evidence. One department over one month may not represent the effect of reminder texts overall.",
    },
    {
      id: "dm-probability-001",
      section: "dm",
      subtype: "dm-probability-data",
      title: "Decision Making Practice",
      leftTitle: "Probability",
      stimulus: [
        "A box contains 5 blue tokens, 3 red tokens and 2 green tokens. One token is chosen at random and not replaced. A second token is then chosen at random.",
      ],
      question: "What is the probability that both tokens are blue?",
      options: [
        { key: "A", text: "1/5" },
        { key: "B", text: "2/9" },
        { key: "C", text: "5/18" },
        { key: "D", text: "1/4" },
      ],
      answer: "B",
      explanation:
        "The probability is 5/10 for the first blue token, then 4/9 for the second blue token. 5/10 x 4/9 = 20/90 = 2/9.",
    },
    {
      id: "dm-probability-002",
      section: "dm",
      subtype: "dm-probability-data",
      title: "Decision Making Practice",
      leftTitle: "Data",
      stimulus: [
        "In a group of 40 applicants, 22 study biology, 18 study chemistry and 10 study both biology and chemistry.",
      ],
      question: "How many applicants study neither biology nor chemistry?",
      options: [
        { key: "A", text: "8" },
        { key: "B", text: "10" },
        { key: "C", text: "12" },
        { key: "D", text: "14" },
      ],
      answer: "B",
      explanation:
        "The number studying at least one is 22 + 18 - 10 = 30. Therefore 40 - 30 = 10 study neither.",
    },
    {
      id: "dm-yes-no-001",
      section: "dm",
      subtype: "dm-yes-no",
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "Every candidate who attends the morning assessment completes a written task. Some candidates who complete a written task also complete a role play. No candidate who attends the afternoon assessment completes a role play.",
      ],
      question: "Which statement must be answered 'yes'?",
      options: [
        { key: "A", text: "Do all candidates who complete a written task attend the morning assessment?" },
        { key: "B", text: "Do some candidates who complete a role play complete a written task?" },
        { key: "C", text: "Do all candidates who attend the afternoon assessment complete a written task?" },
        { key: "D", text: "Do some candidates who attend the afternoon assessment complete a role play?" },
      ],
      answer: "B",
      explanation:
        "The information says some candidates who complete a written task also complete a role play, so those role-play candidates also completed a written task.",
    },
    {
      id: "dm-venn-sets-001",
      section: "dm",
      subtype: "dm-venn-sets",
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "In a revision group of 60 students, 34 study Verbal Reasoning, 29 study Decision Making and 21 study Quantitative Reasoning. Twelve study both Verbal Reasoning and Decision Making, 9 study both Decision Making and Quantitative Reasoning, 8 study both Verbal Reasoning and Quantitative Reasoning, and 5 study all three.",
      ],
      question: "How many students study none of the three listed areas?",
      options: [
        { key: "A", text: "0" },
        { key: "B", text: "4" },
        { key: "C", text: "6" },
        { key: "D", text: "9" },
      ],
      answer: "A",
      explanation:
        "At least one area = 34 + 29 + 21 - 12 - 9 - 8 + 5 = 60, so no students are outside the three groups.",
    },
    {
      id: "dm-syllogisms-001",
      section: "dm",
      subtype: "dm-syllogisms",
      title: "Decision Making Practice",
      leftTitle: "Syllogism",
      stimulus: [
        "All mentors at the centre are trained volunteers. No trained volunteers are paid employees.",
      ],
      question: "Which conclusion must follow?",
      options: [
        { key: "A", text: "No mentors at the centre are paid employees." },
        { key: "B", text: "All paid employees are mentors." },
        { key: "C", text: "Some trained volunteers are mentors." },
        { key: "D", text: "No paid employees work at the centre." },
      ],
      answer: "A",
      explanation:
        "If all mentors are trained volunteers, and no trained volunteers are paid employees, then no mentors are paid employees.",
    },
    {
      id: "dm-syllogisms-002",
      section: "dm",
      subtype: "dm-syllogisms",
      title: "Decision Making Practice",
      leftTitle: "Syllogism",
      stimulus: [
        "Some online courses include live tutorials. All courses with live tutorials require advance booking.",
      ],
      question: "Which conclusion must follow?",
      options: [
        { key: "A", text: "All online courses require advance booking." },
        { key: "B", text: "Some online courses require advance booking." },
        { key: "C", text: "No courses without live tutorials require advance booking." },
        { key: "D", text: "All courses requiring advance booking include live tutorials." },
      ],
      answer: "B",
      explanation:
        "At least some online courses have live tutorials, and every course with live tutorials requires advance booking. Therefore some online courses require advance booking.",
    },
  ],
  qr: [
    {
      id: "qr-graphs-001",
      section: "qr",
      subtype: "qr-graphs",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "The bar chart shows attendances at an evening clinic over five weekdays.",
      ],
      visual: {
        type: "bar",
        title: "Evening clinic attendances",
        yLabel: "Attendances",
        max: 80,
        categories: [
          { label: "Mon", value: 42 },
          { label: "Tue", value: 58 },
          { label: "Wed", value: 51 },
          { label: "Thu", value: 67 },
          { label: "Fri", value: 62 },
        ],
        note: "Values are attendances per evening.",
      },
      question:
        "The combined attendance on Wednesday and Thursday was what percentage of the combined attendance on Monday and Tuesday?",
      options: [
        { key: "A", text: "108%" },
        { key: "B", text: "112%" },
        { key: "C", text: "118%" },
        { key: "D", text: "124%" },
      ],
      answer: "C",
      explanation:
        "Wednesday and Thursday total 51 + 67 = 118. Monday and Tuesday total 42 + 58 = 100. 118 as a percentage of 100 is 118%.",
    },
    {
      id: "qr-graphs-002",
      section: "qr",
      subtype: "qr-graphs",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "The line graph shows average waiting time at a walk-in clinic from January to May.",
      ],
      visual: {
        type: "line",
        title: "Average waiting time",
        yLabel: "Minutes",
        max: 30,
        points: [
          { label: "Jan", value: 18 },
          { label: "Feb", value: 22 },
          { label: "Mar", value: 20 },
          { label: "Apr", value: 16 },
          { label: "May", value: 14 },
        ],
        note: "Average waiting time is shown to the nearest minute.",
      },
      question:
        "From February to May, by approximately what percentage did the average waiting time decrease?",
      options: [
        { key: "A", text: "28%" },
        { key: "B", text: "36%" },
        { key: "C", text: "44%" },
        { key: "D", text: "57%" },
      ],
      answer: "B",
      explanation:
        "The decrease is 22 - 14 = 8 minutes. 8/22 x 100 = 36.4%, which is approximately 36%.",
    },
    {
      id: "qr-graphs-003",
      section: "qr",
      subtype: "qr-graphs",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "The bar chart shows the number of lab samples processed in one morning.",
      ],
      visual: {
        type: "bar",
        title: "Lab samples processed",
        yLabel: "Samples",
        max: 140,
        categories: [
          { label: "Blood", value: 120 },
          { label: "Urine", value: 80 },
          { label: "Swab", value: 64 },
          { label: "Other", value: 36 },
        ],
        note: "Repeat testing is needed for 25% of blood samples and 10% of urine samples.",
      },
      question: "How many blood and urine samples in total need repeat testing?",
      options: [
        { key: "A", text: "32" },
        { key: "B", text: "34" },
        { key: "C", text: "38" },
        { key: "D", text: "42" },
      ],
      answer: "C",
      explanation:
        "25% of 120 blood samples is 30. 10% of 80 urine samples is 8. Total repeat tests = 38.",
    },
    {
      id: "qr-graphs-004",
      section: "qr",
      subtype: "qr-graphs",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "The table shows bookings for three revision workshops.",
      ],
      visual: {
        type: "table",
        title: "Workshop bookings",
        headers: ["Workshop", "Capacity", "Booked"],
        rows: [
          ["Verbal", "80", "68"],
          ["Decision", "72", "54"],
          ["Quantitative", "90", "81"],
        ],
        note: "Each booked place is paid for.",
      },
      question: "Which workshop has the highest percentage of places booked?",
      options: [
        { key: "A", text: "Verbal" },
        { key: "B", text: "Decision" },
        { key: "C", text: "Quantitative" },
        { key: "D", text: "Verbal and Decision are tied" },
      ],
      answer: "C",
      explanation:
        "Verbal is 68/80 = 85%, Decision is 54/72 = 75%, and Quantitative is 81/90 = 90%. Quantitative is highest.",
    },
    {
      id: "qr-percentages-001",
      section: "qr",
      subtype: "qr-percentages",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A clinic ordered 240 vaccine doses. By noon, 35% had been used. By the end of the day, a further 78 doses had been used.",
      ],
      question: "How many doses were left at the end of the day?",
      options: [
        { key: "A", text: "72" },
        { key: "B", text: "78" },
        { key: "C", text: "84" },
        { key: "D", text: "96" },
      ],
      answer: "B",
      explanation:
        "35% of 240 is 84. Total used = 84 + 78 = 162. Doses left = 240 - 162 = 78.",
    },
    {
      id: "qr-percentages-002",
      section: "qr",
      subtype: "qr-percentages",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A revision course costs GBP 180 before VAT. VAT is charged at 20%. A student receives a 15% discount on the pre-VAT price before VAT is added.",
      ],
      question: "What is the final price paid?",
      options: [
        { key: "A", text: "GBP 153.00" },
        { key: "B", text: "GBP 183.60" },
        { key: "C", text: "GBP 189.00" },
        { key: "D", text: "GBP 216.00" },
      ],
      answer: "B",
      explanation:
        "15% off GBP 180 gives GBP 153. VAT at 20% adds GBP 30.60, so the final price is GBP 183.60.",
    },
    {
      id: "qr-rates-001",
      section: "qr",
      subtype: "qr-rates-ratios",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A packaging machine labels 480 packs in 2 hours 30 minutes. It works at a constant rate.",
      ],
      question: "How many packs does the machine label per hour?",
      options: [
        { key: "A", text: "160" },
        { key: "B", text: "180" },
        { key: "C", text: "192" },
        { key: "D", text: "210" },
      ],
      answer: "C",
      explanation:
        "2 hours 30 minutes is 2.5 hours. 480 / 2.5 = 192 packs per hour.",
    },
    {
      id: "qr-rates-002",
      section: "qr",
      subtype: "qr-rates-ratios",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A fund of GBP 450 is split between three departments in the ratio 3:5:7.",
      ],
      question: "How much does the department with the largest share receive?",
      options: [
        { key: "A", text: "GBP 150" },
        { key: "B", text: "GBP 180" },
        { key: "C", text: "GBP 210" },
        { key: "D", text: "GBP 240" },
      ],
      answer: "C",
      explanation:
        "The ratio has 3 + 5 + 7 = 15 parts. Each part is GBP 450 / 15 = GBP 30. The largest share is 7 parts, so 7 x GBP 30 = GBP 210.",
    },
    {
      id: "qr-averages-001",
      section: "qr",
      subtype: "qr-averages",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A student tracks the number of UCAT questions completed over four days: Monday 24, Tuesday 36, Wednesday 30, Thursday 42.",
      ],
      question:
        "What was the mean number of questions completed per day over these four days?",
      options: [
        { key: "A", text: "30" },
        { key: "B", text: "32" },
        { key: "C", text: "33" },
        { key: "D", text: "36" },
      ],
      answer: "C",
      explanation:
        "Add the four values: 24 + 36 + 30 + 42 = 132. Divide by 4 to get 33.",
    },
    {
      id: "qr-averages-002",
      section: "qr",
      subtype: "qr-averages",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "Seven practice set scores were: 48%, 52%, 55%, 59%, 62%, 62% and 70%.",
      ],
      question: "What is the range of the scores?",
      options: [
        { key: "A", text: "18 percentage points" },
        { key: "B", text: "20 percentage points" },
        { key: "C", text: "22 percentage points" },
        { key: "D", text: "24 percentage points" },
      ],
      answer: "C",
      explanation:
        "The range is the highest value minus the lowest value: 70 - 48 = 22 percentage points.",
    },
    {
      id: "qr-geometry-001",
      section: "qr",
      subtype: "qr-units-geometry",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A rectangular notice board is 1.8 m wide and 1.2 m high. A border of 10 cm is left around the inside edge before posters are placed.",
      ],
      question: "What is the poster area inside the border?",
      options: [
        { key: "A", text: "1.60 m2" },
        { key: "B", text: "1.80 m2" },
        { key: "C", text: "2.00 m2" },
        { key: "D", text: "2.16 m2" },
      ],
      answer: "A",
      explanation:
        "A 10 cm border on both sides reduces width by 0.2 m and height by 0.2 m. Poster area = 1.6 x 1.0 = 1.60 m2.",
    },
    {
      id: "qr-geometry-002",
      section: "qr",
      subtype: "qr-units-geometry",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A walking route is 12 km long. Use 1 mile = 1.6 km.",
      ],
      question: "What is the length of the route in miles?",
      options: [
        { key: "A", text: "6.8 miles" },
        { key: "B", text: "7.2 miles" },
        { key: "C", text: "7.5 miles" },
        { key: "D", text: "8.0 miles" },
      ],
      answer: "C",
      explanation:
        "12 km / 1.6 km per mile = 7.5 miles.",
    },
    {
      id: "qr-estimation-001",
      section: "qr",
      subtype: "qr-estimation",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A walk-in clinic recorded 1,984 appointments in April, 2,116 in May and 1,907 in June.",
      ],
      question:
        "Using quick estimation, approximately how many appointments were recorded across the three months?",
      options: [
        { key: "A", text: "5,700" },
        { key: "B", text: "6,000" },
        { key: "C", text: "6,300" },
        { key: "D", text: "6,600" },
      ],
      answer: "B",
      explanation:
        "Round the figures to 2,000, 2,100 and 1,900. The estimated total is 6,000, close to the exact total of 6,007.",
    },
    {
      id: "qr-calculator-strategy-001",
      section: "qr",
      subtype: "qr-calculator-strategy",
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "A calculation requires finding 37.5% of 864 and then adding 12.5% of 864.",
      ],
      question:
        "Which single calculation gives the same result most efficiently?",
      options: [
        { key: "A", text: "0.25 x 864" },
        { key: "B", text: "0.5 x 864" },
        { key: "C", text: "0.625 x 864" },
        { key: "D", text: "1.5 x 864" },
      ],
      answer: "B",
      explanation:
        "37.5% + 12.5% = 50%, so the quickest equivalent calculation is 0.5 x 864.",
    },
  ],
  sjt: [
    {
      id: "sjt-appropriateness-001",
      section: "sjt",
      subtype: "sjt-appropriateness",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "You are shadowing a junior doctor on a ward. A patient asks you whether their test results show cancer. You have seen the results on the computer, but the doctor has not yet discussed them with the patient.",
      ],
      question: "How appropriate is it to explain the result to the patient yourself?",
      options: [
        { key: "A", text: "Very appropriate" },
        { key: "B", text: "Appropriate, but not ideal" },
        { key: "C", text: "Inappropriate, but not awful" },
        { key: "D", text: "Very inappropriate" },
      ],
      answer: "D",
      explanation:
        "As a student observing, you should not disclose or interpret results. You should acknowledge the concern and direct the patient to the responsible doctor.",
    },
    {
      id: "sjt-appropriateness-002",
      section: "sjt",
      subtype: "sjt-appropriateness",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "You accidentally give a visitor the wrong directions in a hospital. Ten minutes later you see them looking distressed because they have missed the start of an appointment.",
      ],
      question: "How appropriate is it to apologise and help them find the right clinic?",
      options: [
        { key: "A", text: "Very appropriate" },
        { key: "B", text: "Appropriate, but not ideal" },
        { key: "C", text: "Inappropriate, but not awful" },
        { key: "D", text: "Very inappropriate" },
      ],
      answer: "A",
      explanation:
        "Taking responsibility, apologising and helping the visitor is respectful and practical.",
    },
    {
      id: "sjt-appropriateness-003",
      section: "sjt",
      subtype: "sjt-ordering",
      questionType: "drag-order",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "During a GP placement, you are asked to help organise patients in the waiting room. An elderly patient tells you they feel dizzy and may faint. At the same time, another patient says they have been waiting longer than everyone else and wants you to check their appointment time.",
      ],
      question:
        "Drag the actions into the most appropriate order, from first to last.",
      instruction:
        "Prioritise immediate patient safety, then seek appropriate help and communicate calmly.",
      dragItems: [
        {
          id: "safety",
          text: "Make sure the dizzy patient is safely seated and not left standing.",
        },
        {
          id: "staff",
          text: "Alert a receptionist or clinician that the patient feels faint.",
        },
        {
          id: "reassure",
          text: "Reassure the waiting patient that someone will check their appointment when safe to do so.",
        },
        {
          id: "check",
          text: "Check the waiting patient's appointment time or ask reception to do so.",
        },
      ],
      answerOrder: ["safety", "staff", "reassure", "check"],
      explanation:
        "Immediate safety comes first, then escalation to staff. The other patient's concern should be acknowledged, but administrative checking comes after the urgent risk has been managed.",
    },
    {
      id: "sjt-importance-001",
      section: "sjt",
      subtype: "sjt-importance",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "During a placement, you notice a team member repeatedly entering patient rooms without using hand gel. You are unsure whether anyone else has noticed.",
      ],
      question: "How important is it to raise the concern with an appropriate member of staff?",
      options: [
        { key: "A", text: "Very important" },
        { key: "B", text: "Important" },
        { key: "C", text: "Of minor importance" },
        { key: "D", text: "Not important at all" },
      ],
      answer: "A",
      explanation:
        "Infection control affects patient safety, so raising the concern appropriately is very important.",
    },
    {
      id: "sjt-importance-002",
      section: "sjt",
      subtype: "sjt-importance",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "After a group presentation, your tutor gives feedback that your explanation was accurate but too fast for the audience. You have another presentation next week.",
      ],
      question: "How important is it to reflect on the feedback before the next presentation?",
      options: [
        { key: "A", text: "Very important" },
        { key: "B", text: "Important" },
        { key: "C", text: "Of minor importance" },
        { key: "D", text: "Not important at all" },
      ],
      answer: "A",
      explanation:
        "Reflecting on feedback before a similar task is central to improvement and professionalism.",
    },
    {
      id: "sjt-communication-001",
      section: "sjt",
      subtype: "sjt-communication",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "During a group project, one member repeatedly misses meetings and submits their work late. The deadline is close, and the rest of the group is frustrated.",
      ],
      question: "How appropriate is it to speak to the student privately first?",
      options: [
        { key: "A", text: "Very appropriate" },
        { key: "B", text: "Appropriate, but not ideal" },
        { key: "C", text: "Inappropriate, but not awful" },
        { key: "D", text: "Very inappropriate" },
      ],
      answer: "A",
      explanation:
        "A private, respectful conversation explores whether there are underlying issues and gives the student a chance to improve before escalation.",
    },
    {
      id: "sjt-communication-002",
      section: "sjt",
      subtype: "sjt-communication",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "A patient becomes angry at reception because their appointment has been delayed. You are observing nearby and the receptionist is trying to stay calm.",
      ],
      question: "How appropriate is it to listen calmly and offer to find a staff member who can update them?",
      options: [
        { key: "A", text: "Very appropriate" },
        { key: "B", text: "Appropriate, but not ideal" },
        { key: "C", text: "Inappropriate, but not awful" },
        { key: "D", text: "Very inappropriate" },
      ],
      answer: "A",
      explanation:
        "Listening calmly and seeking an appropriate update supports communication without pretending to have authority you do not have.",
    },
    {
      id: "sjt-communication-003",
      section: "sjt",
      subtype: "sjt-ordering",
      questionType: "drag-order",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "You are working with two other students on a health-promotion stall. One student starts giving confident but inaccurate advice about antibiotics to a visitor. The visitor seems reassured and begins to walk away.",
      ],
      question:
        "Drag the responses into the most appropriate order, from first to last.",
      instruction:
        "Correct misinformation respectfully while protecting the visitor and the team relationship.",
      dragItems: [
        {
          id: "pause",
          text: "Politely pause the conversation before the visitor leaves.",
        },
        {
          id: "clarify",
          text: "Clarify the accurate advice using the approved information leaflet.",
        },
        {
          id: "private",
          text: "Speak privately with the student afterwards about checking information before advising visitors.",
        },
        {
          id: "lead",
          text: "Let the stall lead know if inaccurate advice may already have been given to visitors.",
        },
      ],
      answerOrder: ["pause", "clarify", "private", "lead"],
      explanation:
        "The visitor should not leave with inaccurate advice. Correct it using approved information, then address the teammate respectfully and escalate if there may be wider patient-safety or public-information risk.",
    },
    {
      id: "sjt-integrity-001",
      section: "sjt",
      subtype: "sjt-integrity",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "You notice another applicant sharing details online about interview stations they completed earlier that day. The medical school had clearly told candidates not to discuss station content.",
      ],
      question: "How appropriate is it to ignore the post because it does not involve you directly?",
      options: [
        { key: "A", text: "Very appropriate" },
        { key: "B", text: "Appropriate, but not ideal" },
        { key: "C", text: "Inappropriate, but not awful" },
        { key: "D", text: "Very inappropriate" },
      ],
      answer: "D",
      explanation:
        "Ignoring known unfair behaviour undermines integrity. You should avoid using the information and consider reporting it through the appropriate channel.",
    },
    {
      id: "sjt-integrity-002",
      section: "sjt",
      subtype: "sjt-integrity",
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [
        "A friend asks you to take a quick photo of a ward whiteboard because they are curious about how hospitals organise patients. The board includes patient names and bed numbers.",
      ],
      question: "How appropriate is it to take the photo if you do not share it publicly?",
      options: [
        { key: "A", text: "Very appropriate" },
        { key: "B", text: "Appropriate, but not ideal" },
        { key: "C", text: "Inappropriate, but not awful" },
        { key: "D", text: "Very inappropriate" },
      ],
      answer: "D",
      explanation:
        "Taking a photo of identifiable patient information breaches confidentiality, even if you do not post it publicly.",
    },
  ],
};

export function isUCATSection(value: string): value is UCATSection {
  return UCAT_SECTIONS.some((section) => section.slug === value);
}

export function getUCATSectionMeta(section: UCATSection) {
  return UCAT_SECTIONS.find((item) => item.slug === section) ?? UCAT_SECTIONS[0];
}

export function getUCATSubtypeMeta(subtype: UCATSubtypeId) {
  return (
    Object.values(UCAT_SUBTYPES)
      .flat()
      .find((item) => item.id === subtype) ?? UCAT_SUBTYPES.vr[0]
  );
}

export function isUCATDragOrderQuestion(
  question: UCATQuestion
): question is UCATDragOrderQuestion {
  return question.questionType === "drag-order";
}
