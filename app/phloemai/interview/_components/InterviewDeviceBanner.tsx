"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import styles from "./InterviewDeviceBanner.module.css";

const storageKey = "phloem-interview-desktop-notice-dismissed";
const changeEvent = "phloem-interview-desktop-notice-change";
let dismissedInMemory = false;

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function isDismissed() {
  try {
    return dismissedInMemory || window.sessionStorage.getItem(storageKey) === "true";
  } catch {
    return dismissedInMemory;
  }
}

export function InterviewDeviceBanner() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  if (dismissed) return null;

  return <aside className={styles.banner} aria-label="Device recommendation">
    <span>Use desktop for the best experience</span>
    <button type="button" aria-label="Dismiss desktop recommendation" onClick={() => {
      dismissedInMemory = true;
      try { window.sessionStorage.setItem(storageKey, "true"); } catch { /* Keep dismissal for this visit when storage is unavailable. */ }
      window.dispatchEvent(new Event(changeEvent));
    }}><X size={16} aria-hidden="true" /></button>
  </aside>;
}
