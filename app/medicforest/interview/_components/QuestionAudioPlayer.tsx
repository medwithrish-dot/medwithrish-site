"use client";

import { useState } from "react";
import { getInterviewQuestionAudioSrc, type InterviewerVoice } from "../_lib/interview-question-audio";

export function QuestionAudioPlayer({ questionId, text }: { questionId: string; text: string }) {
  const [voice, setVoice] = useState<InterviewerVoice>("female");
  const src = getInterviewQuestionAudioSrc(questionId, text, voice);
  if (!src) return null;
  return <div className="mt-4 flex flex-wrap items-center gap-3">
    <label className="text-xs font-semibold text-[#4a6370]">Read question aloud
      <select value={voice} onChange={(event) => setVoice(event.target.value as InterviewerVoice)} className="ml-2 rounded-lg border border-[#b9dcda] bg-white px-2 py-1">
        <option value="female">Female voice</option><option value="male">Male voice</option>
      </select>
    </label>
    <audio key={src} src={src} controls preload="none" aria-label="Recorded interview question" className="h-9 max-w-full" />
  </div>;
}
