"use client";

import { useSyncExternalStore } from "react";
import { readChosen, systemSlug, THEME_EVENT } from "@/lib/theme-runtime";
import { DEFAULT_DARK, isSlug, type ThemeSlug } from "@/lib/themes";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  mq.addEventListener("change", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
    mq.removeEventListener("change", cb);
  };
}

const snapshot = () => `${readChosen() ?? ""}|${systemSlug()}`;

/** The palette on screen and whether the visitor picked it. Server renders assume dark. */
export function useTheme(): { slug: ThemeSlug; chosen: ThemeSlug | null } {
  const snap = useSyncExternalStore(subscribe, snapshot, () => `|${DEFAULT_DARK}`);
  const [chosen, system] = snap.split("|");
  const c = isSlug(chosen) ? chosen : null;
  return { slug: c ?? (isSlug(system) ? system : DEFAULT_DARK), chosen: c };
}
