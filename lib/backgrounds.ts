import type { ThemeSlug } from "./themes";
import { OMARCHY_BACKGROUNDS } from "./themes.generated";

export function backgroundsOf(slug: ThemeSlug) {
  return OMARCHY_BACKGROUNDS[slug].backgrounds;
}

/** The background a theme shows: the one last used in it, else the first. omarchy-theme-set:186-196. */
export function backgroundIndex(slug: ThemeSlug, remembered: number | undefined): number {
  const n = backgroundsOf(slug).length;
  return remembered !== undefined && remembered < n ? remembered : 0;
}

/** "0-liftoff.webp" reads "Liftoff", as omarchy-theme-bg-current:6-12 prints it. */
export function backgroundName(file: string): string {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}
