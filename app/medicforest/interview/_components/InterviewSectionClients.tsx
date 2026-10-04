"use client";

import dynamic from "next/dynamic";

function LoadingSection() {
  return <p role="status" className="p-6 text-sm text-[#526b72]">Loading your interview section?</p>;
}

// Server components stay in the route; interactive sections get separate bundles.
export const InterviewQuestionBankDashboard = dynamic(() => import("./InterviewQuestionBankDashboard").then(module => module.InterviewQuestionBankDashboard), { loading: LoadingSection });
export const AIInterviewRunner = dynamic(() => import("./AIInterviewRunner").then(module => module.AIInterviewRunner), { loading: LoadingSection });
export const InterviewGroups = dynamic(() => import("./InterviewGroups").then(module => module.InterviewGroups), { loading: LoadingSection });
export const InterviewLeaderboard = dynamic(() => import("./InterviewLeaderboard").then(module => module.InterviewLeaderboard), { loading: LoadingSection });
export const InterviewGuides = dynamic(() => import("./InterviewGuides").then(module => module.InterviewGuides), { loading: LoadingSection });
