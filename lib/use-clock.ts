"use client";

import { useSyncExternalStore } from "react";

const STEP = 10_000;
let snapshot = 0;

function getSnapshot() {
  const t = Math.floor(Date.now() / STEP) * STEP;
  if (t !== snapshot) snapshot = t;
  return snapshot;
}

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}

/** The current time to the nearest ten seconds; null while server rendering. */
export function useNow(): Date | null {
  const t = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return t === 0 ? null : new Date(t);
}

export function formatClock(now: Date | null) {
  if (!now) return { day: "", time: "--:--", date: "" };
  return {
    day: now.toLocaleDateString("en-US", { weekday: "long" }),
    time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
  };
}
