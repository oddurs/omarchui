import { initialState, newData, type State, type Win } from "@/demo/state";
import { HOME } from "@/lib/fs";
import { prompt, run } from "@/lib/shell";
import type { ThemeSlug } from "@/lib/themes";

/** A frozen desktop for the hero: the same components as the demo, with fixed content. */
export function previewState(theme: ThemeSlug): State {
  const now = new Date(2026, 10, 1, 14, 32);
  const term = newData("terminal");
  const lines =
    term.kind === "terminal"
      ? [
          [...prompt(HOME), { t: "ls ~/.config/hypr" }],
          ...run("ls ~/.config/hypr", { cwd: HOME, theme, history: [], now }).out,
          [],
          [...prompt(HOME), { t: "fastfetch" }],
          ...run("fastfetch", { cwd: HOME, theme, history: [], now }).out,
        ]
      : [];
  const windows: Win[] = [
    { id: "p1", app: "terminal", ws: 1, data: term.kind === "terminal" ? { ...term, lines } : term },
    { id: "p2", app: "editor", ws: 1, data: newData("editor") },
    { id: "p3", app: "monitor", ws: 1, data: newData("monitor") },
    { id: "p4", app: "git", ws: 2, data: newData("git") },
  ];
  return {
    ...initialState(theme),
    phase: "desktop",
    aspect: 16 / 9,
    windows,
    focus: { 1: "p1", 2: "p4" },
    toasts: [
      { id: 1, who: "Calendar", title: "Design review moved to 15:00", body: "Same room. Bring the theme file.", critical: false, urgency: "normal", at: 0 },
    ],
  };
}
