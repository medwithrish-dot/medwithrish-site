export const INTERVIEW_QUESTION_CATEGORIES = [
  "Personal & Motivation",
  "Communication & Teamwork",
  "Ethics & Professionalism",
  "NHS & Healthcare",
  "Hot Topics & Current Affairs",
  "Data, Research & Critical Thinking",
  "Practical MMI & Role Play",
  "Curveballs & Quick-Fire"
] as const;

export type InterviewQuestionCategoryTitle =
  (typeof INTERVIEW_QUESTION_CATEGORIES)[number];

export const INTERVIEW_QUESTION_SUBCATEGORIES = [
  "Motivation for Medicine",
  "Medical School & Course",
  "Work Experience & Reflection",
  "Personal Insight",
  "Strengths, Weaknesses & Resilience",
  "Communication & Empathy",
  "Teamwork",
  "Leadership",
  "Conflict & Difficult Conversations",
  "Giving & Receiving Feedback",
  "Working in Healthcare Teams",
  "Core Medical Ethics",
  "Consent, Capacity & Confidentiality",
  "Safeguarding & Duty of Candour",
  "Professionalism & Professional Boundaries",
  "End-of-Life Care & Assisted Dying",
  "Organ Donation & Resource Allocation",
  "Ethical & Professional Scenarios",
  "Situational Judgement",
  "NHS Structure & Challenges",
  "Role of a Doctor",
  "Health Inequalities",
  "Public Health",
  "Healthcare Policy & Funding",
  "Healthcare Resources & Priorities",
  "Current NHS Issues",
  "Technology, AI & Digital Health",
  "New Treatments & Innovation",
  "Public Health Debates",
  "Workforce Issues",
  "Ethics in the News",
  "Data Interpretation",
  "Graphs & Trends",
  "Research & Evidence",
  "Critical Appraisal",
  "Article Analysis",
  "Critical Thinking",
  "Role Play",
  "Communication Tasks",
  "Group Discussion",
  "Group Tasks",
  "Prioritisation Stations",
  "Data Stations",
  "Personal Quick-Fire",
  "Creative Questions",
  "Hypotheticals",
  "Opinion Questions",
  "Unexpected Questions"
] as const;

export type InterviewQuestionSubcategory =
  (typeof INTERVIEW_QUESTION_SUBCATEGORIES)[number];

export type InterviewQuestionStatus = "completed" | "review" | "not-attempted";
export type InterviewQuestionDifficulty = "core" | "applied" | "advanced";

export type InterviewQuestion = {
  id: string;
  text: string;
  category: InterviewQuestionCategoryTitle;
  subcategory: InterviewQuestionSubcategory;
  sourceSection: number;
  sourceSectionTitle: string;
  sourceQuestionNumber: number;
  sourceTopic?: string;
  difficulty: InterviewQuestionDifficulty;
  status: InterviewQuestionStatus;
  tags: readonly string[];
};

export const INTERVIEW_QUESTIONS = [
  {
    id: "iq-01-001-motivation-for-medicine",
    text: "What has influenced your decision to pursue a career in medicine?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-002-motivation-for-medicine",
    text: "Why are you choosing medicine rather than nursing, pharmacy, dentistry or another healthcare profession?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-003-work-experience-and-reflection",
    text: "In what ways have you explored whether medicine is genuinely the right career for you?",
    category: "Personal & Motivation",
    subcategory: "Work Experience & Reflection",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "work-experience-and-reflection",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-004-work-experience-and-reflection",
    text: "Which experiences have helped prepare you for studying medicine?",
    category: "Personal & Motivation",
    subcategory: "Work Experience & Reflection",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "work-experience-and-reflection",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-005-work-experience-and-reflection",
    text: "What lessons did you take from your work experience or clinical exposure?",
    category: "Personal & Motivation",
    subcategory: "Work Experience & Reflection",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "work-experience-and-reflection",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-006-work-experience-and-reflection",
    text: "If you have taken a gap year, how have you used that time and what has it taught you?",
    category: "Personal & Motivation",
    subcategory: "Work Experience & Reflection",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "work-experience-and-reflection",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-007-motivation-for-medicine",
    text: "If you did not receive a medical school offer this year, what would your next step be?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-008-motivation-for-medicine",
    text: "Where do you hope to be professionally in around ten years?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-009-motivation-for-medicine",
    text: "Are there any areas of medicine that particularly interest you at the moment? Why?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-010-role-of-a-doctor",
    text: "What would you most like to achieve during your career as a doctor?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-011-role-of-a-doctor",
    text: "What do you see as the biggest advantages and disadvantages of being a doctor?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-012-role-of-a-doctor",
    text: "What aspects of becoming a doctor are you most excited about?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-013-motivation-for-medicine",
    text: "What aspects of a medical career concern you or appeal to you least?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-014-role-of-a-doctor",
    text: "What might lead someone to leave medical practice after qualifying, and what does this tell you about the demands of the career?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-015-role-of-a-doctor",
    text: "Compare a doctor's working life now with medical practice a century ago. Which changes have most affected the role?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-016-role-of-a-doctor",
    text: "Beyond diagnosing and treating illness, what other responsibilities do doctors have?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-017-role-of-a-doctor",
    text: "How would you explain what holistic or whole-person care means to you?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-018-technology-ai-and-digital-health",
    text: "In what ways is technology changing the role of doctors?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-019-working-in-healthcare-teams",
    text: "Which people might be included in the multidisciplinary team caring for a patient?",
    category: "Communication & Teamwork",
    subcategory: "Working in Healthcare Teams",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "working-in-healthcare-teams",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-020-role-of-a-doctor",
    text: "Why do you think teaching is an important part of medicine?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-021-role-of-a-doctor",
    text: "Which people do doctors have a responsibility to teach?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 21,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-022-role-of-a-doctor",
    text: "Would you personally like teaching to form part of your future medical career? Why?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 22,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-023-strengths-weaknesses-and-resilience",
    text: "What do you imagine day-to-day life as a medical student is actually like?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 23,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-024-working-in-healthcare-teams",
    text: "In what ways have the responsibilities of nurses and other healthcare professionals changed over time?",
    category: "Communication & Teamwork",
    subcategory: "Working in Healthcare Teams",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 24,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "working-in-healthcare-teams",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-025-role-of-a-doctor",
    text: "How do hospital services and community care each contribute to meeting patients' needs? Discuss where healthcare takes place.",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 25,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-026-strengths-weaknesses-and-resilience",
    text: "Which challenges do you expect to face during a medical career?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 26,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-027-strengths-weaknesses-and-resilience",
    text: "How might you manage the pressures associated with studying and practising medicine?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 27,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "motivation-for-medicine"
    ]
  },
  {
    id: "iq-01-028-motivation-for-medicine",
    text: "Describe a medical or healthcare issue you have recently read about.",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 28,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-029-motivation-for-medicine",
    text: "What could make a healthcare setting stressful for patients or staff, and how might that stress develop into anger or aggression?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 29,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-01-030-motivation-for-medicine",
    text: "What do you feel makes medicine different from many other careers?",
    category: "Personal & Motivation",
    subcategory: "Motivation for Medicine",
    sourceSection: 1,
    sourceSectionTitle: "MOTIVATION FOR MEDICINE",
    sourceQuestionNumber: 30,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "motivation-for-medicine",
      "core"
    ]
  },
  {
    id: "iq-02-001-role-of-a-doctor",
    text: "Which qualities distinguish an excellent doctor from an average one?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-002-communication-and-empathy",
    text: "A clinician has excellent medical knowledge but struggles to explain decisions. How would you weigh communication against clinical expertise when judging their care?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-003-role-of-a-doctor",
    text: "How would you explain what patient-centred care means?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-004-communication-and-empathy",
    text: "Why do you think empathy is important in medicine?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-005-role-of-a-doctor",
    text: "Can empathy ever make a doctor's work more difficult? Discuss how to remain compassionate while making sound clinical decisions.",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-006-professionalism-and-professional-bou",
    text: "How would you explain what professionalism means in healthcare?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-007-role-of-a-doctor",
    text: "Think about the responsibilities attached to a doctor's role beyond a single consultation. Who else is affected by their decisions?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-008-communication-and-empathy",
    text: "How could doctors balance compassion with professional boundaries?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-009-role-of-a-doctor",
    text: "How would you explain what continuity of care means, and why does it matter?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-010-working-in-healthcare-teams",
    text: "How could doctors work effectively with nurses, pharmacists, physiotherapists and other healthcare professionals?",
    category: "Communication & Teamwork",
    subcategory: "Working in Healthcare Teams",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "working-in-healthcare-teams",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-011-role-of-a-doctor",
    text: "Why does a doctor need to keep learning throughout their career?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-012-role-of-a-doctor",
    text: "How could doctors respond when medical evidence or guidance changes?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 12,
    difficulty: "advanced",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "advanced",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-013-public-health",
    text: "Which role should doctors play in disease prevention?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-014-public-health",
    text: "Should expectations about healthy behaviour apply to doctors outside work? Explain how you would balance their example to patients with their private lives.",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-015-public-health",
    text: "Which responsibilities do doctors have towards public health?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-016-role-of-a-doctor",
    text: "How would you explain what advocacy means in the context of being a doctor?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-017-role-of-a-doctor",
    text: "How could a doctor respond when they do not know the answer to something?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-018-professionalism-and-professional-bou",
    text: "Why do you think recognising your own limitations is important in medicine?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-019-leadership",
    text: "What would you include when explaining clinical leadership?",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-02-020-role-of-a-doctor",
    text: "How could doctors contribute to improving healthcare systems as well as treating individual patients?",
    category: "NHS & Healthcare",
    subcategory: "Role of a Doctor",
    sourceSection: 2,
    sourceSectionTitle: "UNDERSTANDING THE ROLE OF A DOCTOR",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "role-of-a-doctor",
      "core",
      "understanding-the-role-of-a-doctor"
    ]
  },
  {
    id: "iq-03-001-medical-school-and-course",
    text: "Why are you especially interested in studying at this particular medical school?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-002-medical-school-and-course",
    text: "Many universities offer similar teaching methods. What in particular attracts you to this course?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-003-medical-school-and-course",
    text: "Which aspects of this medical school appeal to you most?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-004-medical-school-and-course",
    text: "Which aspects of this course would suit you least, and why?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-005-medical-school-and-course",
    text: "What do you understand so far by problem-based learning or PBL?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-006-medical-school-and-course",
    text: "In what ways does problem-based learning differ from more traditional teaching?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-007-medical-school-and-course",
    text: "What do you see as the main advantages of problem-based learning?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-008-medical-school-and-course",
    text: "Which potential disadvantages does PBL have?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-009-medical-school-and-course",
    text: "What do you see as the strengths of lecture-based teaching?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-010-medical-school-and-course",
    text: "What do you see as the limitations of relying heavily on lectures?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-011-medical-school-and-course",
    text: "How would you define an integrated medical curriculum?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-012-medical-school-and-course",
    text: "Which advantages can an integrated course offer?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-013-strengths-weaknesses-and-resilience",
    text: "Which difficulties might students encounter on an integrated course?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-014-medical-school-and-course",
    text: "What do you already know about the structure of this medical degree?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-015-medical-school-and-course",
    text: "Why do you think this course suits the way you learn?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-016-medical-school-and-course",
    text: "How might you adapt if the teaching style were different from what you were used to?",
    category: "Personal & Motivation",
    subcategory: "Medical School & Course",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "medical-school-and-course",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-017-strengths-weaknesses-and-resilience",
    text: "Medicine involves a large amount of independent study. How might you manage that?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-018-strengths-weaknesses-and-resilience",
    text: "How might you balance academic work, clinical placements and life outside medicine?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-019-strengths-weaknesses-and-resilience",
    text: "How might you approach a topic you found particularly difficult?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-03-020-strengths-weaknesses-and-resilience",
    text: "After starting medical school, you find that your marks are well below your previous standard. How would you work out what is going wrong and decide what to do?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 3,
    sourceSectionTitle: "MEDICAL SCHOOL & LEARNING",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "medical-school-and-learning"
    ]
  },
  {
    id: "iq-04-001-communication-and-empathy",
    text: "How might you describe your communication skills?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-002-communication-and-empathy",
    text: "In what ways have you developed your ability to communicate with others?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-003-communication-and-empathy",
    text: "Would you personally describe yourself as empathetic? Why?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-004-communication-and-empathy",
    text: "Describe a situation where good communication changed the outcome.",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-005-communication-and-empathy",
    text: "How might you communicate with a patient who was frightened?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-006-conflict-and-difficult-conversations",
    text: "How might you approach a patient who was angry or frustrated?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "communication-and-empathy"
    ]
  },
  {
    id: "iq-04-007-communication-and-empathy",
    text: "How might you communicate with someone who did not understand medical terminology?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-008-communication-and-empathy",
    text: "How could you explain a complicated medical idea without sounding patronising?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-009-communication-and-empathy",
    text: "What tends to make someone a good listener?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-010-communication-and-empathy",
    text: "When might listening carefully achieve more than giving advice or explanations?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-011-conflict-and-difficult-conversations",
    text: "How might you respond to a patient who began crying during a consultation?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "communication-and-empathy"
    ]
  },
  {
    id: "iq-04-012-communication-and-empathy",
    text: "How might you communicate with someone whose first language was not English?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-013-communication-and-empathy",
    text: "How might you adapt your communication for a child?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-014-communication-and-empathy",
    text: "How would you adapt a consultation to an older patient's individual communication needs?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-015-communication-and-empathy",
    text: "A patient comes away from a conversation with a different understanding from the one you intended. How would you find out what they understood and put the misunderstanding right?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-016-conflict-and-difficult-conversations",
    text: "How might you respond if a patient strongly disagreed with you?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "communication-and-empathy"
    ]
  },
  {
    id: "iq-04-017-communication-and-empathy",
    text: "How could body language influence a clinical consultation?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-018-communication-and-empathy",
    text: "Which factors might prevent effective communication between a doctor and patient?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-019-communication-and-empathy",
    text: "How could doctors build trust with patients?",
    category: "Communication & Teamwork",
    subcategory: "Communication & Empathy",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "communication-and-empathy",
      "core"
    ]
  },
  {
    id: "iq-04-020-conflict-and-difficult-conversations",
    text: "What can damage trust between a doctor and a patient, and how might their relationship deteriorate?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 4,
    sourceSectionTitle: "COMMUNICATION & EMPATHY",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "communication-and-empathy"
    ]
  },
  {
    id: "iq-05-001-teamwork",
    text: "What tends to make you an effective team member?",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-002-teamwork",
    text: "Describe a time when you contributed successfully to a team.",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-003-leadership",
    text: "Which qualities make someone a strong team leader?",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-004-leadership",
    text: "Describe an occasion when you demonstrated leadership.",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-005-leadership",
    text: "Do you see yourself naturally as more of a leader or a team member?",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-006-teamwork",
    text: "What tends to make a team function effectively?",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-007-teamwork",
    text: "What do you see as the advantages of working in a team?",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-008-teamwork",
    text: "Which difficulties can arise when working as part of a team?",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-009-conflict-and-difficult-conversations",
    text: "How might you manage disagreement within a team?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-010-conflict-and-difficult-conversations",
    text: "What would you do next if one team member was contributing much less than everyone else?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-011-teamwork",
    text: "What would you do next if two members of your team strongly disagreed with one another?",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-012-conflict-and-difficult-conversations",
    text: "How might you respond if the team rejected your idea?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-013-conflict-and-difficult-conversations",
    text: "How might you manage a team member who dominated every discussion?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-014-conflict-and-difficult-conversations",
    text: "How might you encourage a quieter member of a group to contribute?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-015-leadership",
    text: "Someone speaks frequently in a group but rarely helps others contribute. What else would you look for before calling them a good leader?",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-016-leadership",
    text: "To what extent can leadership involve stepping back rather than taking control?",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-017-leadership",
    text: "How might you lead a team under significant time pressure?",
    category: "Communication & Teamwork",
    subcategory: "Leadership",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "leadership",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-018-conflict-and-difficult-conversations",
    text: "Describe a time when your team did not perform as well as you hoped.",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-019-teamwork",
    text: "What lessons did you take from working with someone whose personality was very different from yours?",
    category: "Communication & Teamwork",
    subcategory: "Teamwork",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "teamwork",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-05-020-working-in-healthcare-teams",
    text: "Why does effective teamwork matter in healthcare?",
    category: "Communication & Teamwork",
    subcategory: "Working in Healthcare Teams",
    sourceSection: 5,
    sourceSectionTitle: "TEAMWORK & LEADERSHIP",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "working-in-healthcare-teams",
      "core",
      "teamwork-and-leadership"
    ]
  },
  {
    id: "iq-06-001-personal-insight",
    text: "How would you organise your time when you have several competing priorities?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-002-personal-insight",
    text: "How might you describe your organisational skills?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-003-personal-insight",
    text: "Which activities or hobbies do you enjoy outside your studies?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-004-personal-insight",
    text: "Describe a meaningful non-academic project you have taken part in.",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-005-strengths-weaknesses-and-resilience",
    text: "How would you normally respond to stress?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-006-personal-insight",
    text: "Which lessons have your hobbies or interests taught you that could be useful in medicine?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-007-personal-insight",
    text: "What do you consider your main strengths?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-008-personal-insight",
    text: "What personal qualities would help you become a good doctor?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-009-personal-insight",
    text: "What do you feel you would bring to our medical school?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-010-personal-insight",
    text: "What three words would you use to describe yourself?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-011-personal-insight",
    text: "How do you think your friends would describe you?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-012-personal-insight",
    text: "Which values would you want people to associate with you?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-013-personal-insight",
    text: "What parts of your personality are well suited to medicine?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-014-personal-insight",
    text: "Which skills have you gained through employment or volunteering that would transfer to medicine?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-015-personal-insight",
    text: "Do you tend to work better independently or as part of a group?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-016-strengths-weaknesses-and-resilience",
    text: "What is one area of yourself that you are currently trying to improve?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-017-strengths-weaknesses-and-resilience",
    text: "If you could improve two personal qualities, what would they be and why?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-018-personal-insight",
    text: "Who has had the greatest influence on the person you are today?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-019-personal-insight",
    text: "Which qualities make someone an effective teacher?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-020-personal-insight",
    text: "Describe a teacher or mentor who had an impact on you.",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-021-personal-insight",
    text: "Describe an important decision you have had to make.",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 21,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-022-personal-insight",
    text: "Which achievement are you most proud of?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 22,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-023-giving-and-receiving-feedback",
    text: "How would you respond when somebody criticises your work?",
    category: "Communication & Teamwork",
    subcategory: "Giving & Receiving Feedback",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 23,
    difficulty: "core",
    status: "review",
    tags: [
      "communication-and-teamwork",
      "giving-and-receiving-feedback",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-024-conflict-and-difficult-conversations",
    text: "How would you deal with conflict?",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 24,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-025-conflict-and-difficult-conversations",
    text: "Briefly describe a situation in which you changed your opinion after hearing another perspective.",
    category: "Communication & Teamwork",
    subcategory: "Conflict & Difficult Conversations",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 25,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "conflict-and-difficult-conversations",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-026-personal-insight",
    text: "Describe a mistake you made and what you learned from it.",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 26,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-027-personal-insight",
    text: "Describe a book, film, podcast or article that made you think differently.",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 27,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-028-strengths-weaknesses-and-resilience",
    text: "What evidence from your experience suggests you can sustain your effort and wellbeing through a long medical training programme?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 28,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-029-personal-insight",
    text: "Which situations tend to frustrate or anger you?",
    category: "Personal & Motivation",
    subcategory: "Personal Insight",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 29,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "personal-insight",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-030-strengths-weaknesses-and-resilience",
    text: "How would you recognise when you are becoming overwhelmed?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 30,
    difficulty: "core",
    status: "review",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-031-strengths-weaknesses-and-resilience",
    text: "What would you do next if you were struggling academically or emotionally at medical school?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 31,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-032-strengths-weaknesses-and-resilience",
    text: "How might you support a friend who appeared to be struggling?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 32,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-033-strengths-weaknesses-and-resilience",
    text: "How would you explain what resilience means to you?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 33,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-034-strengths-weaknesses-and-resilience",
    text: "How does asking for support fit with your understanding of resilience? Discuss whether coping independently is always the best response to pressure.",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 34,
    difficulty: "core",
    status: "completed",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-06-035-strengths-weaknesses-and-resilience",
    text: "How would you maintain a healthy balance between achievement and wellbeing?",
    category: "Personal & Motivation",
    subcategory: "Strengths, Weaknesses & Resilience",
    sourceSection: 6,
    sourceSectionTitle: "ORGANISATION, RESILIENCE & PERSONAL INSIGHT",
    sourceQuestionNumber: 35,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "personal-and-motivation",
      "strengths-weaknesses-and-resilience",
      "core",
      "organisation-resilience-and-personal-insight"
    ]
  },
  {
    id: "iq-07-001-nhs-structure-and-challenges",
    text: "What do you understand so far about how the NHS is structured?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-002-nhs-structure-and-challenges",
    text: "In what ways does primary care differ from secondary and tertiary care?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-003-nhs-structure-and-challenges",
    text: "Which role does a GP play within the NHS?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-004-nhs-structure-and-challenges",
    text: "How would you define the role of NHS England?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-005-nhs-structure-and-challenges",
    text: "How would you define an Integrated Care System?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-006-nhs-structure-and-challenges",
    text: "Which challenges currently face the NHS?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-007-healthcare-policy-and-funding",
    text: "How could the NHS decide which services to prioritise?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-008-healthcare-policy-and-funding",
    text: "How could healthcare be funded?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-009-healthcare-policy-and-funding",
    text: "To what extent should private healthcare operate alongside a publicly funded NHS?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-010-healthcare-policy-and-funding",
    text: "What do you see as the potential advantages of having both public and private healthcare?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-011-healthcare-policy-and-funding",
    text: "Which problems could arise from a mixed public-private healthcare system?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-012-health-inequalities",
    text: "How would you explain what the term health inequality means to you?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-013-health-inequalities",
    text: "Why do you think life expectancy and health outcomes can differ between different areas and communities?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-014-nhs-structure-and-challenges",
    text: "Which factors other than healthcare influence a person's health?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-015-health-inequalities",
    text: "What do you see as the social determinants of health?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-016-nhs-structure-and-challenges",
    text: "What practical steps could doctors take to reduce health inequalities?",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-017-healthcare-resources-and-priorities",
    text: "How could the NHS respond when demand for care is greater than the resources available?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Resources & Priorities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 17,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-resources-and-priorities",
      "advanced",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-018-healthcare-resources-and-priorities",
    text: "Which factors should be considered when deciding whether the NHS should fund a treatment?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Resources & Priorities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-resources-and-priorities",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-019-nhs-structure-and-challenges",
    text: "How should the NHS approach funding a procedure that some people describe as non-essential? Explain what you would want to understand before reaching a view.",
    category: "NHS & Healthcare",
    subcategory: "NHS Structure & Challenges",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "nhs-structure-and-challenges",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-020-healthcare-resources-and-priorities",
    text: "How could waiting lists be prioritised?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Resources & Priorities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-resources-and-priorities",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-021-healthcare-resources-and-priorities",
    text: "Imagine an NHS funding decision where one option would reach more patients than another. Is the number of people treated enough to decide which option is fairest?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Resources & Priorities",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 21,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-resources-and-priorities",
      "advanced",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-022-healthcare-policy-and-funding",
    text: "To what extent should patients ever be expected to contribute financially towards their healthcare?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 22,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-023-healthcare-policy-and-funding",
    text: "What do you see as the arguments for and against charging for some NHS services?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 23,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-024-professionalism-and-professional-bou",
    text: "How would you explain what clinical governance means?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 24,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-025-professionalism-and-professional-bou",
    text: "Why do you think clinical audit is important?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 25,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-026-professionalism-and-professional-bou",
    text: "How would you define revalidation and why does it matter?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 26,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-027-consent-capacity-and-confidentiality",
    text: "How would you define informed consent?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 27,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-028-consent-capacity-and-confidentiality",
    text: "How would you explain what patient capacity means?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 28,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-029-consent-capacity-and-confidentiality",
    text: "Why do you think confidentiality is central to healthcare?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 29,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-07-030-consent-capacity-and-confidentiality",
    text: "In what situations might confidentiality need to be breached?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 7,
    sourceSectionTitle: "NHS & HEALTHCARE SYSTEM",
    sourceQuestionNumber: 30,
    difficulty: "core",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "nhs-and-healthcare-system"
    ]
  },
  {
    id: "iq-08-001-core-medical-ethics",
    text: "What do you see as the four main principles of medical ethics?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-002-consent-capacity-and-confidentiality",
    text: "How would you explain what autonomy means in healthcare?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-003-core-medical-ethics",
    text: "How would you explain what beneficence means?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-004-core-medical-ethics",
    text: "How would you define non-maleficence?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-005-organ-donation-and-resource-allocati",
    text: "How would you explain what justice means in medical decision-making?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-006-core-medical-ethics",
    text: "Describe how two of the four ethical principles could pull a clinical decision in different directions. How would you examine that tension?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 6,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "advanced",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-007-core-medical-ethics",
    text: "You have considered the available options in an ethical dilemma, but each has a significant drawback. How would you decide what to do and justify your choice?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 7,
    difficulty: "advanced",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "advanced",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-008-consent-capacity-and-confidentiality",
    text: "An adult with capacity refuses life-saving treatment. How should a doctor respond to that decision?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-009-consent-capacity-and-confidentiality",
    text: "In what situations can a doctor act against a patient's wishes?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-010-consent-capacity-and-confidentiality",
    text: "How could doctors approach decisions involving patients who lack capacity?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-011-consent-capacity-and-confidentiality",
    text: "A patient's relatives want to decide which care the patient receives. What would you need to establish before deciding whether they should make that decision?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-012-consent-capacity-and-confidentiality",
    text: "How could doctors balance individual autonomy against public safety?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-013-core-medical-ethics",
    text: "To what extent is it ever ethically acceptable for a doctor to withhold information from a patient?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 13,
    difficulty: "advanced",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "advanced",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-014-core-medical-ethics",
    text: "To what extent is lying to a patient ever justified?",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-015-consent-capacity-and-confidentiality",
    text: "In what situations might confidentiality need to be overridden?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-016-organ-donation-and-resource-allocati",
    text: "A patient's lifestyle may have contributed to their illness. Discuss whether this should change the doctor's duty of care towards them.",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-017-organ-donation-and-resource-allocati",
    text: "To what extent should lifestyle choices affect access to NHS treatment?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-018-organ-donation-and-resource-allocati",
    text: "When deciding who receives treatment, should smoking history count against a patient? Explain how you would compare access for smokers and non-smokers.",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-019-organ-donation-and-resource-allocati",
    text: "Discuss how transplant services should consider patients with alcohol dependence. How would you assess whether their access is fair compared with other patients?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-020-organ-donation-and-resource-allocati",
    text: "How would you explain what fairness means when healthcare resources are limited?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 20,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "advanced",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-021-organ-donation-and-resource-allocati",
    text: "To what extent is equality always the same as fairness?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 21,
    difficulty: "core",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-022-organ-donation-and-resource-allocati",
    text: "To what extent should younger patients ever be prioritised over older patients?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 22,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-023-organ-donation-and-resource-allocati",
    text: "To what extent should quality of life influence healthcare allocation decisions?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 23,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "advanced",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-024-organ-donation-and-resource-allocati",
    text: "An expensive treatment is being considered for NHS funding. Whose judgement should determine whether it offers good value, and why?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 24,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "core",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-08-025-core-medical-ethics",
    text: "A healthcare budget could fund costly care for one person or help a larger number of people. Explain how you would weigh the ethical arguments for each use of the money.",
    category: "Ethics & Professionalism",
    subcategory: "Core Medical Ethics",
    sourceSection: 8,
    sourceSectionTitle: "ETHICS: CORE PRINCIPLES",
    sourceQuestionNumber: 25,
    difficulty: "advanced",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "core-medical-ethics",
      "advanced",
      "ethics-core-principles"
    ]
  },
  {
    id: "iq-09-001-ethical-and-professional-scenarios",
    text: "An adult who has capacity declines a blood transfusion on religious grounds. They understand that they could die without it. Talk through how you would respond to their decision.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-002-consent-capacity-and-confidentiality",
    text: "An unconscious patient urgently needs a transfusion. Their records suggest they may reject blood products on religious grounds. What would you clarify before acting?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-003-ethical-and-professional-scenarios",
    text: "Parents oppose a potentially life-saving blood transfusion for their child because of their beliefs. Explain the team's priorities in addressing this disagreement.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-004-organ-donation-and-resource-allocati",
    text: "Two people awaiting transplantation have comparable clinical need, and a donor organ is available for only one of them. What would a fair allocation process need to consider?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-005-ethical-and-professional-scenarios",
    text: "A patient wants surgery despite a very low chance of success because of their current health. How would you discuss the disagreement with them?",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-006-organ-donation-and-resource-allocati",
    text: "A new treatment could greatly improve one patient's life but use funds that could treat many others. How would you weigh this funding decision?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-007-ethical-and-professional-scenarios",
    text: "A young teenager comes to the service seeking advice about ending a pregnancy. Talk through the communication, ethical and legal questions that would guide your response.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-008-ethical-and-professional-scenarios",
    text: "The spouse of a patient with serious heart disease asks you to convince their partner to take medication. The patient understands that refusing it could shorten their life and still declines. How would you respond to both people?",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-009-ethical-and-professional-scenarios",
    text: "A patient shows you an alternative treatment they found online. How would you explore their interest and discuss whether to try it?",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-010-consent-capacity-and-confidentiality",
    text: "A patient would like an HIV test. Talk through the issues you would address when discussing the test, arranging it and following up the result.",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-011-consent-capacity-and-confidentiality",
    text: "Someone you are caring for has HIV and tells you they will not disclose this to their sexual partner. What would guide your next steps and your discussion with the patient?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 11,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-012-ethical-and-professional-scenarios",
    text: "Which ethical issues surround the use of animals in medical research?",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 12,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-013-ethical-and-professional-scenarios",
    text: "A family hopes that having another child could help provide treatment for a child they already have. Discuss the ethical considerations for the family and for each child.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 13,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-014-professionalism-and-professional-bou",
    text: "A senior doctor is about to see patients, but you suspect they have been drinking alcohol. Talk through how you would handle your concern.",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 14,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-015-professionalism-and-professional-bou",
    text: "A colleague wants you to write them a prescription outside the usual consultation process. How would you handle the request and explain your response?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 15,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-016-ethical-and-professional-scenarios",
    text: "You discover a colleague using a workplace computer to access material that is illegal or seriously inappropriate. Talk through how you would decide what action to take.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 16,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-017-ethical-and-professional-scenarios",
    text: "Under which circumstances, if any, might withholding the full truth be ethically defensible?",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 17,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-018-safeguarding-and-duty-of-candour",
    text: "A colleague tells you about a mistake they have made and asks you to keep it to yourself. What would you say to them, and what would you do next?",
    category: "Ethics & Professionalism",
    subcategory: "Safeguarding & Duty of Candour",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 18,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "safeguarding-and-duty-of-candour",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-019-safeguarding-and-duty-of-candour",
    text: "You recognise that something you did in a patient's care was a mistake. Explain your immediate priorities and how you would follow the matter through.",
    category: "Ethics & Professionalism",
    subcategory: "Safeguarding & Duty of Candour",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 19,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "safeguarding-and-duty-of-candour",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-020-safeguarding-and-duty-of-candour",
    text: "To what extent should doctors always admit mistakes to patients?",
    category: "Ethics & Professionalism",
    subcategory: "Safeguarding & Duty of Candour",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 20,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "safeguarding-and-duty-of-candour",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-021-safeguarding-and-duty-of-candour",
    text: "How would you define the duty of candour?",
    category: "Ethics & Professionalism",
    subcategory: "Safeguarding & Duty of Candour",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 21,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "safeguarding-and-duty-of-candour",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-022-professionalism-and-professional-bou",
    text: "After receiving treatment, a patient offers you a gift of substantial value. Explain how you would decide whether to accept it and what you would say to the patient.",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 22,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-023-professionalism-and-professional-bou",
    text: "Compare being offered an expensive patient gift with being given a small box of chocolates or a thank-you card. Would the value or nature of the gift change your response?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 23,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-024-professionalism-and-professional-bou",
    text: "To what extent should pharmaceutical companies be allowed to sponsor medical education?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 24,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-025-ethical-and-professional-scenarios",
    text: "Which problems can arise when doctors or researchers have financial conflicts of interest?",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 25,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-026-ethical-and-professional-scenarios",
    text: "You do not think antibiotics are needed, but the patient asks you to prescribe them. Talk through how you would discuss their request and reach a plan.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 26,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-027-ethical-and-professional-scenarios",
    text: "A patient is pressing for a scan that you do not believe is clinically indicated. Explain how you would explore their concerns and respond to the request.",
    category: "Ethics & Professionalism",
    subcategory: "Ethical & Professional Scenarios",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 27,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "ethical-and-professional-scenarios",
      "applied"
    ]
  },
  {
    id: "iq-09-028-consent-capacity-and-confidentiality",
    text: "A relative presses you for details of a patient's care. The patient has expressly refused permission to share them. How would you respond?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 28,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-029-consent-capacity-and-confidentiality",
    text: "A student posts about a memorable patient encounter on social media without naming the patient. How would you assess whether the post is appropriate?",
    category: "Ethics & Professionalism",
    subcategory: "Consent, Capacity & Confidentiality",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 29,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "consent-capacity-and-confidentiality",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-09-030-professionalism-and-professional-bou",
    text: "A doctor uses their professional identity while sharing a controversial political view publicly. Discuss the professional considerations raised by doing so.",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 9,
    sourceSectionTitle: "ETHICAL & PROFESSIONAL SCENARIOS",
    sourceQuestionNumber: 30,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "ethical-and-professional-scenarios"
    ]
  },
  {
    id: "iq-10-001-critical-thinking",
    text: "How could doctors improve health without directly treating illness?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-002-healthcare-policy-and-funding",
    text: "How does politics influence healthcare?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-003-healthcare-policy-and-funding",
    text: "To what extent should healthcare decisions ever be separated entirely from politics?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-004-critical-thinking",
    text: "How could society decide how much money to spend on healthcare?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-005-critical-thinking",
    text: "Which factors shape the way doctors are portrayed by the media?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-006-critical-thinking",
    text: "Can media coverage affect public trust in doctors?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-007-health-inequalities",
    text: "Which factors cause health inequalities?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-008-critical-thinking",
    text: "Should people pay a greater share of the costs associated with their own health? Discuss how you would set limits on personal financial responsibility.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-009-critical-thinking",
    text: "What would you say are complementary and alternative therapies?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-010-critical-thinking",
    text: "The evidence supporting a complementary therapy is limited. How would you assess whether the NHS should pay for patients to receive it?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-011-critical-thinking",
    text: "How could evidence be used when deciding whether a treatment should be offered?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 11,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-012-critical-thinking",
    text: "You are researching a topic you know little about and encounter several sources. How would you decide which information deserves your trust?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 12,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-013-critical-thinking",
    text: "How could you identify gaps in your own knowledge?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 13,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-014-critical-thinking",
    text: "To what extent is medicine primarily a science, an art, or a combination of both?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 14,
    difficulty: "applied",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-015-organ-donation-and-resource-allocati",
    text: "Which approaches could increase the supply of organs for transplantation?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 15,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-016-organ-donation-and-resource-allocati",
    text: "How could society encourage organ donation while respecting individual choice?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 16,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-017-professionalism-and-professional-bou",
    text: "Discuss how views about doctors' clothing and appearance have developed over time. What might explain changes in expectations of professional dress?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 17,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-018-health-inequalities",
    text: "Which factors influence differences in life expectancy across the UK?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 18,
    difficulty: "applied",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-019-critical-thinking",
    text: "Why do you think doctors can rarely guarantee that a treatment will be successful?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 19,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-020-health-inequalities",
    text: "Consider the route through medical training for someone with a significant disability. Where might they encounter barriers, and why?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 20,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-021-critical-thinking",
    text: "How could medical schools support students with disabilities?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 21,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-022-healthcare-policy-and-funding",
    text: "Which role should charities play in healthcare?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 22,
    difficulty: "applied",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-023-healthcare-policy-and-funding",
    text: "Imagine that essential local health services depend heavily on charitable support. What difficulties could that dependence create?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 23,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-024-professionalism-and-professional-bou",
    text: "What do you see as the benefits of openly acknowledging mistakes?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 24,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-025-professionalism-and-professional-bou",
    text: "Which disadvantages or difficulties can arise from admitting mistakes?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 25,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-026-professionalism-and-professional-bou",
    text: "To what extent is it appropriate for healthcare professionals to accept gifts from patients?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 26,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-027-healthcare-policy-and-funding",
    text: "Consider a high-risk sport such as boxing. What part, if any, should doctors play in setting or enforcing the rules around participation?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 27,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-028-professionalism-and-professional-bou",
    text: "To what extent should doctors be expected to set an example through their own lifestyle?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 28,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-029-health-inequalities",
    text: "Why does representation within the medical workforce matter? Discuss the value of diversity in a profession that has not always offered equal representation.",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 29,
    difficulty: "applied",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-030-professionalism-and-professional-bou",
    text: "A service is considering giving nurses and other healthcare professionals a wider range of responsibilities. What benefits and difficulties would you want it to examine?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 30,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-031-technology-ai-and-digital-health",
    text: "How could medical training adapt as technology and healthcare become more complex?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 31,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-032-critical-thinking",
    text: "How could doctors maintain motivation throughout a long career?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 32,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-033-critical-thinking",
    text: "Design one question you would use to interview a medical-school applicant. Explain what you would hope to learn from their answer.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 33,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-034-professionalism-and-professional-bou",
    text: "To what extent should doctors ever strike?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 34,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-035-professionalism-and-professional-bou",
    text: "Doctors have obligations to their patients as well as employment rights. How would you approach a situation in which these pull in different directions?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 35,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-036-healthcare-policy-and-funding",
    text: "When saving life and improving quality of life lead to different healthcare priorities, how should the competing goals be weighed?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 36,
    difficulty: "applied",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-037-healthcare-policy-and-funding",
    text: "Consider a proposal to move part of the NHS treatment budget into prevention. What would determine whether that change was justified?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 37,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-038-critical-thinking",
    text: "How should society decide what it can spend on treatments that extend life? Discuss whether any spending limit can be justified.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Thinking",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 38,
    difficulty: "applied",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "critical-thinking",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-039-healthcare-policy-and-funding",
    text: "A patient's preferred option may compete with the wider population's healthcare needs. How should the NHS weigh individual choice against those needs?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 39,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-10-040-healthcare-policy-and-funding",
    text: "To what extent should healthcare be treated as a right?",
    category: "NHS & Healthcare",
    subcategory: "Healthcare Policy & Funding",
    sourceSection: 10,
    sourceSectionTitle: "CRITICAL THINKING & HEALTH POLICY",
    sourceQuestionNumber: 40,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "healthcare-policy-and-funding",
      "applied",
      "critical-thinking-and-health-policy"
    ]
  },
  {
    id: "iq-11-001-research-and-evidence",
    text: "Why do you think medical research is important?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 1,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-002-research-and-evidence",
    text: "You can establish a new medical research institute with substantial funding. Set out the research area you would focus on and explain why it deserves that investment.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 2,
    difficulty: "advanced",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-003-research-and-evidence",
    text: "Choose a medical discovery from approximately the past hundred years that you consider especially influential. Make the case for its impact compared with other discoveries.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-004-research-and-evidence",
    text: "Which area of medical research interests you most?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 4,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-005-research-and-evidence",
    text: "Select a public-health advance from the modern era that you regard as particularly important. Explain what makes its contribution stand out.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-006-research-and-evidence",
    text: "How would you define evidence-based medicine?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 6,
    difficulty: "advanced",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-007-critical-appraisal",
    text: "Why do you think randomised controlled trials are useful?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Appraisal",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-appraisal",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-008-critical-appraisal",
    text: "What do you see as some limitations of clinical trials?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Appraisal",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-appraisal",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-009-critical-appraisal",
    text: "Why do you think correlation does not necessarily mean causation?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Appraisal",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-appraisal",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-010-article-analysis",
    text: "Why do you think peer review is important?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Article Analysis",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "article-analysis",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-011-article-analysis",
    text: "How might you decide whether a health claim you saw on social media was trustworthy?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Article Analysis",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "article-analysis",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-012-article-analysis",
    text: "Why do you think two scientific studies might reach different conclusions?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Article Analysis",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "article-analysis",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-013-research-and-evidence",
    text: "How would you define the purpose of medical research ethics?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 13,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-014-research-and-evidence",
    text: "Why do you think informed consent is important in research?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 14,
    difficulty: "advanced",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-015-research-and-evidence",
    text: "To what extent is it acceptable to conduct research involving patients who lack capacity?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 15,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-016-research-and-evidence",
    text: "Which ethical issues arise when testing new treatments?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 16,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-017-research-and-evidence",
    text: "Why do you think representation of different populations is important in clinical research?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 17,
    difficulty: "advanced",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-018-critical-appraisal",
    text: "How would you explain the difference between statistical significance and clinical significance?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Appraisal",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "critical-appraisal",
      "core",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-019-research-and-evidence",
    text: "Why do you think treatments sometimes appear promising in early research but fail later?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 19,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-11-020-research-and-evidence",
    text: "How could doctors communicate uncertainty in scientific evidence to patients?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Research & Evidence",
    sourceSection: 11,
    sourceSectionTitle: "RESEARCH & EVIDENCE-BASED MEDICINE",
    sourceQuestionNumber: 20,
    difficulty: "advanced",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "research-and-evidence",
      "advanced",
      "research-and-evidence-based-medicine"
    ]
  },
  {
    id: "iq-12-001-new-treatments-and-innovation",
    text: "Consider weight-management injections such as semaglutide and tirzepatide. How would you weigh the opportunities they offer against the challenges of using them in healthcare?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 1,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-002-new-treatments-and-innovation",
    text: "To what extent should medications for obesity be widely available through the NHS?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 2,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-003-new-treatments-and-innovation",
    text: "If NHS access to expensive weight-management medicines is limited, what should determine which patients are offered them first?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 3,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-004-new-treatments-and-innovation",
    text: "Discuss how individual choices, medical factors and wider social conditions contribute to obesity. How should these perspectives shape where responsibility is placed?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 4,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-005-new-treatments-and-innovation",
    text: "Imagine weight-loss medication becoming widely used. What effects might this have on public attitudes towards obesity?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 5,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-006-new-treatments-and-innovation",
    text: "Compare the ethical considerations involved when prescription weight-loss medicines are obtained privately rather than through public healthcare. Which concerns would you examine?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 6,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-007-new-treatments-and-innovation",
    text: "A patient asks for a prescription weight-loss medicine chiefly to change their appearance. How would you explore the request and discuss your response?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 7,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-008-new-treatments-and-innovation",
    text: "Which responsibilities do social-media influencers have when discussing prescription medicines?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 8,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-009-new-treatments-and-innovation",
    text: "What would determine whether spending on weight-loss medication leads to lower NHS costs over the longer term?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 9,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-010-new-treatments-and-innovation",
    text: "A medicine attracts intense publicity and demand, while public understanding of its benefits and side effects remains limited. What problems could follow from this mismatch?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 10,
    sourceTopic: "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "weight-loss-medications-glp-1-and-gip-medicines",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-011-public-health-debates",
    text: "What do you see as the most important lessons healthcare systems should learn from the COVID-19 pandemic?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 11,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-012-public-health-debates",
    text: "How could the UK prepare for a future pandemic?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 12,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-013-public-health-debates",
    text: "During a period without a major outbreak, a government must decide how much to invest in pandemic preparedness. How would you assess the case for substantial ongoing funding?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 13,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-014-public-health-debates",
    text: "Which ethical issues arise when governments restrict individual freedoms during a public-health emergency?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 14,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-015-public-health-debates",
    text: "How could healthcare systems prioritise patients when resources become extremely limited?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 15,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-016-public-health-debates",
    text: "In what ways did COVID-19 affect trust in healthcare and science?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 16,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-017-ethics-in-the-news",
    text: "Why do you think misinformation became such a major challenge during the pandemic?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 17,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-018-ethics-in-the-news",
    text: "How could doctors respond to vaccine misinformation?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 18,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-019-public-health-debates",
    text: "Which challenges does long COVID create for patients and healthcare systems?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 19,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-020-public-health-debates",
    text: "Patients with long COVID may describe different combinations of complex symptoms. How would you approach care when experiences vary substantially from one person to another?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 20,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-021-public-health-debates",
    text: "Compare a COVID vaccination programme focused on people at greatest risk with one routinely offered to everyone. What should determine the choice between these approaches?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 21,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-022-public-health-debates",
    text: "A public-health emergency is developing and the evidence keeps changing. How could a government explain what remains uncertain while maintaining public trust?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 22,
    sourceTopic: "COVID-19, LONG COVID & PANDEMIC PREPAREDNESS",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "covid-19-long-covid-and-pandemic-preparedness",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-023-technology-ai-and-digital-health",
    text: "Which opportunities could artificial intelligence create in medicine?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 23,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-024-technology-ai-and-digital-health",
    text: "Which risks could arise from using AI to support diagnosis?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 24,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-025-technology-ai-and-digital-health",
    text: "An AI system recommends a clinical course of action. How much weight should a doctor give that recommendation when making their decision?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 25,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-026-technology-ai-and-digital-health",
    text: "A patient is harmed by a medical decision in which an AI system played a part. How would you think through who should be held responsible?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 26,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-027-technology-ai-and-digital-health",
    text: "Could AI take over the role of a doctor? Discuss which parts of the role might be replaceable and where the limits could lie.",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 27,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-028-technology-ai-and-digital-health",
    text: "What aspects of medicine are least likely to be replaced by artificial intelligence?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 28,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-029-technology-ai-and-digital-health",
    text: "Where might AI help people access healthcare sooner, and how could it affect waiting times?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 29,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-030-technology-ai-and-digital-health",
    text: "How might introducing AI into healthcare widen health inequalities that already exist?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 30,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-031-technology-ai-and-digital-health",
    text: "Which risks arise from bias in healthcare algorithms?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 31,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-032-technology-ai-and-digital-health",
    text: "How could patient data be protected when it is used to train medical AI systems?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 32,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-033-technology-ai-and-digital-health",
    text: "Discuss what patients should be told when AI helps shape their diagnosis or treatment. Should disclosure be required in every case?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 33,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-034-technology-ai-and-digital-health",
    text: "If AI reduces the time doctors spend on administration, how might that affect their communication with patients?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 34,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-035-technology-ai-and-digital-health",
    text: "Consider a clinical team that becomes heavily dependent on AI tools. What effects could that reliance have on doctors' own clinical skills?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 35,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-036-technology-ai-and-digital-health",
    text: "How could medical education change because of artificial intelligence?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 36,
    sourceTopic: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "artificial-intelligence-in-healthcare",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-037-current-nhs-issues",
    text: "Why do waiting times matter for patients and for healthcare services?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 37,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-038-current-nhs-issues",
    text: "How could patients on a waiting list be prioritised?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 38,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-039-current-nhs-issues",
    text: "When deciding the order in which patients on a waiting list are seen, should clinical urgency outweigh every other consideration? Explain your reasoning.",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 39,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-040-current-nhs-issues",
    text: "What steps could the NHS take to reduce waiting times without compromising quality?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 40,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-041-current-nhs-issues",
    text: "An NHS patient cannot be treated within an acceptable timeframe. Discuss whether arranging their treatment in the private sector is an appropriate response.",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 41,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-042-current-nhs-issues",
    text: "In what ways could technology meaningfully reduce NHS waiting lists?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 42,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-043-current-nhs-issues",
    text: "Which role should prevention play in reducing long-term pressure on NHS services?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 43,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-044-current-nhs-issues",
    text: "How could the NHS balance increasing demand against limited staff and funding?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Current NHS Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 44,
    sourceTopic: "NHS WAITING LISTS & ACCESS TO CARE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "current-nhs-issues",
      "applied",
      "nhs-waiting-lists-and-access-to-care",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-045-workforce-issues",
    text: "What do you see as the potential benefits of introducing new professional roles into healthcare teams?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 45,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-046-workforce-issues",
    text: "Which concerns can arise when the responsibilities of different healthcare professionals overlap?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 46,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-047-workforce-issues",
    text: "Why do you think clarity about professional roles is important for patient safety?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 47,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-048-workforce-issues",
    text: "How should patients be told whether they are seeing a doctor, physician associate or another professional? Should this always be made explicit?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 48,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-049-workforce-issues",
    text: "How would you describe good supervision within a healthcare team?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 49,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-050-workforce-issues",
    text: "You are concerned that a healthcare professional is taking on work beyond their competence. How should a doctor address the concern?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 50,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-051-workforce-issues",
    text: "How could multidisciplinary teams expand access to healthcare while maintaining patient safety?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Workforce Issues",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 51,
    sourceTopic: "PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "workforce-issues",
      "applied",
      "physician-associates-anaesthesia-associates-and-changing-professional-roles",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-052-ethics-in-the-news",
    text: "Why do you think vaccine-preventable diseases sometimes return even when effective vaccines are available?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 52,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-053-ethics-in-the-news",
    text: "Which factors contribute to vaccine hesitancy?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 53,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-054-ethics-in-the-news",
    text: "How could a doctor speak with a parent who is worried about vaccinating their child?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 54,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-055-ethics-in-the-news",
    text: "To what extent should vaccination ever be compulsory?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 55,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-056-ethics-in-the-news",
    text: "How could public-health authorities respond to falling vaccination uptake?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 56,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-057-ethics-in-the-news",
    text: "Which responsibilities do social-media platforms have regarding medical misinformation?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 57,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-058-ethics-in-the-news",
    text: "Why do you think false health information can spread more quickly than accurate information?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 58,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-059-ethics-in-the-news",
    text: "How could doctors challenge misinformation without damaging trust?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 59,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-060-ethics-in-the-news",
    text: "An influencer or celebrity spreads an inaccurate medical claim. When should a healthcare professional challenge it publicly, and what should guide their approach?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Ethics in the News",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 60,
    sourceTopic: "VACCINATION, MEASLES & HEALTH MISINFORMATION",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "ethics-in-the-news",
      "applied",
      "vaccination-measles-and-health-misinformation",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-061-public-health-debates",
    text: "Why do you think antimicrobial resistance is a major healthcare concern?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 61,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-062-public-health-debates",
    text: "Explain the link between unnecessary antibiotic prescribing and antimicrobial resistance.",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 62,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-063-public-health-debates",
    text: "You think a patient's illness is probably caused by a virus, but they are insistent that they need antibiotics. How would you handle the consultation?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 63,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-064-public-health-debates",
    text: "A doctor considers prescribing antibiotics mainly to avoid upsetting a patient. How would you assess the justification for that decision?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 64,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-065-public-health-debates",
    text: "Which responsibilities do patients have in reducing antimicrobial resistance?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 65,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-066-public-health-debates",
    text: "Why do you think antimicrobial resistance requires international cooperation?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 66,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-067-public-health-debates",
    text: "Consider a proposal to give pharmaceutical companies stronger incentives to develop new antibiotics. What would guide your view on whether the proposal is justified?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 67,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-068-public-health-debates",
    text: "How might agriculture and animal health contribute to antimicrobial resistance?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 68,
    sourceTopic: "ANTIMICROBIAL RESISTANCE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "antimicrobial-resistance",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-069-public-health-debates",
    text: "To what extent should governments restrict vaping more heavily?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 69,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-070-public-health-debates",
    text: "Vaping policy must consider both its possible use in helping people stop smoking and concerns about young people taking it up. How would you weigh those two considerations?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 70,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-071-public-health-debates",
    text: "To what extent should flavoured vaping products be restricted?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 71,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-072-public-health-debates",
    text: "To what extent should governments prevent young people from starting to smoke?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 72,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-073-public-health-debates",
    text: "In what situations does public-health intervention become excessive interference with personal choice?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 73,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-074-public-health-debates",
    text: "To what extent should products that damage health be taxed more heavily?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 74,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-075-public-health-debates",
    text: "How could doctors approach conversations about vaping with teenagers?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 75,
    sourceTopic: "VAPING, SMOKING & PUBLIC HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "vaping-smoking-and-public-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-076-public-health-debates",
    text: "Why do you think mental health has become an increasingly important part of healthcare?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 76,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-077-public-health-debates",
    text: "To what extent should mental and physical illness receive equal priority within the NHS?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 77,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-078-public-health-debates",
    text: "Which barriers prevent people from seeking mental-health support?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 78,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-079-public-health-debates",
    text: "What makes mental-health difficulties during childhood and adolescence an important healthcare concern?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 79,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-080-public-health-debates",
    text: "How could medical schools better protect students' mental health?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 80,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-081-public-health-debates",
    text: "How could doctors balance their own wellbeing with their professional responsibilities?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 81,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-082-public-health-debates",
    text: "Encouraging resilience is often intended to support people. How could that message nevertheless make someone less willing to seek help?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 82,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-083-public-health-debates",
    text: "Which steps could be taken to reduce stigma surrounding mental illness?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 83,
    sourceTopic: "MENTAL HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "mental-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-084-new-treatments-and-innovation",
    text: "How might genomic medicine change healthcare?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 84,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-085-new-treatments-and-innovation",
    text: "Which benefits could whole-genome sequencing offer patients?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 85,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-086-new-treatments-and-innovation",
    text: "Which ethical concerns arise when sequencing a person's genome?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 86,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-087-new-treatments-and-innovation",
    text: "Who do you think should have access to someone's genetic information?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 87,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-088-new-treatments-and-innovation",
    text: "A newborn screening programme could check for many genetic conditions. What should parents consider before deciding whether to take part?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 88,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-089-new-treatments-and-innovation",
    text: "Genomic testing identifies a serious condition that cannot currently be treated. How should that finding be handled with the person tested?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 89,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-090-new-treatments-and-innovation",
    text: "A genetic test result may matter to a patient's relatives as well as the patient. How would you approach the question of sharing that information?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 90,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-091-new-treatments-and-innovation",
    text: "If personalised treatments are costly, what might determine who can benefit from them, and how could this affect health inequalities?",
    category: "Hot Topics & Current Affairs",
    subcategory: "New Treatments & Innovation",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 91,
    sourceTopic: "GENOMICS & PERSONALISED MEDICINE",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "new-treatments-and-innovation",
      "applied",
      "genomics-and-personalised-medicine",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-092-health-inequalities",
    text: "Neighbouring communities can have markedly different health outcomes. Which local circumstances would you explore to understand that difference?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 92,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-093-health-inequalities",
    text: "When allocating NHS resources, how much weight should be given to the disadvantage experienced by a community?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 93,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-094-health-inequalities",
    text: "How would you explain the difference between equality and equity in healthcare?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 94,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-095-health-inequalities",
    text: "How could poverty influence health?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 95,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-096-health-inequalities",
    text: "How could housing influence health?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 96,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-097-health-inequalities",
    text: "How could education affect health outcomes?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 97,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-098-health-inequalities",
    text: "What practical steps can doctors take when a patient's health is affected by social circumstances beyond the consultation?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 98,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-099-technology-ai-and-digital-health",
    text: "In what ways could digital healthcare unintentionally exclude some patients?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 99,
    sourceTopic: "HEALTH INEQUALITIES",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "health-inequalities",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-100-end-of-life-care-and-assisted-dying",
    text: "How would you explain the difference between assisted dying, assisted suicide and euthanasia?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 100,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-101-end-of-life-care-and-assisted-dying",
    text: "Which arguments are commonly made in favour of assisted dying?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 101,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-102-end-of-life-care-and-assisted-dying",
    text: "What objections are raised to assisted dying, and how would you assess them?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 102,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-103-end-of-life-care-and-assisted-dying",
    text: "How could legalised assisted dying affect the doctor-patient relationship?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 103,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-104-end-of-life-care-and-assisted-dying",
    text: "If assisted dying were permitted, what safeguards would you consider for people who might face pressure or coercion?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 104,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-105-end-of-life-care-and-assisted-dying",
    text: "If assisted dying were legally available, how should the wishes of patients be balanced with doctors' objections to participating?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 105,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-106-end-of-life-care-and-assisted-dying",
    text: "How does access to good palliative care shape the arguments about assisted dying?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 106,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-107-end-of-life-care-and-assisted-dying",
    text: "In a discussion of assisted dying, how would you weigh personal autonomy alongside the duty to preserve life?",
    category: "Ethics & Professionalism",
    subcategory: "End-of-Life Care & Assisted Dying",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 107,
    sourceTopic: "END-OF-LIFE CARE & ASSISTED DYING",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "end-of-life-care-and-assisted-dying",
      "applied",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-108-public-health-debates",
    text: "How can climate change affect human health?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 108,
    sourceTopic: "CLIMATE CHANGE & HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "climate-change-and-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-109-public-health-debates",
    text: "What responsibility should the NHS take for its environmental impact?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 109,
    sourceTopic: "CLIMATE CHANGE & HEALTH",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "climate-change-and-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-110-public-health-debates",
    text: "To what extent should environmental sustainability influence clinical decision-making?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 110,
    sourceTopic: "CLIMATE CHANGE & HEALTH",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "climate-change-and-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-111-public-health-debates",
    text: "A hospital wants to cut waste. How would you evaluate changes while protecting infection control and patient safety?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 111,
    sourceTopic: "CLIMATE CHANGE & HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "climate-change-and-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-112-public-health-debates",
    text: "To what extent is climate change legitimately a medical issue?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Public Health Debates",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 112,
    sourceTopic: "CLIMATE CHANGE & HEALTH",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "public-health-debates",
      "applied",
      "climate-change-and-health",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-113-technology-ai-and-digital-health",
    text: "Which benefits could digital healthcare bring?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 113,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-114-technology-ai-and-digital-health",
    text: "What do you see as the disadvantages of relying more heavily on remote consultations?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 114,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-115-technology-ai-and-digital-health",
    text: "Which groups of patients might be disadvantaged by digital-first healthcare?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 115,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-116-technology-ai-and-digital-health",
    text: "Who do you think should own or control medical data?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 116,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "review",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-117-technology-ai-and-digital-health",
    text: "Researchers seek access to anonymised NHS patient records without asking each person for consent. What should govern that decision?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 117,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-118-technology-ai-and-digital-health",
    text: "How could the NHS balance medical innovation with privacy?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 118,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "completed",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-119-technology-ai-and-digital-health",
    text: "What concerns would you examine before allowing a commercial organisation to use health data?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 119,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-12-120-technology-ai-and-digital-health",
    text: "In what ways could wearable devices and health apps improve preventive medicine?",
    category: "Hot Topics & Current Affairs",
    subcategory: "Technology, AI & Digital Health",
    sourceSection: 12,
    sourceSectionTitle: "CURRENT MEDICAL HOT TOPICS: 2026",
    sourceQuestionNumber: 120,
    sourceTopic: "DIGITAL HEALTH & PATIENT DATA",
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "hot-topics-and-current-affairs",
      "technology-ai-and-digital-health",
      "applied",
      "digital-health-and-patient-data",
      "current-medical-hot-topics-2026"
    ]
  },
  {
    id: "iq-13-001-public-health",
    text: "Which factors cause obesity at a population level?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-002-public-health",
    text: "How could society respond to increasing obesity rates?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-003-public-health",
    text: "To what extent should governments regulate unhealthy food more strongly?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-004-public-health",
    text: "To what extent should sugary foods and drinks be taxed?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-005-public-health",
    text: "What would you consider when deciding whether to limit advertising of unhealthy foods aimed at children?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-006-public-health",
    text: "To what extent should individuals take greater responsibility for lifestyle-related illness?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-007-public-health",
    text: "Which role should doctors play in tackling obesity?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-008-public-health",
    text: "What do you see as the arguments for and against decriminalising currently illegal drugs?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-009-public-health",
    text: "What might change if drug policy focused primarily on health needs rather than criminal penalties? How would you judge the results?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-010-public-health",
    text: "Which role should harm-reduction programmes play in drug policy?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 10,
    difficulty: "advanced",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "advanced",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-011-public-health",
    text: "To what extent should governments regulate alcohol more heavily?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-012-public-health",
    text: "How could doctors approach addiction?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-013-public-health",
    text: "To what extent is addiction a disease?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-014-health-inequalities",
    text: "How could socioeconomic disadvantage contribute to addiction?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-015-health-inequalities",
    text: "Which role does education play in improving population health?",
    category: "NHS & Healthcare",
    subcategory: "Health Inequalities",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "health-inequalities",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-016-public-health",
    text: "A public-health campaign proposes using frightening messages to change behaviour. How would you assess that approach?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-017-public-health",
    text: "How could public-health authorities communicate risk?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "review",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-13-018-public-health",
    text: "Which lessons can healthcare learn from successful public-health interventions of the past?",
    category: "NHS & Healthcare",
    subcategory: "Public Health",
    sourceSection: 13,
    sourceSectionTitle: "PUBLIC HEALTH & SOCIETY",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "completed",
    tags: [
      "nhs-and-healthcare",
      "public-health",
      "core",
      "public-health-and-society"
    ]
  },
  {
    id: "iq-14-001-situational-judgement",
    text: "You have noticed a medical student missing classes and avoiding social contact. How would you check in with them and decide whether further help is needed?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-002-situational-judgement",
    text: "A friend wants to withdraw from university but fears their family's reaction. How would you help them think through the conversation?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-003-situational-judgement",
    text: "Your team keeps having to cover for a colleague who arrives late. How would you address the pattern with them?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-004-situational-judgement",
    text: "You see one student copying another's work. Talk through how you would handle what you have observed.",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-005-situational-judgement",
    text: "A friend wants your answers to an assignment that will be marked. How would you respond to the request?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-006-situational-judgement",
    text: "Another student makes a disrespectful remark about a patient within your hearing. How would you address it?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-007-situational-judgement",
    text: "During a conversation, a patient starts shouting insults at you. How would you respond while keeping everyone safe?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-008-situational-judgement",
    text: "After a long wait, a patient's relative angrily asks you why nothing is happening. How would you begin that conversation?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-009-situational-judgement",
    text: "You are already behind schedule when you meet a patient who is anxious and needs more time. How would you balance those demands?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-010-situational-judgement",
    text: "Several urgent requests arrive together. Explain how you would decide what needs your attention first.",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-011-situational-judgement",
    text: "You suspect an important instruction has been misunderstood by another healthcare professional. How would you check and resolve this?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 11,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-012-situational-judgement",
    text: "A senior member of staff asks you to take an action that you think could put a patient at risk. What would you say and do?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 12,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-013-situational-judgement",
    text: "An unattended computer is displaying confidential patient details. How would you deal with the immediate issue and any further concerns?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 13,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-014-situational-judgement",
    text: "You discover that you have sent information to an unintended recipient. How would you respond to the mistake?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 14,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-015-situational-judgement",
    text: "A patient asks something you cannot answer confidently. How would you respond without misleading them?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 15,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-016-situational-judgement",
    text: "A patient would like your personal mobile number for future questions. How would you respond and discuss ways to obtain help?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 16,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-017-situational-judgement",
    text: "A colleague's public social-media post about work strikes you as unprofessional. How would you decide what action to take?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 17,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-018-situational-judgement",
    text: "Just before an important team task, you notice that a colleague is distressed. How would you check what support they need?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 18,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-019-situational-judgement",
    text: "A colleague says they are coping, although you have noticed signs that make you worry about burnout. How would you approach the conversation?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 19,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-14-020-situational-judgement",
    text: "A staff member is targeted by a discriminatory remark from a patient. What response would you expect from the rest of the team?",
    category: "Ethics & Professionalism",
    subcategory: "Situational Judgement",
    sourceSection: 14,
    sourceSectionTitle: "SITUATIONAL JUDGEMENT",
    sourceQuestionNumber: 20,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "situational-judgement",
      "applied"
    ]
  },
  {
    id: "iq-15-001-organ-donation-and-resource-allocati",
    text: "A healthcare budget can fund either substantial relief from chronic pain for a large group or life-saving procedures for a smaller, critically ill group. How would you weigh the options?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-002-organ-donation-and-resource-allocati",
    text: "One donated organ could help either of two patients who need it. What would a fair process for deciding between them involve?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-003-organ-donation-and-resource-allocati",
    text: "The NHS is considering a costly cancer medicine that offers a few extra months of life. What should be weighed when deciding whether to fund it?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-004-organ-donation-and-resource-allocati",
    text: "Only a small group of patients benefits from a treatment, but the benefit for that group is large. How would you approach a funding decision?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-005-organ-donation-and-resource-allocati",
    text: "How would you assess funding for a rare-disease treatment whose cost per patient is very high?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-006-organ-donation-and-resource-allocati",
    text: "To what extent is it fair to use age when deciding how to allocate limited healthcare resources?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-007-organ-donation-and-resource-allocati",
    text: "A service must balance long waits against the greater clinical needs of newly referred patients. How should it set priorities?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-008-organ-donation-and-resource-allocati",
    text: "A prevention programme may take decades to show its full benefit. How would you judge its claim on funding needed for care today?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-009-organ-donation-and-resource-allocati",
    text: "With limited healthcare resources, how would you weigh improving quality of life against extending life?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-15-010-organ-donation-and-resource-allocati",
    text: "How should clinicians, elected representatives, economists, patients and independent bodies contribute to NHS funding decisions, and who should be accountable for the final choice?",
    category: "Ethics & Professionalism",
    subcategory: "Organ Donation & Resource Allocation",
    sourceSection: 15,
    sourceSectionTitle: "RESOURCE ALLOCATION SCENARIOS",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "organ-donation-and-resource-allocation",
      "applied",
      "resource-allocation-scenarios"
    ]
  },
  {
    id: "iq-16-001-professionalism-and-professional-bou",
    text: "How would you explain what professionalism means to you?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-002-professionalism-and-professional-bou",
    text: "To what extent should doctors be held to higher standards of behaviour than members of the general public?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-003-professionalism-and-professional-bou",
    text: "Can a doctor's behaviour outside work matter professionally?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-004-professionalism-and-professional-bou",
    text: "How could doctors use social media?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-005-professionalism-and-professional-bou",
    text: "A doctor wants to discuss a patient online after removing identifying details. What should they consider before posting?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-006-professionalism-and-professional-bou",
    text: "Why do you think professional boundaries are important?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-007-professionalism-and-professional-bou",
    text: "To what extent can a doctor become friends with a patient?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-008-professionalism-and-professional-bou",
    text: "A patient sends their doctor a social-media friend request. How should the doctor decide how to respond?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-009-professionalism-and-professional-bou",
    text: "How could a doctor respond when a colleague behaves unprofessionally?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-010-professionalism-and-professional-bou",
    text: "What do you think should happen if a doctor is not fit to work safely?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-011-professionalism-and-professional-bou",
    text: "Why do you think raising concerns is sometimes difficult in healthcare?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "review",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-012-professionalism-and-professional-bou",
    text: "Which responsibilities do junior staff have if they are worried about a senior colleague?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-013-professionalism-and-professional-bou",
    text: "How would you explain what honesty means in medicine?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-014-professionalism-and-professional-bou",
    text: "Why is trust especially important in the relationship between doctors and patients?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "completed",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-16-015-professionalism-and-professional-bou",
    text: "How would you respond if loyalty to a colleague came into conflict with protecting a patient?",
    category: "Ethics & Professionalism",
    subcategory: "Professionalism & Professional Boundaries",
    sourceSection: 16,
    sourceSectionTitle: "PROFESSIONALISM",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "ethics-and-professionalism",
      "professionalism-and-professional-boundaries",
      "core",
      "professionalism"
    ]
  },
  {
    id: "iq-17-001-role-play",
    text: "Speak with a fellow student whose attendance at teaching has dropped. Explore what is happening and what support they might need.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-002-role-play",
    text: "A friend has just failed an exam that mattered to them. Show how you would begin a supportive conversation.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-003-communication-tasks",
    text: "Tell someone that an event they were excited about has been cancelled, and respond to their reaction.",
    category: "Practical MMI & Role Play",
    subcategory: "Communication Tasks",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "review",
    tags: [
      "practical-mmi-and-role-play",
      "communication-tasks",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-004-role-play",
    text: "A customer feels they have been treated unfairly and is angry. Demonstrate how you would listen and respond.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-005-communication-tasks",
    text: "Explain clearly a simple scientific concept to someone with no scientific background.",
    category: "Practical MMI & Role Play",
    subcategory: "Communication Tasks",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "communication-tasks",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-006-communication-tasks",
    text: "Explain clearly how to use a common everyday object without demonstrating it.",
    category: "Practical MMI & Role Play",
    subcategory: "Communication Tasks",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "communication-tasks",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-007-communication-tasks",
    text: "Speak with someone who is worried about an upcoming medical procedure. Explore their concerns and offer appropriate support.",
    category: "Practical MMI & Role Play",
    subcategory: "Communication Tasks",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "communication-tasks",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-008-role-play",
    text: "Talk with a patient's relative who is frustrated about the length of the hospital wait.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-009-role-play",
    text: "Help someone explore a possible change to their lifestyle, giving them room to make their own decision.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-010-role-play",
    text: "Have a conversation with someone who is unsure about vaccination. Find out what matters to them before responding.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "review",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-011-role-play",
    text: "Show how you would support someone who has just heard upsetting news.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 11,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-012-communication-tasks",
    text: "Explain clearly why antibiotics may not be appropriate for a viral infection.",
    category: "Practical MMI & Role Play",
    subcategory: "Communication Tasks",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 12,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "communication-tasks",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-013-role-play",
    text: "Discuss a concern with a colleague whose behaviour has been causing difficulties for the team.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 13,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-014-role-play",
    text: "You have made a mistake that affects someone else. Demonstrate how you would apologise and discuss what happens next.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 14,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-015-giving-and-receiving-feedback",
    text: "Give feedback to someone whose recent performance fell short, keeping the conversation constructive.",
    category: "Communication & Teamwork",
    subcategory: "Giving & Receiving Feedback",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 15,
    difficulty: "applied",
    status: "completed",
    tags: [
      "communication-and-teamwork",
      "giving-and-receiving-feedback",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-016-giving-and-receiving-feedback",
    text: "Someone raises concerns about your performance. Demonstrate how you would listen, respond and decide what to do next.",
    category: "Communication & Teamwork",
    subcategory: "Giving & Receiving Feedback",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 16,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "communication-and-teamwork",
      "giving-and-receiving-feedback",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-017-role-play",
    text: "Help two people in a group talk through a disagreement and work towards a way forward.",
    category: "Practical MMI & Role Play",
    subcategory: "Role Play",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 17,
    difficulty: "applied",
    status: "review",
    tags: [
      "practical-mmi-and-role-play",
      "role-play",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-17-018-communication-tasks",
    text: "Talk someone through a complicated set of instructions so they can follow each step.",
    category: "Practical MMI & Role Play",
    subcategory: "Communication Tasks",
    sourceSection: 17,
    sourceSectionTitle: "ROLE-PLAY / COMMUNICATION STATIONS",
    sourceQuestionNumber: 18,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "communication-tasks",
      "applied",
      "role-play-communication-stations"
    ]
  },
  {
    id: "iq-18-001-data-stations",
    text: "Using the GP appointment-wait chart, describe the main trends and differences between the two districts. What limits the comparison?",
    category: "Practical MMI & Role Play",
    subcategory: "Data Stations",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "data-stations",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-002-data-stations",
    text: "Compare the smoking-cessation programmes using appropriate percentages. What can and cannot be concluded from the results?",
    category: "Practical MMI & Role Play",
    subcategory: "Data Stations",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "data-stations",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-003-data-stations",
    text: "Describe the relationship between weekly exercise and wellbeing across the two age groups. Can the survey show that exercise caused the differences?",
    category: "Practical MMI & Role Play",
    subcategory: "Data Stations",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "data-stations",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-004-data-stations",
    text: "Which community diabetes programme would you choose within the £200,000 first-year budget, and what further information could change your decision?",
    category: "Practical MMI & Role Play",
    subcategory: "Data Stations",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "data-stations",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-005-data-stations",
    text: "Describe the relationship between ward admissions and discharge delays. Which result is unusual, and what might help explain it?",
    category: "Practical MMI & Role Play",
    subcategory: "Data Stations",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "data-stations",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-006-graphs-and-trends",
    text: "The briefing says patient satisfaction ‘rises sharply’. How could the graph and comparison be misleading?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Graphs & Trends",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "graphs-and-trends",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-007-graphs-and-trends",
    text: "Describe the vaccination-uptake trends in both districts. What might explain the changes, and what cannot be concluded?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Graphs & Trends",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "graphs-and-trends",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-008-graphs-and-trends",
    text: "What does the sleep and exam-score plot show? Discuss the role of revision time and whether the data prove causation.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Graphs & Trends",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "graphs-and-trends",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-009-data-interpretation",
    text: "According to the heart-event chart, what are the main potential benefits, harms and practical burdens of the new treatment?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Data Interpretation",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "completed",
    tags: [
      "data-research-and-critical-thinking",
      "data-interpretation",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-010-data-interpretation",
    text: "Compare recovery after programmes A and B at 12 weeks and six months. What limitations and practical trade-offs should be considered?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Data Interpretation",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "data-interpretation",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-011-critical-appraisal",
    text: "What sources of bias or uncertainty limit the energy-drink study and its reported conclusion?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Appraisal",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 11,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-appraisal",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-012-critical-appraisal",
    text: "What do the reminder-text results show, and why is this 24-person pilot too small to support a firm conclusion?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Critical Appraisal",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 12,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "critical-appraisal",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-013-article-analysis",
    text: "How reliable is the asthma-app evaluation? Discuss the missing follow-up, outcome measurements and other possible explanations for the change.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Article Analysis",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 13,
    difficulty: "applied",
    status: "review",
    tags: [
      "data-research-and-critical-thinking",
      "article-analysis",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-014-article-analysis",
    text: "Does the headline ‘Berry halves cancer risk’ match the study results? Explain how the findings should be reported more accurately.",
    category: "Data, Research & Critical Thinking",
    subcategory: "Article Analysis",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 14,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "article-analysis",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-18-015-article-analysis",
    text: "What further research would you conduct to test whether virtual reality improves anatomy learning?",
    category: "Data, Research & Critical Thinking",
    subcategory: "Article Analysis",
    sourceSection: 18,
    sourceSectionTitle: "DATA INTERPRETATION & CRITICAL APPRAISAL",
    sourceQuestionNumber: 15,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "data-research-and-critical-thinking",
      "article-analysis",
      "applied",
      "data-interpretation-and-critical-appraisal"
    ]
  },
  {
    id: "iq-19-001-group-discussion",
    text: "Rank the five healthcare improvement proposals and choose two to launch next year. Explain your criteria, trade-offs and how the group could reach agreement.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Discussion",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "group-discussion",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-002-group-tasks",
    text: "Choose a package of whole NHS projects costing no more than £10 million. Explain your trade-offs and what further evidence you would request.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Tasks",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "group-tasks",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-003-group-tasks",
    text: "Choose five items for the group to take overnight on the mountain. Explain your assumptions, trade-offs and how you would reach agreement.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Tasks",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "group-tasks",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-004-group-discussion",
    text: "Plan a public-health campaign with a team.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Discussion",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "group-discussion",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-005-group-tasks",
    text: "Work with a group to propose a practical way of reducing missed hospital appointments.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Tasks",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "review",
    tags: [
      "practical-mmi-and-role-play",
      "group-tasks",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-006-group-discussion",
    text: "Develop a brief plan to improve student wellbeing.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Discussion",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "group-discussion",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-007-group-tasks",
    text: "Help a group choose practical steps to reduce a hospital's environmental impact.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Tasks",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "group-tasks",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-008-group-tasks",
    text: "Put the four patient presentations in a provisional order for assessment. Explain who you would alert and what further information you need.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Tasks",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "group-tasks",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-009-group-tasks",
    text: "Propose a focused change that could ease pressure on an emergency department, and discuss it with your group.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Tasks",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "group-tasks",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-19-010-group-discussion",
    text: "Plan a short health-education programme for teenagers with your group.",
    category: "Practical MMI & Role Play",
    subcategory: "Group Discussion",
    sourceSection: 19,
    sourceSectionTitle: "GROUP TASK / COLLABORATION STATIONS",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "group-discussion",
      "applied",
      "group-task-collaboration-stations"
    ]
  },
  {
    id: "iq-20-001-prioritisation-stations",
    text: "Put the five people in a provisional order for attention. Explain your immediate safety actions, who you would alert and how you would communicate delays.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-002-prioritisation-stations",
    text: "Choose three demands to address immediately. Explain what you would do about the other two and who you would involve.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "review",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-003-prioritisation-stations",
    text: "Prioritise the five requests in the team inbox. Explain what you would do first, what could be delegated and who needs an update.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-004-prioritisation-stations",
    text: "Choose a package of whole proposals within the £5 million budget. Explain your trade-offs and what further evidence you would need.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-005-prioritisation-stations",
    text: "Rank the four public-health options by likely impact. Explain your criteria and why reach alone does not show health benefit.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-006-prioritisation-stations",
    text: "When faced with an unfamiliar situation, how would you identify the information you need most urgently?",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-007-prioritisation-stations",
    text: "Using the diary, explain what you would keep, rearrange or delegate, and how you would communicate the changes.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-008-prioritisation-stations",
    text: "Which patient-safety concern would you escalate first? Explain your immediate actions, who you would involve and what should be recorded.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "completed",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-009-prioritisation-stations",
    text: "What would you do first in this hospital-corridor emergency? Explain who you would call and how you would protect people while staying within the student role.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "review",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-20-010-prioritisation-stations",
    text: "Explain clearly how you would reassess your priorities if new information became available.",
    category: "Practical MMI & Role Play",
    subcategory: "Prioritisation Stations",
    sourceSection: 20,
    sourceSectionTitle: "PRIORITISATION STATIONS",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "practical-mmi-and-role-play",
      "prioritisation-stations",
      "applied"
    ]
  },
  {
    id: "iq-21-001-hypotheticals",
    text: "Looking two centuries ahead, which responsibilities of doctors might have disappeared, and what might have taken their place?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Hypotheticals",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 1,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "hypotheticals",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-002-creative-questions",
    text: "Design a memorable event about medicine. What would people take part in, and what would you want them to take away?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Creative Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 2,
    difficulty: "applied",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "creative-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-003-creative-questions",
    text: "Think of uses for a phone charger that have nothing to do with charging a phone.",
    category: "Curveballs & Quick-Fire",
    subcategory: "Creative Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 3,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "creative-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-004-unexpected-questions",
    text: "You have six months free from study, with your living costs covered. Describe a creative project or experience unrelated to medicine that you would pursue.",
    category: "Curveballs & Quick-Fire",
    subcategory: "Unexpected Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 4,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "unexpected-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-005-hypotheticals",
    text: "Food, drinking water and shelter are available on an isolated island where you must stay. You can bring three more items. What would you choose, and why?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Hypotheticals",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 5,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "hypotheticals",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-006-opinion-questions",
    text: "How would you assess whether the money spent taking people to the Moon was justified?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Opinion Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 6,
    difficulty: "applied",
    status: "review",
    tags: [
      "curveballs-and-quick-fire",
      "opinion-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-007-hypotheticals",
    text: "If you could solve one global problem overnight, which would you choose and why?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Hypotheticals",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 7,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "hypotheticals",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-008-hypotheticals",
    text: "If you could have dinner with one historical figure, who would it be and why?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Hypotheticals",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 8,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "hypotheticals",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-009-creative-questions",
    text: "Briefly teach me something interesting in sixty seconds.",
    category: "Curveballs & Quick-Fire",
    subcategory: "Creative Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 9,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "creative-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-010-creative-questions",
    text: "Suggest five inventive uses for a paperclip beyond holding papers together.",
    category: "Curveballs & Quick-Fire",
    subcategory: "Creative Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 10,
    difficulty: "applied",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "creative-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-011-hypotheticals",
    text: "You can choose one modern technology for society to stop using. Which would you pick, and what might the consequences be?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Hypotheticals",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 11,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "hypotheticals",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-012-unexpected-questions",
    text: "Your community receives a fund of ten million pounds. What would you spend it on, and how would you justify those priorities?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Unexpected Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 12,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "unexpected-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-013-opinion-questions",
    text: "Describe an opinion you once held strongly but later changed.",
    category: "Curveballs & Quick-Fire",
    subcategory: "Opinion Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 13,
    difficulty: "applied",
    status: "review",
    tags: [
      "curveballs-and-quick-fire",
      "opinion-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-014-opinion-questions",
    text: "Which invention do you think has changed humanity most significantly?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Opinion Questions",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 14,
    difficulty: "applied",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "opinion-questions",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-21-015-hypotheticals",
    text: "If you could redesign one part of healthcare from scratch, what would you change?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Hypotheticals",
    sourceSection: 21,
    sourceSectionTitle: "CREATIVE / CURVEBALL QUESTIONS",
    sourceQuestionNumber: 15,
    difficulty: "applied",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "hypotheticals",
      "applied",
      "creative-curveball-questions"
    ]
  },
  {
    id: "iq-22-001-personal-quick-fire",
    text: "Briefly describe yourself in three words.",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 1,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-002-personal-quick-fire",
    text: "What most motivates you?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 2,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-003-personal-quick-fire",
    text: "How would you describe your greatest strength?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 3,
    difficulty: "core",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-004-personal-quick-fire",
    text: "What would you say you are currently working to improve?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 4,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-005-personal-quick-fire",
    text: "Which achievement means the most to you?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 5,
    difficulty: "core",
    status: "review",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-006-personal-quick-fire",
    text: "Who most inspires you?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 6,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-007-personal-quick-fire",
    text: "What do you value most highly in a friend?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 7,
    difficulty: "core",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-008-personal-quick-fire",
    text: "What tends to make you a good teammate?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 8,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-009-personal-quick-fire",
    text: "What tends to make you a good leader?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 9,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-010-personal-quick-fire",
    text: "How would you react to failure?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 10,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-011-personal-quick-fire",
    text: "How would you respond to criticism?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 11,
    difficulty: "core",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-012-personal-quick-fire",
    text: "What tends to make you stressed?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 12,
    difficulty: "core",
    status: "review",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-013-personal-quick-fire",
    text: "What usually helps you recover after a difficult day?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 13,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-014-personal-quick-fire",
    text: "What tends to make you curious?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 14,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-015-personal-quick-fire",
    text: "What do you most enjoy learning about outside medicine?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 15,
    difficulty: "core",
    status: "completed",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-016-personal-quick-fire",
    text: "What is one thing people often misunderstand about you?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 16,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-017-personal-quick-fire",
    text: "What do you think your friends would say is your most noticeable characteristic?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 17,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-018-personal-quick-fire",
    text: "Can you describe when you have shown courage?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 18,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-019-personal-quick-fire",
    text: "Can you describe when you have shown kindness?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 19,
    difficulty: "core",
    status: "review",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  },
  {
    id: "iq-22-020-personal-quick-fire",
    text: "Can you describe when you have demonstrated integrity?",
    category: "Curveballs & Quick-Fire",
    subcategory: "Personal Quick-Fire",
    sourceSection: 22,
    sourceSectionTitle: "QUICK-FIRE PERSONAL QUESTIONS",
    sourceQuestionNumber: 20,
    difficulty: "core",
    status: "not-attempted",
    tags: [
      "curveballs-and-quick-fire",
      "personal-quick-fire",
      "core",
      "quick-fire-personal-questions"
    ]
  }
] as const satisfies readonly InterviewQuestion[];

// Saved attempts retain the wording shown when they were completed. Keep those
// prompts resolvable after image-specific questions are improved.
export const LEGACY_INTERVIEW_QUESTION_IDS_BY_TEXT = new Map<string, string>([
  ["Briefly describe the main trend shown in this graph.", "iq-18-001-data-stations"],
  ["Which conclusions can reasonably be drawn from these data?", "iq-18-002-data-stations"],
  ["Which conclusions cannot be drawn from these data?", "iq-18-003-data-stations"],
  ["Which additional information would you want before making a decision?", "iq-18-004-data-stations"],
  ["Can you identify any unusual values or outliers?", "iq-18-005-data-stations"],
  ["In what ways could the graph be misleading?", "iq-18-006-graphs-and-trends"],
  ["Which factors could explain the observed trend?", "iq-18-007-graphs-and-trends"],
  ["Does this dataset show causation or simply an association?", "iq-18-008-graphs-and-trends"],
  ["How might you explain these results to a patient?", "iq-18-009-data-interpretation"],
  ["How might you explain these results to someone without a scientific background?", "iq-18-010-data-interpretation"],
  ["Which possible sources of bias can you identify?", "iq-18-011-critical-appraisal"],
  ["To what extent is the sample size sufficient?", "iq-18-012-critical-appraisal"],
  ["Which information would help you judge whether the study was reliable?", "iq-18-013-article-analysis"],
  ["How could the media misrepresent these findings?", "iq-18-014-article-analysis"],
  ["Which further research would you conduct?", "iq-18-015-article-analysis"],
  ["Explain how you would rank a list of healthcare priorities and agree on a group decision.", "iq-19-001-group-discussion"],
  ["Work through allocating a limited NHS budget across several competing services.", "iq-19-002-group-tasks"],
  ["Your group must choose equipment for a survival exercise. Explain how you would compare suggestions and reach agreement.", "iq-19-003-group-tasks"],
  ["Prioritise how you would handle patients using limited information.", "iq-19-008-group-tasks"],
  ["How would you decide which patients need attention most urgently, and communicate your reasoning?", "iq-20-001-prioritisation-stations"],
  ["Five tasks need attention, but you can deal with only three straight away. Explain how you would choose what to do now and what can wait.", "iq-20-002-prioritisation-stations"],
  ["Several members of your team ask for help at once. How might you prioritise?", "iq-20-003-prioritisation-stations"],
  ["Several services are competing for a limited healthcare budget. How would you decide their relative priority?", "iq-20-004-prioritisation-stations"],
  ["Explain how you would rank several public-health interventions according to likely impact.", "iq-20-005-prioritisation-stations"],
  ["Prioritise how you would handle competing academic, personal and volunteering commitments.", "iq-20-007-prioritisation-stations"],
  ["Explain how you would decide which patient-safety concern needs escalating first.", "iq-20-008-prioritisation-stations"],
  ["Prioritise how you would handle responses during an emergency situation.", "iq-20-009-prioritisation-stations"],
]);
