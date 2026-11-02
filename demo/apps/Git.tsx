"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";
import { color } from "@/design/tokens/color.stylex";
import type { AppProps } from "./types";

// A plausible history for a tuning branch against Omarchy 4's real files.
const COMMITS = [
  {
    sha: "a41c9e2",
    msg: "Underline the active workspace",
    diff: [
      "shell/plugins/bar/widgets/Workspaces.qml",
      "-  text: isActive ? layoutGlyph : label",
      "+  text: label",
      "+  underline: isActive ? 2 : 0   // accent, 2px",
    ],
  },
  {
    sha: "7f02b1d",
    msg: "Menu rows to 36px, labels to 13px",
    diff: [
      "shell/plugins/menu/Menu.qml",
      "-  rowHeight: Style.space(50)",
      "+  rowHeight: Style.space(36)   // 9u",
      "-  font.pixelSize: Style.font.heading",
      "+  font.pixelSize: Style.font.subtitle",
    ],
  },
  {
    sha: "19d8e6a",
    msg: "One focus ring: 1px plus halo",
    diff: ["default/hypr/looknfeel.lua", "-    border_size = 2,", "+    border_size = 1,", "+    -- halo: 3px at 32% accent, drawn by the shell"],
  },
  {
    sha: "c03e5f7",
    msg: "A sans for human text",
    diff: [
      "shell/Commons/Style.qml",
      '-  readonly property string ui: "monospace"',
      '+  readonly property string ui: "Instrument Sans"',
      "+  // machine text stays monospace",
    ],
  },
  {
    sha: "8be1a40",
    msg: "Spacing on one 4px unit",
    diff: ["shell/Commons/Style.qml", "-  // xxs xs sm md lg xl xxl xxxl huge: 2 3 4 6 8 10 12 14 18", "+  // u1..u12: 4 8 12 16 24 32 48"],
  },
  {
    sha: "3d9f210",
    msg: "Name colours by role in shell.toml.tpl",
    diff: ["default/themed/shell.toml.tpl", '-border = "{{ mix foreground background 25% }}"', '+border = "{{ line }}"'],
  },
  {
    sha: "e5a7c33",
    msg: "Gaps on the unit",
    diff: ["default/hypr/looknfeel.lua", "-    gaps_in = 5,", "+    gaps_in = 4,", "-    gaps_out = 10,", "+    gaps_out = 12,"],
  },
];

const s = stylex.create({
  root: {
    flex: 1,
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
    gap: "1px",
    backgroundColor: color["--line"],
    outline: "none",
  },
  col: { minHeight: 0, display: "grid", gridAutoRows: "min-content", alignContent: "start", gap: "1px", backgroundColor: color["--line"], overflow: "hidden" },
  panel: { backgroundColor: color["--surface"], paddingBlock: "6px", paddingInline: "10px" },
  diff: { backgroundColor: color["--surface"], paddingBlock: "6px", paddingInline: "10px", overflow: "auto", minHeight: 0 },
  title: { color: color["--accent"] },
  active: { color: color["--green"] },
  faint: { color: color["--text-3"] },
  yellow: { color: color["--yellow"] },
  row: { display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingInline: "4px", marginInline: "-4px" },
  sel: { backgroundColor: color["--tint"], boxShadow: `inset 2px 0 0 ${color["--accent"]}` },
  add: { color: color["--green"] },
  del: { color: color["--red"] },
  hint: { color: color["--text-3"], marginTop: "6px" },
});

export function Git({ win, live, interactive, dispatch }: AppProps<"git">) {
  const root = useRef<HTMLDivElement>(null);
  const sel = win.data.sel;
  const commit = COMMITS[sel] ?? COMMITS[0];

  useEffect(() => {
    if (live) root.current?.focus({ preventScroll: true });
  }, [live]);

  const go = (n: number) => dispatch({ type: "git-sel", id: win.id, sel: (n + COMMITS.length) % COMMITS.length });

  return (
    <div
      ref={root}
      tabIndex={interactive ? 0 : -1}
      role="listbox"
      aria-label="Commits"
      aria-activedescendant={`${win.id}-c${sel}`}
      onKeyDown={(e) => {
        if (e.altKey || e.metaKey) return;
        if (e.key === "j" || e.key === "ArrowDown") {
          e.preventDefault();
          go(sel + 1);
        } else if (e.key === "k" || e.key === "ArrowUp") {
          e.preventDefault();
          go(sel - 1);
        }
      }}
      {...stylex.props(s.root)}
    >
      <div {...stylex.props(s.col)}>
        <div {...stylex.props(s.panel)}>
          <span {...stylex.props(s.title)}>Status</span> <span {...stylex.props(s.faint)}>─</span> omarchui → <span {...stylex.props(s.active)}>main</span>
        </div>
        <div {...stylex.props(s.panel)}>
          <div {...stylex.props(s.title)}>Files</div>
          <span {...stylex.props(s.row)}>
            <span {...stylex.props(s.yellow)}>M</span> looknfeel.lua
          </span>
          <span {...stylex.props(s.row)}>
            <span {...stylex.props(s.yellow)}>M</span> Style.qml
          </span>
          <span {...stylex.props(s.row)}>
            <span {...stylex.props(s.active)}>A</span> theme.toml
          </span>
        </div>
        <div {...stylex.props(s.panel)}>
          <div {...stylex.props(s.title)}>Commits</div>
          {COMMITS.map((c, i) => (
            <span
              key={c.sha}
              id={`${win.id}-c${i}`}
              role="option"
              aria-selected={i === sel}
              onPointerDown={() => go(i)}
              {...stylex.props(s.row, i === sel && s.sel)}
            >
              <span {...stylex.props(s.yellow)}>{c.sha}</span> {c.msg}
            </span>
          ))}
          <div {...stylex.props(s.hint)}>j/k move</div>
        </div>
      </div>
      <div {...stylex.props(s.diff)}>
        <div {...stylex.props(s.title)}>
          {commit?.sha} {commit?.msg}
        </div>
        {commit?.diff.map((l, i) => (
          <div key={i} {...stylex.props(i === 0 ? s.faint : l.startsWith("+") ? s.add : l.startsWith("-") ? s.del : null)}>
            {i === 0 ? `── ${l}` : l}
          </div>
        ))}
      </div>
    </div>
  );
}
