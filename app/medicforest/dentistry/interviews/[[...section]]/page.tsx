import { InterviewPreparationViews } from "../../../interview/_components/InterviewPreparationViews";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "@/app/medicforest/_components/MedicForestLink";
import { InterviewShell } from "../../../interview/_components/InterviewShell";
import { InterviewDashboard } from "../../../interview/_components/InterviewDashboard";
import { InterviewHistoryViews } from "../../../interview/_components/InterviewHistoryViews";
import { InterviewReport } from "../../../interview/_components/InterviewReport";
import { AIInterviewRunner, InterviewQuestionBankDashboard } from "../../../interview/_components/InterviewSectionClients";
import { UniversityCatalogue } from "../../../interview/universities/UniversityCatalogue";
import { DentistryPathway } from "../../../interview/_components/DentistryPathway";
import { DentistryGuideViews } from "../../../interview/_components/DentistryGuideViews";
import { DENTISTRY_GUIDES } from "../../../interview/_data/dentistry-guides";
import { dentistryUniversities } from "../../../interview/_data/dentistry-universities";
import { getInterviewDashboardData } from "@/utils/interviews/dashboard-data";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { DENTISTRY_STATIONS } from "../../../interview/_data/dentistry-question-bank";

type Props = { params: Promise<{ section?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const pages: Record<string, [string, string, string]> = {
  dashboard: ["Make your next answer count.", "Your dentistry preparation, practice and feedback in one place.", "Dashboard"],
  "question-bank": ["Dentistry question bank", "Practise clear answers with question-specific markschemes.", "Question Bank"],
  "ai-interviews": ["Dentistry AI interviews", "Build a focused station or a dental school practice circuit. AI interviews require Premium.", "AI Interviews"],
  universities: ["Prepare for your dental school", "Explore official sources and build a balanced rehearsal. Follow your interview invitation for the actual format.", "AI Interviews"],
  guides: ["Dentistry interview guides", "Practical preparation for the parts an online interview cannot assess.", "Guides"],
  plan: ["One topic at a time.", "Use your saved question progress to work through the dentistry topics. Practise physical skills away from the screen.", "Plan"],
  progress: ["Your dentistry progress", "Your dentistry answers and feedback, kept together.", "Progress"],
  notifications: ["Your dentistry updates", "Pick up a station or review your feedback.", "Dashboard"],
  reports: ["Your saved dentistry interviews", "Resume a station or review your answers and feedback.", "Reports"],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parts = (await params).section ?? ["dashboard"];
  const config = pages[parts[0]];
  if (!config) notFound();
  return { title: `${config[0]} | MedicForest`, description: config[1], alternates: { canonical: `/dentistry/interviews/${parts.join("/")}` }, robots: { index: ["question-bank", "guides", "universities"].includes(parts[0]), follow: true } };
}

export default async function Page({ params, searchParams }: Props) {
  const segments = (await params).section;
  if (!segments?.length) redirect("/medicforest/dentistry/interviews/dashboard");
  const [section, detail] = segments;
  const config = pages[section];
  if (!config || segments.length > 2 || (detail && !["reports", "guides", "universities"].includes(section))) notFound();
  const search = await searchParams;
  if (section === "reports" && detail) return <InterviewReport report={detail} platform="dentistry" />;
  if (section === "question-bank") {
    const { isPremium } = await getMedicForestEntitlements();
    return <InterviewQuestionBankDashboard showPremiumCard={!isPremium} initialQuestionId={single(search.question)} initialCategoryTitle={single(search.category)} initialSubcategoryIndex={single(search.subcategory) === undefined ? undefined : Number(single(search.subcategory))} />;
  }
  let content: React.ReactNode;
  if (section === "notifications") content = <InterviewPreparationViews view="notifications" platform="dentistry" />;
  else if (section === "progress") content = <InterviewPreparationViews view="progress" platform="dentistry" />;
  else if (section === "dashboard" || section === "plan") {
    const data = await getInterviewDashboardData("dentistry");
    content = section === "plan" ? <DentistryPathway rows={data.questionProgress} /> : <InterviewDashboard platform="dentistry" data={data} pathway={{ userId: null, completedTaskIds: [], available: true, isPremium: data.isPremium }} />;
  } else if (section === "reports") content = <InterviewHistoryViews platform="dentistry" />;
  else if (section === "guides") {
    if (detail && !DENTISTRY_GUIDES.some(guide => guide.slug === detail)) notFound();
    content = <DentistryGuideViews slug={detail} />;
  } else if (section === "universities" && detail) {
    const university = dentistryUniversities.find(item => item.slug === detail);
    if (!university) notFound();
    content = <article className="max-w-3xl rounded-2xl border border-[#d7e3e1] bg-white p-6"><h2 className="text-2xl font-bold">{university.name}</h2><p className="mt-4 leading-7 text-[#526b72]">{university.timingNote}</p><h3 className="mt-6 font-bold">What to prepare</h3><ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-6 text-[#526b72]">{university.preparation.map(point => <li key={point}>{point}</li>)}</ul><a className="mt-6 block font-bold text-[#08787b] underline" href={university.sourceUrl} target="_blank" rel="noreferrer">Official dental admissions information</a><Link className="mt-6 inline-block rounded-xl bg-[#08787b] px-5 py-3 font-bold text-white" href={`/medicforest/interview/ai-interviews?university=${university.slug}`}>Set up practice</Link></article>;
  } else if (section === "universities") content = <UniversityCatalogue />;
  else if (single(search.attempt) || single(search.station) || single(search.university) || single(search.setup)) {
    const station = single(search.station);
    const university = single(search.university);
    if (station && !DENTISTRY_STATIONS.some(item => item.slug === station)) notFound();
    if (university && !dentistryUniversities.some(item => item.slug === university)) notFound();
    content = <AIInterviewRunner initialStationSlug={station} initialUniversitySlug={university} initialMockCircuit={single(search.setup) === "mock"} />;
  } else content = <><div className="rounded-2xl bg-[#042724] p-7 text-white"><h2 className="text-2xl font-bold">Practise speaking. Find your next improvement.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#bdd5d0]">Choose dentistry topics, answer aloud or type, then review your saved transcript and AI feedback. Physical dexterity is covered in the guides.</p><Link href="/medicforest/interview/ai-interviews?setup=custom" className="mt-5 inline-block rounded-xl bg-[#b9f4db] px-5 py-3 font-bold text-[#042724]">Build your interview</Link></div><UniversityCatalogue mode="practice" /></>;
  return <InterviewShell platform="dentistry" title={config[0]} subtitle={config[1]} activeLabel={config[2]}>{content}</InterviewShell>;
}
