import { at, filter, LAUNCHER, omarchyMenu, search, type MenuItem, type MenuState } from "@/lib/menu";
import type { Overlay, State } from "./state";

export type MenuContext = Pick<State, "theme" | "view"> & MenuState;

export function overlayItems(o: NonNullable<Overlay>, s: MenuContext): { items: MenuItem[]; trail: string[] } {
  if (o.root === "launcher") return { items: filter(LAUNCHER, o.q), trail: ["Apps"] };
  const root = omarchyMenu(s);
  return { items: search(root, o.path, o.q), trail: at(root, o.path).trail };
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
