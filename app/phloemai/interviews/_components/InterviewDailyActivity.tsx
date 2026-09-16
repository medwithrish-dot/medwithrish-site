"use client";

import { useState } from "react";

export function InterviewDailyActivity({ rows, today, available }: {
  rows: { practice_date: string; questions: number }[]; today: string; available: boolean;
}) {
  const [days, setDays] = useState(7);
  const counts = new Map(rows.map((row) => [row.practice_date, Number(row.questions)]));
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - days + index + 1);
    const key = date.toISOString().slice(0, 10);
    return { key, count: counts.get(key) ?? 0, label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) };
  });
  const max = Math.max(1, ...dates.map((date) => date.count));
  return <section className="border-y border-[#d7e3e1] bg-white px-5 py-5" aria-labelledby="daily-questions-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="daily-questions-title" className="text-sm font-bold text-[#173d3d]">Questions completed each day</h2><p className="mt-1 text-xs text-[#617a79]">{available ? `${counts.get(today) ?? 0} today · ${dates.reduce((sum, date) => sum + date.count, 0)} in the last ${days} days` : "Daily activity is currently unavailable."}</p></div>
      <div className="flex rounded-md border border-[#ccdcda] p-1" aria-label="Activity period">{[7, 28].map((period) => <button key={period} type="button" aria-pressed={days === period} onClick={() => setDays(period)} className={`rounded px-3 py-1.5 text-xs font-semibold ${days === period ? "bg-[#08787b] text-white" : "text-[#526b72]"}`}>{period} days</button>)}</div>
    </div>
    {available && <><div className="mt-5 grid h-32 items-end gap-1.5 border-b border-[#d7e3e1]" style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}>
      {dates.map((date) => <div key={date.key} tabIndex={0} title={`${date.label}: ${date.count} questions`} aria-label={`${date.label}: ${date.count} questions`} className="flex h-full flex-col justify-end gap-1 text-center text-[10px] text-[#526b72]">
        {days === 7 && <span>{date.count}</span>}<div className={`min-h-1 rounded-t-sm ${date.key === today ? "bg-[#08787b]" : "bg-[#9dcfb7]"}`} style={{ height: `${Math.max(3, date.count / max * 80)}%` }} />
      </div>)}
    </div><div className="mt-2 flex justify-between text-[10px] text-[#617a79]"><span>{dates[0].label}</span><span>Today</span></div></>}
  </section>;
}
