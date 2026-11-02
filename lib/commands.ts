import type { Dir } from "./layout";
import type { ThemeSlug } from "./themes";

export type AppKind = "terminal" | "editor" | "monitor" | "git" | "keys";
export type View = "stock" | "tuned" | "split";
export type Toggle = "night" | "dnd" | "idle";

/** Everything a keybinding, a menu row or a shell command can ask the desktop to do. */
export type Command =
  | { type: "open"; app: AppKind; file?: string; run?: string }
  | { type: "launcher" }
  | { type: "menu"; path?: string[] }
  | { type: "close" }
  | { type: "fullscreen" }
  | { type: "flip" }
  | { type: "focus"; dir: Dir }
  | { type: "swap"; dir: Dir }
  | { type: "workspace"; n: number }
  | { type: "send"; n: number }
  | { type: "toggle"; what: Toggle }
  | { type: "view"; view: View }
  | { type: "view-cycle" }
  | { type: "theme"; slug: ThemeSlug }
  | { type: "volume"; delta: number }
  | { type: "brightness"; delta: number }
  | { type: "wallpaper" }
  | { type: "screenshot" }
  | { type: "lock" }
  | { type: "restart" }
  | { type: "shutdown" }
  | { type: "notify"; title: string; body: string; who?: string; critical?: boolean }
  | { type: "link"; href: string };

export const VIEWS: View[] = ["stock", "split", "tuned"];

export const APP_TITLES: Record<AppKind, string> = {
  terminal: "Terminal",
  editor: "Neovim",
  monitor: "btop",
  git: "lazygit",
  keys: "Keybindings",
};
