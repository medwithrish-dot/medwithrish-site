import type {
  UCATOptionKey,
  UCATQuestion,
  UCATQuestionTag,
  UCATSjtIssueTag,
} from "./ucatQuestionBank";

export type SjtCuratedInput =
  | {
      kind: "single";
      subtype: "sjt-appropriateness" | "sjt-importance";
      issueTags: UCATSjtIssueTag[];
      tags?: UCATQuestionTag[];
      stimulus: string[];
      question: string;
      answer: UCATOptionKey;
      explanation: string;
    }
  | {
      kind: "set";
      setId: string;
      issueTags: UCATSjtIssueTag[];
      tags?: UCATQuestionTag[];
      stimulus: string[];
      questions: Array<{
        subtype: "sjt-appropriateness" | "sjt-importance";
        question: string;
        answer: UCATOptionKey;
        explanation: string;
      }>;
    };

export const USER_CURATED_SJT_INPUTS: SjtCuratedInput[] = [
  // ===== PASTE NEW SJT QUESTIONS BELOW THIS LINE =====

  // Each object is either:
  //   kind: "single"  — one standalone SJT question
  //   kind: "set"     — 3-5 questions sharing one scenario (recommended)
  //
  // answer uses the UCAT SJT rubric:
  //   sjt-appropriateness: A=very appropriate, B=appropriate not ideal,
  //                        C=inappropriate not awful, D=very inappropriate
  //   sjt-importance:      A=very important, B=important,
  //                        C=minor importance, D=not important at all
  //
  // issueTags picks from: "autonomy" | "beneficence" | "candour" |
  //   "capacity-consent" | "communication" | "confidentiality" | "escalation" |
  //   "integrity" | "justice" | "non-maleficence" | "patient-safety" |
  //   "professional-boundaries" | "respect-dignity" | "scope-of-practice" | "teamwork"

  // ----- Set 1: A&E — medication allergy near-miss -----
  {
    kind: "set",
    setId: "ae-allergy-near-miss",
    issueTags: ["patient-safety", "escalation"],
    stimulus: [
      "You are a 4th-year medical student on an A&E placement. During a busy afternoon shift you observe a senior nurse preparing to administer IV co-amoxiclav to a 67-year-old patient. You recall from the triage notes that this patient reported a penicillin allergy, but the nurse has not paused to check the allergy wristband and is drawing up the medication.",
    ],
    questions: [
      {
        subtype: "sjt-appropriateness",
        question:
          "Calmly but immediately interrupt the nurse, state that you noticed a penicillin allergy in the triage notes, and ask her to check the allergy wristband before proceeding.",
        answer: "A",
        explanation:
          "Stopping a potential allergic reaction before it occurs is the clearest possible patient-safety priority. Speaking up immediately — even to a senior colleague — is expected of all members of the clinical team, including students. Waiting or deferring would allow an avoidable, potentially fatal error to proceed.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Once the immediate situation is safely resolved, complete a near-miss incident report through the hospital's electronic reporting system.",
        answer: "A",
        explanation:
          "Near-miss reporting is a core component of hospital safety culture. Documenting this event allows the risk team to identify systemic factors — such as high workload or inadequate allergy-checking protocols — and implement preventive measures. Failing to report wastes the learning opportunity the near-miss provides.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "After the antibiotic infusion has already been started, inform the ward doctor about the allergy concern you noticed.",
        answer: "B",
        explanation:
          "Alerting a doctor is a reasonable escalation step, but doing so after administration has already begun means the potential harm is no longer preventable. Acting before the drug is given is clearly superior; raising the concern at this stage is appropriate but too late to constitute ideal practice.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Say nothing and assume the senior nurse has already verified the allergy status by a method you did not observe.",
        answer: "D",
        explanation:
          "Making an unsupported assumption to avoid an uncomfortable intervention places the patient at direct risk of anaphylaxis or death. Patient safety requires acting on what you can see, not on assumptions about what someone else may have done. Silence here is a failure of the duty of candour owed to every patient.",
      },
      {
        subtype: "sjt-importance",
        question:
          "How important is it to cross-reference the patient's allergy wristband with the medication being prepared before every drug administration, even under significant time pressure in A&E?",
        answer: "A",
        explanation:
          "Allergy verification is a non-negotiable safety step: co-amoxiclav contains amoxicillin, a penicillin, and administering it to a penicillin-allergic patient can cause anaphylaxis within minutes. Time pressure never overrides this check — NHS Never Events classification includes wrong-drug-to-allergic-patient errors precisely because they are always preventable.",
      },
    ],
  },

  // ----- Set 2: GP surgery — under-16 patient confidentiality -----
  {
    kind: "set",
    setId: "gp-under16-confidentiality",
    issueTags: ["confidentiality", "autonomy"],
    stimulus: [
      "You are a medical student sitting in at a GP surgery. Earlier in the morning a 16-year-old patient attended alone, was assessed as Gillick competent, and was prescribed oral contraception. She explicitly asked that her parents not be told. Shortly afterwards her mother phones the surgery, and the receptionist has transferred the call to the room where you and your supervising GP are present. The mother asks what medication her daughter was given and whether it was 'anything to worry about'.",
    ],
    questions: [
      {
        subtype: "sjt-appropriateness",
        question:
          "Inform the mother — with the supervising GP's agreement — that all patient consultations are confidential and that you cannot share any details of her daughter's appointment without her daughter's explicit consent.",
        answer: "A",
        explanation:
          "A Gillick-competent patient has the same right to confidentiality as an adult. Disclosing consultation details to a parent without the patient's consent would be a breach of GMC confidentiality guidance and could damage the therapeutic relationship, deterring the patient from seeking sexual health care in future.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "After the call ends, add a contemporaneous entry to the patient's notes recording that a parental enquiry was made and that confidentiality was maintained.",
        answer: "A",
        explanation:
          "Documenting the enquiry and the decision taken protects both the patient and the practice. It creates a clear record that confidentiality obligations were upheld and provides an audit trail should any subsequent complaint or dispute arise about disclosure.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Tell the mother her daughter appeared well and suggest she discuss any concerns directly with her daughter, without confirming or denying any details of the consultation.",
        answer: "B",
        explanation:
          "Redirecting the parent to her daughter is a reasonable middle ground that avoids a direct breach of confidentiality while still engaging with the caller. However, it does not clearly explain to the mother why the practice cannot share information, which an ideal response would do — making this appropriate but less than ideal.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Disclose to the mother that her daughter was prescribed contraception, on the basis that a parent has a responsibility for their minor child's welfare.",
        answer: "D",
        explanation:
          "A Gillick-competent 16-year-old has a legally and ethically recognised right to confidential sexual health care. Disclosing this information without consent violates GMC guidance, breaches the patient's trust, and could cause serious harm — including deterring young people from accessing contraception, thereby increasing the risk of unwanted pregnancy or STIs.",
      },
      {
        subtype: "sjt-importance",
        question:
          "How important is it for a medical student on a GP placement to understand the Fraser guidelines before participating in consultations involving patients under 16 seeking contraception?",
        answer: "A",
        explanation:
          "The Fraser guidelines define the specific criteria a clinician must satisfy before providing contraception to a patient under 16 without parental knowledge. Without understanding these criteria, a student cannot meaningfully contribute to — or safely observe — such consultations, and may fail to recognise when a referral or safeguarding concern is warranted.",
      },
    ],
  },

  // ----- Set 3: Care home — covert medication and capacity -----
  {
    kind: "set",
    setId: "care-home-covert-medication",
    issueTags: ["capacity-consent", "respect-dignity"],
    stimulus: [
      "You are a 3rd-year medical student on a care home placement with your supervising consultant geriatrician. An 82-year-old woman with moderate-to-severe vascular dementia, Mrs Ellis, refuses to take her daily warfarin tablet, pushing the nurse's hand away and saying 'Leave me alone.' The nurse then tells you: 'She's like this every morning — we just crush it into her yoghurt without telling her. She doesn't know the difference and she needs her anticoagulation.' No formal best-interests meeting has been documented in the notes.",
    ],
    questions: [
      {
        subtype: "sjt-appropriateness",
        question:
          "Tell the nurse that covertly administering medication to a patient who has not had a formal best-interests assessment may be unlawful, and suggest pausing and escalating to the supervising consultant before proceeding.",
        answer: "A",
        explanation:
          "The Mental Capacity Act 2005 requires that any decision made on behalf of a patient who lacks capacity must follow a formal best-interests process, documented and involving the multidisciplinary team and, where possible, family members. Covert administration without this process is a potential violation of the patient's rights and the Care Quality Commission's regulations. Raising the concern and escalating immediately is the correct response, even from a student.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Before any decision about medication is made, attempt to communicate with Mrs Ellis using simple language, calm tone, and non-verbal reassurance to explore the reason for her refusal.",
        answer: "A",
        explanation:
          "The Mental Capacity Act requires that all practicable steps be taken to help a person make a decision before concluding they lack capacity. Mrs Ellis's refusal may reflect a time-specific reason — pain, nausea, or distress — that communication might resolve. Respecting her expressed wish and attempting engagement upholds her dignity and may render covert administration unnecessary.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Say nothing during the ward round but plan to raise the covert medication practice with your supervisor at the end of the placement.",
        answer: "C",
        explanation:
          "Raising the concern at some point is better than never doing so, but delaying until the end of the placement allows a potentially unlawful practice to continue affecting Mrs Ellis and possibly other residents for weeks. Patient safety and the duty of candour require prompt action; deferral here prioritises avoiding discomfort over the patient's rights.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Help the nurse crush the tablet and mix it into Mrs Ellis's yoghurt, reasoning that she needs her anticoagulation and the nurse must know best.",
        answer: "D",
        explanation:
          "Actively participating in covert medication administration without a valid best-interests decision makes you complicit in a practice that may violate the Mental Capacity Act and the patient's right to bodily autonomy. Deferring to seniority does not absolve a student of ethical responsibility; the GMC's guidance on Good Medical Practice requires all members of the team — including students — to raise patient safety and dignity concerns.",
      },
      {
        subtype: "sjt-importance",
        question:
          "How important is it for a formal best-interests decision — documented and involving the multidisciplinary team — to be made before covert medication administration to a patient who may lack capacity?",
        answer: "A",
        explanation:
          "The Mental Capacity Act 2005 makes the best-interests framework a legal requirement, not a guideline. Undocumented covert administration can constitute assault and exposes the care home and clinicians to regulatory action by the CQC and potential criminal liability. Ensuring this process is followed protects both the patient's rights and the legal standing of every professional involved in her care.",
      },
    ],
  },

  // ----- Set 4: Surgical ward — colleague falsifying observations -----
  {
    kind: "set",
    setId: "ward-falsified-observations",
    issueTags: ["integrity", "patient-safety", "candour"],
    stimulus: [
      "You are a final-year medical student on a busy surgical ward. While reviewing the bedside chart of Mr Okafor, a 58-year-old man who is one day post-operative following a laparotomy, you notice that a set of observations — including a respiratory rate of 14 and an oxygen saturation of 98% — has been entered for 14:00 today, signed by your fellow medical student Sam. You are certain Sam did not take these observations: you saw Sam leave for lunch at 13:45 and return at 14:30, and you were present on the ward the entire time. Mr Okafor's NEWS2 score from this morning was 4 and you can see he looks more breathless now.",
    ],
    questions: [
      {
        subtype: "sjt-appropriateness",
        question:
          "Immediately take a full set of observations on Mr Okafor yourself, document them accurately with the correct time, and then inform the ward registrar both about the patient's current clinical state and your concern that the 14:00 observations may not have been taken.",
        answer: "A",
        explanation:
          "A potentially deteriorating post-operative patient requires up-to-date, accurate observations as the clinical priority. Falsified recordings could mask a rise in NEWS2 score and prevent escalation under NICE deterioration guidelines. Combining immediate clinical action with candid reporting to a senior addresses both the patient safety risk and the professional integrity concern simultaneously.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Approach Sam privately before speaking to any senior, explain what you observed, and give Sam the opportunity to correct the chart entry themselves before you escalate.",
        answer: "C",
        explanation:
          "Giving a colleague the chance to self-correct can seem fair, but with a potentially deteriorating patient it introduces a dangerous delay to both clinical review and proper escalation. Integrity concerns involving patient harm require prompt reporting to a senior, not peer mediation first. This approach is not entirely without merit — avoiding a false accusation is a legitimate consideration — but patient safety must take priority over collegial loyalty.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Do nothing and assume Sam may have taken the observations in a way you did not notice, to avoid making a serious allegation against a colleague.",
        answer: "D",
        explanation:
          "Ignoring credible evidence of falsified clinical data in a deteriorating patient places Mr Okafor at direct risk of harm — a missed NEWS2 escalation can lead to avoidable cardiac arrest or intensive care admission. The GMC's Good Medical Practice requires honesty and raises the concept that doctors must not allow their concerns about colleagues to compromise patient safety.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "After the immediate clinical situation is resolved, submit a written account of your concern to the clinical supervisor and suggest that Sam is invited to explain the discrepancy.",
        answer: "A",
        explanation:
          "Once the patient is safe, a formal written report to the supervising consultant is the appropriate channel for professional integrity concerns. This initiates the proper fitness-to-practise process and creates a documented record, which is essential if the incident requires further review by the medical school or General Medical Council. Acting through proper channels respects due process while fulfilling the duty of candour.",
      },
      {
        subtype: "sjt-importance",
        question:
          "How important is it that clinical observations are recorded accurately and at the documented time, rather than estimated or completed retrospectively?",
        answer: "A",
        explanation:
          "NEWS2 and other early warning systems depend entirely on the accuracy and timeliness of recorded observations; falsified or retrospective entries can suppress a rising score and prevent the escalation thresholds defined in NICE guideline NG94 from being triggered. Beyond patient safety, falsifying medical records is a serious breach of professional integrity that the GMC treats as potential grounds for removal from the register.",
      },
    ],
  },

  // ----- Set 5: Neurology clinic — student documentation error -----
  {
    kind: "set",
    setId: "neurology-clinic-documentation-error",
    issueTags: ["candour", "integrity", "non-maleficence"],
    stimulus: [
      "You are a 4th-year medical student in a neurology outpatient clinic. The registrar asks you to take a history from Mr Holt, a 45-year-old man attending for possible epilepsy, and enter it into the clinic system. Twenty minutes later, as the registrar is about to call Mr Holt back in to discuss management, you recheck your entry and realise you have recorded his seizure frequency as '2 episodes per month' when he clearly told you '2 episodes per week' — a clinically significant difference that could directly influence whether anti-epileptic medication is initiated today.",
    ],
    questions: [
      {
        subtype: "sjt-appropriateness",
        question:
          "Before the registrar calls Mr Holt back in, immediately tell the registrar about the error and explain what Mr Holt actually reported.",
        answer: "A",
        explanation:
          "The duty of candour, enshrined in GMC Good Medical Practice, requires prompt disclosure of errors before they influence clinical decisions. A seizure frequency of 2 per week versus 2 per month may be the determining factor under NICE epilepsy guideline CG137 for initiating medication. Disclosure before the consultation resumes allows the registrar to re-clarify with the patient and make a fully informed decision.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Add a transparent, dated correction to the notes — recording the error, the correct information, and the time of amendment — and simultaneously inform the registrar before the consultation resumes.",
        answer: "A",
        explanation:
          "Correcting documentation in a transparent, auditable way is standard practice for all clinical records errors. Doing this alongside verbal disclosure ensures the record is accurate and the registrar is not relying on incorrect data. Both actions together represent the thorough and honest conduct expected of all members of the healthcare team.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Wait to see whether the registrar picks up the discrepancy when re-interviewing Mr Holt, and only mention your error if you are directly questioned.",
        answer: "C",
        explanation:
          "The registrar may not repeat a full history and may act on the documented information, meaning the error could influence the treatment decision uncorrected. Waiting passively is not wholly unreasonable — errors are sometimes caught downstream — but it fails the duty of candour and risks the patient receiving management based on incorrect data. Proactive disclosure is expected of all clinical team members.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Leave the notes as they are, reasoning that the registrar will carry out their own assessment and will likely discover the correct seizure frequency independently.",
        answer: "D",
        explanation:
          "Leaving a known, clinically significant error uncorrected is a direct breach of the duty of candour and may result in patient harm if the registrar acts on the recorded — rather than actual — seizure frequency. GMC guidance is unambiguous: clinicians must be open and honest when they make mistakes; failing to correct a known error is itself an act of dishonesty with potential fitness-to-practise implications.",
      },
      {
        subtype: "sjt-importance",
        question:
          "How important is it for a medical student to immediately disclose a documentation error to the supervising clinician when the error involves clinically significant information that could directly influence a treatment decision?",
        answer: "A",
        explanation:
          "Clinical decisions in specialties like neurology depend heavily on accurate symptom-frequency data — a wrong seizure frequency could mean a patient is not started on anti-epileptic medication when indicated, risking breakthrough seizures, or is started when not needed, exposing them to unnecessary drug side effects. The GMC's duty of candour applies to all members of the team, including students, and proactive error disclosure is the foundation of a safe and honest clinical culture.",
      },
    ],
  },

  // ----- Set 6: Psychiatric ward — professional boundaries -----
  {
    kind: "set",
    setId: "psych-ward-professional-boundaries",
    issueTags: ["professional-boundaries", "respect-dignity", "communication"],
    stimulus: [
      "You are a 3rd-year medical student on a four-week psychiatry attachment at an inpatient mental health unit. You have been taking regular structured histories from James, a 28-year-old patient admitted with severe depression, as part of your learning. Today, on his planned discharge day, James hands you a handwritten note asking for your personal mobile number so he can 'stay in touch' and 'not feel so alone after leaving'. Your consultant is in a meeting, but your FY1 supervisor is present on the ward.",
    ],
    questions: [
      {
        subtype: "sjt-appropriateness",
        question:
          "Decline James's request kindly but clearly, explain that professional boundaries prevent sharing personal contact details, and immediately speak to your FY1 supervisor so the interaction can be documented and considered in James's discharge plan.",
        answer: "A",
        explanation:
          "GMC Good Medical Practice explicitly prohibits personal relationships with patients that could compromise care or objectivity. Disclosing the request to the FY1 allows the team to ensure James has adequate community support before discharge — his note may signal he lacks it, which is clinically important on a psychiatric ward. Documenting the interaction creates an appropriate record and protects both James and the student.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Decline James's request, but say nothing to your supervisor, reasoning that it was probably an impulsive gesture and he is already being discharged.",
        answer: "C",
        explanation:
          "Declining is appropriate, but failing to disclose the interaction means a clinically relevant signal — that James may feel isolated and lack a support network at home — is not incorporated into the discharge plan. In psychiatry, attachment to a student carer can indicate unmet emotional needs that warrant review before the patient leaves the ward. Silence, while understandable, falls short of best practice.",
      },
      {
        subtype: "sjt-appropriateness",
        question:
          "Tell James you will think about whether to share your number and will let him know before he leaves, as you do not want to upset him on his discharge day.",
        answer: "D",
        explanation:
          "Giving a patient false hope that a personal relationship might develop crosses a clear professional boundary and could significantly harm James's recovery by creating an inappropriate dependency. The GMC's boundaries guidance is unambiguous; offering to 'think about it' amounts to an implicit promise the contact may occur, which is both dishonest and potentially harmful to a vulnerable patient with severe depression.",
      },
      {
        subtype: "sjt-importance",
        question:
          "How important is it to inform your clinical supervisor when a patient has expressed a personal attachment to you or requested your personal contact details during a psychiatry placement?",
        answer: "A",
        explanation:
          "In psychiatry, a patient's attachment to a temporary carer can signal broader social isolation, insufficient community support, or vulnerability that must be assessed before discharge. The clinical team cannot address these factors if they are not informed. Both the GMC and the Royal College of Psychiatrists emphasise that unusual or boundary-testing interactions must be disclosed and documented to protect patient welfare and to safeguard the student from subsequent allegations.",
      },
    ],
  },

  // ===== PASTE NEW SJT QUESTIONS ABOVE THIS LINE =====
];
