import { CalendarDays, Info } from "lucide-react";

const DAILY_TARGET = 5;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type ActivityRow = {
  practice_date: string;
  questions: number;
};

function heatClass(questions: number) {
  if (questions <= 0) return "border-[#edf1f1] bg-[#edf1f1] text-[#91a3a4]";
  if (questions < 2) return "border-[#d8f3e5] bg-[#d8f3e5] text-[#28715c]";
  if (questions < 4) return "border-[#a8e8ce] bg-[#a8e8ce] text-[#176c55]";
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
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();
  const todayNumber = current.getUTCDate();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstDayOffset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const counts = new Map(rows.map((row) => [row.practice_date, Number(row.questions)]));
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, key, questions: counts.get(key) ?? 0, future: day > todayNumber };
  });
  const recent = days.slice(Math.max(0, todayNumber - 7), todayNumber);
  const average = recent.length
    ? Math.round(recent.reduce((sum, day) => sum + day.questions, 0) / recent.length)
    : 0;
  const daysOnTarget = recent.filter((day) => day.questions >= DAILY_TARGET).length;
  const monthLabel = current.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="self-start rounded-2xl border border-[#d7e3e1] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="interview-question-calendar-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#08787b]" aria-hidden="true" />
            <h2 id="interview-question-calendar-title" className="text-sm font-bold uppercase tracking-wide text-[#173d3d]">Questions done</h2>
            <Info className="h-3.5 w-3.5 text-[#8aa09e]" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xs font-semibold text-[#687d80]">{monthLabel}</p>
        </div>
        <span className="rounded-full bg-[#e8f8f1] px-3 py-1 text-[10px] font-bold text-[#087457]">{DAILY_TARGET}/day target</span>
      </div>

      {!available ? (
        <p className="mt-5 rounded-xl bg-[#f5f8f7] p-4 text-xs leading-5 text-[#687d80]">{signedIn ? "Daily question activity is currently unavailable." : "Sign in to see your daily interview-question activity."}</p>
      ) : (
        <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(250px,1fr)_92px] 2xl:items-start">
          <div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-[#657c7d]">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOffset }, (_, index) => <span key={`blank-${index}`} className="aspect-square" />)}
              {days.map((day) => (
                <div key={day.key} className="group relative">
                  <div
                    title={`${day.questions}/${DAILY_TARGET} questions`}
                    aria-label={`${monthLabel} ${day.day}: ${day.questions} of ${DAILY_TARGET} questions`}
                    className={`flex aspect-square min-h-8 items-center justify-center rounded-lg border text-[10px] font-bold ${day.future ? "border-[#f1f4f4] bg-[#f7f9f9] text-[#bdc8c7]" : heatClass(day.questions)}`}
                  >
                    {day.day}
                  </div>
                  {!day.future && <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#042724] px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block">{day.questions}/{DAILY_TARGET} questions</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 2xl:block 2xl:space-y-4">
            <div><p className="text-[10px] font-bold text-[#8a9c9d]">7-day average</p><p className="mt-1 text-xl font-bold text-[#173d3d]">{average}/day</p></div>
            <div><p className="text-[10px] font-bold text-[#8a9c9d]">On target</p><p className="mt-1 text-xl font-bold text-[#087457]">{daysOnTarget}/{recent.length || 7}</p></div>
            <div className="col-span-2 flex items-center gap-1.5 2xl:pt-1" aria-label="Activity colour scale">
              {[0, 1, 3, 4, 5].map((questions) => <span key={questions} className={`h-3 w-5 rounded ${heatClass(questions).split(" ").find((name) => name.startsWith("bg-"))}`} />)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
