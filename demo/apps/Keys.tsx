"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { Chord } from "@/design/components/Kbd";
import { color } from "@/design/tokens/color.stylex";
import { face, ink, typo } from "@/design/primitives/typography";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Segmented } from "@/design/components/Segmented";
import { BINDINGS, GROUPS, sheet } from "@/lib/keymap";
import { REF_BINDINGS, REF_VERSION } from "@/lib/reference.generated";
import type { AppProps } from "./types";

const s = stylex.create({
  root: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
  bar: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: space.u2,
    paddingRight: space.u2,
    backgroundColor: color["--sunken"],
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  search: {
    flex: 1,
    minWidth: 0,
    height: "36px",
    paddingInline: "12px",
    borderWidth: 0,
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
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "dashed",
    borderBottomColor: color["--line"],
  },
  today: { color: color["--accent"] },
  note: { margin: 0, color: color["--text-3"] },
});

const WORKS = new Set(BINDINGS.map((b) => b.chord));
const REF_GROUPS = [...new Set(REF_BINDINGS.map((b) => b.group))];

export function Keys({ win, live, interactive, dispatch }: AppProps<"keys">) {
  const input = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"tuned" | "omarchy">("omarchy");
  const q = win.data.q.trim().toLowerCase();

  useEffect(() => {
    if (live) input.current?.focus({ preventScroll: true });
  }, [live]);

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.bar)}>
        <input
          ref={input}
          aria-label="Search keybindings"
          placeholder={tab === "omarchy" ? `Search Omarchy's ${REF_BINDINGS.length} bindings` : "Search the tuned grammar"}
          value={win.data.q}
          readOnly={!interactive}
          tabIndex={interactive ? 0 : -1}
          onChange={(e) => dispatch({ type: "keys-q", id: win.id, q: e.target.value })}
          {...stylex.props(typo.small, face.mono, s.search)}
        />
        <Segmented
          label="Which bindings"
          value={tab}
          onChange={setTab}
          options={[
            { id: "omarchy", label: "Omarchy 4" },
            { id: "tuned", label: "Tuned" },
          ]}
        />
      </div>
      <div {...stylex.props(s.list)}>
        {tab === "tuned" ? (
          <>
            <p {...stylex.props(typo.caption, face.mono, s.note)}>
              Alt stands in for Super in the browser. Alt+Ctrl stands in for Super+Alt. • marks a binding Omarchy uses today.
            </p>
            {GROUPS.map((g) => {
              const rows = sheet(g.group).filter((r) => !q || `${r.label} ${r.chord}`.toLowerCase().includes(q));
              if (!rows.length) return null;
              return (
                <div key={g.group} {...stylex.props(s.group)}>
                  <div {...stylex.props(typo.label, ink.faint, s.label)}>
                    {g.mods} · {g.verb}
                  </div>
                  {rows.map((r) => (
                    <div key={r.chord} {...stylex.props(typo.caption, face.mono, s.row)}>
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
          </>
        ) : (
          <>
            <p {...stylex.props(typo.caption, face.mono, s.note)}>
              Read from Omarchy {REF_VERSION}&apos;s source. ✓ marks a binding that also works in this demo.
            </p>
            {REF_GROUPS.map((g) => {
              const rows = REF_BINDINGS.filter((b) => b.group === g && (!q || `${b.desc} ${b.chord}`.toLowerCase().includes(q)));
              if (!rows.length) return null;
              return (
                <div key={g} {...stylex.props(s.group)}>
                  <div {...stylex.props(typo.label, ink.faint, s.label)}>
                    {g} · {rows.length}
                  </div>
                  {rows.map((b, i) => (
                    <div key={`${b.chord}-${i}`} title={b.src} {...stylex.props(typo.caption, face.mono, s.row)}>
                      <span>
                        {b.desc}
                        {WORKS.has(b.chord) && <span {...stylex.props(s.today)}> ✓</span>}
                      </span>
                      <Chord chord={b.chord} />
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
