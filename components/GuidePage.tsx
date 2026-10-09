import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Clock3 } from "lucide-react";
import Navbar from "./Navbar";
import styles from "./GuidePage.module.css";

export type GuideSection = {
  title: string;
  points?: string[];
  paragraphs?: string[];
  example?: { title: string; text: string };
  action?: string;
};

export type GuidePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: GuideSection[];
  takeaway?: string;
  readTime?: string;
  checklist?: string[];
  sources?: { label: string; href: string }[];
  related?: { label: string; href: string; description?: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  download?: boolean;
  resourceLabel?: string;
  secondaryAction?: { label: string; href: string };
};

export default function GuidePage({
  eyebrow, title, intro, sections, takeaway, readTime = "5 min read",
  checklist, sources, related, ctaLabel, ctaHref, download = false,
  resourceLabel = "Free guide", secondaryAction,
}: GuidePageProps) {
  const cta = ctaLabel && ctaHref && (
    download || ctaHref.startsWith("https://") ? (
      <a href={ctaHref} download={download || undefined} target={download ? undefined : "_blank"} rel={download ? undefined : "noopener noreferrer"} className={styles.primaryAction}>
        {ctaLabel}<ArrowUpRight size={16} aria-hidden="true" />
        {!download && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    ) : <Link href={ctaHref} className={styles.primaryAction}>{ctaLabel}<ArrowRight size={16} aria-hidden="true" /></Link>
  );

  return (
    <div className="medwithrish-bg">
      <Navbar />
      <main className={styles.page}>
        <Link href="/resources" className={styles.back}><ArrowLeft size={15} aria-hidden="true" /> All resources</Link>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><BookOpen size={14} aria-hidden="true" /> {eyebrow}</p>
            <h1>{title}</h1>
            <p className={styles.intro}>{intro}</p>
            <div className={styles.meta}><span>By MedWithRish</span><span><Clock3 size={14} aria-hidden="true" />{readTime}</span><span>{resourceLabel}</span></div>
          </div>
          <div className={styles.heroAside}>
            <span className={styles.asideLabel}>Start with this</span>
            <p>{takeaway ?? "Read one section, choose one action, and put it into practice. Small, deliberate changes add up."}</p>
            <a href="#guide-section-1" className={styles.startLink}>Read the guide <ArrowRight size={16} aria-hidden="true" /></a>
            {(download || secondaryAction) && cta}
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.contents}>
            <nav aria-label="Guide contents">
              <p className={styles.asideLabel}>In this guide</p>
              <ol>{sections.map((section, index) => <li key={section.title}><a href={`#guide-section-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>)}</ol>
              {checklist && <a className={styles.checklistLink} href="#guide-checklist"><Check size={15} aria-hidden="true" /> Your next steps</a>}
            </nav>
            <p className={styles.sideNote}>Keep this guide open while you plan. Use the section links to come back to the part you need.</p>
          </aside>

          <div className={styles.article}>
            {sections.map((section, index) => (
              <section id={`guide-section-${index + 1}`} className={styles.section} key={section.title} aria-labelledby={`guide-heading-${index + 1}`}>
                <div className={styles.sectionHeading}><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><h2 id={`guide-heading-${index + 1}`}>{section.title}</h2></div>
                {section.paragraphs?.map(paragraph => <p className={styles.paragraph} key={paragraph}>{paragraph}</p>)}
                {section.points && <ul className={styles.points}>{section.points.map(point => <li key={point}><span className={styles.bullet} aria-hidden="true" />{point}</li>)}</ul>}
                {section.example && <div className={styles.example}><p className={styles.asideLabel}>{section.example.title}</p><p>{section.example.text}</p></div>}
                {section.action && <p className={styles.action}><Check size={17} aria-hidden="true" /><span><strong>Try this:</strong> {section.action}</span></p>}
              </section>
            ))}

            {checklist && <section id="guide-checklist" className={styles.checklist}><p className={styles.eyebrow}>Put it into practice</p><h2>Your next steps</h2><ul>{checklist.map(item => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul></section>}

            {sources && <section className={styles.sources} aria-label="Official sources"><h2>Check the official guidance</h2><p>Use the original guidance for application rules, course requirements and test changes.</p><ul>{sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>}

            {cta && <section className={styles.support}><div><p className={styles.eyebrow}>Take the next step</p><h2>{download ? "Your planning tools, ready to use." : "A little direction can make a difference."}</h2><p>{download ? "Download the resource and turn your next practice session into a useful record." : "Use the resources or book focused support for the part of your preparation you want to improve."}</p></div>{cta}{secondaryAction && <a href={secondaryAction.href} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>{secondaryAction.label}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}</section>}
          </div>
        </div>

        {related && <section className={styles.related} aria-labelledby="related-guides-heading"><p className={styles.eyebrow}>Keep exploring</p><h2 id="related-guides-heading">Your next read</h2><div>{related.map(item => <Link href={item.href} key={item.href}><span><strong>{item.label}</strong>{item.description && <span>{item.description}</span>}</span><ArrowRight size={18} aria-hidden="true" /></Link>)}</div></section>}
      </main>
    </div>
  );
}
