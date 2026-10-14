// Refresh the data-station recordings without changing any existing audio IDs.
// Requires Google Cloud Text-to-Speech credentials, as the other audio scripts do.
import { readFileSync, writeFileSync, mkdirSync, renameSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function load(file) {
  const filename = file.endsWith(".ts") ? file : `${file}.ts`;
  if (modules.has(filename)) return modules.get(filename).exports;
  const loaded = { exports: {} };
  modules.set(filename, loaded);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(name => load(resolve(dirname(filename), name)), loaded, loaded.exports);
  return loaded.exports;
}
const { INTERVIEW_QUESTIONS } = load(resolve(root, "app/medicforest/interview/_data/interviewQuestionBank"));
const { DATA_INTERPRETATION_STATION_QUESTIONS } = load(resolve(root, "app/medicforest/interview/_data/data-interpretation-station"));
const { getInterviewQuestionAudioSrc } = load(resolve(root, "app/medicforest/interview/_lib/interview-question-audio"));
const allQuestions = [...INTERVIEW_QUESTIONS.filter(question => question.sourceSection === 18), ...DATA_INTERPRETATION_STATION_QUESTIONS];
const requested = new Set(process.argv.slice(2));
if ([...requested].some(id => !allQuestions.some(question => question.id === id))) throw new Error("Choose an existing data-question ID.");
const questions = allQuestions.filter(question => !requested.size || requested.has(question.id));
const voices = { female: "en-GB-Chirp3-HD-Aoede", male: "en-GB-Chirp3-HD-Charon" };
const client = new TextToSpeechClient();
const generated = [];
const updatedTexts = new Map();
for (const question of questions) {
  for (const [voice, name] of Object.entries(voices)) {
    const src = getInterviewQuestionAudioSrc(question.id, question.text, voice);
    if (!src) throw new Error(`Missing recording ID for ${question.id}`);
    const [response] = await client.synthesizeSpeech({ input: { text: question.text.replace(/(?<=\w)-(?=\w)/g, " ") }, voice: { languageCode: "en-GB", name }, audioConfig: { audioEncoding: "MP3" } }, { timeout: 30000, retry: null });
    if (!response.audioContent?.length) throw new Error(`Empty recording for ${question.id}`);
    // Stage the complete set before replacing recordings or their CSV manifest.
    const staged = resolve(root, `.next/data-audio/${voice}/${question.id}.mp3`);
    mkdirSync(dirname(staged), { recursive: true });
    writeFileSync(staged, response.audioContent);
    generated.push({ staged, target: resolve(root, `public${src}`) });
    updatedTexts.set(Number(/q(\d+)\.mp3$/.exec(src)[1]), question.text);
    console.log(`Prepared ${voice} ${question.id}`);
  }
}
const csvPath = resolve(root, "scripts/questions.csv");
const csv = readFileSync(csvPath, "utf8").replace(/^(\d+),"(?:[^"\r\n]|"")*"\r?$/gm, (row, id) => updatedTexts.has(Number(id)) ? `${id},"${updatedTexts.get(Number(id)).replaceAll('"', '""')}"` : row);
for (const { staged, target } of generated) renameSync(staged, target);
writeFileSync(csvPath, csv);
console.log(`Updated ${generated.length} recordings and their text manifest.`);
