import raw from "@/research/omarchy/facts.json";

/**
 * Facts read from Omarchy's source at a pinned commit by research/omarchy. The shape is
 * loose JSON; this module names the parts the page reads and nothing more.
 */
export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type Dict = { [k: string]: Json };

export type Binding = {
  mods: string[] | null;
  key: string;
  keys: string;
  description: string | null;
  action: string;
  group: string;
  condition: string | null;
  source: string;
};
export type MenuNode = {
  id: string;
  name: string;
  iconCodepoint: string | null;
  command: string | null;
  provider?: string | null;
  aliases?: string[] | null;
  source: string;
  children: MenuNode[];
};
export type Theme = {
  slug: string;
  name: string;
  mode: "dark" | "light";
  colors: {
    background: string;
    foreground: string;
    accent: string;
    selection: string | null;
    activeBorder: string | null;
    inactiveBorder: string | null;
    ansi: string[];
  };
  files: string[];
  source: string;
};

export type Facts = {
  commit: string;
  commitDate: string;
  commitSubject: string;
  version: string;
  codename: string;
  summary: string;
  repo: { dirs: { path: string; files: number; purpose: string; shipped: string; source: string }[]; homeLayers: Json; userEditable: Json; managed: Json };
  themeSystem: Dict & {
    typicalFiles: Record<string, string>;
    colorsTomlKeys: string[];
    ansiMapping: Record<string, string>;
    derivedDefaults: Record<string, string>;
    modeResolution: string;
    templates: string[];
    applyFlow: { step: string; source: string }[];
  };
  themes: Theme[];
  hyprland: Dict & {
    gapsIn: number;
    gapsOut: number;
    borderSize: number;
    rounding: number;
    source: string;
    animations: Dict[];
    beziers: { name: string; points: number[] }[];
    animationsNote: string;
    animationsSource: string;
  };
  bindings: Binding[];
  bindingGroups: { group: string; file: string; covers: string }[];
  gestures: { fingers: number; direction: string; action: string; source: string }[];
  bar: Dict;
  launcher: Dict;
  menu: MenuNode[];
  menuEntryCount: number;
  menuSource: string;
  notifications: Dict;
  osd: Dict;
  lock: Dict;
  idle: Dict;
  dock: Dict;
  terminal: Dict;
  fonts: Dict;
  defaultApps: Dict;
  webApps: { name: string; url: string }[];
  webAppsSource: string;
  boot: Dict;
  spacing: { where: string; property: string; value: string; source: string }[];
  typography: { where: string; family: string; sizes: string; source: string }[];
  assumptions: { claim: string; true: boolean; actual: string; source: string }[];
  undetermined: { item: string; note: string }[];
};

export const facts = raw as unknown as Facts;

export const REPO = "https://github.com/basecamp/omarchy";

/** A link to a file, and optionally a line range, at the pinned commit. */
export function sourceUrl(path: string, lines?: string): string {
  const [a, b] = (lines ?? "").split(/[,-]/);
  const anchor = a ? `#L${a}${b && lines?.includes("-") ? `-L${b}` : ""}` : "";
  return `${REPO}/blob/${facts.commit}/${path}${anchor}`;
}
