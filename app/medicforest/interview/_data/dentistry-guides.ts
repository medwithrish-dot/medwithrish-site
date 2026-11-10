export type DentistryGuide = {
  slug: string;
  title: string;
  summary: string;
  sections: readonly { title: string; paragraphs: readonly string[] }[];
  sources: readonly { title: string; url: string }[];
};

const professionalStandards = {
  title: "GDC: Standards for the dental team",
  url: "https://www.gdc-uk.org/standards-guidance/standards-and-guidance/standards-for-the-dental-team",
};

export const DENTISTRY_GUIDES: readonly DentistryGuide[] = [
  {
    slug: "manual-dexterity",
    title: "Manual dexterity: practise the process",
    summary: "Build control, patience and reflection with simple activities. A spoken answer cannot measure your hand skills.",
    sections: [
      { title: "What you can practise here", paragraphs: [
        "The question bank and AI interviews can help you explain how you learn a practical skill, respond to feedback and handle mistakes. They do not assess the movement of your hands or the quality of a physical object.",
        "A physical task needs materials and direct observation. Schools use different arrangements, and some do not include a practical task at all. Check your invitation rather than preparing for a rumoured station.",
      ] },
      { title: "A simple home exercise", paragraphs: [
        "Choose an ordinary activity you can do safely, such as folding a paper model from instructions, copying a small drawing or shaping modelling clay. There is no need for specialist dental equipment, sharp instruments or work on anyone's teeth.",
        "Read the instructions, choose a clear aim and work for a short period. Notice where you lose accuracy and whether you rush when something goes wrong. Repeat the same task after changing one part of your approach.",
      ] },
      { title: "Review the attempt", paragraphs: [
        "Compare the result with the instructions. Ask what improved, which step still needs work and what feedback would help. If someone watches, ask them about your approach as well as the finished result.",
        "Keep a brief record of the task, the change you tried and what happened. In an interview, explain this learning in your own words. A hobby can show patience and practice; it does not prove clinical competence.",
      ] },
      { title: "On the day", paragraphs: [
        "Listen carefully and ask for clarification when the instructions allow it. Use the time sensibly, correct what you can and be honest about mistakes. You do not need to describe every movement unless asked.",
        "If you need an adjustment to take part, contact the admissions team in advance using its published process. Do not assume a particular hobby or way of completing a task is required.",
      ] },
    ],
    sources: [{ title: "Birmingham: Dentistry interviews", url: "https://www.birmingham.ac.uk/about/college-of-medicine-and-health/dentistry/undergraduate/applying-to-dentistry/dentistry-interviews" }],
  },
  {
    slug: "role-play-and-group-tasks",
    title: "Role play and group tasks",
    summary: "Practise listening and adapting with another person. A solo explanation is useful preparation, but it cannot show how you respond in a real exchange.",
    sections: [
      { title: "Know what the practice can show", paragraphs: [
        "AI interview questions can ask how you would approach a difficult conversation. That tests your explanation, not whether you actually listen to a person whose response changes the situation. Use a partner to practise the interaction itself.",
        "For group tasks, practise with more than one person when possible. Your aim is to help the group think clearly and make progress, rather than to deliver the longest answer.",
      ] },
      { title: "Try a short conversation", paragraphs: [
        "Ask a partner to play someone worried about attending a dental appointment. Their concern could be a previous poor experience, cost or feeling judged. Begin by listening and asking what matters to them; do not start with a prepared speech.",
        "Keep within the role in the instructions. As an applicant or observer, you can acknowledge feelings and seek help from the team. You should not diagnose, promise treatment or present yourself as a qualified dentist.",
        "Afterwards, ask your partner whether they felt heard, which question helped and whether you made any assumptions. Swap roles and try again using one improvement.",
      ] },
      { title: "Try a group decision", paragraphs: [
        "With two or three other people, discuss how to spend a small school wellbeing budget. Agree the aim, hear different options and decide how you will compare them. This is an original rehearsal, not a recalled admissions task.",
        "Notice whether you invite quieter people in, explain disagreements respectfully and summarise the group's reasoning. Ask for feedback on one useful contribution and one moment where you could have listened better.",
      ] },
      { title: "What to avoid", paragraphs: [
        "Do not treat empathy as a phrase to say before returning to your script. Let what the person says affect your next question. Avoid false reassurance, personal criticism and promises you cannot keep.",
        "In a group, do not confuse leadership with controlling the conversation. A concise summary, a useful question or making room for another view may help more than speaking again.",
      ] },
    ],
    sources: [
      { title: "Dundee: Dentistry interview", url: "https://www.dundee.ac.uk/undergraduate/dentistry/interview" },
      { title: "Sheffield: Dental Surgery selection process", url: "https://www.sheffield.ac.uk/dentalschool/bds-dental-surgery-selection-process-and-entry-requirements" },
    ],
  },
  {
    slug: "why-dentistry-and-reflection",
    title: "Why dentistry? Build an answer you can explain",
    summary: "Connect your interest with what you have learned about patients, practical work and the responsibilities of the profession.",
    sections: [
      { title: "Start with your own reasons", paragraphs: [
        "Write down two or three things that attract you to dentistry. Then ask what you have done to explore each one. A useful answer connects an interest to evidence and reflection; it does not need a dramatic childhood story.",
        "For example, enjoying practical activities may have prompted your interest. Explain what you then learned about working with patients, taking responsibility and continuing to develop your skills.",
      ] },
      { title: "Use an experience well", paragraphs: [
        "Briefly explain the situation, your part in it and what you noticed. Spend more time on what it taught you than on describing every event. Say how your thinking changed or what you would do differently.",
        "Experience does not have to come from an expensive course or a long clinical placement. Paid work, caring, volunteering, teamwork and reliable career exploration can give you useful material. Be honest about what you observed and what you did yourself.",
      ] },
      { title: "Show a realistic picture", paragraphs: [
        "Explore both the appeal and the demands of dentistry. You might discuss helping someone feel comfortable, learning a detailed practical skill, working with others or facing uncertainty. Avoid claiming that all dentists have the same working day.",
        "If asked why dentistry rather than another career, explain your own fit respectfully. Caring for people, science and teamwork are shared across many professions.",
      ] },
      { title: "Practise without learning a script", paragraphs: [
        "Make a few prompts rather than memorising complete sentences. Answer aloud, then ask whether you explained why each example mattered. Try a follow-up such as 'What challenged that view?' to check that you can discuss your reasoning.",
        "Protect confidentiality when using examples. Remove details that could identify someone and focus on your learning.",
      ] },
    ],
    sources: [{ title: "Manchester: Dentistry interview preparation", url: "https://www.bmh.manchester.ac.uk/study/dentistry/apply/interviews/" }],
  },
  {
    slug: "dental-ethics",
    title: "Dental ethics in plain English",
    summary: "Explain the concern, consider the people involved and choose a safe next step within your role.",
    sections: [
      { title: "Begin with the situation", paragraphs: [
        "Identify the main concern before jumping to an answer. Ask what you know, what you still need to find out and whether anyone needs immediate help. Different facts can change the right response.",
        "Then consider the patient's wishes, possible harm, fairness and the responsibilities of the team. Explain the reasoning in everyday language; naming an ethical principle without applying it is not enough.",
      ] },
      { title: "Consent is a conversation", paragraphs: [
        "A patient needs understandable information and a voluntary choice. A signature alone does not show that someone understands. Discuss options and relevant consequences, check understanding and recognise that wishes can change.",
        "If a scenario raises questions about a child's decision or someone's ability to decide, acknowledge the need for qualified guidance and the applicable rules. Do not invent a legal age rule or assume disability means a person cannot choose.",
      ] },
      { title: "Be honest about your role", paragraphs: [
        "An applicant on work experience is an observer. Raise concerns with the supervisor and follow the setting's procedures. Do not access records, give clinical advice or take over a situation simply to sound decisive.",
        "If the first person does not address a serious concern, explain how you would seek further appropriate support. Keep the account factual and protect private information.",
      ] },
      { title: "Finish with a reasoned next step", paragraphs: [
        "State what you would do and why. Mention what would change your decision or when you would ask for help. Good answers can acknowledge uncertainty while still taking responsibility for a sensible next step.",
      ] },
    ],
    sources: [professionalStandards, { title: "GDC: Obtain valid consent", url: "https://standards.gdc-uk.org/pages/principle3/principle3" }],
  },
  {
    slug: "nhs-dentistry-and-prevention",
    title: "NHS dentistry, access and prevention",
    summary: "Discuss people and practical barriers clearly, and check current claims before using them in an interview.",
    sections: [
      { title: "Think beyond the appointment", paragraphs: [
        "Access can depend on appointment availability, cost, travel, communication needs and previous experiences. Avoid assuming that someone who has delayed care is careless. Explain how barriers may combine and affect daily life.",
        "When considering a solution, ask who it helps, who it might miss, what resources it needs and how its effects would be checked. Extra appointments, better support and prevention may each address different parts of a problem.",
      ] },
      { title: "Keep prevention realistic", paragraphs: [
        "Prevention includes helping people develop habits they can maintain and receive advice suited to their needs. NHS guidance includes brushing with fluoride toothpaste, cleaning between teeth and limiting sugary food and drink. A dental professional can advise on individual needs and check-up frequency.",
        "For interview practice, focus on how advice is communicated: ask what the person already knows, listen to barriers and agree a manageable next step. Do not give a long lecture or assume information alone changes behaviour.",
      ] },
      { title: "Check the place and date", paragraphs: [
        "NHS arrangements differ across England, Scotland, Wales and Northern Ireland, and policies can change. Check which nation and time period a claim refers to before using it. You do not need to memorise changing charges or contract details to give a thoughtful general answer.",
        "Use an official source for a current policy or figure. If you cannot verify a number, explain the issue without it. Be clear about the difference between evidence, a proposal and your own opinion.",
      ] },
    ],
    sources: [
      { title: "NHS: Dental services", url: "https://www.nhs.uk/nhs-services/dentists/" },
      { title: "NHS: Tooth decay and prevention", url: "https://www.nhs.uk/conditions/tooth-decay/" },
    ],
  },
  {
    slug: "research-your-dental-school",
    title: "Research your dental school",
    summary: "Find specific reasons for your course choice and separate published information from practice suggestions.",
    sections: [
      { title: "Use the right course page", paragraphs: [
        "Start with the university's official page for your exact course and entry year. A standard degree, gateway course and graduate route can have different requirements or arrangements. Follow links to admissions policies and interview guidance.",
        "Write down where you found each important detail. Check it again before your interview, and use your invitation for the final arrangements.",
      ] },
      { title: "Turn facts into reasons", paragraphs: [
        "Choose two or three features that matter to you, such as how learning is organised, practical preparation, patient contact or student support. Explain why each fits your interests or an experience of learning well.",
        "Do not claim a school offers something because another school does. Rankings and location may matter to you, but an answer is stronger when it also shows that you understand the course.",
      ] },
      { title: "Prepare questions and examples", paragraphs: [
        "Think of one question you would ask a current student and one you would ask the admissions team. Use your research to make them specific. Ask for clarification rather than requesting confidential interview content.",
        "Prepare examples of learning from feedback, working with others and managing a challenge. Explain how those experiences could help you adapt to dental school.",
      ] },
      { title: "Understand the rehearsal", paragraphs: [
        "MedicForest university practice uses original dental questions and clearly labelled practice timings. It is preparation for relevant skills, not a copy of a school's real interview or its admissions mark scheme.",
        "Physical tasks, actor interactions and group exercises need separate practice. Use the practical guides and another person where helpful, and follow your school's instructions about what to bring or prepare.",
      ] },
    ],
    sources: [
      { title: "Bristol: BDS Dentistry", url: "https://www.bristol.ac.uk/study/undergraduate/2027/dentistry/bds-dentistry/" },
      { title: "Liverpool: BDS admissions", url: "https://www.liverpool.ac.uk/dentistry/study/undergraduate/bachelor-of-dental-surgery/" },
    ],
  },
];

export function findDentistryGuide(slug: string) {
  return DENTISTRY_GUIDES.find((guide) => guide.slug === slug);
}
