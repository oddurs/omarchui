"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { Chord } from "@/design/components/Kbd";
import { color } from "@/design/tokens/color.stylex";
import { ink } from "@/design/primitives/typography";
import { stroke } from "@/design/tokens/size.stylex";
import { shellspace } from "@/design/tokens/shellspace.stylex";
import { shelltype } from "@/design/tokens/shelltype.stylex";
import { weight } from "@/design/tokens/type.stylex";
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
    gap: shellspace.lg,
    paddingRight: shellspace.lg,
    backgroundColor: color["--sunken"],
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  search: {
    flex: 1,
    minWidth: 0,
    height: shellspace.controlHeight,
    paddingInline: shellspace.rowPadX,
    fontFamily: "inherit",
    fontSize: "inherit",
    borderWidth: 0,
    outline: "none",
    backgroundColor: color["--sunken"],
    color: color["--text"],
  },
  list: { flex: 1, minHeight: 0, overflow: "auto", padding: shellspace.rowPadX, display: "grid", gap: shellspace.panelGap, alignContent: "start" },
  group: { display: "grid" },
  // A group's caption reads as a panel's section header: caption size, strong, tracked. PanelSectionHeader.qml.
  label: { marginBottom: shellspace.sm, fontSize: shelltype.caption, fontWeight: weight.medium, letterSpacing: "1px", textTransform: "uppercase" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: shellspace.xxl,
    minHeight: shellspace.popupRow,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "dashed",
    borderBottomColor: color["--line"],
  },
  today: { color: color["--accent"] },
  note: { margin: 0, color: color["--text-3"], lineHeight: shelltype.copy },
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
          {...stylex.props(s.search)}
        />
        <Segmented
          label="Which bindings"
          face="mono"
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
            <p {...stylex.props(s.note)}>Alt stands in for Super in the browser. Alt+Ctrl stands in for Super+Alt. • marks a binding Omarchy uses today.</p>
            {GROUPS.map((g) => {
              const rows = sheet(g.group).filter((r) => !q || `${r.label} ${r.chord}`.toLowerCase().includes(q));
              if (!rows.length) return null;
              return (
                <div key={g.group} {...stylex.props(s.group)}>
                  <div {...stylex.props(ink.faint, s.label)}>
                    {g.mods} · {g.verb}
                  </div>
                  {rows.map((r) => (
                    <div key={r.chord} {...stylex.props(s.row)}>
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
            <p {...stylex.props(s.note)}>Read from Omarchy {REF_VERSION}&apos;s source. ✓ marks a binding that also works in this demo.</p>
            {REF_GROUPS.map((g) => {
              const rows = REF_BINDINGS.filter((b) => b.group === g && (!q || `${b.desc} ${b.chord}`.toLowerCase().includes(q)));
              if (!rows.length) return null;
              return (
                <div key={g} {...stylex.props(s.group)}>
                  <div {...stylex.props(ink.faint, s.label)}>
                    {g} · {rows.length}
                  </div>
                  {rows.map((b, i) => (
                    <div key={`${b.chord}-${i}`} title={b.src} {...stylex.props(s.row)}>
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
