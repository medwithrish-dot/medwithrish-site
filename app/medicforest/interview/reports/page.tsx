import { InterviewShell } from "../_components/InterviewShell";
import { InterviewHistoryViews } from "../_components/InterviewHistoryViews";

export const metadata = { title: "Med Interview reports | MedicForest" };
export default function Page() {
  return <InterviewShell title="A clearer picture of your progress." subtitle="Your answers, feedback and next steps, saved in one place." activeLabel="Reports"><InterviewHistoryViews /></InterviewShell>;
}
