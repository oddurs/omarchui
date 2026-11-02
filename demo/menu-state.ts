import { at, filter, LAUNCHER, OMARCHY_MENU, type MenuItem } from "@/lib/menu";
import type { Overlay, State } from "./state";

export function overlayItems(o: NonNullable<Overlay>): { items: MenuItem[]; trail: string[] } {
  if (o.root === "launcher") return { items: filter(LAUNCHER, o.q), trail: ["Apps"] };
  const { items, trail } = at(OMARCHY_MENU, o.path);
  return { items: filter(items, o.q), trail };
}

/** Opening a list of choices starts on the one already in effect. */
export function currentIndex(items: MenuItem[], s: Pick<State, "theme" | "view">): number {
  const i = items.findIndex(
    (it) => (it.command?.type === "theme" && it.command.slug === s.theme) || (it.command?.type === "view" && it.command.view === s.view),
  );
  return Math.max(0, i);
}

export function openAt(root: "launcher" | "omarchy", path: string[], s: Pick<State, "theme" | "view">): NonNullable<Overlay> {
  const o = { root, path, q: "", sel: 0 };
  return { ...o, sel: currentIndex(overlayItems(o).items, s) };
}
