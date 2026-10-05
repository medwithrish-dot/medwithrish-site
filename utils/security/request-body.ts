export class RequestBodyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function readLimitedText(request: Request, maxBytes = 45_000) {
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) throw new RequestBodyError("Request body is too large.", 413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const deadline = Date.now() + 10_000;
  try {
    while (true) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const result = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new RequestBodyError("Request body timed out.", 408)), Math.max(1, deadline - Date.now()));
        }),
      ]).finally(() => { if (timer) clearTimeout(timer); });
      if (result.done) break;
      size += result.value.byteLength;
      if (size > maxBytes) throw new RequestBodyError("Request body is too large.", 413);
      chunks.push(result.value);
    }
  } catch (error) {
    void reader.cancel().catch(() => undefined);
    throw error;
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
