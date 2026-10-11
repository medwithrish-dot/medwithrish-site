"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

export const authCaptchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};

declare global {
  interface Window { turnstile?: Turnstile }
}

const FAILURE_KEY = "medicforest-browser-verification-failures";
function savedFailures() {
  try { return typeof window === "undefined" ? 0 : Math.min(2, Math.max(0, Number(window.sessionStorage.getItem(FAILURE_KEY)) || 0)); }
  catch { return 0; }
}

/** Supabase validates the single-use token, including direct Auth API calls. */
export function AuthCaptcha({ onToken, signup = false }: { onToken: (token: string) => void; signup?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [failureCount, setFailureCount] = useState(savedFailures);
  const failures = useRef(failureCount);
  const failedAttempt = useRef(false);
  const fail = useCallback(() => {
    setVerified(false);
    onToken("");
    setError(true);
    // Repeated callbacks from one failed challenge count as one failure.
    if (failedAttempt.current) return;
    failedAttempt.current = true;
    failures.current = Math.min(2, Math.max(failures.current, savedFailures()) + 1);
    setFailureCount(failures.current);
    try { window.sessionStorage.setItem(FAILURE_KEY, String(failures.current)); } catch { /* Storage may be blocked. */ }
  }, [onToken]);
  const render = useCallback(() => {
    if (!container.current || !window.turnstile || widget.current !== null) return;
    widget.current = window.turnstile.render(container.current, {
      sitekey: authCaptchaSiteKey,
      theme: "auto",
      size: "flexible",
      appearance: "interaction-only",
      callback: (token: string) => {
        failedAttempt.current = false;
        failures.current = 0;
        setFailureCount(0);
        try { window.sessionStorage.removeItem(FAILURE_KEY); } catch { /* Storage may be blocked. */ }
        setError(false); setVerified(true); onToken(token);
      },
      "expired-callback": () => { setVerified(false); onToken(""); },
      "timeout-callback": fail,
      "error-callback": fail,
    });
  }, [onToken, fail]);

  useEffect(() => {
    if (authCaptchaSiteKey) render();
    return () => {
      if (widget.current !== null) window.turnstile?.remove(widget.current);
      widget.current = null;
      onToken("");
    };
  }, [render, onToken]);

  if (!authCaptchaSiteKey) return null;
  return (
    <div className="space-y-2">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={render} onError={fail} />
      <div ref={container} />
      {!verified && !error && <p role="status" className="text-xs text-slate-600">Checking your browser before continuing…</p>}
      {error && (
        <div role="alert" className="space-y-2 text-sm text-red-700">
          <p>Verification could not complete. Check your connection and allow challenges.cloudflare.com.</p>
          <button type="button" className="underline" onClick={() => {
            failedAttempt.current = false;
            setError(false);
            if (widget.current !== null) window.turnstile?.reset(widget.current);
            else window.location.reload();
          }}>Retry verification</button>
          {signup && failureCount >= 2 && (
            <p>If browser verification keeps failing and you cannot create your account, contact <a href="mailto:medwithrish@gmail.com" className="underline">medwithrish@gmail.com</a> for help.</p>
          )}
        </div>
      )}
    </div>
  );
}
