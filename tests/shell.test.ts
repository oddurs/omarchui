import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HOME } from "@/lib/fs";
import { groupHelp, mainHelp } from "@/lib/omarchy-cli";
import { complete, prompt, run, tokenize, type Line } from "@/lib/shell";
import { THEMES } from "@/lib/themes";

// Exact strings come from the cited spec, by item id: research/omarchy/spec/terminal.json.
type Item = { id: string; value: string };
const spec = JSON.parse(readFileSync(path.join(import.meta.dirname, "../research/omarchy/spec/terminal.json"), "utf8")) as Record<string, { items?: Item[] }>;
const items = new Map(
  Object.values(spec)
    .flatMap((s) => s.items ?? [])
    .map((i) => [i.id, i.value]),
);
const value = (id: string) => {
  const v = items.get(id);
  if (v === undefined) throw new Error(`no spec item ${id}`);
  return v;
};

const ctx = { cwd: HOME, theme: "tokyo-night" as const, bg: 0, idle: true, history: [], now: new Date(2026, 10, 1, 14, 32) };
const text = (lines: Line[]) => lines.map((l) => l.map((s) => s.t).join("")).join("\n");
const out = (input: string, c = ctx) => text(run(input, c).out);

describe("tokenize", () => {
  it("keeps quoted arguments together", () => {
    expect(tokenize(`notify-send "Hello there" 'and you'`)).toEqual(["notify-send", "Hello there", "and you"]);
  });
});

describe("prompt (spec.prompt)", () => {
  it("reads `~ ❯ ` at home, tilde and chevron in bold cyan (starship.success)", () => {
    const p = prompt(HOME);
    expect(text([p])).toBe("~ ❯ ");
    for (const seg of p.filter((s) => s.t.trim())) expect(seg).toMatchObject({ c: "cyan", bold: true });
  });

  it("turns the chevron into ✗ after a failure (starship.error)", () => {
    expect(text([prompt(HOME, 127)])).toBe("~ ✗ ");
  });

  it("cuts the path to two components behind …/ (starship.dir.truncation)", () => {
    expect(text([prompt(`${HOME}/Work`)])).toBe("~/Work ❯ ");
    expect(text([prompt(`${HOME}/.config/hypr`)])).toBe("…/.config/hypr ❯ ");
  });

  it("shows the repo root and its branch inside a repository (starship.dir.repo_root, starship.branch)", () => {
    const p = prompt(`${HOME}/Work/omarchui`);
    expect(text([p])).toBe("omarchui main ❯ ");
    expect(p.find((s) => s.t === "main")).toMatchObject({ c: "cyan", italic: true });
  });
});

describe("ls is eza -lh (alias.ls, home.ls)", () => {
  it("starts with eza's header row and lists exactly the six home folders (home.dirs)", () => {
    const lines = out("ls").split("\n");
    expect(lines[0]).toBe("Permissions Size User Date Modified Name");
    expect(lines.slice(1).map((l) => l.split(" ").pop())).toEqual(value("home.dirs").split(" "));
    expect(lines[1]).toBe("drwxr-xr-x     - you  20 Oct 09:41  ▸ Documents");
  });

  it("shows dotfiles with lsa, directories first", () => {
    const names = out("lsa")
      .split("\n")
      .slice(1)
      .map((l) => l.split(" ").pop());
    expect(names[0]).toBe(".config");
    expect(names.at(-1)).toBe(".bashrc");
  });

  it("reports a missing path as eza does", () => {
    const res = run("ls nowhere", ctx);
    expect(text(res.out)).toBe(`"nowhere": No such file or directory (os error 2)`);
    expect(res.code).toBe(2);
  });
});

describe("cd is zoxide's zd (alias.cd)", () => {
  it("goes home with no argument and into a real directory", () => {
    expect(run("cd .config/hypr", ctx).cwd).toBe(`${HOME}/.config/hypr`);
    expect(run("cd", { ...ctx, cwd: `${HOME}/Work` }).cwd).toBe(HOME);
    expect(run("..", { ...ctx, cwd: `${HOME}/Work` }).cwd).toBe(HOME);
  });

  it("jumps by keyword and prints where it landed, or fails", () => {
    const res = run("cd hypr", ctx);
    expect(res.cwd).toBe(`${HOME}/.config/hypr`);
    expect(text(res.out)).toBe(`▸ ${HOME}/.config/hypr`);
    const bad = run("cd nowhere", ctx);
    expect(bad.cwd).toBe(HOME);
    expect(text(bad.out)).toBe("zoxide: no match found\nError: Directory not found");
    expect(bad.code).toBe(1);
  });
});

describe("aliases and functions (spec.shell)", () => {
  it("opens nvim with n (alias.n)", () => {
    expect(run("n", ctx).commands).toEqual([{ type: "open", app: "editor", file: undefined }]);
  });

  it("prints Omarchy's usage strings (fn.rsync, fn.ports, fn.tmux, fn.worktrees)", () => {
    expect(out("rsw")).toBe("Usage: rsw <source> <destination>");
    expect(out("lsw")).toBe("No active watches");
    expect(out("fip host")).toBe("Usage: fip <host> <port1> [port2] ...");
    expect(out("lip")).toBe("No active forwards");
    expect(out("tdl")).toBe("Usage: tdl <c|cx|codex|other_ai> [<second_ai>]");
    expect(out("ic")).toBe("You must start tmux to use tdl.");
    expect(out("tsl 2")).toBe("Usage: tsl <pane_count> <command>");
    expect(out("ga")).toBe("Usage: ga [branch name]");
  });

  it("says when a command does not exist, as bash does", () => {
    const res = run("vim", ctx);
    expect(text(res.out)).toBe("bash: vim: command not found");
    expect(res.code).toBe(127);
  });

  it("flags clear and exit for the terminal to act on", () => {
    expect(run("clear", ctx).clear).toBe(true);
    expect(run("exit", ctx).exit).toBe(true);
  });

  it("cats a generated theme file", () => {
    expect(out("cat ~/.config/omarchy/themes/nord/theme.toml")).toContain(`accent    = "${THEMES.nord.accent}"`);
  });

  it("switches the before/after view (demo only)", () => {
    expect(run("omarchui-view split", ctx).commands).toEqual([{ type: "view", view: "split" }]);
  });
});

describe("the omarchy dispatcher (spec.omarchy_cli)", () => {
  it("prints the main help for omarchy, --help and -h (cli.main-help)", () => {
    expect(mainHelp() + "\n").toBe(value("cli.main-help"));
    for (const cmd of ["omarchy", "omarchy --help", "omarchy -h"]) expect(out(cmd) + "\n").toBe(value("cli.main-help"));
  });

  it("treats `omarchy help` as unknown, exit 127 (cli.help-word)", () => {
    const res = run("omarchy help", ctx);
    expect(text(res.out) + "\n").toBe(value("cli.help-word"));
    expect(res.code).toBe(127);
  });

  it("suggests a group for a near miss (cli.unknown)", () => {
    expect(out("omarchy them") + "\n").toBe(value("cli.unknown"));
  });

  it.each([
    ["theme", "cmd.theme"],
    ["font", "cmd.font"],
    ["toggle", "cmd.toggle"],
    ["restart", "cmd.restart"],
    ["system", "cmd.system"],
  ])("prints the %s group table (%s)", (group, id) => {
    expect(groupHelp(group) + "\n").toBe(value(id));
    expect(out(`omarchy ${group}`) + "\n").toBe(value(id));
  });

  it("lists and reports themes (cmd.theme-list, cmd.theme-current, cmd.theme-bg-current)", () => {
    expect(out("omarchy theme list") + "\n").toBe(value("cmd.theme-list"));
    expect(out("omarchy theme current")).toBe(value("cmd.theme-current"));
    expect(out("omarchy theme bg current")).toBe(value("cmd.theme-bg-current"));
  });

  it("sets a theme silently, normalising its name (cmd.theme-set, cmd.theme-set-name)", () => {
    const res = run(`omarchy theme set "Rose Pine"`, ctx);
    expect(res.out).toEqual([]);
    expect(res.commands).toEqual([{ type: "theme", slug: "rose-pine" }]);
    expect(run("omarchy-theme-set nord", ctx).commands).toEqual([{ type: "theme", slug: "nord" }]);
    const bad = run("omarchy theme set solarized", ctx);
    expect(text(bad.out)).toBe("Theme 'solarized' does not exist");
    expect(bad.code).toBe(1);
  });

  it("shows command help when a required argument is missing, usage when run directly (notes)", () => {
    expect(out("omarchy theme set").split("\n").slice(0, 4)).toEqual(["Usage:", "  omarchy theme set <theme-name>", "", "Apply an Omarchy theme"]);
    expect(out("omarchy-theme-set")).toBe("Usage: omarchy-theme-set <theme-name>");
  });

  it("cycles the background silently (cmd.theme-bg-next)", () => {
    const res = run("omarchy theme bg next", ctx);
    expect(res.out).toEqual([]);
    expect(res.commands).toEqual([{ type: "bg-next" }]);
  });

  it("wires toggles, lock, menu and pickers to the desktop", () => {
    expect(run("omarchy toggle nightlight", ctx).commands).toEqual([{ type: "toggle", what: "night" }]);
    expect(run("omarchy toggle notification silencing", ctx).commands).toEqual([{ type: "toggle", what: "dnd" }]);
    expect(run("omarchy system lock", ctx).commands).toEqual([{ type: "lock" }]);
    expect(run("omarchy menu", ctx).commands).toEqual([{ type: "menu", path: [] }]);
    expect(run("omarchy menu summon appearance.theme", ctx).commands).toEqual([{ type: "menu", path: ["appearance", "appearance.theme"] }]);
    expect(run("omarchy theme switcher", ctx).commands).toEqual([{ type: "picker", mode: "theme" }]);
    expect(run("omarchy background", ctx).commands).toEqual([{ type: "picker", mode: "background" }]);
    expect(run("omarchy reboot", ctx).commands).toEqual([{ type: "restart" }]);
  });

  it("prints the idle state it leaves behind (cmd.toggle-idle)", () => {
    const res = run("omarchy toggle idle", ctx);
    expect(text(res.out)).toBe("disabled");
    expect(res.commands).toEqual([{ type: "toggle", what: "idle" }]);
    expect(out("omarchy toggle idle allow-idle")).toBe("enabled");
  });

  it("prints the menu's own usage for `omarchy menu help` (cmd.menu-help)", () => {
    expect(out("omarchy menu help") + "\n").toBe(value("cmd.menu-help"));
  });

  it("says what the demo cannot run, rather than pretending", () => {
    expect(out("omarchy restart wifi")).toBe("omarchy restart wifi: not in this demo");
  });

  it("follows the --help layout (cli.command-help)", () => {
    expect(out("omarchy theme bg-switcher --help")).toBe(
      [
        "Usage:",
        "  omarchy theme bg-switcher",
        "",
        "Open the Omarchy background switcher",
        "",
        "Aliases:",
        "  omarchy background",
        "",
        "Binary:",
        "  omarchy-theme-bg-switcher",
        "",
        "Filename route:",
        "  omarchy theme bg switcher",
      ].join("\n"),
    );
  });
});

describe("fastfetch (spec.fastfetch)", () => {
  const lines = run("fastfetch", ctx).out;
  const rows = lines.map((l) => text([l]));

  it("draws the logo in green blocks, two rows down and two columns in (ff.logo.text, ff.logo.padding)", () => {
    const logo = value("ff.logo.text").trimEnd().split("\n");
    expect(rows.slice(2, 2 + logo.length).map((r) => r.slice(2, 56))).toEqual(logo);
    expect(rows[0]!.trim()).toBe("");
    expect(lines[2]!.filter((s) => s.block).every((s) => s.c === "green")).toBe(true);
  });

  it("frames three sections in the module column, 62 cells in (ff.lead, ff.hw.head, ff.sw.head, ff.age.head, ff.box.bottom, ff.trail)", () => {
    const col = rows.map((r) => r.slice(62));
    expect(col.slice(0, 2)).toEqual(["", ""]);
    expect(col[2]).toBe(value("ff.hw.head"));
    expect(col[10]).toBe(value("ff.box.bottom"));
    expect(col[12]).toBe(value("ff.sw.head"));
    expect(col).toContain(value("ff.age.head"));
    expect(col.filter((r) => r === value("ff.box.bottom"))).toHaveLength(3);
    expect(col.at(-1)).toBe("");
  });

  it("colours keys per section and reports Omarchy and the theme (ff.hw.host, ff.sw.os, ff.age.os, ff.sw.theme)", () => {
    const key = (label: string) => lines.map((l) => l.find((s) => s.c && !s.block && s.t.endsWith(label))).find(Boolean);
    expect(key(" PC")).toMatchObject({ c: "green" });
    expect(key(" OS")).toMatchObject({ c: "blue" });
    expect(key(" OS Age")).toMatchObject({ c: "magenta" });
    expect(rows.some((r) => r.endsWith(": Omarchy 4.0.0.alpha"))).toBe(true);
    expect(rows.some((r) => r.endsWith(": Tokyo Night ●●●●●●●●"))).toBe(true);
  });

  it("clips rather than wraps (ff.linewrap)", () => {
    expect(lines.every((l) => l.some((s) => s.nowrap))).toBe(true);
  });
});

describe("complete", () => {
  it("hides omarchy-* binaries and completes omarchy's own words (completion.hide, completion.omarchy)", () => {
    expect(complete("omarchy-theme-s", HOME)).toBe("omarchy-theme-s");
    expect(complete("omarchy th", HOME)).toBe("omarchy theme ");
    expect(complete("omarchy toggle idle st", HOME)).toBe("omarchy toggle idle sta");
    expect(complete("omarchy toggle idle stay", HOME)).toBe("omarchy toggle idle stay-awake ");
  });

  it("completes paths case-insensitively (inputrc.options)", () => {
    expect(complete("cat .config/hy", HOME)).toBe("cat .config/hypr/");
    expect(complete("cd doc", HOME)).toBe("cd Documents/");
  });
});
