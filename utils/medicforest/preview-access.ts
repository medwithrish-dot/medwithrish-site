export const MEDICFOREST_PREVIEW_COOKIE = "medicforest_preview_access";
export const MEDICFOREST_PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const TOKEN_PREFIX = "medicforest-preview:v2:";
const TOKEN_PATTERN = /^v2\.([1-9]\d{0,12})\.([0-9a-f]{64})$/;
const CLOCK_SKEW_SECONDS = 60;

export function getMedicForestPreviewPassword() {
  return process.env.MEDICFOREST_PREVIEW_PASSWORD?.trim() ?? "";
}

function getMedicForestPreviewSecret() {
  return (
    process.env.MEDICFOREST_PREVIEW_TOKEN_SECRET?.trim() ||
    getMedicForestPreviewPassword()
  );
}

export function isMedicForestPreviewConfigured() {
  return Boolean(getMedicForestPreviewPassword() && getMedicForestPreviewSecret());
}

function constantTimeEquals(a: string, b: string) {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

async function signIssuedAt(issuedAt: number, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${TOKEN_PREFIX}${issuedAt}`)
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createMedicForestPreviewToken() {
  const secret = getMedicForestPreviewSecret();
  if (!secret) return "";

  const issuedAt = Math.floor(Date.now() / 1000);
  return `v2.${issuedAt}.${await signIssuedAt(issuedAt, secret)}`;
}

export async function isValidMedicForestPreviewToken(token?: string, now = Date.now()) {
  const match = token && TOKEN_PATTERN.exec(token);
  if (!match) return false;

  const issuedAt = Number(match[1]);
  const nowSeconds = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt > nowSeconds + CLOCK_SKEW_SECONDS ||
    nowSeconds - issuedAt > MEDICFOREST_PREVIEW_COOKIE_MAX_AGE
  ) return false;

  const secret = getMedicForestPreviewSecret();
  if (!secret) return false;

  return constantTimeEquals(match[2], await signIssuedAt(issuedAt, secret));
}
