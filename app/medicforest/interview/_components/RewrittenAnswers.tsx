import type { InterviewAnswer, InterviewFeedback } from "../_lib/interview-types";
import { highlightAnswerChanges } from "../_lib/answer-rewrite";
import { stripSpeechPauseMarkers } from "../_lib/speech-delivery";

export function RewrittenAnswers({ feedback, answers }: { feedback: InterviewFeedback; answers: InterviewAnswer[] }) {
  if (!feedback.rewrittenAnswers?.length) return null;
  return <details className="mt-5 rounded-xl border border-[#d9e6e1] bg-white p-5">
    <summary className="cursor-pointer text-sm font-bold text-[#042724]">Show rewritten version</summary>
    <p className="mt-3 text-sm leading-6 text-[#526b72]">Your preserved wording is black. Added or changed wording is green and underlined. Use this as a practice example, and fill in any brackets with your own experience.</p>
    {feedback.rewrittenAnswers.map(({ answerIndex, text }) => {
      const answer = answers[answerIndex];
      if (!answer) return null;
      return <div key={answerIndex} className="mt-4">
        <h3 className="text-sm font-bold text-[#042724]">{answer.question}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-black">{highlightAnswerChanges(stripSpeechPauseMarkers(answer.answer), text).map((part, index) =>
          part.added ? <ins key={index} className="text-[#15803d] decoration-[#15803d]/40 underline-offset-4">{part.text}</ins> : <span key={index}>{part.text}</span>)}</p>
      </div>;
    })}
    <p className="mt-4 text-xs leading-5 text-[#62777e]">Your score is based on your submitted answer. This example does not guarantee a particular mark.</p>
  </details>;
}
