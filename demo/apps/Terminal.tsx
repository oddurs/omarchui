"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useLayoutEffect, useRef } from "react";
import { color } from "@/design/tokens/color.stylex";
import { font } from "@/design/tokens/type.stylex";
import { complete, prompt, type Line } from "@/lib/shell";
import { tones } from "../tones";
import type { AppProps } from "./types";

const s = stylex.create({
  root: { flex: 1, minHeight: 0, overflowY: "auto", paddingBlock: "10px", paddingInline: "12px", cursor: "text" },
  line: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", minHeight: "1.62em" },
  block: { display: "inline-block", height: "1.62em", verticalAlign: "top", backgroundColor: "currentColor" },
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

function Row({ line }: { line: Line }) {
  return (
    <div {...stylex.props(s.line)}>
      {line.map((seg, i) =>
        seg.block ? (
          <span key={i} aria-hidden {...stylex.props(seg.c && tones[seg.c], s.block, cells.w(seg.t.length))} />
        ) : (
          <span key={i} {...stylex.props(seg.c && tones[seg.c])}>
            {seg.t}
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
      <div {...stylex.props(s.inputRow)}>
        <Row line={prompt(d.cwd)} />
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
