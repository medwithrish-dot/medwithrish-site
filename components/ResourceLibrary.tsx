"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import styles from "./ResourceLibrary.module.css";

export type ResourceCategory = {
  id: string;
  name: string;
  description: string;
  items: { title: string; href: string; badge: string; description: string; external?: boolean }[];
};

export default function ResourceLibrary({ categories }: { categories: ResourceCategory[] }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = categories.filter(category => active === "all" || category.id === active).map(category => ({
    ...category,
    items: category.items.filter(item => terms.every(term => `${category.name} ${item.title} ${item.description} ${item.badge}`.toLowerCase().includes(term))),
  })).filter(category => category.items.length);
  const count = visible.reduce((total, category) => total + category.items.length, 0);

  return <section className={styles.library} aria-label="Resource library">
    <div className={styles.toolbar}>
      <div><p className={styles.eyebrow}>Find your next step</p><h2>Explore the library</h2></div>
      <div className={styles.search}>
        <Search size={17} aria-hidden="true" />
        <label htmlFor={searchId} className="sr-only">Search resources</label>
        <input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search guides, tools or tutoring" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}
      </div>
    </div>
    <div className={styles.filters} aria-label="Filter resources by topic">
      {[{ id: "all", name: "All resources" }, ...categories].map(category => <button key={category.id} type="button" aria-pressed={active === category.id} onClick={() => setActive(category.id)}>{category.name}</button>)}
    </div>
    <p className={styles.resultCount} role="status" aria-live="polite">{count} {count === 1 ? "resource" : "resources"}{query && ` matching “${query}”`}</p>
    {visible.length ? <div className={styles.categories}>{visible.map(category => <section key={category.id} id={category.id} aria-labelledby={`resource-${category.id}`}>
      <div className={styles.categoryHeading}><h3 id={`resource-${category.id}`}>{category.name}</h3><p>{category.description}</p></div>
      <div className={styles.cards}>{category.items.map(item => {
        const content = <><span className={styles.badge}>{item.badge}</span><h4>{item.title}</h4><p>{item.description}</p><span className={styles.cardAction}>{item.external ? "Open resource" : "Explore"}{item.external ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</span>{item.external && <span className="sr-only">Opens in a new tab</span>}</>;
        return item.external ? <a key={item.href} className={styles.card} href={item.href} target="_blank" rel="noopener noreferrer">{content}</a> : <Link key={item.href} className={styles.card} href={item.href}>{content}</Link>;
      })}</div>
    </section>)}</div> : <div className={styles.empty}><h3>No matching resources yet.</h3><p>Try a broader search or browse every topic.</p><button type="button" onClick={() => { setActive("all"); setQuery(""); }}>Show all resources</button></div>}
  </section>;
}
