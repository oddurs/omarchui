/** A rectangle in fractions of the workspace, so gaps can stay a CSS concern. */
export type Rect = { x: number; y: number; w: number; h: number };
export type Dir = "left" | "right" | "up" | "down";

/**
 * Hyprland's dwindle layout, simplified: each new window halves the region left by the
 * previous one, splitting along the longer side so tiles stay close to square.
 * `flip` swaps the split axis, which is what Super+J toggles.
 */
export function dwindle(ids: readonly string[], aspect: number, flip = false): Map<string, Rect> {
  const out = new Map<string, Rect>();
  let region: Rect = { x: 0, y: 0, w: 1, h: 1 };
  ids.forEach((id, i) => {
    if (i === ids.length - 1) {
      out.set(id, region);
      return;
    }
    const wide = region.w * aspect >= region.h;
    const sideBySide = flip ? !wide : wide;
    if (sideBySide) {
      const half = region.w / 2;
      out.set(id, { ...region, w: half });
      region = { ...region, x: region.x + half, w: half };
    } else {
      const half = region.h / 2;
      out.set(id, { ...region, h: half });
      region = { ...region, y: region.y + half, h: half };
    }
  });
  return out;
}

const EPS = 1e-6;

/** The nearest tile in a direction: must lie past our edge, ranked by gap then by alignment. */
export function neighbor(rects: Map<string, Rect>, from: string, dir: Dir): string | null {
  const a = rects.get(from);
  if (!a) return null;
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  let best: string | null = null;
  let bestScore = Infinity;
  for (const [id, b] of rects) {
    if (id === from) continue;
    let gap: number;
    let overlap: number;
    switch (dir) {
      case "left":
        gap = a.x - (b.x + b.w);
        overlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        break;
      case "right":
        gap = b.x - (a.x + a.w);
        overlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        break;
      case "up":
        gap = a.y - (b.y + b.h);
        overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        break;
      case "down":
        gap = b.y - (a.y + a.h);
        overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        break;
    }
    if (gap < -EPS) continue;
    const bcx = b.x + b.w / 2;
    const bcy = b.y + b.h / 2;
    const drift = dir === "left" || dir === "right" ? Math.abs(bcy - acy) : Math.abs(bcx - acx);
    // Tiles sharing an edge beat tiles that are merely closer by centre.
    const score = gap * 10 + drift + (overlap > EPS ? 0 : 5);
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}
