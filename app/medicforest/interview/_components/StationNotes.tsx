"use client";

import { useId } from "react";
import { useReviewStorage } from "../_lib/useReviewStorage";

export function StationNotes({ attemptId, preview = false }: { attemptId: string; preview?: boolean }) {
  const inputId = useId();
  const { value, setValue, saved } = useReviewStorage(preview ? null : `medicforest:station-notes:${attemptId}`);
  return <div className="space-y-3">
    <h2 className="text-base font-bold text-[#153e4c]">Station notes</h2>
    <label htmlFor={inputId} className="block text-sm font-semibold text-[#415b61]">Private notes · not marked</label>
    <textarea id={inputId} data-station-notes value={value} onChange={(event) => setValue(event.target.value)} maxLength={5000} rows={5} placeholder="What went well? What will you try next time?" className="block w-full rounded-xl border border-[#ccdcda] bg-white p-3 text-base text-[#153e4c] outline-none focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/15" />
    <p className="text-xs leading-5 text-[#62777e]" role="status">{preview ? "Preview notes are not saved." : saved ? "Saved on this device. These notes are private and are not sent for AI feedback." : "These notes are kept while this page is open. Your browser could not save them."}</p>
  </div>;
}
