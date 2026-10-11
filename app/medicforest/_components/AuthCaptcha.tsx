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

/** Supabase validates the single-use token, including direct Auth API calls. */
export function AuthCaptcha({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);
  const render = useCallback(() => {
    if (!container.current || !window.turnstile || widget.current !== null) return;
    widget.current = window.turnstile.render(container.current, {
      sitekey: authCaptchaSiteKey,
      theme: "auto",
      size: "flexible",
      appearance: "interaction-only",
      callback: (token: string) => { setError(false); setVerified(true); onToken(token); },
      "expired-callback": () => { setVerified(false); onToken(""); },
      "timeout-callback": () => { setVerified(false); onToken(""); },
      "error-callback": () => { setVerified(false); onToken(""); setError(true); },
    });
  }, [onToken]);

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
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={render} onError={() => setError(true)} />
      <div ref={container} />
      {!verified && !error && <p role="status" className="text-xs text-slate-600">Checking your browser before continuing…</p>}
      {error && (
        <div role="alert" className="space-y-2 text-sm text-red-700">
          <p>Verification could not complete. Check your connection and allow challenges.cloudflare.com.</p>
          <button type="button" className="underline" onClick={() => {
            setError(false);
            if (widget.current !== null) window.turnstile?.reset(widget.current);
            else window.location.reload();
          }}>Retry verification</button>
        </div>
      )}
    </div>
  );
}
