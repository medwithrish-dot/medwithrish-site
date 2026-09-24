// Keep the SQL equivalent in medicforest_interview_name_moderation.sql in sync.
// The database tests run the same real-name/evasion corpus through both versions.
const LOOKALIKES = "01345789@$!|аɑαеεёіιıоοрρсϲуυхχѕτтνκкς";
const REPLACEMENTS = "oieastbgasiiaaaeeeiiiooppccyuxxsttvkkc";
const SAFE_WORDS = new Set(["scunthorpe", "shital", "shitara", "slutsky", "slutskaya"]);
const STRONG_PATTERN = /f+u+c+k+|s+h+i+t+|b+i+t+c+h+|c+u+n+t+|w+a+n+k+|t+w+a+t+|b+o+l+l+o+c+k+|b+a+s+t+a+r+d+|a+s+s+h+o+l+e+|a+r+s+e+h+o+l+e+|d+i+c+k+h+e+a+d+|c+o+c+k+s+u+c+k+|s+l+u+t+|w+h+o+r+e+|n+i+g+g+(e+r+|a+)|f+a+g+g+o+t+|r+e+t+a+r+d+/;
const WORD_PATTERN = /^(ass|arse|dick|cock|piss|fag|paki|kike|chink|spic|porn|tits|cum|semen|penis|vagina)(s|ing|er)?$/;

function moderationWords(value: string): string[] {
  const folded = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const mapped = Array.from(folded, (letter) => {
    const index = LOOKALIKES.indexOf(letter);
    return index < 0 ? letter : REPLACEMENTS[index];
  }).join("");
  return mapped.split(/[^a-z]+/).filter((word) => word && !SAFE_WORDS.has(word));
}

export function containsPublicNameProfanity(value: string): boolean {
  const words = moderationWords(value);
  const compact = words.join("");
  return STRONG_PATTERN.test(compact) || WORD_PATTERN.test(compact) || words.some((word) => WORD_PATTERN.test(word));
}

export function publicNameError(value: string): string | null {
  const name = value.trim();
  if (Array.from(name).length < 2 || Array.from(name).length > 32 || !/^[\p{L}\p{M}\p{N} ._'’\-]+$/u.test(name) || !/\p{L}/u.test(name)) {
    return "Use 2–32 letters, numbers, spaces, dots, apostrophes, hyphens or underscores, including at least one letter.";
  }
  if (containsPublicNameProfanity(name)) return "Choose a nickname without profanity or offensive language.";
  return null;
}

export function safePublicName(value: string, fallback = "Candidate"): string {
  return publicNameError(value) ? fallback : value;
}
