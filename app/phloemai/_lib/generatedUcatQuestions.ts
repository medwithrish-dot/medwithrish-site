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

function uniqueOptions(correctText: string, distractors: string[]) {
  return distractors.filter(
    (text, index) => text !== correctText && distractors.indexOf(text) === index
  );
}

function makeOptions(correctText: string, distractors: string[], seed: number) {
  const usableDistractors = uniqueOptions(correctText, distractors).slice(0, 3);
  const answerIndex = seed % 4;
  const texts = [...usableDistractors];

  while (texts.length < 3) {
    texts.push("Cannot be determined from the information given");
  }

  texts.splice(answerIndex, 0, correctText);

  return {
    answer: OPTION_KEYS[answerIndex],
    options: texts.map((text, index) => ({
      key: OPTION_KEYS[index],
      text,
    })),
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

function formatMinutes(value: number) {
  return `${formatNumber(value, 1)} minutes`;
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

function singularUnit(unit: string) {
  if (unit === "GB") return "GB";
  return unit.endsWith("s") ? unit.slice(0, -1) : unit;
}

const VR_TFC_SETS = [
  {
    setId: "vr-generated-tfc-night-buses",
    stimulus: [
      "Merton Council introduced a night-bus pilot after theatre staff reported that some workers were declining late shifts. The service ran on Fridays and Saturdays between 11 pm and 2 am. It stopped at five existing bus stops rather than creating new stops.",
      "Passenger surveys showed that most riders used the service after work, but a minority used it after social events. The council said the pilot would only continue if average occupancy reached 18 passengers per journey and if driver overtime costs stayed within the trial budget.",
    ],
    items: [
      {
        id: "service-friday-saturday",
        statement: "The night-bus pilot operated on Fridays and Saturdays.",
        answer: "A" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage states that the service ran on Fridays and Saturdays between 11 pm and 2 am.",
      },
      {
        id: "new-bus-stops",
        statement: "The pilot created five new bus stops.",
        answer: "B" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "It used five existing bus stops, so the statement about creating new stops is false.",
      },
      {
        id: "social-majority",
        statement: "Most passengers used the bus after social events.",
        answer: "B" as UCATOptionKey,
        tags: ["true-false-cant-tell", "medium", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage says most riders used the service after work and only a minority after social events.",
      },
      {
        id: "pilot-renewed",
        statement: "The council renewed the pilot for a second year.",
        answer: "C" as UCATOptionKey,
        tags: ["true-false-cant-tell", "medium", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage gives conditions for continuation but does not say whether the pilot was renewed.",
      },
    ],
  },
  {
    setId: "vr-generated-tfc-window-farms",
    stimulus: [
      "A housing association trialled window-mounted herb boxes in two apartment blocks. Residents could request mint, thyme or parsley seedlings, and the association provided compost from its grounds team. The trial aimed to test whether small growing spaces could improve residents' use of balconies.",
      "At the end of summer, staff found that shaded balconies produced fewer herbs but had fewer drying problems. Residents who attended a planting session were more likely to keep their boxes watered. The association did not measure whether residents spent more time outdoors.",
    ],
    items: [
      {
        id: "compost-provider",
        statement: "The association supplied compost during the trial.",
        answer: "A" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage says the association provided compost from its grounds team.",
      },
      {
        id: "all-balconies-sunny",
        statement: "All balconies in the trial received direct sunlight.",
        answer: "B" as UCATOptionKey,
        tags: ["true-false-cant-tell", "medium", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage refers to shaded balconies, so it cannot be true that all balconies received direct sunlight.",
      },
      {
        id: "outdoor-time",
        statement: "The herb boxes made residents spend more time outdoors.",
        answer: "C" as UCATOptionKey,
        tags: ["true-false-cant-tell", "hard", "time-consuming", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The association did not measure whether residents spent more time outdoors.",
      },
      {
        id: "planting-session-watered",
        statement:
          "Residents who attended a planting session were more likely to water their boxes.",
        answer: "A" as UCATOptionKey,
        tags: ["true-false-cant-tell", "medium", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage states that planting-session attendees were more likely to keep their boxes watered.",
      },
    ],
  },
  {
    setId: "vr-generated-tfc-archive-podcast",
    stimulus: [
      "A city archive released a podcast series using letters from a closed textile mill. Episodes combined readings from the letters with short interviews from former workers. The archive chose audio because many of the letters were too fragile for public handling.",
      "Download numbers were highest for episodes about apprenticeships, but school groups asked most often for episodes about machinery. The archive noted that the recordings did not replace access to the original documents for accredited researchers.",
    ],
    items: [
      {
        id: "letters-fragile",
        statement: "Some letters were too fragile for the public to handle.",
        answer: "A" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The archive chose audio because many letters were too fragile for public handling.",
      },
      {
        id: "video-series",
        statement: "The archive released the material as a video series.",
        answer: "B" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage states that the archive released a podcast series, not a video series.",
      },
      {
        id: "school-downloads",
        statement: "School groups produced the highest download numbers.",
        answer: "C" as UCATOptionKey,
        tags: ["true-false-cant-tell", "medium", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage says which episodes were downloaded most and which episodes school groups requested, but not who produced the downloads.",
      },
      {
        id: "researcher-access",
        statement:
          "Accredited researchers could still access the original documents.",
        answer: "A" as UCATOptionKey,
        tags: ["true-false-cant-tell", "hard", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The archive said the recordings did not replace access to original documents for accredited researchers.",
      },
    ],
  },
  {
    setId: "vr-generated-tfc-clinic-library",
    stimulus: [
      "A children's clinic placed a small book trolley in its waiting area after nurses noticed that younger patients became restless before appointments. Families could borrow picture books during the visit but were asked not to take them home. Volunteers cleaned returned books at the end of each clinic session.",
      "After six weeks, staff reported fewer interruptions at reception, although appointment delays had not changed. The clinic manager said the trolley was inexpensive because most books were donated. A formal study of anxiety levels was not carried out.",
    ],
    items: [
      {
        id: "take-home",
        statement: "Families were encouraged to take the books home.",
        answer: "B" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "Families could borrow books during the visit but were asked not to take them home.",
      },
      {
        id: "reception-interruptions",
        statement: "Staff reported fewer interruptions at reception after six weeks.",
        answer: "A" as UCATOptionKey,
        tags: ["true-false-cant-tell", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The second paragraph states that staff reported fewer interruptions at reception.",
      },
      {
        id: "delays-reduced",
        statement: "The trolley reduced appointment delays.",
        answer: "B" as UCATOptionKey,
        tags: ["true-false-cant-tell", "medium", "text-stem"] as UCATQuestionTag[],
        explanation:
          "The passage says appointment delays had not changed.",
      },
      {
        id: "anxiety-levels",
        statement: "Measured anxiety levels were lower after the trolley was introduced.",
        answer: "C" as UCATOptionKey,
        tags: ["true-false-cant-tell", "hard", "time-consuming", "text-stem"] as UCATQuestionTag[],
        explanation:
          "No formal study of anxiety levels was carried out, so the passage does not prove this.",
      },
    ],
  },
];

const GENERATED_VR_TFC_QUESTIONS: UCATQuestion[] = VR_TFC_SETS.flatMap((set) =>
  set.items.map((item, index) => ({
    id: `vr-generated-tfc-${item.id}`,
    section: "vr" as const,
    subtype: "vr-tfc" as const,
    setId: set.setId,
    tags: item.tags,
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: set.stimulus,
    question: `${item.statement} According to the passage, this statement is:`,
    options: TFC_OPTIONS,
    answer: item.answer,
    explanation: item.explanation,
    questionType: index % 2 === 0 ? "single" : undefined,
  }))
);

const VR_MCQ_SETS = [
  {
    setId: "vr-generated-sensors-market",
    stimulus: [
      "A covered market installed footfall sensors above three entrances. Traders wanted hourly estimates because weekend crowds often arrived in short bursts. The sensors counted movement rather than purchases, so a person leaving and returning could be counted twice.",
      "The first report showed that lunchtime footfall rose after a new seating area opened, but average spending per visitor was unchanged. Managers warned that the sensors could not explain why people entered the market unless survey data was added.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "Why did traders want hourly estimates?",
        correctText: "Weekend crowds often arrived in short bursts.",
        distractors: [
          "The sensors could record individual purchases.",
          "The market had closed two entrances.",
          "Average spending per visitor had risen sharply.",
        ],
        explanation:
          "The passage states that traders wanted hourly estimates because weekend crowds often arrived in short bursts.",
      },
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "medium", "text-stem"] as UCATQuestionTag[],
        question: "What limitation of the sensors is described?",
        correctText: "They counted movement rather than purchases.",
        distractors: [
          "They only worked in uncovered spaces.",
          "They could not record hourly data.",
          "They required every visitor to complete a survey.",
        ],
        explanation:
          "The sensors counted movement, so the data did not directly measure purchases or reasons for entering.",
      },
      {
        subtype: "vr-inference" as const,
        tags: ["inference-question", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which conclusion is best supported by the passage?",
        correctText:
          "Higher footfall did not necessarily mean visitors spent more on average.",
        distractors: [
          "The seating area reduced lunchtime footfall.",
          "The sensors proved why visitors entered the market.",
          "Every returning visitor was excluded from the figures.",
        ],
        explanation:
          "Lunchtime footfall rose, but average spending per visitor was unchanged.",
      },
      {
        subtype: "vr-summary" as const,
        tags: ["summary-structure", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which is the best summary of the passage?",
        correctText:
          "The sensors provided useful footfall data but could not fully explain visitor behaviour.",
        distractors: [
          "The sensors proved that all traders sold more after seating was added.",
          "The market removed survey data because movement counts were complete.",
          "The report focused only on visitor complaints about seating.",
        ],
        explanation:
          "The passage balances the usefulness of hourly footfall data with limits around spending and visitor motivation.",
      },
    ],
  },
  {
    setId: "vr-generated-river-cleanup",
    stimulus: [
      "A riverside charity began recording litter collected by volunteers after each monthly clean-up. It separated plastics, metals and textiles because local schools wanted to use the figures in lessons. Weighing took place at the storage shed, not on the riverbank.",
      "The charity cautioned that heavier bags did not always mean more items had been collected, as wet textiles could distort the totals. It planned to publish both item counts and weights once volunteers had received training in consistent recording.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "Where were bags weighed?",
        correctText: "At the storage shed.",
        distractors: ["On the riverbank.", "In local schools.", "At volunteers' homes."],
        explanation: "The passage says weighing took place at the storage shed.",
      },
      {
        subtype: "vr-inference" as const,
        tags: ["inference-question", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Why might item counts be useful alongside weights?",
        correctText: "Some materials can make weight totals misleading.",
        distractors: [
          "Weights were never recorded by the charity.",
          "Schools were not interested in the figures.",
          "The charity collected only metal litter.",
        ],
        explanation:
          "Wet textiles could distort weight totals, so item counts would provide a different measure.",
      },
      {
        subtype: "vr-author" as const,
        tags: ["author-opinion", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which attitude does the charity appear to take towards the data?",
        correctText: "Careful and cautious about how it should be interpreted.",
        distractors: [
          "Dismissive of all volunteer recording.",
          "Certain that weight alone is always sufficient.",
          "Uninterested in educational use of the figures.",
        ],
        explanation:
          "The charity separates categories, warns about distortion and plans training, showing caution.",
      },
      {
        subtype: "vr-negative" as const,
        tags: ["negative-except", "hard", "text-stem"] as UCATQuestionTag[],
        question: "Which of the following is not supported by the passage?",
        correctText: "Volunteers had already been fully trained in consistent recording.",
        distractors: [
          "Local schools wanted to use the figures in lessons.",
          "Wet textiles could affect the weight totals.",
          "The charity planned to publish item counts and weights.",
        ],
        explanation:
          "The passage says item counts and weights would be published once volunteers had received training, so full training had not already happened.",
      },
    ],
  },
  {
    setId: "vr-generated-micro-museums",
    stimulus: [
      "Several villages created micro-museums in unused shop windows. Each display held five to ten objects donated by residents, with QR codes linking to recorded memories. The organisers chose shop windows because the displays could be viewed without staffing a building.",
      "Some historians praised the project for capturing everyday stories, while others worried that short labels encouraged oversimplified accounts. The organisers responded by rotating displays every two months and archiving longer interviews online.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "Why were shop windows chosen for the displays?",
        correctText: "They could be viewed without staffing a building.",
        distractors: [
          "They allowed residents to handle every object.",
          "They removed the need for recorded memories.",
          "They could hold hundreds of objects at once.",
        ],
        explanation:
          "The passage gives this as the reason for choosing shop windows.",
      },
      {
        subtype: "vr-summary" as const,
        tags: ["summary-structure", "medium", "text-stem"] as UCATQuestionTag[],
        question: "What is the main role of the second paragraph?",
        correctText:
          "To present praise and concerns about the project, then describe the organisers' response.",
        distractors: [
          "To list every object donated by residents.",
          "To argue that historians should staff all displays.",
          "To explain how QR codes are manufactured.",
        ],
        explanation:
          "The paragraph gives praise, notes a criticism and explains how organisers responded.",
      },
      {
        subtype: "vr-author" as const,
        tags: ["author-opinion", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which statement would the organisers most likely agree with?",
        correctText:
          "Short displays can be strengthened by linking to fuller recorded accounts.",
        distractors: [
          "Every display should remain unchanged for several years.",
          "Objects donated by residents are unsuitable for village history.",
          "Recorded memories should be removed from the project.",
        ],
        explanation:
          "The organisers used QR-linked memories and archived longer interviews online.",
      },
      {
        subtype: "vr-negative" as const,
        tags: ["negative-except", "hard", "text-stem"] as UCATQuestionTag[],
        question: "Which of the following is not stated in the passage?",
        correctText: "The displays were staffed by trained curators every day.",
        distractors: [
          "Some historians praised the project.",
          "Displays were rotated every two months.",
          "Residents donated objects for the displays.",
        ],
        explanation:
          "The passage says the displays could be viewed without staffing a building.",
      },
    ],
  },
  {
    setId: "vr-generated-apprentice-scheme",
    stimulus: [
      "A regional engineering firm redesigned its apprentice induction after trainees said the first month felt disconnected from real projects. The new programme pairs each trainee with a workshop mentor and includes a weekly problem-solving session based on current contracts.",
      "Managers did not shorten safety training, but they moved some classroom sessions later in the year. Early feedback suggested trainees understood why procedures mattered when they had already seen the equipment in use.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "What prompted the firm to redesign the induction?",
        correctText:
          "Trainees said the first month felt disconnected from real projects.",
        distractors: [
          "Safety training had been removed.",
          "Current contracts had ended.",
          "Workshop mentors refused to work with trainees.",
        ],
        explanation:
          "The opening sentence gives trainees' feedback as the reason for the redesign.",
      },
      {
        subtype: "vr-inference" as const,
        tags: ["inference-question", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which inference is best supported by the passage?",
        correctText:
          "Practical context may help trainees understand formal procedures.",
        distractors: [
          "Classroom sessions were completely abandoned.",
          "The firm no longer values safety training.",
          "Mentors replaced all managers in the induction.",
        ],
        explanation:
          "Feedback suggested procedures made more sense after trainees had seen equipment in use.",
      },
      {
        subtype: "vr-author" as const,
        tags: ["author-opinion", "medium", "text-stem"] as UCATQuestionTag[],
        question: "How is the redesign mainly presented?",
        correctText: "As a practical adjustment that keeps safety training but changes its context.",
        distractors: [
          "As a rejection of all classroom teaching.",
          "As a way to reduce contact with real projects.",
          "As a scheme that removes mentors from workshops.",
        ],
        explanation:
          "The programme adds mentors and current-contract sessions while retaining safety training.",
      },
      {
        subtype: "vr-summary" as const,
        tags: ["summary-structure", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which title best fits the passage?",
        correctText: "Making Apprentice Induction More Connected to Practice",
        distractors: [
          "Why Safety Training Was Cancelled",
          "The End of Workshop Mentoring",
          "How Apprentices Choose Regional Contracts",
        ],
        explanation:
          "The central idea is that induction was redesigned to connect training with real work.",
      },
    ],
  },
  {
    setId: "vr-generated-urban-trees",
    stimulus: [
      "An urban tree survey mapped pavement trees by species, height and visible root damage. The survey excluded private gardens because the team could not access them consistently. Its purpose was to prioritise maintenance rather than estimate total tree cover.",
      "The report found that older lime trees provided the most shade but were also linked with the highest number of pavement repairs. It recommended targeted root-zone inspections before any decision to remove trees, noting that removal could reduce summer cooling.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "Why were private gardens excluded?",
        correctText: "The team could not access them consistently.",
        distractors: [
          "They contained no trees.",
          "They had already been inspected for roots.",
          "They were the only areas with lime trees.",
        ],
        explanation:
          "The passage says private gardens were excluded because access was inconsistent.",
      },
      {
        subtype: "vr-inference" as const,
        tags: ["inference-question", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which inference is most justified?",
        correctText:
          "The survey results should not be treated as a complete measure of all local trees.",
        distractors: [
          "The survey proved that no tree removals are ever justified.",
          "Private gardens were fully included in the maintenance ranking.",
          "Lime trees provided the least shade of any species.",
        ],
        explanation:
          "The survey excluded private gardens and aimed to prioritise maintenance, not estimate total tree cover.",
      },
      {
        subtype: "vr-negative" as const,
        tags: ["negative-except", "hard", "text-stem"] as UCATQuestionTag[],
        question: "Which of the following is not a recommendation in the passage?",
        correctText: "Immediate removal of all older lime trees.",
        distractors: [
          "Targeted root-zone inspections.",
          "Considering cooling effects before removal.",
          "Using the survey to prioritise maintenance.",
        ],
        explanation:
          "The report recommends inspections before removal decisions and notes the cooling benefit of trees.",
      },
      {
        subtype: "vr-summary" as const,
        tags: ["summary-structure", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which is the best summary of the report's position?",
        correctText:
          "Tree maintenance should balance pavement damage with shade and cooling benefits.",
        distractors: [
          "Tree cover can be measured accurately without public-space data.",
          "Older lime trees should be removed without further inspection.",
          "Private gardens are easier to survey than pavements.",
        ],
        explanation:
          "The report links lime trees with both shade and repairs, then recommends targeted inspection.",
      },
    ],
  },
  {
    setId: "vr-generated-sleep-cabins",
    stimulus: [
      "A railway operator tested nap cabins at a long-distance station for passengers with extended transfers. Each cabin could be booked for 45 minutes and included a light alarm rather than a sound alarm. Staff cleaned cabins between bookings, which limited the number of slots available.",
      "The trial was popular with passengers travelling overnight, but missed connections were not reduced. The operator concluded that the cabins improved comfort for some passengers but could not solve timetable gaps.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "How long could each cabin be booked for?",
        correctText: "45 minutes.",
        distractors: ["30 minutes.", "60 minutes.", "90 minutes."],
        explanation: "The passage states that each cabin could be booked for 45 minutes.",
      },
      {
        subtype: "vr-inference" as const,
        tags: ["inference-question", "medium", "text-stem"] as UCATQuestionTag[],
        question: "What can be inferred about cleaning between bookings?",
        correctText: "It reduced the total number of booking slots that could be offered.",
        distractors: [
          "It was carried out only once per day.",
          "It removed the need for light alarms.",
          "It caused all missed connections.",
        ],
        explanation:
          "The passage says cleaning between bookings limited the number of slots available.",
      },
      {
        subtype: "vr-author" as const,
        tags: ["author-opinion", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which statement best reflects the operator's conclusion?",
        correctText:
          "The cabins helped comfort but did not address the wider timetable problem.",
        distractors: [
          "The cabins were unpopular with overnight passengers.",
          "The cabins eliminated missed connections.",
          "The operator decided that comfort was irrelevant.",
        ],
        explanation:
          "The operator concluded that cabins improved comfort for some passengers but could not solve timetable gaps.",
      },
      {
        subtype: "vr-negative" as const,
        tags: ["negative-except", "hard", "text-stem"] as UCATQuestionTag[],
        question: "Which statement is not supported by the passage?",
        correctText: "The cabins used loud sound alarms to wake passengers.",
        distractors: [
          "The trial was popular with overnight travellers.",
          "The cabins were cleaned between bookings.",
          "Missed connections were not reduced.",
        ],
        explanation:
          "The passage says cabins used a light alarm rather than a sound alarm.",
      },
    ],
  },
  {
    setId: "vr-generated-repair-cafe",
    stimulus: [
      "A repair cafe asked visitors to record whether their broken item was repaired, partly repaired or not repairable. Volunteers also noted whether a missing part, lack of time or safety concern prevented repair. The cafe did not charge for labour, but visitors paid for replacement parts.",
      "The records showed that lamps and small radios were most often repaired fully. Kettles were frequently declined because volunteers were not permitted to work on sealed electrical heating units. The organisers used the data to decide which spare parts to stock at future events.",
    ],
    items: [
      {
        subtype: "vr-detail" as const,
        tags: ["detail-retrieval", "easy", "quick", "text-stem"] as UCATQuestionTag[],
        question: "What did visitors pay for?",
        correctText: "Replacement parts.",
        distractors: ["Volunteer labour.", "Entry tickets.", "Safety inspections only."],
        explanation:
          "The cafe did not charge for labour, but visitors paid for replacement parts.",
      },
      {
        subtype: "vr-inference" as const,
        tags: ["inference-question", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Why were some kettles declined?",
        correctText: "They involved sealed electrical heating units volunteers could not work on.",
        distractors: [
          "The cafe never accepted electrical items.",
          "Kettles did not require replacement parts.",
          "Visitors refused to record outcomes for kettles.",
        ],
        explanation:
          "Kettles were often declined because volunteers were not permitted to work on sealed electrical heating units.",
      },
      {
        subtype: "vr-author" as const,
        tags: ["author-opinion", "medium", "text-stem"] as UCATQuestionTag[],
        question: "How is record keeping mainly portrayed?",
        correctText: "As a way to learn from outcomes and plan future stock.",
        distractors: [
          "As a method for charging labour fees.",
          "As a way to avoid all safety decisions.",
          "As a replacement for volunteers' judgement.",
        ],
        explanation:
          "Records covered outcomes and barriers, and organisers used the data to plan spare parts.",
      },
      {
        subtype: "vr-summary" as const,
        tags: ["summary-structure", "medium", "text-stem"] as UCATQuestionTag[],
        question: "Which is the best summary of the passage?",
        correctText:
          "The cafe tracked repair outcomes to understand barriers and prepare better for future events.",
        distractors: [
          "The cafe repaired all kettles and stopped stocking radio parts.",
          "The cafe charged visitors for labour but not parts.",
          "The cafe recorded only successful repairs.",
        ],
        explanation:
          "The passage focuses on outcome recording, reasons repair failed and future spare-part planning.",
      },
    ],
  },
];

const GENERATED_VR_MCQ_QUESTIONS: UCATQuestion[] = VR_MCQ_SETS.flatMap(
  (set, setIndex) =>
    set.items.map((item, itemIndex) =>
      makeSingleQuestion({
        id: `vr-generated-${item.subtype}-${setIndex + 1}-${itemIndex + 1}`,
        section: "vr",
        subtype: item.subtype,
        setId: set.setId,
        tags: item.tags,
        title: "Verbal Reasoning Practice",
        leftTitle: "Passage",
        stimulus: set.stimulus,
        question: item.question,
        correctText: item.correctText,
        distractors: item.distractors,
        explanation: item.explanation,
        seed: setIndex + itemIndex,
      })
    )
);

export const GENERATED_VR_QUESTIONS: UCATQuestion[] = [
  ...GENERATED_VR_TFC_QUESTIONS,
  ...GENERATED_VR_MCQ_QUESTIONS,
];

const SYLLOGISM_CATEGORIES = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
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
    tags: input.tags,
    questionType: "drag-category",
    title: "Decision Making Practice",
    leftTitle: "Syllogism",
    stimulus: [input.stimulus],
    question: "Drag each conclusion to Yes if it follows, or No if it does not follow.",
    instruction: "Use only the information given in the syllogism.",
    categories: SYLLOGISM_CATEGORIES,
    categoryItems: input.items,
    explanation: input.explanation,
  };
}

const GENERATED_DM_SYLLOGISMS: UCATQuestion[] = [
  makeSyllogism({
    id: "dm-generated-syllogisms-001",
    stimulus:
      "The river sample is from Site A. All Site A samples are frozen. No frozen sample is analysed today. Some analysed samples are labelled urgent.",
    tags: ["easy", "quick", "text-stem"],
    items: [
      { id: "river-frozen", text: "The river sample is frozen.", answerCategory: "yes" },
      { id: "site-a-not-analysed", text: "No Site A sample is analysed today.", answerCategory: "yes" },
      { id: "urgent-site-a", text: "Some urgent samples are from Site A.", answerCategory: "no" },
      { id: "all-frozen-site-a", text: "All frozen samples are from Site A.", answerCategory: "no" },
      { id: "river-analysed", text: "The river sample is analysed today.", answerCategory: "no" },
    ],
    explanation:
      "The river sample is a Site A sample, so it is frozen, and frozen samples are not analysed today. Nothing reverses the Site A/frozen relationship or connects urgent samples to Site A.",
  }),
  makeSyllogism({
    id: "dm-generated-syllogisms-002",
    stimulus:
      "Mara's booking is an online booking. Every online booking receives a code. Some code holders choose lockers. No locker user enters through Gate 2. All Gate 2 entrants have wristbands.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "mara-code", text: "Mara's booking receives a code.", answerCategory: "yes" },
      { id: "code-not-gate2", text: "Some code holders do not enter through Gate 2.", answerCategory: "yes" },
      { id: "mara-locker", text: "Mara chooses a locker.", answerCategory: "no" },
      { id: "all-wristbands-gate2", text: "All wristband holders enter through Gate 2.", answerCategory: "no" },
      { id: "lockers-no-wristband", text: "No locker user has a wristband.", answerCategory: "no" },
    ],
    explanation:
      "Mara's online booking receives a code. Since some code holders use lockers and no locker user enters Gate 2, some code holders do not enter Gate 2. The other conclusions are not guaranteed.",
  }),
  makeSyllogism({
    id: "dm-generated-syllogisms-003",
    stimulus:
      "All silver folders are audit files. Every audit file is either archived or awaiting review. No archived file is on Desk 4. The silver folder labelled K is not awaiting review.",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    items: [
      { id: "k-audit", text: "Folder K is an audit file.", answerCategory: "yes" },
      { id: "k-archived", text: "Folder K is archived.", answerCategory: "yes" },
      { id: "k-not-desk4", text: "Folder K is not on Desk 4.", answerCategory: "yes" },
      { id: "all-review-silver", text: "Every file awaiting review is silver.", answerCategory: "no" },
      { id: "archived-audit", text: "Every archived file is an audit file.", answerCategory: "no" },
    ],
    explanation:
      "Folder K is silver, so it is an audit file. Audit files are archived or awaiting review; since K is not awaiting review, it must be archived and therefore not on Desk 4.",
  }),
  makeSyllogism({
    id: "dm-generated-syllogisms-004",
    stimulus:
      "Some evening volunteers are first-aid trained. All first-aid trained volunteers wear green lanyards. No volunteer wearing a green lanyard is assigned to the ticket desk. Every ticket-desk volunteer has completed induction.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "some-evening-green", text: "Some evening volunteers wear green lanyards.", answerCategory: "yes" },
      { id: "some-evening-not-ticket", text: "Some evening volunteers are not assigned to the ticket desk.", answerCategory: "yes" },
      { id: "all-inducted-ticket", text: "All inducted volunteers are assigned to the ticket desk.", answerCategory: "no" },
      { id: "first-aid-inducted", text: "All first-aid trained volunteers have completed induction.", answerCategory: "no" },
      { id: "ticket-first-aid", text: "Some ticket-desk volunteers are first-aid trained.", answerCategory: "no" },
    ],
    explanation:
      "The first-aid trained evening volunteers wear green lanyards, and green-lanyard volunteers are not on the ticket desk. Induction is only stated for ticket-desk volunteers.",
  }),
  makeSyllogism({
    id: "dm-generated-syllogisms-005",
    stimulus:
      "No tablet used in Room B is connected to the public network. Every device connected to the public network has two-factor login enabled. Some devices with two-factor login enabled are loan laptops. Tablet 8 is used in Room B.",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    items: [
      { id: "tablet8-not-public", text: "Tablet 8 is not connected to the public network.", answerCategory: "yes" },
      { id: "public-not-roomb-tablet", text: "No public-network device is a tablet used in Room B.", answerCategory: "yes" },
      { id: "tablet8-2fa", text: "Tablet 8 has two-factor login enabled.", answerCategory: "no" },
      { id: "loan-public", text: "Some loan laptops are connected to the public network.", answerCategory: "no" },
      { id: "all-2fa-public", text: "All devices with two-factor login are connected to the public network.", answerCategory: "no" },
    ],
    explanation:
      "Room B tablets are excluded from the public network, so Tablet 8 is excluded. The two-factor rule runs from public-network devices to two-factor login, not the reverse.",
  }),
  makeSyllogism({
    id: "dm-generated-syllogisms-006",
    stimulus:
      "Every blue crate is inspected before dispatch. Some inspected crates are sent by rail. No crate sent by rail contains glassware. Crate N is blue and contains glassware.",
    tags: ["medium", "multi-step", "text-stem"],
    items: [
      { id: "n-inspected", text: "Crate N is inspected before dispatch.", answerCategory: "yes" },
      { id: "n-not-rail", text: "Crate N is not sent by rail.", answerCategory: "yes" },
      { id: "blue-rail", text: "Some blue crates are sent by rail.", answerCategory: "no" },
      { id: "rail-inspected", text: "Some crates sent by rail are inspected.", answerCategory: "yes" },
      { id: "all-glass-blue", text: "All crates containing glassware are blue.", answerCategory: "no" },
    ],
    explanation:
      "Crate N is blue, so it is inspected. Because it contains glassware, it cannot be sent by rail. Some inspected crates are sent by rail, but they need not be blue.",
  }),
];

const GENERATED_DM_LOGIC: UCATQuestion[] = [
  makeSingleQuestion({
    id: "dm-generated-logic-001",
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      "Four talks, A, B, C and D, are scheduled at 10:00, 10:30, 11:00 and 11:30. Talk A is immediately before Talk C. Talk D is earlier than Talk B. Talk B is not last.",
    ],
    question: "Which talk is scheduled at 11:30?",
    correctText: "C",
    distractors: ["A", "B", "D"],
    explanation:
      "B is not last and D is earlier than B, so D and B must be 10:00 and 10:30. A is immediately before C, leaving A at 11:00 and C at 11:30.",
    seed: 0,
  }),
  makeSingleQuestion({
    id: "dm-generated-logic-002",
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      "Five files, Hazel, Ivy, Juniper, Kauri and Laurel, are stacked from top to bottom. Hazel is above Ivy but below Juniper. Kauri is immediately below Ivy. Laurel is not at the bottom.",
    ],
    question: "Which file must be at the top?",
    correctText: "Juniper",
    distractors: ["Hazel", "Ivy", "Laurel"],
    explanation:
      "The chain is Juniper above Hazel above Ivy above Kauri. Laurel cannot be bottom, so Laurel fits above Kauri but below Ivy, leaving Juniper at the top.",
    seed: 1,
  }),
  makeSingleQuestion({
    id: "dm-generated-logic-003",
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      "Nia, Omar, Priya and Rowan each choose one colour: amber, blue, coral or grey. Nia does not choose amber or blue. Omar chooses a colour alphabetically before Rowan's colour. Priya chooses grey.",
    ],
    question: "Which colour does Nia choose?",
    correctText: "Coral",
    distractors: ["Amber", "Blue", "Grey"],
    explanation:
      "Priya has grey. Nia cannot choose amber or blue, so Nia must choose coral. Omar and Rowan take amber and blue in that order.",
    seed: 2,
  }),
  makeSingleQuestion({
    id: "dm-generated-logic-004",
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      "A clinic uses Rooms 1, 2, 3 and 4 for audiology, dermatology, nutrition and physiotherapy. Nutrition is in an even-numbered room. Dermatology is immediately before physiotherapy. Audiology is not in Room 1.",
    ],
    question: "Which service could be in Room 1?",
    correctText: "Dermatology only",
    distractors: [
      "Audiology only",
      "Nutrition only",
      "Either dermatology or physiotherapy",
    ],
    explanation:
      "Audiology cannot be Room 1 and nutrition must be even. Physiotherapy cannot be Room 1 because dermatology must be immediately before it. Dermatology can be Room 1 with physiotherapy in Room 2.",
    seed: 3,
  }),
  makeSingleQuestion({
    id: "dm-generated-logic-005",
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "data-display"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      "Four runners finished a relay leg. Each clue compares finishing positions, where 1st is fastest.",
      "Mika finished before Sana. Jo finished immediately after Leo. Sana did not finish 4th. Leo finished after Mika.",
    ],
    question: "Who finished 2nd?",
    correctText: "Leo",
    distractors: ["Mika", "Jo", "Sana"],
    explanation:
      "Mika must be 1st. Leo is after Mika and immediately before Jo; Sana is not 4th. The order is Mika, Leo, Jo, Sana.",
    seed: 4,
  }),
  makeSingleQuestion({
    id: "dm-generated-logic-006",
    section: "dm",
    subtype: "dm-logic",
    tags: ["hard", "time-consuming", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      "Three parcels, P, Q and R, are delivered by bike, van and tram, one method each. The tram parcel is heavier than P. Q is not delivered by van. R is lighter than the bike parcel.",
    ],
    question: "Which parcel is delivered by bike?",
    correctText: "Q",
    distractors: ["P", "R", "Cannot tell"],
    explanation:
      "Q cannot be van. If Q were tram, the bike parcel would be P or R, but R must be lighter than the bike parcel and the tram parcel is heavier than P, causing a clash. The only consistent arrangement has Q by bike, R by tram and P by van.",
    seed: 5,
  }),
];

const GENERATED_DM_ARGUMENTS: UCATQuestion[] = [
  {
    proposal: "A school is considering whether students should lock phones away during formal mock exams.",
    correct:
      "Yes, because removing phones reduces opportunities for distraction and unfair access to information.",
    distractors: [
      "Yes, because phone cases come in many colours.",
      "No, because some desks are near windows.",
      "No, because mock exams are usually printed on paper.",
    ],
  },
  {
    proposal: "A library is deciding whether to keep a quiet hour each morning for users who prefer low noise.",
    correct:
      "Yes, because a predictable quiet period could improve access for users who find noise difficult.",
    distractors: [
      "Yes, because clocks are often found in libraries.",
      "No, because some books have hard covers.",
      "No, because morning weather can change.",
    ],
  },
  {
    proposal: "A clinic is considering whether appointment letters should include a plain-language map.",
    correct:
      "Yes, because clearer directions may reduce late arrivals and anxiety for patients unfamiliar with the site.",
    distractors: [
      "Yes, because maps are rectangular.",
      "No, because some patients wear coats.",
      "No, because letters are usually folded.",
    ],
  },
  {
    proposal: "A council is considering whether food stalls should display allergen information at eye level.",
    correct:
      "Yes, because visible allergen information can help customers make safer choices before ordering.",
    distractors: [
      "Yes, because stall signs can be colourful.",
      "No, because queues sometimes move slowly.",
      "No, because some stalls sell hot food.",
    ],
  },
  {
    proposal: "A sports centre is considering whether beginners should complete a short equipment induction.",
    correct:
      "Yes, because an induction can reduce avoidable injury and help users operate equipment correctly.",
    distractors: [
      "Yes, because equipment has brand names.",
      "No, because sports centres have changing rooms.",
      "No, because beginners may own trainers.",
    ],
  },
].map((item, index) =>
  makeSingleQuestion({
    id: `dm-generated-arguments-00${index + 1}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["easy", "quick", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Argument",
    stimulus: [item.proposal],
    question: "Select the strongest argument from the statements below.",
    correctText: item.correct,
    distractors: item.distractors,
    explanation:
      "The correct option directly addresses the decision with a relevant consequence. The other options are irrelevant or too weak.",
    seed: index,
  })
);

function makeDmYesNo(input: {
  id: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  tags: UCATQuestionTag[];
  statements: Array<{ id: string; text: string; answer: "Yes" | "No" }>;
  explanation: string;
}): UCATQuestion {
  return {
    id: input.id,
    section: "dm",
    subtype: "dm-yes-no",
    tags: input.tags,
    questionType: "yes-no",
    title: "Decision Making Practice",
    leftTitle: input.visual ? "Data" : "Information",
    stimulus: input.stimulus,
    visual: input.visual,
    question:
      "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
    instruction: "Use only the information given.",
    yesNoStatements: input.statements,
    explanation: input.explanation,
  };
}

const GENERATED_DM_YES_NO: UCATQuestion[] = [
  makeDmYesNo({
    id: "dm-generated-yes-no-001",
    stimulus: ["A community kitchen recorded meal boxes prepared by four teams in one morning."],
    visual: {
      type: "table",
      title: "Meal boxes",
      headers: ["Team", "Hours worked", "Boxes prepared"],
      rows: [
        ["A", "4", "96"],
        ["B", "5", "110"],
        ["C", "3", "81"],
        ["D", "6", "132"],
      ],
    },
    tags: ["easy", "time-consuming", "multi-step", "data-display"],
    statements: [
      { id: "c-fastest", text: "Team C prepared the most boxes per hour.", answer: "Yes" },
      { id: "d-total", text: "Team D prepared the greatest total number of boxes.", answer: "Yes" },
      { id: "a-b-rate", text: "Team A and Team B prepared boxes at the same hourly rate.", answer: "No" },
      { id: "all-over-25", text: "Every team prepared more than 25 boxes per hour.", answer: "No" },
      { id: "combined-200", text: "Teams A and B prepared more than 200 boxes combined.", answer: "Yes" },
    ],
    explanation:
      "The hourly rates are A 24, B 22, C 27 and D 22 boxes per hour. A and B made 206 boxes combined.",
  }),
  makeDmYesNo({
    id: "dm-generated-yes-no-002",
    stimulus: ["A student society tracked sign-ups and attendance for four workshops."],
    visual: {
      type: "table",
      title: "Workshop attendance",
      headers: ["Workshop", "Sign-ups", "Attended"],
      rows: [
        ["Interview", "80", "64"],
        ["Finance", "60", "45"],
        ["Coding", "72", "54"],
        ["Writing", "50", "42"],
      ],
    },
    tags: ["easy", "time-consuming", "multi-step", "data-display"],
    statements: [
      { id: "writing-rate", text: "Writing had the highest attendance percentage.", answer: "Yes" },
      { id: "interview-80", text: "Interview attendance was 80% of sign-ups.", answer: "Yes" },
      { id: "finance-coding-same", text: "Finance and Coding had the same attendance percentage.", answer: "Yes" },
      { id: "all-above-75", text: "Every workshop had attendance above 75%.", answer: "No" },
      { id: "coding-most", text: "Coding had the greatest number attending.", answer: "No" },
    ],
    explanation:
      "Attendance percentages are Interview 80%, Finance 75%, Coding 75% and Writing 84%. Interview had the largest number attending.",
  }),
  makeDmYesNo({
    id: "dm-generated-yes-no-003",
    stimulus: [
      "A delivery service charges 2.40 pounds per small parcel and 3.80 pounds per large parcel. On Monday it delivered 45 small parcels and 30 large parcels.",
    ],
    tags: ["easy", "time-consuming", "multi-step", "text-stem"],
    statements: [
      { id: "small-revenue", text: "Revenue from small parcels was 108 pounds.", answer: "Yes" },
      { id: "large-revenue", text: "Revenue from large parcels was greater than revenue from small parcels.", answer: "Yes" },
      { id: "total-222", text: "Total parcel revenue was 222 pounds.", answer: "Yes" },
      { id: "large-twice", text: "Large parcels produced twice as much revenue as small parcels.", answer: "No" },
      { id: "more-large", text: "More large parcels than small parcels were delivered.", answer: "No" },
    ],
    explanation:
      "Small revenue is 45 x 2.40 = 108 pounds. Large revenue is 30 x 3.80 = 114 pounds, giving 222 pounds total.",
  }),
  makeDmYesNo({
    id: "dm-generated-yes-no-004",
    stimulus: ["A cinema recorded ticket sales for a charity screening."],
    visual: {
      type: "table",
      title: "Ticket sales",
      headers: ["Ticket", "Sold", "Price"],
      rows: [
        ["Adult", "90", "8 pounds"],
        ["Student", "70", "5 pounds"],
        ["Child", "40", "4 pounds"],
      ],
    },
    tags: ["easy", "time-consuming", "multi-step", "data-display"],
    statements: [
      { id: "adult-revenue", text: "Adult tickets raised more than student and child tickets combined.", answer: "Yes" },
      { id: "total-tickets", text: "Exactly 200 tickets were sold.", answer: "Yes" },
      { id: "average-over-6", text: "The average revenue per ticket was more than 6 pounds.", answer: "Yes" },
      { id: "children-20", text: "Child tickets made up 20% of tickets sold.", answer: "Yes" },
      { id: "students-most-revenue", text: "Student tickets raised the most revenue.", answer: "No" },
    ],
    explanation:
      "Adult revenue is 720 pounds; student plus child revenue is 510 pounds. Total revenue is 1,230 pounds over 200 tickets, averaging 6.15 pounds.",
  }),
  makeDmYesNo({
    id: "dm-generated-yes-no-005",
    stimulus: [
      "A water tank holds 1,200 litres when full. It starts 70% full. A pump adds 90 litres per hour for 3 hours, then 150 litres are used.",
    ],
    tags: ["medium", "time-consuming", "multi-step", "text-stem"],
    statements: [
      { id: "start-840", text: "The tank starts with 840 litres.", answer: "Yes" },
      { id: "after-pump-1110", text: "After pumping, before use, the tank contains 1,110 litres.", answer: "Yes" },
      { id: "final-960", text: "After 150 litres are used, the tank contains 960 litres.", answer: "Yes" },
      { id: "overflow", text: "The tank overflows during the pumping period.", answer: "No" },
      { id: "final-80", text: "The final amount is exactly 80% of capacity.", answer: "Yes" },
    ],
    explanation:
      "The tank starts at 840 litres. Pumping adds 270 litres, giving 1,110 litres; after 150 litres are used, 960 litres remain, which is 80% of 1,200.",
  }),
];

type VennConfig = {
  id: string;
  title: string;
  labels: [string, string, string];
  counts: {
    a: number;
    b: number;
    c: number;
    ab: number;
    ac: number;
    bc: number;
    abc: number;
  };
  ask: "exactly-one" | "exactly-two" | "at-least-two" | "in-a" | "a-not-b";
};

function solveVenn(config: VennConfig) {
  const { a, b, c, ab, ac, bc, abc } = config.counts;
  if (config.ask === "exactly-one") return a + b + c;
  if (config.ask === "exactly-two") return ab + ac + bc;
  if (config.ask === "at-least-two") return ab + ac + bc + abc;
  if (config.ask === "in-a") return a + ab + ac + abc;
  return a + ac;
}

function makeVennQuestion(config: VennConfig, index: number): UCATQuestion {
  const [aLabel, bLabel, cLabel] = config.labels;
  const correct = solveVenn(config);
  const questionText: Record<VennConfig["ask"], string> = {
    "exactly-one": "How many people are in exactly one of the three groups?",
    "exactly-two": "How many people are in exactly two of the three groups?",
    "at-least-two": "How many people are in at least two of the three groups?",
    "in-a": `How many people are in ${aLabel}?`,
    "a-not-b": `How many people are in ${aLabel} but not ${bLabel}?`,
  };

  return makeSingleQuestion({
    id: `dm-generated-venn-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-venn-sets",
    setId: config.id,
    tags: [
      index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
      "multi-step",
      "set-based",
      "data-display",
    ],
    title: "Decision Making Practice",
    leftTitle: "Diagram",
    stimulus: [
      `The diagram shows people recorded in ${aLabel}, ${bLabel} and ${cLabel}. Each number represents people in that exact region.`,
    ],
    visual: {
      type: "set-diagram",
      title: config.title,
      shapes: [
        { id: "a", label: aLabel, shape: "circle", x: 85, y: 90, width: 260, height: 230 },
        { id: "b", label: bLabel, shape: "rectangle", x: 230, y: 90, width: 285, height: 215 },
        { id: "c", label: cLabel, shape: "triangle", x: 160, y: 40, width: 310, height: 315 },
      ],
      regionLabels: [
        { id: "a-only", text: String(config.counts.a), x: 130, y: 210 },
        { id: "b-only", text: String(config.counts.b), x: 455, y: 205 },
        { id: "c-only", text: String(config.counts.c), x: 310, y: 90 },
        { id: "a-b", text: String(config.counts.ab), x: 265, y: 230 },
        { id: "a-c", text: String(config.counts.ac), x: 225, y: 160 },
        { id: "b-c", text: String(config.counts.bc), x: 375, y: 160 },
        { id: "all", text: String(config.counts.abc), x: 300, y: 190 },
      ],
      legend: [
        { label: aLabel, shape: "circle" },
        { label: bLabel, shape: "rectangle" },
        { label: cLabel, shape: "triangle" },
      ],
    },
    question: questionText[config.ask],
    correctText: String(correct),
    distractors: [
      String(correct + config.counts.abc),
      String(Math.max(0, correct - config.counts.abc)),
      String(config.counts.a + config.counts.b + config.counts.c + config.counts.ab),
    ],
    explanation:
      "Use only the exact-region numbers required by the wording, taking care not to double-count overlap regions.",
    seed: index,
  });
}

const GENERATED_DM_VENN = [
  {
    id: "dm-generated-library-clubs",
    title: "Library clubs",
    labels: ["Reading", "Chess", "Coding"] as [string, string, string],
    counts: { a: 18, b: 14, c: 16, ab: 7, ac: 5, bc: 4, abc: 3 },
    ask: "at-least-two" as const,
  },
  {
    id: "dm-generated-clinic-services",
    title: "Clinic services",
    labels: ["Physio", "Diet", "Blood tests"] as [string, string, string],
    counts: { a: 20, b: 22, c: 15, ab: 6, ac: 8, bc: 5, abc: 4 },
    ask: "exactly-two" as const,
  },
  {
    id: "dm-generated-workshop-skills",
    title: "Workshop skills",
    labels: ["Planning", "Speaking", "Design"] as [string, string, string],
    counts: { a: 12, b: 18, c: 21, ab: 9, ac: 7, bc: 6, abc: 5 },
    ask: "in-a" as const,
  },
  {
    id: "dm-generated-festival-badges",
    title: "Festival badges",
    labels: ["Guide", "Marshal", "First aid"] as [string, string, string],
    counts: { a: 25, b: 19, c: 11, ab: 10, ac: 6, bc: 8, abc: 4 },
    ask: "a-not-b" as const,
  },
  {
    id: "dm-generated-course-modules",
    title: "Course modules",
    labels: ["Anatomy", "Ethics", "Stats"] as [string, string, string],
    counts: { a: 30, b: 24, c: 20, ab: 12, ac: 9, bc: 7, abc: 6 },
    ask: "exactly-one" as const,
  },
  {
    id: "dm-generated-device-features",
    title: "Device features",
    labels: ["Camera", "GPS", "NFC"] as [string, string, string],
    counts: { a: 40, b: 35, c: 28, ab: 15, ac: 10, bc: 12, abc: 8 },
    ask: "at-least-two" as const,
  },
  {
    id: "dm-generated-sports-teams",
    title: "Sports teams",
    labels: ["Rowing", "Running", "Cycling"] as [string, string, string],
    counts: { a: 16, b: 20, c: 14, ab: 5, ac: 4, bc: 9, abc: 2 },
    ask: "exactly-two" as const,
  },
  {
    id: "dm-generated-volunteer-roles",
    title: "Volunteer roles",
    labels: ["Kitchen", "Transport", "Admin"] as [string, string, string],
    counts: { a: 17, b: 13, c: 18, ab: 6, ac: 8, bc: 5, abc: 4 },
    ask: "in-a" as const,
  },
].map(makeVennQuestion);

const GENERATED_DM_PROBABILITY: UCATQuestion[] = [
  makeSingleQuestion({
    id: "dm-generated-probability-001",
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["easy", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      "A bag contains 5 red counters and 7 blue counters. Two counters are taken without replacement.",
    ],
    question: "What is the probability that both counters are red?",
    correctText: "5/33",
    distractors: ["25/144", "10/33", "5/12"],
    explanation:
      "The probability is 5/12 x 4/11 = 20/132 = 5/33.",
    seed: 0,
  }),
  makeSingleQuestion({
    id: "dm-generated-probability-002",
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["easy", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      "A clinic reminder system reaches 80% of patients by text. Of those reached, 75% confirm their appointment.",
    ],
    question: "What proportion of all patients confirm by text?",
    correctText: "60%",
    distractors: ["55%", "75%", "80%"],
    explanation:
      "0.80 x 0.75 = 0.60, so 60% of all patients confirm by text.",
    seed: 1,
  }),
  makeSingleQuestion({
    id: "dm-generated-probability-003",
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["easy", "quick", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      "A spinner has 8 equal sections: 3 green, 2 yellow and 3 purple.",
    ],
    question: "What is the probability of not landing on yellow?",
    correctText: "3/4",
    distractors: ["1/4", "3/8", "5/8"],
    explanation:
      "Six of the eight sections are not yellow, so the probability is 6/8 = 3/4.",
    seed: 2,
  }),
  makeSingleQuestion({
    id: "dm-generated-probability-004",
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["medium", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      "A drawer contains 6 black pens and 4 blue pens. A pen is selected, replaced, and then a second pen is selected.",
    ],
    question: "What is the probability of selecting one black pen and one blue pen in any order?",
    correctText: "12/25",
    distractors: ["6/25", "24/100", "2/5"],
    explanation:
      "Black then blue is 6/10 x 4/10. Blue then black is 4/10 x 6/10. Together this is 48/100 = 12/25.",
    seed: 3,
  }),
  makeSingleQuestion({
    id: "dm-generated-probability-005",
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["medium", "multi-step", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      "A screening check correctly flags 90% of faulty units and incorrectly flags 5% of working units. In a batch, 20% of units are faulty.",
    ],
    question: "What percentage of all units are expected to be flagged?",
    correctText: "22%",
    distractors: ["18%", "23%", "95%"],
    explanation:
      "Faulty flagged units are 20% x 90% = 18%. Working units flagged incorrectly are 80% x 5% = 4%. Total flagged = 22%.",
    seed: 4,
  }),
];

export const GENERATED_DM_QUESTIONS: UCATQuestion[] = [
  ...GENERATED_DM_SYLLOGISMS,
  ...GENERATED_DM_LOGIC,
  ...GENERATED_DM_ARGUMENTS,
  ...GENERATED_DM_YES_NO,
  ...GENERATED_DM_VENN,
  ...GENERATED_DM_PROBABILITY,
];

function makeQrQuestion(input: {
  id: string;
  subtype: UCATSubtypeId;
  setId: string;
  tags: UCATQuestionTag[];
  leftTitle: string;
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
  });
}

const retailSets = [
  {
    id: "qr-generated-market-stall",
    title: "Market stall stock",
    rows: [
      ["Jam jars", 120, 1.8, 3.5],
      ["Honey pots", 90, 2.4, 4.8],
      ["Tea tins", 75, 3.2, 6.4],
      ["Gift bags", 60, 2.1, 5.0],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-clinic-shop",
    title: "Clinic shop sales",
    rows: [
      ["Water bottles", 80, 4.0, 7.5],
      ["Notebook sets", 140, 1.6, 3.2],
      ["Badge reels", 110, 0.9, 2.4],
      ["Lunch bags", 65, 5.2, 9.0],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-book-fair",
    title: "Book fair stock",
    rows: [
      ["Revision guides", 55, 6.0, 10.5],
      ["Flashcard packs", 90, 2.5, 5.0],
      ["Pens", 180, 0.35, 1.0],
      ["Folders", 100, 0.8, 2.2],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-craft-table",
    title: "Craft table sales",
    rows: [
      ["Candles", 72, 2.2, 5.5],
      ["Cards", 160, 0.45, 1.5],
      ["Soap bars", 96, 1.1, 3.0],
      ["Ribbons", 120, 0.25, 0.9],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-sports-kiosk",
    title: "Sports kiosk sales",
    rows: [
      ["Protein bars", 150, 0.8, 1.8],
      ["Smoothies", 85, 1.5, 3.6],
      ["Towels", 60, 3.4, 7.0],
      ["Water cups", 220, 0.12, 0.5],
    ] as Array<[string, number, number, number]>,
  },
];

function makeRetailQrSet(set: (typeof retailSets)[number], setIndex: number) {
  const rows = set.rows;
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Item", "Units sold", "Cost price", "Selling price"],
    rows: rows.map(([item, units, cost, price]) => [
      item,
      String(units),
      formatMoney(cost),
      formatMoney(price),
    ]),
  };
  const stimulus = [
    "The table shows units sold, cost prices and selling prices for four items.",
  ];
  const revenue0 = rows[0][1] * rows[0][3];
  const profit1 = rows[1][1] * (rows[1][3] - rows[1][2]);
  const totalRevenue = rows.reduce((sum, row) => sum + row[1] * row[3], 0);
  const totalProfit = rows.reduce((sum, row) => sum + row[1] * (row[3] - row[2]), 0);
  const margin = (totalProfit / totalRevenue) * 100;
  const newRevenue2 = rows[2][1] * 1.25 * rows[2][3] * 0.9;

  return [
    makeQrQuestion({
      id: `${set.id}-001`,
      subtype: "qr-percentages",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "quick"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What was the revenue from ${rows[0][0]}?`,
      correctText: formatMoney(revenue0),
      distractors: [
        formatMoney(rows[0][1] * rows[0][2]),
        formatMoney(revenue0 - rows[0][1]),
        formatMoney(revenue0 + rows[0][2] * 10),
        formatMoney(revenue0 + rows[0][1]),
        formatMoney(revenue0 * 0.9),
      ],
      explanation: `${rows[0][1]} units at ${formatMoney(rows[0][3])} each gives ${formatMoney(revenue0)}.`,
      seed: setIndex,
    }),
    makeQrQuestion({
      id: `${set.id}-002`,
      subtype: "qr-percentages",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What was the profit from ${rows[1][0]}?`,
      correctText: formatMoney(profit1),
      distractors: [
        formatMoney(rows[1][1] * rows[1][3]),
        formatMoney(rows[1][1] * rows[1][2]),
        formatMoney(profit1 + rows[1][1]),
        formatMoney(Math.max(0, profit1 - rows[1][1])),
        formatMoney(profit1 + rows[1][2] * 10),
      ],
      explanation: `Profit per unit is ${formatMoney(rows[1][3] - rows[1][2])}. ${rows[1][1]} units give ${formatMoney(profit1)} profit.`,
      seed: setIndex + 1,
    }),
    makeQrQuestion({
      id: `${set.id}-003`,
      subtype: "qr-percentages",
      setId: set.id,
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: "What was the overall profit margin, to the nearest 0.1%?",
      correctText: formatPercent(margin),
      distractors: [
        formatPercent((totalProfit / rows.reduce((sum, row) => sum + row[1] * row[2], 0)) * 100),
        formatPercent(margin + 5),
        formatPercent(Math.max(0, margin - 5)),
      ],
      explanation: `Total profit is ${formatMoney(totalProfit)} and total revenue is ${formatMoney(totalRevenue)}. Profit margin = profit / revenue x 100 = ${formatPercent(margin)}.`,
      seed: setIndex + 2,
    }),
    makeQrQuestion({
      id: `${set.id}-004`,
      subtype: "qr-calculator-strategy",
      setId: set.id,
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `If ${rows[2][0]} units sold rose by 25% while the selling price fell by 10%, what would the new revenue be?`,
      correctText: formatMoney(newRevenue2),
      distractors: [
        formatMoney(rows[2][1] * rows[2][3]),
        formatMoney(rows[2][1] * 1.25 * rows[2][3]),
        formatMoney(rows[2][1] * rows[2][3] * 0.9),
      ],
      explanation: `New revenue = ${rows[2][1]} x 1.25 x ${formatMoney(rows[2][3])} x 0.90 = ${formatMoney(newRevenue2)}.`,
      seed: setIndex + 3,
    }),
  ];
}

const routeSets = [
  {
    id: "qr-generated-ridge-walks",
    title: "Ridge walks",
    scale: 0.8,
    speed: 5,
    climbRate: 1,
    rows: [
      ["A", 12.5, 80],
      ["B", 9, 120],
      ["C", 15, 60],
      ["D", 10.5, 90],
    ] as Array<[string, number, number]>,
  },
  {
    id: "qr-generated-campus-routes",
    title: "Campus routes",
    scale: 0.4,
    speed: 4.8,
    climbRate: 1.5,
    rows: [
      ["North", 6, 20],
      ["East", 8, 30],
      ["South", 5.5, 10],
      ["West", 7.5, 40],
    ] as Array<[string, number, number]>,
  },
  {
    id: "qr-generated-park-trails",
    title: "Park trails",
    scale: 0.6,
    speed: 4.5,
    climbRate: 1,
    rows: [
      ["Oak", 7, 50],
      ["Pine", 9, 30],
      ["Birch", 6.5, 70],
      ["Maple", 8, 20],
    ] as Array<[string, number, number]>,
  },
  {
    id: "qr-generated-delivery-loops",
    title: "Delivery loops",
    scale: 0.5,
    speed: 6,
    climbRate: 0.5,
    rows: [
      ["Loop 1", 10, 30],
      ["Loop 2", 12, 45],
      ["Loop 3", 8, 20],
      ["Loop 4", 11, 50],
    ] as Array<[string, number, number]>,
  },
  {
    id: "qr-generated-harbour-paths",
    title: "Harbour paths",
    scale: 0.7,
    speed: 5.6,
    climbRate: 1,
    rows: [
      ["Pier", 5, 10],
      ["Marina", 7.5, 35],
      ["Cliff", 6, 90],
      ["Bay", 8, 20],
    ] as Array<[string, number, number]>,
  },
];

function routeTime(set: (typeof routeSets)[number], row: [string, number, number]) {
  const distance = row[1] * set.scale;
  return (distance / set.speed) * 60 + (row[2] / 10) * set.climbRate;
}

function makeRouteQrSet(set: (typeof routeSets)[number], setIndex: number) {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Route", "Map length (cm)", "Climb (m)"],
    rows: set.rows.map(([route, length, climb]) => [
      route,
      String(length),
      String(climb),
    ]),
    note: `Scale: 1 cm to ${set.scale} km. Walking speed: ${set.speed} km/h. Add ${set.climbRate} minute(s) per 10 m of climb.`,
  };
  const stimulus = [
    `A walking map uses a scale of 1 cm to ${set.scale} km. Walking speed is ${set.speed} km per hour.`,
    `Add ${set.climbRate} minute(s) for each 10 m of climb.`,
  ];
  const dist0 = set.rows[0][1] * set.scale;
  const time1 = routeTime(set, set.rows[1]);
  const times = set.rows.map((row) => ({ label: row[0], time: routeTime(set, row) }));
  const fastest = [...times].sort((a, b) => a.time - b.time)[0];
  const diff = Math.abs(routeTime(set, set.rows[2]) - routeTime(set, set.rows[0]));

  return [
    makeQrQuestion({
      id: `${set.id}-001`,
      subtype: "qr-units-geometry",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "quick"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What is the actual distance of ${set.rows[0][0]}?`,
      correctText: `${formatNumber(dist0, 1)} km`,
      distractors: [
        `${formatNumber(set.rows[0][1], 1)} km`,
        `${formatNumber(set.rows[0][1] / set.scale, 1)} km`,
        `${formatNumber(dist0 + set.scale, 1)} km`,
      ],
      explanation: `${set.rows[0][1]} cm x ${set.scale} km per cm = ${formatNumber(dist0, 1)} km.`,
      seed: setIndex,
    }),
    makeQrQuestion({
      id: `${set.id}-002`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What is the estimated time for ${set.rows[1][0]}?`,
      correctText: formatMinutes(time1),
      distractors: [
        formatMinutes(((set.rows[1][1] * set.scale) / set.speed) * 60),
        formatMinutes(time1 + 10),
        formatMinutes(Math.max(0, time1 - 10)),
      ],
      explanation: `Distance is ${formatNumber(set.rows[1][1] * set.scale, 1)} km. Walking time plus climb time gives ${formatMinutes(time1)}.`,
      seed: setIndex + 1,
    }),
    makeQrQuestion({
      id: `${set.id}-003`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: "Which route is estimated to take the least time?",
      correctText: fastest.label,
      distractors: set.rows.map((row) => row[0]).filter((label) => label !== fastest.label),
      explanation: `Comparing distance and climb time, ${fastest.label} has the shortest estimated time at ${formatMinutes(fastest.time)}.`,
      seed: setIndex + 2,
    }),
    makeQrQuestion({
      id: `${set.id}-004`,
      subtype: "qr-calculator-strategy",
      setId: set.id,
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `How much longer is ${set.rows[2][0]} estimated to take than ${set.rows[0][0]}, using the absolute difference?`,
      correctText: formatMinutes(diff),
      distractors: [
        formatMinutes(Math.abs(((set.rows[2][1] - set.rows[0][1]) * set.scale) / set.speed) * 60),
        formatMinutes(diff + 5),
        formatMinutes(Math.max(0, diff - 5)),
      ],
      explanation: `Calculate both route times including climb, then subtract. The absolute difference is ${formatMinutes(diff)}.`,
      seed: setIndex + 3,
    }),
  ];
}

const dosageSets = [
  {
    id: "qr-generated-paediatric-dose",
    title: "Patient masses",
    mgPerMl: 25,
    dailyMgPerKg: 10,
    bottleMl: 150,
    rows: [
      ["A", 24],
      ["B", 30],
      ["C", 45],
      ["D", 60],
    ] as Array<[string, number]>,
  },
  {
    id: "qr-generated-antibiotic-dose",
    title: "Patient masses",
    mgPerMl: 40,
    dailyMgPerKg: 8,
    bottleMl: 200,
    rows: [
      ["E", 25],
      ["F", 35],
      ["G", 50],
      ["H", 70],
    ] as Array<[string, number]>,
  },
  {
    id: "qr-generated-vitamin-dose",
    title: "Patient masses",
    mgPerMl: 20,
    dailyMgPerKg: 6,
    bottleMl: 120,
    rows: [
      ["J", 20],
      ["K", 28],
      ["L", 40],
      ["M", 55],
    ] as Array<[string, number]>,
  },
  {
    id: "qr-generated-syrup-dose",
    title: "Patient masses",
    mgPerMl: 30,
    dailyMgPerKg: 12,
    bottleMl: 180,
    rows: [
      ["N", 18],
      ["P", 25],
      ["Q", 32],
      ["R", 45],
    ] as Array<[string, number]>,
  },
  {
    id: "qr-generated-oral-solution-dose",
    title: "Patient masses",
    mgPerMl: 50,
    dailyMgPerKg: 5,
    bottleMl: 100,
    rows: [
      ["S", 30],
      ["T", 44],
      ["U", 58],
      ["V", 72],
    ] as Array<[string, number]>,
  },
];

function makeDosageQrSet(set: (typeof dosageSets)[number], setIndex: number) {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Patient", "Mass"],
    rows: set.rows.map(([patient, mass]) => [patient, `${mass} kg`]),
  };
  const stimulus = [
    `An oral medicine contains ${set.mgPerMl} mg per mL.`,
    `The required daily dose is ${set.dailyMgPerKg} mg per kg of body mass, split into two equal doses. Each bottle contains ${set.bottleMl} mL.`,
  ];
  const daily0 = set.rows[0][1] * set.dailyMgPerKg;
  const doseVolume1 = (set.rows[1][1] * set.dailyMgPerKg) / 2 / set.mgPerMl;
  const dailyVolume2 = (set.rows[2][1] * set.dailyMgPerKg) / set.mgPerMl;
  const completeDays = Math.floor(set.bottleMl / dailyVolume2);
  const totalWeekVolume = set.rows.reduce(
    (sum, row) => sum + (row[1] * set.dailyMgPerKg * 7) / set.mgPerMl,
    0
  );
  const bottles = Math.ceil(totalWeekVolume / set.bottleMl);

  return [
    makeQrQuestion({
      id: `${set.id}-001`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "quick"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What is Patient ${set.rows[0][0]}'s required daily dose?`,
      correctText: `${formatWhole(daily0)} mg`,
      distractors: [
        `${formatWhole(set.rows[0][1] * set.mgPerMl)} mg`,
        `${formatWhole(daily0 / 2)} mg`,
        `${formatWhole(daily0 + set.dailyMgPerKg)} mg`,
      ],
      explanation: `${set.rows[0][1]} kg x ${set.dailyMgPerKg} mg/kg = ${formatWhole(daily0)} mg per day.`,
      seed: setIndex,
    }),
    makeQrQuestion({
      id: `${set.id}-002`,
      subtype: "qr-units-geometry",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What volume is needed for each of Patient ${set.rows[1][0]}'s two daily doses?`,
      correctText: `${formatNumber(doseVolume1, 1)} mL`,
      distractors: [
        `${formatNumber(doseVolume1 * 2, 1)} mL`,
        `${formatNumber(doseVolume1 / 2, 1)} mL`,
        `${formatNumber(doseVolume1 + 1, 1)} mL`,
      ],
      explanation: `Daily dose is ${set.rows[1][1] * set.dailyMgPerKg} mg, so each half-dose is ${(set.rows[1][1] * set.dailyMgPerKg) / 2} mg. Divide by ${set.mgPerMl} mg/mL.`,
      seed: setIndex + 1,
    }),
    makeQrQuestion({
      id: `${set.id}-003`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `How many complete days will one bottle last for Patient ${set.rows[2][0]}?`,
      correctText: `${completeDays} days`,
      distractors: [`${completeDays + 1} days`, `${Math.max(1, completeDays - 1)} days`, `${completeDays * 2} days`],
      explanation: `Patient ${set.rows[2][0]} needs ${formatNumber(dailyVolume2, 1)} mL per day. ${set.bottleMl} / ${formatNumber(dailyVolume2, 1)} gives ${completeDays} complete days.`,
      seed: setIndex + 2,
    }),
    makeQrQuestion({
      id: `${set.id}-004`,
      subtype: "qr-calculator-strategy",
      setId: set.id,
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      leftTitle: "Table",
      stimulus,
      visual,
      question: "How many bottles are needed to treat all four patients for 7 days?",
      correctText: `${bottles} bottles`,
      distractors: [`${Math.max(1, bottles - 1)} bottles`, `${bottles + 1} bottles`, `${bottles + 2} bottles`],
      explanation: `Total 7-day volume for all patients is ${formatNumber(totalWeekVolume, 1)} mL. Divide by ${set.bottleMl} mL per bottle and round up to ${bottles}.`,
      seed: setIndex + 3,
    }),
  ];
}

const planSets = [
  {
    id: "qr-generated-study-plans",
    title: "Study room plans",
    unit: "hours",
    extra: 2,
    need: 18,
    rise: 12.5,
    newExtra: 1.5,
    rows: [
      ["Mini", 6, 8, 5],
      ["Plus", 15, 15, 0],
      ["Max", 40, 32, 0],
      ["Family", 100, 70, 10],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-cloud-storage",
    title: "Cloud storage plans",
    unit: "GB",
    extra: 1.2,
    need: 75,
    rise: 10,
    newExtra: 0.9,
    rows: [
      ["Lite", 20, 6, 0],
      ["Core", 60, 14, 5],
      ["Pro", 120, 25, 0],
      ["Team", 300, 55, 10],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-print-plans",
    title: "Printing plans",
    unit: "pages",
    extra: 0.05,
    need: 450,
    rise: 8,
    newExtra: 0.04,
    rows: [
      ["Basic", 100, 4, 0],
      ["Student", 300, 10, 2],
      ["Studio", 600, 18, 0],
      ["Office", 1200, 32, 5],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-gym-plans",
    title: "Gym session plans",
    unit: "sessions",
    extra: 4,
    need: 14,
    rise: 15,
    newExtra: 3,
    rows: [
      ["Starter", 4, 18, 10],
      ["Active", 10, 32, 0],
      ["Unlimited", 30, 60, 0],
      ["Family", 60, 95, 20],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: "qr-generated-lab-subscriptions",
    title: "Lab booking plans",
    unit: "slots",
    extra: 6,
    need: 22,
    rise: 5,
    newExtra: 5,
    rows: [
      ["Solo", 5, 20, 0],
      ["Pair", 12, 42, 5],
      ["Group", 25, 80, 0],
      ["Department", 80, 210, 15],
    ] as Array<[string, number, number, number]>,
  },
];

function planCost(row: [string, number, number, number], need: number, extra: number) {
  return row[2] + Math.max(0, need - row[1]) * extra;
}

function makePlanQrSet(set: (typeof planSets)[number], setIndex: number) {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Plan", `Included ${set.unit}`, "Monthly price", "Joining fee"],
    rows: set.rows.map(([plan, included, price, fee]) => [
      plan,
      String(included),
      formatMoney(price),
      formatMoney(fee),
    ]),
    note: `Extra ${set.unit} cost ${formatMoney(set.extra)} each unless otherwise stated.`,
  };
  const stimulus = [
    `The table shows monthly plans. Extra ${set.unit} cost ${formatMoney(set.extra)} each unless otherwise stated.`,
  ];
  const unitCost1 = set.rows[1][2] / set.rows[1][1];
  const cheapest = [...set.rows]
    .map((row) => ({ plan: row[0], cost: planCost(row, set.need, set.extra) }))
    .sort((a, b) => a.cost - b.cost)[0];
  const annual = set.rows[2][2] * 12 + set.rows[2][3];
  const newCheapest = [...set.rows]
    .map((row) => ({
      plan: row[0],
      cost: row[2] * (1 + set.rise / 100) + Math.max(0, set.need - row[1]) * set.newExtra,
    }))
    .sort((a, b) => a.cost - b.cost)[0];

  return [
    makeQrQuestion({
      id: `${set.id}-001`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "quick"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What is the monthly cost per included ${singularUnit(set.unit)} for the ${set.rows[1][0]} plan?`,
      correctText: formatMoney(unitCost1),
      distractors: [formatMoney(unitCost1 + 0.5), formatMoney(unitCost1 * 2), formatMoney(set.rows[1][2])],
      explanation: `${formatMoney(set.rows[1][2])} / ${set.rows[1][1]} = ${formatMoney(unitCost1)} per included ${singularUnit(set.unit)}.`,
      seed: setIndex,
    }),
    makeQrQuestion({
      id: `${set.id}-002`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `A user needs ${set.need} ${set.unit} for one month. What is the cheapest monthly cost?`,
      correctText: formatMoney(cheapest.cost),
      distractors: [
        formatMoney(planCost(set.rows[0], set.need, set.extra)),
        formatMoney(planCost(set.rows[2], set.need, set.extra)),
        formatMoney(cheapest.cost + set.extra * 2),
        formatMoney(cheapest.cost + set.extra * 5),
        formatMoney(Math.max(0, cheapest.cost - set.extra * 2)),
      ],
      explanation: `Compare the plan price plus any extra ${set.unit}. The cheapest is ${cheapest.plan} at ${formatMoney(cheapest.cost)}.`,
      seed: setIndex + 1,
    }),
    makeQrQuestion({
      id: `${set.id}-003`,
      subtype: "qr-percentages",
      setId: set.id,
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What is the annual cost of the ${set.rows[2][0]} plan including its joining fee?`,
      correctText: formatMoney(annual),
      distractors: [
        formatMoney(set.rows[2][2] * 12),
        formatMoney(annual + set.rows[2][2]),
        formatMoney(set.rows[2][2] + set.rows[2][3]),
        formatMoney(annual + 12),
        formatMoney(Math.max(0, annual - set.rows[2][2])),
      ],
      explanation: `Annual cost = 12 x ${formatMoney(set.rows[2][2])} + ${formatMoney(set.rows[2][3])} = ${formatMoney(annual)}.`,
      seed: setIndex + 2,
    }),
    makeQrQuestion({
      id: `${set.id}-004`,
      subtype: "qr-calculator-strategy",
      setId: set.id,
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `Monthly prices rise by ${set.rise}%, but extra ${set.unit} fall to ${formatMoney(set.newExtra)} each. What is the new cheapest cost for ${set.need} ${set.unit}?`,
      correctText: formatMoney(newCheapest.cost),
      distractors: [
        formatMoney(cheapest.cost),
        formatMoney(newCheapest.cost + set.newExtra * 2),
        formatMoney(Math.max(0, newCheapest.cost - set.newExtra * 2)),
      ],
      explanation: `Apply the price rise to each monthly price, then add extra-${set.unit} costs. The cheapest new option is ${newCheapest.plan} at ${formatMoney(newCheapest.cost)}.`,
      seed: setIndex + 3,
    }),
  ];
}

const projectSets = [
  {
    id: "qr-generated-garden-work",
    title: "Garden work",
    rows: [
      ["A", 8, 20],
      ["B", 5, 15],
      ["C", 10, 30],
      ["D", 8, 25],
    ] as Array<[string, number, number]>,
    target: 50,
  },
  {
    id: "qr-generated-audit-work",
    title: "Audit work",
    rows: [
      ["E", 6, 18],
      ["F", 9, 27],
      ["G", 5, 20],
      ["H", 10, 25],
    ] as Array<[string, number, number]>,
    target: 60,
  },
  {
    id: "qr-generated-catalogue-work",
    title: "Catalogue work",
    rows: [
      ["J", 4, 16],
      ["K", 8, 24],
      ["L", 6, 18],
      ["M", 12, 30],
    ] as Array<[string, number, number]>,
    target: 45,
  },
  {
    id: "qr-generated-painting-work",
    title: "Painting work",
    rows: [
      ["N", 7, 21],
      ["P", 6, 18],
      ["Q", 9, 36],
      ["R", 5, 15],
    ] as Array<[string, number, number]>,
    target: 72,
  },
  {
    id: "qr-generated-data-entry-work",
    title: "Data entry work",
    rows: [
      ["S", 5, 25],
      ["T", 8, 32],
      ["U", 6, 18],
      ["V", 10, 30],
    ] as Array<[string, number, number]>,
    target: 80,
  },
];

function makeProjectQrSet(set: (typeof projectSets)[number], setIndex: number) {
  const visual: UCATChartVisual = {
    type: "table",
    title: set.title,
    headers: ["Worker", "Days worked", "Work completed"],
    rows: set.rows.map(([worker, days, percent]) => [
      worker,
      String(days),
      `${percent}%`,
    ]),
  };
  const stimulus = [
    "The table shows the percentage of a project completed by four workers and the number of days each worker worked.",
  ];
  const rate0 = set.rows[0][2] / set.rows[0][1];
  const combinedTenDays = (set.rows[0][2] / set.rows[0][1] + set.rows[1][2] / set.rows[1][1]) * 10;
  const remainingAfterAB = 100 - combinedTenDays;
  const cRate = set.rows[2][2] / set.rows[2][1];
  const cDays = remainingAfterAB / cRate;
  const dRate = set.rows[3][2] / set.rows[3][1];
  const targetDays = set.target / dRate;

  return [
    makeQrQuestion({
      id: `${set.id}-001`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "quick"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `What percentage of the project does Worker ${set.rows[0][0]} complete per day?`,
      correctText: `${formatNumber(rate0, 1)}%`,
      distractors: [`${set.rows[0][2]}%`, `${formatNumber(rate0 * 2, 1)}%`, `${formatNumber(rate0 + 1, 1)}%`],
      explanation: `${set.rows[0][2]}% / ${set.rows[0][1]} days = ${formatNumber(rate0, 1)}% per day.`,
      seed: setIndex,
    }),
    makeQrQuestion({
      id: `${set.id}-002`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "easy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `Workers ${set.rows[0][0]} and ${set.rows[1][0]} work together for 10 days. What percentage do they complete?`,
      correctText: `${formatNumber(combinedTenDays, 1)}%`,
      distractors: [`${formatNumber(combinedTenDays / 2, 1)}%`, `${formatNumber(combinedTenDays + 10, 1)}%`, `${formatNumber(set.rows[0][2] + set.rows[1][2], 1)}%`],
      explanation: `Their combined daily rate is ${formatNumber(set.rows[0][2] / set.rows[0][1] + set.rows[1][2] / set.rows[1][1], 1)}%, so in 10 days they complete ${formatNumber(combinedTenDays, 1)}%.`,
      seed: setIndex + 1,
    }),
    makeQrQuestion({
      id: `${set.id}-003`,
      subtype: "qr-rates-ratios",
      setId: set.id,
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `After Workers ${set.rows[0][0]} and ${set.rows[1][0]} work together for 10 days, how many days would Worker ${set.rows[2][0]} take to finish the project?`,
      correctText: `${formatNumber(cDays, 1)} days`,
      distractors: [`${formatNumber(cDays + 2, 1)} days`, `${formatNumber(Math.max(0, cDays - 2), 1)} days`, `${formatNumber(remainingAfterAB, 1)} days`],
      explanation: `They leave ${formatNumber(remainingAfterAB, 1)}%. Worker ${set.rows[2][0]}'s rate is ${formatNumber(cRate, 1)}% per day, so time = ${formatNumber(cDays, 1)} days.`,
      seed: setIndex + 2,
    }),
    makeQrQuestion({
      id: `${set.id}-004`,
      subtype: "qr-calculator-strategy",
      setId: set.id,
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      leftTitle: "Table",
      stimulus,
      visual,
      question: `How many days would Worker ${set.rows[3][0]} take to complete ${set.target}% of the project at the same daily rate?`,
      correctText: `${formatNumber(targetDays, 1)} days`,
      distractors: [`${formatNumber(targetDays + 2, 1)} days`, `${formatNumber(Math.max(0, targetDays - 2), 1)} days`, `${formatNumber(set.target / set.rows[3][2], 1)} days`],
      explanation: `Worker ${set.rows[3][0]}'s daily rate is ${formatNumber(dRate, 1)}%. ${set.target}% / ${formatNumber(dRate, 1)}% = ${formatNumber(targetDays, 1)} days.`,
      seed: setIndex + 3,
    }),
  ];
}

export const GENERATED_QR_QUESTIONS: UCATQuestion[] = [
  ...retailSets.flatMap(makeRetailQrSet),
  ...routeSets.flatMap(makeRouteQrSet),
  ...dosageSets.flatMap(makeDosageQrSet),
  ...planSets.flatMap(makePlanQrSet),
  ...projectSets.flatMap(makeProjectQrSet),
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
    options:
      input.mode === "importance" ? IMPORTANCE_OPTIONS : APPROPRIATENESS_OPTIONS,
    answer: input.answer,
    explanation: input.explanation,
  };
}

type SjtSingleSet = {
  setId: string;
  mode: "importance" | "appropriateness";
  subtype: UCATSubtypeId;
  stimulus: string[];
  items: Array<[string, UCATOptionKey, UCATSjtIssueTag[], string]>;
};

const sjtSingleSets: SjtSingleSet[] = [
  {
    setId: "sjt-generated-wrong-email",
    mode: "importance" as const,
    subtype: "sjt-importance" as const,
    stimulus: [
      "Nora, a medical student, is helping a clinic send appointment information. She notices that a draft email includes a patient's full name, date of birth and diagnosis, but the address appears to belong to another patient with a similar surname.",
      "How important are the following considerations for Nora when deciding what to do?",
    ],
    items: [
      ["That identifiable information may be sent to the wrong person", "A" as UCATOptionKey, ["confidentiality", "patient-safety"] as UCATSjtIssueTag[], "This is very important because it creates a serious confidentiality risk and should be corrected before sending."],
      ["That the email has not yet been sent", "B" as UCATOptionKey, ["confidentiality", "escalation"] as UCATSjtIssueTag[], "This is important because there is still an opportunity to prevent the breach."],
      ["That the two patients have similar surnames", "C" as UCATOptionKey, ["communication"] as UCATSjtIssueTag[], "This explains how the error may have happened, but it is not the central professional issue."],
      ["That correcting the email may delay the clinic by a few minutes", "D" as UCATOptionKey, ["confidentiality", "professional-boundaries"] as UCATSjtIssueTag[], "A small delay should not outweigh preventing disclosure of confidential information."],
    ],
  },
  {
    setId: "sjt-generated-fall-risk",
    mode: "appropriateness" as const,
    subtype: "sjt-appropriateness" as const,
    stimulus: [
      "Leo, a medical student, sees an older patient trying to stand from a chair while looking unsteady. The nurse is preparing medication nearby and another visitor is asking Leo for directions.",
      "How appropriate are the following responses by Leo?",
    ],
    items: [
      ["Approach the patient calmly and ask them to wait while he gets help", "A" as UCATOptionKey, ["patient-safety", "communication"] as UCATSjtIssueTag[], "This protects immediate safety while staying within a student role."],
      ["Ignore the patient because giving directions to the visitor is quicker", "D" as UCATOptionKey, ["patient-safety", "non-maleficence"] as UCATSjtIssueTag[], "Ignoring a likely fall risk is very inappropriate."],
      ["Alert the nurse that the patient may fall", "A" as UCATOptionKey, ["escalation", "patient-safety", "teamwork"] as UCATSjtIssueTag[], "Prompt escalation to staff is very appropriate."],
      ["Physically lift the patient into bed without asking anyone", "D" as UCATOptionKey, ["scope-of-practice", "patient-safety"] as UCATSjtIssueTag[], "Manual handling without training or help could harm the patient and Leo."],
    ],
  },
  {
    setId: "sjt-generated-peer-feedback",
    mode: "appropriateness" as const,
    subtype: "sjt-appropriateness" as const,
    stimulus: [
      "Ari is paired with a student who gives rushed explanations to patients during a teaching clinic. A patient looks confused but says nothing. Ari is worried about damaging the working relationship.",
      "How appropriate are the following responses by Ari?",
    ],
    items: [
      ["Check the patient's understanding respectfully before the consultation ends", "A" as UCATOptionKey, ["communication", "patient-safety"] as UCATSjtIssueTag[], "This keeps the patient's understanding at the centre."],
      ["Mock the other student in front of the patient", "D" as UCATOptionKey, ["respect-dignity", "teamwork"] as UCATSjtIssueTag[], "This is disrespectful and unprofessional."],
      ["Speak privately with the student afterwards using a specific example", "A" as UCATOptionKey, ["communication", "teamwork"] as UCATSjtIssueTag[], "Private, specific feedback is constructive."],
      ["Say nothing because the patient did not complain", "D" as UCATOptionKey, ["patient-safety", "communication"] as UCATSjtIssueTag[], "A patient may not feel able to complain; confusion should still be addressed."],
    ],
  },
  {
    setId: "sjt-generated-consent-language",
    mode: "importance" as const,
    subtype: "sjt-importance" as const,
    stimulus: [
      "Maya is observing a procedure consent discussion. The patient nods often but gives very short answers. Their relative answers several questions for them, and Maya is unsure whether the patient has understood the explanation.",
      "How important are the following considerations for Maya?",
    ],
    items: [
      ["Whether the patient has understood the information themselves", "A" as UCATOptionKey, ["capacity-consent", "autonomy"] as UCATSjtIssueTag[], "The patient's own understanding is central to valid consent."],
      ["That the relative seems confident", "C" as UCATOptionKey, ["communication", "autonomy"] as UCATSjtIssueTag[], "The relative's confidence may affect the conversation but does not prove patient understanding."],
      ["That Maya is a student and should seek help from the clinician", "B" as UCATOptionKey, ["scope-of-practice", "escalation"] as UCATSjtIssueTag[], "Her role affects how she acts; raising the concern with the clinician is appropriate."],
      ["That asking for clarification might make the discussion take longer", "D" as UCATOptionKey, ["capacity-consent", "professional-boundaries"] as UCATSjtIssueTag[], "Convenience should not outweigh consent concerns."],
    ],
  },
  {
    setId: "sjt-generated-invented-reflection",
    mode: "importance" as const,
    subtype: "sjt-importance" as const,
    stimulus: [
      "Sam is writing a placement reflection. A friend suggests inventing a patient conversation because Sam did not see enough cases that week. The reflection will be used to sign off a required competency.",
      "How important are the following considerations for Sam?",
    ],
    items: [
      ["That inventing a patient conversation would be dishonest", "A" as UCATOptionKey, ["integrity"] as UCATSjtIssueTag[], "Honesty is fundamental when evidence is used for competency sign-off."],
      ["That the competency is required for progression", "B" as UCATOptionKey, ["integrity", "justice"] as UCATSjtIssueTag[], "Progression pressure is relevant but does not justify dishonesty."],
      ["That the friend says many people exaggerate reflections", "D" as UCATOptionKey, ["integrity", "professional-boundaries"] as UCATSjtIssueTag[], "Others' poor behaviour would not make dishonesty acceptable."],
      ["That Sam could ask the supervisor how to reflect on limited exposure", "A" as UCATOptionKey, ["integrity", "communication"] as UCATSjtIssueTag[], "Seeking advice is a professional route to handle the problem honestly."],
    ],
  },
  {
    setId: "sjt-generated-patient-gift",
    mode: "appropriateness" as const,
    subtype: "sjt-appropriateness" as const,
    stimulus: [
      "A grateful patient offers Isla, a medical student, an expensive watch after she helped them find the right clinic. The patient insists that refusing would be rude and asks for Isla's personal phone number to stay in touch.",
      "How appropriate are the following responses by Isla?",
    ],
    items: [
      ["Politely decline the gift and explain that she must follow professional boundaries", "A" as UCATOptionKey, ["professional-boundaries", "integrity"] as UCATSjtIssueTag[], "This is very appropriate and protects trust."],
      ["Accept the watch because the patient may feel offended otherwise", "D" as UCATOptionKey, ["professional-boundaries", "integrity"] as UCATSjtIssueTag[], "Accepting an expensive gift is very inappropriate."],
      ["Ask a supervisor how to document or report the offer according to local policy", "A" as UCATOptionKey, ["escalation", "professional-boundaries"] as UCATSjtIssueTag[], "Seeking guidance is appropriate."],
      ["Give the patient her personal number so they can thank her later", "D" as UCATOptionKey, ["professional-boundaries", "confidentiality"] as UCATSjtIssueTag[], "Sharing personal contact details would blur boundaries."],
    ],
  },
];

const GENERATED_SJT_SINGLE: UCATQuestion[] = sjtSingleSets.flatMap(
  (set) =>
    set.items.map(([question, answer, issueTags, explanation], itemIndex) =>
      makeSjtSingle({
        id: `${set.setId}-${String(itemIndex + 1).padStart(3, "0")}`,
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

const GENERATED_SJT_DRAG_CATEGORY: UCATQuestion[] = [
  {
    id: "sjt-generated-drag-cleaning-001",
    setId: "sjt-generated-cleaning-error",
    stimulus:
      "A student notices that a reusable examination light has not been cleaned between patients. The next patient is already entering the room.",
    issueTags: ["patient-safety", "non-maleficence", "escalation"] as UCATSjtIssueTag[],
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    items: [
      ["pause", "Politely pause the room turnover and alert the supervising clinician", "appropriate"],
      ["ignore", "Say nothing because the clinic is running late", "inappropriate"],
      ["clean", "Offer to clean it only if trained and asked to do so", "appropriate"],
    ],
    explanation:
      "Potential infection risk should be raised promptly. The student should not ignore it or act outside training.",
  },
  {
    id: "sjt-generated-drag-results-001",
    setId: "sjt-generated-results-desk",
    stimulus:
      "A caller asks a student at reception to read out a relative's test result. The caller knows the relative's date of birth but is not listed as an approved contact.",
    issueTags: ["confidentiality", "professional-boundaries", "escalation"] as UCATSjtIssueTag[],
    categories: [
      { id: "important", label: "Important" },
      { id: "unimportant", label: "Unimportant" },
    ],
    items: [
      ["approved", "Whether the caller is authorised to receive the result", "important"],
      ["channel", "Whether results should be shared through approved clinic channels", "important"],
      ["polite", "That the caller sounds polite and confident", "unimportant"],
    ],
    explanation:
      "Identity and authority matter; sounding confident does not justify sharing results.",
  },
  {
    id: "sjt-generated-drag-handover-001",
    setId: "sjt-generated-busy-handover",
    stimulus:
      "During a ward handover, a student realises they forgot to mention that a patient reported new dizziness after standing.",
    issueTags: ["patient-safety", "candour", "teamwork"] as UCATSjtIssueTag[],
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    items: [
      ["raise-now", "Raise the missing information with the team as soon as possible", "appropriate"],
      ["wait-week", "Wait until the next teaching meeting to mention it", "inappropriate"],
      ["specific", "Give the specific symptom and when it occurred", "appropriate"],
    ],
    explanation:
      "Patient safety information should be corrected promptly and clearly.",
  },
  {
    id: "sjt-generated-drag-social-post-001",
    setId: "sjt-generated-social-post",
    stimulus:
      "A student wants to post a placement photo. No patient is visible, but a whiteboard with bed numbers and initials appears in the background.",
    issueTags: ["confidentiality", "integrity", "professional-boundaries"] as UCATSjtIssueTag[],
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    items: [
      ["delete", "Do not post the image while identifiable information may be visible", "appropriate"],
      ["blur-self", "Post it because the student's own face is the main focus", "inappropriate"],
      ["ask-policy", "Ask the placement supervisor about local social media policy", "appropriate"],
    ],
    explanation:
      "Background information can still breach confidentiality.",
  },
  {
    id: "sjt-generated-drag-equity-001",
    setId: "sjt-generated-clinic-queue",
    stimulus:
      "A student is asked by a family friend to move their appointment card ahead of other patients because they are in a hurry.",
    issueTags: ["justice", "integrity", "professional-boundaries"] as UCATSjtIssueTag[],
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    items: [
      ["decline", "Explain that appointments must be handled through the usual process", "appropriate"],
      ["favour", "Move the card because the person is a family friend", "inappropriate"],
      ["staff", "Ask reception staff how urgent requests are normally managed", "appropriate"],
    ],
    explanation:
      "Fairness and boundaries matter; urgent requests should follow normal processes.",
  },
  {
    id: "sjt-generated-drag-scope-001",
    setId: "sjt-generated-procedure-scope",
    stimulus:
      "A patient asks a student to remove a cannula because the ward is busy and the student has watched it done before.",
    issueTags: ["scope-of-practice", "patient-safety", "communication"] as UCATSjtIssueTag[],
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    items: [
      ["explain", "Explain that a trained member of staff needs to help", "appropriate"],
      ["remove", "Remove it because the patient asked directly", "inappropriate"],
      ["nurse", "Tell a nurse that the patient is uncomfortable and requesting removal", "appropriate"],
    ],
    explanation:
      "The student's role is to communicate and escalate, not perform an unsupervised procedure.",
  },
  {
    id: "sjt-generated-drag-disability-001",
    setId: "sjt-generated-access-need",
    stimulus:
      "A patient with hearing loss says they cannot follow a rushed explanation. The clinic is behind schedule.",
    issueTags: ["communication", "respect-dignity", "justice"] as UCATSjtIssueTag[],
    categories: [
      { id: "important", label: "Important" },
      { id: "unimportant", label: "Unimportant" },
    ],
    items: [
      ["adjust", "Whether reasonable communication adjustments are needed", "important"],
      ["understand", "Whether the patient understands the information", "important"],
      ["schedule", "That the clinic is behind schedule", "important"],
    ],
    explanation:
      "Time pressure is relevant to organising the response, but understanding and reasonable adjustments remain important.",
  },
  {
    id: "sjt-generated-drag-feedback-001",
    setId: "sjt-generated-feedback-tone",
    stimulus:
      "A student receives critical feedback from a supervisor and believes one point is inaccurate.",
    issueTags: ["communication", "integrity", "teamwork"] as UCATSjtIssueTag[],
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    items: [
      ["clarify", "Ask calmly for clarification and examples", "appropriate"],
      ["argue", "Dismiss the feedback publicly as unfair", "inappropriate"],
      ["reflect", "Reflect on which parts may still be useful", "appropriate"],
    ],
    explanation:
      "Professional responses to feedback are calm, specific and reflective.",
  },
].map((item) => ({
  id: item.id,
  section: "sjt" as const,
  subtype: "sjt-drag-drop" as const,
  questionType: "drag-category" as const,
  tags: ["text-stem", "set-based", "quick"] as UCATQuestionTag[],
  issueTags: item.issueTags,
  title: "Situational Judgement Practice",
  leftTitle: "Scenario",
  setId: item.setId,
  stimulus: [item.stimulus],
  question: "Drag each item to the side that best describes it.",
  instruction: "Classify each item using professional judgement.",
  categories: item.categories,
  categoryItems: item.items.map(([id, text, answerCategory]) => ({
    id,
    text,
    answerCategory,
  })),
  explanation: item.explanation,
}));

const GENERATED_SJT_ORDERING: UCATQuestion[] = [
  {
    id: "sjt-generated-order-needlestick-001",
    setId: "sjt-generated-needlestick-order",
    stimulus:
      "A student accidentally scratches themselves with a used needle while clearing a tray under supervision.",
    items: [
      ["stop", "Stop the task safely and avoid further exposure"],
      ["wash", "Wash the area according to local first-aid guidance"],
      ["report", "Report the incident immediately to the supervising clinician"],
      ["policy", "Follow occupational health and incident-reporting policy"],
    ],
    order: ["stop", "wash", "report", "policy"],
    explanation:
      "Immediate safety and first aid come first, followed by prompt reporting and formal policy steps.",
  },
  {
    id: "sjt-generated-order-lost-card-001",
    setId: "sjt-generated-lost-card-order",
    stimulus:
      "A student realises they have lost an ID card that grants access to clinical areas.",
    items: [
      ["search", "Check immediate belongings and recent locations briefly"],
      ["tell", "Inform the placement office or supervisor promptly"],
      ["disable", "Ask for access to be disabled according to policy"],
      ["replace", "Arrange a replacement card through the proper route"],
    ],
    order: ["search", "tell", "disable", "replace"],
    explanation:
      "A brief check is reasonable, but security risk should be reported promptly before arranging replacement.",
  },
  {
    id: "sjt-generated-order-angry-relative-001",
    setId: "sjt-generated-angry-relative-order",
    stimulus:
      "A relative becomes angry at reception and starts shouting about a delay while other patients are nearby.",
    items: [
      ["calm", "Stay calm and avoid arguing back"],
      ["privacy", "If safe, move the conversation away from other patients"],
      ["staff", "Ask an appropriate staff member for help"],
      ["document", "Follow local reporting steps if there was aggression or risk"],
    ],
    order: ["calm", "privacy", "staff", "document"],
    explanation:
      "De-escalation and privacy come before getting appropriate help and completing any reporting.",
  },
  {
    id: "sjt-generated-order-wrong-note-001",
    setId: "sjt-generated-wrong-note-order",
    stimulus:
      "A student notices they have written a note in the wrong patient's paper file.",
    items: [
      ["pause", "Stop writing as soon as the mistake is noticed"],
      ["supervisor", "Tell the supervising clinician or nurse in charge"],
      ["correct", "Follow local procedure to correct the record transparently"],
      ["reflect", "Reflect on how to prevent repeat errors"],
    ],
    order: ["pause", "supervisor", "correct", "reflect"],
    explanation:
      "The priority is to stop the error, escalate it and correct the record properly before later reflection.",
  },
  {
    id: "sjt-generated-order-missed-result-001",
    setId: "sjt-generated-missed-result-order",
    stimulus:
      "During teaching, a student realises a blood result they were asked to chase may not have been communicated to the team.",
    items: [
      ["check", "Check the result and patient details carefully"],
      ["team", "Tell the responsible clinical team immediately"],
      ["facts", "Share the exact result and why it is concerning"],
      ["supervisor", "Discuss the lapse with the supervisor afterwards"],
    ],
    order: ["check", "team", "facts", "supervisor"],
    explanation:
      "Confirming details and alerting the team comes before later discussion of how the lapse occurred.",
  },
  {
    id: "sjt-generated-order-distressed-peer-001",
    setId: "sjt-generated-distressed-peer-order",
    stimulus:
      "A peer leaves a simulation session visibly upset after making a mistake.",
    items: [
      ["private", "Approach them privately and check they are safe"],
      ["listen", "Listen without dismissing their feelings"],
      ["support", "Encourage them to speak with the facilitator or support service"],
      ["follow", "Follow up later if appropriate"],
    ],
    order: ["private", "listen", "support", "follow"],
    explanation:
      "Immediate private support and listening come before signposting and later follow-up.",
  },
].map((item) => ({
  id: item.id,
  section: "sjt" as const,
  subtype: "sjt-drag-drop" as const,
  questionType: "drag-order" as const,
  tags: ["text-stem", "set-based", "multi-step"] as UCATQuestionTag[],
  issueTags: ["patient-safety", "communication", "escalation"] as UCATSjtIssueTag[],
  title: "Situational Judgement Practice",
  leftTitle: "Scenario",
  setId: item.setId,
  stimulus: [item.stimulus],
  question: "Drag the actions into the most appropriate order, from first to last.",
  instruction: "Prioritise safety, professionalism and appropriate escalation.",
  dragItems: item.items.map(([id, text]) => ({ id, text })),
  answerOrder: item.order,
  explanation: item.explanation,
}));

const GENERATED_SJT_MOST_LEAST: UCATQuestion[] = [
  {
    id: "sjt-generated-most-least-error-001",
    setId: "sjt-generated-prescribing-error",
    stimulus:
      "A student thinks a discharge summary may contain the wrong dose but the ward is busy.",
    items: [
      ["raise", "Raise the concern with the responsible clinician before discharge"],
      ["guess", "Assume the dose is correct because the doctor is busy"],
      ["pharmacist", "Ask the pharmacist nearby how to escalate the discrepancy"],
      ["patient", "Tell the patient the team is checking the medicine information"],
    ],
    most: "raise",
    least: "guess",
    explanation:
      "Raising a possible dose error is the safest action. Assuming it is correct is the least appropriate.",
  },
  {
    id: "sjt-generated-most-least-confidentiality-001",
    setId: "sjt-generated-cafe-confidentiality",
    stimulus:
      "Two students begin discussing a named patient in a hospital cafe where visitors can hear.",
    items: [
      ["pause", "Quietly ask them to stop and move any necessary discussion to a private area"],
      ["join", "Join the conversation because the case is educational"],
      ["supervisor", "Seek advice if they continue after being reminded"],
      ["ignore", "Ignore it because the cafe is still inside the hospital"],
    ],
    most: "pause",
    least: "join",
    explanation:
      "The best first action is to stop the public discussion. Joining it worsens the confidentiality breach.",
  },
  {
    id: "sjt-generated-most-least-consent-001",
    setId: "sjt-generated-student-presence",
    stimulus:
      "A patient says they do not want students present during an intimate examination.",
    items: [
      ["leave", "Respect the request and leave promptly"],
      ["argue", "Explain that students have a right to learn and stay"],
      ["thanks", "Thank the patient and avoid showing frustration"],
      ["discuss", "Discuss learning needs with the supervisor afterwards"],
    ],
    most: "leave",
    least: "argue",
    explanation:
      "The patient's consent should be respected immediately. Arguing would be least appropriate.",
  },
  {
    id: "sjt-generated-most-least-bullying-001",
    setId: "sjt-generated-bullying-peer",
    stimulus:
      "A peer repeatedly belittles another student during group placement tasks.",
    items: [
      ["private", "Check privately whether the affected student is okay"],
      ["laugh", "Laugh along to avoid becoming a target"],
      ["challenge", "Challenge the behaviour calmly if it is safe to do so"],
      ["support", "Seek advice from a tutor if the pattern continues"],
    ],
    most: "challenge",
    least: "laugh",
    explanation:
      "A calm challenge addresses the behaviour. Laughing along reinforces bullying.",
  },
  {
    id: "sjt-generated-most-least-capacity-001",
    setId: "sjt-generated-capacity-medication",
    stimulus:
      "A patient appears confused about a new medication and says yes to every question.",
    items: [
      ["flag", "Tell the clinician that the patient may not have understood"],
      ["proceed", "Proceed because the patient has said yes"],
      ["plain", "Use simple language while awaiting clinical review"],
      ["relative", "Ask a relative to decide immediately without involving the patient"],
    ],
    most: "flag",
    least: "proceed",
    explanation:
      "Possible misunderstanding should be flagged. Proceeding simply because the patient said yes is unsafe.",
  },
  {
    id: "sjt-generated-most-least-scope-001",
    setId: "sjt-generated-scope-advice",
    stimulus:
      "A friend messages a medical student asking for a diagnosis based on a rash photo.",
    items: [
      ["signpost", "Encourage the friend to seek advice through an appropriate healthcare service"],
      ["diagnose", "Give a definite diagnosis from the photo"],
      ["urgent", "Advise urgent help if there are worrying symptoms such as breathing difficulty"],
      ["boundary", "Explain that the student cannot assess or diagnose by message"],
    ],
    most: "signpost",
    least: "diagnose",
    explanation:
      "Signposting to appropriate care is safest. Giving a definite diagnosis from a message is outside scope.",
  },
].map((item) => ({
  id: item.id,
  section: "sjt" as const,
  subtype: "sjt-appropriateness" as const,
  questionType: "most-least" as const,
  tags: ["text-stem", "set-based", "multi-step"] as UCATQuestionTag[],
  issueTags: ["patient-safety", "professional-boundaries", "communication"] as UCATSjtIssueTag[],
  title: "Situational Judgement Practice",
  leftTitle: "Scenario",
  setId: item.setId,
  stimulus: [item.stimulus],
  question: "Select the most and least appropriate actions.",
  instruction: "Choose one action for each slot.",
  actionItems: item.items.map(([id, text]) => ({ id, text })),
  answerSlots: { most: item.most, least: item.least },
  explanation: item.explanation,
}));

export const GENERATED_SJT_QUESTIONS: UCATQuestion[] = [
  ...GENERATED_SJT_SINGLE,
  ...GENERATED_SJT_DRAG_CATEGORY,
  ...GENERATED_SJT_ORDERING,
  ...GENERATED_SJT_MOST_LEAST,
];
