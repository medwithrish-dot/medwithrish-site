// Generate missing dentistry recordings, or regenerate files flagged by the audit.
// node scripts/generate-dentistry-audio.mjs [--audit path/to/report.json]
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { config } from "dotenv";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local"), quiet: true });
const require = createRequire(import.meta.url);
const modules = new Map();
function load(file) {
  const filename = file.endsWith(".ts") ? file : `${file}.ts`;
  if (modules.has(filename)) return modules.get(filename).exports;
  const loaded = { exports: {} };
  modules.set(filename, loaded);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(name => name.startsWith(".") ? load(resolve(dirname(filename), name)) : require(name), loaded, loaded.exports);
  return loaded.exports;
}
const { DENTISTRY_QUESTIONS } = load(resolve(root, "app/medicforest/interview/_data/dentistry-question-bank"));
const voices = { female: "en-GB-Chirp3-HD-Aoede", male: "en-GB-Chirp3-HD-Charon" };
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--audit")) throw new Error("Usage: generate-dentistry-audio.mjs [--audit report.json]");
const flagged = args.length ? new Set(JSON.parse(readFileSync(args[1], "utf8")).filter(row => row.flags.length).map(row => row.file)) : null;
const tasks = DENTISTRY_QUESTIONS.flatMap(question => Object.keys(voices).map(voice => ({
  question, voice, file: `public/audio/${voice}/${question.id}.mp3`,
}))).filter(task => flagged ? flagged.has(task.file) : !existsSync(resolve(root, task.file)));
const raw = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON;
const credentials = raw ? JSON.parse(raw) : undefined;
if (credentials?.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
const client = new TextToSpeechClient(credentials ? { credentials } : {});
let cursor = 0;
let completed = 0;
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    let audio;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [response] = await client.synthesizeSpeech({
          input: { text: task.question.text.replace(/(?<=\w)-(?=\w)/g, " ") },
          voice: { languageCode: "en-GB", name: voices[task.voice] },
          audioConfig: { audioEncoding: "MP3" },
        }, { timeout: 30_000, retry: null });
        if (!response.audioContent?.length) throw new Error("Empty recording");
        audio = response.audioContent;
        break;
      } catch (error) {
        if (attempt === 2 || ![4, 8, 13, 14, 429, 503].includes(error.code)) throw new Error(`Speech generation failed for ${task.voice}/${task.question.id} (code ${error.code ?? "unknown"})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
      }
    }
    const target = resolve(root, task.file);
    const staged = resolve(root, `.next/dentistry-audio/${task.voice}/${task.question.id}.mp3`);
    mkdirSync(dirname(staged), { recursive: true });
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(staged, audio);
    renameSync(staged, target);
    console.log(`${++completed}/${tasks.length} generated ${task.voice}/${task.question.id}`);
  }
}
await Promise.all([worker(), worker()]);
console.log(`Finished: ${completed} dentistry recordings generated.`);
