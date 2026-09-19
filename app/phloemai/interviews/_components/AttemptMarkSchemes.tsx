"use client";

import { useState, type ReactNode } from "react";
import type { InterviewAttempt } from "../_lib/interview-types";
import { findReviewQuestion, getQuestionMarkScheme } from "../_lib/question-review";
import { getStationReviewGuidance } from "../_lib/station-review";
import { getQuestionStimulus } from "../_data/interview-stimuli";
import { StationMarkScheme } from "./InterviewMarkScheme";
import { InterviewStimulus } from "./InterviewStimulus";

export function AttemptMarkSchemes({ attempt, headerAction }: { attempt: InterviewAttempt; headerAction?: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const questions = attempt.questions.flatMap((text, index) => {
    const question = findReviewQuestion(attempt.questionIds?.[index], text);
    return question ? [{ question, text, index }] : [];
  });
  const current = questions[selected] ?? questions[0];
  if (!current) {
    const legacy = getStationReviewGuidance(attempt.stationSlug);
    return legacy ? <><p className="mb-3 text-sm text-slate-600">General station guidance for this older set of questions.</p><StationMarkScheme rubricGroups={legacy.rubric} headerAction={headerAction} /></> : <><p>No markscheme is available for this saved station.</p>{headerAction}</>;
  }
  const stimulus = getQuestionStimulus(current.question.id);
  return <div className="space-y-4">
    <label className="block text-sm font-bold text-[#153e4c]">Question markscheme
      <select value={Math.min(selected, questions.length - 1)} onChange={(event) => setSelected(Number(event.target.value))} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm">
        {questions.map((item, index) => <option key={`${item.index}:${item.question.id}`} value={index}>Question {item.index + 1}: {item.text}</option>)}
      </select>
    </label>
    <p className="text-sm leading-6 text-[#153e4c]">{current.text}</p>
    {stimulus && <InterviewStimulus key={stimulus.id} stimulus={stimulus} question={current.text} />}
    <StationMarkScheme key={current.question.id} rubricGroups={getQuestionMarkScheme(current.question)} headerAction={headerAction} />
  </div>;
}
