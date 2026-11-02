"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { shellspace } from "../tokens/shellspace.stylex";
import { shelltype } from "../tokens/shelltype.stylex";
import { color } from "../tokens/color.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

export type MenuRow = {
  key: string;
  glyph: string;
  name: string;
  /** Opens a submenu: drawn with a trailing "›". */
  more?: boolean;
  /** Where a search result lives, drawn under its name. */
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
  // The header is the filter field and nothing else. Menu.qml:1397-1430.
  search: { display: "flex", alignItems: "center", flexShrink: 0, height: chrome.menuHeader, marginBottom: chrome.menuHeaderGap },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
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
  sel: { backgroundColor: chrome.selBg },
  glyph: { display: "grid", placeItems: "center", width: chrome.glyphCol, fontSize: shelltype.iconLarge, color: chrome.glyphInk },
  glyphSel: { color: chrome.selText },
  label: { display: "flex", flexDirection: "column", gap: shellspace.xs, minWidth: 0 },
  name: { fontSize: shelltype.heading, fontWeight: chrome.menuWeight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  nameSel: { color: chrome.selText },
  detail: {
    fontSize: shelltype.bodySmall,
    opacity: chrome.detailOpacity,
    color: chrome.detailInk,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chev: { fontSize: shelltype.heading, opacity: chrome.chevOpacity, color: chrome.chevInk },
  chevSel: { color: chrome.selText },
  divider: { display: "flex", alignItems: "center", flexShrink: 0, height: "17px", paddingInline: space.u1 },
  dividerLine: { flex: 1, height: stroke.hair, backgroundColor: "currentColor", opacity: 0.25 },
  empty: { paddingBlock: space.u3, paddingInline: space.u3, color: color["--text-3"] },
});

export type MenuPanelProps = {
  label: string;
  /** The filter input, or static text in a preview. */
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
 * The Omarchy menu card (shell/plugins/menu/Menu.qml): a filter field, then rows of glyph,
 * name and a "›" for submenus. Tuned and stock differ only through chrome tokens.
 */
export function MenuPanel({ label, search, rows, sel, empty = "Nothing matches.", listId = "menu", onPick, onHover }: MenuPanelProps) {
  return (
    <div data-ref="menu" {...stylex.props(s.panel)}>
      <div {...stylex.props(s.search)}>{search}</div>
      <ul role="listbox" id={listId} aria-label={label} {...stylex.props(s.list)}>
        {rows.length === 0 && <li {...stylex.props(typo.small, face.mono, s.empty)}>{empty}</li>}
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
              <span {...stylex.props(typo.small, face.mono, s.name, i === sel && s.nameSel)}>{r.name}</span>
              {r.detail && <span {...stylex.props(typo.caption, face.mono, s.detail)}>{r.detail}</span>}
            </span>
            <span aria-hidden {...stylex.props(face.mono, s.chev, i === sel && s.chevSel)}>
              {r.more ? "›" : ""}
            </span>
          </li>,
        ])}
      </ul>
    </div>
  );
}
