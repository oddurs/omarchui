import { describe, expect, it } from "vitest";
import { HOME } from "@/lib/fs";
import { complete, run, tokenize, type Line } from "@/lib/shell";
import { THEMES } from "@/lib/themes";

const ctx = { cwd: HOME, theme: "tokyo-night" as const, history: [], now: new Date(2026, 10, 1, 14, 32) };
const text = (lines: Line[]) => lines.map((l) => l.map((s) => s.t).join("")).join("\n");

describe("tokenize", () => {
  it("keeps quoted arguments together", () => {
    expect(tokenize(`notify-send "Hello there" 'and you'`)).toEqual(["notify-send", "Hello there", "and you"]);
  });
});

describe("run", () => {
  it("lists the home folder without dotfiles unless asked", () => {
    expect(text(run("ls", ctx).out)).toBe("Code/  notes.txt");
    expect(text(run("ls -a", ctx).out)).toContain(".config/");
  });

  it("changes directory and reports errors for missing ones", () => {
    expect(run("cd .config/hypr", ctx).cwd).toBe(`${HOME}/.config/hypr`);
    const bad = run("cd nowhere", ctx);
    expect(bad.cwd).toBe(HOME);
    expect(text(bad.out)).toMatch(/No such file/);
  });

  it("cats a generated theme file", () => {
    expect(text(run("cat ~/.config/omarchy/themes/nord/theme.toml", ctx).out)).toContain(`accent    = "${THEMES.nord.accent}"`);
  });

  it("asks the desktop to change theme, and refuses unknown names", () => {
    expect(run("omarchy-theme-set nord", ctx).commands).toEqual([{ type: "theme", slug: "nord" }]);
    const bad = run("omarchy-theme-set solarized", ctx);
    expect(bad.commands).toEqual([]);
    expect(text(bad.out)).toMatch(/No theme named/);
  });

  it("opens apps through aliases", () => {
    expect(run("vim", ctx).commands).toEqual([{ type: "open", app: "editor", file: undefined }]);
    expect(run("htop", ctx).commands).toEqual([{ type: "open", app: "monitor" }]);
  });

  it("switches the before/after view", () => {
    expect(run("omarchui-view split", ctx).commands).toEqual([{ type: "view", view: "split" }]);
  });

  it("says when a command does not exist", () => {
    expect(text(run("rm -rf /", ctx).out)).toBe("bash: rm: command not found. Try help.");
  });

  it("flags clear and exit for the terminal to act on", () => {
    expect(run("clear", ctx).clear).toBe(true);
    expect(run("exit", ctx).exit).toBe(true);
  });
});

describe("complete", () => {
  it("completes commands, theme names and paths", () => {
    expect(complete("omarchy-theme-s", HOME)).toBe("omarchy-theme-set ");
    expect(complete("omarchy-theme-set kan", HOME)).toBe("omarchy-theme-set kanagawa ");
    expect(complete("cat .config/hy", HOME)).toBe("cat .config/hypr/");
  });

  it("stops at the common prefix when there are several matches", () => {
    expect(complete("omarchy-theme-set catp", HOME)).toBe("omarchy-theme-set catppuccin");
  });
});
