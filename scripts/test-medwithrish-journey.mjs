import assert from "node:assert/strict";
import { test } from "node:test";
import {
  contactDetails,
  contactHref,
  FREE_INTERVIEW_GUIDE_URL,
} from "../utils/medwithrish/site-links.ts";

test("tutoring enquiries carry their topic through to email and WhatsApp", () => {
  for (const [topic, subject] of [
    ["gcse-tutoring", "GCSE tutoring enquiry"],
    ["alevel-tutoring", "A-Level tutoring enquiry"],
    ["interview-tutoring", "Med Interview tutoring enquiry"],
    ["personal-statement-session", "Personal statement session enquiry"],
  ]) {
    const destination = new URL(contactHref(topic), "https://medwithrish.com");
    const contact = contactDetails(destination.searchParams.get("topic"));
    assert.equal(new URL(contact.emailHref).searchParams.get("subject"), subject);
    assert.match(new URL(contact.whatsappHref).searchParams.get("text"), /interested in/);
  }
});

test("unknown or repeated contact topics cannot control the outgoing message", () => {
  for (const value of [undefined, "unexpected", "interview-tutoring\r\nBcc:example@example.com", ["interview-tutoring", "gcse-tutoring"]]) {
    const contact = contactDetails(value);
    assert.equal(contact.heading, "Get in touch");
    assert.equal(new URL(contact.emailHref).searchParams.get("subject"), "MedWithRish enquiry");
  }
});

test("the free Med interview guide points to its own Payhip product", () => {
  assert.equal(new URL(FREE_INTERVIEW_GUIDE_URL).pathname, "/b/HLn2M");
});
