import "server-only";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

const VOICES = {
  female: "en-GB-Chirp3-HD-Aoede",
  male: "en-GB-Chirp3-HD-Charon",
} as const;

type InterviewerVoice = keyof typeof VOICES;

let client: TextToSpeechClient | null = null;

function serviceAccountCredentials() {
  const raw = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON;
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
    if (!parsed.client_email || !parsed.private_key) throw new Error("missing fields");
    return { client_email: parsed.client_email, private_key: parsed.private_key.replace(/\\n/g, "\n") };
  } catch {
    throw new Error("GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON is not valid service-account JSON");
  }
}

function speechClient() {
  if (client) return client;
  const credentials = serviceAccountCredentials();
  client = new TextToSpeechClient({
    ...(credentials ? { credentials } : {}),
    ...(process.env.GOOGLE_CLOUD_PROJECT ? { projectId: process.env.GOOGLE_CLOUD_PROJECT } : {}),
  });
  return client;
}

export function interviewTextToSpeechConfigured() {
  return process.env.INTERVIEW_GOOGLE_TTS_ENABLED === "true";
}

export async function synthesizeInterviewSpeech(text: string, voice: InterviewerVoice) {
  if (!interviewTextToSpeechConfigured()) throw new Error("Interview text-to-speech is not enabled");
  if (!text.trim() || text.length > 500) throw new Error("Interview speech text is invalid");
  const [response] = await speechClient().synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-GB", name: VOICES[voice] },
    audioConfig: { audioEncoding: "MP3" },
  });
  if (!response.audioContent) throw new Error("Google Cloud returned no interview audio");
  return Buffer.isBuffer(response.audioContent)
    ? response.audioContent
    : Buffer.from(response.audioContent as Uint8Array);
}
