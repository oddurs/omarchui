"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { chromeLabel, face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { size, stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { Icon } from "./Icon";

export type MenuRow = {
  key: string;
  glyph: string;
  name: string;
  desc: string;
  hint?: string;
  more?: boolean;
  /** Where a search result lives, drawn under its name in the stock view. */
  detail?: string;
  /** Draw a hairline above this row: the first deeper search result. */
  divider?: boolean;
};

const s = stylex.create({
  panel: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: chrome.menuWidth,
    padding: chrome.menuPad,
    textAlign: "left",
    backgroundColor: chrome.menuBg,
    borderWidth: chrome.menuBorderWidth,
    borderStyle: "solid",
    borderColor: chrome.menuBorderColor,
    color: chrome.menuInk,
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: space.u3,
    flexShrink: 0,
    height: chrome.menuHeader,
    paddingInline: chrome.menuSearchPad,
    marginBottom: chrome.menuHeaderGap,
    borderBottomWidth: chrome.menuHeaderRule,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    color: color["--text-3"],
  },
  searchChrome: { display: chrome.menuChrome, whiteSpace: "nowrap" },
  list: {
    listStyle: "none",
    margin: 0,
    padding: chrome.menuListPad,
    display: "flex",
    flexDirection: "column",
    gap: chrome.rowGap,
    maxHeight: "min(64vh, 560px)",
    overflowY: "auto",
  },
  row: {
    display: "grid",
    gridTemplateColumns: chrome.rowCols,
    alignItems: "center",
    columnGap: chrome.rowColGap,
    height: chrome.row,
    // In a scrolling column, rows would otherwise shrink below their height to fit.
    flexShrink: 0,
    paddingInline: chrome.rowPad,
    cursor: "pointer",
    color: chrome.menuInk,
  },
  rowDetail: { height: chrome.rowDetail },
  sel: { backgroundColor: chrome.selBg, boxShadow: chrome.selRing },
  glyph: {
    display: "grid",
    placeItems: "center",
    width: chrome.glyphCol,
    height: size.glyph,
    fontSize: chrome.glyphText,
    color: chrome.glyphInk,
    backgroundColor: chrome.iconBox,
  },
  glyphSel: { color: chrome.selText },
  label: { display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 },
  name: { fontSize: chrome.menuLabel, fontWeight: chrome.menuWeight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  nameSel: { color: chrome.selText },
  detail: {
    display: chrome.detailLine,
    fontSize: chrome.detailText,
    opacity: chrome.detailOpacity,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  desc: { gridColumn: chrome.descCol, display: chrome.desc, color: color["--text-2"], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  hint: {
    gridColumn: chrome.hintCol,
    display: "inline-flex",
    alignItems: "center",
    gap: space.u1,
    color: color["--text-3"],
    whiteSpace: "nowrap",
    textTransform: "none",
  },
  hintSel: { color: color["--text-2"] },
  hintText: { display: chrome.desc },
  chevIcon: { display: chrome.chevIcon },
  chevText: { display: chrome.chevText, fontSize: chrome.menuLabel, opacity: chrome.chevOpacity, color: chrome.menuInk },
  chevSel: { color: chrome.selText },
  divider: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    height: "17px",
    paddingInline: space.u1,
  },
  dividerLine: { flex: 1, height: stroke.hair, backgroundColor: "currentColor", opacity: 0.25 },
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

/**
 * The Omarchy menu card. Every difference between the tuned card and Omarchy's
 * (shell/plugins/menu/Menu.qml) is a chrome token, so the stock view is a theme, not a fork.
 */
export function MenuPanel({ label, trail, search, rows, sel, empty = "Nothing matches.", listId = "menu", onPick, onHover }: MenuPanelProps) {
  return (
    <div data-ref="menu" {...stylex.props(s.panel)}>
      <div {...stylex.props(s.search)}>
        <span {...stylex.props(s.searchChrome)}>
          <Icon name="search" />
        </span>
        {search}
        <span {...stylex.props(chromeLabel.base, s.searchChrome)}>{["Omarchy", ...trail].join(" › ")}</span>
      </div>
      <ul role="listbox" id={listId} aria-label={label} {...stylex.props(s.list)}>
        {rows.length === 0 && <li {...stylex.props(typo.small, face.ui, s.empty)}>{empty}</li>}
        {rows.flatMap((r, i) => [
          r.divider && (
            <li key={`${r.key}-divider`} role="presentation" aria-hidden {...stylex.props(s.divider)}>
              <span {...stylex.props(s.dividerLine)} />
            </li>
          ),
          <li
            key={r.key}
            id={rowId(listId, i)}
            data-ref="menu-row"
            data-ref-key={`row:${r.key}`}
            role="option"
            aria-selected={i === sel}
            onPointerDown={(e) => {
              e.preventDefault();
              onPick?.(i);
            }}
            onPointerEnter={() => onHover?.(i)}
            {...stylex.props(s.row, Boolean(r.detail) && s.rowDetail, i === sel && s.sel)}
          >
            <span aria-hidden {...stylex.props(typo.caption, face.mono, s.glyph, i === sel && s.glyphSel)}>
              {r.glyph}
            </span>
            <span {...stylex.props(s.label)}>
              <span {...stylex.props(typo.small, face.ui, s.name, i === sel && s.nameSel)}>{r.name}</span>
              {r.detail && <span {...stylex.props(typo.caption, face.ui, s.detail)}>{r.detail}</span>}
            </span>
            <span {...stylex.props(typo.caption, face.ui, s.desc)}>{r.detail ? `${r.detail} · ${r.desc}` : r.desc}</span>
            <span {...stylex.props(typo.label, s.hint, i === sel && s.hintSel)}>
              {r.hint && <span {...stylex.props(s.hintText)}>{r.hint}</span>}
              {r.more && (
                <>
                  <span {...stylex.props(s.chevIcon)}>
                    <Icon name="chevron" />
                  </span>
                  <span aria-hidden {...stylex.props(face.ui, s.chevText, i === sel && s.chevSel)}>
                    ›
                  </span>
                </>
              )}
            </span>
          </li>,
        ])}
      </ul>
      <div {...stylex.props(typo.label, s.foot)}>↑↓ move · Enter open · ← back · Esc close</div>
    </div>
  );
}
