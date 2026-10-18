/** Only allowlisted metadata is logged; provider messages may contain secrets or user data. */
export function providerStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return;
  const value = error as { status?: unknown; statusCode?: unknown };
  const status = value.status ?? value.statusCode;
  return typeof status === "number" && Number.isInteger(status) && status >= 400 && status <= 599 ? status : undefined;
}

export function logProviderFailure(provider: string, operation: string, error: unknown) {
  console.error("provider_request_failed", { provider, operation, status: providerStatus(error) });
}

export function isTemporaryProviderFailure(error: unknown) {
  const status = providerStatus(error);
  if (status === 429 || (status !== undefined && status >= 500)) return true;
  const name = error && typeof error === "object" && "name" in error ? error.name : null;
  return typeof name === "string" && ["TimeoutError", "AbortError", "StripeConnectionError", "APIConnectionError", "APIConnectionTimeoutError", "AuthRetryableFetchError"].includes(name);
}

export function providerUnavailable(error: unknown, message: string) {
  const temporary = isTemporaryProviderFailure(error);
  return Response.json({ error: message }, {
    status: temporary ? 503 : 502,
    headers: { "Cache-Control": "private, no-store", "Retry-After": "30" },
  });
}
