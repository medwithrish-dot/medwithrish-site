import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { admissionsGuides } from "../utils/medwithrish/guides.ts";
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

test("every revamped guide has readable sections and resolves its local actions and related pages", () => {
  assert.equal(Object.keys(admissionsGuides).length, 9);
  for (const [slug, guide] of Object.entries(admissionsGuides)) {
    assert.ok(existsSync(new URL(`../app/${slug}/page.tsx`, import.meta.url)), slug);
    assert.ok(guide.title && guide.intro && guide.takeaway, slug);
    assert.ok(guide.sections.length >= 3, slug);
    assert.equal(new Set(guide.sections.map(section => section.title)).size, guide.sections.length, slug);
    for (const section of guide.sections) assert.ok(section.points?.length || section.paragraphs?.length, `${slug}: ${section.title}`);
    const localLinks = [guide.ctaHref, ...(guide.related ?? []).map(item => item.href)].filter(href => href?.startsWith("/"));
    for (const href of localLinks) assert.ok(existsSync(new URL(guide.download && href === guide.ctaHref ? `../public${href}` : `../app${href}/page.tsx`, import.meta.url)), `${slug}: ${href}`);
    for (const source of guide.sources ?? []) {
      const url = new URL(source.href);
      assert.equal(url.protocol, "https:");
      assert.ok(["www.ucas.com", "www.ucat.ac.uk", "www.medschools.ac.uk", "www.healthcareers.nhs.uk", "www.gdc-uk.org"].includes(url.hostname));
    }
  }
});

test("application and UCAT guides use the current formats and shared background asset", () => {
  const personal = JSON.stringify(admissionsGuides["personal-statements-guide"]);
  assert.match(personal, /three responses/);
  assert.match(personal, /4,000 characters/);
  assert.match(personal, /350 characters/);
  const ucat = JSON.stringify(admissionsGuides["ucat-timeline"]);
  assert.match(ucat, /Abstract Reasoning is no longer/);
  assert.match(ucat, /Verbal Reasoning/);
  assert.ok(existsSync(new URL("../public/backgrounds/sage-waves.svg", import.meta.url)));
  const component = readFileSync(new URL("../components/GuidePage.tsx", import.meta.url), "utf8");
  assert.match(component, /aria-label="Guide contents"/);
  assert.doesNotMatch(component, /<Reveal/);
});
