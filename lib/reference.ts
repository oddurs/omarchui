import { REF_SPACING, REF_TYPE } from "./reference.generated";

export { REF_COMMIT, REF_VERSION } from "./reference.generated";

/** A CSS property the inspector reads from the rendered element to compare with the reference. */
export type Probe = "height" | "width" | "borderTopWidth" | "paddingLeft" | "fontSize" | "fontWeight" | "fontFamily" | "boxShadow";

/** One measurement: what Omarchy ships (with its source) and what the tuned token is. */
export type Measure = { label: string; omarchy: string; src: string; tuned: string; probe?: Probe; in?: string };

export type PartId = "bar" | "workspace" | "clock" | "window" | "menu" | "menu-row" | "toast" | "osd" | "lock-field";
export type Part = { name: string; doc: string; measures: Measure[] };

/** Looks up one value in Omarchy's spacing table, failing loudly if research ever renames it. */
function spacing(where: string, property: string, index = 0): { value: string; src: string } {
  const row = REF_SPACING.find((r) => r.where === where && r.property === property);
  if (!row) throw new Error(`reference: no spacing row "${where}" / "${property}"`);
  const value = row.value.split(" / ")[index]?.trim();
  if (value === undefined) throw new Error(`reference: "${where}" / "${property}" has no value ${index}`);
  return { value, src: row.src };
}

function type(where: string, pick: RegExp): { value: string; src: string } {
  const row = REF_TYPE.find((r) => r.where === where);
  if (!row) throw new Error(`reference: no typography row "${where}"`);
  const value = pick.exec(row.sizes)?.[1];
  if (!value) throw new Error(`reference: "${where}" sizes "${row.sizes}" do not match ${pick}`);
  return { value, src: row.src };
}

const px = (v: string) => `${v}px`;
const m = (label: string, ref: { value: string; src: string }, tuned: string, probe?: Probe, unit = px, inside?: string): Measure => ({
  label,
  omarchy: unit(ref.value),
  src: ref.src,
  tuned,
  probe,
  in: inside,
});

export const PARTS: Record<PartId, Part> = {
  bar: {
    name: "Bar",
    doc: "/system/shell/bar",
    measures: [
      m("Height", spacing("Bar", "height (horizontal / vertical)"), "32px · chrome.barHeight", "height"),
      m("Edge padding", spacing("Bar", "edge padding left/right"), "8px · space.u2", "paddingLeft"),
      m("Label size", type("Bar labels", /^(\d+)/), "11px · label preset", "fontSize", px, "[data-ref=clock]"),
    ],
  },
  workspace: {
    name: "Workspace button",
    doc: "/system/shell/bar",
    measures: [
      m("Width", spacing("Bar workspaces", "button width / spacing / margin / padding", 0), "24px · space.u6", "width"),
      {
        label: "Active marker",
        omarchy: "layout glyph, no marker",
        src: "shell/plugins/bar/widgets/Workspaces.qml:138-142,273",
        tuned: "number + 2px accent underline",
      },
    ],
  },
  clock: {
    name: "Clock",
    doc: "/system/shell/bar",
    measures: [
      { label: "Format", omarchy: "dddd HH:mm", src: "config/omarchy/shell.json:27-28", tuned: "weekday + 24h time" },
      m("Size", type("Bar labels", /^(\d+)/), "12px · caption preset", "fontSize"),
      { label: "Face", omarchy: "JetBrainsMono Nerd Font", src: "shell/Commons/Style.qml:267-277", tuned: "Instrument Sans · chrome.ui", probe: "fontFamily" },
    ],
  },
  window: {
    name: "Window",
    doc: "/system/shell/window",
    measures: [
      m("Border", spacing("Hyprland", "border_size"), "1px · chrome.border", "borderTopWidth"),
      m(
        "Gap between windows",
        { value: String(Number(spacing("Hyprland", "gaps_in").value) * 2), src: spacing("Hyprland", "gaps_in").src },
        "8px · chrome.gapIn",
      ),
      m("Gap to screen edge", spacing("Hyprland", "gaps_out"), "12px · chrome.gapOut"),
      {
        label: "Focus",
        omarchy: "accent border",
        src: "default/themed/hyprland.lua.tpl:1-2",
        tuned: "accent border + 3px halo · chrome.halo",
        probe: "boxShadow",
      },
    ],
  },
  menu: {
    name: "Menu card",
    doc: "/system/shell/menu-panel",
    measures: [
      m("Width", spacing("Menu card", "width / wide width"), "460px · chrome.menuWidth", "width"),
      m("Border", spacing("Menu card", "padding / header / row / row+detail / row spacing / border", 5), "1px · chrome.menuBorderWidth", "borderTopWidth"),
      m("Padding", spacing("Menu card", "padding / header / row / row+detail / row spacing / border", 0), "4px · space.u1"),
    ],
  },
  "menu-row": {
    name: "Menu row",
    doc: "/system/shell/menu-panel",
    measures: [
      m("Height", spacing("Menu card", "padding / header / row / row+detail / row spacing / border", 2), "36px · chrome.row", "height"),
      m("Label size", type("Menu", /rows (\d+)/), "13px · chrome.menuLabel", "fontSize", px, "span:nth-child(2)"),
      m("Icon column", spacing("Menu row", "icon column / icon left inset"), "24px · size.glyph"),
    ],
  },
  toast: {
    name: "Notification",
    doc: "/system/shell/toast",
    measures: [
      m("Width", spacing("Notifications", "width / card gap / deck gap / border / padding-x / icon slot", 0), "320px · chrome.toastWidth", "width"),
      m(
        "Border",
        spacing("Notifications", "width / card gap / deck gap / border / padding-x / icon slot", 3),
        "1px · chrome.panelBorderWidth",
        "borderTopWidth",
      ),
      m("Padding", spacing("Notifications", "width / card gap / deck gap / border / padding-x / icon slot", 4), "14px · chrome.toastPad", "paddingLeft"),
      m("Title size", type("Notifications", /title (\d+)/), "13px · chrome.toastTitle", "fontSize", px, "span:nth-child(2)"),
    ],
  },
  osd: {
    name: "Volume overlay",
    doc: "/system/shell/osd",
    measures: [
      m("Track height", spacing("OSD", "padding / gap / bar width / bar height / bottom offset / border", 3), "4px · chrome.osdTrack"),
      m("Bottom offset", spacing("OSD", "padding / gap / bar width / bar height / bottom offset / border", 4), "72px · chrome.osdBottom"),
      m("Border", spacing("OSD", "padding / gap / bar width / bar height / bottom offset / border", 5), "1px · chrome.panelBorderWidth", "borderTopWidth"),
    ],
  },
  "lock-field": {
    name: "Lock field",
    doc: "/system/shell/lock-panel",
    measures: [
      m("Width", spacing("Lock", "field width / height / outline / text inset", 0), "260px · chrome.lockFieldWidth", "width"),
      m("Height", spacing("Lock", "field width / height / outline / text inset", 1), "48px · chrome.fieldLg", "height", px, "input"),
      m("Outline", spacing("Lock", "field width / height / outline / text inset", 2), "1px + 3px halo", "borderTopWidth", px, "input"),
    ],
  },
};

export function isPart(id: string | undefined): id is PartId {
  return id !== undefined && Object.hasOwn(PARTS, id);
}
