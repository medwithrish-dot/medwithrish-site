export type UCATSection = "vr" | "dm" | "qr" | "sjt";
export type UCATOptionKey = "A" | "B" | "C" | "D";

export type UCATQuestion = {
  id: string;
  section: UCATSection;
  title: string;
  leftTitle?: string;
  stimulus: string[];
  question: string;
  options: Array<{ key: UCATOptionKey; text: string }>;
  answer: UCATOptionKey;
  explanation: string;
};

export const UCAT_SECTIONS: Array<{
  slug: UCATSection;
  code: string;
  title: string;
  bankTitle: string;
  description: string;
}> = [
  {
    slug: "vr",
    code: "VR",
    title: "Verbal Reasoning",
    bankTitle: "Verbal Reasoning Question Bank 1",
    description: "Read a passage and choose the option best supported by it.",
  },
  {
    slug: "dm",
    code: "DM",
    title: "Decision Making",
    bankTitle: "Decision Making Question Bank 1",
    description: "Use logic, probability and arguments to choose the best answer.",
  },
  {
    slug: "qr",
    code: "QR",
    title: "Quantitative Reasoning",
    bankTitle: "Quantitative Reasoning Question Bank 1",
    description: "Work through short numerical scenarios and interpret data.",
  },
  {
    slug: "sjt",
    code: "SJT",
    title: "Situational Judgement",
    bankTitle: "Situational Judgement Question Bank 1",
    description: "Judge professionalism, communication and patient-centred action.",
  },
];

export const UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> = {
  vr: [
    {
      id: "vr-001",
      section: "vr",
      title: "Verbal Reasoning Question Bank 1",
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
      id: "vr-002",
      section: "vr",
      title: "Verbal Reasoning Question Bank 1",
      leftTitle: "Passage",
      stimulus: [
        "Octopuses are often described as solitary animals, but this label can be misleading. In the wild, many species spend long periods alone, yet they also interact with rivals, potential mates and predators in complex ways. Some can change colour rapidly, not only to hide but also to signal aggression or uncertainty.",
        "Researchers are cautious about calling these signals a language. Unlike human speech, the displays do not appear to have fixed meanings in every context. A dark colour pattern, for example, may precede an attack in one situation but simply reflect stress in another. The same behaviour can therefore be informative without being symbolic.",
      ],
      question: "Which statement is best supported by the passage?",
      options: [
        { key: "A", text: "Octopus colour displays always have fixed meanings." },
        { key: "B", text: "Octopuses are incapable of interacting with other animals." },
        { key: "C", text: "Researchers avoid overstating what octopus signals mean." },
        { key: "D", text: "Octopus displays are identical to human language." },
      ],
      answer: "C",
      explanation:
        "The passage says researchers are cautious about calling the signals a language and notes that the same display can mean different things in different contexts.",
    },
    {
      id: "vr-003",
      section: "vr",
      title: "Verbal Reasoning Question Bank 1",
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
  ],
  dm: [
    {
      id: "dm-001",
      section: "dm",
      title: "Decision Making Question Bank 1",
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
      id: "dm-002",
      section: "dm",
      title: "Decision Making Question Bank 1",
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
      id: "dm-003",
      section: "dm",
      title: "Decision Making Question Bank 1",
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
  ],
  qr: [
    {
      id: "qr-001",
      section: "qr",
      title: "Quantitative Reasoning Question Bank 1",
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
      id: "qr-002",
      section: "qr",
      title: "Quantitative Reasoning Question Bank 1",
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
      id: "qr-003",
      section: "qr",
      title: "Quantitative Reasoning Question Bank 1",
      leftTitle: "Table",
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
  ],
  sjt: [
    {
      id: "sjt-001",
      section: "sjt",
      title: "Situational Judgement Question Bank 1",
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
      id: "sjt-002",
      section: "sjt",
      title: "Situational Judgement Question Bank 1",
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
      id: "sjt-003",
      section: "sjt",
      title: "Situational Judgement Question Bank 1",
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
  ],
};

export function isUCATSection(value: string): value is UCATSection {
  return UCAT_SECTIONS.some((section) => section.slug === value);
}

export function getUCATSectionMeta(section: UCATSection) {
  return UCAT_SECTIONS.find((item) => item.slug === section) ?? UCAT_SECTIONS[0];
}
