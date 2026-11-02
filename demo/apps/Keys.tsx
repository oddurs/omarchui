"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";
import { Chord } from "@/design/components/Kbd";
import { color } from "@/design/tokens/color.stylex";
import { chromeLabel, face, typo } from "@/design/primitives/typography";
import { space } from "@/design/tokens/space.stylex";
import { GROUPS, sheet } from "@/lib/keymap";
import type { AppProps } from "./types";

const s = stylex.create({
  root: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
  search: {
    flexShrink: 0,
    height: "36px",
    paddingInline: "12px",
    borderWidth: 0,
    borderBottom: `1px solid ${color["--line"]}`,
    outline: "none",
    backgroundColor: color["--sunken"],
    color: color["--text"],
  },
  list: { flex: 1, minHeight: 0, overflow: "auto", paddingBlock: "8px 12px", paddingInline: "12px", display: "grid", gap: "14px", alignContent: "start" },
  group: { display: "grid", gap: "2px" },
  label: { marginBottom: space.u1 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    paddingBlock: "3px",
    borderBottom: `1px dashed ${color["--line"]}`,
  },
  today: { color: color["--accent"] },
  note: { margin: 0, color: color["--text-3"] },
});

export function Keys({ win, live, interactive, dispatch }: AppProps<"keys">) {
  const input = useRef<HTMLInputElement>(null);
  const q = win.data.q.trim().toLowerCase();

  useEffect(() => {
    if (live) input.current?.focus({ preventScroll: true });
  }, [live]);

  return (
    <div {...stylex.props(s.root)}>
      <input
        ref={input}
        aria-label="Search keybindings"
        placeholder="Search keybindings"
        value={win.data.q}
        readOnly={!interactive}
        tabIndex={interactive ? 0 : -1}
        onChange={(e) => dispatch({ type: "keys-q", id: win.id, q: e.target.value })}
        {...stylex.props(typo.small, face.ui, s.search)}
      />
      <div {...stylex.props(s.list)}>
        <p {...stylex.props(typo.caption, face.ui, s.note)}>
          Alt stands in for Super in the browser. Alt+Ctrl stands in for Super+Alt. • marks a binding Omarchy uses today.
        </p>
        {GROUPS.map((g) => {
          const rows = sheet(g.group).filter((r) => !q || `${r.label} ${r.chord}`.toLowerCase().includes(q));
          if (!rows.length) return null;
          return (
            <div key={g.group} {...stylex.props(s.group)}>
              <div {...stylex.props(chromeLabel.base, s.label)}>
                {g.mods} · {g.verb}
              </div>
              {rows.map((r) => (
                <div key={r.chord} {...stylex.props(typo.caption, face.ui, s.row)}>
                  <span>
                    {r.label}
                    {r.today && <span {...stylex.props(s.today)}> •</span>}
                  </span>
                  <Chord chord={r.chord} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
