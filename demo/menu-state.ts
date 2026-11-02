import { at, filter, LAUNCHER, omarchyMenu, searchAll, type MenuItem, type MenuState } from "@/lib/menu";
import type { Overlay, State } from "./state";

export type MenuContext = Pick<State, "theme" | "view"> & MenuState;

export function overlayItems(o: NonNullable<Overlay>, s: MenuContext): { items: MenuItem[]; trail: string[] } {
  if (o.root === "launcher") return { items: filter(LAUNCHER, o.q), trail: ["Apps"] };
  const root = omarchyMenu(s);
  if (!o.path.length && o.q.trim()) return { items: searchAll(root, o.q), trail: ["Search"] };
  const { items, trail } = at(root, o.path);
  return { items: filter(items, o.q), trail };
}

/** Opening a list of choices starts on the one already in effect. */
export function currentIndex(items: MenuItem[], s: Pick<State, "theme" | "view">): number {
  const i = items.findIndex(
    (it) => (it.command?.type === "theme" && it.command.slug === s.theme) || (it.command?.type === "view" && it.command.view === s.view),
  );
  return Math.max(0, i);
}

export function openAt(root: "launcher" | "omarchy", path: string[], s: MenuContext): NonNullable<Overlay> {
  const o = { root, path, q: "", sel: 0 };
  return { ...o, sel: currentIndex(overlayItems(o, s).items, s) };
}
