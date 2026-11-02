"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useLayoutEffect, useRef } from "react";
import { color } from "@/design/tokens/color.stylex";
import { shellspace } from "@/design/tokens/shellspace.stylex";
import { shelltype } from "@/design/tokens/shelltype.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { font, weight } from "@/design/tokens/type.stylex";
import { complete, prompt, type Line } from "@/lib/shell";
import { tones } from "../tones";
import type { AppProps } from "./types";

const s = stylex.create({
  // foot pads the cell grid with 14px of background. config/foot/foot.ini:5.
  root: { flex: 1, minHeight: 0, overflowY: "auto", padding: shellspace.xxxl, cursor: "text" },
  line: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", minHeight: shelltype.termLine },
  // A program that turns auto-wrap off, as fastfetch does, is cut at the edge.
  clip: { whiteSpace: "pre", overflow: "hidden" },
  // SGR bold; semibold is the system's heaviest working weight.
  bold: { fontWeight: weight.semibold },
  italic: { fontStyle: "italic" },
  underline: { textDecorationLine: "underline" },
  block: { display: "inline-block", height: shelltype.termLine, verticalAlign: "top", backgroundColor: "currentColor" },
  inputRow: { display: "flex", alignItems: "baseline" },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: color["--text"],
    fontFamily: font.mono,
    fontSize: "inherit",
    lineHeight: "inherit",
    caretColor: color["--accent"],
  },
});

const cells = stylex.create({ w: (n: number) => ({ width: `${n}ch` }) });

// The demo's JetBrains Mono subset has no box drawing, and fallback fonts draw it wider than a
// cell and shorter than a line, so frames would not meet. Foot draws these characters itself;
// so does this: each is a cell of lines in the text colour.
const LINE = "linear-gradient(currentColor, currentColor)";
const LINES = `${LINE}, ${LINE}`;
const box = stylex.create({
  cell: { display: "inline-block", height: shelltype.termLine, verticalAlign: "top", backgroundRepeat: "no-repeat" },
  "─": { backgroundImage: LINE, backgroundPosition: "0 50%", backgroundSize: `100% ${stroke.hair}` },
  "│": { backgroundImage: LINE, backgroundPosition: "50% 0", backgroundSize: `${stroke.hair} 100%` },
  "┌": { backgroundImage: LINES, backgroundPosition: "100% 50%, 50% 100%", backgroundSize: `50% ${stroke.hair}, ${stroke.hair} 50%` },
  "┐": { backgroundImage: LINES, backgroundPosition: "0 50%, 50% 100%", backgroundSize: `50% ${stroke.hair}, ${stroke.hair} 50%` },
  "└": { backgroundImage: LINES, backgroundPosition: "100% 50%, 50% 0", backgroundSize: `50% ${stroke.hair}, ${stroke.hair} 50%` },
  "┘": { backgroundImage: LINES, backgroundPosition: "0 50%, 50% 0", backgroundSize: `50% ${stroke.hair}, ${stroke.hair} 50%` },
  "├": { backgroundImage: LINES, backgroundPosition: "50% 0, 100% 50%", backgroundSize: `${stroke.hair} 100%, 50% ${stroke.hair}` },
  // Other glyphs outside the subset come from a fallback font at its own width; a one-cell box keeps the grid.
  glyph: { display: "inline-block", width: "1ch", textAlign: "center" },
});
type BoxChar = "─" | "│" | "┌" | "┐" | "└" | "┘" | "├";
const isBox = (ch: string): ch is BoxChar => ch in box && ch.length === 1;
/** In the font: ASCII, Latin-1 and general punctuation (…, ›). Anything else needs a cell. */
const inFont = (ch: string) => {
  const cp = ch.codePointAt(0) ?? 0;
  return cp <= 0xff || (cp >= 0x2000 && cp <= 0x206f);
};

/** Splits text into plain runs, runs of one box character, and lone out-of-font glyphs. */
function pieces(text: string): { kind: "text" | "box" | "glyph"; t: string }[] {
  const out: { kind: "text" | "box" | "glyph"; t: string }[] = [];
  for (const ch of text) {
    const kind = isBox(ch) ? "box" : inFont(ch) ? "text" : "glyph";
    const last = out.at(-1);
    if (last && last.kind === kind && kind !== "glyph" && (kind === "text" || last.t[0] === ch)) last.t += ch;
    else out.push({ kind, t: ch });
  }
  return out;
}

function Row({ line }: { line: Line }) {
  return (
    <div {...stylex.props(s.line, line.some((seg) => seg.nowrap) && s.clip)}>
      {line.map((seg, i) =>
        seg.block ? (
          <span key={i} aria-hidden {...stylex.props(seg.c && tones[seg.c], s.block, cells.w(seg.t.length))} />
        ) : (
          <span key={i} {...stylex.props(seg.c && tones[seg.c], seg.bold && s.bold, seg.italic && s.italic, seg.underline && s.underline)}>
            {pieces(seg.t).map((p, j) =>
              p.kind === "text" ? (
                p.t
              ) : p.kind === "box" ? (
                <span key={j} aria-hidden {...stylex.props(box.cell, box[p.t[0] as BoxChar], cells.w(p.t.length))} />
              ) : (
                <span key={j} {...stylex.props(box.glyph)}>
                  {p.t}
                </span>
              ),
            )}
          </span>
        ),
      )}
    </div>
  );
}

export function Terminal({ win, live, interactive, dispatch }: AppProps<"terminal">) {
  const d = win.data;
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [d.lines.length]);

  useEffect(() => {
    if (live) input.current?.focus({ preventScroll: true });
  }, [live]);

  return (
    <div ref={scroller} {...stylex.props(s.root)} onClick={() => input.current?.focus({ preventScroll: true })}>
      {d.lines.map((l, i) => (
        <Row key={i} line={l} />
      ))}
      {d.lines.length > 0 && <Row line={[]} />}
      <div {...stylex.props(s.inputRow)}>
        <Row line={prompt(d.cwd, d.code)} />
        <input
          ref={input}
          aria-label="Terminal input"
          value={d.input}
          readOnly={!interactive}
          tabIndex={interactive ? 0 : -1}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          onChange={(e) => dispatch({ type: "term-input", id: win.id, input: e.target.value })}
          onKeyDown={(e) => {
            if (e.altKey || e.metaKey) return;
            if (e.key === "Enter") {
              e.preventDefault();
              dispatch({ type: "term-submit", id: win.id, now: new Date() });
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              dispatch({ type: "term-history", id: win.id, dir: e.key === "ArrowUp" ? -1 : 1 });
            } else if (e.key === "Tab") {
              e.preventDefault();
              dispatch({ type: "term-input", id: win.id, input: complete(d.input, d.cwd) });
            } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
              e.preventDefault();
              dispatch({ type: "term-input", id: win.id, input: "clear" });
              dispatch({ type: "term-submit", id: win.id, now: new Date() });
            } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
              e.preventDefault();
              dispatch({ type: "term-input", id: win.id, input: "" });
            }
          }}
          {...stylex.props(s.input)}
        />
      </div>
    </div>
  );
}
