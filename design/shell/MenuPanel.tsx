"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { chromeLabel, face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { size, stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { Icon } from "./Icon";

export type MenuRow = { key: string; glyph: string; name: string; desc: string; hint?: string; more?: boolean };

const s = stylex.create({
  panel: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "480px",
    textAlign: "left",
    backgroundColor: chrome.panelBg,
    border: chrome.menuBorder,
    color: color["--text"],
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: space.u3,
    height: size.controlLg,
    paddingInline: space.u4,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    color: color["--text-3"],
  },
  trail: { whiteSpace: "nowrap" },
  list: { listStyle: "none", margin: 0, padding: space.u1, display: "flex", flexDirection: "column", maxHeight: "340px", overflowY: "auto" },
  row: {
    display: "grid",
    gridTemplateColumns: `${size.glyph} auto minmax(0, 1fr) auto`,
    alignItems: "center",
    gap: space.u3,
    height: chrome.row,
    paddingInline: space.u3,
    cursor: "pointer",
    color: color["--text"],
  },
  sel: { backgroundColor: chrome.selBg, boxShadow: chrome.selRing },
  glyph: { display: "grid", placeItems: "center", width: size.glyph, height: size.glyph, color: color["--text-2"], backgroundColor: chrome.iconBox },
  glyphSel: { color: color["--accent"] },
  name: { fontWeight: chrome.uiWeight, whiteSpace: "nowrap" },
  desc: { display: chrome.desc, color: color["--text-2"], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  hint: { display: "inline-flex", alignItems: "center", gap: space.u1, color: color["--text-3"], whiteSpace: "nowrap", textTransform: "none" },
  hintSel: { color: color["--text-2"] },
  hintText: { display: chrome.desc },
  empty: { paddingBlock: space.u3, paddingInline: space.u3, color: color["--text-3"] },
  foot: {
    display: chrome.desc,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingBlock: space.u2,
    paddingInline: space.u4,
    borderTopWidth: stroke.hair,
    borderTopStyle: "solid",
    borderTopColor: color["--line"],
    textTransform: "none",
  },
});

export type MenuPanelProps = {
  label: string;
  trail: string[];
  /** The search input, or static text in a preview. */
  search: ReactNode;
  rows: MenuRow[];
  sel: number;
  empty?: string;
  listId?: string;
  onPick?: (i: number) => void;
  onHover?: (i: number) => void;
};

export function rowId(listId: string, i: number) {
  return `${listId}-${i}`;
}

/** The Omarchy menu card, tuned: name, description and shortcut on one row height everywhere. */
export function MenuPanel({ label, trail, search, rows, sel, empty = "Nothing matches.", listId = "menu", onPick, onHover }: MenuPanelProps) {
  return (
    <div {...stylex.props(s.panel)}>
      <div {...stylex.props(s.search)}>
        <Icon name="search" />
        {search}
        <span {...stylex.props(chromeLabel.base, s.trail)}>{["Omarchy", ...trail].join(" › ")}</span>
      </div>
      <ul role="listbox" id={listId} aria-label={label} {...stylex.props(s.list)}>
        {rows.length === 0 && <li {...stylex.props(typo.small, face.ui, s.empty)}>{empty}</li>}
        {rows.map((r, i) => (
          <li
            key={r.key}
            id={rowId(listId, i)}
            role="option"
            aria-selected={i === sel}
            onPointerDown={(e) => {
              e.preventDefault();
              onPick?.(i);
            }}
            onPointerEnter={() => onHover?.(i)}
            {...stylex.props(s.row, i === sel && s.sel)}
          >
            <span aria-hidden {...stylex.props(typo.caption, face.mono, s.glyph, i === sel && s.glyphSel)}>
              {r.glyph}
            </span>
            <span {...stylex.props(typo.small, face.ui, s.name)}>{r.name}</span>
            <span {...stylex.props(typo.caption, face.ui, s.desc)}>{r.desc}</span>
            <span {...stylex.props(typo.label, s.hint, i === sel && s.hintSel)}>
              {r.hint && <span {...stylex.props(s.hintText)}>{r.hint}</span>}
              {r.more && <Icon name="chevron" />}
            </span>
          </li>
        ))}
      </ul>
      <div {...stylex.props(typo.label, s.foot)}>↑↓ move · Enter open · ← back · Esc close</div>
    </div>
  );
}
