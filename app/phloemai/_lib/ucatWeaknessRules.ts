import type { UCATSection, UCATSubtypeId } from "./ucatQuestionBank";

export type SubtypeWeaknessSeverity = "minor" | "major";

export type SubtypeWeaknessRule = {
  section: UCATSection;
  subtype: UCATSubtypeId;
  label: string;
  minorAtOrBelowPct?: number;
  minorBelowPct?: number;
  majorAtOrBelowPct?: number;
  repeatMajorAtOrBelowPct?: number;
  expectedMarkText: string;
  minorText: string;
  repeatMajorText: string;
};

export const SUBTYPE_WEAKNESS_RULES: SubtypeWeaknessRule[] = [
  {
    section: "dm",
    subtype: "dm-syllogisms",
    label: "Syllogisms",
    minorAtOrBelowPct: (8 / 12) * 100,
    repeatMajorAtOrBelowPct: (7 / 12) * 100,
    expectedMarkText: "6 questions / 12 marks",
    minorText: "8/12 marks or less is a weakness signal",
    repeatMajorText:
      "Repeated clearly-below-borderline syllogism sets should be promoted to a major report issue.",
  },
  {
    section: "dm",
    subtype: "dm-logic",
    label: "Logical puzzles",
    minorBelowPct: 50,
    repeatMajorAtOrBelowPct: 50,
    expectedMarkText: "about 5-6 questions",
    minorText: "less than about 50% is a weakness signal",
    repeatMajorText:
      "Repeated sub-50% logical puzzle sets should be promoted to a major report issue.",
  },
  {
    section: "dm",
    subtype: "dm-arguments",
    label: "Strongest argument",
    minorAtOrBelowPct: (4 / 6) * 100,
    repeatMajorAtOrBelowPct: (3 / 6) * 100,
    expectedMarkText: "6 questions / 6 marks",
    minorText: "4/6 is a minor weakness signal",
    repeatMajorText:
      "3/6 or less on strongest arguments twice or more should become a major report issue.",
  },
  {
    section: "dm",
    subtype: "dm-yes-no",
    label: "Yes / no questions",
    minorAtOrBelowPct: (8 / 12) * 100,
    repeatMajorAtOrBelowPct: (7 / 12) * 100,
    expectedMarkText: "6 questions / 12 marks",
    minorText: "8/12 marks or less is a weakness signal",
    repeatMajorText:
      "Repeated clearly-below-borderline Yes/No sets should be promoted to a major report issue.",
  },
  {
    section: "dm",
    subtype: "dm-probability-data",
    label: "Probability",
    minorAtOrBelowPct: (3 / 5) * 100,
    repeatMajorAtOrBelowPct: (2 / 5) * 100,
    expectedMarkText: "5 questions / 5 marks",
    minorText: "3/5 marks or less is a weakness signal",
    repeatMajorText:
      "Repeated probability weakness signals should be promoted to a major report issue.",
  },
  {
    section: "dm",
    subtype: "dm-venn-sets",
    label: "Venn diagrams",
    minorAtOrBelowPct: 63,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 50,
    expectedMarkText: "about 7-8 questions",
    minorText: "about 63% or less is a minor weakness signal",
    repeatMajorText:
      "50% or less twice or more should become a major report issue.",
  },
  {
    section: "qr",
    subtype: "qr-graphs",
    label: "Graphs and charts",
    minorAtOrBelowPct: 65,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "varies by QR mock",
    minorText: "65% or less is a QR subtype weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major QR issue.",
  },
  {
    section: "qr",
    subtype: "qr-percentages",
    label: "Percentages",
    minorAtOrBelowPct: 65,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "varies by QR mock",
    minorText: "65% or less is a QR subtype weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major QR issue.",
  },
  {
    section: "qr",
    subtype: "qr-rates-ratios",
    label: "Rates and ratios",
    minorAtOrBelowPct: 65,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "varies by QR mock",
    minorText: "65% or less is a QR subtype weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major QR issue.",
  },
  {
    section: "qr",
    subtype: "qr-averages",
    label: "Averages",
    minorAtOrBelowPct: 65,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "varies by QR mock",
    minorText: "65% or less is a QR subtype weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major QR issue.",
  },
  {
    section: "qr",
    subtype: "qr-units-geometry",
    label: "Units and geometry",
    minorAtOrBelowPct: 60,
    majorAtOrBelowPct: 45,
    repeatMajorAtOrBelowPct: 50,
    expectedMarkText: "varies by QR mock",
    minorText: "60% or less is a QR subtype weakness signal",
    repeatMajorText:
      "50% or less twice or more should become a major QR issue.",
  },
  {
    section: "qr",
    subtype: "qr-estimation",
    label: "Estimation",
    minorAtOrBelowPct: 70,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "varies by QR mock",
    minorText: "70% or less is a QR estimation weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major QR issue.",
  },
  {
    section: "qr",
    subtype: "qr-calculator-strategy",
    label: "Calculator strategy",
    minorAtOrBelowPct: 70,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "varies by QR mock",
    minorText: "70% or less is a QR calculator-strategy weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major QR issue.",
  },
  {
    section: "vr",
    subtype: "vr-tfc",
    label: "True / false / can't tell",
    minorAtOrBelowPct: (10 / 16) * 100,
    majorAtOrBelowPct: (8 / 16) * 100,
    repeatMajorAtOrBelowPct: (9 / 16) * 100,
    expectedMarkText: "16 questions / 16 marks",
    minorText: "10/16 or less is a minor weakness signal",
    repeatMajorText:
      "9/16 or less twice or more should become a major report issue.",
  },
  {
    section: "vr",
    subtype: "vr-detail",
    label: "Detail / keyword retrieval",
    minorAtOrBelowPct: 65,
    majorAtOrBelowPct: 50,
    repeatMajorAtOrBelowPct: 55,
    expectedMarkText: "about 10-15 questions",
    minorText: "65% or less is a minor weakness signal",
    repeatMajorText:
      "55% or less twice or more should become a major report issue.",
  },
  {
    section: "vr",
    subtype: "vr-summary",
    label: "Direct comprehension / main idea",
    minorAtOrBelowPct: 60,
    majorAtOrBelowPct: 45,
    repeatMajorAtOrBelowPct: 50,
    expectedMarkText: "about 8-10 questions",
    minorText: "60% or less is a minor weakness signal",
    repeatMajorText:
      "50% or less twice or more should become a major report issue.",
  },
  {
    section: "vr",
    subtype: "vr-author",
    label: "Author opinion / evaluation",
    minorAtOrBelowPct: 60,
    majorAtOrBelowPct: 45,
    repeatMajorAtOrBelowPct: 50,
    expectedMarkText: "about 8-10 questions",
    minorText: "60% or less is a minor weakness signal",
    repeatMajorText:
      "50% or less twice or more should become a major report issue.",
  },
  {
    section: "vr",
    subtype: "vr-inference",
    label: "Inference",
    minorAtOrBelowPct: 55,
    majorAtOrBelowPct: 40,
    repeatMajorAtOrBelowPct: 45,
    expectedMarkText: "about 6-8 questions",
    minorText: "55% or less is a minor weakness signal",
    repeatMajorText:
      "45% or less twice or more should become a major report issue.",
  },
  {
    section: "vr",
    subtype: "vr-negative",
    label: "Not supported / insufficient information",
    minorAtOrBelowPct: 55,
    majorAtOrBelowPct: 40,
    repeatMajorAtOrBelowPct: 45,
    expectedMarkText: "about 4-6 questions",
    minorText: "55% or less is a minor weakness signal",
    repeatMajorText:
      "45% or less twice or more should become a major report issue.",
  },
];

export function getSubtypeWeaknessRule(
  section: UCATSection,
  subtype: UCATSubtypeId
) {
  return SUBTYPE_WEAKNESS_RULES.find(
    (rule) => rule.section === section && rule.subtype === subtype
  );
}

export function getSubtypeWeaknessSeverity(
  rule: SubtypeWeaknessRule,
  pct: number
): SubtypeWeaknessSeverity | null {
  if (
    typeof rule.majorAtOrBelowPct === "number" &&
    pct <= rule.majorAtOrBelowPct
  ) {
    return "major";
  }

  if (
    typeof rule.minorAtOrBelowPct === "number" &&
    pct <= rule.minorAtOrBelowPct
  ) {
    return "minor";
  }

  if (typeof rule.minorBelowPct === "number" && pct < rule.minorBelowPct) {
    return "minor";
  }

  return null;
}

export function isRepeatMajorSubtypeWeakness(
  rule: SubtypeWeaknessRule,
  pct: number
) {
  return (
    typeof rule.repeatMajorAtOrBelowPct === "number" &&
    pct <= rule.repeatMajorAtOrBelowPct
  );
}
