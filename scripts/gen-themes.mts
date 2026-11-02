// Derives Omarchui's eighteen colour roles from each Omarchy theme's colors.toml values
// (research/omarchy/facts.json), holds every ink and spectrum colour to WCAG AA on every
// ground, and writes lib/themes.generated.ts and the colour token defaults.
// Usage: node scripts/gen-themes.mts [--check]
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
type Source = {
  slug: string;
  name: string;
  mode: "dark" | "light";
  colors: {
    accent: string;
    selection: string | null;
    muted: string | null;
    activeBorder: string | null;
    inactiveBorder: string | null;
    ramp: Record<string, string>;
    named: Record<string, string>;
  };
  /** The theme's own shell.lock.toml, which replaces the [lock] section when present. */
  lock?: { placeholder: string; textError: string; borderActive: string };
};
const facts = JSON.parse(readFileSync(path.join(root, "research/omarchy/facts.json"), "utf8")) as { commit: string; themes: Source[] };

const DEFAULT_DARK = "tokyo-night";
const DEFAULT_LIGHT = "catppuccin-latte";
const ROLES = [
  "wall",
  "sunken",
  "surface",
  "raised",
  "line",
  "line-2",
  "text",
  "text-2",
  "text-3",
  "accent",
  "on-accent",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "orange",
] as const;
type Role = (typeof ROLES)[number];

// ---- colour maths (WCAG 2.x) ----
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) =>
  "#" +
  c
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
const mix = (a: string, b: string, t: number) => hex(rgb(a).map((v, i) => v + ((rgb(b)[i] ?? 0) - v) * t));
const chan = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const lum = (h: string) => {
  const [r = 0, g = 0, b = 0] = rgb(h).map(chan);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const six = (h: string) => (h.length === 9 ? h.slice(0, 7) : h).toLowerCase();

/** Move `from` toward `toward` in 1% steps until it clears `min` on every ground. */
function clear(from: string, toward: string, grounds: string[], min: number) {
  for (let t = 0; t <= 1.0001; t += 0.01) {
    const c = mix(from, toward, t);
    if (Math.min(...grounds.map((g) => contrast(c, g))) >= min) return c;
  }
  return toward;
}

function derive(t: Source): Record<Role, string> {
  const r = t.colors.ramp;
  const n = t.colors.named;
  const dark = t.mode === "dark";
  const surface = six(r.background ?? "#000000");
  const wall = six(r.darker_background ?? mix(surface, "#000000", 0.5));
  const sunken = six(r.dark_background ?? mix(surface, "#000000", 0.25));
  // Raised steps away from the wall: lighter in dark themes, toward white in light ones.
  const raised = dark ? six(r.lighter_background ?? mix(surface, "#ffffff", 0.08)) : mix(surface, "#ffffff", 0.6);
  const grounds = [wall, sunken, surface, raised];
  const text = six(r.bright_foreground ?? r.foreground ?? (dark ? "#ffffff" : "#000000"));
  const away = dark ? "#ffffff" : "#000000";
  const ink = (c: string, min: number) => clear(c, text === c ? away : text, grounds, min);
  const textAA = clear(text, away, grounds, 7);
  const accent = clear(six(t.colors.accent), away, grounds, 4.55);
  const onAccent = [wall, textAA, "#ffffff", "#000000"].reduce((best, c) => (contrast(c, accent) > contrast(best, accent) ? c : best));
  const hue = (k: string, fallback: string) => clear(six(n[k] ?? fallback), away, grounds, 4.55);
  return {
    wall,
    sunken,
    surface,
    raised,
    line: six(t.colors.selection ?? mix(surface, textAA, 0.15)),
    "line-2": six(t.colors.muted ?? mix(surface, textAA, 0.3)),
    text: textAA,
    "text-2": ink(mix(textAA, surface, 0.2), 5.5),
    "text-3": ink(mix(textAA, surface, 0.42), 4.55),
    accent,
    "on-accent": onAccent,
    red: hue("red", "#cc3333"),
    green: hue("green", "#33aa33"),
    yellow: hue("yellow", "#ccaa33"),
    blue: hue("blue", "#3366cc"),
    magenta: hue("magenta", "#aa33aa"),
    cyan: hue("cyan", "#33aaaa"),
    orange: hue("orange", n.yellow ?? "#cc7733"),
  };
}

const themes = facts.themes.map((t) => ({ slug: t.slug, name: t.name, mode: t.mode, roles: derive(t) }));

// Omarchy's own palette, untouched, for the stock view: the colours Omarchy actually draws with.
const RAW = [
  "background",
  "darker_background",
  "dark_background",
  "lighter_background",
  "foreground",
  "dark_foreground",
  "light_foreground",
  "bright_foreground",
  "accent",
  "selection",
  "muted",
  "active_border",
  "inactive_border",
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "magenta",
  "dim_foreground",
  "body_foreground",
  "lock_placeholder",
  "lock_error",
  "lock_border",
] as const;
// Qt.darker(c, f) divides HSV value by f, which scales every channel by 1/f.
const darker = (c: string, f: number) => hex(rgb(c).map((v) => v / f));
function raw(t: Source): Record<(typeof RAW)[number], string> {
  const c = t.colors;
  const pick = (k: string) => c.ramp[k] ?? c.named[k] ?? "";
  const out = {} as Record<(typeof RAW)[number], string>;
  for (const k of RAW) {
    out[k] =
      k === "accent"
        ? c.accent
        : k === "selection"
          ? (c.selection ?? pick("lighter_background"))
          : k === "muted"
            ? (c.muted ?? pick("dark_foreground"))
            : k === "active_border"
              ? (c.activeBorder ?? c.accent)
              : k === "inactive_border"
                ? (c.inactiveBorder ?? "#595959aa")
                : // Notification time and body inks, shell/plugins/notifications/Toast.qml:74-75.
                  k === "dim_foreground"
                  ? darker(pick("foreground"), 1.4)
                  : k === "body_foreground"
                    ? darker(pick("foreground"), 1.15)
                    : // [lock] in default/themed/shell.toml.tpl:213-221, unless the theme ships shell.lock.toml.
                      k === "lock_placeholder"
                      ? (t.lock?.placeholder ?? mix(pick("foreground"), pick("background"), 0.34))
                      : k === "lock_error"
                        ? (t.lock?.textError ?? pick("red"))
                        : k === "lock_border"
                          ? (t.lock?.borderActive ?? c.activeBorder ?? c.accent)
                          : pick(k);
    if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(out[k])) throw new Error(`gen-themes: ${t.slug} has no usable ${k} ("${out[k]}")`);
  }
  return out;
}
const raws = facts.themes.map((t) => ({ slug: t.slug, raw: raw(t) }));
const cssVar = (k: string) => `--o-${k.replaceAll("_", "-")}`;

const body = themes
  .map((t) => {
    const lines = ROLES.map((k) => `    ${k.includes("-") ? `"${k}"` : k}: "${t.roles[k]}",`).join("\n");
    return `  ${t.slug.includes("-") ? `"${t.slug}"` : t.slug}: {\n    name: ${JSON.stringify(t.name)},\n    mode: "${t.mode}",\n${lines}\n  },`;
  })
  .join("\n");

const rawBody = raws
  .map((t) => `  ${JSON.stringify(t.slug)}: {\n${RAW.map((k) => `    ${JSON.stringify(cssVar(k))}: "${t.raw[k].toLowerCase()}",`).join("\n")}\n  },`)
  .join("\n");

// Each theme's backgrounds in Omarchy's order, from research/omarchy/spec/theming.json.
type Bg = { file: string; width: number; height: number };
type PerTheme = { slug: string; backgrounds: Bg[]; "preview.png": unknown };
const theming = JSON.parse(readFileSync(path.join(root, "research/omarchy/spec/theming.json"), "utf8")) as {
  commit: string;
  per_theme: { items: { value: PerTheme }[] };
};
if (!facts.commit.startsWith(theming.commit.slice(0, 7))) throw new Error("gen-themes: theming.json and facts.json are pinned to different commits");
const perTheme = new Map(theming.per_theme.items.map((i) => [i.value.slug, i.value]));
const bgBody = themes
  .map((t) => {
    const p = perTheme.get(t.slug);
    if (!p?.backgrounds.length) throw new Error(`gen-themes: no backgrounds for ${t.slug} in theming.json`);
    const files = p.backgrounds.map((b) => `{ file: ${JSON.stringify(b.file)}, width: ${b.width}, height: ${b.height} }`).join(", ");
    return `  ${JSON.stringify(t.slug)}: { preview: ${p["preview.png"] ? "true" : "false"}, backgrounds: [${files}] },`;
  })
  .join("\n");

const themesTs = `// Generated by scripts/gen-themes.mts from research/omarchy/facts.json
// (Omarchy commit ${facts.commit.slice(0, 7)}). Do not edit; change the derivation instead.
import type { Theme } from "./themes";

export const THEMES = {
${body}
} as const satisfies Record<string, Theme>;

/** Omarchy's colors.toml values as --o-* custom properties, for the stock view. */
/** The Omarchy commit every image and value here was read from. */
export const OMARCHY_COMMIT = "${facts.commit}";

/** Each theme's backgrounds in Omarchy's order (sorted filename), and whether it ships preview.png. */
export const OMARCHY_BACKGROUNDS: Record<keyof typeof THEMES, { preview: boolean; backgrounds: { file: string; width: number; height: number }[] }> = {
${bgBody}
};

export const OMARCHY_PALETTES: Record<keyof typeof THEMES, Record<string, string>> = {
${rawBody}
};
`;

const dark = themes.find((t) => t.slug === DEFAULT_DARK)!.roles;
const light = themes.find((t) => t.slug === DEFAULT_LIGHT)!.roles;
const tokenPath = path.join(root, "design/tokens/color.stylex.ts");
const tokenSrc = readFileSync(tokenPath, "utf8").replace(/"--([\w-]+)": \{ default: "#[0-9a-f]{6}", \[DARK\]: "#[0-9a-f]{6}" \}/g, (whole, role: Role) =>
  ROLES.includes(role) ? `"--${role}": { default: "${light[role]}", [DARK]: "${dark[role]}" }` : whole,
);

const rawDark = raws.find((t) => t.slug === DEFAULT_DARK)!.raw;
const rawLight = raws.find((t) => t.slug === DEFAULT_LIGHT)!.raw;
const omarchyTokens = `// Generated by scripts/gen-themes.mts. Do not edit.
import * as stylex from "@stylexjs/stylex";

const DARK = "@media (prefers-color-scheme: dark)";

/**
 * Omarchy's own colors.toml palette, unadjusted, as literal --o-* properties. Only the stock
 * view reads these; everything else reads the contrast-checked roles in color.stylex.ts.
 * Defaults are Catppuccin Latte and Tokyo Night; the runtime paints the chosen theme over them.
 */
export const omarchy = stylex.defineVars({
${RAW.map((k) => `  ${JSON.stringify(cssVar(k))}: { default: "${rawLight[k].toLowerCase()}", [DARK]: "${rawDark[k].toLowerCase()}" },`).join("\n")}
});
`;

const out: [string, string][] = [
  [path.join(root, "lib/themes.generated.ts"), themesTs],
  [tokenPath, tokenSrc],
  [path.join(root, "design/tokens/omarchy.stylex.ts"), omarchyTokens],
];
if (process.argv.includes("--check")) {
  const stale = out.filter(([p, s]) => readFileSync(p, "utf8") !== s).map(([p]) => path.relative(root, p));
  if (stale.length) {
    console.error(`stale: ${stale.join(", ")}. Run: node scripts/gen-themes.mts`);
    process.exit(1);
  }
} else {
  for (const [p, s] of out) writeFileSync(p, s);
  console.log(`wrote ${themes.length} themes`);
}
