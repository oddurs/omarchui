import { contrast } from "./contrast";

/**
 * The text colour for a clear bar, chosen as omarchy-bar-text-color chooses it: the wallpaper is
 * drawn to cover the screen, the strip under the bar is averaged to one colour, and the theme's
 * background is used as the ink if it stands out from that colour more than the foreground does.
 * bin/omarchy-bar-text-color:100-160. Resolves to the foreground when the image cannot be read.
 */
export async function clearBarInk(src: string, screen: { width: number; height: number }, bar: number, fg: string, bg: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  try {
    await img.decode();
  } catch {
    return fg;
  }
  // The script samples on a canvas no wider than 1920; a narrower one averages the same strip.
  const w = Math.min(screen.width, 480);
  const scale = w / screen.width;
  const h = Math.max(1, Math.round(screen.height * scale));
  const strip = Math.max(1, Math.round(bar * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = strip;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fg;
  const cover = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * cover;
  const dh = img.naturalHeight * cover;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, strip).data;
  } catch {
    // A host without CORS headers taints the canvas; keep the theme's ink.
    return fg;
  }
  return pickInk(meanHex(data), fg, bg);
}

/** The mean colour of RGBA pixels, as #rrggbb. */
export function meanHex(data: ArrayLike<number>): string {
  let r = 0;
  let g = 0;
  let b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]!;
    g += data[i + 1]!;
    b += data[i + 2]!;
  }
  const hex = (v: number) =>
    Math.round(v / n)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** The background wins only when it contrasts with the strip strictly more than the foreground. */
export function pickInk(sample: string, fg: string, bg: string): string {
  return contrast(bg, sample) > contrast(fg, sample) ? bg : fg;
}
