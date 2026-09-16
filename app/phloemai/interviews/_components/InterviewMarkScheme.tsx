"use client";

import { useId, useState, type ReactNode } from "react";
import { CheckCircle2, ChevronRight, Circle, FileText } from "lucide-react";
import type { MarkSchemeSection } from "../_lib/question-review";
import type { SpeechDelivery } from "../_lib/speech-delivery";
import { SpeechDeliveryHints } from "./SpeechDeliveryHints";
import styles from "./InterviewMarkScheme.module.css";

function ChecklistToggle({
  id,
  label,
  isChecked,
  onToggle,
}: {
  id: string;
  label: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-pressed={isChecked}
      className={`grid w-full grid-cols-[24px_minmax(0,1fr)] items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
        isChecked
          ? "border-[#b9dcda] bg-[#f1fbfa]"
          : "border-[#d8e0e6] bg-white hover:border-[#b9dcda] hover:bg-[#f8fbfb]"
      }`}
    >
      {isChecked ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0f9b7d]" strokeWidth={2.2} />
      ) : (
        <Circle className="mt-1 h-4 w-4 text-[#b8c3ca]" fill="#b8c3ca" strokeWidth={0} />
      )}
      <span className="text-sm font-medium leading-5 text-[#314956]">
        {label}
      </span>
    </button>
  );
}

export function InterviewMarkScheme({ rubricGroups, checkedItems, openMarkSchemeSections, toggleChecklistItem, toggleMarkSchemeSection, deliveryHints, compact = false, headerAction }: {
  rubricGroups: readonly MarkSchemeSection[];
  checkedItems: Set<string>;
  openMarkSchemeSections: Set<MarkSchemeSection["title"]>;
  toggleChecklistItem: (id: string) => void;
  toggleMarkSchemeSection: (title: MarkSchemeSection["title"]) => void;
  deliveryHints?: SpeechDelivery;
  compact?: boolean;
  headerAction?: ReactNode;
}) {
  const panelPrefix = useId();
  const totalChecklistItems = rubricGroups.reduce((total, group) => total + group.items.length, 0);
  const checkedCount = rubricGroups.reduce((total, group) => total + group.items.filter((item) => checkedItems.has(`${group.title}-${item}`)).length, 0);
  const checklistPercent = totalChecklistItems ? Math.round(checkedCount / totalChecklistItems * 100) : 0;
  return (
    <aside data-mark-scheme className={compact ? styles.compact : "space-y-5"}>
      <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-black text-[#071923]">
            Mark Scheme
          </h2>
          <span className="text-sm font-black text-[#08787b]">
            {checklistPercent}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe8ea]">
          <div
            className="h-full rounded-full bg-[#159a9d]"
            style={{ width: `${checklistPercent}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-[#4a6370]">
          {checkedCount} / {totalChecklistItems} covered
        </p>
        <div className={styles.actions}><a
          href="/phloemai/interview-question-markscheme-rubrics.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#b8c8cf] bg-white px-4 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Rubric PDF
        </a>
        {headerAction}</div>
      </section>

      {rubricGroups.map((group) => {
        const isOpen = openMarkSchemeSections.has(group.title);
        const panelId = `${panelPrefix}-${group.title.toLowerCase()}`;
        const checkedInGroup = group.items.reduce((total, item) => {
          const id = `${group.title}-${item}`;

          return total + (checkedItems.has(id) ? 1 : 0);
        }, 0);

        return (
          <section
            key={group.title}
            className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleMarkSchemeSection(group.title)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0">
                <span className="block text-sm font-black text-[#08787b]">
                  {group.title}
                </span>
                <span className="mt-1 block text-xs font-bold text-[#5d7280]">
                  {checkedInGroup} / {group.items.length}
                </span>
              </span>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d8e0e6] bg-[#f7fafb] text-[#4a6370] transition-colors hover:border-[#08787b] hover:text-[#08787b]">
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>

            <div id={panelId} aria-hidden={!isOpen} inert={!isOpen} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="min-h-0 overflow-hidden"><div className="space-y-3 pt-4">
                {group.items.map((item) => {
                  const id = `${group.title}-${item}`;

                  return (
                    <ChecklistToggle
                      key={id}
                      id={id}
                      label={item}
                      isChecked={checkedItems.has(id)}
                      onToggle={toggleChecklistItem}
                    />
                  );
                })}
              </div></div>
            </div>
          </section>
        );
      })}
      {deliveryHints && <SpeechDeliveryHints hints={deliveryHints} />}
    </aside>
  );
}

export function StationMarkScheme({ rubricGroups, headerAction }: { rubricGroups: readonly MarkSchemeSection[]; headerAction?: ReactNode }) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set());
  const [openSections, setOpenSections] = useState<Set<MarkSchemeSection["title"]>>(() => new Set(["General", "Start", "Middle", "End"]));
  return <InterviewMarkScheme compact rubricGroups={rubricGroups} headerAction={headerAction} checkedItems={checkedItems} openMarkSchemeSections={openSections}
    toggleChecklistItem={(id) => setCheckedItems((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
    toggleMarkSchemeSection={(title) => setOpenSections((previous) => { const next = new Set(previous); if (next.has(title)) next.delete(title); else next.add(title); return next; })} />;
}
