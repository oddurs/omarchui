import { getImageProps } from "next/image";
import { backgroundsOf } from "./backgrounds";
import type { ThemeSlug } from "./themes";
import { OMARCHY_BACKGROUNDS, OMARCHY_COMMIT } from "./themes.generated";

// Omarchy's images are read from its repository at the pinned commit, never copied into this
// one: the repository records no licence or credits for them (research/omarchy/spec/theming.json,
// licensing). next.config.ts allows exactly this prefix through the image optimizer.
const THEMES_URL = `https://raw.githubusercontent.com/basecamp/omarchy/${OMARCHY_COMMIT}/themes`;

/** A source image at about `cssWidth` CSS pixels (twice that in device pixels), through the optimizer. */
function optimized(src: string, cssWidth: number, aspect: number): string {
  return getImageProps({ src, alt: "", width: cssWidth, height: Math.round(cssWidth * aspect), quality: 75 }).props.src;
}

export function backgroundSrc(slug: ThemeSlug, index: number, cssWidth = 960): string {
  const b = backgroundsOf(slug)[index] ?? backgroundsOf(slug)[0];
  if (!b) throw new Error(`no backgrounds for ${slug}`);
  return optimized(`${THEMES_URL}/${slug}/backgrounds/${b.file}`, cssWidth, b.height / b.width);
}

/** A theme's card in the picker: its preview.png, else its first background. omarchy-theme-switcher:23-42. */
export function previewSrc(slug: ThemeSlug, cssWidth = 384): string {
  if (!OMARCHY_BACKGROUNDS[slug].preview) return backgroundSrc(slug, 0, cssWidth);
  return optimized(`${THEMES_URL}/${slug}/preview.png`, cssWidth, 1440 / 2560);
}
