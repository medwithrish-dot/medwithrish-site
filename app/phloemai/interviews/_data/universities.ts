export type InterviewUniversity = {
  slug: string;
  name: string;
  format: "MMI" | "Panel" | "Mixed" | "Unconfirmed";
  stationCount: number;
  stationSeconds: number;
  breakSeconds: number;
  preparationSeconds: number;
  timingStatus: "published" | "practice";
  timingNote: string;
  sourceUrl: string;
  officialUrl: string;
};

export const UNIVERSITY_SOURCES_CHECKED = "2026-09-06";

const guideRoot = "https://www.theukcatpeople.co.uk/guide/medical-school/medicine/";

// Timing fields describe the runnable rehearsal. The accompanying note distinguishes
// reported timings from practice choices; an awarding body is not an admissions route.
function university(
  slug: string,
  name: string,
  officialUrl: string,
  options: Partial<Omit<InterviewUniversity, "slug" | "name" | "officialUrl">> & {
    timingNote: string;
  },
): InterviewUniversity {
  return {
    slug,
    name,
    officialUrl,
    format: "MMI",
    stationCount: 5,
    stationSeconds: 480,
    breakSeconds: 120,
    preparationSeconds: 0,
    timingStatus: "practice",
    sourceUrl: `${guideRoot}university-of-${slug}`,
    ...options,
  };
}

export const interviewUniversities: readonly InterviewUniversity[] = [
  university("aberdeen", "University of Aberdeen", "https://www.abdn.ac.uk/smmsn/", {
    stationCount: 6, stationSeconds: 300, breakSeconds: 0, timingStatus: "published",
    timingNote: "TheUKCATPeople reports six 5-minute stations. This rehearsal adds no separate reading time or interval because these are not specified in the current format summary. Older example timings on the guide differ; follow your invitation.",
  }),
  university("aston", "Aston University", "https://www.aston.ac.uk/hls/aston-medical-school", {
    timingNote: "TheUKCATPeople reports online MMI stations lasting 8 minutes, without a fixed station count. This rehearsal uses five stations and 2-minute intervals as practice settings.",
  }),
  university("anglia-ruskin", "Anglia Ruskin University", "https://www.aru.ac.uk/health-education-medicine-and-social-care/medicine", {
    stationCount: 6, stationSeconds: 420, preparationSeconds: 60, breakSeconds: 0, timingStatus: "published",
    timingNote: "TheUKCATPeople describes six 7-minute interviews with 1 minute of reading before each, citing ARU admissions. Reading is the transition period here; there is no additional rest timer.",
  }),
  university("birmingham", "University of Birmingham", "https://www.birmingham.ac.uk/university/colleges/mds/index.aspx", {
    stationCount: 7, stationSeconds: 360, preparationSeconds: 120, breakSeconds: 0,
    timingNote: "TheUKCATPeople reports six or seven stations, each with 6 minutes of discussion and 2 minutes of reading. This rehearsal chooses seven. International arrangements and the separate calculation assessment differ.",
  }),
  university("bristol", "University of Bristol", "https://www.bristol.ac.uk/medical-school/", {
    stationCount: 6, stationSeconds: 300, breakSeconds: 0,
    timingNote: "Bristol calls its process a structured interview: TheUKCATPeople reports six stations and approximately 30 minutes overall. Five minutes per station is our practice allocation, not a separately published station duration.",
  }),
  university("buckingham", "University of Buckingham", "https://medvle.buckingham.ac.uk/", {
    stationCount: 4,
    timingNote: "TheUKCATPeople describes an MMI after a separate Multiple Mini Assessment. Four 8-minute stations are reported by third parties but unconfirmed by the university; these and the 2-minute intervals are practice settings.",
  }),
  university("cambridge", "University of Cambridge", "https://www.medschl.cam.ac.uk/", {
    format: "Panel", stationCount: 2, stationSeconds: 1200,
    timingNote: "Cambridge interviews are academic conversations arranged by individual colleges; the number and duration vary. Two 20-minute discussions with a 2-minute interval are a practice choice, not a university-wide format.",
  }),
  university("cardiff", "Cardiff University", "https://www.cardiff.ac.uk/medicine", {
    stationCount: 9, stationSeconds: 360,
    timingNote: "TheUKCATPeople confirms MMI but says Cardiff does not publish fixed station counts or durations. Nine 6-minute stations are indicative third-party figures; the 2-minute intervals are practice settings.",
  }),
  university("city-st-georges", "City St George’s, University of London", "https://www.sgul.ac.uk/", {
    sourceUrl: `${guideRoot}university-of-st-george%27s`,
    stationCount: 6, stationSeconds: 300, breakSeconds: 60, timingStatus: "published",
    timingNote: "TheUKCATPeople describes six online stations of about 5 minutes, including the question being read aloud, with 60 seconds between them. This preset covers A100; other routes may differ.",
  }),
  university("dundee", "University of Dundee", "https://www.dundee.ac.uk/undergraduate/medicine/interview", {
    format: "Mixed", stationCount: 2, stationSeconds: 1800,
    timingNote: "Dundee now uses an observed group discussion of around 30 minutes followed by discussion with an assessor. Two 30-minute blocks and a 2-minute interval are a rehearsal approximation; only the first discussion's length is published. Use Groups to rehearse collaboratively.",
  }),
  university("east-anglia", "University of East Anglia", "https://www.uea.ac.uk/medicine", {
    sourceUrl: `${guideRoot}university-of-norwich`,
    stationCount: 6, stationSeconds: 300, preparationSeconds: 90, breakSeconds: 0,
    timingNote: "TheUKCATPeople reports six stations with about 5 minutes of answering and 90 seconds of reading, but identifies the figures as application-guide timings requiring confirmation for your cycle. This rehearsal follows those indicative timings.",
  }),
  university("edge-hill", "Edge Hill University", "https://www.edgehill.ac.uk/course/medicine/", {
    timingNote: "TheUKCATPeople confirms MMI but explicitly says the station count and durations are not officially published. Five 8-minute stations with 2-minute intervals are practice settings.",
  }),
  university("edinburgh", "University of Edinburgh", "https://www.ed.ac.uk/", {
    format: "Mixed",
    timingNote: "Edinburgh holds an assessment day with a series of short interviews. TheUKCATPeople says exact counts and durations are not published. Five 8-minute discussions with 2-minute intervals are a practice circuit, not the full assessment day.",
  }),
  university("exeter", "University of Exeter", "https://medicine.exeter.ac.uk/", {
    stationCount: 5, stationSeconds: 300,
    timingNote: "TheUKCATPeople describes MMI; station counts vary between older official information and current third-party reports. Five 5-minute stations with 2-minute intervals are indicative practice settings. Check the current BMBS admissions policy.",
  }),
  university("glasgow", "University of Glasgow", "https://www.gla.ac.uk/colleges/mvls/", {
    format: "Panel", stationCount: 2, stationSeconds: 900, breakSeconds: 0,
    timingNote: "TheUKCATPeople reports a roughly 30-minute interview split between Panel A and Panel B. Dividing this equally into two 15-minute discussions is a practice allocation; the guide does not specify equal time for each panel.",
  }),
  university("imperial-college-london", "Imperial College London", "https://www.imperial.ac.uk/medicine/", {
    stationCount: 7, stationSeconds: 300, preparationSeconds: 60, breakSeconds: 0, timingStatus: "published",
    timingNote: "TheUKCATPeople describes seven 5-minute stations, with around 1 minute to read the next briefing. The reading period acts as the transition; no additional rest interval is added.",
  }),
  university("keele", "Keele University", "https://www.keele.ac.uk/medicine/", {
    format: "Panel", stationCount: 2, stationSeconds: 900,
    timingNote: "TheUKCATPeople reports two separate 15-minute online panel interviews, usually in the same half-day. This rehearsal uses those lengths with a 2-minute practice interval; the real interval is allocated by Keele.",
  }),
  university("kings-college-london", "King’s College London", "https://www.kcl.ac.uk/lsm/index.aspx", {
    sourceUrl: `${guideRoot}university-of-kings-college-london-`,
    stationCount: 7, stationSeconds: 360,
    timingNote: "TheUKCATPeople cites seven online MMI stations for A100, but no officially published duration. Six minutes of answering and 2-minute intervals are practice settings. Other King's routes may have different arrangements.",
  }),
  university("lancashire", "University of Lancashire", "https://www.lancashire.ac.uk/schools/medicine-dentistry", {
    sourceUrl: `${guideRoot}university-of-uclan-`,
    stationCount: 8, stationSeconds: 420,
    timingNote: "Formerly UCLan. TheUKCATPeople cites an official range of six to ten MMI stations; eight stations of around 7 minutes are third-party figures. This rehearsal uses those indicative figures with 2-minute practice intervals.",
  }),
  university("lancaster", "Lancaster University", "https://www.lancaster.ac.uk/lms/", {
    stationCount: 12, stationSeconds: 300, breakSeconds: 0,
    timingNote: "TheUKCATPeople cites 12–15 online stations of approximately 5 minutes, including tasks and preparation stations. This rehearsal chooses twelve answer stations without additional intervals; it does not reproduce Lancaster's task/preparation sequence.",
  }),
  university("leeds", "University of Leeds", "https://medicinehealth.leeds.ac.uk/medicine", {
    stationCount: 8, stationSeconds: 360, preparationSeconds: 120, breakSeconds: 0,
    timingNote: "TheUKCATPeople says the count and duration are not officially fixed; eight 6-minute stations are indicative, with 2 minutes of reading described in its guidance. This is a practice preset requiring confirmation against your invitation.",
  }),
  university("leicester", "University of Leicester", "https://le.ac.uk/medicine", {
    stationCount: 7, stationSeconds: 600, breakSeconds: 0,
    timingNote: "TheUKCATPeople cites seven stations of about 10 minutes for on-campus interviews. This rehearsal allocates the full block to answers because the reading/discussion split is unspecified. International online interviews and numeracy arrangements differ.",
  }),
  university("liverpool", "University of Liverpool", "https://www.liverpool.ac.uk/medicine/", {
    timingNote: "TheUKCATPeople confirms MMI, on campus for home applicants and online for international applicants, but no published fixed count or duration. Five 8-minute stations with 2-minute intervals are practice settings.",
  }),
  university("london", "University of London", "https://www.london.ac.uk/federation", {
    format: "Unconfirmed", sourceUrl: "https://www.london.ac.uk/federation",
    timingNote: "This is an awarding/federation entry, not a single medical-school admissions process. Select the relevant member medical school for its interview format. This entry launches general medicine practice: five 8-minute stations and 2-minute intervals.",
  }),
  university("manchester", "University of Manchester", "https://www.manchester.ac.uk/study/undergraduate/courses/2026/01428/mbchb-medicine/", {
    timingStatus: "published",
    timingNote: "TheUKCATPeople reports five MMI stations, each lasting 8 minutes, with a 2-minute gap between stations. There is no added preparation timer. Follow your official interview invitation if its arrangements differ.",
  }),
  university("newcastle", "Newcastle University", "https://www.ncl.ac.uk/undergraduate/degrees/a100/", {
    stationCount: 7, stationSeconds: 420,
    timingNote: "TheUKCATPeople reports seven 7-minute MMI stations, including role-play. A 2-minute interval is a practice addition because the cited timing summary does not specify the transition length; applicant routes may differ.",
  }),
  university("nottingham", "University of Nottingham", "https://www.nottingham.ac.uk/mhs/", {
    stationCount: 6, stationSeconds: 300, breakSeconds: 0, timingStatus: "published",
    timingNote: "TheUKCATPeople cites six online 5-minute scenarios in the 2026 admissions policy. The real interview also begins with a 1-minute unscored ice-breaker; this rehearsal covers the six assessed scenarios and adds no interval.",
  }),
  university("oxford", "University of Oxford", "https://www.medsci.ox.ac.uk/", {
    format: "Panel", stationCount: 2, stationSeconds: 1200,
    timingNote: "Oxford interviews are academic panel conversations arranged across two colleges, with counts and durations varying. Two 20-minute discussions with a 2-minute interval are practice settings, not a complete reproduction of the college interviews.",
  }),
  university("plymouth", "University of Plymouth", "https://www.plymouth.ac.uk/schools/peninsula-medical-school", {
    timingNote: "TheUKCATPeople describes MMI and indicative reports of about five stations, but says official counts and lengths are not fixed publicly. Five 8-minute stations with 2-minute intervals are practice settings.",
  }),
  university("queen-mary", "Queen Mary University of London", "https://www.qmul.ac.uk/fmd/", {
    sourceUrl: `${guideRoot}university-of-barts-and-london`,
    format: "Panel", stationCount: 1, stationSeconds: 1200, breakSeconds: 0,
    timingNote: "Barts and The London uses a panel interview. TheUKCATPeople says the duration is not officially published; around 20 minutes is a third-party estimate used here for practice. Article discussion may be part of your invitation's instructions.",
  }),
  university("queens-belfast", "Queen’s University Belfast", "https://www.qub.ac.uk/schools/mdbs/", {
    sourceUrl: `${guideRoot}university-of-queen%27s-university-belfast`,
    stationCount: 9, stationSeconds: 300, preparationSeconds: 60, breakSeconds: 0,
    timingNote: "TheUKCATPeople reports nine in-person stations for home applicants and seven online for international applicants. This home-route rehearsal uses 5-minute answers and 1-minute preparation as practice choices; the source does not confirm station durations.",
  }),
  university("sheffield", "University of Sheffield", "https://www.sheffield.ac.uk/medicine", {
    format: "Mixed", stationCount: 8, stationSeconds: 480,
    timingNote: "TheUKCATPeople describes eight MMI sections for home applicants and an online panel for international A100 applicants. This home-route rehearsal uses 8-minute stations and 2-minute intervals as practice choices; official durations are not published.",
  }),
  university("southampton", "University of Southampton", "https://www.southampton.ac.uk/medicine", {
    format: "Mixed", stationCount: 2, stationSeconds: 1200,
    timingNote: "TheUKCATPeople describes a panel of around 20 minutes and a group discussion of 20–30 minutes. This rehearsal chooses two 20-minute blocks and a 2-minute interval. Use Groups to practise discussion; the solo interviewer cannot reproduce a real group task.",
  }),
  university("sunderland", "University of Sunderland", "https://www.sunderland.ac.uk/study/medicine/", {
    stationCount: 6,
    timingNote: "TheUKCATPeople confirms in-person MMI and cites six stations for an earlier cycle, without current fixed timings. Six 8-minute stations and 2-minute intervals are practice choices. The separate numeracy assessment is not included.",
  }),
  university("swansea", "Swansea University", "https://www.swansea.ac.uk/medicine/", {
    format: "Mixed", stationCount: 3, stationSeconds: 1200,
    timingNote: "TheUKCATPeople reports three face-to-face graduate-entry stations of 20–30 minutes, including interview, presentation and role-play tasks. This rehearsal chooses 20-minute blocks with 2-minute intervals; it does not reproduce every assessment-day task.",
  }),
  university("ucl", "University College London", "https://www.ucl.ac.uk/medical-school/", {
    sourceUrl: `${guideRoot}university-of-ucl-%28university-college-london%29`,
    stationCount: 8, stationSeconds: 300, preparationSeconds: 60, breakSeconds: 0,
    timingNote: "TheUKCATPeople describes up to eight 5-minute stations with about 1 minute to read each briefing and 2–3 questions per station. This rehearsal selects eight; your invitation sets the actual count.",
  }),
  university("ulster", "Ulster University", "https://www.ulster.ac.uk/courses/202627/medicine-41407/", {
    stationCount: 8, stationSeconds: 480,
    timingNote: "TheUKCATPeople confirms a graduate-entry MMI but says station count and duration are not officially published. Eight stations is indicative; 8-minute answers and 2-minute intervals are practice choices.",
  }),
  university("warwick", "University of Warwick", "https://warwick.ac.uk/fac/med", {
    stationCount: 6, stationSeconds: 600, breakSeconds: 0,
    timingNote: "TheUKCATPeople cites six graduate-entry MMI stations of approximately 10 minutes. This rehearsal gives each block to discussion because a separate reading/rest split is not specified in the source.",
  }),
  university("brighton-sussex", "Brighton and Sussex Medical School", "https://www.bsms.ac.uk/index.aspx", {
    sourceUrl: `${guideRoot}university-of-brighton-and-sussex`,
    stationCount: 5, stationSeconds: 600,
    timingNote: "Joint Brighton and Sussex programme. TheUKCATPeople reports five 10-minute stations with a short break between them. The rehearsal chooses a 2-minute interval because the break length is unspecified.",
  }),
  university("kent-medway", "Kent and Medway Medical School", "https://kmms.ac.uk/", {
    sourceUrl: `${guideRoot}university-of-kent-and-medway`,
    format: "Mixed", stationCount: 6, stationSeconds: 420, breakSeconds: 180,
    timingNote: "Joint Canterbury Christ Church and Kent programme. TheUKCATPeople cites previous six 7-minute stations with 3-minute intervals plus an approximately 40-minute group task, with current counts unconfirmed. This rehearsal covers the six short stations; use Groups for group practice.",
  }),
  university("scotgem", "Scottish Graduate Entry Medicine (Dundee and St Andrews)", "https://www.st-andrews.ac.uk/subjects/medicine/scotgem-mbchb/", {
    sourceUrl: "https://www.st-andrews.ac.uk/subjects/medicine/scotgem-mbchb/selection/",
    stationCount: 6, stationSeconds: 420, breakSeconds: 30,
    timingNote: "The official ScotGEM selection page describes 7-minute MMI stations and 30-second breaks. The station count is not specified, so six is a practice choice. This differs from Dundee's standard undergraduate group interview.",
  }),
  university("hull-york", "Hull York Medical School", "https://www.hyms.ac.uk/", {
    format: "Mixed", stationCount: 5, stationSeconds: 480,
    timingNote: "Joint Hull and York programme. TheUKCATPeople describes two mini-interviews, a group exercise, a scenario and a student station for home applicants. Five 8-minute blocks with 2-minute intervals are practice allocations; actual durations and international arrangements differ.",
  }),
];

const universityAliases: Record<string, string> = {
  "st-georges": "city-st-georges",
  "st-george-s": "city-st-georges",
  "anglia-ruskin-university": "anglia-ruskin",
  "imperial": "imperial-college-london",
  "kings": "kings-college-london",
  "uclan": "lancashire",
  "uea": "east-anglia",
  "norwich": "east-anglia",
  "barts": "queen-mary",
  "barts-and-london": "queen-mary",
  "queen-mary-university-of-london": "queen-mary",
  "queens-university-belfast": "queens-belfast",
  "brighton-and-sussex": "brighton-sussex",
  "bsms": "brighton-sussex",
  "kent-and-medway": "kent-medway",
  "kmms": "kent-medway",
};

export function findInterviewUniversity(slug: string | null | undefined) {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase();
  const resolved = universityAliases[normalized] ?? normalized;
  return interviewUniversities.find((entry) => entry.slug === resolved);
}

export function universityTimingSummary(entry: InterviewUniversity) {
  const name = entry.format === "Panel" || entry.format === "Mixed" ? "blocks" : "stations";
  return `${entry.stationCount} ${name} × ${entry.stationSeconds / 60} min`;
}
