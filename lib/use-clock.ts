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

/** ISO week number, as the clock panel's week column and the clock's second format show it. */
export function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - start.getTime()) / 86_400_000 + 1) / 7);
}

export function formatClock(now: Date | null) {
  if (!now) return { day: "", time: "--:--", date: "", alt: "" };
  const week = String(isoWeek(now)).padStart(2, "0");
  const month = now.toLocaleDateString("en-GB", { month: "long" });
  return {
    day: now.toLocaleDateString("en-US", { weekday: "long" }),
    time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    // The format a right-click swaps in: "d MMMM 'W'ww yyyy", the week two digits. config/omarchy/shell.json:27-28, clock Model.js:83-90.
    alt: `${now.getDate()} ${month} W${week} ${now.getFullYear()}`,
  };
}
