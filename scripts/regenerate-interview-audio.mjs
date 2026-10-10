// Regenerate only files flagged by audit-interview-audio.py using the existing voices.
// Usage: node scripts/regenerate-interview-audio.mjs <audit.json>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const csv = fs.readFileSync(path.join(__dirname, 'questions.csv'), 'utf8');
const questions = new Map([...csv.matchAll(/^(\d+),"((?:[^"\r\n]|"")*)"\r?$/gm)].map(m=>[Number(m[1]), m[2].replaceAll('""','"')]));
const voices = {female:'en-GB-Chirp3-HD-Aoede',male:'en-GB-Chirp3-HD-Charon'};
(async () => {
 const rows = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).filter(row=>row.flags.length);
 const client = new TextToSpeechClient();
 for (const row of rows) {
  const match = /^public\/audio\/(female|male)\/q(\d+)\.mp3$/.exec(row.file);
  if (!match || !questions.has(Number(match[2]))) throw new Error(`Invalid audit entry: ${row.file}`);
  // Read hyphenated words naturally; this also avoids cached defective renders.
  const text = questions.get(Number(match[2])).replace(/(?<=\w)-(?=\w)/g, ' ');
  const [response] = await client.synthesizeSpeech({input:{text}, voice:{languageCode:'en-GB',name:voices[match[1]]},audioConfig:{audioEncoding:'MP3'}},{timeout:30000,retry:null});
  if (!response.audioContent?.length) throw new Error('Empty generated audio');
  fs.writeFileSync(path.join(root,row.file),response.audioContent);
  console.log(`Regenerated ${row.file}`);
 }
})().catch(error=>{console.error(error.message);process.exitCode=1});
