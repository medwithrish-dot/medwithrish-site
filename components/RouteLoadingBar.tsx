"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function getInternalLinkTarget(event: MouseEvent) {
  if (event.defaultPrevented || isModifiedClick(event)) return null;

  const target = event.target as Element | null;
  const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const nextUrl = new URL(anchor.href, window.location.href);
  const currentUrl = new URL(window.location.href);

  if (nextUrl.origin !== currentUrl.origin) return null;
  if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
    return null;
  }

  return nextUrl;
}

export default function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const loadingRef = useRef(false);
  const targetRouteRef = useRef<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crawlTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function startLoading(event: MouseEvent) {
      const nextUrl = getInternalLinkTarget(event);
      if (!nextUrl) return;

      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (crawlTimer.current) clearInterval(crawlTimer.current);

      targetRouteRef.current = `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`;
      loadingRef.current = true;
      setIsLoading(true);
      setProgress(12);

      requestAnimationFrame(() => setProgress(42));
      crawlTimer.current = setInterval(() => {
        setProgress((current) => {
          if (current >= 88) return current;
          return current + Math.max(2, (90 - current) * 0.08);
        });
      }, 220);
    }

    document.addEventListener("click", startLoading, true);
    return () => {
      document.removeEventListener("click", startLoading, true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (crawlTimer.current) clearInterval(crawlTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!loadingRef.current || targetRouteRef.current !== routeKey) return;

    if (crawlTimer.current) clearInterval(crawlTimer.current);
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      loadingRef.current = false;
      targetRouteRef.current = null;
      setIsLoading(false);
      setProgress(0);
    }, 260);
  }, [routeKey]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 transition-opacity duration-150 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full origin-left rounded-r-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-400 shadow-[0_0_18px_rgba(37,99,235,0.5)] transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
