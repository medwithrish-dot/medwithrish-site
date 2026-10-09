export const MEDWITHRISH_NOTES_URL = "https://payhip.com/Medwithrish";
export const FREE_INTERVIEW_GUIDE_URL = "https://payhip.com/b/HLn2M";

const contactTopics = {
  "gcse-tutoring": {
    label: "GCSE tutoring",
    subject: "GCSE tutoring enquiry",
  },
  "alevel-tutoring": {
    label: "A-Level tutoring",
    subject: "A-Level tutoring enquiry",
  },
  "interview-tutoring": {
    label: "Med interview tutoring",
    subject: "Med Interview tutoring enquiry",
  },
  "personal-statement-session": {
    label: "a personal statement session",
    subject: "Personal statement session enquiry",
  },
} as const;

export type ContactTopic = keyof typeof contactTopics;

export function contactHref(topic: ContactTopic): string {
  return `/contact?topic=${topic}`;
}

export function contactDetails(value: string | string[] | undefined) {
  const topic = typeof value === "string" && Object.hasOwn(contactTopics, value)
    ? contactTopics[value as ContactTopic]
    : null;
  const subject = topic?.subject ?? "MedWithRish enquiry";
  const message = topic
    ? `Hi Rishoo, I'm interested in ${topic.label}.`
    : "Hi Rishoo, I'd like to ask about MedWithRish.";

  return {
    heading: topic ? `Ask about ${topic.label}` : "Get in touch",
    emailHref: `mailto:medwithrish@gmail.com?subject=${encodeURIComponent(subject)}`,
    whatsappHref: `https://wa.me/447305422619?text=${encodeURIComponent(message)}`,
  };
}
