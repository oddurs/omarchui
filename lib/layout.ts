/** A rectangle in fractions of the workspace, so gaps can stay a CSS concern. */
export type Rect = { x: number; y: number; w: number; h: number };
export type Dir = "left" | "right" | "up" | "down";

/**
 * Hyprland's dwindle layout as a binary tree of splits. Each split holds its orientation, so
 * a split stays as it was set (preserve_split) until Super+J flips it.
 * research/omarchy/spec/windows.json, layout section.
 */
export type Node = { leaf: string } | { split: "h" | "v"; ratio: number; a: Node; b: Node };

const FULL: Rect = { x: 0, y: 0, w: 1, h: 1 };

export function leaves(node: Node | null): string[] {
  if (!node) return [];
  return "leaf" in node ? [node.leaf] : [...leaves(node.a), ...leaves(node.b)];
}

/** Each window's tile, in fractions of the workspace. */
export function rectsOf(node: Node | null, region: Rect = FULL, out = new Map<string, Rect>()): Map<string, Rect> {
  if (!node) return out;
  if ("leaf" in node) return out.set(node.leaf, region);
  if (node.split === "h") {
    const w = region.w * node.ratio;
    rectsOf(node.a, { ...region, w }, out);
    rectsOf(node.b, { ...region, x: region.x + w, w: region.w - w }, out);
  } else {
    const h = region.h * node.ratio;
    rectsOf(node.a, { ...region, h }, out);
    rectsOf(node.b, { ...region, y: region.y + h, h: region.h - h }, out);
  }
  return out;
}

/**
 * A new window splits the focused one in half: side by side when that tile is wider than tall,
 * otherwise stacked, and the new window always takes the right or bottom half (force_split 2).
 * `aspect` is the workspace's width over its height, so the rule reads real pixels.
 */
export function insert(tree: Node | null, at: string | null, id: string, aspect: number): Node {
  if (!tree) return { leaf: id };
  const target = at && leaves(tree).includes(at) ? at : (leaves(tree).at(-1) ?? null);
  const r = target ? rectsOf(tree).get(target) : undefined;
  if (!target || !r) return tree;
  const split = r.w * aspect > r.h ? "h" : "v";
  return replace(tree, target, () => ({ split, ratio: 0.5, a: { leaf: target }, b: { leaf: id } }));
}

/** Closing a window gives its whole tile to its sibling. */
export function remove(tree: Node | null, id: string): Node | null {
  if (!tree) return null;
  if ("leaf" in tree) return tree.leaf === id ? null : tree;
  const a = remove(tree.a, id);
  const b = remove(tree.b, id);
  if (!a) return b;
  if (!b) return a;
  return { ...tree, a, b };
}

/** Super+J: the split that holds this window turns from side by side to stacked, or back. */
export function toggleSplit(tree: Node | null, id: string): Node | null {
  if (!tree || "leaf" in tree) return tree;
  if (("leaf" in tree.a && tree.a.leaf === id) || ("leaf" in tree.b && tree.b.leaf === id)) {
    return { ...tree, split: tree.split === "h" ? "v" : "h" };
  }
  return { ...tree, a: toggleSplit(tree.a, id) ?? tree.a, b: toggleSplit(tree.b, id) ?? tree.b };
}

/** Two windows trade tiles; the splits stay where they are. */
export function swapIds(tree: Node | null, x: string, y: string): Node | null {
  if (!tree) return null;
  if ("leaf" in tree) return tree.leaf === x ? { leaf: y } : tree.leaf === y ? { leaf: x } : tree;
  return { ...tree, a: swapIds(tree.a, x, y) ?? tree.a, b: swapIds(tree.b, x, y) ?? tree.b };
}

function replace(node: Node, id: string, fn: () => Node): Node {
  if ("leaf" in node) return node.leaf === id ? fn() : node;
  return { ...node, a: replace(node.a, id, fn), b: replace(node.b, id, fn) };
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
