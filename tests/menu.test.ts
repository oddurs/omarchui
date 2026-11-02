import { describe, expect, it } from "vitest";
import { at, omarchyMenu, searchAll, type MenuItem } from "@/lib/menu";
import { REF_MENU } from "@/lib/reference.generated";

const state = { night: false, dnd: false, idle: true };
const names = (items: MenuItem[]) => items.map((i) => i.name);

describe("the demo's Omarchy menu", () => {
  it("has Omarchy 4's top level in Omarchy's order", () => {
    expect(names(omarchyMenu(state))).toEqual(REF_MENU.map((n) => n.name));
  });

  it("shows one entry of each toggle pair, as Omarchy's `when` guards do", () => {
    const toggles = names(at(omarchyMenu(state), ["trigger", "trigger.toggle"]).items);
    expect(toggles).toContain("Nightlight On");
    expect(toggles).not.toContain("Nightlight Off");
    expect(toggles).toContain("Silence Notifications");
    expect(toggles).toContain("Stay Awake");
    const lit = names(at(omarchyMenu({ ...state, night: true }), ["trigger", "trigger.toggle"]).items);
    expect(lit).toContain("Nightlight Off");
  });

  it("opens web links from the command Omarchy would run", () => {
    const learn = at(omarchyMenu(state), ["learn"]).items;
    expect(learn.find((i) => i.name === "Arch")?.command).toEqual({ type: "link", href: "https://wiki.archlinux.org/title/Main_page" });
  });

  it("borrows shortcut hints from the bindings that run the same command", () => {
    const learn = at(omarchyMenu(state), ["learn"]).items;
    expect(learn.find((i) => i.id === "learn.keybindings")?.hint).toBe("Super K");
  });

  it("finds entries anywhere in the tree from the root, with their path", () => {
    // Omarchy has two: capture a QR code, and share Wi-Fi as one.
    const hits = searchAll(omarchyMenu(state), "qr code");
    expect(hits.map((h) => [h.id, h.path])).toEqual([
      ["trigger.capture.qr", ["trigger", "trigger.capture"]],
      ["setup.network.qr", ["setup", "setup.network"]],
    ]);
  });

  it("keeps every source citation", () => {
    const walk = (items: MenuItem[]): MenuItem[] => items.flatMap((i) => [i, ...walk(i.children ?? [])]);
    const missing = walk(omarchyMenu(state)).filter(
      (i) => !i.src && !["omarchui.view", "stock", "split", "tuned"].includes(i.id) && i.command?.type !== "theme",
    );
    expect(missing.map((i) => i.id)).toEqual([]);
  });
});
