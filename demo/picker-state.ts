import { backgroundIndex, backgroundName, backgroundsOf } from "@/lib/backgrounds";
import { SLUGS, THEMES, type ThemeSlug } from "@/lib/themes";
import type { Picker, State } from "./state";

/** Themes in the picker's order: preview files sorted by slug. omarchy-theme-switcher:44-70. */
export const PICKER_THEMES: ThemeSlug[] = [...SLUGS].sort();

export type PickerItem = { key: string; label: string; theme: ThemeSlug; index: number };

/** What the picker shows: every theme (filtered by label), or the current theme's backgrounds. */
export function pickerItems(p: NonNullable<Picker>, s: Pick<State, "theme">): PickerItem[] {
  if (p.mode === "background") {
    return backgroundsOf(s.theme).map((b, i) => ({ key: b.file, label: backgroundName(b.file), theme: s.theme, index: i }));
  }
  const q = p.q.trim().toLowerCase();
  return PICKER_THEMES.filter((t) => THEMES[t].name.toLowerCase().includes(q)).map((t) => ({ key: t, label: THEMES[t].name, theme: t, index: 0 }));
}

/** Opens on what is in use: the current theme, or the background showing now. */
export function openPicker(mode: "theme" | "background", s: Pick<State, "theme" | "bg">): NonNullable<Picker> {
  const sel = mode === "theme" ? PICKER_THEMES.indexOf(s.theme) : backgroundIndex(s.theme, s.bg[s.theme]);
  return { mode, sel: Math.max(0, sel), q: "" };
}
