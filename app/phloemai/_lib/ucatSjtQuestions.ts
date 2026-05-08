import type {
  UCATOptionKey,
  UCATQuestion,
  UCATSjtIssueTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

const IMPORTANCE_OPTIONS: Array<{ key: UCATOptionKey; text: string }> = [
  { key: "A", text: "Very important" },
  { key: "B", text: "Important" },
  { key: "C", text: "Of minor importance" },
  { key: "D", text: "Not important at all" },
];

const APPROPRIATENESS_OPTIONS: Array<{ key: UCATOptionKey; text: string }> = [
  { key: "A", text: "A very appropriate thing to do" },
  { key: "B", text: "Appropriate, but not ideal" },
  { key: "C", text: "Inappropriate, but not awful" },
  { key: "D", text: "A very inappropriate thing to do" },
];

function makeSingleSjtQuestion(input: {
  id: string;
  subtype: UCATSubtypeId;
  setId: string;
  stimulus: string[];
  question: string;
  answer: UCATOptionKey;
  explanation: string;
  issueTags: UCATSjtIssueTag[];
  options: Array<{ key: UCATOptionKey; text: string }>;
}): UCATQuestion {
  return {
    id: input.id,
    section: "sjt",
    subtype: input.subtype,
    setId: input.setId,
    tags: ["text-stem", "set-based", "quick"],
    issueTags: input.issueTags,
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: input.stimulus,
    question: input.question,
    options: input.options,
    answer: input.answer,
    explanation: input.explanation,
  };
}

function makeImportance(input: Omit<Parameters<typeof makeSingleSjtQuestion>[0], "options">) {
  return makeSingleSjtQuestion({ ...input, options: IMPORTANCE_OPTIONS });
}

function makeAppropriateness(input: Omit<Parameters<typeof makeSingleSjtQuestion>[0], "options">) {
  return makeSingleSjtQuestion({ ...input, options: APPROPRIATENESS_OPTIONS });
}

const publicScreenStimulus = [
  "Amir, a medical student, is helping on a ward round. At the nurses' station he notices that a computer screen has been left unlocked and can be seen by visitors walking past. The screen shows a patient's name, bed number and a recent sensitive diagnosis. Amir is unsure whether to mention it because the team is busy and he is only observing.",
  "How important are the following considerations for Amir when deciding how to respond?",
];

const deterioratingPatientStimulus = [
  "Priya, a medical student on placement, is helping healthcare assistants give drinks to patients. A patient suddenly says she has tightness in her chest and looks pale. The nurse looking after the patient is speaking to a doctor at the end of the ward. Priya has completed basic life support training but is not qualified to assess the patient independently.",
  "How important are the following considerations for Priya when deciding how to respond?",
];

const derogatoryCommentsStimulus = [
  "Sana, a medical student, is observing in an outpatient clinic. In the staff room, a healthcare assistant repeatedly jokes that a patient with alcohol dependence is 'wasting appointments' and should not be offered much time. Sana feels uneasy, but several staff members laugh and the clinic is running late.",
  "How important are the following considerations for Sana when deciding how to respond?",
];

const copiedWorkStimulus = [
  "Harriet, a pharmacy student, is coordinating a small audit poster for her placement group. The evening before submission, she notices that one teammate has added several survey responses that were never collected to make the results look stronger. Another teammate says the sample was too small anyway and that no tutor will ask to see the raw forms.",
  "How important are the following considerations for Harriet when deciding how to respond?",
];

const capacityStimulus = [
  "Lina, a medical student, is observing in a GP clinic. A patient with a learning disability declines a vaccination after appearing unsure about the explanation. The patient's support worker becomes frustrated and tells Lina that the patient should just have it because transport has already been arranged.",
  "How important are the following considerations for Lina when deciding how to respond?",
];

const infusionStimulus = [
  "Ravi, a medical student, is helping prepare discharge paperwork under supervision. He notices that the insulin dose typed into the discharge letter appears different from the dose on the medication chart. The ward is busy, the doctor who asked him to help has gone to review another patient, and a pharmacist is working nearby.",
  "How important are the following considerations for Ravi when deciding how to respond?",
];

const interpreterStimulus = [
  "Mina, a medical student, is taking a history from a patient who speaks limited English. The patient's adult son offers to interpret, but the questions include personal symptoms and medication adherence. The clinic is busy and the next interpreter slot may take some time.",
  "How appropriate are the following responses by Mina in this situation?",
];

const roughCareStimulus = [
  "Sasha, a medical student, is paired with another student, Jaya, during a busy dermatology clinic. Sasha notices that Jaya often interrupts anxious patients and gives curt answers when they ask questions. A receptionist later tells Sasha that a relative complained that Jaya made a patient feel dismissed.",
  "How appropriate are the following responses by Sasha in this situation?",
];

const prescriptionStimulus = [
  "Mei, a medical student, is helping prepare notes for a discharge meeting. She notices that the discharge summary lists amoxicillin, but the patient's notes and wristband record a penicillin allergy. The junior doctor who drafted the summary is currently on the phone, and Mei is not sure whether the allergy has already been discussed.",
  "How appropriate are the following responses by Mei in this situation?",
];

const socialMediaStimulus = [
  "Tariq, a medical student, sees another student taking a selfie in a ward corridor. A patient information board is visible in the background. The other student says the photo is only for a private group chat and that the patient names are probably too small to read.",
  "How appropriate are the following responses by Tariq in this situation?",
];

export const SJT_QUESTIONS: UCATQuestion[] = [
  makeImportance({
    id: "sjt-importance-confidentiality-001",
    subtype: "sjt-importance",
    setId: "sjt-public-screen",
    stimulus: publicScreenStimulus,
    question: "That identifiable patient information is visible to people who are not involved in the patient's care",
    answer: "A",
    issueTags: ["confidentiality", "professional-boundaries"],
    explanation:
      "Protecting identifiable patient information is vital. Amir should act promptly, for example by alerting a staff member or asking for the screen to be secured.",
  }),
  makeImportance({
    id: "sjt-importance-confidentiality-002",
    subtype: "sjt-importance",
    setId: "sjt-public-screen",
    stimulus: publicScreenStimulus,
    question: "That Amir does not know the patient personally",
    answer: "D",
    issueTags: ["confidentiality", "respect-dignity"],
    explanation:
      "Confidentiality applies whether or not Amir knows the patient. Considering this as a reason to ignore the screen would undermine the patient's privacy.",
  }),
  makeImportance({
    id: "sjt-importance-confidentiality-003",
    subtype: "sjt-importance",
    setId: "sjt-public-screen",
    stimulus: publicScreenStimulus,
    question: "That a staff member nearby may be able to secure the screen quickly",
    answer: "B",
    issueTags: ["teamwork", "confidentiality", "escalation"],
    explanation:
      "This is important because Amir should use an appropriate, practical route to fix the problem, although the key issue remains confidentiality itself.",
  }),
  makeImportance({
    id: "sjt-importance-confidentiality-004",
    subtype: "sjt-importance",
    setId: "sjt-public-screen",
    stimulus: publicScreenStimulus,
    question: "That Amir is only observing and has not been asked to manage the ward computer",
    answer: "C",
    issueTags: ["scope-of-practice", "confidentiality"],
    explanation:
      "Amir's student role affects how he acts, but it does not remove the concern. He can raise it with staff without taking over the computer system himself.",
  }),
  makeImportance({
    id: "sjt-importance-patient-safety-001",
    subtype: "sjt-importance",
    setId: "sjt-deteriorating-patient",
    stimulus: deterioratingPatientStimulus,
    question: "That the patient may be becoming acutely unwell",
    answer: "A",
    issueTags: ["patient-safety", "non-maleficence", "beneficence"],
    explanation:
      "Possible acute deterioration is a vital patient safety concern. Priya should not try to manage it alone, but she should get help immediately.",
  }),
  makeImportance({
    id: "sjt-importance-patient-safety-002",
    subtype: "sjt-importance",
    setId: "sjt-deteriorating-patient",
    stimulus: deterioratingPatientStimulus,
    question: "That raising the concern may interrupt the nurse's conversation",
    answer: "D",
    issueTags: ["patient-safety", "escalation"],
    explanation:
      "This should not deter Priya from escalating a possible emergency. Patient safety is more important than avoiding an interruption.",
  }),
  makeImportance({
    id: "sjt-importance-patient-safety-003",
    subtype: "sjt-importance",
    setId: "sjt-deteriorating-patient",
    stimulus: deterioratingPatientStimulus,
    question: "That Priya has completed basic life support training",
    answer: "B",
    issueTags: ["scope-of-practice", "patient-safety"],
    explanation:
      "This is important because it may help Priya respond sensibly while getting help, but it does not make her responsible for assessing or treating the patient alone.",
  }),
  makeImportance({
    id: "sjt-importance-patient-safety-004",
    subtype: "sjt-importance",
    setId: "sjt-deteriorating-patient",
    stimulus: deterioratingPatientStimulus,
    question: "That Priya might feel embarrassed if the patient turns out to be fine",
    answer: "D",
    issueTags: ["patient-safety", "professional-boundaries"],
    explanation:
      "Fear of embarrassment should not be taken into account when a patient may be unwell. It would be safer to escalate and be reassured than to delay.",
  }),
  makeImportance({
    id: "sjt-importance-respect-001",
    subtype: "sjt-communication",
    setId: "sjt-derogatory-comments",
    stimulus: derogatoryCommentsStimulus,
    question: "That the remarks undermine the patient's dignity",
    answer: "A",
    issueTags: ["respect-dignity", "integrity", "professional-boundaries"],
    explanation:
      "Respect for patients is fundamental. Remarks that stereotype or belittle a patient should be challenged or escalated appropriately.",
  }),
  makeImportance({
    id: "sjt-importance-respect-002",
    subtype: "sjt-communication",
    setId: "sjt-derogatory-comments",
    stimulus: derogatoryCommentsStimulus,
    question: "That other staff members laugh at the remarks",
    answer: "D",
    issueTags: ["integrity", "respect-dignity"],
    explanation:
      "Other people failing to challenge poor behaviour is not a reason to treat it as acceptable. Sana should still respond professionally.",
  }),
  makeImportance({
    id: "sjt-importance-respect-003",
    subtype: "sjt-communication",
    setId: "sjt-derogatory-comments",
    stimulus: derogatoryCommentsStimulus,
    question: "That Sana feels uneasy about what was said",
    answer: "B",
    issueTags: ["respect-dignity", "communication"],
    explanation:
      "Sana's discomfort is relevant because it signals that the behaviour may be inappropriate, but the decisive issue is the disrespect shown to the patient.",
  }),
  makeImportance({
    id: "sjt-importance-respect-004",
    subtype: "sjt-communication",
    setId: "sjt-derogatory-comments",
    stimulus: derogatoryCommentsStimulus,
    question: "That similar attitudes could affect how staff treat the patient",
    answer: "A",
    issueTags: ["respect-dignity", "non-maleficence", "patient-safety"],
    explanation:
      "Disrespectful attitudes can affect care and trust. The risk of poor treatment is a very important consideration.",
  }),
  makeImportance({
    id: "sjt-importance-integrity-001",
    subtype: "sjt-integrity",
    setId: "sjt-invented-data",
    stimulus: copiedWorkStimulus,
    question: "That submitting invented data would be academically dishonest",
    answer: "A",
    issueTags: ["integrity"],
    explanation:
      "Academic integrity is central to professionalism. Invented data should not knowingly be submitted.",
  }),
  makeImportance({
    id: "sjt-importance-integrity-002",
    subtype: "sjt-integrity",
    setId: "sjt-invented-data",
    stimulus: copiedWorkStimulus,
    question: "That the deadline is the following morning",
    answer: "C",
    issueTags: ["integrity", "teamwork"],
    explanation:
      "The deadline creates pressure and may affect how Harriet manages the solution, but it does not change the need to deal with the invented data.",
  }),
  makeImportance({
    id: "sjt-importance-integrity-003",
    subtype: "sjt-integrity",
    setId: "sjt-invented-data",
    stimulus: copiedWorkStimulus,
    question: "That the group believes no one will ask to see the raw forms",
    answer: "D",
    issueTags: ["integrity", "justice"],
    explanation:
      "The chance of being caught should not determine whether the group acts honestly. Considering this would make the situation worse.",
  }),
  makeImportance({
    id: "sjt-importance-integrity-004",
    subtype: "sjt-integrity",
    setId: "sjt-invented-data",
    stimulus: copiedWorkStimulus,
    question: "That Harriet coordinated the audit and should protect the accuracy of the submission",
    answer: "A",
    issueTags: ["integrity", "teamwork"],
    explanation:
      "Because Harriet is coordinating the work, she has a particular responsibility to guide the group towards an accurate and honest response.",
  }),
  makeImportance({
    id: "sjt-importance-capacity-001",
    subtype: "sjt-importance",
    setId: "sjt-capacity-consent",
    stimulus: capacityStimulus,
    question: "Whether the patient has capacity to decide about the vaccination at that time",
    answer: "A",
    issueTags: ["autonomy", "capacity-consent"],
    explanation:
      "Capacity and consent are vital. A patient's decision should not be overridden simply because someone supporting them is frustrated.",
  }),
  makeImportance({
    id: "sjt-importance-capacity-002",
    subtype: "sjt-importance",
    setId: "sjt-capacity-consent",
    stimulus: capacityStimulus,
    question: "That the support worker is frustrated",
    answer: "B",
    issueTags: ["communication", "respect-dignity", "beneficence"],
    explanation:
      "The support worker's frustration should be handled sensitively, but it does not replace the need to respect the patient's rights and the proper consent process.",
  }),
  makeImportance({
    id: "sjt-importance-capacity-003",
    subtype: "sjt-importance",
    setId: "sjt-capacity-consent",
    stimulus: capacityStimulus,
    question: "That delaying the vaccination may mean rearranging transport and another appointment",
    answer: "A",
    issueTags: ["beneficence", "patient-safety"],
    explanation:
      "Practical impact on care is important, but it still needs to be balanced with consent and appropriate support for decision making.",
  }),
  makeImportance({
    id: "sjt-importance-capacity-004",
    subtype: "sjt-importance",
    setId: "sjt-capacity-consent",
    stimulus: capacityStimulus,
    question: "That Lina wants to avoid an awkward conversation with the support worker",
    answer: "D",
    issueTags: ["professional-boundaries", "communication"],
    explanation:
      "Avoiding discomfort is not a valid reason to ignore a consent concern. Lina should seek help from the clinical team.",
  }),
  makeImportance({
    id: "sjt-importance-dose-001",
    subtype: "sjt-importance",
    setId: "sjt-discharge-dose",
    stimulus: infusionStimulus,
    question: "That an incorrect insulin dose on the discharge summary could harm the patient",
    answer: "A",
    issueTags: ["patient-safety", "non-maleficence"],
    explanation:
      "Potential patient harm is the most important consideration. Ravi must stop and seek appropriate supervision if he is unsure.",
  }),
  makeImportance({
    id: "sjt-importance-dose-002",
    subtype: "sjt-importance",
    setId: "sjt-discharge-dose",
    stimulus: infusionStimulus,
    question: "That the pharmacist may be able to advise Ravi or help contact the supervising doctor",
    answer: "B",
    issueTags: ["teamwork", "escalation", "patient-safety"],
    explanation:
      "This is important because it gives Ravi a safe route to get help, though he should not rely on informal guessing.",
  }),
  makeImportance({
    id: "sjt-importance-dose-003",
    subtype: "sjt-importance",
    setId: "sjt-discharge-dose",
    stimulus: infusionStimulus,
    question: "That the discharge summary otherwise appears complete",
    answer: "D",
    issueTags: ["patient-safety", "scope-of-practice"],
    explanation:
      "A document looking complete does not confirm that the dose is correct. Considering this could falsely reassure Ravi.",
  }),
  makeImportance({
    id: "sjt-importance-dose-004",
    subtype: "sjt-importance",
    setId: "sjt-discharge-dose",
    stimulus: infusionStimulus,
    question: "That Ravi may look incompetent if he asks for help",
    answer: "D",
    issueTags: ["patient-safety", "professional-boundaries"],
    explanation:
      "Concern about appearing incompetent should not be taken into account. Asking for help protects the patient and is professional.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-interpreter-001",
    subtype: "sjt-appropriateness",
    setId: "sjt-interpreter",
    stimulus: interpreterStimulus,
    question: "Ask a staff member whether a professional interpreter can be arranged",
    answer: "A",
    issueTags: ["communication", "autonomy", "capacity-consent"],
    explanation:
      "Using a professional interpreter helps the patient communicate privately and make informed choices.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-interpreter-002",
    subtype: "sjt-appropriateness",
    setId: "sjt-interpreter",
    stimulus: interpreterStimulus,
    question: "Use the son to interpret all sensitive questions because it is quicker",
    answer: "D",
    issueTags: ["confidentiality", "autonomy", "professional-boundaries"],
    explanation:
      "Using a family member for sensitive details can compromise privacy and autonomy. It should not be the default approach.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-interpreter-003",
    subtype: "sjt-appropriateness",
    setId: "sjt-interpreter",
    stimulus: interpreterStimulus,
    question: "Continue to address the patient directly using simple language while waiting for appropriate interpreting support",
    answer: "B",
    issueTags: ["communication", "respect-dignity"],
    explanation:
      "This is respectful and can help rapport, but it is not enough for detailed or sensitive clinical information if understanding is limited.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-interpreter-004",
    subtype: "sjt-appropriateness",
    setId: "sjt-interpreter",
    stimulus: interpreterStimulus,
    question: "Ignore the communication difficulty and complete the history as normal",
    answer: "D",
    issueTags: ["communication", "patient-safety", "autonomy"],
    explanation:
      "Ignoring the barrier risks inaccurate information and poor consent. Mina should seek appropriate support.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-rough-care-001",
    subtype: "sjt-communication",
    setId: "sjt-rough-care",
    stimulus: roughCareStimulus,
    question: "Speak to Jaya privately and encourage her to reflect on the complaint with a supervisor",
    answer: "A",
    issueTags: ["communication", "patient-safety", "teamwork"],
    explanation:
      "A private, constructive conversation can address the behaviour while keeping patient welfare at the centre.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-rough-care-002",
    subtype: "sjt-communication",
    setId: "sjt-rough-care",
    stimulus: roughCareStimulus,
    question: "Tell the relative who complained that Jaya is not suited to patient contact",
    answer: "D",
    issueTags: ["professional-boundaries", "respect-dignity", "communication"],
    explanation:
      "This is unfair, inflammatory and outside Sasha's role. Concerns should be handled through appropriate staff channels.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-rough-care-003",
    subtype: "sjt-communication",
    setId: "sjt-rough-care",
    stimulus: roughCareStimulus,
    question: "Ask the nurse whether the concern has been documented or escalated",
    answer: "B",
    issueTags: ["teamwork", "escalation", "patient-safety"],
    explanation:
      "This could be helpful and may ensure the concern is not missed, but Sasha should also think about whether she needs to raise what she has observed.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-rough-care-004",
    subtype: "sjt-communication",
    setId: "sjt-rough-care",
    stimulus: roughCareStimulus,
    question: "Do nothing because only one patient has complained directly",
    answer: "D",
    issueTags: ["patient-safety", "candour", "escalation"],
    explanation:
      "There is already a complaint, a staff concern and Sasha's own observation. Doing nothing risks ongoing patient harm.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-prescription-001",
    subtype: "sjt-appropriateness",
    setId: "sjt-allergy-discharge",
    stimulus: prescriptionStimulus,
    question: "Tell the junior doctor that the allergy and discharge medication need to be checked before the patient leaves",
    answer: "A",
    issueTags: ["patient-safety", "communication", "candour"],
    explanation:
      "It is very appropriate to raise a medication safety issue directly and respectfully with the clinician responsible.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-prescription-002",
    subtype: "sjt-appropriateness",
    setId: "sjt-allergy-discharge",
    stimulus: prescriptionStimulus,
    question: "Remove the allergy from the summary herself because the doctor probably meant to prescribe the antibiotic",
    answer: "D",
    issueTags: ["scope-of-practice", "patient-safety", "non-maleficence"],
    explanation:
      "Mei must not alter clinical information or guess the intended decision. That would be outside her role and could cause harm.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-prescription-003",
    subtype: "sjt-appropriateness",
    setId: "sjt-allergy-discharge",
    stimulus: prescriptionStimulus,
    question: "Reassure the patient that the antibiotic is probably safe without checking with the team",
    answer: "D",
    issueTags: ["patient-safety", "scope-of-practice"],
    explanation:
      "Guessing about an allergy risk is unsafe. The discrepancy must be clarified by an appropriate clinician before discharge.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-prescription-004",
    subtype: "sjt-appropriateness",
    setId: "sjt-allergy-discharge",
    stimulus: prescriptionStimulus,
    question: "If similar discrepancies keep appearing, seek advice from a senior clinician or placement supervisor",
    answer: "B",
    issueTags: ["escalation", "patient-safety", "teamwork"],
    explanation:
      "This may be appropriate if the issue is repeated, though the immediate discharge discrepancy should first be clarified safely.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-social-media-001",
    subtype: "sjt-integrity",
    setId: "sjt-social-media-board",
    stimulus: socialMediaStimulus,
    question: "Ask the student not to share the image and explain that patient information may be visible",
    answer: "A",
    issueTags: ["confidentiality", "integrity", "communication"],
    explanation:
      "It is very appropriate to intervene promptly and explain the confidentiality risk.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-social-media-002",
    subtype: "sjt-integrity",
    setId: "sjt-social-media-board",
    stimulus: socialMediaStimulus,
    question: "Escalate to a supervisor if the image has already been shared or the student refuses to delete it",
    answer: "A",
    issueTags: ["confidentiality", "escalation", "integrity"],
    explanation:
      "If confidential information may have been shared, escalation is needed so the organisation can respond appropriately.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-social-media-003",
    subtype: "sjt-integrity",
    setId: "sjt-social-media-board",
    stimulus: socialMediaStimulus,
    question: "Like the photo in the group chat because it is only shared privately",
    answer: "D",
    issueTags: ["confidentiality", "professional-boundaries", "integrity"],
    explanation:
      "Private sharing can still breach confidentiality. Encouraging it would be very inappropriate.",
  }),
  makeAppropriateness({
    id: "sjt-appropriateness-social-media-004",
    subtype: "sjt-integrity",
    setId: "sjt-social-media-board",
    stimulus: socialMediaStimulus,
    question: "Move the board out of shot and take another ward selfie together",
    answer: "C",
    issueTags: ["professional-boundaries", "confidentiality"],
    explanation:
      "This reduces one confidentiality risk but still treats the ward as a social media setting. It is not a good professional response.",
  }),
  {
    id: "sjt-drag-category-community-001",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "sjt-memory-cafe-handover",
    questionType: "drag-category",
    tags: ["text-stem", "set-based", "quick"],
    issueTags: ["patient-safety", "professional-boundaries", "teamwork"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Jon, a medical student, is helping at a community memory cafe. He has been asked to accompany Mr Green, who becomes disorientated in unfamiliar places, to the minibus at the end of the session. Jon receives an urgent call about a family emergency and wants to leave at once, but no other volunteer is beside Mr Green yet.",
    ],
    question: "Drag each response to the side that best describes it.",
    instruction:
      "Classify each response as appropriate or inappropriate in this situation.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      {
        id: "call-supervisor",
        text: "Contact the placement supervisor to arrange safe handover before leaving",
        answerCategory: "appropriate",
      },
      {
        id: "leave-alone",
        text: "Leave Mr Green at the exit and travel to the family emergency",
        answerCategory: "inappropriate",
      },
      {
        id: "simple-explain",
        text: "Explain briefly that he needs to get help while waiting for another volunteer",
        answerCategory: "appropriate",
      },
    ],
    explanation:
      "Jon should not leave Mr Green unsupported, but he can communicate calmly and seek a safe handover through the placement team.",
  },
  {
    id: "sjt-drag-category-access-001",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "sjt-results-phone-call",
    questionType: "drag-category",
    tags: ["text-stem", "set-based", "quick"],
    issueTags: ["confidentiality", "patient-safety", "integrity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Lena, a medical student, is helping at an outpatient desk when someone phones claiming to be a consultant from another hospital. The caller asks Lena to read out a patient's recent blood results because they say the patient is waiting in their clinic. Lena cannot verify the caller's identity from the information given.",
    ],
    question: "Drag each consideration to the side that best describes it.",
    instruction:
      "Classify each consideration as important or unimportant when deciding how to respond.",
    categories: [
      { id: "important", label: "Important" },
      { id: "unimportant", label: "Unimportant" },
    ],
    categoryItems: [
      {
        id: "verify-identity",
        text: "Whether Lena can confirm the caller's identity and authority",
        answerCategory: "important",
      },
      {
        id: "restricted-area",
        text: "That patient results must only be shared through approved channels",
        answerCategory: "important",
      },
      {
        id: "well-dressed",
        text: "That the caller sounds senior and confident",
        answerCategory: "unimportant",
      },
    ],
    explanation:
      "Confidence on the phone does not prove authority. Lena should follow local information-sharing procedures and seek staff help.",
  },
  {
    id: "sjt-drag-category-teamwork-001",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "sjt-health-stall-advice",
    questionType: "drag-category",
    tags: ["text-stem", "set-based", "quick"],
    issueTags: ["patient-safety", "communication", "teamwork"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "At a health promotion stall, a student begins giving confident but inaccurate advice about antibiotics to a visitor. The visitor is reassured and is about to leave. You have an approved information leaflet on the table.",
    ],
    question: "Drag each response to the side that best describes it.",
    instruction:
      "Classify each response as appropriate or inappropriate in this situation.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      {
        id: "pause-correct",
        text: "Politely pause the conversation and clarify the advice using the approved leaflet",
        answerCategory: "appropriate",
      },
      {
        id: "ignore",
        text: "Let the visitor leave because correcting the student might embarrass them",
        answerCategory: "inappropriate",
      },
      {
        id: "private-follow-up",
        text: "Speak privately with the student afterwards about checking information before advising visitors",
        answerCategory: "appropriate",
      },
    ],
    explanation:
      "The visitor should not leave with misinformation. The student can be corrected respectfully and followed up privately.",
  },
  {
    id: "sjt-drag-category-consent-001",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "sjt-consent-discussion",
    questionType: "drag-category",
    tags: ["text-stem", "set-based", "quick"],
    issueTags: ["autonomy", "capacity-consent", "respect-dignity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "A patient says they do not want a student present during a wound dressing change. The nurse looks rushed and tells the student to stay because it will be useful learning experience.",
    ],
    question: "Drag each response to the side that best describes it.",
    instruction:
      "Classify each response as appropriate or inappropriate in this situation.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      {
        id: "respect-request",
        text: "Respect the patient's request and leave unless the patient changes their mind",
        answerCategory: "appropriate",
      },
      {
        id: "stay-learning",
        text: "Stay because student learning is an important part of healthcare",
        answerCategory: "inappropriate",
      },
      {
        id: "ask-supervisor",
        text: "Discuss the situation with the nurse or supervisor afterwards",
        answerCategory: "appropriate",
      },
    ],
    explanation:
      "Patient autonomy and consent come before learning opportunities. The student can later discuss how to manage similar situations.",
  },
  {
    id: "sjt-ordering-dizzy-patient-001",
    section: "sjt",
    subtype: "sjt-ordering",
    setId: "sjt-dizzy-patient-order",
    questionType: "drag-order",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: ["patient-safety", "escalation", "communication"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "During a GP placement, you are helping at reception when an elderly patient says they feel faint. Another patient is annoyed about waiting and asks you to check their appointment time.",
    ],
    question:
      "Drag the actions into the most appropriate order, from first to last.",
    instruction:
      "Prioritise immediate safety before administrative concerns.",
    dragItems: [
      { id: "seat", text: "Make sure the dizzy patient is safely seated" },
      { id: "alert", text: "Alert reception or a clinician immediately" },
      { id: "reassure", text: "Acknowledge the waiting patient's concern calmly" },
      { id: "check", text: "Check or ask reception to check the appointment time" },
    ],
    answerOrder: ["seat", "alert", "reassure", "check"],
    explanation:
      "Immediate patient safety comes first, then escalation. The waiting patient's concern should be acknowledged, but checking times comes after the urgent risk is managed.",
  },
  {
    id: "sjt-ordering-comments-001",
    section: "sjt",
    subtype: "sjt-ordering",
    setId: "sjt-comments-order",
    questionType: "drag-order",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: ["respect-dignity", "communication", "escalation"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "A colleague repeatedly makes disrespectful comments about patients during placement. You have tried changing the subject once, but the behaviour continues.",
    ],
    question:
      "Drag the responses into the most appropriate order, from first to last.",
    instruction:
      "Respond respectfully while making sure the behaviour is addressed.",
    dragItems: [
      { id: "private", text: "Speak to the colleague privately and explain the concern" },
      { id: "specific", text: "Give a specific example of why the comments are inappropriate" },
      { id: "document", text: "Make a brief note of what happened if the behaviour continues" },
      { id: "escalate", text: "Seek advice from a supervisor if it does not improve" },
    ],
    answerOrder: ["private", "specific", "document", "escalate"],
    explanation:
      "A private and specific conversation is usually the first step. If the behaviour continues, documenting and escalating protects patients and professionalism.",
  },
  {
    id: "sjt-ordering-medication-error-001",
    section: "sjt",
    subtype: "sjt-ordering",
    setId: "sjt-error-order",
    questionType: "drag-order",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: ["candour", "patient-safety", "escalation"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "You notice that a patient may have received the wrong dose of a medication. You are not involved in prescribing, but you can see the drug chart and the patient is still on the ward.",
    ],
    question:
      "Drag the actions into the most appropriate order, from first to last.",
    instruction:
      "Prioritise patient safety, then openness and documentation through the proper team.",
    dragItems: [
      { id: "alert", text: "Immediately alert the nurse or doctor responsible for the patient" },
      { id: "facts", text: "Share the specific chart information that made you concerned" },
      { id: "follow", text: "Ask what follow-up or documentation is needed within local policy" },
      { id: "reflect", text: "Reflect on the event with your supervisor afterwards" },
    ],
    answerOrder: ["alert", "facts", "follow", "reflect"],
    explanation:
      "Potential medication harm should be escalated immediately with clear facts. Follow-up and reflection matter, but they come after urgent safety action.",
  },
];
