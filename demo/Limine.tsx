"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState, type ReactNode } from "react";
import { layer } from "@/design/tokens/layer.stylex";
import { machine } from "@/design/tokens/machine.stylex";
import { font } from "@/design/tokens/type.stylex";

// Limine's menu as Omarchy configures it, from research/omarchy/spec/limine.json (Limine v12.9.6,
// limine-entry-tool 1.40.0, limine-snapper-sync 1.32.1). A key during the quiet 1s timeout reveals it,
// with no countdown; Enter on a kernel boots it.

/** Toshiba Satellite 8x16 glyphs with one pixel of spacing: 9x16 cells. grid.cell. */
const CELL = { w: 9, h: 16 };

export type Entry = { name: string; comment: string; kids?: Entry[]; open?: boolean };

/** The tree limine-entry-tool and limine-snapper-sync write for a default install. limine.json entries. */
export function defaultTree(now: Date): Entry[] {
  const stamp = (daysAgo: number, hh: number, mm: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hh, mm, 30);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  const kernel: Entry = { name: "linux-omarchy", comment: "Kernel version: 7.2.8-9-omarchy" };
  // Snapshots, newest first, each holding the kernel saved with it. ent.snapshot.*.
  const snapshots: Entry[] = [5, 4, 3, 2, 1].map((id, i) => ({
    name: `ID=${id} ${stamp(i * 3, 18 - i, 10 + i * 7)}`,
    comment: "4.0.0.alpha",
    kids: [{ ...kernel }],
  }));
  return [
    {
      name: "Omarchy",
      comment: "Omarchy",
      open: true,
      kids: [kernel, { name: "Snapshots", comment: `${snapshots.length} snapshots`, kids: snapshots }],
    },
  ];
}

type Line = { entry: Entry; path: number[]; text: string; nameAt: number };

/**
 * Visible lines: top level "[-] name", nested "├──► leaf" or "└[+] dir", with guides for open
 * ancestors that have more siblings below. menu.tree.prefix.
 */
export function lines(tree: Entry[]): Line[] {
  const out: Line[] = [];
  const walk = (list: Entry[], depth: number, guides: string, path: number[]) => {
    list.forEach((e, i) => {
      const last = i === list.length - 1;
      const mark = e.kids ? (e.open ? "[-]" : "[+]") : depth === 0 ? "   " : "──►";
      const prefix = depth === 0 ? mark : ` ${guides}${last ? "└" : "├"}${mark}`;
      out.push({ entry: e, path: [...path, i], text: `${prefix} ${e.name} `, nameAt: prefix.length });
      if (e.kids && e.open) walk(e.kids, depth + 1, depth === 0 ? "" : `${guides}${last ? "  " : "│ "}`, [...path, i]);
    });
  };
  walk(tree, 0, "", []);
  return out;
}

function toggle(tree: Entry[], path: number[]): Entry[] {
  return tree.map((e, i) => {
    if (i !== path[0]) return e;
    if (path.length === 1) return { ...e, open: !e.open };
    return { ...e, kids: toggle(e.kids ?? [], path.slice(1)) };
  });
}

const s = stylex.create({
  root: { position: "fixed", inset: 0, zIndex: layer.boot, overflow: "hidden", backgroundColor: machine.boot, color: machine.limineInk },
  row: { position: "absolute", display: "flex", height: `${CELL.h}px`, lineHeight: `${CELL.h}px`, fontFamily: font.mono, fontSize: machine.limineGlyph },
  // Each character in its own cell, so the grid holds whatever font draws the box glyphs.
  cell: { display: "inline-block", width: `${CELL.w}px`, textAlign: "center", whiteSpace: "pre", overflow: "visible" },
  brand: { color: machine.limineBrand },
  comment: { color: machine.limineComment },
  // Reverse video over " name ": term_foreground behind, the background colour in front. menu.tree.selected.
  selected: { backgroundColor: machine.limineInk, color: machine.boot },
});

const at = stylex.create({ row: (x: number, y: number) => ({ left: `${x}px`, top: `${y}px` }) });

function Cells({ text, style }: { text: string; style?: stylex.StyleXStyles }) {
  return (
    <>
      {[...text].map((c, i) => (
        <span key={i} {...stylex.props(s.cell, style)}>
          {c}
        </span>
      ))}
    </>
  );
}

/** Help lines: keys in the branding colour, labels in the text colour. menu.help.colour. */
function Help({ parts }: { parts: [string, string][] }) {
  return (
    <>
      {parts.map(([key, label], i) => (
        <span key={key}>
          <Cells text={key} style={s.brand} />
          <Cells text={` ${label}${i < parts.length - 1 ? "    " : ""}`} />
        </span>
      ))}
    </>
  );
}

const len = (parts: [string, string][]) => parts.reduce((n, [k, l]) => n + k.length + 1 + l.length, 0) + 4 * (parts.length - 1);

export function LimineMenu({ onBoot, now }: { onBoot: () => void; now: Date }) {
  const [tree, setTree] = useState(() => defaultTree(now));
  // default_entry 2 selects linux-omarchy. quiet.default.
  const [sel, setSel] = useState(1);
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  const visible = lines(tree);
  const cur = visible[Math.min(sel, visible.length - 1)];

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setSel((i) => Math.max(0, Math.min(visible.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!cur) return;
        if (cur.entry.kids) setTree((t) => toggle(t, cur.path));
        else onBoot();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible.length, cur, onBoot]);

  // The grid fills the screen in whole cells, centred: 213x67 at 1920x1080. grid.size, grid.offset.
  const cols = Math.floor(size.w / CELL.w);
  const rows = Math.floor(size.h / CELL.h);
  const ox = Math.floor((size.w % CELL.w) / 2);
  const oy = Math.floor((size.h % CELL.h) / 2);
  const row = (r: number, c: number, body: ReactNode, key: string) => (
    <div key={key} {...stylex.props(s.row, at.row(ox + c * CELL.w, oy + r * CELL.h))}>
      {body}
    </div>
  );
  const centre = (n: number) => Math.floor((cols - n) / 2);

  const brand = "Omarchy Bootloader";
  const primary: [string, string][] = cur?.entry.kids
    ? [
        ["ARROWS", "Select"],
        ["ENTER", cur.entry.open ? "Collapse" : "Expand"],
      ]
    : [
        ["ARROWS", "Select"],
        ["ENTER", "Boot"],
        ["E", "Edit"],
      ];
  const secondary: [string, string][] = [
    ["S", "Firmware Setup"],
    ["B", "Blank Entry"],
  ];
  // The tree is one left-aligned block, centred on its widest line, never above row 8. menu.tree.*.
  const widest = Math.max(...visible.map((l) => l.text.length));
  const left = Math.floor((cols - widest - 3) / 2);
  const top = Math.max(Math.floor((rows - visible.length) / 2), 8);
  const comment = cur?.entry.comment ?? "";

  return (
    <div role="dialog" aria-label="Limine boot menu" data-stage="limine" {...stylex.props(s.root)}>
      {row(1, centre(brand.length), <Cells text={brand} style={s.brand} />, "brand")}
      {row(3, centre(len(primary)), <Help parts={primary} />, "help")}
      {row(5, centre(len(secondary)), <Help parts={secondary} />, "help2")}
      <div role="listbox" aria-label="Boot entries" aria-activedescendant={`limine-${sel}`}>
        {visible.map((l, i) =>
          row(
            top + i,
            left,
            <span id={`limine-${i}`} role="option" aria-selected={i === sel}>
              <Cells text={l.text.slice(0, l.nameAt)} />
              <Cells text={l.text.slice(l.nameAt)} style={i === sel ? s.selected : undefined} />
            </span>,
            `l${i}`,
          ),
        )}
      </div>
      {row(rows - 2, centre(comment.length), <Cells text={comment} style={s.comment} />, "comment")}
    </div>
  );
}
