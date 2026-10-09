import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResourceLibrary, { type ResourceCategory } from "@/components/ResourceLibrary";
import { FREE_INTERVIEW_GUIDE_URL, MEDWITHRISH_NOTES_URL } from "@/utils/medwithrish/site-links";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admissions Resources & Revision Guides | MedWithRish",
  description: "Free guides, UCAT planning tools and focused tutoring for medicine and dentistry applications. Explore personal statements, experience, revision and interviews.",
  alternates: { canonical: "/resources" },
};

const categories: ResourceCategory[] = [
  { id: "interviews", name: "Interviews", description: "Build clear answers, explore scenarios and practise reflecting on your own experiences.", items: [
    { title: "The Medicine Interview Guide", href: FREE_INTERVIEW_GUIDE_URL, badge: "Free PDF", description: "Ethical frameworks, interview topics and reflection guidance to help structure your preparation.", external: true },
    { title: "Interview preparation hub", href: "/interviews", badge: "Practice & guidance", description: "Explore interview resources and the MedicForest question bank, station practice and feedback." },
    { title: "1-to-1 interview tutoring", href: "/interview-tutoring", badge: "Tutoring", description: "Practise a mock interview and work through specific feedback with a tutor." },
  ] },
  { id: "ucat", name: "UCAT", description: "Plan your practice, record your progress and target the mistakes behind the scores.", items: [
    { title: "UCAT preparation timeline", href: "/ucat-timeline", badge: "Free guide", description: "An adaptable plan for learning techniques, timed practice, mock review and test-day preparation." },
    { title: "Free mock score tracker", href: "/ucat-score-tracker", badge: "Free download", description: "Download an Excel workbook and turn your practice results into a focused plan." },
    { title: "Mock difficulty spreadsheet", href: "/ucat-mock-difficulty", badge: "Community resource", description: "Compare student-reported mock results and understand what the averages can tell you." },
    { title: "UCAT tutoring", href: "/ucat-tutoring", badge: "Tutoring", description: "Work on timing, question methods and the subtests you find hardest." },
    { title: "MedWithRish study notes", href: MEDWITHRISH_NOTES_URL, badge: "Study resources", description: "Browse the MedWithRish notes and revision resources available on Payhip.", external: true },
  ] },
  { id: "application", name: "Your application", description: "Gather useful evidence and explain your course choice with clarity.", items: [
    { title: "Personal statement guide", href: "/personal-statements-guide", badge: "Free guide", description: "The current three-question UCAS format, reflective examples and a practical editing checklist." },
    { title: "Work experience guide", href: "/work-experience-guide", badge: "Free guide", description: "Find accessible opportunities, keep anonymous reflection notes and discuss what you learned." },
    { title: "Year 12 application roadmap", href: "/year12-guide", badge: "Free guide", description: "A term-by-term plan that brings academics, experience and admissions preparation together." },
    { title: "Personal statement review", href: "/personal-statement-session", badge: "1-to-1 support", description: "Get feedback on structure, clarity and reflection while keeping your own voice." },
  ] },
  { id: "academics", name: "Study & revision", description: "Make revision specific, learn from mistakes and strengthen your academic foundations.", items: [
    { title: "GCSE revision guide", href: "/gcse-revision-guide", badge: "Free guide", description: "Use active recall, exam questions and an error log to make revision worthwhile." },
    { title: "GCSE tutoring", href: "/gcse-tutoring", badge: "Tutoring", description: "Build understanding and exam technique with focused support." },
    { title: "A-Level tutoring", href: "/alevel-tutoring", badge: "Tutoring", description: "Work through difficult concepts and develop a more consistent approach to exams." },
  ] },
  { id: "pathways", name: "Explore your options", description: "Understand different entry routes and investigate the wider healthcare team.", items: [
    { title: "Gateway & foundation routes", href: "/gateway-foundation-guide", badge: "Free guide", description: "Check programme eligibility, progression conditions and the exact qualification before applying." },
    { title: "Related healthcare careers", href: "/related-careers-guide", badge: "Free guide", description: "Compare roles, training and responsibilities to find the profession that fits your interests." },
  ] },
];

export default function ResourcesPage() {
  return <div className="medwithrish-bg"><Navbar /><main className={styles.page}>
    <header className={styles.hero}>
      <div><p className={styles.eyebrow}><BookOpen size={15} aria-hidden="true" /> The MedWithRish library</p><h1>A clearer path<br />to your next step.</h1><p className={styles.intro}>Practical guides, useful tools and a little direction for your medicine or dentistry application. Start where you are, and find what helps next.</p><div className={styles.tags}><span>Free reading guides</span><span>Downloadable tools</span><span>Focused support</span></div></div>
      <aside className={styles.featured}><span className={styles.eyebrow}>A good place to start</span><span className={styles.featuredIcon}><BookOpen size={27} aria-hidden="true" /></span><h2>The Medicine<br />Interview Guide</h2><p>A free PDF to help you organise ethical scenarios, interview topics and personal reflections.</p><a href={FREE_INTERVIEW_GUIDE_URL} target="_blank" rel="noopener noreferrer">Get the free guide<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></aside>
    </header>
    <ResourceLibrary categories={categories} />
    <footer className={styles.support}><div><h2>Not sure where to start?</h2><p>Tell us what stage you are at and which part of your preparation feels unclear.</p></div><Link href="/contact">Get in touch <ArrowUpRight size={16} aria-hidden="true" /></Link></footer>
  </main></div>;
}
