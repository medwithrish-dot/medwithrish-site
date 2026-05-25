import type {
  UCATOptionKey,
  UCATQuestion,
  UCATQuestionTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

const TFC_OPTIONS = [
  { key: "A" as const, text: "True" },
  { key: "B" as const, text: "False" },
  { key: "C" as const, text: "Can't tell" },
];

type ExtraVrItem = {
  id: string;
  subtype: UCATSubtypeId;
  question: string;
  optionTexts?: string[];
  answer: UCATOptionKey;
  explanation: string;
};

type ExtraVrSet = {
  setId: string;
  stimulus: string[];
  items: ExtraVrItem[];
};

function tagForSubtype(subtype: UCATSubtypeId): UCATQuestionTag {
  if (subtype === "vr-tfc") return "true-false-cant-tell";
  if (subtype === "vr-detail") return "detail-retrieval";
  if (subtype === "vr-inference") return "inference-question";
  if (subtype === "vr-author") return "author-opinion";
  if (subtype === "vr-negative") return "negative-except";
  return "summary-structure";
}

function buildSet(set: ExtraVrSet): UCATQuestion[] {
  return set.items.map((item, index) => {
    const tags: UCATQuestionTag[] = [
      tagForSubtype(item.subtype),
      index < 2 ? "medium" : "hard",
      "text-stem",
    ];

    return {
      id: `vr-extra-${set.setId}-${String(index + 1).padStart(3, "0")}`,
      section: "vr",
      subtype: item.subtype,
      setId: `vr-extra-${set.setId}`,
      tags,
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: set.stimulus,
      question: item.question,
      options:
        item.subtype === "vr-tfc"
          ? TFC_OPTIONS
          : (item.optionTexts ?? []).map((text, optionIndex) => ({
              key: (["A", "B", "C", "D"] as const)[optionIndex],
              text,
            })),
      answer: item.answer,
      explanation: item.explanation,
    };
  });
}

const EXTRA_VR_SETS: ExtraVrSet[] = [
  {
    setId: "harbour-chargers",
    stimulus: [
      "Port Selwyn installed electric charging points for harbour vehicles after the fish market replaced several diesel vans. The harbour board described the work as an operational upgrade, not an environmental showcase, because the chargers were placed beside existing loading bays rather than in a public display area. Traders welcomed the shorter refuelling trips but worried that delivery lorries would block the bays during the morning auction.",
      "The first month produced uneven results. Small vans charged reliably overnight, while two larger vehicles often left with less than a full battery because staff unplugged them to make room. Engineers said the problem was not charger capacity but the order in which vehicles were parked. They recommended painted bays, a booking sheet and clearer responsibility for moving vehicles after charging.",
      "The board kept the chargers but delayed buying more. It argued that the trial had proved the harbour could electrify some tasks immediately, while showing that physical layout mattered as much as the technology itself.",
    ],
    items: [
      {
        id: "chargers-purpose",
        subtype: "vr-tfc",
        question:
          "The harbour board presented the charging points mainly as a public environmental display. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The board described the work as an operational upgrade, not an environmental showcase.",
      },
      {
        id: "charger-vans",
        subtype: "vr-detail",
        question: "Which vehicles charged reliably overnight?",
        optionTexts: [
          "Small vans.",
          "Delivery lorries during the auction.",
          "All larger vehicles.",
          "Diesel vans waiting to be replaced.",
        ],
        answer: "A",
        explanation:
          "The passage states that small vans charged reliably overnight.",
      },
      {
        id: "charger-layout",
        subtype: "vr-inference",
        question: "What can be inferred about the trial's main difficulty?",
        optionTexts: [
          "It was caused partly by how vehicles used the available space.",
          "It proved electric vehicles could not work at a harbour.",
          "It was caused by a complete lack of charger capacity.",
          "It was solved by buying more chargers immediately.",
        ],
        answer: "A",
        explanation:
          "Engineers said parking order, bay marking and responsibility for moving vehicles were central issues.",
      },
      {
        id: "charger-summary",
        subtype: "vr-summary",
        question: "Which summary best reflects the board's conclusion?",
        optionTexts: [
          "The trial supported partial electrification but showed layout needed attention.",
          "The trial failed because traders rejected all electric vehicles.",
          "The trial proved that more chargers should be bought immediately.",
          "The trial was only about public relations.",
        ],
        answer: "A",
        explanation:
          "The board kept the chargers but delayed expansion because the layout problems needed solving.",
      },
    ],
  },
  {
    setId: "market-roofs",
    stimulus: [
      "Brackley Market covered three lanes of stalls with lightweight roofs after traders complained that rain spoiled paper labels and made customers hurry through the aisles. The roofs were not fixed to the historic walls; instead, they rested on removable posts so the conservation officer could approve the trial without treating it as a permanent alteration.",
      "Footfall rose on wet Saturdays, but the roofs changed how sound travelled. Stallholders near the fish counter said announcements became harder to hear, while musicians at the market entrance found that their performances carried further than expected. The council adjusted speaker positions and introduced a lower volume limit for amplified music.",
      "A review recommended keeping the roofs during winter and removing them for two summer heritage weekends. It said the trial had improved trading conditions, but only because managers were willing to change details after listening to complaints.",
    ],
    items: [
      {
        id: "roof-fixed",
        subtype: "vr-tfc",
        question:
          "The roofs were permanently fixed to the historic walls. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The passage says the roofs rested on removable posts and were not fixed to the historic walls.",
      },
      {
        id: "roof-sound",
        subtype: "vr-detail",
        question: "What unexpected issue did the roofs create?",
        optionTexts: [
          "They changed how sound travelled through the market.",
          "They prevented customers entering in wet weather.",
          "They made paper labels spoil more quickly.",
          "They forced the market to close every summer.",
        ],
        answer: "A",
        explanation:
          "The second paragraph states that the roofs changed how sound travelled.",
      },
      {
        id: "roof-review",
        subtype: "vr-author",
        question: "The review's attitude to the roof trial is best described as:",
        optionTexts: [
          "Favourable, provided managers keep adjusting practical details.",
          "Dismissive, because trading conditions did not improve.",
          "Uncritical, because no complaints were made.",
          "Opposed to all seasonal use of the roofs.",
        ],
        answer: "A",
        explanation:
          "The review recommended keeping the roofs in winter while stressing the value of responding to complaints.",
      },
      {
        id: "roof-not-supported",
        subtype: "vr-negative",
        question: "All of the following are true of the roof trial except:",
        optionTexts: [
          "Footfall rose on wet Saturdays.",
          "Amplified music was given a lower volume limit.",
          "The conservation officer treated the roofs as a permanent alteration.",
          "The roofs were recommended for winter use.",
        ],
        answer: "C",
        explanation:
          "The removable-post design allowed approval without treating the roofs as permanent.",
      },
    ],
  },
  {
    setId: "ambulance-alerts",
    stimulus: [
      "A regional ambulance service rewrote its text-message alerts for relatives waiting at hospital. The old messages used technical phrases such as 'handover delay', which managers believed were precise but often misunderstood. The new version used plainer wording and explained whether the patient was waiting in the ambulance, being transferred to hospital staff or already in a clinical area.",
      "Call-centre staff received fewer repeat calls after the change, but some clinicians disliked the loss of technical detail. They argued that relatives might still need to know why a handover was delayed. The communications team responded that the messages were not intended to explain every operational cause; their purpose was to reduce uncertainty about where the patient was.",
      "The service kept the simpler messages and added a link to a longer information page. Its evaluation described the change as a communication improvement, not a solution to hospital delays themselves.",
    ],
    items: [
      {
        id: "alerts-old",
        subtype: "vr-tfc",
        question:
          "The old alerts used technical phrases that some recipients misunderstood. According to the passage, this statement is:",
        answer: "A",
        explanation:
          "The passage says the old messages used technical phrases which were often misunderstood.",
      },
      {
        id: "alerts-calls",
        subtype: "vr-detail",
        question: "What happened after the messages were rewritten?",
        optionTexts: [
          "Call-centre staff received fewer repeat calls.",
          "All hospital delays ended.",
          "Clinicians stopped wanting any detail.",
          "Relatives were no longer told where the patient was.",
        ],
        answer: "A",
        explanation:
          "The second paragraph states that repeat calls fell after the change.",
      },
      {
        id: "alerts-purpose",
        subtype: "vr-inference",
        question: "What is the best-supported interpretation of the new alerts?",
        optionTexts: [
          "They were designed to reduce uncertainty, not to explain every delay.",
          "They were intended to replace clinical updates from staff.",
          "They avoided saying whether a patient had reached hospital staff.",
          "They were rejected because repeat calls increased.",
        ],
        answer: "A",
        explanation:
          "The communications team said the purpose was to reduce uncertainty about the patient's location.",
      },
      {
        id: "alerts-title",
        subtype: "vr-summary",
        question: "Which title best fits the passage?",
        optionTexts: [
          "Clearer alerts: less uncertainty, not fewer hospital delays",
          "Technical alerts end all ambulance handover problems",
          "Why relatives should receive less information",
          "A failed attempt to reduce repeat calls",
        ],
        answer: "A",
        explanation:
          "The passage distinguishes a communication improvement from solving delays.",
      },
    ],
  },
  {
    setId: "wetland-boardwalk",
    stimulus: [
      "Rangers at Moorside Wetland built a raised boardwalk to protect nesting areas from visitors who wandered from the main path. The boardwalk curved away from the most sensitive reed beds and included two viewing gaps where birdwatchers could stop without blocking others. Local residents initially feared that the structure would make the wetland feel like a theme park.",
      "Visitor surveys after opening were more positive than expected. Families said the route made muddy areas accessible, while experienced birdwatchers appreciated that the viewing gaps reduced crowding near the reeds. However, rangers recorded more visits to one previously quiet corner because photographs from the new boardwalk spread online. They added seasonal signs asking visitors not to linger there during nesting weeks.",
      "The final report argued that access and protection had both improved, but only because the boardwalk was treated as a managed route rather than a one-off construction project.",
    ],
    items: [
      {
        id: "boardwalk-reeds",
        subtype: "vr-tfc",
        question:
          "The boardwalk was designed to pass directly through the most sensitive reed beds. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The boardwalk curved away from the most sensitive reed beds.",
      },
      {
        id: "boardwalk-families",
        subtype: "vr-detail",
        question: "What benefit did families report?",
        optionTexts: [
          "Muddy areas became more accessible.",
          "The wetland stopped attracting birdwatchers.",
          "Nesting weeks no longer needed protection.",
          "The boardwalk removed all signs from the route.",
        ],
        answer: "A",
        explanation:
          "Families said the route made muddy areas accessible.",
      },
      {
        id: "boardwalk-inference",
        subtype: "vr-inference",
        question: "What does the passage suggest about managing visitor access?",
        optionTexts: [
          "Physical access changes may need continuing seasonal management.",
          "Access routes always damage conservation aims.",
          "Online photographs reduced visits to quiet corners.",
          "Residents' initial fears were fully confirmed.",
        ],
        answer: "A",
        explanation:
          "The rangers added seasonal signs after the boardwalk changed visitor patterns.",
      },
      {
        id: "boardwalk-role",
        subtype: "vr-summary",
        question: "What is the role of the final paragraph?",
        optionTexts: [
          "To state the report's balanced conclusion about access and protection.",
          "To list every bird species affected by the route.",
          "To explain why the boardwalk was immediately removed.",
          "To deny that the route required management.",
        ],
        answer: "A",
        explanation:
          "The final paragraph concludes that both aims improved because the route was actively managed.",
      },
    ],
  },
  {
    setId: "lecture-captures",
    stimulus: [
      "North City College introduced automatic lecture capture after commuter students asked for recordings of early classes. The system recorded slides and audio but not classroom discussion unless lecturers switched on an additional microphone. College leaders said the recordings were meant to support revision and absence recovery, not to make attendance optional.",
      "Usage data showed that most students watched short segments before assessments rather than entire lectures. Attendance fell slightly in one department, but interviews suggested timetable clashes and part-time work were stronger causes than the recordings themselves. Lecturers in practical subjects complained that recordings made demonstrations look simpler than they were because camera angles missed small hand movements.",
      "The college kept lecture capture but required lecturers to label recordings that were unsuitable as a substitute for attending. It also offered training on when to pause recording during sensitive discussions.",
    ],
    items: [
      {
        id: "capture-discussion",
        subtype: "vr-tfc",
        question:
          "Classroom discussion was always recorded automatically. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "Discussion was not recorded unless lecturers switched on an additional microphone.",
      },
      {
        id: "capture-usage",
        subtype: "vr-detail",
        question: "How did most students use the recordings?",
        optionTexts: [
          "They watched short segments before assessments.",
          "They watched every lecture from start to finish.",
          "They used them only for classroom discussions.",
          "They stopped attending all practical subjects.",
        ],
        answer: "A",
        explanation:
          "The passage states that most students watched short segments before assessments.",
      },
      {
        id: "capture-not-supported",
        subtype: "vr-negative",
        question:
          "All of the following are true of the lecture-capture trial except:",
        optionTexts: [
          "Some practical demonstrations were hard to capture accurately.",
          "The college kept the lecture-capture system.",
          "Recordings were introduced partly for commuter students.",
          "College leaders wanted recordings to make attendance optional.",
        ],
        answer: "D",
        explanation:
          "College leaders said recordings were not intended to make attendance optional.",
      },
      {
        id: "capture-attitude",
        subtype: "vr-author",
        question: "The college's final position is best described as:",
        optionTexts: [
          "Continuing the system with clearer limits and staff training.",
          "Abandoning recordings because attendance fell everywhere.",
          "Treating all recordings as complete replacements for attendance.",
          "Recording sensitive discussion without lecturer control.",
        ],
        answer: "A",
        explanation:
          "The college kept lecture capture while requiring labels and offering training.",
      },
    ],
  },
  {
    setId: "hill-farming",
    stimulus: [
      "A hill-farming cooperative trialled shared winter shelters for sheep after smaller farms struggled to maintain separate buildings. The shelters were placed near common grazing land and booked through a rota. Supporters argued that shared shelters would reduce repair costs, while sceptics worried that moving animals between farms could spread illness if cleaning rules were weak.",
      "The first winter showed savings in roof repairs and heating, but the rota was harder to manage than expected. Farmers with lambing ewes needed more flexibility than the booking sheet allowed, and one shelter became overcrowded during a sudden snowstorm. The cooperative then introduced emergency priority rules and a cleaning log signed by each user.",
      "An agricultural adviser concluded that sharing could work for farms with similar routines, but not as a simple replacement for every private shelter. The adviser emphasised that cooperation required enforceable rules, not just goodwill.",
    ],
    items: [
      {
        id: "shelter-private",
        subtype: "vr-tfc",
        question:
          "The adviser recommended replacing every private shelter with shared shelters. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The adviser said shared shelters were not a simple replacement for every private shelter.",
      },
      {
        id: "shelter-savings",
        subtype: "vr-detail",
        question: "What savings were seen in the first winter?",
        optionTexts: [
          "Savings in roof repairs and heating.",
          "Savings from ending all cleaning requirements.",
          "Savings because the rota was unnecessary.",
          "Savings from closing the common grazing land.",
        ],
        answer: "A",
        explanation:
          "The passage says the first winter showed savings in roof repairs and heating.",
      },
      {
        id: "shelter-rules",
        subtype: "vr-inference",
        question: "What can be inferred about the cooperative's first rota?",
        optionTexts: [
          "It did not handle all farming needs or emergencies well.",
          "It made emergency priority rules unnecessary.",
          "It was rejected because no farm saved money.",
          "It prevented overcrowding during snowstorms.",
        ],
        answer: "A",
        explanation:
          "The rota struggled with lambing flexibility and overcrowding during a snowstorm.",
      },
      {
        id: "shelter-summary",
        subtype: "vr-summary",
        question: "Which summary best captures the adviser's view?",
        optionTexts: [
          "Sharing can help, but only with suitable routines and enforceable rules.",
          "Shared shelters are impossible on hill farms.",
          "Goodwill alone is enough to manage shared livestock facilities.",
          "Private shelters should be banned immediately.",
        ],
        answer: "A",
        explanation:
          "The adviser stressed that sharing can work in some cases but needs enforceable rules.",
      },
    ],
  },
  {
    setId: "translation-kiosks",
    stimulus: [
      "A city advice centre installed translation kiosks for residents who arrived without an appointment. The kiosks could translate typed questions into twelve languages and print a ticket for the right service desk. Staff hoped this would reduce the number of people waiting in the wrong queue, especially on rent and immigration advice days.",
      "The kiosks helped with simple enquiries but struggled when residents described several connected problems at once. Volunteers noticed that some users selected the first language listed rather than scrolling to their own, while older residents often preferred to speak to a receptionist. The centre changed the opening screen, added larger language buttons and kept a staffed triage desk beside the machines.",
      "Managers concluded that the kiosks were useful as a first filter, but only when they remained part of a staffed service. They rejected a proposal to remove the reception desk, arguing that the most vulnerable visitors were often least able to reduce their problems to a typed phrase.",
    ],
    items: [
      {
        id: "kiosk-languages",
        subtype: "vr-tfc",
        question:
          "The kiosks translated typed questions into twelve languages. According to the passage, this statement is:",
        answer: "A",
        explanation:
          "The first paragraph states that the kiosks could translate typed questions into twelve languages.",
      },
      {
        id: "kiosk-desk",
        subtype: "vr-tfc",
        question:
          "Managers accepted the proposal to remove the reception desk. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "Managers rejected the proposal to remove the reception desk.",
      },
      {
        id: "kiosk-inference",
        subtype: "vr-inference",
        question: "What does the passage imply about the kiosks?",
        optionTexts: [
          "They were better for straightforward triage than for complex connected problems.",
          "They removed the need for volunteers and receptionists.",
          "They were useful only for residents with appointments.",
          "They translated spoken conversations perfectly.",
        ],
        answer: "A",
        explanation:
          "The kiosks helped simple enquiries but struggled with connected problems, so staff support remained necessary.",
      },
      {
        id: "kiosk-author",
        subtype: "vr-author",
        question: "Managers' attitude to the kiosks is best described as:",
        optionTexts: [
          "Practical but cautious about replacing human support.",
          "Hostile to any use of translation technology.",
          "Certain that all visitors prefer machines.",
          "Interested only in reducing appointment numbers.",
        ],
        answer: "A",
        explanation:
          "Managers kept the kiosks as a first filter but rejected removing staffed support.",
      },
    ],
  },
  {
    setId: "roof-gardens",
    stimulus: [
      "A hospital trust planted roof gardens on two flat roofs after staff requested somewhere quiet away from clinical areas. The gardens were designed with low planters, wind-resistant grasses and seating that could be cleaned easily. Patients were not allowed onto the roofs, partly because the lifts did not provide safe access to them.",
      "Staff surveys reported improved break quality, but the estates team found that watering was more difficult than predicted. Rainfall reached the roof unevenly because taller parts of the hospital created sheltered patches. During a dry spell, one garden had to be closed for a week while temporary irrigation was fitted.",
      "The trust decided to add roof gardens only to buildings where maintenance access was already reliable. It said the first gardens had helped staff wellbeing, but warned that visible greenery should not be confused with low-maintenance greenery.",
    ],
    items: [
      {
        id: "roof-patients",
        subtype: "vr-tfc",
        question:
          "Patients were allowed to use the roof gardens freely. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The passage states that patients were not allowed onto the roofs.",
      },
      {
        id: "roof-watering",
        subtype: "vr-detail",
        question: "Why was watering more difficult than predicted?",
        optionTexts: [
          "Rainfall reached the roof unevenly.",
          "The gardens contained no planters.",
          "The lifts were used for irrigation.",
          "The grasses could not resist wind.",
        ],
        answer: "A",
        explanation:
          "The estates team found that sheltered patches caused uneven rainfall on the roof.",
      },
      {
        id: "roof-greenery",
        subtype: "vr-inference",
        question: "What does the final warning suggest?",
        optionTexts: [
          "Green spaces can create maintenance demands despite looking simple.",
          "Staff wellbeing was not affected by the gardens.",
          "Roof gardens should be added to every hospital building.",
          "Visible greenery is always easy to maintain.",
        ],
        answer: "A",
        explanation:
          "The trust warned that visible greenery should not be confused with low-maintenance greenery.",
      },
      {
        id: "roof-title",
        subtype: "vr-summary",
        question: "Which title best fits the passage?",
        optionTexts: [
          "Quiet roofs, practical limits: staff gardens need reliable upkeep",
          "Why hospital gardens should replace patient areas",
          "A failed wellbeing project with no reported benefit",
          "The end of maintenance planning for green roofs",
        ],
        answer: "A",
        explanation:
          "The passage presents wellbeing benefits alongside maintenance limits.",
      },
    ],
  },
  {
    setId: "archives-volunteers",
    stimulus: [
      "County archivists invited volunteers to describe photographs from a recently donated newspaper collection. The photographs had captions on the back, but many used nicknames or initials that meant little to modern researchers. Volunteers were asked to add place names, likely dates and full names where they could identify them from local knowledge.",
      "The project increased the number of searchable records, yet it also created uncertainty. Some volunteers confidently identified people from memory, while others copied rumours from community websites. Archivists therefore marked each contribution with a confidence level and kept the original captions visible. They rejected suggestions that volunteer notes should replace professional cataloguing.",
      "A year later, researchers praised the richer descriptions, especially for sports teams and village festivals. The archive concluded that local knowledge was valuable when treated as evidence to be checked rather than as a final authority.",
    ],
    items: [
      {
        id: "volunteers-captions",
        subtype: "vr-tfc",
        question:
          "The original captions were removed once volunteers added notes. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "Archivists kept the original captions visible.",
      },
      {
        id: "volunteers-purpose",
        subtype: "vr-detail",
        question: "Why were volunteers invited to help?",
        optionTexts: [
          "To add local knowledge such as full names, places and likely dates.",
          "To hide the original captions from researchers.",
          "To replace professional cataloguing entirely.",
          "To write new newspaper articles.",
        ],
        answer: "A",
        explanation:
          "Volunteers were asked to add identifying details from local knowledge.",
      },
      {
        id: "volunteers-uncertainty",
        subtype: "vr-inference",
        question: "What can be inferred about volunteer contributions?",
        optionTexts: [
          "They improved searching but varied in reliability.",
          "They were rejected because none contained local knowledge.",
          "They were all treated as professional cataloguing.",
          "They made the collection less searchable.",
        ],
        answer: "A",
        explanation:
          "The project increased searchable records but required confidence levels because reliability varied.",
      },
      {
        id: "volunteers-summary",
        subtype: "vr-summary",
        question: "Which summary best captures the archive's conclusion?",
        optionTexts: [
          "Local knowledge helps when it is checked and labelled carefully.",
          "Volunteer notes should always replace original evidence.",
          "Community memory has no value in archive work.",
          "Photographs of sports teams cannot be catalogued.",
        ],
        answer: "A",
        explanation:
          "The archive valued local knowledge but treated it as evidence to be checked.",
      },
    ],
  },
  {
    setId: "courtyard-shade",
    stimulus: [
      "A primary school installed fabric shade sails over its concrete courtyard after summer lessons were disrupted by heat. The sails were cheaper than planting mature trees and could be removed during winter storms. Teachers hoped the courtyard could be used for outdoor reading, not just for short breaks.",
      "Temperature readings fell under the sails, but the change altered playground behaviour. Children gathered in the shaded area earlier than expected, leaving other spaces almost empty. Supervisors said this made conflicts easier to notice but increased crowding near the doors. The school painted new activity zones and moved benches to spread pupils across the courtyard.",
      "The headteacher called the project a qualified success. It had made outdoor learning more realistic, but it also showed that changing comfort in one area could change movement across the whole playground.",
    ],
    items: [
      {
        id: "shade-trees",
        subtype: "vr-tfc",
        question:
          "The school chose mature trees because they were cheaper than fabric sails. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The sails were cheaper than planting mature trees.",
      },
      {
        id: "shade-reading",
        subtype: "vr-detail",
        question: "What did teachers hope the courtyard could support?",
        optionTexts: [
          "Outdoor reading.",
          "Winter storms.",
          "Replacing all indoor lessons.",
          "Longer queues near the doors.",
        ],
        answer: "A",
        explanation:
          "Teachers hoped the courtyard could be used for outdoor reading.",
      },
      {
        id: "shade-behaviour",
        subtype: "vr-inference",
        question: "What does the project suggest about environmental changes in schools?",
        optionTexts: [
          "Improving one area can shift how pupils use surrounding space.",
          "Shade always reduces crowding near doors.",
          "Outdoor learning became impossible after the sails were installed.",
          "Supervisors could no longer notice conflicts.",
        ],
        answer: "A",
        explanation:
          "The shaded area changed movement patterns and crowding, requiring new zones and bench placement.",
      },
      {
        id: "shade-author",
        subtype: "vr-author",
        question: "The headteacher's view is best described as:",
        optionTexts: [
          "Positive, but aware of wider behavioural effects.",
          "Entirely negative because temperatures did not fall.",
          "Unconcerned with playground movement.",
          "Certain that no further changes were needed.",
        ],
        answer: "A",
        explanation:
          "The headteacher called the project a qualified success and noted wider movement effects.",
      },
    ],
  },
  {
    setId: "ferry-pricing",
    stimulus: [
      "A small ferry company trialled flexible ticket prices after fuel costs rose sharply. Morning commuter journeys remained fixed in price, but off-peak tourist sailings became cheaper when booked early and more expensive close to departure. The company said the aim was to fill empty seats without making essential travel unpredictable.",
      "The trial increased advance bookings for weekday sightseeing trips. However, some island residents complained that visitors who misunderstood the system accused ticket clerks of changing prices unfairly. The company responded by adding fare examples to its website and displaying the fixed commuter fare beside the flexible tourist fares at the harbour office.",
      "An independent transport group supported continuing the trial, but only if resident journeys stayed protected. It said flexible pricing could help seasonal businesses, provided the distinction between essential and discretionary travel remained clear.",
    ],
    items: [
      {
        id: "ferry-commuter",
        subtype: "vr-tfc",
        question:
          "Morning commuter journeys became flexible in price during the trial. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "Morning commuter journeys remained fixed in price.",
      },
      {
        id: "ferry-advance",
        subtype: "vr-detail",
        question: "What increased during the trial?",
        optionTexts: [
          "Advance bookings for weekday sightseeing trips.",
          "Fuel costs for every commuter journey.",
          "Complaints that commuter fares were hidden.",
          "The number of essential journeys with unpredictable prices.",
        ],
        answer: "A",
        explanation:
          "The passage says advance bookings increased for weekday sightseeing trips.",
      },
      {
        id: "ferry-distinction",
        subtype: "vr-inference",
        question: "What condition mattered to the transport group?",
        optionTexts: [
          "Resident journeys should remain protected from flexible pricing.",
          "All tickets should become more expensive near departure.",
          "Tourist sailings should stop using early booking.",
          "Ticket clerks should decide fares without examples.",
        ],
        answer: "A",
        explanation:
          "The group supported the trial only if resident journeys stayed protected.",
      },
      {
        id: "ferry-title",
        subtype: "vr-summary",
        question: "Which headline best matches the passage?",
        optionTexts: [
          "Flexible ferry fares: useful if essential travel stays clear",
          "Commuter fares become unpredictable after fuel-cost rise",
          "Island residents call for an end to all tourist sailings",
          "A pricing trial with no effect on advance bookings",
        ],
        answer: "A",
        explanation:
          "The passage focuses on flexible tourist fares and protecting essential travel.",
      },
    ],
  },
  {
    setId: "library-makerspace",
    stimulus: [
      "Eastbrook Library opened a small makerspace with sewing machines, soldering tools and a 3D printer. The library insisted that users attend short safety sessions before booking equipment. Some councillors had expected the space to attract mainly teenagers, but retired residents became the most frequent daytime users, especially for clothing repairs.",
      "The 3D printer drew attention but not the most use. Staff spent more time helping users thread sewing machines and understand repair patterns than supervising printed objects. A local college donated spare fabric, while a technology company sponsored printer filament. The library said this mix of support helped avoid making the space feel like a single-purpose technology room.",
      "After six months, the library expanded repair workshops but limited unsupervised soldering to evenings when trained volunteers were present. The manager said the makerspace had worked best when it solved ordinary problems rather than chasing novelty.",
    ],
    items: [
      {
        id: "maker-safety",
        subtype: "vr-tfc",
        question:
          "Users could book equipment without attending safety sessions. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "Users had to attend short safety sessions before booking equipment.",
      },
      {
        id: "maker-users",
        subtype: "vr-detail",
        question: "Who became the most frequent daytime users?",
        optionTexts: [
          "Retired residents.",
          "Teenagers using the 3D printer.",
          "Councillors.",
          "Technology-company staff.",
        ],
        answer: "A",
        explanation:
          "Retired residents became the most frequent daytime users.",
      },
      {
        id: "maker-novelty",
        subtype: "vr-author",
        question: "The manager's view of the makerspace is best described as:",
        optionTexts: [
          "Focused on practical everyday use rather than novelty alone.",
          "Interested only in attracting teenagers.",
          "Determined to remove sewing machines.",
          "Unwilling to limit any unsupervised activity.",
        ],
        answer: "A",
        explanation:
          "The manager said the space worked best when solving ordinary problems rather than chasing novelty.",
      },
      {
        id: "maker-not-supported",
        subtype: "vr-negative",
        question: "All of the following are true of the makerspace except:",
        optionTexts: [
          "The 3D printer attracted attention.",
          "A college donated spare fabric.",
          "The 3D printer was the most used equipment.",
          "Unsupervised soldering was limited to certain evenings.",
        ],
        answer: "C",
        explanation:
          "The passage says the 3D printer drew attention but not the most use.",
      },
    ],
  },
  {
    setId: "coastal-path",
    stimulus: [
      "A coastal town rerouted part of its cliff path after winter erosion made the old route unsafe. The new inland path crossed a farmer's field using temporary matting. Walkers complained that the detour lost the best sea views, while the farmer worried about gates being left open near lambing season.",
      "The council installed self-closing gates and added two viewing platforms where the path returned towards the cliff. Visitor numbers fell slightly in the first month but recovered after walking groups updated their route maps. Geologists warned that a short section near the old path still tempted people to climb over barriers for photographs.",
      "The council kept the detour and began a campaign explaining why the old path could not simply be repaired. It argued that the challenge was not only replacing a path, but persuading people to respect a changing coastline.",
    ],
    items: [
      {
        id: "coast-old-safe",
        subtype: "vr-tfc",
        question:
          "The old cliff path was rerouted because winter erosion made it unsafe. According to the passage, this statement is:",
        answer: "A",
        explanation:
          "The opening sentence gives winter erosion as the reason the old route became unsafe.",
      },
      {
        id: "coast-gates",
        subtype: "vr-detail",
        question: "What did the council install in response to concerns?",
        optionTexts: [
          "Self-closing gates and two viewing platforms.",
          "A repaired version of the old cliff route.",
          "Permanent walls across the farmer's whole field.",
          "A ban on walking groups updating maps.",
        ],
        answer: "A",
        explanation:
          "The council installed self-closing gates and added two viewing platforms.",
      },
      {
        id: "coast-inference",
        subtype: "vr-inference",
        question: "What broader issue does the council identify?",
        optionTexts: [
          "People need to accept route changes caused by coastal erosion.",
          "Visitor numbers never recovered after the first month.",
          "The old path could be repaired easily.",
          "Geologists encouraged people to climb over barriers.",
        ],
        answer: "A",
        explanation:
          "The council said the challenge was persuading people to respect a changing coastline.",
      },
      {
        id: "coast-summary",
        subtype: "vr-summary",
        question: "Which summary best reflects the passage?",
        optionTexts: [
          "A safer path required practical changes and public explanation.",
          "A council abandoned a detour after walkers disliked the view.",
          "A farmer requested more visitors during lambing season.",
          "Walking groups refused to update their maps.",
        ],
        answer: "A",
        explanation:
          "The passage combines safety work, access changes and public explanation.",
      },
    ],
  },
  {
    setId: "school-lunch",
    stimulus: [
      "A school catering team replaced its fixed lunch menu with a pre-order system. Pupils selected meals during morning registration, allowing cooks to prepare closer to the expected demand. The school hoped to reduce waste without removing the hot meal option that many families valued.",
      "Food waste fell, but queues initially became slower because younger pupils forgot what they had ordered. Staff introduced colour-coded tokens and displayed a reminder list at the entrance to the dining hall. Vegetarian meals became easier to plan, although one popular pasta dish ran out when several pupils changed their minds after smelling it cooking.",
      "The catering manager said the system improved planning but could not remove all uncertainty from a lunch service. The school kept the system and allowed a small number of spare meals each day for pupils whose circumstances changed unexpectedly.",
    ],
    items: [
      {
        id: "lunch-purpose",
        subtype: "vr-tfc",
        question:
          "The school hoped to reduce waste while keeping a hot meal option. According to the passage, this statement is:",
        answer: "A",
        explanation:
          "The first paragraph states both aims.",
      },
      {
        id: "lunch-queues",
        subtype: "vr-detail",
        question: "Why did queues initially become slower?",
        optionTexts: [
          "Younger pupils forgot what they had ordered.",
          "The school removed hot meals.",
          "Vegetarian meals became impossible to plan.",
          "Cooks prepared meals without demand information.",
        ],
        answer: "A",
        explanation:
          "Queues slowed because younger pupils forgot their orders.",
      },
      {
        id: "lunch-uncertainty",
        subtype: "vr-inference",
        question: "What can be inferred about the pre-order system?",
        optionTexts: [
          "It improved forecasting but still needed flexibility.",
          "It ended all meal changes and spare meals.",
          "It increased food waste.",
          "It made vegetarian planning harder.",
        ],
        answer: "A",
        explanation:
          "Waste fell and planning improved, but spare meals remained necessary for unexpected changes.",
      },
      {
        id: "lunch-not-supported",
        subtype: "vr-negative",
        question:
          "All of the following are true of the lunch-token system except:",
        optionTexts: [
          "Staff introduced colour-coded tokens.",
          "Food waste fell after the system began.",
          "The school removed every spare meal.",
          "A pasta dish ran out after some pupils changed their minds.",
        ],
        answer: "C",
        explanation:
          "The school allowed a small number of spare meals each day.",
      },
    ],
  },
  {
    setId: "station-murals",
    stimulus: [
      "A railway station commissioned murals for a long pedestrian tunnel that passengers described as gloomy. The artists painted scenes from local industry, but they left several brick sections bare so maintenance staff could inspect damp patches. The station manager said the aim was to make the tunnel feel cared for, not to disguise structural problems.",
      "Passenger comments became more positive after the murals appeared, yet cleaning costs rose. The painted walls attracted fewer stickers, but more people stopped to take photographs, leaving the tunnel crowded during weekend events. The manager added floor arrows to keep people moving and arranged for guided school visits outside peak times.",
      "A transport arts charity praised the project because it combined visual improvement with maintenance access. It cautioned that public art in transport spaces should be judged by how it works during busy travel periods, not only by how it looks in publicity photographs.",
    ],
    items: [
      {
        id: "murals-damp",
        subtype: "vr-tfc",
        question:
          "All brick sections were painted over so damp patches could be hidden. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "Some brick sections were left bare so damp patches could be inspected.",
      },
      {
        id: "murals-cost",
        subtype: "vr-detail",
        question: "What increased after the murals appeared?",
        optionTexts: [
          "Cleaning costs.",
          "Sticker use.",
          "The number of hidden damp patches.",
          "Peak-time guided school visits.",
        ],
        answer: "A",
        explanation:
          "The passage states that cleaning costs rose.",
      },
      {
        id: "murals-charity",
        subtype: "vr-author",
        question: "The charity's attitude to the project is best described as:",
        optionTexts: [
          "Supportive, but focused on practical performance in a busy station.",
          "Opposed because public art cannot work in transport spaces.",
          "Concerned only with publicity photographs.",
          "Unaware that maintenance access was preserved.",
        ],
        answer: "A",
        explanation:
          "The charity praised the project but cautioned that busy-period performance mattered.",
      },
      {
        id: "murals-summary",
        subtype: "vr-summary",
        question: "Which summary best captures the passage?",
        optionTexts: [
          "Murals improved the tunnel but created crowd-management and cleaning issues.",
          "Murals were used to hide structural problems from maintenance staff.",
          "The tunnel became less popular after local scenes were painted.",
          "The station ended school visits because nobody took photographs.",
        ],
        answer: "A",
        explanation:
          "The passage balances improved perception with cleaning and crowding issues.",
      },
    ],
  },
  {
    setId: "seed-orchard",
    stimulus: [
      "A conservation group planted a seed orchard for rare apple varieties from old farm boundaries. The orchard was not intended to produce commercial fruit. Instead, it would preserve genetic material and provide grafts for farms that wanted to restore historic hedgerows. Volunteers labelled each tree with the farm name where its parent tree had been found.",
      "The first harvest was small because young trees produced unevenly. Some visitors assumed the project was failing when they saw little fruit at the autumn open day, but the group said early yield was a poor measure of success. More important was whether grafts survived after being planted back on farms.",
      "A later survey found that most grafts were alive after two winters, although deer damage was common where guards had been fitted badly. The group changed its training sessions to spend less time on apple history and more time on practical aftercare.",
    ],
    items: [
      {
        id: "orchard-commercial",
        subtype: "vr-tfc",
        question:
          "The seed orchard was intended mainly to produce commercial fruit. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The passage says the orchard was not intended to produce commercial fruit.",
      },
      {
        id: "orchard-label",
        subtype: "vr-detail",
        question: "What information was included on each tree label?",
        optionTexts: [
          "The farm where the parent tree had been found.",
          "The market price of the fruit.",
          "The number of deer in the orchard.",
          "The date of every autumn open day.",
        ],
        answer: "A",
        explanation:
          "Each tree was labelled with the farm name where its parent tree had been found.",
      },
      {
        id: "orchard-yield",
        subtype: "vr-inference",
        question: "What does the passage suggest was a better success measure than early yield?",
        optionTexts: [
          "Whether grafts survived after being returned to farms.",
          "How much fruit was sold commercially.",
          "Whether visitors saw full trees at the open day.",
          "Whether labels were removed from the orchard.",
        ],
        answer: "A",
        explanation:
          "The group said graft survival mattered more than early fruit yield.",
      },
      {
        id: "orchard-aftercare",
        subtype: "vr-summary",
        question: "What is the main role of the final paragraph?",
        optionTexts: [
          "To show how survey findings changed volunteer training.",
          "To prove deer damage made the project impossible.",
          "To describe a commercial sales plan.",
          "To explain why farm names were removed from labels.",
        ],
        answer: "A",
        explanation:
          "The final paragraph reports graft survival, deer damage and the resulting change to training.",
      },
    ],
  },
  {
    setId: "busking-zones",
    stimulus: [
      "Rivermouth Council created marked busking zones after shop owners complained that performers blocked narrow pavements. The zones were not licences; anyone could use them for up to forty minutes if no one else was waiting. The council said it wanted to protect spontaneous performance while reducing disputes outside shop entrances.",
      "The first weeks were calm in the main square, where the painted circles were obvious. Problems continued in two side streets because performers said the marks were hidden by cafe furniture. A musicians' group also argued that forty minutes was too short for performers who had travelled by train with heavy equipment.",
      "The council repainted the side-street zones and created a longer evening slot near the theatre. It refused to remove the time limit altogether, saying rotation was the only way to keep public space open to more than the loudest or earliest performer.",
    ],
    items: [
      {
        id: "busking-licences",
        subtype: "vr-tfc",
        question:
          "The marked busking zones were formal licences. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The passage says the zones were not licences.",
      },
      {
        id: "busking-side",
        subtype: "vr-detail",
        question: "Why did problems continue in two side streets?",
        optionTexts: [
          "The marks were hidden by cafe furniture.",
          "The main square had no painted circles.",
          "The council banned spontaneous performance.",
          "No performers wanted longer slots.",
        ],
        answer: "A",
        explanation:
          "Performers said the side-street marks were hidden by cafe furniture.",
      },
      {
        id: "busking-time",
        subtype: "vr-author",
        question: "The council's view of time limits is best described as:",
        optionTexts: [
          "Necessary to keep space available to a range of performers.",
          "Pointless because rotation was not considered.",
          "A way to stop all music near shops.",
          "Something that should be removed altogether.",
        ],
        answer: "A",
        explanation:
          "The council said rotation kept public space open to more than the loudest or earliest performer.",
      },
      {
        id: "busking-summary",
        subtype: "vr-summary",
        question: "Which summary best reflects the passage?",
        optionTexts: [
          "Busking zones reduced some disputes but needed clearer markings and adjusted timing.",
          "Busking zones ended all side-street problems immediately.",
          "The council replaced spontaneous performance with licences.",
          "Performers objected because the zones were too visible.",
        ],
        answer: "A",
        explanation:
          "The council retained the system but repainted zones and added a longer evening slot.",
      },
    ],
  },
  {
    setId: "river-lights",
    stimulus: [
      "A riverside path received low-level lighting after cyclists said the unlit route forced them onto a busy road after dusk. Wildlife volunteers objected to earlier plans for tall lamps because bats fed along the river corridor. The final design used shielded lights mounted close to the ground and motion sensors that dimmed the path when no one was nearby.",
      "Cyclist counts increased in the evening, but the sensors needed adjustment. On windy nights, moving reeds sometimes triggered the lights repeatedly. Ecologists also asked for a darker section near an old bridge where bat activity was highest. The council shortened the lit stretch and added reflective path edges through the darker section.",
      "A monitoring report described the scheme as a compromise rather than a complete victory for either transport or wildlife groups. It said the route was safer for many users, but that seasonal ecology checks should continue.",
    ],
    items: [
      {
        id: "lights-tall",
        subtype: "vr-tfc",
        question:
          "The final design used tall lamps along the river corridor. According to the passage, this statement is:",
        answer: "B",
        explanation:
          "The final design used shielded low-level lights, not tall lamps.",
      },
      {
        id: "lights-sensors",
        subtype: "vr-detail",
        question: "What sometimes triggered the sensors on windy nights?",
        optionTexts: [
          "Moving reeds.",
          "Cyclists using the busy road.",
          "Tall lamps near the bridge.",
          "Reflective path edges.",
        ],
        answer: "A",
        explanation:
          "The passage says moving reeds sometimes triggered the lights repeatedly.",
      },
      {
        id: "lights-compromise",
        subtype: "vr-inference",
        question: "What can be inferred about the final lighting scheme?",
        optionTexts: [
          "It balanced user safety with ongoing wildlife concerns.",
          "It fully satisfied transport and wildlife groups without changes.",
          "It reduced evening cycle use.",
          "It removed the need for ecology checks.",
        ],
        answer: "A",
        explanation:
          "The report called the scheme a compromise and recommended continuing ecology checks.",
      },
      {
        id: "lights-title",
        subtype: "vr-summary",
        question: "Which title best fits the passage?",
        optionTexts: [
          "Lighting a river path without ignoring bats",
          "Why cyclists were forced permanently onto the road",
          "A lighting plan with no environmental constraints",
          "The end of motion sensors on riverside paths",
        ],
        answer: "A",
        explanation:
          "The passage centres on improving path safety while responding to bat activity.",
      },
    ],
  },
];

export const EXTRA_HIGH_QUALITY_VR_QUESTIONS: UCATQuestion[] =
  EXTRA_VR_SETS.flatMap(buildSet);
