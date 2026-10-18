import { logProviderFailure } from "@/utils/security/provider-failure";

/** Bound every server request, preserving tighter caller deadlines. Never retry writes. */
export const serverSupabaseFetch: typeof fetch = async (input, init) => {
  const inherited = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const timeout = AbortSignal.timeout(8_000);
  const signal = inherited ? AbortSignal.any([inherited, timeout]) : timeout;
  try {
    const response = await fetch(input, { ...init, signal });
    if (response.status === 429 || response.status >= 500) {
      logProviderFailure("supabase", "request", { status: response.status });
    }
    return response;
  } catch (error) {
    logProviderFailure("supabase", "request", error);
    throw error;
  }
};
