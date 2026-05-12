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
  if (Number.isInteger(value)) return `${formatWhole(value)} pounds`;
  return `${value.toFixed(2)} pounds`;
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

function makeOptions(correctText: string, distractors: string[], seed: number) {
  const cleanDistractors = distractors.filter(
    (text, index) => text !== correctText && distractors.indexOf(text) === index
  );
  const texts = cleanDistractors.slice(0, 3);
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
  const { options, answer } = makeOptions(
    input.correctText,
    input.distractors,
    input.seed
  );

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

function vrTags(...tags: UCATQuestionTag[]) {
  return tags;
}

const ROUND_TWO_VR_TFC_SETS = [
  {
    setId: "vr-round2-tfc-school-garden",
    stimulus: [
      "A secondary school converted a disused courtyard into a teaching garden. The project was funded by a local business prize and maintained by lunchtime volunteers. Teachers said the garden would be used for biology and art, but not for assessed practical examinations.",
      "During the first term, the herb beds survived better than the vegetable beds because they needed less watering. The site manager warned that the garden could not be expanded until a damaged wall had been repaired.",
    ],
    items: [
      ["The teaching garden was funded by a local business prize.", "A", "The first paragraph says the project was funded by a local business prize."],
      ["The garden was used for assessed practical examinations.", "B", "Teachers said it would not be used for assessed practical examinations."],
      ["The vegetable beds needed less watering than the herb beds.", "B", "The herb beds survived better because they needed less watering."],
      ["The damaged wall was repaired during the first term.", "C", "The passage says expansion depended on the wall being repaired, but not whether it was repaired."],
    ],
  },
  {
    setId: "vr-round2-tfc-cargo-bikes",
    stimulus: [
      "A pharmacy trialled cargo-bike deliveries for repeat prescriptions within a three-kilometre radius. The service ran only on dry weekdays because medicine packaging had not yet been tested in heavy rain. Customers still had to sign electronically when receiving controlled medicines.",
      "The trial reduced van mileage but did not shorten every delivery time. Riders reported that traffic filters helped on residential streets, while steep hills made some routes slower than expected.",
    ],
    items: [
      ["The cargo-bike service was available for all delivery distances.", "B", "It was limited to repeat prescriptions within a three-kilometre radius."],
      ["The trial reduced van mileage.", "A", "The passage directly states that the trial reduced van mileage."],
      ["Every delivery became faster during the trial.", "B", "The passage says the trial did not shorten every delivery time."],
      ["Medicine packaging had been tested in heavy rain before the trial began.", "B", "The service ran only on dry weekdays because packaging had not yet been tested in heavy rain."],
    ],
  },
  {
    setId: "vr-round2-tfc-rooftop-weather",
    stimulus: [
      "An architecture department installed weather sensors on the roofs of four studio buildings. The sensors measured wind speed, surface temperature and rainfall every ten minutes. Students used the data to compare roof materials, but the department did not collect information about indoor comfort.",
      "The first month produced incomplete rainfall data because one sensor was blocked by leaves. Temperature readings were considered reliable, as all four sensors had passed calibration checks before installation.",
    ],
    items: [
      ["The sensors recorded data every ten minutes.", "A", "The passage says measurements were taken every ten minutes."],
      ["Indoor comfort was measured alongside roof temperature.", "B", "The department did not collect information about indoor comfort."],
      ["One sensor's rainfall readings were affected by leaves.", "A", "The rainfall data were incomplete because one sensor was blocked by leaves."],
      ["The blocked sensor made all temperature readings unreliable.", "B", "Temperature readings were considered reliable because all sensors had passed calibration checks."],
    ],
  },
  {
    setId: "vr-round2-tfc-food-coop",
    stimulus: [
      "A food co-operative introduced a shared ordering system so members could buy grains in bulk. Members placed orders online, but collected items in person on Thursday evenings. The co-operative hoped larger orders would reduce packaging waste.",
      "After two months, packaging waste had fallen, although storage became more difficult. The treasurer said savings varied because some suppliers charged delivery by distance while others charged by weight.",
    ],
    items: [
      ["Members collected orders in person on Thursday evenings.", "A", "The passage states this directly."],
      ["Packaging waste increased after two months.", "B", "The passage says packaging waste had fallen."],
      ["All suppliers charged delivery by weight.", "B", "Some suppliers charged by distance and others by weight."],
      ["The co-operative's membership doubled after the system began.", "C", "Membership numbers are not given."],
    ],
  },
];

const ROUND_TWO_VR_TFC: UCATQuestion[] = ROUND_TWO_VR_TFC_SETS.flatMap((set) =>
  set.items.map(([statement, answer, explanation], index) => ({
    id: `${set.setId}-${index + 1}`,
    section: "vr" as const,
    subtype: "vr-tfc" as const,
    setId: set.setId,
    tags: vrTags("true-false-cant-tell", index < 2 ? "easy" : "medium", "text-stem"),
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: set.stimulus,
    question: `${statement} According to the passage, this statement is:`,
    options: TFC_OPTIONS,
    answer: answer as UCATOptionKey,
    explanation,
  }))
);

type VrMcqItem = [UCATSubtypeId, string, string, string[], string];
type VrMcqSet = {
  setId: string;
  stimulus: string[];
  items: VrMcqItem[];
};

const ROUND_TWO_VR_MCQ_SETS: VrMcqSet[] = [
  {
    setId: "vr-round2-canal-festival",
    stimulus: [
      "A canal festival introduced timed entry for boat tours after previous queues blocked a towpath used by commuters. Visitors could still walk around the craft stalls without booking. Organisers said timed entry was intended to manage crowd flow, not to restrict access to the festival as a whole.",
      "The change reduced queue length near the towpath, but some visitors missed their slot after underestimating the walk from the station. The organisers planned clearer signs rather than a longer booking window.",
    ],
    items: [
      ["vr-detail", "Why was timed entry introduced for boat tours?", "Previous queues blocked a commuter towpath.", ["Craft stalls needed more sellers.", "The festival wanted to close the towpath.", "Visitors could not walk around without booking."], "The opening sentence gives blocked towpath queues as the reason."],
      ["vr-inference", "Which inference is best supported?", "Timed entry improved one crowd problem but created a navigation issue for some visitors.", ["Timed entry stopped visitors using the craft stalls.", "The station walk was removed from the route.", "The organisers planned to cancel boat tours."], "Queues reduced, but some visitors missed slots after misjudging the walk."],
      ["vr-author", "How is the organisers' response mainly presented?", "Practical and focused on improving information.", ["Punitive towards late visitors.", "Uninterested in crowd flow.", "Opposed to craft stalls."], "They planned clearer signs rather than a stricter or longer booking process."],
      ["vr-summary", "Which is the best summary?", "Timed entry helped manage tour queues, but wayfinding still needed improvement.", ["The festival became booking-only for all visitors.", "Boat tours were cancelled because commuters complained.", "Craft stalls caused the queue problem."], "The passage balances improved queue control with missed slots due to the station walk."],
    ],
  },
  {
    setId: "vr-round2-library-heat",
    stimulus: [
      "A library kept a cool room open during a summer heat alert. The room offered water, fans and quiet seating, but it was not advertised as a medical facility. Staff were trained to call emergency services if a visitor became acutely unwell.",
      "Most visitors came in the afternoon, when nearby flats were warmest. The library later added board games after noticing that some older visitors stayed for several hours and wanted gentle activities.",
    ],
    items: [
      ["vr-detail", "What was the cool room not advertised as?", "A medical facility.", ["A quiet seating area.", "A place with water.", "A room with fans."], "The first paragraph says it was not advertised as a medical facility."],
      ["vr-inference", "Why were board games added?", "Some visitors stayed for long periods and wanted gentle activities.", ["The library stopped offering water.", "Visitors were mainly children in the morning.", "Staff wanted to avoid calling emergency services."], "The second paragraph links long stays by older visitors with adding board games."],
      ["vr-negative", "Which statement is not supported?", "The cool room replaced emergency medical care.", ["Staff could call emergency services.", "The room offered quiet seating.", "Most visitors came in the afternoon."], "The cool room was explicitly not advertised as a medical facility."],
      ["vr-summary", "Which title best fits the passage?", "A Library's Practical Response to a Heat Alert", ["Why Libraries Should Stop Offering Activities", "A Medical Clinic Opens in a Reading Room", "How Board Games Increased Flat Temperatures"], "The passage describes a practical cool-room service and later activity adjustment."],
    ],
  },
  {
    setId: "vr-round2-train-art",
    stimulus: [
      "A train station commissioned murals along a temporary walkway while its main concourse was refurbished. The artwork showed local manufacturing history and was painted on removable panels. Station managers wanted the route to feel less like a building site.",
      "A survey found that passengers noticed the murals, but many still complained about poor lighting at the walkway entrance. The panels will be offered to community centres once the concourse reopens.",
    ],
    items: [
      ["vr-detail", "Why were the murals commissioned?", "To make the temporary route feel less like a building site.", ["To advertise new train fares.", "To replace the main concourse permanently.", "To block the walkway entrance."], "The first paragraph gives this purpose."],
      ["vr-author", "Which criticism remained despite the murals?", "Poor lighting at the walkway entrance.", ["The panels were impossible to remove.", "Passengers did not notice the murals.", "The artwork ignored local history."], "The survey found passengers noticed the murals but complained about lighting."],
      ["vr-inference", "What can be inferred about the panels?", "They were intended to have a use beyond the refurbishment.", ["They were painted directly onto permanent walls.", "They would be destroyed when the concourse reopened.", "They were not visible to passengers."], "They will be offered to community centres after reopening."],
      ["vr-negative", "Which is not stated in the passage?", "The murals reduced every passenger complaint.", ["The murals showed manufacturing history.", "The panels were removable.", "The main concourse was being refurbished."], "Complaints about lighting remained."],
    ],
  },
  {
    setId: "vr-round2-digital-receipts",
    stimulus: [
      "A cafe chain made digital receipts the default for loyalty-card customers. Paper receipts remained available on request. The company said the change was designed to reduce printing, although it also gave customers a searchable record of purchases.",
      "After launch, staff spent more time explaining the option to older customers than expected. The company kept digital receipts as the default but changed the till prompt so staff had to mention the paper alternative clearly.",
    ],
    items: [
      ["vr-detail", "What remained available on request?", "Paper receipts.", ["A new loyalty card.", "Free drinks.", "Printed menus."], "Paper receipts remained available on request."],
      ["vr-inference", "Which inference is best supported?", "The company adjusted communication without abandoning the default.", ["The digital system was removed immediately.", "Older customers were barred from paper receipts.", "Staff no longer mentioned receipt options."], "The company kept the default but changed the prompt to mention paper clearly."],
      ["vr-author", "How is the change portrayed?", "As environmentally motivated but requiring clearer customer communication.", ["As a scheme with no practical difficulty.", "As an attempt to stop all purchase records.", "As a change only for staff convenience."], "The stated aim was reducing printing, but staff explanation needed adjustment."],
      ["vr-summary", "What is the main role of the second paragraph?", "To describe an implementation problem and the company's adjustment.", ["To explain how loyalty cards are manufactured.", "To argue that receipts are unnecessary in all cafes.", "To list every purchase made by customers."], "It reports extra explanation time and the revised till prompt."],
    ],
  },
  {
    setId: "vr-round2-community-lab",
    stimulus: [
      "A university opened a community laboratory where residents could test soil samples from gardens. The service identified nutrient levels and common contaminants, but it did not certify land as safe for building. Results were explained in group workshops rather than private consultations.",
      "Demand was highest from allotment groups after local flooding. Scientists said the workshops helped residents understand uncertainty, as a single sample could not represent every part of a garden.",
    ],
    items: [
      ["vr-detail", "What did the service not do?", "Certify land as safe for building.", ["Identify nutrient levels.", "Discuss uncertainty.", "Run group workshops."], "The passage says it did not certify land as safe for building."],
      ["vr-inference", "Why were workshops useful?", "They helped explain the limits of single-sample results.", ["They guaranteed every garden was safe.", "They removed demand from allotment groups.", "They replaced all soil tests."], "Scientists said workshops helped residents understand uncertainty."],
      ["vr-author", "Which attitude is shown towards the test results?", "Useful but limited by sampling uncertainty.", ["Completely useless.", "A legal guarantee for building.", "Unrelated to flooding concerns."], "The service provides information but a single sample cannot represent all areas."],
      ["vr-negative", "Which statement is not supported?", "Each resident received a private consultation.", ["Demand was high from allotment groups.", "The laboratory tested soil samples.", "The service identified common contaminants."], "Results were explained in group workshops rather than private consultations."],
    ],
  },
  {
    setId: "vr-round2-warehouse-robots",
    stimulus: [
      "A warehouse introduced small robots to move sealed boxes between packing benches. Staff still loaded fragile items by hand. Managers said the robots were meant to reduce walking time, not to replace quality checks.",
      "Walking distance fell during the trial, but box labelling errors did not. Supervisors concluded that the next improvement should focus on clearer shelf codes rather than faster robot routes.",
    ],
    items: [
      ["vr-detail", "What did staff still load by hand?", "Fragile items.", ["Sealed boxes only.", "Shelf-code labels.", "Robot batteries."], "The passage says fragile items were still loaded by hand."],
      ["vr-inference", "Which inference is best supported?", "Reducing walking time did not solve labelling accuracy problems.", ["Robots performed all quality checks.", "Walking distance increased during the trial.", "Shelf codes were already perfectly clear."], "Walking distance fell, but labelling errors did not."],
      ["vr-author", "How are the robots mainly evaluated?", "Helpful for movement efficiency but not for every warehouse problem.", ["A complete replacement for supervisors.", "The cause of all labelling errors.", "Unrelated to walking distance."], "They reduced walking but did not fix labelling."],
      ["vr-summary", "Which is the best summary?", "A robot trial reduced staff walking, while labelling errors required a different solution.", ["Robot routes became slower because fragile items were banned.", "Quality checks were removed after the robot trial.", "Boxes were no longer sealed at packing benches."], "The passage contrasts reduced walking with unchanged labelling errors."],
    ],
  },
  {
    setId: "vr-round2-museum-quiet",
    stimulus: [
      "A museum introduced quiet-viewing sessions before normal opening hours. Tickets were limited, lighting was kept steady, and audio exhibits were switched to caption mode. The museum did not change the content of the exhibitions.",
      "Feedback was strongest from visitors who usually avoided busy galleries. However, some said the early start was difficult, so the museum began testing one evening quiet session each month.",
    ],
    items: [
      ["vr-detail", "What happened to audio exhibits during quiet-viewing sessions?", "They were switched to caption mode.", ["They became louder.", "They were removed permanently.", "They changed exhibition content."], "The first paragraph states this."],
      ["vr-inference", "Why did the museum test an evening session?", "Some visitors found the early start difficult.", ["Visitors disliked steady lighting.", "The exhibitions changed content.", "Tickets were unlimited."], "The second paragraph links the evening test to difficulty with early starts."],
      ["vr-negative", "Which statement is not supported?", "The content of the exhibitions was changed for quiet viewing.", ["Tickets were limited.", "Lighting was kept steady.", "Feedback was strongest from visitors who avoided busy galleries."], "The museum did not change exhibition content."],
      ["vr-summary", "Which is the best summary?", "The museum adjusted access conditions while preserving exhibition content.", ["The museum closed normal opening hours.", "Quiet viewing removed captions.", "Evening sessions replaced all daytime visits."], "Quiet sessions changed conditions such as tickets, lighting and captions, not content."],
    ],
  },
];

const ROUND_TWO_VR_MCQ: UCATQuestion[] = ROUND_TWO_VR_MCQ_SETS.flatMap(
  (set, setIndex) =>
    set.items.map(([subtype, question, correctText, distractors, explanation], itemIndex) =>
      makeSingleQuestion({
        id: `${set.setId}-${itemIndex + 1}`,
        section: "vr",
        subtype,
        setId: set.setId,
        tags: vrTags(
          subtype === "vr-detail"
            ? "detail-retrieval"
            : subtype === "vr-inference"
              ? "inference-question"
              : subtype === "vr-author"
                ? "author-opinion"
                : subtype === "vr-negative"
                  ? "negative-except"
                  : "summary-structure",
          itemIndex === 0 ? "easy" : "medium",
          "text-stem"
        ),
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

export const ROUND_TWO_VR_QUESTIONS: UCATQuestion[] = [
  ...ROUND_TWO_VR_TFC,
  ...ROUND_TWO_VR_MCQ,
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

const ROUND_TWO_DM_SYLLOGISMS: UCATQuestion[] = [
  makeSyllogism({
    id: "dm-round2-syllogisms-001",
    stimulus:
      "Every amber pass is valid after 6 pm. Some valid-after-6 pm passes are visitor passes. No visitor pass opens the staff lift. Pass R is an amber pass.",
    tags: ["easy", "quick", "text-stem"],
    items: [
      { id: "r-valid", text: "Pass R is valid after 6 pm.", answerCategory: "yes" },
      { id: "r-visitor", text: "Pass R is a visitor pass.", answerCategory: "no" },
      { id: "visitor-not-lift", text: "No visitor pass opens the staff lift.", answerCategory: "yes" },
      { id: "amber-not-lift", text: "No amber pass opens the staff lift.", answerCategory: "no" },
      { id: "some-valid-visitor", text: "Some passes valid after 6 pm are visitor passes.", answerCategory: "yes" },
    ],
    explanation:
      "Pass R inherits validity after 6 pm from being amber. The visitor-pass facts do not prove that R, or all amber passes, are visitor passes.",
  }),
  makeSyllogism({
    id: "dm-round2-syllogisms-002",
    stimulus:
      "All sealed envelopes are counted. Every counted envelope is either logged or returned. No returned envelope is blue. Envelope K is sealed and not logged.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "k-counted", text: "Envelope K is counted.", answerCategory: "yes" },
      { id: "k-returned", text: "Envelope K is returned.", answerCategory: "yes" },
      { id: "k-not-blue", text: "Envelope K is not blue.", answerCategory: "yes" },
      { id: "all-counted-sealed", text: "Every counted envelope is sealed.", answerCategory: "no" },
      { id: "blue-logged", text: "Every blue envelope is logged.", answerCategory: "no" },
    ],
    explanation:
      "K is sealed, so counted; counted envelopes are logged or returned, and K is not logged, so it is returned and therefore not blue.",
  }),
  makeSyllogism({
    id: "dm-round2-syllogisms-003",
    stimulus:
      "Some trainee guides speak Welsh. All Welsh-speaking guides wear silver badges. No silver-badge guide leads the harbour route. Every harbour-route guide carries a radio.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "some-trainee-silver", text: "Some trainee guides wear silver badges.", answerCategory: "yes" },
      { id: "some-trainee-not-harbour", text: "Some trainee guides do not lead the harbour route.", answerCategory: "yes" },
      { id: "harbour-radio", text: "Every harbour-route guide carries a radio.", answerCategory: "yes" },
      { id: "silver-radio", text: "Every silver-badge guide carries a radio.", answerCategory: "no" },
      { id: "radio-harbour", text: "Every guide carrying a radio leads the harbour route.", answerCategory: "no" },
    ],
    explanation:
      "The Welsh-speaking trainee guides wear silver badges and therefore do not lead the harbour route. Radio information only applies one way from harbour-route guide to radio.",
  }),
  makeSyllogism({
    id: "dm-round2-syllogisms-004",
    stimulus:
      "No item stored in Freezer 2 is opened today. Some unopened items are quality-control samples. All quality-control samples are logged by noon. Vial P is stored in Freezer 2.",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    items: [
      { id: "p-unopened", text: "Vial P is not opened today.", answerCategory: "yes" },
      { id: "p-qc", text: "Vial P is a quality-control sample.", answerCategory: "no" },
      { id: "qc-noon", text: "All quality-control samples are logged by noon.", answerCategory: "yes" },
      { id: "some-unopened-noon", text: "Some unopened items are logged by noon.", answerCategory: "yes" },
      { id: "freezer-noon", text: "All items in Freezer 2 are logged by noon.", answerCategory: "no" },
    ],
    explanation:
      "P is unopened. Some unopened items are quality-control samples, and those samples are logged by noon, but this does not identify P or all Freezer 2 items as quality-control samples.",
  }),
  makeSyllogism({
    id: "dm-round2-syllogisms-005",
    stimulus:
      "All red folders contain invoices. Some invoice folders require manager approval. No folder requiring manager approval is stored off-site. Folder M is red.",
    tags: ["easy", "multi-step", "text-stem"],
    items: [
      { id: "m-invoices", text: "Folder M contains invoices.", answerCategory: "yes" },
      { id: "m-approval", text: "Folder M requires manager approval.", answerCategory: "no" },
      { id: "approval-not-offsite", text: "No folder requiring manager approval is stored off-site.", answerCategory: "yes" },
      { id: "red-not-offsite", text: "No red folder is stored off-site.", answerCategory: "no" },
      { id: "some-invoice-approval", text: "Some invoice folders require manager approval.", answerCategory: "yes" },
    ],
    explanation:
      "M contains invoices because it is red. The approval fact applies to only some invoice folders, so it cannot be attached to M or all red folders.",
  }),
  makeSyllogism({
    id: "dm-round2-syllogisms-006",
    stimulus:
      "Every late train is announced on the concourse screen. Some announced trains use Platform 4. No train using Platform 4 is an express service. Train T is late.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "t-announced", text: "Train T is announced on the concourse screen.", answerCategory: "yes" },
      { id: "t-platform4", text: "Train T uses Platform 4.", answerCategory: "no" },
      { id: "platform4-not-express", text: "No Platform 4 train is an express service.", answerCategory: "yes" },
      { id: "late-not-express", text: "No late train is an express service.", answerCategory: "no" },
      { id: "some-announced-not-express", text: "Some announced trains are not express services.", answerCategory: "yes" },
    ],
    explanation:
      "Late trains are announced. Some announced trains use Platform 4, and those are not express services, but T is not necessarily one of them.",
  }),
];

type GeneratedMcqRow = [string, string, string, string, string[], string];

const ROUND_TWO_DM_LOGIC_ROWS: GeneratedMcqRow[] = [
  ["dm-round2-logic-001", "Four rehearsals, Choir, Dance, Orchestra and Speech, are booked at 1 pm, 2 pm, 3 pm and 4 pm. Choir is earlier than Orchestra. Dance is immediately after Speech. Orchestra is not at 4 pm.", "Which rehearsal is at 4 pm?", "Dance", ["Choir", "Orchestra", "Speech"], "Orchestra cannot be 4 pm and must be after Choir. Speech and Dance must be consecutive, leaving Speech at 3 pm and Dance at 4 pm."],
  ["dm-round2-logic-002", "Nell, Omar, Pia and Quinn each choose a locker numbered 1 to 4. Nell's locker number is higher than Omar's. Pia's number is exactly two higher than Quinn's. Omar does not have locker 1.", "Who has locker 1?", "Quinn", ["Nell", "Omar", "Pia"], "Omar cannot be 1, and Nell is higher than Omar. Pia must be two higher than Quinn, so Quinn has 1 and Pia has 3."],
  ["dm-round2-logic-003", "Five books are arranged from left to right: Atlas, Botany, Chemistry, Drama and Ethics. Atlas is immediately left of Chemistry. Drama is right of Botany. Ethics is not at either end. Chemistry is not second.", "Which book could be far left?", "Botany", ["Atlas", "Chemistry", "Ethics"], "Atlas cannot be far left because Chemistry would be second. Ethics is not at an end, Chemistry cannot be far left, so Botany can be far left."],
  ["dm-round2-logic-004", "Three teams, Blue, Green and Red, each present in one room: 1, 2 or 3. The Red presentation is after the room 1 presentation. Green is not in room 2. Blue presents before Green.", "Which team presents in room 2?", "Red", ["Blue", "Green", "Cannot tell"], "Green cannot be room 2. Blue must be before Green, so Blue is room 1 and Green is room 3. Red is room 2."],
  ["dm-round2-logic-005", "A code uses the letters H, J, K and L once each. H is before K. J is not first or last. L is immediately after H.", "Which sequence is possible?", "H L J K", ["J H L K", "H K L J", "K H L J"], "Only H L J K keeps H before K, places L immediately after H, and keeps J away from both ends."],
  ["dm-round2-logic-006", "Four applicants rank 1st to 4th in a quiz. Maya ranks above Noor. Sol ranks immediately below Tia. Noor is not 4th. Tia ranks below Maya.", "Who ranks 2nd?", "Tia", ["Maya", "Noor", "Sol"], "Maya must be 1st. Sol is immediately below Tia, and Noor is not 4th, so the order is Maya, Tia, Sol, Noor."],
];

const ROUND_TWO_DM_LOGIC: UCATQuestion[] = ROUND_TWO_DM_LOGIC_ROWS.map(
  ([id, stimulus, question, correctText, distractors, explanation], index) =>
  makeSingleQuestion({
    id,
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [stimulus as string],
    question: question as string,
    correctText: correctText as string,
    distractors: distractors as string[],
    explanation: explanation as string,
    seed: index,
  })
);

const ROUND_TWO_DM_ARGUMENTS: UCATQuestion[] = [
  ["A hospital is considering whether volunteers at the entrance should be trained to guide patients to departments.", "Yes, because trained volunteers could reduce confusion and help patients reach appointments on time."],
  ["A university is considering whether all group coursework should include a short contribution log.", "Yes, because contribution logs may improve fairness and make unequal participation easier to identify."],
  ["A town is considering whether cycle lanes near schools should be physically separated from traffic.", "Yes, because separation could reduce collision risk for children cycling near busy school roads."],
  ["A pharmacy is considering whether medicine collection texts should include opening hours.", "Yes, because including hours could prevent wasted journeys and reduce avoidable calls to staff."],
  ["A theatre is considering whether relaxed performances should be offered once a month.", "Yes, because relaxed performances can make attendance more accessible for people who find standard performances difficult."],
].map(([proposal, correctText], index) =>
  makeSingleQuestion({
    id: `dm-round2-arguments-00${index + 1}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["easy", "quick", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Argument",
    stimulus: [proposal],
    question: "Select the strongest argument from the statements below.",
    correctText,
    distractors: [
      "Yes, because noticeboards sometimes have large fonts.",
      "No, because some buildings have several doors.",
      "No, because the weather may be different next week.",
    ],
    explanation:
      "The strongest argument is relevant to the decision and gives a plausible practical benefit. The other statements are irrelevant or weak.",
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

const ROUND_TWO_DM_YES_NO: UCATQuestion[] = [
  makeDmYesNo({
    id: "dm-round2-yes-no-001",
    stimulus: ["A charity recorded calls answered by four teams during one afternoon."],
    visual: {
      type: "table",
      title: "Call handling",
      headers: ["Team", "Hours", "Calls answered"],
      rows: [["A", "3", "54"], ["B", "4", "68"], ["C", "5", "95"], ["D", "6", "96"]],
    },
    statements: [
      { id: "c-fastest", text: "Team C answered the most calls per hour.", answer: "Yes" },
      { id: "d-most-total", text: "Team D answered the most calls in total.", answer: "Yes" },
      { id: "a-b-same", text: "Teams A and B had the same hourly rate.", answer: "No" },
      { id: "all-over-15", text: "Every team answered more than 15 calls per hour.", answer: "Yes" },
      { id: "a-plus-b-120", text: "Teams A and B answered more than 120 calls combined.", answer: "Yes" },
    ],
    explanation:
      "Rates are A 18, B 17, C 19 and D 16 calls per hour. A plus B answered 122 calls.",
  }),
  makeDmYesNo({
    id: "dm-round2-yes-no-002",
    stimulus: ["A snack stall sold three items at a school event."],
    visual: {
      type: "table",
      title: "Snack sales",
      headers: ["Item", "Sold", "Price"],
      rows: [["Fruit cups", "80", "2 pounds"], ["Wraps", "55", "4 pounds"], ["Juice", "120", "1.50 pounds"]],
    },
    statements: [
      { id: "fruit-160", text: "Fruit cups raised 160 pounds.", answer: "Yes" },
      { id: "wraps-most", text: "Wraps raised the most revenue.", answer: "Yes" },
      { id: "juice-more-sold", text: "More juice drinks than wraps were sold.", answer: "Yes" },
      { id: "total-560", text: "Total revenue was 560 pounds.", answer: "Yes" },
      { id: "fruit-half", text: "Fruit cups made up half of all items sold.", answer: "No" },
    ],
    explanation:
      "Revenue is fruit 160, wraps 220 and juice 180, for 560 total. Fruit cups are 80 of 255 items, not half.",
  }),
  makeDmYesNo({
    id: "dm-round2-yes-no-003",
    stimulus: ["A tank contains 900 litres when full. It begins 40% full, has 180 litres added, then 120 litres are used."],
    statements: [
      { id: "start-360", text: "The tank starts with 360 litres.", answer: "Yes" },
      { id: "after-add-540", text: "After adding water, the tank contains 540 litres.", answer: "Yes" },
      { id: "final-420", text: "After water is used, the tank contains 420 litres.", answer: "Yes" },
      { id: "overflow", text: "The tank overflows.", answer: "No" },
      { id: "final-half", text: "The final amount is less than half full.", answer: "Yes" },
    ],
    explanation:
      "40% of 900 is 360. Adding 180 gives 540; using 120 leaves 420, which is below half of 900.",
  }),
  makeDmYesNo({
    id: "dm-round2-yes-no-004",
    stimulus: ["A club recorded attendance at three sessions."],
    visual: {
      type: "table",
      title: "Club attendance",
      headers: ["Session", "Booked", "Attended"],
      rows: [["Morning", "50", "42"], ["Afternoon", "80", "60"], ["Evening", "70", "63"]],
    },
    statements: [
      { id: "evening-highest", text: "Evening had the highest attendance percentage.", answer: "Yes" },
      { id: "afternoon-75", text: "Afternoon attendance was 75% of bookings.", answer: "Yes" },
      { id: "morning-more", text: "Morning had more attendees than Afternoon.", answer: "No" },
      { id: "total-attended", text: "A total of 165 people attended.", answer: "Yes" },
      { id: "all-over-80", text: "Every session had attendance above 80%.", answer: "No" },
    ],
    explanation:
      "Percentages are Morning 84%, Afternoon 75% and Evening 90%. Total attendance is 42 + 60 + 63 = 165.",
  }),
  makeDmYesNo({
    id: "dm-round2-yes-no-005",
    stimulus: ["A printing job needs 1,500 pages. Printer A prints 45 pages per minute and Printer B prints 30 pages per minute. Both printers run together for 12 minutes."],
    statements: [
      { id: "combined-rate", text: "Together the printers produce 75 pages per minute.", answer: "Yes" },
      { id: "printed-900", text: "In 12 minutes they print 900 pages.", answer: "Yes" },
      { id: "remaining-600", text: "600 pages remain after 12 minutes.", answer: "Yes" },
      { id: "finished", text: "The job is completed in 12 minutes.", answer: "No" },
      { id: "a-alone-20", text: "Printer A alone would print 900 pages in 20 minutes.", answer: "Yes" },
    ],
    explanation:
      "The combined rate is 75 pages per minute, so 12 minutes produces 900 pages, leaving 600. Printer A prints 45 x 20 = 900 pages.",
  }),
];

type VennConfig = {
  id: string;
  title: string;
  labels: [string, string, string];
  counts: { a: number; b: number; c: number; ab: number; ac: number; bc: number; abc: number };
  ask: "exactly-one" | "exactly-two" | "at-least-two" | "a-total" | "a-not-c";
};

function solveVenn(config: VennConfig) {
  const { a, b, c, ab, ac, bc, abc } = config.counts;
  if (config.ask === "exactly-one") return a + b + c;
  if (config.ask === "exactly-two") return ab + ac + bc;
  if (config.ask === "at-least-two") return ab + ac + bc + abc;
  if (config.ask === "a-total") return a + ab + ac + abc;
  return a + ab;
}

const ROUND_TWO_DM_VENN: UCATQuestion[] = [
  ["dm-round2-venn-001", "Training choices", ["CPR", "Manual handling", "Safeguarding"], { a: 20, b: 16, c: 18, ab: 7, ac: 5, bc: 4, abc: 3 }, "at-least-two"],
  ["dm-round2-venn-002", "Cafe orders", ["Soup", "Salad", "Sandwich"], { a: 24, b: 14, c: 30, ab: 6, ac: 10, bc: 8, abc: 4 }, "exactly-two"],
  ["dm-round2-venn-003", "Revision topics", ["Algebra", "Graphs", "Geometry"], { a: 18, b: 22, c: 20, ab: 9, ac: 6, bc: 7, abc: 5 }, "a-total"],
  ["dm-round2-venn-004", "Volunteer shifts", ["Morning", "Afternoon", "Evening"], { a: 26, b: 20, c: 16, ab: 8, ac: 5, bc: 6, abc: 4 }, "a-not-c"],
  ["dm-round2-venn-005", "Device apps", ["Maps", "Payments", "Fitness"], { a: 35, b: 28, c: 24, ab: 12, ac: 9, bc: 10, abc: 6 }, "exactly-one"],
  ["dm-round2-venn-006", "Workshop materials", ["Slides", "Handouts", "Quiz"], { a: 15, b: 21, c: 19, ab: 6, ac: 7, bc: 5, abc: 2 }, "at-least-two"],
  ["dm-round2-venn-007", "Clinic letters", ["Email", "Post", "Text"], { a: 40, b: 25, c: 30, ab: 11, ac: 14, bc: 8, abc: 5 }, "exactly-two"],
  ["dm-round2-venn-008", "Student societies", ["Drama", "Debate", "Dance"], { a: 17, b: 23, c: 19, ab: 4, ac: 7, bc: 6, abc: 3 }, "a-total"],
].map(([id, title, labels, counts, ask], index) => {
  const config = { id, title, labels, counts, ask } as VennConfig;
  const correct = solveVenn(config);
  const questionText = {
    "exactly-one": "How many are in exactly one group?",
    "exactly-two": "How many are in exactly two groups?",
    "at-least-two": "How many are in at least two groups?",
    "a-total": `How many are in ${config.labels[0]}?`,
    "a-not-c": `How many are in ${config.labels[0]} but not ${config.labels[2]}?`,
  }[config.ask];

  return makeSingleQuestion({
    id: id as string,
    section: "dm",
    subtype: "dm-venn-sets",
    setId: id as string,
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
    distractors: [String(correct + config.counts.abc), String(Math.max(0, correct - config.counts.abc)), String(config.counts.a + config.counts.b)],
    explanation:
      "Read only the exact regions required by the wording and avoid double-counting overlaps.",
    seed: index,
  });
});

const ROUND_TWO_DM_PROBABILITY_ROWS: GeneratedMcqRow[] = [
  ["dm-round2-probability-001", "A box contains 4 green tokens and 6 orange tokens. Two tokens are drawn without replacement.", "What is the probability that both tokens are orange?", "1/3", ["3/5", "4/15", "2/5"], "The probability is 6/10 x 5/9 = 30/90 = 1/3."],
  ["dm-round2-probability-002", "A reminder call reaches 70% of patients. Of those reached, 80% attend.", "What proportion of all patients are expected to attend after being reached by the call?", "56%", ["70%", "80%", "15%"], "0.70 x 0.80 = 0.56, so 56%."],
  ["dm-round2-probability-003", "A spinner has 10 equal sections: 4 blue, 3 red, 2 yellow and 1 black.", "What is the probability of landing on blue or yellow?", "3/5", ["2/5", "1/2", "7/10"], "Blue or yellow covers 4 + 2 = 6 of 10 sections, which is 3/5."],
  ["dm-round2-probability-004", "A drawer has 5 black socks and 5 grey socks. Two socks are taken without replacement.", "What is the probability that the socks are different colours?", "5/9", ["1/2", "4/9", "2/9"], "Black then grey plus grey then black is 5/10 x 5/9 + 5/10 x 5/9 = 5/9."],
  ["dm-round2-probability-005", "A quality check flags 85% of faulty items and 10% of non-faulty items. In a batch, 30% of items are faulty.", "What percentage of all items are expected to be flagged?", "32.5%", ["25.5%", "38.5%", "95%"], "Faulty flagged: 30% x 85% = 25.5%. Non-faulty flagged: 70% x 10% = 7%. Total = 32.5%."],
];

const ROUND_TWO_DM_PROBABILITY: UCATQuestion[] = ROUND_TWO_DM_PROBABILITY_ROWS.map(
  ([id, stimulus, question, correctText, distractors, explanation], index) =>
  makeSingleQuestion({
    id,
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["easy", index > 2 ? "multi-step" : "quick", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [stimulus as string],
    question: question as string,
    correctText: correctText as string,
    distractors: distractors as string[],
    explanation: explanation as string,
    seed: index,
  })
);

export const ROUND_TWO_DM_QUESTIONS: UCATQuestion[] = [
  ...ROUND_TWO_DM_SYLLOGISMS,
  ...ROUND_TWO_DM_LOGIC,
  ...ROUND_TWO_DM_ARGUMENTS,
  ...ROUND_TWO_DM_YES_NO,
  ...ROUND_TWO_DM_VENN,
  ...ROUND_TWO_DM_PROBABILITY,
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
  { id: "qr-round2-stationery-sales", title: "Stationery sales", rows: [["Folders", 120, 0.9, 2.4], ["Pens", 240, 0.25, 0.8], ["Markers", 90, 0.7, 1.9], ["Pads", 75, 1.4, 3.2]] },
  { id: "qr-round2-cafe-items", title: "Cafe item sales", rows: [["Muffins", 85, 0.7, 2.2], ["Soup cups", 60, 1.1, 3.5], ["Tea", 140, 0.18, 1.4], ["Toasties", 55, 1.8, 4.8]] },
  { id: "qr-round2-charity-merch", title: "Charity merchandise", rows: [["Pins", 180, 0.3, 1.2], ["T-shirts", 45, 5.5, 12], ["Mugs", 70, 2.4, 6], ["Tote bags", 65, 2.1, 5.5]] },
  { id: "qr-round2-lab-supplies", title: "Lab supply orders", rows: [["Tubes", 400, 0.08, 0.22], ["Pipettes", 160, 0.35, 0.9], ["Labels", 600, 0.02, 0.08], ["Trays", 50, 1.6, 3.5]] },
  { id: "qr-round2-event-refreshments", title: "Event refreshments", rows: [["Water", 210, 0.25, 1], ["Fruit", 95, 0.6, 1.8], ["Wraps", 80, 1.7, 4.2], ["Biscuits", 150, 0.2, 0.75]] },
];

function makeSalesSet(set: SalesSet, setIndex: number): UCATQuestion[] {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Item", "Units sold", "Cost price", "Selling price"],
    rows: set.rows.map(([item, units, cost, price]) => [item, String(units), formatMoney(cost), formatMoney(price)]),
  };
  const stimulus = ["The table shows cost prices, selling prices and units sold for four items."];
  const revenue = set.rows[0][1] * set.rows[0][3];
  const profit = set.rows[1][1] * (set.rows[1][3] - set.rows[1][2]);
  const totalRevenue = set.rows.reduce((sum, row) => sum + row[1] * row[3], 0);
  const totalProfit = set.rows.reduce((sum, row) => sum + row[1] * (row[3] - row[2]), 0);
  const changed = set.rows[2][1] * 1.2 * set.rows[2][3] * 0.85;

  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What was the revenue from ${set.rows[0][0]}?`, correctText: formatMoney(revenue), distractors: [formatMoney(set.rows[0][1] * set.rows[0][2]), formatMoney(revenue + set.rows[0][1]), formatMoney(Math.max(0, revenue - set.rows[0][1]))], explanation: `${set.rows[0][1]} x ${formatMoney(set.rows[0][3])} = ${formatMoney(revenue)}.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `What was the profit from ${set.rows[1][0]}?`, correctText: formatMoney(profit), distractors: [formatMoney(set.rows[1][1] * set.rows[1][3]), formatMoney(set.rows[1][1] * set.rows[1][2]), formatMoney(profit + set.rows[1][1])], explanation: `Profit per unit is ${formatMoney(set.rows[1][3] - set.rows[1][2])}; multiply by ${set.rows[1][1]}.`, seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: "What was the overall profit margin to the nearest 0.1%?", correctText: formatPercent((totalProfit / totalRevenue) * 100), distractors: [formatPercent(totalProfit / 10), formatPercent((totalProfit / (totalRevenue - totalProfit)) * 100), formatPercent(((totalProfit + 20) / totalRevenue) * 100)], explanation: `Profit margin = total profit ${formatMoney(totalProfit)} / total revenue ${formatMoney(totalRevenue)} x 100.`, seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `If ${set.rows[2][0]} units sold rose by 20% and selling price fell by 15%, what would revenue be?`, correctText: formatMoney(changed), distractors: [formatMoney(set.rows[2][1] * set.rows[2][3]), formatMoney(set.rows[2][1] * 1.2 * set.rows[2][3]), formatMoney(set.rows[2][1] * set.rows[2][3] * 0.85)], explanation: `New revenue = old units x 1.20 x price x 0.85 = ${formatMoney(changed)}.`, seed: setIndex + 3 }),
  ];
}

type RouteSet = { id: string; title: string; scale: number; speed: number; rows: Array<[string, number, number]> };
const QR_ROUTE_SETS: RouteSet[] = [
  { id: "qr-round2-city-walks", title: "City walks", scale: 0.5, speed: 5, rows: [["Museum", 8, 30], ["River", 11, 20], ["Hill", 9, 80], ["Market", 7, 10]] },
  { id: "qr-round2-campus-paths", title: "Campus paths", scale: 0.3, speed: 4.5, rows: [["A", 6, 15], ["B", 8, 30], ["C", 10, 20], ["D", 7, 45]] },
  { id: "qr-round2-heritage-routes", title: "Heritage routes", scale: 0.7, speed: 5.6, rows: [["Castle", 5, 40], ["Mill", 7, 20], ["Canal", 8, 10], ["Tower", 6, 70]] },
  { id: "qr-round2-delivery-paths", title: "Delivery paths", scale: 0.4, speed: 6, rows: [["North", 12, 25], ["East", 9, 15], ["South", 10, 35], ["West", 8, 20]] },
  { id: "qr-round2-forest-trails", title: "Forest trails", scale: 0.6, speed: 4.8, rows: [["Oak", 7, 50], ["Beech", 8, 25], ["Ash", 9, 40], ["Yew", 6, 60]] },
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
  { id: "qr-round2-data-plans", title: "Data plans", unit: "GB", extra: 1.5, need: 28, rows: [["Mini", 8, 9, 0], ["Plus", 20, 18, 5], ["Max", 50, 36, 0], ["Family", 120, 78, 10]] },
  { id: "qr-round2-room-hire", title: "Room hire plans", unit: "hours", extra: 6, need: 14, rows: [["Short", 4, 30, 0], ["Day", 10, 70, 10], ["Week", 25, 150, 0], ["Group", 40, 220, 20]] },
  { id: "qr-round2-print-packages", title: "Print packages", unit: "pages", extra: 0.04, need: 520, rows: [["Lite", 150, 6, 0], ["Study", 400, 14, 2], ["Bulk", 800, 24, 0], ["Office", 1500, 42, 4]] },
  { id: "qr-round2-swim-passes", title: "Swim passes", unit: "sessions", extra: 3.5, need: 16, rows: [["Basic", 5, 15, 0], ["Active", 12, 32, 5], ["Unlimited", 30, 68, 0], ["Family", 60, 110, 15]] },
  { id: "qr-round2-lab-slots", title: "Lab slot plans", unit: "slots", extra: 8, need: 18, rows: [["Starter", 4, 25, 0], ["Core", 12, 70, 10], ["Pro", 24, 125, 0], ["Team", 60, 280, 25]] },
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
  const raisedCheapest = [...set.rows].map((row) => ({ row, cost: row[2] * 1.1 + Math.max(0, set.need - row[1]) * (set.extra * 0.8) })).sort((a, b) => a.cost - b.cost)[0];
  return [
    makeQr({ id: `${set.id}-001`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What is the monthly cost per included unit for the ${set.rows[1][0]} plan?`, correctText: formatMoney(unitCost), distractors: [formatMoney(unitCost + 0.5), formatMoney(unitCost * 2), formatMoney(set.rows[1][2])], explanation: `${formatMoney(set.rows[1][2])} divided by ${set.rows[1][1]} included units.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `A user needs ${set.need} ${set.unit}. What is the cheapest monthly cost?`, correctText: formatMoney(cheapest.cost), distractors: [formatMoney(planCost(set, set.rows[0])), formatMoney(planCost(set, set.rows[2])), formatMoney(cheapest.cost + set.extra * 2)], explanation: `Compare monthly price plus extras. Cheapest is ${cheapest.row[0]} at ${formatMoney(cheapest.cost)}.`, seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-percentages", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: `What is the annual cost of the ${set.rows[2][0]} plan including its joining fee?`, correctText: formatMoney(annual), distractors: [formatMoney(set.rows[2][2] * 12), formatMoney(annual + set.rows[2][2]), formatMoney(Math.max(0, annual - set.rows[2][2]))], explanation: `Annual cost is 12 monthly payments plus the joining fee.`, seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `Monthly prices rise by 10%, while extra ${set.unit} fall by 20%. What is the new cheapest cost for ${set.need} ${set.unit}?`, correctText: formatMoney(raisedCheapest.cost), distractors: [formatMoney(cheapest.cost), formatMoney(raisedCheapest.cost + set.extra), formatMoney(Math.max(0, raisedCheapest.cost - set.extra))], explanation: `Apply both changes to each plan and compare. The cheapest new cost is ${formatMoney(raisedCheapest.cost)}.`, seed: setIndex + 3 }),
  ];
}

type WorkSet = { id: string; title: string; rows: Array<[string, number, number]>; target: number };
const QR_WORK_SETS: WorkSet[] = [
  { id: "qr-round2-archive-work", title: "Archive work", rows: [["A", 5, 20], ["B", 8, 24], ["C", 6, 18], ["D", 10, 30]], target: 75 },
  { id: "qr-round2-cleanup-work", title: "Clean-up work", rows: [["E", 6, 18], ["F", 4, 16], ["G", 9, 27], ["H", 7, 21]], target: 63 },
  { id: "qr-round2-paint-work", title: "Paint work", rows: [["J", 8, 32], ["K", 5, 15], ["L", 10, 25], ["M", 6, 24]], target: 80 },
  { id: "qr-round2-entry-work", title: "Entry work", rows: [["N", 4, 20], ["P", 7, 21], ["Q", 5, 25], ["R", 8, 24]], target: 70 },
  { id: "qr-round2-sort-work", title: "Sort work", rows: [["S", 9, 27], ["T", 6, 30], ["U", 8, 24], ["V", 5, 15]], target: 66 },
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
    makeQr({ id: `${set.id}-001`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What percentage does Worker ${set.rows[0][0]} complete per day?`, correctText: `${formatNumber(rate0, 1)}%`, distractors: [`${set.rows[0][2]}%`, `${formatNumber(rate0 + 1, 1)}%`, `${formatNumber(rate0 * 2, 1)}%`], explanation: `Divide work completed by days worked.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `Workers ${set.rows[0][0]} and ${set.rows[1][0]} work together for 6 days. What percentage do they complete?`, correctText: `${formatNumber(combined, 1)}%`, distractors: [`${formatNumber(combined / 2, 1)}%`, `${formatNumber(combined + 6, 1)}%`, `${formatNumber(set.rows[0][2] + set.rows[1][2], 1)}%`], explanation: `Add their daily rates and multiply by 6.`, seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: `After that, how many days would Worker ${set.rows[2][0]} take to finish the project?`, correctText: `${formatNumber(finishDays, 1)} days`, distractors: [`${formatNumber(finishDays + 2, 1)} days`, `${formatNumber(Math.max(0, finishDays - 2), 1)} days`, `${formatNumber(remaining, 1)} days`], explanation: `Remaining work is divided by Worker ${set.rows[2][0]}'s daily rate.`, seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: `How many days would Worker ${set.rows[3][0]} take to complete ${set.target}% at the same rate?`, correctText: `${formatNumber(targetDays, 1)} days`, distractors: [`${formatNumber(targetDays + 3, 1)} days`, `${formatNumber(Math.max(0, targetDays - 3), 1)} days`, `${formatNumber(set.target / set.rows[3][2], 1)} days`], explanation: `Divide ${set.target}% by Worker ${set.rows[3][0]}'s daily rate.`, seed: setIndex + 3 }),
  ];
}

type DoseSet = { id: string; mgPerMl: number; dosePerKg: number; bottleMl: number; rows: Array<[string, number]> };
const QR_DOSE_SETS: DoseSet[] = [
  { id: "qr-round2-dose-a", mgPerMl: 25, dosePerKg: 8, bottleMl: 150, rows: [["A", 25], ["B", 35], ["C", 50], ["D", 60]] },
  { id: "qr-round2-dose-b", mgPerMl: 40, dosePerKg: 6, bottleMl: 120, rows: [["E", 20], ["F", 32], ["G", 48], ["H", 70]] },
  { id: "qr-round2-dose-c", mgPerMl: 30, dosePerKg: 10, bottleMl: 180, rows: [["J", 18], ["K", 27], ["L", 45], ["M", 54]] },
  { id: "qr-round2-dose-d", mgPerMl: 50, dosePerKg: 5, bottleMl: 100, rows: [["N", 30], ["P", 42], ["Q", 56], ["R", 72]] },
  { id: "qr-round2-dose-e", mgPerMl: 20, dosePerKg: 12, bottleMl: 200, rows: [["S", 16], ["T", 24], ["U", 36], ["V", 50]] },
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
    makeQr({ id: `${set.id}-001`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "easy", "quick"], stimulus, visual, question: `What is Patient ${set.rows[0][0]}'s daily dose?`, correctText: `${formatWhole(daily0)} mg`, distractors: [`${formatWhole(daily0 / 2)} mg`, `${formatWhole(set.rows[0][1] * set.mgPerMl)} mg`, `${formatWhole(daily0 + set.dosePerKg)} mg`], explanation: `Mass x daily dose per kg = daily dose.`, seed: setIndex }),
    makeQr({ id: `${set.id}-002`, subtype: "qr-units-geometry", setId: set.id, tags: ["data-display", "set-based", "easy", "multi-step"], stimulus, visual, question: `What volume is needed for each of Patient ${set.rows[1][0]}'s two daily doses?`, correctText: `${formatNumber(singleDose1, 1)} mL`, distractors: [`${formatNumber(singleDose1 * 2, 1)} mL`, `${formatNumber(singleDose1 / 2, 1)} mL`, `${formatNumber(singleDose1 + 1, 1)} mL`], explanation: "Find the daily dose, halve it, then divide by mg per mL.", seed: setIndex + 1 }),
    makeQr({ id: `${set.id}-003`, subtype: "qr-rates-ratios", setId: set.id, tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"], stimulus, visual, question: `How many complete days will one bottle last for Patient ${set.rows[2][0]}?`, correctText: `${days} days`, distractors: [`${days + 1} days`, `${Math.max(1, days - 1)} days`, `${days * 2} days`], explanation: "Divide bottle volume by the patient's daily volume and count complete days only.", seed: setIndex + 2 }),
    makeQr({ id: `${set.id}-004`, subtype: "qr-calculator-strategy", setId: set.id, tags: ["data-display", "set-based", "hard", "calculator-heavy", "multi-step", "time-consuming"], stimulus, visual, question: "How many bottles are needed for all four patients for 7 days?", correctText: `${bottles} bottles`, distractors: [`${Math.max(1, bottles - 1)} bottles`, `${bottles + 1} bottles`, `${bottles + 2} bottles`], explanation: "Calculate each patient's 7-day volume, total them, divide by bottle size and round up.", seed: setIndex + 3 }),
  ];
}

export const ROUND_TWO_QR_QUESTIONS: UCATQuestion[] = [
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
    setId: "sjt-round2-fatigue-placement",
    mode: "appropriateness",
    subtype: "sjt-appropriateness",
    stimulus: [
      "A medical student is finding a busy placement exhausting and notices that tiredness is affecting concentration. Other students appear to be coping well, and four weeks remain.",
      "How appropriate are the following responses by the student?",
    ],
    items: [
      ["Arrange to speak with the placement supervisor or personal tutor about support", "A", ["patient-safety", "communication", "escalation"], "Seeking support early is very appropriate and protects patients and the student."],
      ["Ask peers how they are managing the placement and whether they know useful routines", "B", ["teamwork", "communication"], "Peer advice may help, but it should not replace support from supervisors if performance is affected."],
      ["Email the school saying the placement is unreasonable without first discussing specific concerns locally", "C", ["communication", "teamwork"], "Raising concerns may be needed, but this route is premature and less constructive."],
      ["Ignore the problem because others seem to be coping", "D", ["patient-safety", "integrity"], "Ignoring compromised performance is very inappropriate."],
    ],
  },
  {
    setId: "sjt-round2-confidential-printer",
    mode: "importance",
    subtype: "sjt-importance",
    stimulus: [
      "A student collects teaching handouts from a shared printer and notices a clinic letter containing identifiable patient information mixed into the pile.",
      "How important are the following considerations?",
    ],
    items: [
      ["That identifiable patient information has been left in a shared area", "A", ["confidentiality", "integrity"], "This is a very important confidentiality concern."],
      ["That a staff member nearby may know where the letter should go", "B", ["teamwork", "escalation"], "This is important because it offers a safe way to handle the document."],
      ["That the student was only collecting teaching handouts", "C", ["scope-of-practice"], "The student's role affects what they should do, but not whether the information needs protecting."],
      ["That reading the letter might be interesting for learning", "D", ["confidentiality", "professional-boundaries"], "Curiosity is not a legitimate consideration."],
    ],
  },
  {
    setId: "sjt-round2-allergy-label",
    mode: "appropriateness",
    subtype: "sjt-appropriateness",
    stimulus: [
      "A student sees that a patient's wristband lists a latex allergy, but latex-containing equipment has been placed on the trolley for their procedure.",
      "How appropriate are the following responses?",
    ],
    items: [
      ["Immediately tell the supervising nurse or doctor about the allergy mismatch", "A", ["patient-safety", "escalation"], "This is very appropriate because it prevents possible harm."],
      ["Quietly remove the equipment without telling anyone why", "C", ["communication", "patient-safety"], "It may reduce immediate risk but fails to communicate the safety issue properly."],
      ["Assume the team has already checked the allergy", "D", ["patient-safety", "non-maleficence"], "Assuming is unsafe when a visible mismatch exists."],
      ["Ask whether latex-free equipment is needed before the procedure starts", "A", ["patient-safety", "communication"], "This is a clear and appropriate safety check."],
    ],
  },
  {
    setId: "sjt-round2-research-consent",
    mode: "importance",
    subtype: "sjt-importance",
    stimulus: [
      "A student helping with a questionnaire study notices a participant asking whether saying no will affect their clinic appointment.",
      "How important are the following considerations?",
    ],
    items: [
      ["That participation in research should be voluntary", "A", ["autonomy", "capacity-consent"], "Voluntary consent is fundamental."],
      ["That the participant may feel pressured because the study is in a clinic", "A", ["autonomy", "justice"], "Possible pressure is very important and should be addressed."],
      ["That the student wants to reach the recruitment target", "D", ["integrity", "justice"], "Recruitment targets should not influence consent."],
      ["That a supervisor can clarify the consent script", "B", ["escalation", "communication"], "This is important as a practical route to respond safely."],
    ],
  },
  {
    setId: "sjt-round2-disrespectful-joke",
    mode: "appropriateness",
    subtype: "sjt-communication",
    stimulus: [
      "During a ward break, a student hears another student make a mocking joke about a patient who was anxious during a procedure.",
      "How appropriate are the following responses?",
    ],
    items: [
      ["Tell the student privately that the joke was disrespectful", "A", ["respect-dignity", "communication"], "A private, clear challenge is very appropriate."],
      ["Laugh along because it was not said in front of the patient", "D", ["respect-dignity", "integrity"], "This normalises disrespectful behaviour."],
      ["Consider seeking advice if similar comments continue", "B", ["escalation", "professional-boundaries"], "This may be appropriate if the pattern continues."],
      ["Post about the incident on social media without names", "D", ["confidentiality", "professional-boundaries"], "Public posting is not a professional way to manage the concern."],
    ],
  },
  {
    setId: "sjt-round2-missed-teaching",
    mode: "importance",
    subtype: "sjt-integrity",
    stimulus: [
      "A student forgets to attend compulsory teaching and a friend offers to sign the attendance sheet for them.",
      "How important are the following considerations?",
    ],
    items: [
      ["That signing for someone else would be dishonest", "A", ["integrity"], "This is very important."],
      ["That the teaching was compulsory", "B", ["integrity", "justice"], "This is important, but honesty remains the central issue."],
      ["That the friend is trying to be helpful", "C", ["teamwork"], "The friend's intention is minor compared with the dishonest act."],
      ["That nobody may check the sheet", "D", ["integrity"], "The chance of being caught is not a valid consideration."],
    ],
  },
];

const ROUND_TWO_SJT_RATINGS: UCATQuestion[] = SJT_RATING_SETS.flatMap((set) =>
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

const ROUND_TWO_SJT_DRAG_CATEGORY: UCATQuestion[] = [
  ["sjt-round2-drag-shift-fatigue", "A student feels unsafe to continue because they are too tired to concentrate during a long shift.", [["tell", "Tell the supervising clinician that fatigue is affecting concentration", "appropriate"], ["hide", "Keep working without telling anyone", "inappropriate"], ["break", "Ask whether a short break or support is possible", "appropriate"]], ["patient-safety", "communication", "escalation"]],
  ["sjt-round2-drag-wrong-patient", "A patient is called by the wrong name before a blood test.", [["pause", "Pause and check the patient's identity using approved identifiers", "appropriate"], ["continue", "Continue because the patient answered", "inappropriate"], ["staff", "Tell the staff member about the mismatch", "appropriate"]], ["patient-safety", "communication", "non-maleficence"]],
  ["sjt-round2-drag-interpreter", "A relative offers to interpret sensitive symptoms for a patient with limited English.", [["professional", "Ask staff whether a professional interpreter can be arranged", "appropriate"], ["privacy", "Use the relative for all sensitive questions because it is quicker", "inappropriate"], ["direct", "Continue to address the patient directly while arranging support", "appropriate"]], ["communication", "confidentiality", "autonomy"]],
  ["sjt-round2-drag-portfolio", "A student is tempted to exaggerate what they did in a skills portfolio.", [["accurate", "Record only what was actually done", "appropriate"], ["exaggerate", "Exaggerate because the skill was observed before", "inappropriate"], ["ask", "Ask a supervisor how to evidence partial involvement", "appropriate"]], ["integrity", "scope-of-practice", "communication"]],
  ["sjt-round2-drag-queue", "A patient waiting at reception says they feel suddenly short of breath.", [["alert", "Alert reception or clinical staff immediately", "appropriate"], ["admin", "Finish routine paperwork before mentioning it", "inappropriate"], ["seat", "Help them sit safely if it is safe to do so", "appropriate"]], ["patient-safety", "escalation", "beneficence"]],
  ["sjt-round2-drag-private-message", "A patient sends a student a private social media message after placement.", [["reply", "Reply with personal advice about symptoms", "inappropriate"], ["boundary", "Do not provide care through a personal account", "appropriate"], ["supervisor", "Ask the placement team how to handle the contact", "appropriate"]], ["professional-boundaries", "confidentiality", "patient-safety"]],
  ["sjt-round2-drag-data-project", "A student analysing audit data finds that one row seems to contain a copied patient number.", [["check", "Check the source data through the approved secure route", "appropriate"], ["delete", "Delete the row secretly to avoid delay", "inappropriate"], ["supervisor", "Raise the concern with the audit supervisor", "appropriate"]], ["integrity", "confidentiality", "teamwork"]],
  ["sjt-round2-drag-chaperone", "A patient asks whether a chaperone is available before an examination.", [["respect", "Treat the request as reasonable and important", "appropriate"], ["dismiss", "Say a chaperone is unnecessary because the clinician is experienced", "inappropriate"], ["arrange", "Ask staff how to arrange a chaperone according to policy", "appropriate"]], ["respect-dignity", "autonomy", "professional-boundaries"]],
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
    "The safest responses protect patients, respect boundaries and use appropriate escalation. Unsafe or boundary-blurring responses should be rejected.",
}));

const ROUND_TWO_SJT_ORDERING: UCATQuestion[] = [
  ["sjt-round2-order-needle-bin", "A sharps bin is overfilled and a staff member is about to add another sharp.", [["pause", "Politely warn the staff member before another sharp is added"], ["move", "Move away from immediate risk"], ["report", "Tell the nurse in charge or supervisor"], ["policy", "Follow local reporting or replacement procedure"]], ["pause", "move", "report", "policy"]],
  ["sjt-round2-order-angry-patient", "A patient becomes angry after a long wait and begins raising their voice at the desk.", [["calm", "Remain calm and avoid arguing"], ["listen", "Acknowledge the concern and listen briefly"], ["help", "Ask appropriate staff for help if the situation escalates"], ["record", "Follow local reporting steps if there is aggression or risk"]], ["calm", "listen", "help", "record"]],
  ["sjt-round2-order-lost-notes", "A student realises a page of handwritten patient notes may have been left in a seminar room.", [["check", "Check the seminar room immediately if safe and nearby"], ["tell", "Tell the placement supervisor or information governance contact"], ["secure", "Secure any recovered notes without reading more than necessary"], ["reflect", "Reflect on how to transport notes securely in future"]], ["check", "tell", "secure", "reflect"]],
  ["sjt-round2-order-consent-doubt", "A patient appears unsure about a procedure after nodding during a consent explanation.", [["pause", "Do not treat the nod as enough on its own"], ["raise", "Tell the clinician that the patient may not have understood"], ["support", "Support clearer explanation within the student's role"], ["document", "Let the supervising team document the outcome appropriately"]], ["pause", "raise", "support", "document"]],
  ["sjt-round2-order-peer-error", "A peer tells you they gave a patient incorrect non-urgent information and hopes it will not matter.", [["encourage", "Encourage the peer to correct the information promptly"], ["patient", "Make sure the patient receives accurate information through the team"], ["supervisor", "Seek supervisor advice if the peer refuses"], ["reflect", "Reflect on communication accuracy afterwards"]], ["encourage", "patient", "supervisor", "reflect"]],
  ["sjt-round2-order-fire-alarm", "A fire alarm sounds while a student is speaking with a patient who walks slowly.", [["follow", "Follow local fire procedure immediately"], ["reassure", "Reassure the patient calmly"], ["help", "Seek staff help to move the patient safely"], ["learn", "Afterwards, clarify the evacuation process for future placements"]], ["follow", "reassure", "help", "learn"]],
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

const ROUND_TWO_SJT_MOST_LEAST: UCATQuestion[] = [
  ["sjt-round2-mostleast-result", "A student notices a result may have been filed under the wrong patient.", [["raise", "Raise the mismatch with the supervising clinician immediately"], ["ignore", "Ignore it because the student is not responsible for filing"], ["check", "Check patient identifiers carefully without browsing unrelated records"], ["guess", "Correct the record independently by guessing the intended patient"]], "raise", "guess"],
  ["sjt-round2-mostleast-social", "A peer asks to use a photo of a ward board in a private revision chat.", [["decline", "Say it should not be shared if patient information may be visible"], ["share", "Share it because the chat is private"], ["crop", "Suggest using approved anonymised teaching material instead"], ["laugh", "Make a joke about the patient names"]], "decline", "laugh"],
  ["sjt-round2-mostleast-gift", "A patient offers a student a high-value gift after a clinic.", [["decline", "Politely decline and explain professional boundaries"], ["accept", "Accept it to avoid upsetting the patient"], ["ask", "Ask a supervisor how to handle or document the offer"], ["sell", "Accept it and sell it later"]], "decline", "sell"],
  ["sjt-round2-mostleast-breach", "A student accidentally emails a teaching reflection with patient initials to the wrong tutor.", [["report", "Report the error through the appropriate route promptly"], ["delete", "Delete the sent email from their own inbox only"], ["minimise", "Assume initials are harmless and do nothing"], ["learn", "Review how to anonymise reflections in future"]], "report", "minimise"],
  ["sjt-round2-mostleast-scope", "A relative asks a student for a medication change recommendation.", [["signpost", "Explain that a qualified clinician must advise and help them contact the team"], ["advise", "Recommend a dose change based on what sounds sensible"], ["listen", "Listen to the concern and gather what they are worried about"], ["promise", "Promise the medication will be changed"]], "signpost", "advise"],
  ["sjt-round2-mostleast-team", "A nurse asks a student to do a task they have never been trained to do.", [["explain", "Explain honestly that they have not been trained and ask for supervision"], ["do", "Do it alone to appear helpful"], ["observe", "Offer to observe or help within competence"], ["hide", "Pretend they have done it before"]], "explain", "hide"],
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

export const ROUND_TWO_SJT_QUESTIONS: UCATQuestion[] = [
  ...ROUND_TWO_SJT_RATINGS,
  ...ROUND_TWO_SJT_DRAG_CATEGORY,
  ...ROUND_TWO_SJT_ORDERING,
  ...ROUND_TWO_SJT_MOST_LEAST,
];
