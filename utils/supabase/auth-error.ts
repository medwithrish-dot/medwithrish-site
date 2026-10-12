/** Keep provider-wide email delivery limits distinct from a visitor's request limit. */
export function authErrorMessage(error: unknown, fallback = "Authentication failed."): string {
  const details = error && typeof error === "object"
    ? error as { code?: unknown; message?: unknown }
    : null;
  const message = typeof details?.message === "string" ? details.message : "";

  if (details?.code === "over_email_send_rate_limit" || /email rate limit exceeded/i.test(message)) {
    return "We temporarily cannot send verification emails. Please try again later. If you already verified your account, you can still log in.";
  }
  if (details?.code === "over_request_rate_limit") {
    return "Too many authentication requests. Please wait a few minutes before trying again.";
  }
  return message || fallback;
}
