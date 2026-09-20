import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

const DAILY_TARGET = 5;

type ActivityRow = {
  practice_date: string;
  questions: number;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function heatClass(questions: number) {
  if (questions <= 0) return "border-[#e7eeee] bg-[#f2f6f5] text-[#78908e]";
  if (questions < 2) return "border-[#d3eee2] bg-[#e5f7ef] text-[#28715c]";
  if (questions < 4) return "border-[#9fddc6] bg-[#c9efdf] text-[#176c55]";
  if (questions < DAILY_TARGET) return "border-[#45c99b] bg-[#45c99b] text-white";
  return "border-[#0a8b69] bg-[#0a8b69] text-white";
}

export function InterviewQuestionCalendar({
  rows,
  today,
  available,
  signedIn,
}: {
  rows: ActivityRow[];
  today: string;
  available: boolean;
  signedIn: boolean;
}) {
  const current = new Date(`${today}T12:00:00Z`);
  const counts = new Map(rows.map((row) => [row.practice_date, Number(row.questions)]));
  const recent = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(current);
    date.setUTCDate(current.getUTCDate() - (6 - index));
    const key = dateKey(date);
    return {
      key,
      day: date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }).slice(0, 2),
      date: date.getUTCDate(),
      questions: counts.get(key) ?? 0,
      isToday: key === today,
    };
  });
  const total = recent.reduce((sum, day) => sum + day.questions, 0);
  const average = Math.round(total / recent.length);
  const daysOnTarget = recent.filter((day) => day.questions >= DAILY_TARGET).length;

  return (
    <section className="rounded-2xl border border-[#d7e3e1] bg-white p-5 shadow-sm" aria-labelledby="interview-question-calendar-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="interview-question-calendar-title" className="flex items-center gap-2 text-sm font-bold text-[#173d3d]">
            <CalendarDays className="h-4 w-4 text-[#08787b]" aria-hidden="true" />
            Question activity
          </h2>
          <p className="mt-1 text-[10px] font-semibold text-[#718486]">Your last seven days</p>
        </div>
        <span className="rounded-full bg-[#e8f8f1] px-2.5 py-1 text-[9px] font-bold text-[#087457]">{DAILY_TARGET}/day goal</span>
      </div>

      {!available ? (
        <p className="mt-4 rounded-xl bg-[#f5f8f7] p-4 text-xs leading-5 text-[#687d80]">{signedIn ? "Daily question activity is currently unavailable." : "Sign in to see your daily interview-question activity."}</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Questions completed over the last seven days">
            {recent.map((day) => (
              <div key={day.key} className="min-w-0 text-center">
                <span className={`block text-[9px] font-bold ${day.isToday ? "text-[#08787b]" : "text-[#819492]"}`}>{day.day}</span>
                <div title={`${day.questions} of ${DAILY_TARGET} questions`} aria-label={`${day.key}: ${day.questions} of ${DAILY_TARGET} questions`} className={`mt-1.5 flex h-11 flex-col items-center justify-center rounded-lg border text-[10px] font-bold ${heatClass(day.questions)} ${day.isToday ? "ring-2 ring-[#08787b]/20 ring-offset-1" : ""}`}>
                  <span>{day.date}</span>
                  {day.questions > 0 && <span className="text-[8px] opacity-80">{day.questions} done</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-[#e4ecea] rounded-xl bg-[#f5f9f7] px-2 py-3 text-center">
            <div><strong className="block text-base tabular-nums text-[#173d3d]">{total}</strong><span className="text-[9px] font-semibold text-[#718486]">questions</span></div>
            <div><strong className="block text-base tabular-nums text-[#173d3d]">{average}</strong><span className="text-[9px] font-semibold text-[#718486]">daily average</span></div>
            <div><strong className="block text-base tabular-nums text-[#087457]">{daysOnTarget}/7</strong><span className="text-[9px] font-semibold text-[#718486]">on target</span></div>
          </div>
        </>
      )}
      <Link href="/phloemai/interview/progress" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#08787b]">View detailed progress <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
    </section>
  );
}
