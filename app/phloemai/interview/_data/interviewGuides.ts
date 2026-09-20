import type { InterviewQuestion, InterviewQuestionCategoryTitle, InterviewQuestionSubcategory } from "./interviewQuestionBank";

export type InterviewGuide = {
  slug: string;
  title: string;
  category: InterviewQuestionCategoryTitle;
  summary: string;
  subcategories: readonly InterviewQuestionSubcategory[];
  topics: readonly string[];
  tags: readonly string[];
  featured: boolean;
  sections: readonly { title: string; text: string }[];
  practiceQuestion: string;
  avoid: string;
  station?: string;
  sources: readonly { title: string; url: string }[];
  reviewedAt: string;
};

const sources = {
  standards: { title: "GMC: Good medical practice", url: "https://www.gmc-uk.org/professional-standards/the-professional-standards/good-medical-practice" },
  capacity: { title: "NHS: consent and capacity", url: "https://www.nhs.uk/tests-and-treatments/consent-to-treatment/capacity/" },
  safety: { title: "NHS England: learning from patient safety incidents", url: "https://www.england.nhs.uk/patient-safety/patient-safety-insight/incident-response-framework/" },
  bawa: { title: "GMC: Bawa-Garba appeal and case chronology", url: "https://www.gmc-uk.org/-/media/documents/dr-bawa-garba-appeal---faq_pdf-75643041.pdf" },
  plan: { title: "DHSC: 10 Year Health Plan for England", url: "https://www.gov.uk/government/publications/10-year-health-plan-for-england-fit-for-the-future/fit-for-the-future-10-year-health-plan-for-england-executive-summary" },
  medicines: { title: "NICE: tirzepatide for managing overweight and obesity", url: "https://www.nice.org.uk/guidance/TA1026/chapter/1-Recommendations" },
  ai: { title: "WHO: ethics and governance of AI for health", url: "https://www.who.int/publications/i/item/9789240029200" },
  roles: { title: "DHSC: the Leng review", url: "https://www.gov.uk/government/publications/independent-review-of-the-physician-associate-and-anaesthesia-associate-roles-final-report/the-leng-review-an-independent-review-into-physician-associate-and-anaesthesia-associate-professions" },
  amr: { title: "WHO: antimicrobial resistance", url: "https://www.who.int/en/news-room/fact-sheets/detail/antimicrobial-resistance" },
  climate: { title: "WHO: climate change and health", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health" },
  covid: { title: "WHO: post COVID-19 condition", url: "https://www.who.int/europe/news-room/fact-sheets/item/post-COVID-19-condition" },
  mental: { title: "WHO: mental health", url: "https://www.who.int/en/news-room/fact-sheets/detail/mental-health-strengthening-our-response" },
  donation: { title: "NHS Blood and Transplant: organ donation and the law", url: "https://www.organdonation.nhs.uk/organ-donation-laws/" },
  vaccination: { title: "NHS: why vaccination is important", url: "https://www.nhs.uk/vaccinations/why-vaccination-is-important-and-the-safest-way-to-protect-yourself/" },
  vaping: { title: "NHS: vaping to quit smoking", url: "https://www.nhs.uk/better-health/quit-smoking/ready-to-quit-smoking/vaping-to-quit-smoking/" },
  genomics: { title: "NHS England: the NHS Genomic Medicine Service", url: "https://www.england.nhs.uk/genomics/" },
  data: { title: "NHS England: information governance", url: "https://www.england.nhs.uk/ig/about/" },
};

type GuideInput = Omit<InterviewGuide, "tags" | "featured" | "topics" | "reviewedAt" | "sources" | "sections"> & {
  tags?: readonly string[];
  featured?: boolean;
  topics?: readonly string[];
  sources?: readonly (keyof typeof sources)[];
  understand: string;
  approach: string;
  example: string;
};

export function guideTag(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function guide(input: GuideInput): InterviewGuide {
  const { understand, approach, example, sources: sourceKeys = [], tags = [], topics = [], featured = false, ...rest } = input;
  return {
    ...rest,
    featured,
    topics,
    tags: [...new Set([input.slug, guideTag(input.category), ...input.subcategories.map(guideTag), ...topics.map(guideTag), ...tags])],
    sections: [
      { title: "Understand the topic", text: understand },
      { title: "How to discuss it in interview", text: approach },
      { title: "Put it into words", text: example },
    ],
    sources: sourceKeys.map((key) => sources[key]),
    reviewedAt: "2026-09-08",
  };
}

export const interviewGuides: readonly InterviewGuide[] = [
  guide({
    slug: "why-medicine", title: "How to answer Why Medicine?", category: "Personal & Motivation", featured: true,
    summary: "Turn your experiences into a clear, personal explanation of why you want to become a doctor.",
    subcategories: ["Motivation for Medicine"], tags: ["why-doctor", "motivation", "free-interview"], station: "why-medicine",
    understand: "This station explores whether your decision is informed and personal. Wanting to help people is a starting point; explain what attracts you to the particular combination of scientific reasoning, working with patients, teamwork and responsibility in medicine. Your interest can have developed gradually. You do not need a dramatic origin story or a prestigious placement.",
    approach: "Use three connected parts: what draws you to medicine, an experience that tested that interest, and what you learnt about being a doctor. Pick one specific moment from volunteering, caring, work experience or another honest experience. Explain what you noticed and how it changed your thinking. Acknowledge uncertainty, long training or emotional demands, then describe how you have explored whether these responsibilities suit you. Respect other healthcare careers when explaining your own preference.",
    example: "An answer might connect enjoying scientific problems with noticing how a doctor explained uncertainty to a worried patient. The reflection is the important part: understanding the science helped, but listening and involving the patient also mattered. Finish by explaining why you want to develop both skills. Replace this example with your own experience; rehearsing someone else's story will make follow-up questions harder.",
    practiceQuestion: "Which experience most strengthened or challenged your motivation for medicine, and why?",
    avoid: "Listing achievements, claiming doctors help more than other professionals, or reciting an idealised account with no recognition of the challenges.",
  }),
  guide({
    slug: "medical-school-and-course", title: "Why this medical school?", category: "Personal & Motivation", subcategories: ["Medical School & Course"],
    summary: "Connect a school's teaching and clinical opportunities to the way you learn.",
    understand: "Course design, placement arrangements and student support differ between schools. Interviewers can ask why their course fits you and whether you understand its demands. A ranking or a city's reputation says little about how you will engage with the course.",
    approach: "Check the official course page for your application year. Choose two concrete features, explain their educational value, then connect each to something you know about your learning. For a case-based curriculum, discuss preparing independently and contributing to a group. For early patient contact, consider learning communication alongside science. Name a challenge and how you would adapt.",
    example: "I enjoy explaining an idea to a small group because it reveals gaps in my understanding. The course's small-group teaching interests me, and I would prepare beforehand so that I could contribute and learn from others. Add a verified feature of the actual course before using this structure.",
    practiceQuestion: "How would you adapt if a teaching method at this university challenged your usual way of learning?",
    avoid: "Inventing course details, confusing another university's curriculum with this one, or relying entirely on prestige.",
  }),
  guide({
    slug: "work-experience-reflection", title: "Reflect on work experience", category: "Personal & Motivation", featured: true,
    subcategories: ["Work Experience & Reflection"], tags: ["volunteering", "reflection", "caring"], station: "work-experience",
    summary: "Explain what one experience taught you about people, healthcare and your own development.",
    understand: "Reflection makes an experience useful. Describe enough context for the interviewer to follow, then focus on what you noticed, what you learnt and what changed. Volunteering, caring responsibilities, paid work and school teamwork can provide meaningful examples too.",
    approach: "Use a simple sequence: situation, observation, meaning, next step. Separate what you personally did from what you observed. Consider a patient's perspective and the contribution of the wider team. Acknowledge the limits of a short placement and anonymise anyone involved. End with a behaviour you changed or something you want to learn more about.",
    example: "I noticed that a patient agreed with an explanation but still looked uncertain. The clinician invited questions and checked understanding in a different way. I learnt that agreement does not necessarily mean understanding, and I now check what someone has understood when helping peers.",
    practiceQuestion: "Tell me about something from your experience that changed your expectations of healthcare.",
    avoid: "A diary of activities, patient-identifying details, exaggerating your clinical role, or a reflection that never explains what you learnt.",
  }),
  guide({
    slug: "personal-insight-and-resilience", title: "Strengths, setbacks and resilience", category: "Personal & Motivation",
    subcategories: ["Personal Insight", "Strengths, Weaknesses & Resilience"], tags: ["stress", "failure", "wellbeing"],
    summary: "Use honest examples to show self-awareness, improvement and healthy ways of seeking support.",
    understand: "Self-awareness involves recognising both what helps you and what you need to develop. Resilience includes adapting, resting and seeking support. It does not require ignoring difficulties or claiming that you never feel stressed.",
    approach: "Name a relevant strength or development area and support it with a specific example. Describe your action, the outcome and what you would change. For a weakness, choose a real behaviour you are working on and explain evidence of progress. When discussing stress, include early warning signs, manageable priorities, supportive people and appropriate help.",
    example: "I used to agree to too many tasks and then rush them. After missing a deadline, I started checking my commitments before accepting new work and flagging problems earlier. In the next group project, this helped us redistribute tasks in time.",
    practiceQuestion: "Tell me about a setback and one change you made afterwards.",
    avoid: "Disguising perfectionism as every weakness, blaming others, or suggesting that asking for support shows you are unsuitable for medicine.",
  }),
  guide({
    slug: "communication-and-empathy", title: "Communicate with empathy", category: "Communication & Teamwork",
    subcategories: ["Communication & Empathy"], tags: ["listening", "non-verbal", "accessible-communication"], sources: ["standards"],
    summary: "Listen for the person's concern, respond to it and check that your explanation makes sense.",
    understand: "Empathy means trying to understand another person's experience without assuming you know how they feel. Communication also depends on language, disability, health literacy, culture and the environment. A clear explanation can still fail if the person feels unheard.",
    approach: "Start with an open question. Let the person finish, reflect back the concern and check your understanding. Use plain language and small pieces of information. Ask what matters to them, offer an appropriate communication adjustment and check understanding without making it feel like a test. In a clinical scenario, recognise the limits of your role.",
    example: "It sounds as though the uncertainty about the appointment is particularly worrying. Have I understood that correctly? I can explain what I know and help you find the right person for the questions I cannot answer.",
    practiceQuestion: "How would you explain an unfamiliar process to someone who feels anxious?",
    avoid: "Saying you know exactly how someone feels, using jargon, interrupting, or offering reassurance that you cannot justify.",
  }),
  guide({
    slug: "teamwork-and-leadership", title: "Teamwork and leadership", category: "Communication & Teamwork",
    subcategories: ["Teamwork", "Leadership"], station: "teamwork-group-discussion", tags: ["delegation", "inclusion"],
    summary: "Show how you helped a group work effectively, with or without a formal leadership role.",
    understand: "Effective teams share a goal, understand responsibilities and allow concerns to be raised. Leadership can mean organising a task, making space for a quieter member or recognising when somebody else has the relevant expertise.",
    approach: "Use an example with a real challenge. Describe your contribution precisely, explain how you listened and involved others, and give the outcome. Discuss how you checked progress, adapted roles or handled a disagreement. Reflect on something you would improve instead of presenting yourself as the person who rescued an incapable team.",
    example: "We disagreed about the project format, so I asked each person to explain their main concern. We compared the options against the brief, divided the work by strengths and agreed a check-in. I learnt to agree success criteria earlier.",
    practiceQuestion: "Describe a time you helped a team succeed without being its leader.",
    avoid: "Equating leadership with speaking the most, taking all the credit, or ignoring a team member's reasonable concern.",
  }),
  guide({
    slug: "conflict-and-difficult-conversations", title: "Handle conflict calmly", category: "Communication & Teamwork",
    subcategories: ["Conflict & Difficult Conversations"], tags: ["disagreement", "angry-patient"],
    summary: "Find the underlying concern and agree a constructive next step.",
    understand: "Conflict may reflect different priorities, unclear expectations or distress. Understanding a concern does not mean agreeing with harmful behaviour. Immediate safety changes what you can reasonably do.",
    approach: "Choose a private, safe setting where possible. Describe the issue without accusations, ask for the other person's perspective and listen. Identify a shared aim, discuss realistic options and agree who will do what next. If behaviour threatens safety or the problem exceeds your role, seek appropriate support promptly. Explain how you would follow up.",
    example: "I noticed we have different versions of the task deadline. Can we check the brief together and agree which work needs doing first? This keeps the conversation focused on a solvable problem.",
    practiceQuestion: "What would you do if a team member repeatedly interrupted someone else?",
    avoid: "Public confrontation, assuming bad intentions, or promising a solution that depends on someone else's authority.",
  }),
  guide({
    slug: "giving-and-receiving-feedback", title: "Give and use feedback", category: "Communication & Teamwork",
    subcategories: ["Giving & Receiving Feedback"], tags: ["improvement", "reflection"],
    summary: "Turn an observation into a specific change you can check later.",
    understand: "Useful feedback describes a behaviour and its effect. It should help someone understand what to continue or change. Receiving feedback well includes asking questions and evaluating it fairly; you do not have to pretend that criticism is always easy.",
    approach: "When giving feedback, choose an appropriate time, ask permission where sensible, give a concrete example and invite the person's view. Agree an achievable next step. When receiving it, listen, clarify the concern, reflect and make a plan. Describe how you checked whether the change improved your work.",
    example: "Your explanation covered the main points, but we lost the link between the second and third steps. Could we add a short signpost there and try it again? The focus is a changeable behaviour.",
    practiceQuestion: "What feedback was difficult to hear, and how did you respond?",
    avoid: "Personal labels, vague praise followed by vague criticism, or saying you improved without any example of what changed.",
  }),
  guide({
    slug: "healthcare-teams-and-the-doctor", title: "The doctor in a healthcare team", category: "NHS & Healthcare",
    subcategories: ["Working in Healthcare Teams", "Role of a Doctor"], tags: ["multidisciplinary-team", "mdt", "handover"], sources: ["standards"],
    summary: "Explain shared patient care, professional responsibilities and the value of different expertise.",
    understand: "Doctors assess and manage illness while working with patients and a range of healthcare professionals. Safe care depends on communication between roles and services. A profession's contribution should be described accurately and respectfully; tasks and responsibility vary by setting, competence and supervision.",
    approach: "Start with a patient's needs, then explain how different team members contribute. Include a clear handover, shared planning, checking understanding and escalation when a concern exceeds someone's competence. Explain why your interests suit medicine without ranking other professions beneath it.",
    example: "Discharge planning may involve the patient, nurses, doctors, therapists, pharmacists and community services. A treatment plan is only useful if the person can understand it, obtain medicines and access the support they need at home.",
    practiceQuestion: "What can go wrong at the boundary between hospital and community care?",
    avoid: "Claiming that the doctor always knows best or that collaboration removes individual responsibility.",
  }),
  guide({
    slug: "medical-ethics", title: "Approach an ethical MMI station", category: "Ethics & Professionalism", featured: true,
    subcategories: ["Core Medical Ethics", "Ethical & Professional Scenarios", "Situational Judgement"], tags: ["autonomy", "beneficence", "non-maleficence", "justice"], sources: ["standards"], station: "ethics-confidentiality",
    summary: "Move from the facts and affected people to a justified, proportionate next step.",
    understand: "The four familiar principles are autonomy, beneficence, non-maleficence and justice: respecting informed decisions, promoting benefit, considering harm and treating people fairly. They help organise reasoning but do not automatically produce an answer. Professional guidance, the law, context and your role also matter.",
    approach: "Clarify the facts and identify any immediate danger. Consider the patient's wishes, who else is affected and what information is missing. Compare realistic options and their consequences. State what you would do next, why it is proportionate and who you would ask for help. In situational judgement, prioritise safety, honesty and respectful escalation over protecting somebody's reputation.",
    example: "If a patient declines a recommended intervention, first explore their reasons and whether they have enough accessible information to decide. Do not assume disagreement means a lack of capacity. Explain that you would involve the responsible clinician and respect a valid decision within the applicable legal framework.",
    practiceQuestion: "A colleague asks you to conceal a mistake. How would you respond?",
    avoid: "Reciting four principles without applying them, reaching a verdict before clarifying facts, or acting beyond your competence.",
  }),
  guide({
    slug: "consent-capacity-confidentiality", title: "Consent, capacity and confidentiality", category: "Ethics & Professionalism",
    subcategories: ["Consent, Capacity & Confidentiality"], tags: ["gillick", "fraser", "mental-capacity", "refusal", "privacy"], sources: ["capacity", "standards"], station: "ethics-confidentiality",
    summary: "Keep informed choice, decision-making ability and information sharing distinct.",
    understand: "Consent must be voluntary and informed, and the person must have capacity for the decision. Capacity is specific to the decision and time; an unwise choice alone does not prove incapacity. In England and Wales, the assessment considers understanding, retaining, using or weighing relevant information and communicating a decision. Legal rules differ across UK nations and for children.",
    approach: "Support the person's understanding first, for example with an interpreter or an accessible explanation. Explore their wishes and avoid coercion. Protect confidential information, while recognising that justified disclosures may be required by law or to address serious harm. Seek senior guidance, share only what is necessary and document the reasoning. Do not promise absolute secrecy in a safeguarding situation.",
    example: "A relative asking for an update does not automatically have permission to receive one. Check the patient's wishes and involve the clinical team. If the patient cannot make the relevant decision, use the correct legal process rather than assuming that any relative can decide for them.",
    practiceQuestion: "How would you respond if an adult refused treatment that the team strongly recommended?",
    avoid: "Equating disability or disagreement with incapacity, treating a signature as the whole consent process, or applying one nation's law to every UK scenario.",
  }),
  guide({
    slug: "safeguarding-and-candour", title: "Safeguarding and duty of candour", category: "Ethics & Professionalism",
    subcategories: ["Safeguarding & Duty of Candour"], tags: ["patient-safety", "disclosure", "mistakes", "escalation"], sources: ["standards", "safety"],
    summary: "Recognise concerns, get appropriate help and respond honestly when care goes wrong.",
    understand: "Safeguarding concerns possible abuse, neglect or exploitation. Candour concerns openness when things go wrong in care. They are different responsibilities, but both require prompt action, factual communication and attention to the person affected. Students should use appropriate supervision and local procedures.",
    approach: "For a safeguarding disclosure, listen without leading questions, establish immediate safety and explain that you may need to share information with appropriate professionals. Record facts and escalate through the correct route. For an error, prioritise the patient's care, inform the responsible clinician, support an honest explanation and apology, and contribute to learning. Avoid speculating about blame before the facts are established.",
    example: "Thank you for telling me. I am concerned about your safety. I cannot promise to keep this just between us, but I would explain who needs to help and involve you as far as possible.",
    practiceQuestion: "You notice a possible medication error while on placement. What would you do?",
    avoid: "Investigating suspected abuse yourself, promising secrecy, hiding an error or treating an apology as a substitute for action.",
  }),
  guide({
    slug: "professionalism-and-boundaries", title: "Professionalism and boundaries", category: "Ethics & Professionalism",
    subcategories: ["Professionalism & Professional Boundaries"], tags: ["social-media", "honesty", "discrimination", "disability-in-medicine"], sources: ["standards"], station: "disability-in-medicine",
    summary: "Apply honesty, respect and appropriate boundaries to everyday situations.",
    understand: "Professionalism includes how you behave with patients, peers and the public, including online. Confidentiality, honesty about your role and recognising limits matter before you qualify. Fairness means considering a person's actual needs and appropriate adjustments instead of making assumptions about disability or background.",
    approach: "Identify the specific behaviour and its effect on safety, trust or dignity. Clarify uncertainty, address the issue respectfully and seek supervision where needed. For social media, consider whether anyone could be identified even without a name. For boundaries, keep the relationship focused on the person's care and use approved communication routes.",
    example: "If a friend posts a placement story that could identify a patient, I would explain the concern, ask them to remove it and seek guidance through the placement's process. I would not repost it to criticise them.",
    practiceQuestion: "How should a medical school respond to assumptions about a disabled applicant's abilities?",
    avoid: "Treating professionalism as appearance alone, ignoring discriminatory remarks, or assuming good intentions make a confidentiality breach harmless.",
  }),
  guide({
    slug: "end-of-life-and-assisted-dying", title: "End-of-life care and assisted dying", category: "Ethics & Professionalism",
    subcategories: ["End-of-Life Care & Assisted Dying"], topics: ["END-OF-LIFE CARE & ASSISTED DYING"], tags: ["palliative-care", "dnacpr", "autonomy", "assisted-dying"], sources: ["standards", "capacity"],
    summary: "Separate compassionate end-of-life care from the debate about changing the law.",
    understand: "Palliative care aims to support quality of life, symptom relief and the person's wider needs. Refusing treatment, decisions about clinically appropriate treatment and assisted dying are distinct issues. A decision about CPR does not mean stopping all care. The law and proposals on assisted dying differ by jurisdiction and can change; check official parliamentary information for the place and date being discussed.",
    approach: "Discuss autonomy and relief of suffering alongside concerns about coercion, capacity, prognosis, unequal access to support and safeguards. Include the experiences of disabled people, families and clinicians without assuming they share one view. Ask whether high-quality palliative and social care are available. Distinguish your ethical position from a claim about what the law currently permits.",
    example: "I would want a policy to protect informed choice while taking seriously the risk that someone feels like a burden. That requires more than a form: access to support, careful assessment and independent scrutiny matter. I would first confirm the jurisdiction and current legal position.",
    practiceQuestion: "What safeguards would you consider when discussing assisted dying?",
    avoid: "Saying a proposed bill is already law, equating palliative care with assisted dying, or assuming disability implies a poor quality of life.",
  }),
  guide({
    slug: "organ-donation-and-allocation", title: "Organ donation and fair allocation", category: "Ethics & Professionalism",
    subcategories: ["Organ Donation & Resource Allocation"], tags: ["transplant", "opt-out", "justice", "scarcity"], sources: ["donation"],
    summary: "Explain consent and scarcity while keeping clinical need and fairness central.",
    understand: "Donation depends on legal consent or authorisation, clinical suitability and careful conversations with families. Opt-out systems have exceptions and do not mean every person automatically becomes a donor. Rules differ between UK nations. Allocation of a scarce organ is a separate question from consent to donate it.",
    approach: "Explore autonomy, public trust and awareness when discussing donation policy. For allocation, consider urgency, likely clinical benefit, compatibility and transparent criteria. Avoid deciding a person's worth from their job, wealth or lifestyle. Explain how fair processes, specialist assessment and review can support consistent decisions.",
    example: "If two people need a transplant, I would want to understand the clinical allocation criteria rather than choose by a sympathetic story. The process should account for need and likely benefit, and should be transparent enough to maintain public trust.",
    practiceQuestion: "What are the opportunities and limitations of an opt-out donation system?",
    avoid: "Calling deemed consent compulsory donation or allocating treatment according to perceived social value.",
  }),
  guide({
    slug: "nhs-structure", title: "Understand the NHS", category: "NHS & Healthcare",
    subcategories: ["NHS Structure & Challenges"], tags: ["primary-care", "secondary-care", "social-care", "devolution"], sources: ["plan"],
    summary: "Follow a patient's journey through services and explain where coordination matters.",
    understand: "The UK has four health systems, with different structures and policies. Primary care is often a first point of contact; hospital, specialist, community and mental health services meet other needs. Social care supports daily living and has different arrangements from NHS healthcare. Long-term illness often requires coordination across several services.",
    approach: "Use a patient journey to make the structure concrete. Describe the role of prevention, access, referrals, treatment and follow-up, then consider what happens when information or support is missing. Name the UK nation you mean when discussing organisational changes. Verify current responsibilities on official pages instead of memorising an outdated diagram.",
    example: "An older person recovering after hospital treatment may need medicines review, rehabilitation and support at home. If those services cannot coordinate, discharge may be delayed or the person may return to hospital unnecessarily.",
    practiceQuestion: "Why can pressures in social care affect hospital waiting times?",
    avoid: "Using England and the UK interchangeably or treating every healthcare problem as a hospital problem.",
  }),
  guide({
    slug: "health-inequalities", title: "Health inequalities and equitable care", category: "NHS & Healthcare",
    subcategories: ["Health Inequalities"], topics: ["HEALTH INEQUALITIES"], tags: ["equity", "social-determinants", "deprivation", "access"], station: "equality-diversity-inclusion", sources: ["mental"],
    summary: "Explain why people experience different health outcomes and what services can change.",
    understand: "Health inequalities are differences in health or access between groups. Housing, income, education, work, discrimination and the environment can influence risk and the ability to obtain care. Equality provides the same offer; equity considers different needs and barriers so that people have a fair opportunity to benefit.",
    approach: "Identify a specific barrier and its consequences, then propose an action at patient, service and policy level. Consider accessible information, interpreters, transport, appointment flexibility and community involvement. Ask how success would be measured across groups, since an improving average can hide widening gaps.",
    example: "An online booking system may help many people but make access harder for someone without internet access or digital skills. Keeping a workable telephone or in-person route and testing the service with affected patients could reduce that barrier.",
    practiceQuestion: "When might treating every patient in exactly the same way be unfair?",
    avoid: "Blaming individuals for circumstances, stereotyping a community or claiming one intervention will remove every inequality.",
  }),
  guide({
    slug: "public-health-and-screening", title: "Public health, prevention and screening", category: "NHS & Healthcare",
    subcategories: ["Public Health", "Public Health Debates"], tags: ["screening", "prevention", "population-health", "false-positive"],
    summary: "Weigh population benefits against harms, access barriers and unintended effects.",
    understand: "Public health aims to improve health across populations. Prevention can reduce risk before illness develops; screening offers tests to people who may have no symptoms. A screening programme needs evidence that its overall benefits outweigh harms such as false results, overdiagnosis and unnecessary interventions.",
    approach: "Define the problem and the target population. Discuss expected benefit, possible harms, cost and who might miss out. Consider informed choice and how clearly risks are communicated. Explain how you would evaluate a policy using outcomes as well as uptake, and compare it with realistic alternatives.",
    example: "A campaign can raise awareness without changing outcomes if appointments remain hard to access. I would combine communication with accessible services and assess whether the people at greatest risk are benefiting.",
    practiceQuestion: "Why might more screening not always lead to better health?",
    avoid: "Assuming every early diagnosis helps, treating uptake as the only measure of success, or ignoring people who cannot access the intervention.",
  }),
  guide({
    slug: "nhs-funding-and-priorities", title: "Healthcare funding and priorities", category: "NHS & Healthcare",
    subcategories: ["Healthcare Policy & Funding", "Healthcare Resources & Priorities"], tags: ["opportunity-cost", "cost-effectiveness", "qaly"], sources: ["plan"],
    summary: "Discuss limited resources without reducing people to a price tag.",
    understand: "Healthcare resources include staff time, beds, facilities and funding. Spending on one service has an opportunity cost because those resources cannot simultaneously be used elsewhere. Cost-effectiveness examines outcomes in relation to cost; it is one consideration alongside fairness, severity of need and uncertainty.",
    approach: "Compare a proposal with its realistic alternative. Ask who benefits, how large and certain the benefit is, what implementation requires and whether access will be fair. Include prevention and community capacity where relevant. Explain a transparent decision process and how outcomes would be reviewed.",
    example: "Extending clinic hours might improve access, but it needs sufficient staff and diagnostic support. I would compare its effect on waiting time, quality and staff wellbeing with other ways to use the same resources.",
    practiceQuestion: "How should a health service decide whether to fund an expensive new treatment?",
    avoid: "Treating the cheapest option as automatically best or suggesting a single funding increase resolves every operational problem.",
  }),
  guide({
    slug: "nhs-waiting-lists", title: "NHS waiting lists and access", category: "Hot Topics & Current Affairs",
    subcategories: ["Current NHS Issues"], topics: ["NHS WAITING LISTS & ACCESS TO CARE"], station: "nhs-waiting-lists", tags: ["waiting-times", "elective-care", "backlog"], sources: ["plan"],
    summary: "Connect delays to patients' lives, service capacity and fair prioritisation.",
    understand: "Waiting for assessment or treatment can affect symptoms, mental wellbeing, work and caring responsibilities. Capacity depends on the whole pathway, including diagnostics, staff, theatre time, beds and discharge support. Waiting-list statistics may count pathways rather than unique people; always check the definition and date.",
    approach: "Discuss clinical urgency, deterioration while waiting and transparent prioritisation. Consider diagnostic capacity, prevention, community services and communication with patients. For each proposal, ask about staffing, quality and unequal access. Use a dated official figure only if you can explain what it measures.",
    example: "Adding operating sessions could help, but only if assessment, recovery and follow-up capacity can support them. I would also ask how patients are monitored while waiting and how someone can report worsening symptoms.",
    practiceQuestion: "How can a service reduce waits while protecting patient safety and fairness?",
    avoid: "Giving an undated headline number or assuming all patients should be prioritised solely by time already waited.",
  }),
  guide({
    slug: "nhs-ten-year-plan", title: "The 10 Year Health Plan: discussing reform", category: "Hot Topics & Current Affairs",
    subcategories: ["Current NHS Issues", "Healthcare Policy & Funding"], tags: ["nhs-reform", "hospital-to-community", "analogue-to-digital", "sickness-to-prevention"], sources: ["plan"],
    summary: "Understand the direction of England's 2025 plan and evaluate what delivery would require.",
    understand: "The 2025 10 Year Health Plan for England describes three shifts: more care in communities, greater use of digital approaches, and a stronger focus on prevention. These are policy ambitions. A published plan is not evidence that every promised service or organisational change has already happened.",
    approach: "Choose one shift and explain the patient problem it aims to address. Consider staffing, funding, infrastructure, accessibility and how services join up. Discuss a possible benefit and a realistic risk, then identify an outcome you would measure. Check official updates before discussing implementation milestones.",
    example: "More community care could reduce travel and support earlier intervention. It needs the workforce and diagnostics to deliver safe care locally, with a clear route to hospital when necessary. I would look at outcomes and patient experience as well as hospital activity.",
    practiceQuestion: "What would make a shift from hospital to community care successful?",
    avoid: "Describing ambitions as completed changes or assuming England's plan applies unchanged across the UK.",
  }),
  guide({
    slug: "ai-in-healthcare", title: "Artificial intelligence in healthcare", category: "Hot Topics & Current Affairs",
    subcategories: ["Technology, AI & Digital Health"], topics: ["ARTIFICIAL INTELLIGENCE IN HEALTHCARE"], tags: ["ai", "bias", "automation", "accountability"], sources: ["ai"],
    summary: "Evaluate a specific use of AI through evidence, safety, fairness and accountability.",
    understand: "AI can support tasks such as analysing images or organising information. Performance depends on the task, data and setting; success in a study does not guarantee safe use in another population. Outputs may be inaccurate, biased or difficult to explain, and automation can change how people check decisions.",
    approach: "Choose a concrete application rather than discussing AI as one technology. Compare it with current practice and ask about validation, patient outcomes, data protection and performance across groups. Explain who remains responsible, how staff can challenge an output and how problems will be monitored after deployment.",
    example: "An imaging tool could help identify cases needing attention sooner. Before introducing it, I would want evidence in the local population, a clear process for human review and a way to detect missed cases or unequal performance.",
    practiceQuestion: "What would you need to know before trusting an AI system to support diagnosis?",
    avoid: "Assuming a high accuracy percentage proves clinical benefit or that a clinician can transfer responsibility to software.",
  }),
  guide({
    slug: "weight-loss-medicines", title: "Weight-loss medicines: evidence and access", category: "Hot Topics & Current Affairs",
    subcategories: ["New Treatments & Innovation"], topics: ["WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES"], tags: ["ozempic", "semaglutide", "tirzepatide", "glp-1", "gip", "obesity"], station: "ozempic", sources: ["medicines"],
    summary: "Discuss new medicines without confusing products, indications or fair access.",
    understand: "Medicines acting on GLP-1 pathways, and medicines with combined GIP/GLP-1 action, have raised questions about obesity treatment and health-service capacity. Products are not interchangeable: licences, evidence and NHS eligibility differ. NICE's tirzepatide guidance includes implementation arrangements, so eligibility in guidance does not mean immediate access for everyone.",
    approach: "Discuss potential health benefits alongside adverse effects, long-term evidence, treatment support and affordability. Explore how prioritisation can be fair and how stigma may deter people from care. Check current official guidance before stating an indication, eligibility threshold or availability. Keep a population-level discussion separate from advice for an individual patient.",
    example: "I would assess outcomes that matter to patients, not just weight change. An equitable service would need clear eligibility, support and follow-up, while recognising that people face different barriers to obtaining care.",
    practiceQuestion: "How should the NHS balance demand, evidence and fair access to weight-management medicines?",
    avoid: "Calling a medicine suitable for everyone, treating obesity as a moral failing, or assuming every brand has the same indication.",
  }),
  guide({
    slug: "new-treatments-and-innovation", title: "Evaluate a new treatment", category: "Hot Topics & Current Affairs",
    subcategories: ["New Treatments & Innovation"], tags: ["innovation", "clinical-trials", "benefit-harm", "access"],
    summary: "Ask whether an innovation produces meaningful benefit and can be delivered fairly.",
    understand: "A promising mechanism or early study is a reason to investigate a treatment. It does not establish that it improves patients' lives. Licensing, guideline recommendations, funding decisions and local delivery answer different questions and should not be treated as interchangeable.",
    approach: "Identify the patient group, comparator and outcome. Examine benefit size, harms, study quality and follow-up. Then consider training, monitoring, cost and equitable access. Explain what evidence would change your view. Do not turn an interview answer about research into a treatment recommendation for a person.",
    example: "A treatment may improve a laboratory marker without demonstrating better survival or quality of life. I would ask whether the marker is a reliable substitute and whether longer follow-up reveals benefits or harms that the initial trial missed.",
    practiceQuestion: "What questions would you ask about a headline claiming a new treatment is a breakthrough?",
    avoid: "Treating approval as proof that a treatment is best for everyone or ignoring the alternative treatment used in the study.",
  }),
  guide({
    slug: "professional-roles-and-workforce", title: "Changing professional roles and workforce pressures", category: "Hot Topics & Current Affairs",
    subcategories: ["Workforce Issues"], topics: ["PHYSICIAN ASSOCIATES, ANAESTHESIA ASSOCIATES & CHANGING PROFESSIONAL ROLES"], tags: ["physician-associate", "anaesthesia-associate", "leng-review", "supervision", "resident-doctors", "retention"], sources: ["roles"],
    summary: "Discuss staffing and new roles through patient understanding, competence and safe supervision.",
    understand: "Workforce debates include retention, workload, training opportunities and how different roles contribute to care. The 2025 Leng review examined physician associate and anaesthesia associate roles and made recommendations on their future use. A review recommendation and an implemented policy are different; current titles, scope and local arrangements need checking.",
    approach: "Put patient safety and clear role identification first. Ask about training, scope, supervision, escalation and evidence of outcomes. Discuss possible service benefits alongside demands on supervisors and effects on training. Treat colleagues respectfully and examine the actual task instead of assuming everyone in one profession has identical competence.",
    example: "Patients should understand who is assessing them and how to reach the clinician responsible for their care. A staffing model needs evidence, appropriate supervision and enough capacity for both service delivery and training.",
    practiceQuestion: "What should a hospital consider before introducing a new professional role?",
    avoid: "Hostile generalisations about a profession, equating different training routes or claiming every recommendation is already policy.",
  }),
  guide({
    slug: "bawa-garba-case", title: "The Bawa-Garba case", category: "Hot Topics & Current Affairs", featured: true,
    subcategories: ["Ethics in the News"], topics: ["BAWA-GARBA CASE"], tags: ["bawa-garba", "bawa", "garba", "jack-adcock", "patient-safety", "just-culture", "gross-negligence-manslaughter", "reflection"], sources: ["bawa", "safety"],
    summary: "Understand the case and discuss accountability, system pressures and learning from harm.",
    understand: "Jack Adcock died from sepsis at Leicester Royal Infirmary in 2011. Dr Hadiza Bawa-Garba was convicted of gross negligence manslaughter. The professional-regulation case then followed a separate path: a tribunal imposed suspension in 2017; a court substituted erasure in January 2018; the Court of Appeal restored the tribunal's suspension in August 2018. That appeal concerned the regulatory sanction. It did not overturn the criminal conviction.",
    approach: "Begin with the child and family's loss. Discuss individual responsibility alongside system factors considered in the case, including staffing, IT and handover problems. Explain why understanding those factors matters for prevention without saying they remove accountability. Consider public trust, fair regulatory decisions and clinicians' willingness to raise concerns. Link the discussion to a learning culture: investigate how harm happened, involve patients and families, and make practical improvements that are checked afterwards.",
    example: "This case makes me consider how a service can hold professionals accountable while learning about the conditions in which care is delivered. I would focus on reliable escalation, supervision and handover, and on whether changes reduce the risk of another family experiencing harm. That is a discussion framework, not a verdict on evidence I have not personally reviewed.",
    practiceQuestion: "What can the Bawa-Garba case teach us about patient safety and accountability?",
    avoid: "Saying she was acquitted in 2018, reducing the case to a single mistake, claiming system pressures excuse all harm, or asserting that reflective notes caused the conviction.",
  }),
  guide({
    slug: "pandemics-and-long-covid", title: "Pandemic preparedness and long COVID", category: "Hot Topics & Current Affairs",
    subcategories: ["Public Health Debates"], topics: ["COVID-19, LONG COVID & PANDEMIC PREPAREDNESS"], tags: ["pandemic", "long-covid", "covid-19", "preparedness"], sources: ["covid"],
    summary: "Consider long-term illness as well as emergency response and public trust.",
    understand: "A pandemic affects acute care, routine services, education, work and inequality. Some people experience persistent or new symptoms after COVID-19, which can affect daily functioning. Uncertainty about mechanisms or treatment does not make a person's symptoms unimportant.",
    approach: "Discuss preparedness through surveillance, clear communication, workforce resilience, supplies and continuity of essential care. Explain how policies should respond to emerging evidence and unintended harms. For long COVID, consider access to assessment, rehabilitation, work support and research, while avoiding claims that one intervention helps everyone.",
    example: "A future response should explain what is known, what remains uncertain and why advice changes. I would also consider people whose ongoing care is disrupted and how support reaches those least able to isolate or work remotely.",
    practiceQuestion: "Which lessons from COVID-19 would you prioritise for the next pandemic?",
    avoid: "Judging decisions only with hindsight, presenting old prevalence estimates as current, or dismissing persistent symptoms because evidence is incomplete.",
  }),
  guide({
    slug: "mental-health", title: "Mental health and access to care", category: "Hot Topics & Current Affairs",
    subcategories: ["Public Health Debates"], topics: ["MENTAL HEALTH"], tags: ["mental-health", "stigma", "parity-of-esteem", "wellbeing"], sources: ["mental"],
    summary: "Discuss mental health with the same attention to dignity, access and evidence as physical health.",
    understand: "Mental health is influenced by individual, social and structural factors. Difficulties can affect education, relationships, work and physical health. Stigma and access barriers may prevent people seeking help, while poverty or insecure housing can make recovery harder.",
    approach: "Consider timely assessment, continuity of support, prevention and links with physical healthcare. Discuss the person's preferences and context rather than reducing them to a diagnosis. For policy, ask whether services reach different age groups and communities fairly. In a scenario involving immediate risk, describe getting appropriate urgent professional help within your role.",
    example: "Reducing waiting times matters, but so does helping someone find a service they can use and trust. I would consider language, cost of travel, continuity and whether support fits around school, work or caring responsibilities.",
    practiceQuestion: "What could a health service do to reduce barriers to mental healthcare?",
    avoid: "Diagnosing a person from a short scenario, implying mental illness means incapacity or presenting resilience as a substitute for accessible care.",
  }),
  guide({
    slug: "genomics-and-personalised-medicine", title: "Genomics and personalised medicine", category: "Hot Topics & Current Affairs",
    subcategories: ["New Treatments & Innovation"], topics: ["GENOMICS & PERSONALISED MEDICINE"], tags: ["genetics", "genomics", "incidental-findings", "personalised-medicine"], sources: ["genomics"],
    summary: "Explore more targeted care alongside uncertainty, family implications and fair access.",
    understand: "Genomic information can help explain some conditions and inform treatment choices. A genetic result may have uncertain significance, and risk is not always destiny. Results can also raise questions for relatives, creating consent and confidentiality considerations beyond the person tested.",
    approach: "Ask what the test can reliably tell us and how it would change care. Discuss informed consent, counselling, unexpected findings, data protection and access to follow-up. Consider whether evidence represents diverse populations and whether services can support people who receive uncertain results.",
    example: "Before offering a genomic test, I would want the person to understand possible useful findings, uncertain findings and information they may not have expected. Specialist support can help them decide what information they want and how to discuss relevant findings with relatives.",
    practiceQuestion: "What ethical questions can arise when a genetic result also matters to a patient's family?",
    avoid: "Treating every variant as a diagnosis, assuming a result predicts the future with certainty or ignoring the person's preferences about information.",
  }),
  guide({
    slug: "antimicrobial-resistance", title: "Antimicrobial resistance", category: "Hot Topics & Current Affairs",
    subcategories: ["Public Health Debates"], topics: ["ANTIMICROBIAL RESISTANCE"], tags: ["amr", "antibiotics", "stewardship", "one-health"], sources: ["amr"],
    summary: "Explain why resistance threatens care and why prevention needs a coordinated response.",
    understand: "Antimicrobial resistance occurs when microbes no longer respond effectively to medicines. The microbes become resistant, rather than a person's body becoming resistant. Misuse and overuse accelerate the problem, alongside infection spread and inadequate access to diagnostics, sanitation and effective treatment.",
    approach: "Connect the issue to infections, surgery and care that depends on effective antimicrobials. Discuss appropriate prescribing, diagnostics, vaccination, infection prevention, surveillance and research. A One Health perspective considers people, animals and the environment. Balance avoiding unnecessary treatment with ensuring people who need medicines can access them.",
    example: "A useful response combines clear explanations about when antibiotics help with practical support for appropriate prescribing and infection prevention. Simply telling patients to demand fewer antibiotics misses the wider system and access issues.",
    practiceQuestion: "Why does antimicrobial resistance require action beyond individual doctors?",
    avoid: "Saying antibiotics treat viral infections or framing patients as the sole cause of resistance.",
  }),
  guide({
    slug: "vaccination-and-misinformation", title: "Vaccination, measles and misinformation", category: "Hot Topics & Current Affairs",
    subcategories: ["Public Health Debates"], topics: ["VACCINATION, MEASLES & HEALTH MISINFORMATION"], tags: ["vaccines", "measles", "mmr", "misinformation", "vaccine-hesitancy"], sources: ["vaccination"],
    summary: "Respond to concerns respectfully while explaining evidence and community protection.",
    understand: "Vaccination reduces the risk of vaccine-preventable illness and can help protect people who are particularly vulnerable. Decisions may be influenced by trust, access, past experiences and information. Lower uptake is not automatically evidence that everyone involved rejects vaccination.",
    approach: "Ask what specifically worries the person, listen and acknowledge the concern without endorsing false information. Explain relevant benefits and risks in clear terms using reliable sources. Address practical barriers and give space for questions. When discussing measles or an outbreak, check current official guidance and avoid repeating an old schedule as if it were current.",
    example: "I would ask which claim they have seen and what worries them most. Then I would look at the evidence with them and explain what it can and cannot show, while checking whether booking or attending an appointment is also difficult.",
    practiceQuestion: "How would you approach a conversation with someone who is unsure about vaccination?",
    avoid: "Ridiculing concerns, saying an intervention has zero risk or assuming more facts alone will resolve a lack of trust.",
  }),
  guide({
    slug: "vaping-smoking-and-public-health", title: "Vaping, smoking and public health", category: "Hot Topics & Current Affairs",
    subcategories: ["Public Health Debates"], topics: ["VAPING, SMOKING & PUBLIC HEALTH"], tags: ["vaping", "smoking", "tobacco", "harm-reduction", "nicotine"], sources: ["vaping"],
    summary: "Keep smoking cessation and preventing youth nicotine use in the same discussion.",
    understand: "Smoking causes substantial harm. NHS guidance describes nicotine vaping as less harmful than smoking and a possible aid for adults quitting cigarettes, while emphasising that vaping is not risk-free and is not for children or non-smokers. Those distinctions matter when evaluating public-health policy.",
    approach: "Identify the population and policy aim. Consider support for adults to stop smoking alongside reducing youth uptake, marketing exposure and environmental harm. Discuss enforcement, unintended consequences and access to cessation support. Check the current law before making claims about sales restrictions or proposed legislation.",
    example: "A policy should make it easier for adults to stop smoking without normalising nicotine use among young people. I would assess both smoking cessation outcomes and youth uptake, because success on one measure may hide problems on another.",
    practiceQuestion: "How can public-health policy balance harm reduction with preventing youth vaping?",
    avoid: "Calling vaping harmless, treating it as equally harmful as smoking without evidence or confusing a legislative proposal with current law.",
  }),
  guide({
    slug: "climate-change-and-health", title: "Climate change and health", category: "Hot Topics & Current Affairs",
    subcategories: ["Public Health Debates"], topics: ["CLIMATE CHANGE & HEALTH"], tags: ["climate", "sustainability", "heat", "air-pollution", "net-zero"], sources: ["climate"],
    summary: "Connect environmental change to patient health, service resilience and inequality.",
    understand: "Climate change affects health through hazards such as extreme heat and flooding, and through effects on food, water, infections and livelihoods. Exposure and the ability to adapt are unequal. Health services also need to remain functional during extreme events.",
    approach: "Give a concrete health pathway, identify who may be most affected and discuss prevention or adaptation. Consider resilient buildings, heat plans, transport and procurement, with patient safety central. Distinguish reducing emissions from adapting to risks already present, and consider health benefits such as cleaner air.",
    example: "A heat plan might consider people living alone, unsuitable housing and reliable ways to reach support. Hospitals also need infrastructure and staffing plans that keep essential services safe during extreme weather.",
    practiceQuestion: "Why should climate change be part of a discussion about health inequalities?",
    avoid: "Discussing only recycling, ignoring adaptation or suggesting environmental goals justify unsafe patient care.",
  }),
  guide({
    slug: "digital-health-and-patient-data", title: "Digital health and patient data", category: "Hot Topics & Current Affairs",
    subcategories: ["Technology, AI & Digital Health"], topics: ["DIGITAL HEALTH & PATIENT DATA"], tags: ["data-protection", "digital-exclusion", "records", "cybersecurity", "telemedicine"], sources: ["data", "ai"],
    summary: "Weigh better access and information sharing against privacy, security and exclusion.",
    understand: "Digital records and remote services can support continuity and convenience. They also raise questions about appropriate access, data quality, security and whether everyone can use the service. Information used for direct care and information used for other purposes can require different governance arrangements.",
    approach: "Define the use case and the data genuinely needed. Discuss understandable information for patients, approved access controls, a lawful basis and oversight. Consider alternatives for people without devices, connectivity, privacy at home or digital skills. Ask what happens during an outage and how incorrect records are corrected.",
    example: "A remote consultation may save travel but be unsuitable if the patient cannot speak privately or needs examination. A good service gives people an appropriate route to in-person care and explains how their information is handled.",
    practiceQuestion: "How would you evaluate a plan to make all appointment booking digital?",
    avoid: "Assuming digital means accessible or treating anonymisation and pseudonymisation as the same thing.",
  }),
  guide({
    slug: "data-and-graphs", title: "Interpret data and graphs", category: "Data, Research & Critical Thinking",
    subcategories: ["Data Interpretation", "Graphs & Trends", "Data Stations"], tags: ["absolute-risk", "relative-risk", "percentage-points", "graphs"], station: "data-analysis",
    summary: "Describe what the numbers show before explaining what they might mean.",
    understand: "Start by identifying the population, units, axes, time period and source. A difference between groups or a trend over time does not by itself establish a cause. Small samples, missing data and changed definitions can alter interpretation.",
    approach: "State the main pattern, support it with a relevant number and identify an exception or uncertainty. Distinguish absolute from relative changes and check the denominator. Suggest what further information would help before making a recommendation. Use plain language so that someone can follow without seeing the chart.",
    example: "A fall from 20 missed appointments per 100 to 15 per 100 is a reduction of 5 percentage points, or 25% relative to the starting rate. It does not prove the reminder system caused the change; I would ask about other changes and a comparison group.",
    practiceQuestion: "A risk falls from 2 in 100 to 1 in 100. Explain the change in two different ways.",
    avoid: "Confusing percentages with percentage points, ignoring a truncated axis or giving more precision than the data justify.",
  }),
  guide({
    slug: "research-and-critical-appraisal", title: "Research, evidence and critical appraisal", category: "Data, Research & Critical Thinking",
    subcategories: ["Research & Evidence", "Critical Appraisal", "Article Analysis"], tags: ["randomised-trial", "bias", "confounding", "systematic-review", "evidence"], station: "data-analysis",
    summary: "Assess the question, study design and outcomes before accepting a headline claim.",
    understand: "A study's design should fit its question. Randomisation can reduce confounding, blinding can reduce some biases, and a comparison group helps interpret an intervention's effects. Each design still has limitations. A systematic review depends on the quality and relevance of the studies it includes.",
    approach: "Summarise the population, intervention or exposure, comparator and outcome. Consider recruitment, sample size, missing data, follow-up, conflicts of interest and whether the findings apply to the patients being discussed. Separate statistical uncertainty from clinical importance. For an article, trace its headline back to what the research actually measured.",
    example: "A study in a narrow age group may not tell us enough about older patients with multiple conditions. Even a statistically significant result needs interpretation: how large is the benefit, what are the harms, and does it matter to patients?",
    practiceQuestion: "What would make you cautious about applying a trial result to every patient?",
    avoid: "Dismissing an entire study because of one limitation or assuming publication makes a conclusion certain.",
  }),
  guide({
    slug: "critical-thinking", title: "Think through uncertainty", category: "Data, Research & Critical Thinking",
    subcategories: ["Critical Thinking"], tags: ["assumptions", "reasoning", "uncertainty", "causation"],
    summary: "Make your assumptions visible and show how new evidence could change your answer.",
    understand: "Critical thinking means checking the link between a claim and its evidence. A plausible explanation may still be wrong, and two things occurring together does not show which caused which. Interviewers can learn from how you handle missing information.",
    approach: "Restate the problem and separate known facts from assumptions. Generate more than one explanation, consider what evidence would distinguish them and choose a reasonable next step. If asked to estimate, state a sensible assumption and work through it clearly. Revise calmly when new information appears.",
    example: "If attendance improved after a policy change, the policy is one possible explanation. I would also consider seasonal variation, a changed patient group or another service improvement before drawing a causal conclusion.",
    practiceQuestion: "What information would make you change your mind about a healthcare policy you currently support?",
    avoid: "Treating confidence as evidence, inventing a fact to fill a gap or refusing to adjust an answer when the scenario changes.",
  }),
  guide({
    slug: "role-play-and-communication-tasks", title: "Role play and communication tasks", category: "Practical MMI & Role Play",
    subcategories: ["Role Play", "Communication Tasks"], tags: ["actor", "instructions", "empathy", "difficult-news"],
    summary: "Have a natural conversation that responds to what the other person actually says.",
    understand: "A role-play station tests interaction as well as the content of your response. The other person's concerns may emerge gradually. Your brief defines your role; as a student or volunteer you should not diagnose, promise treatment or claim authority you do not have.",
    approach: "Introduce yourself appropriately, ask an open question and allow a response. Acknowledge emotion, explore the concern and explain what you can do. Check understanding and agree a realistic next step. For an instruction task, break the process into manageable stages and ask for feedback rather than delivering every step at once.",
    example: "I can see this has been frustrating. Could you tell me what happened from your perspective? After listening, summarise the concern and offer the next action that your role permits.",
    practiceQuestion: "Help a worried peer who thinks a recent setback means they cannot succeed.",
    avoid: "Talking at the actor, rehearsed empathy with no follow-through, touching without invitation or making unsupported promises.",
  }),
  guide({
    slug: "group-discussions-and-tasks", title: "Group discussions and tasks", category: "Practical MMI & Role Play",
    subcategories: ["Group Discussion", "Group Tasks"], tags: ["group-mmi", "teamwork", "consensus", "time-management"], station: "teamwork-group-discussion",
    summary: "Help the group make progress while creating room for other people to contribute.",
    understand: "A group station can assess listening, collaboration and reasoning as well as the final answer. Contribution is broader than airtime. Clarifying the task, connecting ideas and noticing an overlooked concern can all improve the team's work.",
    approach: "Agree the aim and time available. Offer a concise idea with a reason, invite other views and build on what people say. If disagreement persists, compare options against agreed criteria. Summarise progress and check whether quieter members want to add anything without putting them under pressure.",
    example: "We seem to agree on the first priority but have two options for the second. Could we compare them against patient benefit and feasibility, then leave a minute to check our conclusion?",
    practiceQuestion: "How would you help a group reach a decision when time is running out?",
    avoid: "Dominating, assigning yourself authority immediately, ignoring the task or performing inclusion without listening to the response.",
  }),
  guide({
    slug: "prioritisation-stations", title: "Prioritisation stations", category: "Practical MMI & Role Play",
    subcategories: ["Prioritisation Stations"], tags: ["urgency", "risk", "delegation", "mmi-timing"],
    summary: "Order competing tasks by risk, urgency and what you can realistically do.",
    understand: "A prioritisation task usually contains incomplete information and competing demands. A defensible order depends on immediate risk, time sensitivity, consequences of delay and available help. The first task listed or the loudest request is not automatically the most urgent.",
    approach: "Identify any immediate safety concern, clarify deadlines and state assumptions. Explain your first action and why it cannot wait. Consider delegation to someone with the right role and competence. Communicate delays, check that responsibility has been accepted and reassess as new information arrives.",
    example: "I would address the immediate safety concern first and ask an appropriate colleague to handle the routine task. I would explain the delay to the person waiting and check back rather than assume delegation means the task is complete.",
    practiceQuestion: "How would you prioritise several requests when one may involve immediate harm?",
    avoid: "Giving an unexplained ranking, trying to do everything alone or delegating beyond somebody's competence.",
  }),
  guide({
    slug: "quick-fire-and-unexpected-questions", title: "Quick-fire and unexpected questions", category: "Curveballs & Quick-Fire",
    subcategories: ["Personal Quick-Fire", "Unexpected Questions"], tags: ["curveball", "pause", "answer-structure", "interview-technique"],
    summary: "Take a moment, answer the question directly and explain one useful reason.",
    understand: "An unexpected question can reveal how you organise your thoughts and respond to uncertainty. You do not need a spectacular answer. A brief, honest response with a clear reason is often easier to discuss than an elaborate story.",
    approach: "Pause to understand the question. Give your answer, explain why and add one concrete example if useful. Ask for clarification if an important term is ambiguous. If you do not know a factual answer, say so and explain how you would find out. Leave room for a follow-up instead of filling every silence.",
    example: "If asked what you would change about your school, select one real issue, explain who it affects and propose a feasible improvement. Mention what you would need to check before acting.",
    practiceQuestion: "What is one belief you have reconsidered, and what changed your view?",
    avoid: "Inventing facts, treating a natural pause as failure or forcing every answer back to an unrelated achievement.",
  }),
  guide({
    slug: "creative-hypothetical-and-opinion-questions", title: "Creative questions, hypotheticals and opinions", category: "Curveballs & Quick-Fire",
    subcategories: ["Creative Questions", "Hypotheticals", "Opinion Questions"], tags: ["creativity", "hypothetical", "opinion", "balanced-answer"],
    summary: "State a position, explain your assumptions and consider a reasonable alternative.",
    understand: "Open questions may have several defensible answers. The interviewer can assess the quality of your reasoning, your ability to consider others and how you respond to a challenge. A personal opinion is more useful when you explain its basis and limits.",
    approach: "Define any ambiguous terms and state a working assumption. Give a clear answer with one or two reasons. Consider a meaningful objection, then explain whether it changes your position. For a creative question, choose an understandable idea and connect it to the actual task rather than guessing a secret preferred answer.",
    example: "If asked to design a new public-health campaign, first identify a specific audience and barrier. Explain how your idea addresses that barrier, how you would involve the audience and what outcome you would measure.",
    practiceQuestion: "If you could introduce one change to improve your community's health, what would it be?",
    avoid: "Assuming there is only one acceptable opinion or adding so many qualifications that you never answer the question.",
  }),
];

export const interviewGuideCategories = [...new Set(interviewGuides.map((item) => item.category))];

export function findInterviewGuide(slug: string) {
  return interviewGuides.find((item) => item.slug === slug);
}

export function searchInterviewGuides(query: string, category = "All topics") {
  const terms = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  return interviewGuides.filter((item) => {
    if (category !== "All topics" && item.category !== category) return false;
    const searchable = [item.title, item.summary, ...item.tags, ...item.subcategories, ...item.topics, ...item.sections.map((section) => section.text)].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, " ");
    return terms.every((term) => searchable.includes(term));
  });
}

// Ready for contextual question links: exact topic matches outrank subcategory/tag matches.
export function guidesForInterviewQuestion(question: Pick<InterviewQuestion, "subcategory" | "sourceTopic" | "tags">) {
  return interviewGuides.map((item) => ({
    guide: item,
    relevance: (question.sourceTopic && item.topics.includes(question.sourceTopic) ? 100 : 0)
      + (item.subcategories.includes(question.subcategory) ? 10 : 0)
      + question.tags.filter((tag) => item.tags.includes(tag)).length,
  })).filter((item) => item.relevance >= 10).sort((a, b) => b.relevance - a.relevance).map((item) => item.guide);
}
