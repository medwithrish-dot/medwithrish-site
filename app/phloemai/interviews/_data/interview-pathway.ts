import { INTERVIEW_PATHWAY, pathwayTaskId, type PathwayStation } from "../../../../utils/interviews/pathway";
import { interviewGuides } from "./interviewGuides";
import { INTERVIEW_QUESTIONS } from "./interviewQuestionBank";

// Resolve the large content libraries on the server and send only these selected links.
export function getInterviewPathwayStations(): PathwayStation[] {
  return INTERVIEW_PATHWAY.map((station) => ({
    id: station.id, title: station.title, description: station.description, readiness: station.readiness,
    tasks: [
      ...station.guides.map((slug) => {
        const guide = interviewGuides.find((entry) => entry.slug === slug);
        if (!guide) throw new Error(`Missing pathway guide: ${slug}`);
        return { id: pathwayTaskId(station.id, "guide", slug), kind: "guide" as const, title: guide.title, href: `/phloemai/interviews/guides/${slug}` };
      }),
      ...station.questions.map((id) => {
        const question = INTERVIEW_QUESTIONS.find((entry) => entry.id === id);
        if (!question) throw new Error(`Missing pathway question: ${id}`);
        return { id: pathwayTaskId(station.id, "question", id), kind: "question" as const, title: question.text, href: `/phloemai/interviews/question-bank?question=${encodeURIComponent(id)}` };
      }),
    ],
  }));
}
