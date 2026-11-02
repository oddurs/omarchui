import { THEMES, type Role, type ThemeSlug } from "./themes";

export const THEME_SECTIONS: { name: string; keys: Role[]; note?: string }[] = [
  { name: "ground", keys: ["wall", "sunken", "surface", "raised"] },
  { name: "line", keys: ["line", "line-2"] },
  { name: "ink", keys: ["text", "text-2", "text-3"] },
  { name: "signal", keys: ["accent", "on-accent"], note: "ok = green, warn = yellow, err = red, info = cyan" },
  { name: "spectrum", keys: ["red", "green", "yellow", "blue", "magenta", "cyan", "orange"] },
];

export type TomlToken =
  { kind: "comment"; text: string } | { kind: "section"; text: string } | { kind: "pair"; key: string; value: string; swatch?: string } | { kind: "blank" };

export function themePath(slug: ThemeSlug): string {
  return `~/.config/omarchy/themes/${slug}/theme.toml`;
}

/** The proposed single-file theme format, as tokens so the page can colour it. */
export function themeTokens(slug: ThemeSlug): TomlToken[] {
  const t = THEMES[slug];
  const out: TomlToken[] = [{ kind: "pair", key: "name", value: t.name }, { kind: "pair", key: "mode", value: t.mode }, { kind: "blank" }];
  for (const s of THEME_SECTIONS) {
    out.push({ kind: "section", text: s.name });
    if (s.note) out.push({ kind: "comment", text: s.note });
    for (const k of s.keys) out.push({ kind: "pair", key: k, value: t[k], swatch: t[k] });
    out.push({ kind: "blank" });
  }
  out.pop();
  return out;
}

export function themeToml(slug: ThemeSlug): string {
  return themeTokens(slug)
    .map((tk) => {
      switch (tk.kind) {
        case "comment":
          return `# ${tk.text}`;
        case "section":
          return `[${tk.text}]`;
        case "pair":
          return tk.swatch ? `${tk.key.padEnd(10)}= "${tk.value}"` : `${tk.key} = "${tk.value}"`;
        case "blank":
          return "";
      }
    })
    .join("\n");
}
