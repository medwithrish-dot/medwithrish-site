/** Compare words locally so the model only returns one plain-text rewrite. */
export function highlightAnswerChanges(original: string, rewritten: string) {
  const tokens = (text: string) => text.match(/\s+|[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\s]/gu) ?? [];
  const before = tokens(original).filter(token => token.trim());
  const after = tokens(rewritten);
  const words = after.map((text, index) => ({ text, index })).filter(token => token.text.trim());
  const width = words.length + 1;
  const table = new Uint16Array((before.length + 1) * width);
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = words.length - 1; j >= 0; j--) {
      table[i * width + j] = before[i] === words[j].text
        ? 1 + table[(i + 1) * width + j + 1]
        : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const preserved = new Set<number>();
  let i = 0; let j = 0;
  while (i < before.length && j < words.length) {
    if (before[i] === words[j].text) { preserved.add(words[j].index); i++; j++; }
    else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) i++;
    else j++;
  }
  const parts: { text: string; added: boolean }[] = [];
  after.forEach((text, index) => {
    const added = text.trim() ? !preserved.has(index) : parts.at(-1)?.added ?? false;
    if (parts.at(-1)?.added === added) parts[parts.length - 1].text += text;
    else parts.push({ text, added });
  });
  return parts;
}

export const TRANSCRIPTION_WARNING = "Some of your words needed substantial transcription corrections or were hard to understand. The transcript may be inaccurate, especially if the microphone did not pick up clear speech. Check it against what you meant; try speaking a little more clearly or adjust your microphone. This warning does not lower your score.";
