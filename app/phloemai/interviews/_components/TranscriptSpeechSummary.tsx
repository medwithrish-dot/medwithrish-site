import { getTranscriptHints } from "../_lib/speech-delivery";

export function TranscriptSpeechSummary({ transcript }: { transcript: string }) {
  const hints = getTranscriptHints(transcript);
  return <div data-speech-summary className="rounded-lg border border-[#dbe5e5] bg-[#f8fbfa] px-3 py-2 text-xs leading-5 text-[#536c70]">
    <p><strong>Detected in transcript:</strong> {hints.pauseCount} pauses · {hints.fillerCount} fillers · {hints.repetitionCount} repetitions</p>
    <p className="text-[10px] leading-4 text-[#728487]">Pauses of 3s+ appear as [3s pause]; captured fillers as [um]. Repeated words and sounds are kept. Recognition can omit sounds; these counts are not a stutter assessment and do not affect your score.</p>
  </div>;
}
