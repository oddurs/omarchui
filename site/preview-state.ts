import { echo, initialState, newData, type State, type Win } from "@/demo/state";
import { HOME } from "@/lib/fs";
import { run, type Line } from "@/lib/shell";
import type { ThemeSlug } from "@/lib/themes";

/** A frozen desktop for the hero: the same components as the demo, with fixed content. */
export function previewState(theme: ThemeSlug): State {
  const now = new Date(2026, 10, 1, 14, 32);
  const ctx = { cwd: HOME, theme, bg: 0, idle: true, history: [], now };
  const term = newData("terminal");
  const lines = ["ls ~/.config/hypr", "fastfetch"].reduce<Line[]>(
    (acc, cmd) => [...acc, ...echo({ lines: acc, cwd: HOME, code: 0 }, cmd), ...run(cmd, ctx).out],
    [],
  );
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
