export const MEDICFOREST_PREVIEW_COOKIE = "medicforest_preview_access";
export const MEDICFOREST_PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const TOKEN_PREFIX = "medicforest-preview:v1:";

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

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createMedicForestPreviewToken() {
  const secret = getMedicForestPreviewSecret();
  if (!secret) return "";

  return sha256(`${TOKEN_PREFIX}${secret}`);
}

export async function isValidMedicForestPreviewToken(token?: string) {
  if (!token) return false;

  const expectedToken = await createMedicForestPreviewToken();
  if (!expectedToken) return false;

  return constantTimeEquals(token, expectedToken);
}
