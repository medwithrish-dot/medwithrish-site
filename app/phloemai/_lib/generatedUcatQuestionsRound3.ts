import type {
  UCATChartVisual,
  UCATOptionKey,
  UCATQuestion,
  UCATQuestionTag,
  UCATSjtIssueTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

const OPTION_KEYS: UCATOptionKey[] = ["A", "B", "C", "D"];

const TFC_OPTIONS = [
  { key: "A" as const, text: "True" },
  { key: "B" as const, text: "False" },
  { key: "C" as const, text: "Can't tell" },
];

const IMPORTANCE_OPTIONS = [
  { key: "A" as const, text: "Very important" },
  { key: "B" as const, text: "Important" },
  { key: "C" as const, text: "Of minor importance" },
  { key: "D" as const, text: "Not important at all" },
];

const APPROPRIATENESS_OPTIONS = [
  { key: "A" as const, text: "A very appropriate thing to do" },
  { key: "B" as const, text: "Appropriate, but not ideal" },
  { key: "C" as const, text: "Inappropriate, but not awful" },
  { key: "D" as const, text: "A very inappropriate thing to do" },
];

function formatWhole(value: number) {
  return value.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function formatNumber(value: number, decimals = 1) {
  if (Number.isInteger(value)) return formatWhole(value);
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatMoney(value: number) {
  return Number.isInteger(value) ? `${formatWhole(value)} pounds` : `${value.toFixed(2)} pounds`;
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

function makeOptions(correctText: string, distractors: string[], seed: number) {
  const texts = distractors
    .filter((text, index) => text !== correctText && distractors.indexOf(text) === index)
    .slice(0, 3);

  while (texts.length < 3) {
    texts.push("Cannot be determined from the information given");
  }

  const answerIndex = seed % 4;
  texts.splice(answerIndex, 0, correctText);

  return {
    options: texts.map((text, index) => ({ key: OPTION_KEYS[index], text })),
    answer: OPTION_KEYS[answerIndex],
  };
}

function makeSingleQuestion(input: {
  id: string;
  section: UCATQuestion["section"];
  subtype: UCATSubtypeId;
  setId?: string;
  tags: UCATQuestionTag[];
  title: string;
  leftTitle: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  issueTags?: UCATSjtIssueTag[];
  question: string;
  correctText: string;
  distractors: string[];
  explanation: string;
  seed: number;
}): UCATQuestion {
  const { options, answer } = makeOptions(input.correctText, input.distractors, input.seed);

  return {
    id: input.id,
    section: input.section,
    subtype: input.subtype,
    setId: input.setId,
    tags: input.tags,
    title: input.title,
    leftTitle: input.leftTitle,
    stimulus: input.stimulus,
    visual: input.visual,
    issueTags: input.issueTags,
    question: input.question,
    options,
    answer,
    explanation: input.explanation,
  };
}

function vrSkillTag(subtype: UCATSubtypeId): UCATQuestionTag {
  if (subtype === "vr-detail") return "detail-retrieval";
  if (subtype === "vr-inference") return "inference-question";
  if (subtype === "vr-author") return "author-opinion";
  if (subtype === "vr-negative") return "negative-except";
  return "summary-structure";
}

type TfcItem = [string, UCATOptionKey, string];
type TfcSet = { setId: string; stimulus: string[]; items: TfcItem[] };

const VR_TFC_SETS: TfcSet[] = [
  {
    setId: "vr-round3-tfc-book-lockers",
    stimulus: [
      "A college library introduced temporary book lockers for students who could not collect reserved books during staffed hours. The lockers were installed beside the main entrance and opened using codes sent by email. Students still had to return books through the usual returns slot.",
      "The trial was most popular during exam weeks, although staff said the lockers did not reduce all queuing because many students still needed help finding references. A permanent scheme would require weatherproof labels and a larger sheltered area.",
    ],
    items: [
      ["The lockers opened using codes sent by email.", "A", "The passage says the lockers opened using email codes."],
      ["Students returned books through the lockers.", "B", "Students still had to use the usual returns slot."],
      ["The lockers removed all queuing in the library.", "B", "Staff said the lockers did not reduce all queuing."],
      ["The permanent scheme was approved before the trial ended.", "C", "The passage gives requirements for a permanent scheme but not whether it was approved."],
    ],
  },
  {
    setId: "vr-round3-tfc-mobile-dentistry",
    stimulus: [
      "A mobile dental van visited three rural schools during one term. It offered screening appointments and oral-health teaching but did not provide fillings. Children requiring treatment were referred to local clinics.",
      "Attendance was higher when consent forms were sent by text as well as paper. The organisers said the van helped identify unmet need, but travel between schools limited the number of appointments each day.",
    ],
    items: [
      ["The van provided fillings at the schools.", "B", "The passage states that fillings were not provided."],
      ["Children requiring treatment were referred to local clinics.", "A", "This is stated in the first paragraph."],
      ["Text reminders were associated with higher attendance.", "A", "Attendance was higher when forms were sent by text as well as paper."],
      ["The van visited every rural school in the county.", "C", "The passage says it visited three rural schools, not all rural schools."],
    ],
  },
  {
    setId: "vr-round3-tfc-music-loans",
    stimulus: [
      "A community orchestra began lending instruments to adult beginners. Borrowers paid a refundable deposit and attended a short care session before taking an instrument home. The scheme excluded percussion because storage space was limited.",
      "After six months, violins were borrowed most often, but clarinets had the longest waiting list. Organisers planned to seek donations of cases before expanding the scheme.",
    ],
    items: [
      ["Borrowers attended a care session before taking an instrument home.", "A", "The first paragraph states this."],
      ["Percussion instruments were included in the lending scheme.", "B", "Percussion was excluded because storage was limited."],
      ["Clarinets had the longest waiting list.", "A", "The second paragraph states this."],
      ["The orchestra had already received enough donated cases for expansion.", "C", "It planned to seek donations, but the result is not given."],
    ],
  },
  {
    setId: "vr-round3-tfc-wetland-boardwalk",
    stimulus: [
      "A wildlife reserve replaced a muddy path with a raised boardwalk. The boardwalk was designed to protect reed beds and improve access for visitors using wheelchairs or pushchairs. Dogs were still restricted during nesting season.",
      "Visitor numbers increased in the first spring after installation. Rangers said this could reflect the new path, but also unusually dry weekends and a local photography exhibition.",
    ],
    items: [
      ["The boardwalk was intended to protect reed beds.", "A", "The passage gives reed-bed protection as one purpose."],
      ["Dogs were allowed without restriction during nesting season.", "B", "Dogs were still restricted during nesting season."],
      ["Visitor numbers increased in the first spring after installation.", "A", "The second paragraph states this."],
      ["The rise in visitors was definitely caused only by the boardwalk.", "B", "Rangers noted other possible factors, so it was not definitely caused only by the boardwalk."],
    ],
  },
];

const ROUND_THREE_VR_TFC: UCATQuestion[] = VR_TFC_SETS.flatMap((set) =>
  set.items.map(([statement, answer, explanation], index) => ({
    id: `${set.setId}-${index + 1}`,
    section: "vr" as const,
    subtype: "vr-tfc" as const,
    setId: set.setId,
    tags: ["true-false-cant-tell", index < 2 ? "easy" : "medium", "text-stem"] as UCATQuestionTag[],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: set.stimulus,
    question: `${statement} According to the passage, this statement is:`,
    options: TFC_OPTIONS,
    answer,
    explanation,
  }))
);

type VrMcqItem = [UCATSubtypeId, string, string, string[], string];
type VrMcqSet = { setId: string; stimulus: string[]; items: VrMcqItem[] };

const VR_MCQ_SETS: VrMcqSet[] = [
  {
    setId: "vr-round3-museum-labels",
    stimulus: [
      "A museum rewrote object labels after visitors said the old labels assumed too much prior knowledge. The new labels used shorter sentences and included a single question intended to prompt closer looking. Curators kept technical terms when removing them would make the description less accurate.",
      "Feedback improved among first-time visitors, but subject specialists sometimes wanted more detail. The museum added QR codes to longer notes rather than lengthening every label.",
    ],
    items: [
      ["vr-detail", "Why were the labels rewritten?", "Visitors said the old labels assumed too much prior knowledge.", ["Specialists asked for fewer details.", "QR codes had stopped working.", "Objects were moved to storage."], "The opening sentence gives the reason."],
      ["vr-detail", "What did the new labels include to encourage closer looking?", "A single question.", ["A map of the city.", "A glossary on every line.", "A booking code."], "The new labels included a single question."],
      ["vr-inference", "Which inference is best supported?", "The museum tried to balance accessibility with accuracy.", ["Technical terms were banned in all labels.", "Specialist visitors were ignored completely.", "Every label was made longer."], "Labels were simplified, but technical terms were retained where accuracy required them."],
      ["vr-summary", "Which is the best summary?", "The museum simplified labels while using QR codes for visitors wanting more depth.", ["The museum removed all specialist information.", "The museum stopped collecting visitor feedback.", "The museum replaced objects with QR codes."], "The passage focuses on shorter labels plus optional longer notes."],
    ],
  },
  {
    setId: "vr-round3-cafe-noise",
    stimulus: [
      "A hospital cafe trialled a quieter lunch hour after staff reported that patients waiting for transport found the room overwhelming. During the hour, music was switched off and staff avoided using the blender except for urgent dietary requests.",
      "Sales fell slightly during the trial, but complaints about noise also fell. Managers decided to continue the quiet hour twice a week while reviewing whether clearer signs could prevent confusion about the blender policy.",
    ],
    items: [
      ["vr-detail", "What change was made to music during the quiet hour?", "It was switched off.", ["It was made louder.", "It was replaced by announcements.", "It was played only near the blender."], "The passage says music was switched off."],
      ["vr-inference", "What can be inferred about the trial?", "It involved a trade-off between comfort and sales.", ["Sales rose sharply.", "Noise complaints increased.", "The blender was banned for all requests."], "Sales fell slightly, while noise complaints also fell."],
      ["vr-author", "How are managers presented?", "As willing to continue the idea while adjusting communication.", ["As unwilling to consider patient comfort.", "As certain the policy needed no review.", "As focused only on music licensing."], "They continued the quiet hour and reviewed signs."],
      ["vr-negative", "Which statement is not supported?", "The quiet hour operated every lunchtime permanently.", ["Complaints about noise fell.", "Sales fell slightly.", "Urgent dietary requests could still use the blender."], "The passage says managers continued it twice a week."],
    ],
  },
  {
    setId: "vr-round3-rainwater-schools",
    stimulus: [
      "Several primary schools installed rainwater tanks to supply garden taps. The tanks were not connected to drinking fountains, and pupils were taught that the stored water was only for plants. Caretakers checked filters each Monday.",
      "The first summer showed lower mains-water use in school gardens. However, two schools ran out of stored water during a dry fortnight, so the project team recommended larger tanks only where roof area was sufficient.",
    ],
    items: [
      ["vr-detail", "What was the stored rainwater used for?", "Watering plants.", ["Drinking fountains.", "Cleaning classrooms.", "Swimming pools."], "Pupils were taught it was only for plants."],
      ["vr-inference", "Why was roof area relevant to larger tanks?", "A larger tank is useful only if enough rain can be collected.", ["Roof area determined pupil numbers.", "Filters were checked on roofs daily.", "Drinking fountains needed larger roofs."], "The recommendation links larger tanks to sufficient roof area."],
      ["vr-author", "Which statement best reflects the project team's view?", "Expansion should depend on site conditions.", ["Every school should install the largest tank.", "Rainwater should replace all mains water.", "Filter checks are unnecessary."], "They recommended larger tanks only where roof area was sufficient."],
      ["vr-negative", "Which statement is not stated?", "Caretakers checked filters every day.", ["Filters were checked each Monday.", "Two schools ran out of stored water.", "Garden mains-water use fell."], "The passage says filters were checked each Monday."],
    ],
  },
  {
    setId: "vr-round3-late-clinic-texts",
    stimulus: [
      "A physiotherapy department tested text messages that warned patients if a clinic was running more than twenty minutes late. The message offered patients the option to arrive later, but it did not change their appointment order.",
      "Reception staff reported fewer repeated questions at the desk. Some patients still arrived at the original time because they preferred to wait indoors, especially on cold days.",
    ],
    items: [
      ["vr-detail", "When were delay texts sent?", "When the clinic was running more than twenty minutes late.", ["For every appointment.", "Only after patients arrived.", "When patients requested a new order."], "The first sentence states the threshold."],
      ["vr-inference", "Which inference is best supported?", "The texts gave patients flexibility without changing clinical priority.", ["The texts cancelled delayed appointments.", "All patients chose to arrive later.", "Reception questions increased."], "Patients could arrive later, but appointment order did not change."],
      ["vr-author", "How is the text system mainly presented?", "As helpful but not useful for every patient's preference.", ["As harmful to all patients.", "As a replacement for reception staff.", "As a way to change appointment order."], "It reduced desk questions, but some patients still arrived at the original time."],
      ["vr-summary", "Which title best fits the passage?", "Delay Texts and Patient Choice in a Late Clinic", ["Why Physiotherapy Clinics Closed Reception", "How Appointment Order Was Randomised", "The End of Indoor Waiting Areas"], "The passage is about delay texts and patients' arrival choices."],
    ],
  },
  {
    setId: "vr-round3-street-trees",
    stimulus: [
      "A neighbourhood group mapped empty tree pits on residential streets. Volunteers recorded whether each pit had compacted soil, nearby underground covers or space for a guard. The group wanted to identify realistic planting locations before applying for funding.",
      "The map showed that many empty pits were unsuitable without pavement repairs. The group therefore proposed a smaller first phase, arguing that planting fewer trees successfully would build trust for later work.",
    ],
    items: [
      ["vr-detail", "What did volunteers record?", "Whether pits had compacted soil, underground covers or space for a guard.", ["The age of every existing tree.", "Residents' household income.", "Car speeds on main roads."], "These three features are listed in the first paragraph."],
      ["vr-inference", "Why did the group propose a smaller first phase?", "Many sites needed repairs before they were realistic planting locations.", ["Funding had already been refused.", "No residents wanted trees.", "All empty pits were immediately suitable."], "Many empty pits were unsuitable without pavement repairs."],
      ["vr-author", "What attitude does the group show?", "Pragmatic and focused on achievable success.", ["Indifferent to whether trees survive.", "Determined to plant every empty pit immediately.", "Opposed to later work."], "They prefer fewer successful plantings to build trust."],
      ["vr-negative", "Which statement is not supported?", "The group had already completed all later planting phases.", ["The group mapped empty tree pits.", "Some pits needed pavement repairs.", "The group planned to apply for funding."], "Later phases are only mentioned as future work."],
    ],
  },
  {
    setId: "vr-round3-school-laundry",
    stimulus: [
      "A boarding school installed a laundry booking app after pupils complained that machines were often occupied when they carried clothes downstairs. The app showed machine availability but did not reserve machines unless pupils selected a time slot.",
      "Use of the app was highest on Sundays. Staff noticed fewer disputes in the laundry room, although forgotten bookings still caused frustration. The school added automatic reminders before each reserved slot.",
    ],
    items: [
      ["vr-detail", "What did pupils need to do to reserve a machine?", "Select a time slot.", ["Carry clothes downstairs first.", "Ask staff to unlock the app.", "Wait until Sunday."], "The app did not reserve machines unless pupils selected a time slot."],
      ["vr-inference", "Which inference is best supported?", "The app helped some disputes but did not remove every source of frustration.", ["The laundry room closed on Sundays.", "Forgotten bookings improved availability.", "Pupils stopped using machines."], "There were fewer disputes, but forgotten bookings still frustrated pupils."],
      ["vr-summary", "What is the main role of the second paragraph?", "To report early effects of the app and a later adjustment.", ["To explain how washing machines are manufactured.", "To argue that pupils should not do laundry.", "To describe the school's uniform policy."], "It gives app use patterns, effects and reminders."],
      ["vr-negative", "Which statement is not supported?", "The app automatically reserved machines without pupil action.", ["Use was highest on Sundays.", "Staff noticed fewer disputes.", "Reminders were added before reserved slots."], "Pupils had to select a time slot to reserve machines."],
    ],
  },
  {
    setId: "vr-round3-theatre-relaxed",
    stimulus: [
      "A theatre introduced relaxed rehearsals for a youth production. Participants could request breaks, and the director sent scene outlines in advance. The script itself was not shortened.",
      "Parents reported that the outlines reduced anxiety for some participants. The director said the approach required more planning, but fewer rehearsal minutes were lost to last-minute confusion.",
    ],
    items: [
      ["vr-detail", "What did the director send in advance?", "Scene outlines.", ["Shortened scripts.", "Ticket refunds.", "Costume measurements."], "The passage says scene outlines were sent in advance."],
      ["vr-inference", "Which inference is best supported?", "Preparation before rehearsal helped reduce confusion during rehearsal.", ["The script became shorter.", "Break requests were banned.", "Parents disliked the outlines."], "Fewer minutes were lost to last-minute confusion."],
      ["vr-author", "How is the approach mainly presented?", "Beneficial for some participants but requiring extra planning.", ["Effortless for the director.", "Unhelpful to anxious participants.", "A replacement for rehearsals."], "Parents reported reduced anxiety, while the director noted more planning."],
      ["vr-summary", "Which is the best summary?", "Advance information and flexible breaks supported rehearsals without changing the script.", ["The production was cancelled after parents complained.", "The script was shortened to reduce rehearsal planning.", "Participants stopped requesting breaks."], "The passage describes supports while stating the script was not shortened."],
    ],
  },
];

const ROUND_THREE_VR_MCQ: UCATQuestion[] = VR_MCQ_SETS.flatMap((set, setIndex) =>
  set.items.map(([subtype, question, correctText, distractors, explanation], itemIndex) =>
    makeSingleQuestion({
      id: `${set.setId}-${itemIndex + 1}`,
      section: "vr",
      subtype,
      setId: set.setId,
      tags: [vrSkillTag(subtype), itemIndex === 0 ? "easy" : "medium", "text-stem"],
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: set.stimulus,
      question,
      correctText,
      distractors,
      explanation,
      seed: setIndex + itemIndex,
    })
  )
);

export const ROUND_THREE_VR_QUESTIONS: UCATQuestion[] = [
  ...ROUND_THREE_VR_TFC,
  ...ROUND_THREE_VR_MCQ,
];

function makeSyllogism(input: {
  id: string;
  stimulus: string;
  tags: UCATQuestionTag[];
  items: Array<{ id: string; text: string; answerCategory: "yes" | "no" }>;
  explanation: string;
}): UCATQuestion {
  return {
    id: input.id,
    section: "dm",
    subtype: "dm-syllogisms",
    questionType: "drag-category",
    tags: input.tags,
    title: "Decision Making Practice",
    leftTitle: "Syllogism",
    stimulus: [input.stimulus],
    question: "Drag each conclusion to Yes if it follows, or No if it does not follow.",
    instruction: "Use only the information given.",
    categories: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    categoryItems: input.items,
    explanation: input.explanation,
  };
}

const ROUND_THREE_DM_SYLLOGISMS: UCATQuestion[] = [
  makeSyllogism({
    id: "dm-round3-syllogisms-001",
    stimulus:
      "All bronze keys open the archive room. No archive-room key opens the medicine cupboard. Some cupboard keys have red tags. Key L is bronze.",
    tags: ["easy", "quick", "text-stem"],
    items: [
      { id: "l-archive", text: "Key L opens the archive room.", answerCategory: "yes" },
      { id: "l-cupboard", text: "Key L opens the medicine cupboard.", answerCategory: "no" },
      { id: "red-cupboard", text: "Some red-tagged keys open the medicine cupboard.", answerCategory: "yes" },
      { id: "bronze-red", text: "Key L has a red tag.", answerCategory: "no" },
      { id: "all-archive-bronze", text: "All archive-room keys are bronze.", answerCategory: "no" },
    ],
    explanation:
      "Key L inherits archive-room access from being bronze, and archive-room keys do not open the cupboard. The other relationships do not reverse.",
  }),
  makeSyllogism({
    id: "dm-round3-syllogisms-002",
    stimulus:
      "Every weekday courier uses a numbered pouch. Some numbered pouches are checked twice. No pouch checked twice is stored overnight. Courier R works on weekdays.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "r-pouch", text: "Courier R uses a numbered pouch.", answerCategory: "yes" },
      { id: "r-checked", text: "Courier R's pouch is checked twice.", answerCategory: "no" },
      { id: "checked-not-overnight", text: "No pouch checked twice is stored overnight.", answerCategory: "yes" },
      { id: "some-numbered-not-overnight", text: "Some numbered pouches are not stored overnight.", answerCategory: "yes" },
      { id: "weekday-not-overnight", text: "No weekday courier's pouch is stored overnight.", answerCategory: "no" },
    ],
    explanation:
      "R uses a numbered pouch. Some numbered pouches are checked twice, and those are not stored overnight, but R's pouch need not be one of them.",
  }),
  makeSyllogism({
    id: "dm-round3-syllogisms-003",
    stimulus:
      "All festival maps are folded. Every folded leaflet is either recycled or kept at the desk. No recycled leaflet is laminated. Map Q is laminated.",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    items: [
      { id: "q-not-recycled", text: "Map Q is not recycled.", answerCategory: "yes" },
      { id: "q-desk-if-festival", text: "If Map Q is a festival map, it is kept at the desk.", answerCategory: "yes" },
      { id: "all-folded-laminated", text: "Every folded leaflet is laminated.", answerCategory: "no" },
      { id: "festival-folded", text: "All festival maps are folded.", answerCategory: "yes" },
      { id: "recycled-desk", text: "All recycled leaflets are kept at the desk.", answerCategory: "no" },
    ],
    explanation:
      "A laminated item cannot be recycled. If Q is a festival map, it is folded and therefore recycled or kept at the desk; since it is not recycled, it must be kept at the desk.",
  }),
  makeSyllogism({
    id: "dm-round3-syllogisms-004",
    stimulus:
      "Some blue badges are staff badges. All staff badges allow basement access. No badge with basement access is temporary. Badge M is temporary.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "some-blue-basement", text: "Some blue badges allow basement access.", answerCategory: "yes" },
      { id: "some-blue-not-temporary", text: "Some blue badges are not temporary.", answerCategory: "yes" },
      { id: "m-staff", text: "Badge M is a staff badge.", answerCategory: "no" },
      { id: "all-blue-staff", text: "All blue badges are staff badges.", answerCategory: "no" },
      { id: "basement-not-temporary", text: "No badge with basement access is temporary.", answerCategory: "yes" },
    ],
    explanation:
      "Some blue badges are staff badges and therefore have basement access; basement-access badges are not temporary. M is temporary, so it cannot be a staff badge.",
  }),
  makeSyllogism({
    id: "dm-round3-syllogisms-005",
    stimulus:
      "No quiet-study booking includes group tables. All group-table bookings include a projector. Some projector bookings are made online. Booking P is a quiet-study booking.",
    tags: ["easy", "multi-step", "text-stem"],
    items: [
      { id: "p-no-group", text: "Booking P does not include group tables.", answerCategory: "yes" },
      { id: "p-projector", text: "Booking P includes a projector.", answerCategory: "no" },
      { id: "some-projector-online", text: "Some projector bookings are made online.", answerCategory: "yes" },
      { id: "group-projector", text: "All group-table bookings include a projector.", answerCategory: "yes" },
      { id: "online-group", text: "Some online bookings include group tables.", answerCategory: "no" },
    ],
    explanation:
      "P is quiet-study, so it has no group tables. Projector and online information does not prove anything about P or online group-table bookings.",
  }),
  makeSyllogism({
    id: "dm-round3-syllogisms-006",
    stimulus:
      "Every ceramic sample is heat-tested. No heat-tested sample is stored in Tray 5. Some samples in Tray 5 are marked urgent. Sample Z is ceramic.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "z-tested", text: "Sample Z is heat-tested.", answerCategory: "yes" },
      { id: "z-not-tray5", text: "Sample Z is not stored in Tray 5.", answerCategory: "yes" },
      { id: "urgent-tray5", text: "Some urgent samples are stored in Tray 5.", answerCategory: "yes" },
      { id: "z-urgent", text: "Sample Z is marked urgent.", answerCategory: "no" },
      { id: "all-tested-ceramic", text: "All heat-tested samples are ceramic.", answerCategory: "no" },
    ],
    explanation:
      "Z is ceramic, so heat-tested, and heat-tested samples are not in Tray 5. Urgent Tray 5 samples are unrelated to Z.",
  }),
];

type GeneratedMcqRow = [string, string, string, string, string[], string];

const DM_LOGIC_ROWS: GeneratedMcqRow[] = [
  ["dm-round3-logic-001", "Four tutors, Asha, Ben, Cara and Dev, each supervise one slot: 9:00, 10:00, 11:00 and 12:00. Asha is before Cara. Ben is immediately after Dev. Cara is not at 12:00.", "Who supervises at 12:00?", "Ben", ["Asha", "Cara", "Dev"], "Cara cannot be 12:00 and must be after Asha. Dev and Ben must be consecutive, leaving Dev at 11:00 and Ben at 12:00."],
  ["dm-round3-logic-002", "Five folders, F, G, H, J and K, are placed from top to bottom. F is immediately above H. K is below G. J is not top or bottom. H is not third.", "Which folder could be top?", "G", ["F", "H", "J"], "F cannot be top because that would put H third. J is not top, H cannot be top with F above it, so G can be top."],
  ["dm-round3-logic-003", "Nora, Oren and Priya each use one room: 1, 2 or 3, and each tests one material: glass, metal or wood. Wood is tested in Room 3. Nora is not in Room 1. Oren's room number is lower than the glass test room.", "Who tests metal?", "Oren", ["Nora", "Priya", "Cannot tell"], "Glass must be in Room 2 or 3, and Oren must be lower. Wood is Room 3, so glass is Room 2 and Oren is Room 1, leaving metal for Oren."],
  ["dm-round3-logic-004", "A code contains R, S, T and U once each. R is before U. T is immediately before S. U is not last.", "Which sequence is possible?", "R T S U", ["T S U R", "R U T S", "S T R U"], "Only R T S U keeps R before U, places T immediately before S, and avoids U being last."],
  ["dm-round3-logic-005", "Four runners finish 1st to 4th. Imani finishes before Jade. Kai finishes immediately after Luis. Jade is not 4th. Luis finishes after Imani.", "Who finishes 2nd?", "Luis", ["Imani", "Jade", "Kai"], "Imani must be 1st. Luis and Kai are consecutive after Imani, and Jade cannot be 4th, so the order is Imani, Luis, Kai, Jade."],
  ["dm-round3-logic-006", "Four boxes A, B, C and D are loaded in positions 1 to 4. A is earlier than C. B is not adjacent to A. D is immediately before B.", "Which box is in position 4?", "B", ["A", "C", "D"], "D and B must be consecutive. B cannot be adjacent to A, and A must be before C. The valid order is A, C, D, B."],
];

const ROUND_THREE_DM_LOGIC = DM_LOGIC_ROWS.map(
  ([id, stimulus, question, correctText, distractors, explanation], index) =>
    makeSingleQuestion({
      id,
      section: "dm",
      subtype: "dm-logic",
      tags: ["hard", "time-consuming", "multi-step", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [stimulus],
      question,
      correctText,
      distractors,
      explanation,
      seed: index,
    })
);

const ROUND_THREE_DM_ARGUMENTS = [
  ["A clinic is considering whether appointment reminders should include the exact entrance to use.", "Yes, because naming the entrance could reduce late arrivals and unnecessary wandering for patients."],
  ["A college is considering whether students should receive basic training before using shared laboratory equipment.", "Yes, because training can reduce avoidable damage and safety risks."],
  ["A council is considering whether bus stops near hospitals should have clearer route maps.", "Yes, because clearer maps may help patients and visitors choose the correct bus under time pressure."],
  ["A school is considering whether exam rooms should display analogue and digital clocks.", "Yes, because using both formats could make time remaining clearer for more candidates."],
  ["A library is considering whether to reserve some computers for job applications during weekday mornings.", "Yes, because dedicated access could support users completing time-sensitive applications."],
].map(([proposal, correctText], index) =>
  makeSingleQuestion({
    id: `dm-round3-arguments-00${index + 1}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["easy", "quick", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Argument",
    stimulus: [proposal],
    question: "Select the strongest argument from the statements below.",
    correctText,
    distractors: [
      "Yes, because signs can be printed on many materials.",
      "No, because some people prefer blue chairs.",
      "No, because the building may have windows.",
    ],
    explanation:
      "The strongest argument directly addresses the proposal with a relevant practical consequence. The other options do not engage with the main issue.",
    seed: index,
  })
);

function makeDmYesNo(input: {
  id: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  statements: Array<{ id: string; text: string; answer: "Yes" | "No" }>;
  explanation: string;
}): UCATQuestion {
  return {
    id: input.id,
    section: "dm",
    subtype: "dm-yes-no",
    questionType: "yes-no",
    tags: ["easy", "time-consuming", "multi-step", input.visual ? "data-display" : "text-stem"],
    title: "Decision Making Practice",
    leftTitle: input.visual ? "Data" : "Information",
    stimulus: input.stimulus,
    visual: input.visual,
    question:
      "Place 'Yes' if the conclusion does follow. Place 'No' if the conclusion does not follow.",
    instruction: "Use only the information given.",
    yesNoStatements: input.statements,
    explanation: input.explanation,
  };
}

const ROUND_THREE_DM_YES_NO: UCATQuestion[] = [
  makeDmYesNo({
    id: "dm-round3-yes-no-001",
    stimulus: ["A recycling centre recorded bags sorted by four teams in one shift."],
    visual: {
      type: "table",
      title: "Sorting shift",
      headers: ["Team", "Hours", "Bags sorted"],
      rows: [["A", "4", "76"], ["B", "5", "90"], ["C", "3", "63"], ["D", "6", "102"]],
    },
    statements: [
      { id: "c-rate", text: "Team C sorted the most bags per hour.", answer: "Yes" },
      { id: "d-total", text: "Team D sorted the greatest total number of bags.", answer: "Yes" },
      { id: "a-b-rate", text: "Teams A and B sorted bags at the same hourly rate.", answer: "No" },
      { id: "all-over-16", text: "Every team sorted more than 16 bags per hour.", answer: "Yes" },
      { id: "ab-combined", text: "Teams A and B sorted more than 160 bags combined.", answer: "Yes" },
    ],
    explanation:
      "Hourly rates are A 19, B 18, C 21 and D 17. A and B sorted 166 bags combined.",
  }),
  makeDmYesNo({
    id: "dm-round3-yes-no-002",
    stimulus: ["A community hall sold tickets for three events."],
    visual: {
      type: "table",
      title: "Ticket sales",
      headers: ["Event", "Tickets", "Price"],
      rows: [["Film", "90", "6 pounds"], ["Talk", "70", "8 pounds"], ["Workshop", "45", "12 pounds"]],
    },
    statements: [
      { id: "film-540", text: "Film tickets raised 540 pounds.", answer: "Yes" },
      { id: "talk-most", text: "Talk tickets raised the most revenue.", answer: "Yes" },
      { id: "workshop-fewest", text: "Workshop sold the fewest tickets.", answer: "Yes" },
      { id: "total-1640", text: "Total revenue was 1,640 pounds.", answer: "Yes" },
      { id: "film-half", text: "Film tickets made up more than half of all tickets sold.", answer: "No" },
    ],
    explanation:
      "Revenue is Film 540, Talk 560 and Workshop 540, totalling 1,640. Film tickets are 90 of 205, less than half.",
  }),
  makeDmYesNo({
    id: "dm-round3-yes-no-003",
    stimulus: ["A reservoir holds 2,400 litres when full. It starts 55% full, receives 360 litres and then loses 180 litres through use."],
    statements: [
      { id: "start-1320", text: "The reservoir starts with 1,320 litres.", answer: "Yes" },
      { id: "after-add", text: "After receiving water, it contains 1,680 litres.", answer: "Yes" },
      { id: "final", text: "After use, it contains 1,500 litres.", answer: "Yes" },
      { id: "overflows", text: "The reservoir overflows.", answer: "No" },
      { id: "final-over-half", text: "The final amount is more than half full.", answer: "Yes" },
    ],
    explanation:
      "55% of 2,400 is 1,320. Add 360 to get 1,680, then subtract 180 to get 1,500, which is above half full.",
  }),
  makeDmYesNo({
    id: "dm-round3-yes-no-004",
    stimulus: ["A training provider recorded course bookings and attendance."],
    visual: {
      type: "table",
      title: "Course attendance",
      headers: ["Course", "Booked", "Attended"],
      rows: [["First aid", "60", "54"], ["Safeguarding", "80", "60"], ["Manual handling", "50", "42"]],
    },
    statements: [
      { id: "first-aid-highest", text: "First aid had the highest attendance percentage.", answer: "Yes" },
      { id: "safeguarding-75", text: "Safeguarding attendance was 75% of bookings.", answer: "Yes" },
      { id: "manual-fewer", text: "Manual handling had fewer attendees than First aid.", answer: "Yes" },
      { id: "total-156", text: "A total of 156 people attended.", answer: "Yes" },
      { id: "all-over-80", text: "Every course had attendance above 80%.", answer: "No" },
    ],
    explanation:
      "Attendance percentages are First aid 90%, Safeguarding 75% and Manual handling 84%. Total attendance is 156.",
  }),
  makeDmYesNo({
    id: "dm-round3-yes-no-005",
    stimulus: ["Two printers work together. Printer A prints 52 pages per minute and Printer B prints 38 pages per minute. A job has 1,800 pages and both printers run for 15 minutes."],
    statements: [
      { id: "combined-90", text: "Together the printers produce 90 pages per minute.", answer: "Yes" },
      { id: "printed-1350", text: "In 15 minutes they print 1,350 pages.", answer: "Yes" },
      { id: "remaining-450", text: "450 pages remain after 15 minutes.", answer: "Yes" },
      { id: "completed", text: "The job is completed in 15 minutes.", answer: "No" },
      { id: "a-alone", text: "Printer A alone would print 780 pages in 15 minutes.", answer: "Yes" },
    ],
    explanation:
      "The combined rate is 90 pages per minute, so 15 minutes prints 1,350 pages, leaving 450. Printer A prints 52 x 15 = 780 pages.",
  }),
];

type VennConfig = {
  id: string;
  title: string;
  labels: [string, string, string];
  counts: { a: number; b: number; c: number; ab: number; ac: number; bc: number; abc: number };
  ask: "exactly-one" | "exactly-two" | "at-least-two" | "a-total" | "a-not-b";
};

function solveVenn(config: VennConfig) {
  const { a, b, c, ab, ac, bc, abc } = config.counts;
  if (config.ask === "exactly-one") return a + b + c;
  if (config.ask === "exactly-two") return ab + ac + bc;
  if (config.ask === "at-least-two") return ab + ac + bc + abc;
  if (config.ask === "a-total") return a + ab + ac + abc;
  return a + ac;
}

const VENN_CONFIGS: VennConfig[] = [
  { id: "dm-round3-venn-001", title: "Revision resources", labels: ["Videos", "Notes", "Questions"], counts: { a: 28, b: 24, c: 20, ab: 9, ac: 8, bc: 7, abc: 5 }, ask: "at-least-two" },
  { id: "dm-round3-venn-002", title: "Club attendance", labels: ["Drama", "Music", "Art"], counts: { a: 18, b: 22, c: 16, ab: 6, ac: 5, bc: 9, abc: 4 }, ask: "exactly-two" },
  { id: "dm-round3-venn-003", title: "Transport choices", labels: ["Bus", "Train", "Cycle"], counts: { a: 40, b: 30, c: 25, ab: 14, ac: 10, bc: 6, abc: 3 }, ask: "a-total" },
  { id: "dm-round3-venn-004", title: "Clinic services", labels: ["Advice", "Test", "Review"], counts: { a: 32, b: 26, c: 21, ab: 12, ac: 8, bc: 7, abc: 5 }, ask: "a-not-b" },
  { id: "dm-round3-venn-005", title: "Workshop roles", labels: ["Chair", "Notes", "Timing"], counts: { a: 15, b: 19, c: 17, ab: 5, ac: 4, bc: 6, abc: 2 }, ask: "exactly-one" },
  { id: "dm-round3-venn-006", title: "App features", labels: ["Calendar", "Chat", "Files"], counts: { a: 45, b: 35, c: 30, ab: 15, ac: 12, bc: 11, abc: 8 }, ask: "at-least-two" },
  { id: "dm-round3-venn-007", title: "Meal choices", labels: ["Vegetarian", "Spicy", "Gluten-free"], counts: { a: 26, b: 18, c: 15, ab: 7, ac: 9, bc: 4, abc: 3 }, ask: "exactly-two" },
  { id: "dm-round3-venn-008", title: "Study groups", labels: ["Morning", "Online", "Tutor-led"], counts: { a: 20, b: 27, c: 23, ab: 6, ac: 8, bc: 10, abc: 4 }, ask: "a-total" },
];

const ROUND_THREE_DM_VENN = VENN_CONFIGS.map((config, index) => {
  const correct = solveVenn(config);
  const questionText = {
    "exactly-one": "How many are in exactly one group?",
    "exactly-two": "How many are in exactly two groups?",
    "at-least-two": "How many are in at least two groups?",
    "a-total": `How many are in ${config.labels[0]}?`,
    "a-not-b": `How many are in ${config.labels[0]} but not ${config.labels[1]}?`,
  }[config.ask];

  return makeSingleQuestion({
    id: config.id,
    section: "dm",
    subtype: "dm-venn-sets",
    setId: config.id,
    tags: [index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard", "multi-step", "set-based", "data-display"],
    title: "Decision Making Practice",
    leftTitle: "Diagram",
    stimulus: [
      `The diagram shows items recorded in ${config.labels[0]}, ${config.labels[1]} and ${config.labels[2]}. Each number is an exact region.`,
    ],
    visual: {
      type: "set-diagram",
      title: config.title,
      shapes: [
        { id: "a", label: config.labels[0], shape: "circle", x: 85, y: 95, width: 260, height: 230 },
        { id: "b", label: config.labels[1], shape: "rectangle", x: 230, y: 95, width: 285, height: 210 },
        { id: "c", label: config.labels[2], shape: "triangle", x: 160, y: 45, width: 310, height: 310 },
      ],
      regionLabels: [
        { id: "a-only", text: String(config.counts.a), x: 130, y: 215 },
        { id: "b-only", text: String(config.counts.b), x: 455, y: 210 },
        { id: "c-only", text: String(config.counts.c), x: 315, y: 90 },
        { id: "ab", text: String(config.counts.ab), x: 270, y: 235 },
        { id: "ac", text: String(config.counts.ac), x: 225, y: 165 },
        { id: "bc", text: String(config.counts.bc), x: 380, y: 165 },
        { id: "abc", text: String(config.counts.abc), x: 305, y: 195 },
      ],
      legend: [
        { label: config.labels[0], shape: "circle" },
        { label: config.labels[1], shape: "rectangle" },
        { label: config.labels[2], shape: "triangle" },
      ],
    },
    question: questionText,
    correctText: String(correct),
    distractors: [
      String(correct + config.counts.abc),
      String(Math.max(0, correct - config.counts.abc)),
      String(config.counts.a + config.counts.b),
    ],
    explanation:
      "Use the exact-region wording and include only the regions requested by the question.",
    seed: index,
  });
});

const DM_PROBABILITY_ROWS: GeneratedMcqRow[] = [
  ["dm-round3-probability-001", "A bag contains 7 white beads and 5 black beads. Two beads are drawn without replacement.", "What is the probability that both beads are white?", "7/22", ["49/144", "35/132", "7/12"], "The probability is 7/12 x 6/11 = 42/132 = 7/22."],
  ["dm-round3-probability-002", "A message reaches 65% of members. Of those reached, 80% register for an event.", "What proportion of all members register after receiving the message?", "52%", ["65%", "80%", "45%"], "0.65 x 0.80 = 0.52, so 52%."],
  ["dm-round3-probability-003", "A spinner has 12 equal sections: 5 red, 4 blue, 2 green and 1 yellow.", "What is the probability of landing on red or green?", "7/12", ["5/12", "1/2", "2/3"], "Red or green covers 5 + 2 = 7 sections out of 12."],
  ["dm-round3-probability-004", "A drawer has 6 striped socks and 4 plain socks. Two socks are taken without replacement.", "What is the probability that the socks are one of each type?", "8/15", ["12/25", "4/15", "2/5"], "Striped then plain plus plain then striped is 6/10 x 4/9 + 4/10 x 6/9 = 48/90 = 8/15."],
  ["dm-round3-probability-005", "A check correctly identifies 92% of damaged parcels and incorrectly flags 6% of undamaged parcels. In a batch, 15% of parcels are damaged.", "What percentage of all parcels are expected to be flagged?", "18.9%", ["13.8%", "19.8%", "98%"], "Damaged flagged: 15% x 92% = 13.8%. Undamaged flagged: 85% x 6% = 5.1%. Total = 18.9%."],
];

const ROUND_THREE_DM_PROBABILITY = DM_PROBABILITY_ROWS.map(
  ([id, stimulus, question, correctText, distractors, explanation], index) =>
    makeSingleQuestion({
      id,
      section: "dm",
      subtype: "dm-probability-data",
      tags: ["easy", index > 2 ? "multi-step" : "quick", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Probability",
      stimulus: [stimulus],
      question,
      correctText,
      distractors,
      explanation,
      seed: index,
    })
);

export const ROUND_THREE_DM_QUESTIONS: UCATQuestion[] = [
  ...ROUND_THREE_DM_SYLLOGISMS,
  ...ROUND_THREE_DM_LOGIC,
  ...ROUND_THREE_DM_ARGUMENTS,
  ...ROUND_THREE_DM_YES_NO,
  ...ROUND_THREE_DM_VENN,
  ...ROUND_THREE_DM_PROBABILITY,
];

function makeQr(input: {
  id: string;
  subtype: UCATSubtypeId;
  setId: string;
  tags: UCATQuestionTag[];
  stimulus: string[];
  visual?: UCATChartVisual;
  question: string;
  correctText: string;
  distractors: string[];
  explanation: string;
  seed: number;
}) {
  return makeSingleQuestion({
    ...input,
    section: "qr",
    title: "Quantitative Reasoning Practice",
    leftTitle: input.visual ? "Table" : "Stem",
  });
}

type SalesSet = {
  id: string;
  title: string;
  rows: Array<[string, number, number, number]>;
};

const QR_SALES_SETS: SalesSet[] = [
  { id: "qr-round3-farm-shop", title: "Farm shop sales", rows: [["Egg boxes", 140, 1.1, 2.8], ["Apple bags", 95, 1.4, 3.6], ["Juice bottles", 70, 2.2, 5.5], ["Honey jars", 65, 2.8, 6.4]] },
  { id: "qr-round3-student-cafe", title: "Student cafe sales", rows: [["Bagels", 120, 0.65, 2.4], ["Soup", 80, 0.9, 3.1], ["Brownies", 100, 0.5, 1.9], ["Salads", 55, 1.8, 4.6]] },
  { id: "qr-round3-club-merch", title: "Club merchandise", rows: [["Scarves", 60, 4.5, 10], ["Badges", 220, 0.2, 1], ["Caps", 75, 3.4, 8.2], ["Posters", 110, 0.7, 2.5]] },
  { id: "qr-round3-clinic-supplies", title: "Clinic supply orders", rows: [["Gloves", 500, 0.06, 0.18], ["Masks", 300, 0.12, 0.35], ["Aprons", 240, 0.08, 0.22], ["Goggles", 45, 2.6, 5.8]] },
  { id: "qr-round3-festival-stall", title: "Festival stall sales", rows: [["Programmes", 180, 0.55, 2], ["Lanyards", 150, 0.4, 1.5], ["Bottles", 90, 3.2, 7.5], ["Ponchos", 70, 1.6, 4]] },
];

function makeSalesSet(set: SalesSet, setIndex: number): UCATQuestion[] {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Item", "Units sold", "Cost price", "Selling price"],
    rows: set.rows.map(([item, units, cost, price]) => [
      item,
      String(units),
      formatMoney(cost),
      formatMoney(price),
    ]),
  };
  const stimulus = ["The table shows cost prices, selling prices and units sold for four items."];
  const revenue = set.rows[0][1] * set.rows[0][3];
  const profit = set.rows[1][1] * (set.rows[1][3] - set.rows[1][2]);
  const totalRevenue = set.rows.reduce((sum, row) => sum + row[1] * row[3], 0);
  const totalProfit = set.rows.reduce((sum, row) => sum + row[1] * (row[3] - row[2]), 0);
  const changed = set.rows[2][1] * 1.15 * set.rows[2][3] * 0.9;

  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What was the revenue from ${set.rows[0][0]}?`, correctText: formatMoney(revenue), distractors: [formatMoney(set.rows[0][1] * set.rows[0][2]), formatMoney(revenue + set.rows[0][1]), formatMoney(Math.max(0, revenue - set.rows[0][1]))], explanation: `${set.rows[0][1]} x ${formatMoney(set.rows[0][3])} = ${formatMoney(revenue)}.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `What was the profit from ${set.rows[1][0]}?`, correctText: formatMoney(profit), distractors: [formatMoney(set.rows[1][1] * set.rows[1][3]), formatMoney(set.rows[1][1] * set.rows[1][2]), formatMoney(profit + set.rows[1][1])], explanation: `Profit per unit is ${formatMoney(set.rows[1][3] - set.rows[1][2])}; multiply by ${set.rows[1][1]}.`, seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: "What was the overall profit margin to the nearest 0.1%?", correctText: formatPercent((totalProfit / totalRevenue) * 100), distractors: [formatPercent(totalProfit / 10), formatPercent((totalProfit / (totalRevenue - totalProfit)) * 100), formatPercent(((totalProfit + 20) / totalRevenue) * 100)], explanation: `Profit margin = ${formatMoney(totalProfit)} / ${formatMoney(totalRevenue)} x 100.`, seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `If ${set.rows[2][0]} units sold rose by 15% and selling price fell by 10%, what would revenue be?`, correctText: formatMoney(changed), distractors: [formatMoney(set.rows[2][1] * set.rows[2][3]), formatMoney(set.rows[2][1] * 1.15 * set.rows[2][3]), formatMoney(set.rows[2][1] * set.rows[2][3] * 0.9)], explanation: `New revenue = old units x 1.15 x price x 0.90 = ${formatMoney(changed)}.`, seed: setIndex + 3 }),
  ];
}

type RouteSet = { id: string; title: string; scale: number; speed: number; rows: Array<[string, number, number]> };
const QR_ROUTE_SETS: RouteSet[] = [
  { id: "qr-round3-riverside-walks", title: "Riverside walks", scale: 0.45, speed: 5.4, rows: [["Bridge", 10, 20], ["Mill", 8, 30], ["Meadow", 12, 10], ["Hill", 9, 80]] },
  { id: "qr-round3-uni-routes", title: "University routes", scale: 0.25, speed: 4, rows: [["Library", 7, 10], ["Lab", 9, 25], ["Hall", 6, 15], ["Clinic", 11, 35]] },
  { id: "qr-round3-seafront-paths", title: "Seafront paths", scale: 0.6, speed: 5, rows: [["Pier", 6, 15], ["Dunes", 8, 45], ["Harbour", 7, 20], ["Cliff", 5, 70]] },
  { id: "qr-round3-town-deliveries", title: "Town deliveries", scale: 0.35, speed: 6, rows: [["A", 14, 30], ["B", 10, 20], ["C", 12, 45], ["D", 9, 15]] },
  { id: "qr-round3-country-trails", title: "Country trails", scale: 0.8, speed: 4.8, rows: [["Red", 5, 50], ["Blue", 7, 20], ["Green", 6, 60], ["Gold", 8, 40]] },
];

function routeTime(set: RouteSet, row: [string, number, number]) {
  return ((row[1] * set.scale) / set.speed) * 60 + row[2] / 10;
}

function makeRouteSet(set: RouteSet, setIndex: number): UCATQuestion[] {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Route", "Map length (cm)", "Climb (m)"],
    rows: set.rows.map(([route, length, climb]) => [route, String(length), String(climb)]),
    note: `Scale: 1 cm to ${set.scale} km. Speed: ${set.speed} km/h. Add 1 minute per 10 m climb.`,
  };
  const stimulus = [`A map uses a scale of 1 cm to ${set.scale} km. Walking speed is ${set.speed} km per hour.`, "Add 1 minute for each 10 m of climb."];
  const distance = set.rows[0][1] * set.scale;
  const time = routeTime(set, set.rows[1]);
  const fastest = [...set.rows].sort((a, b) => routeTime(set, a) - routeTime(set, b))[0];
  const diff = Math.abs(routeTime(set, set.rows[2]) - routeTime(set, set.rows[3]));

  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-units-geometry", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What is the actual distance of ${set.rows[0][0]}?`, correctText: `${formatNumber(distance, 1)} km`, distractors: [`${formatNumber(set.rows[0][1], 1)} km`, `${formatNumber(distance + set.scale, 1)} km`, `${formatNumber(Math.max(0, distance - set.scale), 1)} km`], explanation: `${set.rows[0][1]} x ${set.scale} = ${formatNumber(distance, 1)} km.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `What is the estimated time for ${set.rows[1][0]}?`, correctText: `${formatNumber(time, 1)} minutes`, distractors: [`${formatNumber(time - set.rows[1][2] / 10, 1)} minutes`, `${formatNumber(time + 5, 1)} minutes`, `${formatNumber(Math.max(0, time - 5), 1)} minutes`], explanation: "Convert map length to distance, calculate walking time, then add climb time.", seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "medium", "multi-step"], stimulus, visual, question: "Which route is estimated to take the least time?", correctText: fastest[0], distractors: set.rows.map((row) => row[0]).filter((label) => label !== fastest[0]), explanation: `Comparing all route times, ${fastest[0]} is quickest.`, seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `What is the absolute difference between the estimated times for ${set.rows[2][0]} and ${set.rows[3][0]}?`, correctText: `${formatNumber(diff, 1)} minutes`, distractors: [`${formatNumber(diff + 6, 1)} minutes`, `${formatNumber(Math.max(0, diff - 6), 1)} minutes`, `${formatNumber(Math.abs(set.rows[2][1] - set.rows[3][1]) * set.scale, 1)} minutes`], explanation: "Calculate both complete route times, including climb, then subtract.", seed: setIndex + 3 }),
  ];
}

type PlanSet = { id: string; title: string; unit: string; extra: number; need: number; rows: Array<[string, number, number, number]> };
const QR_PLAN_SETS: PlanSet[] = [
  { id: "qr-round3-cloud-plans", title: "Cloud plans", unit: "GB", extra: 1.1, need: 85, rows: [["Lite", 25, 7, 0], ["Core", 70, 18, 4], ["Pro", 150, 32, 0], ["Team", 400, 75, 10]] },
  { id: "qr-round3-desk-hire", title: "Desk hire plans", unit: "hours", extra: 5, need: 18, rows: [["Drop-in", 5, 24, 0], ["Part", 14, 58, 8], ["Full", 35, 130, 0], ["Team", 80, 260, 20]] },
  { id: "qr-round3-copy-plans", title: "Copy plans", unit: "pages", extra: 0.03, need: 650, rows: [["Basic", 200, 7, 0], ["Study", 500, 16, 2], ["Bulk", 1000, 28, 0], ["Office", 2000, 48, 5]] },
  { id: "qr-round3-tennis-passes", title: "Tennis passes", unit: "sessions", extra: 4, need: 18, rows: [["Starter", 6, 20, 0], ["Active", 14, 42, 5], ["Unlimited", 35, 80, 0], ["Family", 70, 140, 15]] },
  { id: "qr-round3-equipment-slots", title: "Equipment slots", unit: "slots", extra: 7, need: 24, rows: [["Small", 6, 30, 0], ["Core", 16, 82, 8], ["Large", 32, 145, 0], ["Department", 80, 310, 20]] },
];

function planCost(set: PlanSet, row: [string, number, number, number], need = set.need, extra = set.extra) {
  return row[2] + Math.max(0, need - row[1]) * extra;
}

function makePlanSet(set: PlanSet, setIndex: number): UCATQuestion[] {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Plan", `Included ${set.unit}`, "Monthly price", "Joining fee"],
    rows: set.rows.map(([plan, included, price, fee]) => [plan, String(included), formatMoney(price), formatMoney(fee)]),
    note: `Extra ${set.unit} cost ${formatMoney(set.extra)} each.`,
  };
  const stimulus = [`The table shows monthly plans. Extra ${set.unit} cost ${formatMoney(set.extra)} each.`];
  const unitCost = set.rows[1][2] / set.rows[1][1];
  const cheapest = [...set.rows].map((row) => ({ row, cost: planCost(set, row) })).sort((a, b) => a.cost - b.cost)[0];
  const annual = set.rows[2][2] * 12 + set.rows[2][3];
  const raisedCheapest = [...set.rows].map((row) => ({ row, cost: row[2] * 1.08 + Math.max(0, set.need - row[1]) * (set.extra * 0.75) })).sort((a, b) => a.cost - b.cost)[0];

  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What is the monthly cost per included unit for the ${set.rows[1][0]} plan?`, correctText: formatMoney(unitCost), distractors: [formatMoney(unitCost + 0.5), formatMoney(unitCost * 2), formatMoney(set.rows[1][2])], explanation: `${formatMoney(set.rows[1][2])} divided by ${set.rows[1][1]} included units.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `A user needs ${set.need} ${set.unit}. What is the cheapest monthly cost?`, correctText: formatMoney(cheapest.cost), distractors: [formatMoney(planCost(set, set.rows[0])), formatMoney(planCost(set, set.rows[2])), formatMoney(cheapest.cost + set.extra * 2)], explanation: `Compare monthly price plus extras. Cheapest is ${cheapest.row[0]} at ${formatMoney(cheapest.cost)}.`, seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: `What is the annual cost of the ${set.rows[2][0]} plan including its joining fee?`, correctText: formatMoney(annual), distractors: [formatMoney(set.rows[2][2] * 12), formatMoney(annual + set.rows[2][2]), formatMoney(Math.max(0, annual - set.rows[2][2]))], explanation: "Annual cost is 12 monthly payments plus the joining fee.", seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `Monthly prices rise by 8%, while extra ${set.unit} fall by 25%. What is the new cheapest cost for ${set.need} ${set.unit}?`, correctText: formatMoney(raisedCheapest.cost), distractors: [formatMoney(cheapest.cost), formatMoney(raisedCheapest.cost + set.extra), formatMoney(Math.max(0, raisedCheapest.cost - set.extra))], explanation: `Apply both changes to each plan and compare. The cheapest new cost is ${formatMoney(raisedCheapest.cost)}.`, seed: setIndex + 3 }),
  ];
}

type WorkSet = { id: string; title: string; rows: Array<[string, number, number]>; target: number };
const QR_WORK_SETS: WorkSet[] = [
  { id: "qr-round3-poster-work", title: "Poster work", rows: [["A", 6, 24], ["B", 5, 20], ["C", 8, 24], ["D", 10, 30]], target: 72 },
  { id: "qr-round3-garden-work", title: "Garden work", rows: [["E", 7, 21], ["F", 4, 18], ["G", 9, 27], ["H", 6, 24]], target: 64 },
  { id: "qr-round3-records-work", title: "Records work", rows: [["J", 5, 25], ["K", 8, 32], ["L", 6, 18], ["M", 9, 27]], target: 75 },
  { id: "qr-round3-cleaning-work", title: "Cleaning work", rows: [["N", 6, 30], ["P", 7, 21], ["Q", 5, 20], ["R", 8, 24]], target: 60 },
  { id: "qr-round3-catalogue-work", title: "Catalogue work", rows: [["S", 8, 28], ["T", 6, 18], ["U", 10, 30], ["V", 5, 20]], target: 68 },
];

function makeWorkSet(set: WorkSet, setIndex: number): UCATQuestion[] {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Worker", "Days worked", "Work completed"],
    rows: set.rows.map(([worker, days, pct]) => [worker, String(days), `${pct}%`]),
  };
  const stimulus = ["The table shows the percentage of a project completed by four workers."];
  const rate0 = set.rows[0][2] / set.rows[0][1];
  const combined = (set.rows[0][2] / set.rows[0][1] + set.rows[1][2] / set.rows[1][1]) * 6;
  const remaining = 100 - combined;
  const worker2Rate = set.rows[2][2] / set.rows[2][1];
  const finishDays = remaining / worker2Rate;
  const targetDays = set.target / (set.rows[3][2] / set.rows[3][1]);

  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What percentage does Worker ${set.rows[0][0]} complete per day?`, correctText: `${formatNumber(rate0, 1)}%`, distractors: [`${set.rows[0][2]}%`, `${formatNumber(rate0 + 1, 1)}%`, `${formatNumber(rate0 * 2, 1)}%`], explanation: "Divide work completed by days worked.", seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `Workers ${set.rows[0][0]} and ${set.rows[1][0]} work together for 6 days. What percentage do they complete?`, correctText: `${formatNumber(combined, 1)}%`, distractors: [`${formatNumber(combined / 2, 1)}%`, `${formatNumber(combined + 6, 1)}%`, `${formatNumber(set.rows[0][2] + set.rows[1][2], 1)}%`], explanation: "Add their daily rates and multiply by 6.", seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: `After that, how many days would Worker ${set.rows[2][0]} take to finish the project?`, correctText: `${formatNumber(finishDays, 1)} days`, distractors: [`${formatNumber(finishDays + 2, 1)} days`, `${formatNumber(Math.max(0, finishDays - 2), 1)} days`, `${formatNumber(remaining, 1)} days`], explanation: `Remaining work is divided by Worker ${set.rows[2][0]}'s daily rate.`, seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `How many days would Worker ${set.rows[3][0]} take to complete ${set.target}% at the same rate?`, correctText: `${formatNumber(targetDays, 1)} days`, distractors: [`${formatNumber(targetDays + 3, 1)} days`, `${formatNumber(Math.max(0, targetDays - 3), 1)} days`, `${formatNumber(set.target / set.rows[3][2], 1)} days`], explanation: `Divide ${set.target}% by Worker ${set.rows[3][0]}'s daily rate.`, seed: setIndex + 3 }),
  ];
}

type DoseSet = { id: string; mgPerMl: number; dosePerKg: number; bottleMl: number; rows: Array<[string, number]> };
const QR_DOSE_SETS: DoseSet[] = [
  { id: "qr-round3-dose-a", mgPerMl: 25, dosePerKg: 12, bottleMl: 150, rows: [["A", 20], ["B", 30], ["C", 45], ["D", 55]] },
  { id: "qr-round3-dose-b", mgPerMl: 40, dosePerKg: 7, bottleMl: 160, rows: [["E", 28], ["F", 36], ["G", 52], ["H", 68]] },
  { id: "qr-round3-dose-c", mgPerMl: 30, dosePerKg: 9, bottleMl: 180, rows: [["J", 22], ["K", 33], ["L", 48], ["M", 60]] },
  { id: "qr-round3-dose-d", mgPerMl: 50, dosePerKg: 6, bottleMl: 120, rows: [["N", 25], ["P", 40], ["Q", 55], ["R", 70]] },
  { id: "qr-round3-dose-e", mgPerMl: 20, dosePerKg: 10, bottleMl: 200, rows: [["S", 18], ["T", 26], ["U", 38], ["V", 50]] },
];

function makeDoseSet(set: DoseSet, setIndex: number): UCATQuestion[] {
  const visual: UCATChartVisual = {
    type: "table",
    title: "Patient masses",
    headers: ["Patient", "Mass"],
    rows: set.rows.map(([patient, mass]) => [patient, `${mass} kg`]),
  };
  const stimulus = [`Medicine contains ${set.mgPerMl} mg per mL.`, `Daily dose is ${set.dosePerKg} mg per kg, split into two equal doses. Each bottle contains ${set.bottleMl} mL.`];
  const daily0 = set.rows[0][1] * set.dosePerKg;
  const singleDose1 = (set.rows[1][1] * set.dosePerKg) / 2 / set.mgPerMl;
  const dailyVolume2 = (set.rows[2][1] * set.dosePerKg) / set.mgPerMl;
  const days = Math.floor(set.bottleMl / dailyVolume2);
  const bottles = Math.ceil(set.rows.reduce((sum, row) => sum + (row[1] * set.dosePerKg * 7) / set.mgPerMl, 0) / set.bottleMl);

  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What is Patient ${set.rows[0][0]}'s daily dose?`, correctText: `${formatWhole(daily0)} mg`, distractors: [`${formatWhole(daily0 / 2)} mg`, `${formatWhole(set.rows[0][1] * set.mgPerMl)} mg`, `${formatWhole(daily0 + set.dosePerKg)} mg`], explanation: "Mass x daily dose per kg = daily dose.", seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-units-geometry", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `What volume is needed for each of Patient ${set.rows[1][0]}'s two daily doses?`, correctText: `${formatNumber(singleDose1, 1)} mL`, distractors: [`${formatNumber(singleDose1 * 2, 1)} mL`, `${formatNumber(singleDose1 / 2, 1)} mL`, `${formatNumber(singleDose1 + 1, 1)} mL`], explanation: "Find the daily dose, halve it, then divide by mg per mL.", seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: `How many complete days will one bottle last for Patient ${set.rows[2][0]}?`, correctText: `${days} days`, distractors: [`${days + 1} days`, `${Math.max(1, days - 1)} days`, `${days * 2} days`], explanation: "Divide bottle volume by the patient's daily volume and count complete days only.", seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: "How many bottles are needed for all four patients for 7 days?", correctText: `${bottles} bottles`, distractors: [`${Math.max(1, bottles - 1)} bottles`, `${bottles + 1} bottles`, `${bottles + 2} bottles`], explanation: "Calculate each patient's 7-day volume, total them, divide by bottle size and round up.", seed: setIndex + 3 }),
  ];
}

export const ROUND_THREE_QR_QUESTIONS: UCATQuestion[] = [
  ...QR_SALES_SETS.flatMap(makeSalesSet),
  ...QR_ROUTE_SETS.flatMap(makeRouteSet),
  ...QR_PLAN_SETS.flatMap(makePlanSet),
  ...QR_WORK_SETS.flatMap(makeWorkSet),
  ...QR_DOSE_SETS.flatMap(makeDoseSet),
];

function makeSjtSingle(input: {
  id: string;
  subtype: UCATSubtypeId;
  setId: string;
  stimulus: string[];
  question: string;
  answer: UCATOptionKey;
  explanation: string;
  issueTags: UCATSjtIssueTag[];
  mode: "importance" | "appropriateness";
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
    options: input.mode === "importance" ? IMPORTANCE_OPTIONS : APPROPRIATENESS_OPTIONS,
    answer: input.answer,
    explanation: input.explanation,
  };
}

type SjtRatingSet = {
  setId: string;
  mode: "importance" | "appropriateness";
  subtype: UCATSubtypeId;
  stimulus: string[];
  items: Array<[string, UCATOptionKey, UCATSjtIssueTag[], string]>;
};

const SJT_RATING_SETS: SjtRatingSet[] = [
  {
    setId: "sjt-round3-shared-login",
    mode: "appropriateness",
    subtype: "sjt-appropriateness",
    stimulus: [
      "A student on placement is offered a nurse's computer login to quickly check a non-urgent result because the student's own access has not been set up.",
      "How appropriate are the following responses by the student?",
    ],
    items: [
      ["Decline to use another person's login and ask how to access the result properly", "A", ["integrity", "confidentiality"], "This is very appropriate because logins must not be shared."],
      ["Use the login briefly because the nurse has given permission", "D", ["confidentiality", "professional-boundaries"], "Using another person's login is very inappropriate."],
      ["Explain the access problem to the supervising clinician", "A", ["communication", "escalation"], "Escalating the access issue is appropriate."],
      ["Wait until proper access is available if the result is not urgent", "B", ["scope-of-practice", "patient-safety"], "This may be appropriate, provided patient care is not compromised."],
    ],
  },
  {
    setId: "sjt-round3-falls-note",
    mode: "importance",
    subtype: "sjt-importance",
    stimulus: [
      "A student reads that a patient is at high risk of falls, then sees the patient trying to walk alone to the toilet.",
      "How important are the following considerations?",
    ],
    items: [
      ["That the patient could be harmed if they fall", "A", ["patient-safety", "non-maleficence"], "Possible harm is very important."],
      ["That the student should get appropriate staff help rather than manage alone", "A", ["scope-of-practice", "escalation"], "This is very important for safe action."],
      ["That the patient may feel embarrassed needing help", "B", ["respect-dignity", "communication"], "This is important when communicating respectfully."],
      ["That helping may interrupt the student's planned break", "D", ["patient-safety"], "A break should not outweigh immediate safety."],
    ],
  },
  {
    setId: "sjt-round3-inaccurate-advice",
    mode: "appropriateness",
    subtype: "sjt-communication",
    stimulus: [
      "At a health fair, a student hears another volunteer give inaccurate advice about antibiotics to a visitor.",
      "How appropriate are the following responses?",
    ],
    items: [
      ["Politely correct the advice using the approved leaflet before the visitor leaves", "A", ["patient-safety", "communication"], "This is very appropriate because misinformation should be corrected promptly."],
      ["Let the visitor leave to avoid embarrassing the volunteer", "D", ["patient-safety", "integrity"], "Avoiding embarrassment should not come before accurate advice."],
      ["Speak privately with the volunteer afterwards about checking information", "B", ["teamwork", "communication"], "This is appropriate, but the visitor also needs accurate information now."],
      ["Tell the visitor the volunteer is incompetent", "D", ["respect-dignity", "communication"], "This is disrespectful and unprofessional."],
    ],
  },
  {
    setId: "sjt-round3-translation-delay",
    mode: "importance",
    subtype: "sjt-importance",
    stimulus: [
      "A patient with limited English is waiting for an interpreter before a medication discussion. The clinic is running late.",
      "How important are the following considerations?",
    ],
    items: [
      ["That the patient needs to understand the medication discussion", "A", ["communication", "autonomy"], "Understanding is very important."],
      ["That using a professional interpreter may protect privacy and accuracy", "A", ["confidentiality", "communication"], "This is very important for sensitive clinical discussion."],
      ["That the clinic is running late", "C", ["teamwork"], "Time pressure is relevant but minor compared with safe communication."],
      ["That a relative says they can translate quickly", "B", ["communication", "professional-boundaries"], "This is important but does not automatically make a relative suitable."],
    ],
  },
  {
    setId: "sjt-round3-repeated-lateness",
    mode: "appropriateness",
    subtype: "sjt-integrity",
    stimulus: [
      "A student has been late to placement twice because of transport disruption and realises it may happen again next week.",
      "How appropriate are the following responses?",
    ],
    items: [
      ["Tell the supervisor early and discuss a realistic plan", "A", ["integrity", "communication"], "This is very appropriate and honest."],
      ["Ask a peer to sign in for them if they are delayed", "D", ["integrity", "justice"], "This is dishonest."],
      ["Check alternative routes or earlier travel options", "A", ["professional-boundaries", "integrity"], "Taking practical steps is very appropriate."],
      ["Say nothing unless someone notices", "D", ["integrity"], "Hiding a recurring problem is inappropriate."],
    ],
  },
  {
    setId: "sjt-round3-patient-story",
    mode: "importance",
    subtype: "sjt-importance",
    stimulus: [
      "A student wants to describe a memorable patient story in a teaching presentation to classmates.",
      "How important are the following considerations?",
    ],
    items: [
      ["Whether the patient could be identified from the details", "A", ["confidentiality"], "Identifiability is very important."],
      ["Whether consent or approved anonymisation is required", "A", ["confidentiality", "integrity"], "This is very important before sharing patient information."],
      ["That the story would make the presentation more interesting", "D", ["professional-boundaries"], "Interest does not justify confidentiality risk."],
      ["That the classmates are also healthcare students", "C", ["confidentiality"], "This is minor; it does not remove confidentiality obligations."],
    ],
  },
];

const ROUND_THREE_SJT_RATINGS: UCATQuestion[] = SJT_RATING_SETS.flatMap((set) =>
  set.items.map(([question, answer, issueTags, explanation], index) =>
    makeSjtSingle({
      id: `${set.setId}-${index + 1}`,
      subtype: set.subtype,
      setId: set.setId,
      stimulus: set.stimulus,
      question,
      answer,
      explanation,
      issueTags,
      mode: set.mode,
    })
  )
);

const ROUND_THREE_SJT_DRAG_CATEGORY: UCATQuestion[] = [
  ["sjt-round3-drag-wristband-check", "A patient gives a different date of birth from the wristband before a blood test.", [["pause", "Pause and check identity through the approved process", "appropriate"], ["continue", "Continue because the name sounds similar", "inappropriate"], ["staff", "Tell the supervising staff member about the mismatch", "appropriate"]], ["patient-safety", "communication", "non-maleficence"]],
  ["sjt-round3-drag-ward-photo", "A student wants to photograph a teaching model on a ward desk, but paperwork is nearby.", [["clear", "Check that no patient information is visible before any photograph", "appropriate"], ["snap", "Take the photograph quickly because it is only a model", "inappropriate"], ["ask", "Ask staff whether photography is allowed in that area", "appropriate"]], ["confidentiality", "professional-boundaries", "integrity"]],
  ["sjt-round3-drag-exam-presence", "A patient says they would prefer not to have students present during an examination.", [["leave", "Respect the patient's preference and leave if asked", "appropriate"], ["stay", "Stay because learning opportunities are limited", "inappropriate"], ["discuss", "Discuss with the supervisor afterwards how to find other learning opportunities", "appropriate"]], ["autonomy", "respect-dignity", "capacity-consent"]],
  ["sjt-round3-drag-copying-data", "A peer suggests copying old audit rows into a new spreadsheet to make the sample larger.", [["refuse", "Refuse to add data that were not collected for the project", "appropriate"], ["copy", "Copy the rows because the audit topic is similar", "inappropriate"], ["supervisor", "Ask the supervisor how to manage the small sample honestly", "appropriate"]], ["integrity", "justice", "teamwork"]],
  ["sjt-round3-drag-unwell-peer", "A peer appears tearful after a difficult consultation and says they cannot face the next patient.", [["check", "Check privately whether they are safe and need support", "appropriate"], ["mock", "Tell others they cannot cope", "inappropriate"], ["senior", "Encourage them to speak with the supervisor or teaching lead", "appropriate"]], ["teamwork", "communication", "respect-dignity"]],
  ["sjt-round3-drag-food-allergy", "A patient says they have a severe nut allergy during a ward meal service.", [["tell", "Tell the nurse or catering staff promptly before food is given", "appropriate"], ["assume", "Assume the standard meal will be fine", "inappropriate"], ["confirm", "Check what has already been recorded without delaying escalation", "appropriate"]], ["patient-safety", "communication", "non-maleficence"]],
  ["sjt-round3-drag-private-number", "A patient asks a student for their personal phone number to update them after discharge.", [["decline", "Politely decline and explain professional boundaries", "appropriate"], ["share", "Share the number because the patient seems anxious", "inappropriate"], ["team", "Signpost the patient to the appropriate ward or clinic contact route", "appropriate"]], ["professional-boundaries", "communication", "confidentiality"]],
  ["sjt-round3-drag-med-chart", "A student notices a possible discrepancy between a medicine chart and discharge letter.", [["raise", "Raise the discrepancy with the responsible clinician or pharmacist", "appropriate"], ["edit", "Edit the discharge letter independently", "inappropriate"], ["specific", "Explain exactly what information appears inconsistent", "appropriate"]], ["patient-safety", "scope-of-practice", "escalation"]],
].map(([id, stimulus, items, issueTags]) => ({
  id: id as string,
  section: "sjt" as const,
  subtype: "sjt-drag-drop" as const,
  questionType: "drag-category" as const,
  tags: ["text-stem", "set-based", "quick"] as UCATQuestionTag[],
  issueTags: issueTags as UCATSjtIssueTag[],
  title: "Situational Judgement Practice",
  leftTitle: "Scenario",
  setId: id as string,
  stimulus: [stimulus as string],
  question: "Drag each response to the side that best describes it.",
  instruction: "Classify each response as appropriate or inappropriate in this situation.",
  categories: [
    { id: "appropriate", label: "Appropriate" },
    { id: "inappropriate", label: "Inappropriate" },
  ],
  categoryItems: (items as Array<[string, string, string]>).map(([itemId, text, answerCategory]) => ({
    id: itemId,
    text,
    answerCategory,
  })),
  explanation:
    "The appropriate responses protect patients, respect boundaries and use the correct team route. The inappropriate responses are unsafe, dishonest or outside role.",
}));

const ROUND_THREE_SJT_ORDERING: UCATQuestion[] = [
  ["sjt-round3-order-collapse", "A visitor collapses in a clinic corridor while a student is nearby.", [["help", "Call for help immediately"], ["safe", "Check the area is safe and stay with the visitor within competence"], ["staff", "Direct arriving staff to the visitor and share what happened"], ["reflect", "Reflect with the supervisor after the incident"]], ["help", "safe", "staff", "reflect"]],
  ["sjt-round3-order-email-breach", "A student realises they sent a placement email containing identifiable information to the wrong staff group.", [["stop", "Do not send any further related information"], ["report", "Report the error through the appropriate route promptly"], ["facts", "Provide the facts of what was sent and to whom"], ["learn", "Review anonymisation and email-checking processes afterwards"]], ["stop", "report", "facts", "learn"]],
  ["sjt-round3-order-incorrect-advice", "A student realises they gave a patient unclear advice about where to attend next.", [["team", "Tell the supervising team promptly"], ["correct", "Make sure the patient receives clear corrected information"], ["apologise", "Apologise honestly if appropriate within the team response"], ["reflect", "Reflect on how to communicate directions more clearly"]], ["team", "correct", "apologise", "reflect"]],
  ["sjt-round3-order-aggressive-relative", "A relative becomes verbally aggressive towards a receptionist while patients are nearby.", [["calm", "Stay calm and avoid escalating the situation"], ["space", "If safe, create space and protect nearby patients' privacy"], ["help", "Get appropriate staff or security support"], ["record", "Follow local reporting steps afterwards"]], ["calm", "space", "help", "record"]],
  ["sjt-round3-order-missing-badge", "A student loses their placement ID badge on public transport.", [["search", "Check immediate belongings and contact the transport lost-property route"], ["report", "Tell the placement office or supervisor promptly"], ["disable", "Arrange for access permissions to be disabled if required"], ["replace", "Request a replacement through the proper process"]], ["search", "report", "disable", "replace"]],
  ["sjt-round3-order-consent-relative", "A relative answers all questions for a patient during a consent discussion.", [["notice", "Notice that the patient's own views may not be clear"], ["raise", "Raise the concern with the clinician leading the discussion"], ["support", "Support communication that addresses the patient directly"], ["document", "Leave documentation of consent to the responsible clinician"]], ["notice", "raise", "support", "document"]],
].map(([id, stimulus, items, order]) => ({
  id: id as string,
  section: "sjt" as const,
  subtype: "sjt-ordering" as const,
  questionType: "drag-order" as const,
  tags: ["text-stem", "set-based", "multi-step"] as UCATQuestionTag[],
  issueTags: ["patient-safety", "communication", "escalation"] as UCATSjtIssueTag[],
  title: "Situational Judgement Practice",
  leftTitle: "Scenario",
  setId: id as string,
  stimulus: [stimulus as string],
  question: "Drag the actions into order from most appropriate to least appropriate.",
  instruction: "Prioritise immediate safety and professionalism before later follow-up.",
  dragItems: (items as Array<[string, string]>).map(([itemId, text]) => ({ id: itemId, text })),
  answerOrder: order as string[],
  explanation:
    "The best order starts with immediate safety or confidentiality, then communication and escalation, then later documentation or reflection.",
}));

const ROUND_THREE_SJT_MOST_LEAST: UCATQuestion[] = [
  ["sjt-round3-mostleast-login", "A staff member offers a student their computer login for convenience.", [["decline", "Decline and ask for the proper access route"], ["use", "Use the login because the staff member allowed it"], ["supervisor", "Tell the supervisor that access is not set up"], ["share", "Save the password for later use"]], "decline", "share"],
  ["sjt-round3-mostleast-falls", "A high falls-risk patient tries to walk unaided.", [["help", "Call for staff help immediately"], ["watch", "Watch silently to see what happens"], ["reassure", "Speak calmly while waiting for help"], ["film", "Record the incident for teaching"]], "help", "film"],
  ["sjt-round3-mostleast-audit", "A group audit has fewer responses than expected.", [["honest", "Report the true sample and limitations"], ["invent", "Invent extra responses to improve the chart"], ["ask", "Ask the supervisor whether more collection is possible"], ["hide", "Delete the methods section so the sample size is less obvious"]], "honest", "invent"],
  ["sjt-round3-mostleast-photo", "A peer posts a ward image that may include patient initials.", [["ask-delete", "Ask them not to share it and to delete it while escalating if needed"], ["like", "Like the post because it is already online"], ["supervisor", "Tell a supervisor if patient information may have been shared"], ["comment", "Comment with more details about the ward"]], "ask-delete", "comment"],
  ["sjt-round3-mostleast-scope", "A patient asks a student whether to stop a medication.", [["team", "Encourage them to speak to the clinical team before changing anything"], ["advise-stop", "Tell them to stop because they are worried"], ["listen", "Listen to the concern and pass it on appropriately"], ["promise", "Promise the doctor will stop the medication"]], "team", "advise-stop"],
  ["sjt-round3-mostleast-chaperone", "A patient asks for a chaperone before an examination.", [["arrange", "Tell staff and help arrange a chaperone through policy"], ["dismiss", "Say a chaperone is unnecessary"], ["respect", "Acknowledge that the request is reasonable"], ["joke", "Joke that they are being overly cautious"]], "arrange", "joke"],
].map(([id, stimulus, items, most, least]) => ({
  id: id as string,
  section: "sjt" as const,
  subtype: "sjt-appropriateness" as const,
  questionType: "most-least" as const,
  tags: ["text-stem", "set-based", "multi-step"] as UCATQuestionTag[],
  issueTags: ["patient-safety", "professional-boundaries", "integrity"] as UCATSjtIssueTag[],
  title: "Situational Judgement Practice",
  leftTitle: "Scenario",
  setId: id as string,
  stimulus: [stimulus as string],
  question: "Select the most appropriate and least appropriate actions.",
  instruction: "Choose one action for each slot.",
  actionItems: (items as Array<[string, string]>).map(([itemId, text]) => ({ id: itemId, text })),
  answerSlots: { most: most as string, least: least as string },
  explanation:
    "The most appropriate action protects patients and uses the proper route. The least appropriate action is unsafe, dishonest or outside scope.",
}));

export const ROUND_THREE_SJT_QUESTIONS: UCATQuestion[] = [
  ...ROUND_THREE_SJT_RATINGS,
  ...ROUND_THREE_SJT_DRAG_CATEGORY,
  ...ROUND_THREE_SJT_ORDERING,
  ...ROUND_THREE_SJT_MOST_LEAST,
];
