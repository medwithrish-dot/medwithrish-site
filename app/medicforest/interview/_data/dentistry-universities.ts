import type { InterviewUniversity } from "./universities";

export type DentistryUniversity = InterviewUniversity & {
  preparation: readonly string[];
};

export const DENTISTRY_UNIVERSITY_SOURCES_CHECKED = "2026-11-10";

// All timers are our rehearsal choices. A school label does not imply that we
// reproduce its real stations, mark scheme or confidential interview content.
const practiceNote = "This rehearsal uses five 8-minute discussions with 2-minute intervals. These are MedicForest practice settings, not a promise of this school's station count, topics or timings. Follow the instructions in your interview invitation.";

function school(
  slug: string,
  name: string,
  sourceUrl: string,
  format: InterviewUniversity["format"],
  note: string,
  preparation: readonly string[],
): DentistryUniversity {
  return {
    slug, name, sourceUrl, officialUrl: sourceUrl, format,
    stationCount: 5, stationSeconds: 480, breakSeconds: 120, preparationSeconds: 0,
    timingStatus: "practice", timingNote: `${note} ${practiceNote}`, preparation,
  };
}

export const dentistryUniversities: readonly DentistryUniversity[] = [
  school(
    "birmingham", "University of Birmingham",
    "https://www.birmingham.ac.uk/about/college-of-medicine-and-health/dentistry/undergraduate/applying-to-dentistry/dentistry-interviews",
    "MMI",
    "Birmingham's dentistry guidance describes multiple mini-interviews and includes practical skills among its assessment areas. Our spoken rehearsal does not assess a physical dexterity task.",
    [
      "Reflect on an experience that developed your communication or self-awareness.",
      "Explore the GDC's professional standards using an everyday ethical example.",
      "Prepare to explain how you develop practical skills; use the separate dexterity guide for physical practice.",
    ],
  ),
  school(
    "bristol", "University of Bristol",
    "https://www.bristol.ac.uk/study/undergraduate/2027/dentistry/bds-dentistry/",
    "Unconfirmed",
    "Use Bristol's Dentistry admissions statement and your invitation to confirm the interview format for your course and application year. This course page links to the current selection information; the rehearsal is a general dental interview circuit.",
    [
      "Research how the course combines its different areas of learning and explain why that suits you.",
      "Think about how you would use reflection and feedback during a demanding degree.",
      "Check the Dentistry or Gateway course information that matches your application.",
    ],
  ),
  school(
    "dundee", "University of Dundee",
    "https://www.dundee.ac.uk/undergraduate/dentistry/interview",
    "MMI",
    "Dundee's September 2027 guidance describes stations covering thinking, values, communication and teamwork, including a role-play scenario. Our spoken questions rehearse reflection and reasoning; they do not reproduce an assessed interaction with an actor.",
    [
      "Practise explaining your thinking when a situation has more than one reasonable response.",
      "Use a partner for a short conversation and ask whether you listened and adapted.",
      "Prepare an example of teamwork and what you learned from it.",
    ],
  ),
  school(
    "liverpool", "University of Liverpool",
    "https://www.liverpool.ac.uk/dentistry/study/undergraduate/bachelor-of-dental-surgery/",
    "Unconfirmed",
    "Liverpool's A200 2027 admissions information says non-academic attributes are assessed at interview. Check the invitation for the format and arrangements; this rehearsal uses general dentistry topics rather than claiming an exact Liverpool circuit.",
    [
      "Find two course features from the official pages and connect each with your own learning needs.",
      "Choose examples that show reflection, communication and responsibility.",
      "Check the latest A200 guidance rather than assuming another dental course has the same process.",
    ],
  ),
  school(
    "manchester", "University of Manchester",
    "https://www.bmh.manchester.ac.uk/study/dentistry/apply/interviews/",
    "MMI",
    "Manchester's dentistry guidance describes a five-station MMI and encourages natural conversation about motivation and experience. This rehearsal's 8-minute timer differs from the 7-minute station duration currently described by the university.",
    [
      "Explain why dentistry appeals to you using what you have learned about the work.",
      "Reflect on caring or communication experiences without memorising a script.",
      "Practise discussing an ethical issue in clear language and acknowledging uncertainty.",
    ],
  ),
  school(
    "sheffield", "University of Sheffield",
    "https://www.sheffield.ac.uk/dentalschool/bds-dental-surgery-selection-process-and-entry-requirements",
    "Mixed",
    "The available Sheffield page describes a structured panel interview and a separate group task, but includes dates for the 2026 cycle. Confirm arrangements for your own year. Our individual discussions do not reproduce the group assessment or the panel's timing.",
    [
      "Explain your commitment to Sheffield using current, specific course information.",
      "Reflect on career exploration and how your values relate to dentistry.",
      "Practise a group discussion with others, focusing on listening, empathy and making space for contributions.",
    ],
  ),
];

export function findDentistryUniversity(slug: string | undefined) {
  return dentistryUniversities.find((university) => university.slug === slug);
}
