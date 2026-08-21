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
    text: "What experiences have helped prepare you for studying medicine?",
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
    text: "If you have taken a gap year, how have you used that time and what have you learned from it?",
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
    text: "If you did not receive a medical school offer this year, what would you do next?",
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
    text: "Are there any areas of medicine that currently interest you? Why?",
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
    text: "What would you like to achieve during your career as a doctor?",
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
    text: "In your view, what are the biggest advantages and disadvantages of being a doctor?",
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
    text: "Which aspects of becoming a doctor are you most excited about?",
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
    text: "Which aspects of a medical career concern you or appeal to you least?",
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
    text: "Why might someone qualify as a doctor and later decide to leave medicine?",
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
    text: "In what ways is being a doctor today different from being a doctor a century ago?",
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
    text: "Aside from diagnosing and treating illness, what other responsibilities do doctors have?",
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
    text: "How is technology changing the role of doctors?",
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
    text: "Who might be included in the multidisciplinary team caring for a patient?",
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
    text: "Why do you think teaching an is important part of medicine?",
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
    text: "Who do doctors have a responsibility to teach?",
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
    text: "In your view, what day-to-day life as a medical student is actually like?",
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
    text: "How have the responsibilities of nurses and other healthcare professionals changed over time?",
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
    text: "To what extent is most healthcare delivered in hospitals, or does the community play a larger role than people realise?",
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
    text: "What challenges do you expect to face during a medical career?",
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
    text: "Describe a medical or healthcare issue you have recently read about.?",
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
    text: "What factors can cause anger, aggression or stress in healthcare environments?",
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
    text: "In your view, what makes medicine different from many other careers?",
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
    text: "What qualities distinguish an excellent doctor from an average one?",
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
    text: "To what extent is clinical knowledge more important than communication skills, or are both equally important?",
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
    text: "To what extent can a doctor be too empathetic?",
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
    text: "What responsibilities does a doctor have beyond the individual patient sitting in front of them?",
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
    text: "Why do you think lifelong learning particularly is important in medicine?",
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
    text: "What role should doctors play in disease prevention?",
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
    text: "To what extent should doctors be expected to act as role models for healthy behaviour?",
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
    text: "What responsibilities do doctors have towards public health?",
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
    text: "How can doctors contribute to improving healthcare systems as well as treating individual patients?",
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
    text: "Why are you interested in studying at this particular medical school?",
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
    text: "Many universities offer similar teaching methods. What specifically attracts you to this course?",
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
    text: "What aspects of this medical school appeal to you most?",
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
    text: "To what extent is there anything about this medical school or course that appeals to you less?",
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
    text: "What do you understand by problem-based learning or PBL?",
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
    text: "How does problem-based learning differ from more traditional teaching?",
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
    text: "What would you say are the main advantages of problem-based learning?",
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
    text: "What potential disadvantages does PBL have?",
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
    text: "What would you say are the strengths of lecture-based teaching?",
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
    text: "What would you say are the limitations of relying heavily on lectures?",
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
    text: "What advantages can an integrated course offer?",
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
    text: "What difficulties might students encounter on an integrated course?",
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
    text: "What do you know about the structure of this medical degree?",
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
    text: "Why do you think this course matches the way you learn?",
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
    text: "Medicine involves a large amount of independent study. How would you manage that?",
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
    text: "What would you do if your academic performance dropped significantly after starting medical school?",
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
    text: "Describe a situation where good communication changed the outcome.?",
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
    text: "How might you explain a complicated medical idea without sounding patronising?",
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
    text: "What makes someone a good listener?",
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
    text: "Why do you think listening sometimes more is important than speaking?",
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
    text: "How might your approach differ when speaking with an elderly patient?",
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
    text: "How might you handle a situation where a patient misunderstood what you had said?",
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
    text: "How can body language influence a clinical consultation?",
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
    text: "What might prevent effective communication between a doctor and patient?",
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
    text: "How can doctors build trust with patients?",
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
    text: "How can cause a doctor-patient relationship to break down?",
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
    text: "What makes you an effective team member?",
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
    text: "Describe a time when you contributed successfully to a team.?",
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
    text: "What qualities make someone a strong team leader?",
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
    text: "Describe an occasion when you demonstrated leadership.?",
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
    text: "Do you naturally see yourself as more of a leader or a team member?",
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
    text: "What makes a team function effectively?",
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
    text: "What would you say are the advantages of working in a team?",
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
    text: "What difficulties can arise when working as part of a team?",
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
    text: "What would you do if one team member was contributing much less than everyone else?",
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
    text: "What would you do if two members of your team strongly disagreed with one another?",
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
    text: "To what extent is a good leader always the person who speaks the most?",
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
    text: "Describe a time when when your team did not perform as well as you hoped.?",
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
    text: "Why do you think teamwork particularly is important in healthcare?",
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
    text: "How do you organise your time when you have several competing priorities?",
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
    text: "What activities or hobbies do you enjoy outside your studies?",
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
    text: "Describe a meaningful non-academic project you have taken part in.?",
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
    text: "How do you normally respond to stress?",
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
    text: "What have your hobbies or interests taught you that could be useful in medicine?",
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
    text: "What would you consider your main strengths?",
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
    text: "Which of your personal qualities would help you become a good doctor?",
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
    text: "In your view, what you would bring to our medical school?",
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
    text: "Which three words would you use to describe yourself?",
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
    text: "What values would you want people to associate with you?",
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
    text: "Which parts of your personality are well suited to medicine?",
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
    text: "What skills have you gained through employment or volunteering that would transfer to medicine?",
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
    text: "Do you tend to work better independently or collaboratively?",
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
    text: "How would you define an area of yourself that you are currently trying to improve?",
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
    text: "If you could improve two personal qualities, what would they be?",
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
    text: "Who has had a significant influence on the person you are today?",
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
    text: "What qualities make someone an effective teacher?",
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
    text: "Describe a teacher or mentor who had an impact on you.?",
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
    text: "Describe an important decision you have had to make.?",
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
    text: "What achievement are you most proud of?",
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
    text: "How do you respond when somebody criticises your work?",
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
    text: "How do you deal with conflict?",
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
    text: "Describe a situation in which you changed your opinion after hearing another perspective.",
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
    text: "Describe a mistake you made and what you learned from it.?",
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
    text: "Describe a book, film, podcast or article that made you think differently.?",
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
    text: "Medical training is demanding and lengthy. What makes you confident that you can cope with it?",
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
    text: "What situations tend to frustrate or anger you?",
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
    text: "How do you recognise when you are becoming overwhelmed?",
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
    text: "What would you do if you were struggling academically or emotionally at medical school?",
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
    text: "To what extent is resilience simply about coping with pressure, or can it also involve asking for help?",
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
    text: "How do you maintain a healthy balance between achievement and wellbeing?",
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
    text: "What do you understand about how the NHS is structured?",
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
    text: "How does primary care differ from secondary and tertiary care?",
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
    text: "What role does a GP play within the NHS?",
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
    text: "What challenges currently face the NHS?",
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
    text: "What would you say are the potential advantages of having both public and private healthcare?",
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
    text: "What problems could arise from a mixed public-private healthcare system?",
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
    text: "Why can life expectancy and health outcomes differ between different areas and communities?",
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
    text: "What factors other than healthcare influence a person's health?",
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
    text: "What would you say are the social determinants of health?",
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
    text: "How can doctors do to reduce health inequalities?",
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
    text: "What factors should be considered when deciding whether the NHS should fund a treatment?",
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
    text: "To what extent should the NHS fund procedures that are considered non-essential?",
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
    text: "To what extent is treating the greatest number of patients always the fairest use of NHS resources?",
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
    text: "What would you say are the arguments for and against charging for some NHS services?",
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
    text: "Why is confidentiality central to healthcare?",
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
    text: "When might confidentiality need to be breached?",
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
    text: "What would you say are the four main principles of medical ethics?",
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
    text: "To what extent can the four ethical principles ever conflict?",
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
    text: "How might you approach an ethical scenario where there was no perfect solution?",
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
    text: "To what extent should a competent adult be allowed to refuse life-saving treatment?",
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
    text: "When can a doctor act against a patient's wishes?",
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
    text: "To what extent should family members be allowed to make decisions on behalf of a patient?",
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
    text: "When might confidentiality need to be overridden?",
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
    text: "Does a doctor have the same duty of care towards a patient whose illness is partly linked to their lifestyle?",
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
    text: "To what extent should smokers and non-smokers have equal access to treatment?",
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
    text: "To what extent should people with alcohol dependence have the same access to transplantation as other patients?",
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
    text: "Who should decide whether an expensive treatment represents good value for the NHS?",
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
    text: "To what extent is it ethical to spend a very large amount of money treating one person when the same money could help many others?",
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
    text: "A competent adult refuses a blood transfusion for religious reasons even though refusing it could result in death. How would you approach the situation?",
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
    text: "An unconscious patient needs an urgent blood transfusion, but their records indicate that they may refuse blood products for religious reasons. What factors would you consider?",
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
    text: "Parents refuse a potentially life-saving blood transfusion for their child because of their beliefs. How should the healthcare team respond?",
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
    text: "Only one donor organ is available and two patients have a similar level of clinical need. How should the decision be made?",
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
    text: "A patient demands surgery even though their current health means the procedure is very likely to fail. How would you respond?",
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
    text: "An expensive new treatment might substantially improve a patient's life, but the same money could treat many other people. How would you approach the decision?",
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
    text: "A young teenager requests advice about terminating a pregnancy. What ethical, legal and communication issues should be considered?",
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
    text: "A patient with serious heart disease refuses medication despite understanding that refusing it may shorten their life. Their spouse wants you to persuade them. What should you do?",
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
    text: "A patient asks your opinion about an alternative treatment they discovered online. How would you respond?",
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
    text: "A patient asks for an HIV test. What issues should be considered before, during and after testing?",
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
    text: "A patient living with HIV refuses to tell their sexual partner about the diagnosis. How would you approach the situation?",
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
    text: "What ethical issues surround the use of animals in medical research?",
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
    text: "In your view, what about conceiving a child partly in the hope that they could provide treatment for an existing sibling?",
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
    text: "You notice that a senior doctor appears to be under the influence of alcohol immediately before seeing patients. What would you do?",
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
    text: "A colleague asks you to prescribe medication for them informally. How would you respond?",
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
    text: "You discover that a colleague is accessing illegal or seriously inappropriate material on a work computer. What should you do?",
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
    text: "Under what circumstances, if any, might withholding the full truth be ethically defensible?",
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
    text: "A colleague makes a mistake but asks you not to tell anybody. How would you respond?",
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
    text: "You realise that you have made a mistake in a patient's care. What should you do?",
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
    text: "A patient gives you an expensive gift after treatment. Would you accept it?",
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
    text: "Would your answer be different if the gift were a small box of chocolates or a thank-you card?",
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
    text: "What problems can arise when doctors or researchers have financial conflicts of interest?",
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
    text: "A patient requests antibiotics even though you believe they are unnecessary. How would you handle the conversation?",
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
    text: "A patient insists on a scan that you believe is not clinically indicated. What would you do?",
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
    text: "A patient's relative demands confidential information that the patient has asked you not to share. How would you respond?",
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
    text: "A medical student posts information about an interesting patient encounter on social media without naming the patient. Is that acceptable?",
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
    text: "A doctor publicly expresses a controversial political opinion while identifying themselves as a doctor. What professionalism issues might arise?",
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
    text: "How can doctors improve health without directly treating illness?",
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
    text: "In what ways does politics influence healthcare?",
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
    text: "What shapes the way doctors are portrayed by the media?",
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
    text: "Does media coverage affect public trust in doctors?",
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
    text: "What causes health inequalities?",
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
    text: "To what extent should individuals be expected to take greater financial responsibility for their own health?",
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
    text: "To what extent should the NHS fund complementary therapies if the evidence for them is limited?",
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
    text: "When researching an unfamiliar topic, how would you decide which information to trust?",
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
    text: "How can you identify gaps in your own knowledge?",
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
    text: "What approaches could increase the supply of organs for transplantation?",
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
    text: "How have expectations around doctors' appearance and professional dress changed?",
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
    text: "What factors influence differences in life expectancy across the UK?",
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
    text: "Why can doctors rarely guarantee that a treatment will be successful?",
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
    text: "What barriers might a person with a significant disability encounter when training as a doctor?",
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
    text: "What role should charities play in healthcare?",
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
    text: "Are there risks in relying too heavily on charities to provide essential health services?",
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
    text: "What would you say are the benefits of openly acknowledging mistakes?",
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
    text: "What disadvantages or difficulties can arise from admitting mistakes?",
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
    text: "To what extent should doctors be involved in regulating high-risk sports such as boxing?",
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
    text: "Medicine has historically struggled with unequal representation. Why does diversity within the medical workforce matter?",
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
    text: "What benefits and challenges come with expanding the responsibilities of nurses and other healthcare professionals?",
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
    text: "How can doctors maintain motivation throughout a long career?",
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
    text: "What question would you ask if you were interviewing somebody for medical school, and why?",
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
    text: "How might you balance doctors' employment rights against their responsibilities to patients?",
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
    text: "To what extent should healthcare always prioritise saving life above improving quality of life?",
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
    text: "To what extent should prevention receive more NHS funding even if that means reducing spending on treatment?",
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
    text: "To what extent is there a limit to how much society should spend to extend someone's life?",
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
    text: "How could the NHS balance individual patient choice with population-level needs?",
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
    text: "If you were given substantial funding to establish a research institute, what area would you choose to investigate and why?",
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
    text: "Which medical discovery do you think has had the greatest impact over roughly the last century?",
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
    text: "What area of medical research interests you most?",
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
    text: "In your view, what has been one of the most important public-health advances of the modern era?",
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
    text: "Why are randomised controlled trials useful?",
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
    text: "What would you say are some limitations of clinical trials?",
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
    text: "Why does correlation not necessarily mean causation?",
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
    text: "Why might two scientific studies reach different conclusions?",
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
    text: "What ethical issues arise when testing new treatments?",
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
    text: "How would you define the difference between statistical significance and clinical significance?",
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
    text: "Why do treatments sometimes appear promising in early research but fail later?",
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
    text: "Weight-management injections such as semaglutide and tirzepatide have received enormous public attention. What opportunities and challenges do they create?",
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
    text: "How could the NHS decide which patients receive expensive weight-management medicines first?",
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
    text: "To what extent is obesity primarily an individual responsibility, a medical condition, a societal issue, or a combination of these?",
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
    text: "In what ways could widespread use of weight-loss medication change the way society views obesity?",
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
    text: "What ethical issues arise when people obtain prescription weight-loss medicines privately?",
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
    text: "How could doctors respond to patients requesting these drugs mainly for cosmetic weight loss?",
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
    text: "What responsibilities do social-media influencers have when discussing prescription medicines?",
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
    text: "In what ways could weight-loss medications reduce long-term NHS expenditure?",
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
    text: "What risks arise when a highly publicised medicine becomes extremely popular before the public fully understands its benefits and side effects?",
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
    text: "What would you say are the most important lessons healthcare systems should learn from the COVID-19 pandemic?",
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
    text: "To what extent should pandemic preparedness receive substantial funding even when no major outbreak is occurring?",
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
    text: "What ethical issues arise when governments restrict individual freedoms during a public-health emergency?",
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
    text: "How did COVID-19 affect trust in healthcare and science?",
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
    text: "Why did misinformation become such a major challenge during the pandemic?",
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
    text: "What challenges does long COVID create for patients and healthcare systems?",
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
    text: "How could doctors approach a condition such as long COVID when symptoms can be complex and vary considerably between patients?",
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
    text: "To what extent should cOVID vaccination continue to be targeted towards groups at greatest risk rather than offered routinely to everybody?",
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
    text: "How can governments communicate uncertainty during an evolving public-health emergency without losing public trust?",
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
    text: "What opportunities could artificial intelligence create in medicine?",
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
    text: "What risks could arise from using AI to support diagnosis?",
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
    text: "To what extent should a doctor be allowed to rely on an AI system when making a clinical decision?",
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
    text: "Who should be responsible if an AI system contributes to a harmful medical decision?",
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
    text: "In what ways could aI ever replace doctors?",
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
    text: "Which aspects of medicine are least likely to be replaced by artificial intelligence?",
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
    text: "In what ways could aI improve healthcare access and reduce waiting times?",
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
    text: "In what ways could aI increase existing health inequalities?",
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
    text: "What risks arise from bias in healthcare algorithms?",
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
    text: "To what extent should patients always be told when AI has contributed to their diagnosis or treatment?",
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
    text: "In what ways could aI make doctors better communicators by reducing administrative work?",
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
    text: "In what ways could excessive reliance on AI weaken doctors' clinical skills?",
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
    text: "Why do you think waiting times such an are important healthcare issue?",
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
    text: "To what extent should clinical urgency always be the main consideration?",
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
    text: "What could the NHS do to reduce waiting times without compromising quality?",
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
    text: "To what extent should patients be offered treatment in the private sector if the NHS cannot treat them quickly enough?",
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
    text: "What role should prevention play in reducing long-term pressure on NHS services?",
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
    text: "How can the NHS balance increasing demand against limited staff and funding?",
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
    text: "What would you say are the potential benefits of introducing new professional roles into healthcare teams?",
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
    text: "What concerns can arise when the responsibilities of different healthcare professionals overlap?",
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
    text: "To what extent should patients always know whether they are being treated by a doctor, physician associate or another healthcare professional?",
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
    text: "What does good supervision look like within a healthcare team?",
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
    text: "How could doctors respond when another healthcare professional appears to be working beyond their competence?",
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
    text: "How can multidisciplinary teams expand access to healthcare while maintaining patient safety?",
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
    text: "Why do vaccine-preventable diseases sometimes return even when effective vaccines are available?",
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
    text: "What factors contribute to vaccine hesitancy?",
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
    text: "What responsibilities do social-media platforms have regarding medical misinformation?",
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
    text: "Why can false health information spread more quickly than accurate information?",
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
    text: "How can doctors challenge misinformation without damaging trust?",
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
    text: "To what extent should healthcare professionals publicly challenge celebrities or influencers who spread inaccurate medical claims?",
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
    text: "Why is antimicrobial resistance a major healthcare concern?",
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
    text: "Why does unnecessary antibiotic prescribing contribute to the problem?",
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
    text: "How might you respond to a patient who strongly demanded antibiotics for a likely viral infection?",
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
    text: "To what extent should doctors ever prescribe antibiotics mainly to maintain a good relationship with a patient?",
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
    text: "What responsibilities do patients have in reducing antimicrobial resistance?",
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
    text: "Why does antimicrobial resistance require international cooperation?",
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
    text: "To what extent should pharmaceutical companies receive greater incentives to develop new antibiotics?",
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
    text: "How could agriculture and animal health contribute to antimicrobial resistance?",
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
    text: "How could public-health policy balance the potential role of vaping in smoking cessation against concern about uptake among young people?",
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
    text: "How far should governments go in preventing young people from starting to smoke?",
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
    text: "When does public-health intervention become excessive interference with personal choice?",
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
    text: "Why has mental health become an increasingly important part of healthcare?",
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
    text: "What barriers prevent people from seeking mental-health support?",
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
    text: "Why do you think mental-health difficulties particularly are important among children and young people?",
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
    text: "How can medical schools better protect students' mental health?",
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
    text: "To what extent can encouraging resilience sometimes unintentionally discourage people from asking for help?",
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
    text: "What could be done to reduce stigma surrounding mental illness?",
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
    text: "How could genomic medicine change healthcare?",
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
    text: "What benefits could whole-genome sequencing offer patients?",
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
    text: "What ethical concerns arise when sequencing a person's genome?",
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
    text: "Who should have access to someone's genetic information?",
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
    text: "To what extent should parents be able to have newborn babies genetically screened for a large number of conditions?",
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
    text: "What should happen if genomic testing reveals a serious condition for which there is currently no treatment?",
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
    text: "Does a patient have a responsibility to tell relatives about a genetic risk that may affect them?",
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
    text: "In what ways could personalised medicine widen health inequalities if new treatments are expensive?",
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
    text: "Why can two people living only a few miles apart experience very different health outcomes?",
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
    text: "To what extent should the NHS spend more resources on disadvantaged communities?",
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
    text: "How would you define the difference between equality and equity in healthcare?",
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
    text: "How can poverty influence health?",
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
    text: "How can housing influence health?",
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
    text: "How can education affect health outcomes?",
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
    text: "How can doctors realistically do about social problems that affect their patients' health?",
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
    text: "How would you define the difference between assisted dying, assisted suicide and euthanasia?",
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
    text: "What arguments are commonly made in favour of assisted dying?",
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
    text: "What arguments are commonly made against it?",
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
    text: "How might legalised assisted dying affect the doctor-patient relationship?",
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
    text: "How could vulnerable patients be protected?",
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
    text: "To what extent should doctors be required to participate if assisted dying were legally available?",
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
    text: "How does high-quality palliative care influence this debate?",
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
    text: "How could autonomy be balanced against the principle of preserving life?",
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
    text: "In what ways can climate change affect human health?",
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
    text: "What responsibility does the NHS have to reduce its environmental impact?",
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
    text: "How can hospitals reduce waste without compromising infection control or patient safety?",
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
    text: "What benefits could digital healthcare bring?",
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
    text: "What would you say are the disadvantages of relying more heavily on remote consultations?",
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
    text: "Which patients might be disadvantaged by digital-first healthcare?",
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
    text: "Who should own or control medical data?",
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
    text: "To what extent should anonymised NHS patient data be used for research without individual consent?",
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
    text: "What would you say are the risks of commercial companies accessing health data?",
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
    text: "What causes obesity at a population level?",
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
    text: "To what extent should advertising unhealthy foods to children be restricted?",
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
    text: "What role should doctors play in tackling obesity?",
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
    text: "What would you say are the arguments for and against decriminalising currently illegal drugs?",
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
    text: "Would treating drug use primarily as a health issue rather than a criminal issue improve outcomes?",
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
    text: "What role should harm-reduction programmes play in drug policy?",
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
    text: "How can socioeconomic disadvantage contribute to addiction?",
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
    text: "What role does education play in improving population health?",
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
    text: "To what extent should public-health campaigns use fear to change behaviour?",
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
    text: "What lessons can healthcare learn from successful public-health interventions of the past?",
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
    text: "A fellow medical student regularly misses teaching and has become socially withdrawn. What would concern you, and what would you do?",
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
    text: "A friend tells you they intend to leave university but are terrified of telling their family. How would you support them?",
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
    text: "A colleague repeatedly arrives late, increasing everybody else's workload. How would you handle it?",
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
    text: "You notice a student copying another student's work. What would you do?",
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
    text: "A friend asks you to share answers for an assessed assignment. How would you respond?",
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
    text: "You hear another student making an offensive remark about a patient. What would you do?",
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
    text: "A patient becomes verbally aggressive towards you. How would you manage the situation?",
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
    text: "A relative becomes angry because their family member has been waiting for several hours. How would you respond?",
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
    text: "You are running late but an anxious patient clearly needs more time. What would you do?",
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
    text: "You receive several urgent tasks at once. How would you prioritise them?",
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
    text: "You realise another healthcare professional may have misunderstood an important instruction. What would you do?",
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
    text: "A senior colleague tells you to do something you believe may be unsafe. How would you respond?",
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
    text: "You notice confidential patient information visible on an unattended computer screen. What would you do?",
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
    text: "You accidentally send information to the wrong person. What should happen next?",
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
    text: "A patient asks you a question and you genuinely do not know the answer. What would you say?",
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
    text: "A patient asks for your personal phone number so they can contact you later. How would you respond?",
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
    text: "You see a colleague post something unprofessional about work on social media. What would you do?",
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
    text: "A team member is visibly upset immediately before an important task. How would you approach them?",
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
    text: "You believe a colleague is experiencing burnout but they insist that everything is fine. What would you do?",
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
    text: "A patient makes a discriminatory comment towards a member of staff. How should the team respond?",
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
    text: "You control a limited healthcare budget. Would you prioritise a treatment that substantially reduces chronic pain for many patients or a life-saving procedure for a smaller number of critically ill patients? Explain your reasoning.",
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
    text: "Two patients need the same organ but only one organ is available. What principles should guide the decision?",
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
    text: "A new cancer treatment extends life by several months but is extremely expensive. Should the NHS fund it?",
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
    text: "A treatment is highly effective for a small number of people but provides no benefit to most patients. How should funding decisions be made?",
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
    text: "To what extent should rare-disease treatments be funded even when their cost per patient is extremely high?",
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
    text: "To what extent should patients who have already waited a long time receive priority over newly referred patients with greater clinical need?",
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
    text: "To what extent should preventive programmes receive funding if their benefits may not become apparent for decades?",
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
    text: "When resources are limited, should healthcare prioritise length of life or quality of life?",
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
    text: "Who should ultimately make NHS resource-allocation decisions: doctors, politicians, economists, patients or independent organisations?",
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
    text: "Does a doctor's behaviour outside work matter professionally?",
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
    text: "To what extent is it ever appropriate for doctors to discuss patients online if identifying details are removed?",
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
    text: "To what extent should doctors accept friend requests from patients on social media?",
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
    text: "What should happen if a doctor is not fit to work safely?",
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
    text: "Why is raising concerns sometimes difficult in healthcare?",
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
    text: "What responsibilities do junior staff have if they are worried about a senior colleague?",
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
    text: "Why do you think trust particularly is important in the medical profession?",
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
    text: "What would you do if protecting a colleague conflicted with protecting a patient?",
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
    text: "Role-play speaking with a student who has repeatedly missed teaching sessions.?",
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
    text: "Role-play speaking with a friend who has failed an important examination.?",
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
    text: "Role-play explaining to somebody that an event they were looking forward to has been cancelled.?",
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
    text: "Role-play speaking with an angry customer who believes they have been treated unfairly.?",
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
    text: "Explain clearly a simple scientific concept to someone with no scientific background.?",
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
    text: "Explain clearly how to use a common everyday object without demonstrating it.?",
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
    text: "Reassure someone who is anxious before a medical procedure.",
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
    text: "Role-play speaking with a relative who is frustrated by a long hospital wait.?",
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
    text: "Encourage someone to consider making a healthy lifestyle change without lecturing them.",
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
    text: "Role-play speaking with somebody who is hesitant about vaccination.?",
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
    text: "Respond to someone who has received upsetting news.",
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
    text: "Explain clearly why antibiotics may not be appropriate for a viral infection.?",
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
    text: "Role-play speaking with a colleague whose behaviour is affecting the team.?",
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
    text: "Apologise after making a mistake.",
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
    text: "Give constructive feedback to somebody who has performed poorly.",
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
    text: "Receive critical feedback from somebody else and respond appropriately.",
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
    text: "Resolve a disagreement between two members of a group.",
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
    text: "Explain clearly a complicated set of instructions in a clear and structured way.?",
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
    text: "Describe the main trend shown in this graph.",
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
    text: "What conclusions can reasonably be drawn from these data?",
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
    text: "What conclusions cannot be drawn from these data?",
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
    text: "What additional information would you want before making a decision?",
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
    text: "Are there any unusual values or outliers?",
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
    text: "In what ways could the graph be misleading?",
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
    text: "What factors could explain the observed trend?",
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
    text: "Does this dataset demonstrate causation or simply an association?",
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
    text: "How might you explain these results to a patient?",
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
    text: "How might you explain these results to someone without a scientific background?",
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
    text: "What possible sources of bias can you identify?",
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
    text: "To what extent is the sample size sufficient?",
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
    text: "What information would help you judge whether the study was reliable?",
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
    text: "How might the media misrepresent these findings?",
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
    text: "What further research would you conduct?",
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
    text: "Explain how you would rank a list of healthcare priorities and agree on a group decision.?",
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
    text: "Allocate a limited NHS budget across several competing services.",
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
    text: "Explain how you would decide which items should be taken on a survival exercise.?",
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
    text: "Plan a public-health campaign as a team.",
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
    text: "Design a strategy to reduce missed hospital appointments.",
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
    text: "Develop a plan to improve student wellbeing.",
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
    text: "Explain how you would decide how a hospital could reduce its environmental impact.?",
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
    text: "Prioritise patients using limited information.",
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
    text: "Create a solution for reducing pressure on an emergency department.",
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
    text: "Design a health education programme for teenagers.",
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
    text: "Explain how you would rank several patients according to urgency and explain your reasoning.?",
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
    text: "You have five tasks and only enough time to complete three immediately. Decide what you would do first.",
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
    text: "Several members of your team ask for help at once. How would you prioritise?",
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
    text: "Explain how you would decide how to allocate a limited healthcare budget between different services.?",
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
    text: "Explain how you would rank several public-health interventions according to likely impact.?",
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
    text: "Explain how you would decide which pieces of information are most important when assessing a situation.?",
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
    text: "Prioritise competing academic, personal and volunteering commitments.",
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
    text: "Explain how you would decide which patient-safety concern needs escalating first.?",
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
    text: "Prioritise responses during an emergency situation.",
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
    text: "Explain clearly how you would reassess your priorities if new information became available.?",
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
    text: "Imagine healthcare 200 years from now. Which parts of a doctor's job might no longer exist?",
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
    text: "You are organising a medicine-themed event. How would you make it memorable?",
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
    text: "Think of as many alternative uses as possible for a phone charger.",
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
    text: "You have six months completely free, enough money to support yourself and no academic obligations. How would you spend the time in an imaginative, non-medical way?",
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
    text: "You are stranded on an island, but food, water and shelter are already provided. Which three additional items would you choose and why?",
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
    text: "Was sending humans to the Moon a worthwhile use of money?",
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
    text: "If you could solve one global problem overnight, which would you choose?",
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
    text: "If you could have dinner with any historical figure, who would it be and why?",
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
    text: "Teach me something interesting in sixty seconds.",
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
    text: "Give me five unusual uses for a paperclip.",
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
    text: "If you could remove one piece of modern technology from society, what would it be?",
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
    text: "If you had 10 pounds million to improve your local community, how would you spend it?",
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
    text: "How would you define an opinion you once held strongly but later changed?",
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
    text: "Which invention has changed humanity most significantly?",
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
    text: "If you could redesign one part of the healthcare system from scratch, what would you change?",
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
    text: "Describe yourself in three words.",
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
    text: "What motivates you?",
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
    text: "How would you define your greatest strength?",
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
    text: "What would you say are you currently working to improve?",
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
    text: "What achievement means the most to you?",
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
    text: "Who inspires you?",
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
    text: "What do you value most in a friend?",
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
    text: "What makes you a good teammate?",
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
    text: "What makes you a good leader?",
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
    text: "How do you react to failure?",
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
    text: "How do you respond to criticism?",
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
    text: "What makes you stressed?",
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
    text: "What helps you recover after a difficult day?",
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
    text: "What makes you curious?",
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
    text: "What do you enjoy learning about outside medicine?",
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
    text: "How would you define something people often misunderstand about you?",
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
    text: "What would your friends say is your most noticeable characteristic?",
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
    text: "When have you shown courage?",
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
    text: "When have you shown kindness?",
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
    text: "When have you demonstrated integrity?",
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
