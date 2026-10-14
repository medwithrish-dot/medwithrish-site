"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const changeEvent = "medicforest:review-storage";
const temporaryValues = new Map<string, string>();

// A stable string snapshot keeps hydration consistent and supports other tabs.
function snapshot(key: string | null) {
  if (!key) return "memory:";
  if (temporaryValues.has(key)) return `memory:${temporaryValues.get(key)}`;
  try { return `saved:${localStorage.getItem(key) ?? ""}`; }
  catch { return "memory:"; }
}

export function useReviewStorage(key: string | null) {
  const [previewValue, setPreviewValue] = useState("");
  const subscribe = useCallback((notify: () => void) => {
    const changed = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== null && event.key !== key) return;
      notify();
    };
    window.addEventListener(changeEvent, changed);
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener(changeEvent, changed);
      window.removeEventListener("storage", changed);
    };
  }, [key]);
  const getSnapshot = useCallback(() => snapshot(key), [key]);
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => "saved:");
  const setValue = useCallback((value: string) => {
    if (!key) { setPreviewValue(value); return; }
    try {
      localStorage.setItem(key, value);
      temporaryValues.delete(key);
    } catch { temporaryValues.set(key, value); }
    window.dispatchEvent(new Event(changeEvent));
  }, [key]);
  return { value: key ? stored.slice(stored.indexOf(":") + 1) : previewValue, setValue, saved: Boolean(key) && stored.startsWith("saved:") };
}
