export const ROLES = [
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

export type Role = (typeof ROLES)[number];
export type Palette = Record<Role, string>;
export type Theme = Palette & { name: string; mode: "dark" | "light" };

export { THEMES } from "./themes.generated";
import { THEMES } from "./themes.generated";

export type ThemeSlug = keyof typeof THEMES;
export const SLUGS = Object.keys(THEMES) as ThemeSlug[];

/** The defaults when the visitor has not picked a theme; mirrored in design/tokens/color.stylex.ts. */
export const DEFAULT_DARK: ThemeSlug = "tokyo-night";
export const DEFAULT_LIGHT: ThemeSlug = "catppuccin-latte";

export function isSlug(value: unknown): value is ThemeSlug {
  return typeof value === "string" && Object.hasOwn(THEMES, value);
}

export function nextSlug(slug: ThemeSlug, dir: 1 | -1): ThemeSlug {
  const i = SLUGS.indexOf(slug);
  return SLUGS[(i + dir + SLUGS.length) % SLUGS.length] ?? slug;
}
