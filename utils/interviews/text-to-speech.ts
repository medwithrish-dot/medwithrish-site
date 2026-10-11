import "server-only";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

const VOICES = {
  female: "en-GB-Chirp3-HD-Aoede",
  male: "en-GB-Chirp3-HD-Charon",
} as const;

type InterviewerVoice = keyof typeof VOICES;

let client: TextToSpeechClient | null = null;
// Replays and concurrent requests reuse audio within this server process. Keep
// the cache small and short-lived; no candidate answers are stored here.
const audioCache = new Map<string, { expiresAt: number; audio: Promise<Buffer> }>();
const CACHE_TTL_MS = 15 * 60_000;
const CACHE_LIMIT = 64;

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
  if (!interviewTextToSpeechConfigured()) throw new Error("Med Interview text-to-speech is not enabled");
  if (!text.trim() || text.length > 500) throw new Error("Med Interview speech text is invalid");
  const key = `${voice}:${text}`;
  const now = Date.now();
  for (const [savedKey, saved] of audioCache) {
    if (saved.expiresAt <= now) audioCache.delete(savedKey);
  }
  const cached = audioCache.get(key);
  if (cached) return cached.audio;
  if (audioCache.size >= CACHE_LIMIT) audioCache.delete(audioCache.keys().next().value!);
  const audio = generateSpeech(text, voice);
  audioCache.set(key, { expiresAt: now + CACHE_TTL_MS, audio });
  try { return await audio; } catch (error) {
    if (audioCache.get(key)?.audio === audio) audioCache.delete(key);
    throw error;
  }
}

async function generateSpeech(text: string, voice: InterviewerVoice) {
  const [response] = await speechClient().synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-GB", name: VOICES[voice] },
    audioConfig: { audioEncoding: "MP3" },
  }, { timeout: 4_000, retry: null });
  if (!response.audioContent) throw new Error("Google Cloud returned no Med interview audio");
  return Buffer.isBuffer(response.audioContent)
    ? response.audioContent
    : Buffer.from(response.audioContent as Uint8Array);
}
