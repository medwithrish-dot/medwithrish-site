import type { SpeechDelivery } from "../_lib/speech-delivery";

export function SpeechDeliveryHints({ hints }: { hints: SpeechDelivery }) {
  if (!hints.speed && !hints.manyTranscriptionErrors && !hints.manyPausesOrRepetitions) return null;
  return <div className="rounded-xl border border-[#dbe5e5] bg-[#f8fbfa] px-4 py-3 text-xs leading-6 text-[#536c70]" aria-label="Speech coaching">
    {hints.speed && <p title={`Approximately ${hints.wordsPerSevenSeconds} words in the most recent 7 seconds of your answer.`}><span className="font-semibold">Talking speed: {hints.speed}</span> · Control anxiety and talking speed</p>}
    {hints.manyTranscriptionErrors && <p><span className="font-semibold">Possible transcription errors</span> · Talk clearly and check the transcript</p>}
    {hints.manyPausesOrRepetitions && <p><span className="font-semibold">Speech: many pauses or repeated sounds</span> · Take your time and steady your speech</p>}
    <p className="mt-1 text-[10px] leading-4 text-[#728487]">Approximate coaching only · does not affect your score</p>
  </div>;
}
