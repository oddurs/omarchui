"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { color } from "@/design/tokens/color.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { font } from "@/design/tokens/type.stylex";
import { pretty } from "@/lib/fs";
import { typo } from "@/design/primitives/typography";
import type { EditorData } from "../state";
import type { AppProps } from "./types";

type EditorPatch = Partial<Omit<EditorData, "kind">>;

const LH = 1.62;

const s = stylex.create({
  root: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
  scroll: { flex: 1, minHeight: 0, overflow: "auto", display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "start" },
  gutter: {
    margin: 0,
    paddingBlock: "10px",
    paddingInline: "10px 8px",
    textAlign: "right",
    color: color["--text-3"],
    fontFamily: font.mono,
    fontSize: "inherit",
    lineHeight: LH,
    userSelect: "none",
    position: "sticky",
    left: 0,
    backgroundColor: color["--surface"],
  },
  cur: { color: color["--yellow"] },
  area: {
    display: "block",
    width: "100%",
    minWidth: "40ch",
    resize: "none",
    overflow: "hidden",
    paddingBlock: "10px",
    paddingInline: "4px 12px",
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: color["--text"],
    fontFamily: font.mono,
    fontSize: "inherit",
    lineHeight: LH,
    whiteSpace: "pre",
    caretColor: color["--accent"],
    tabSize: 2,
  },
  normal: { caretColor: color["--yellow"] },
  status: {
    flexShrink: 0,
    display: "flex",
    alignItems: "stretch",
    backgroundColor: color["--sunken"],
    borderTopWidth: stroke.hair,
    borderTopStyle: "solid",
    borderTopColor: color["--line"],
    lineHeight: 1.9,
    textTransform: "none",
    letterSpacing: "normal",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  seg: { paddingInline: "8px" },
  mode: { backgroundColor: color["--accent"], color: color["--on-accent"], fontWeight: 700 },
  insert: { backgroundColor: color["--green"] },
  command: { backgroundColor: color["--yellow"] },
  grow: { flex: 1 },
  faint: { color: color["--text-3"] },
  muted: { color: color["--text-2"] },
  cmd: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    outline: "none",
    padding: 0,
    backgroundColor: "transparent",
    color: color["--text"],
    fontFamily: font.mono,
    fontSize: "inherit",
  },
});

function lineCol(text: string, caret: number) {
  const before = text.slice(0, caret);
  const line = before.split("\n").length;
  const col = caret - before.lastIndexOf("\n");
  return { line, col };
}

function lineStart(text: string, i: number) {
  return text.lastIndexOf("\n", i - 1) + 1;
}

function lineEnd(text: string, i: number) {
  const n = text.indexOf("\n", i);
  return n === -1 ? text.length : n;
}

/** Vertical motion keeps the column, as in Vim. */
function moveLine(text: string, i: number, dir: 1 | -1) {
  const start = lineStart(text, i);
  const col = i - start;
  if (dir === -1) {
    if (start === 0) return i;
    const prevStart = lineStart(text, start - 1);
    return Math.min(prevStart + col, start - 1);
  }
  const end = lineEnd(text, i);
  if (end === text.length) return i;
  const nextStart = end + 1;
  return Math.min(nextStart + col, lineEnd(text, nextStart));
}

export function Editor({ win, live, interactive, dispatch }: AppProps<"editor">) {
  const d = win.data;
  const area = useRef<HTMLTextAreaElement>(null);
  const cmd = useRef<HTMLInputElement>(null);
  const [caret, setCaret] = useState(0);
  const lines = d.text.split("\n");
  const { line, col } = lineCol(d.text, caret);

  useEffect(() => {
    if (!live) return;
    if (d.mode === "command") cmd.current?.focus({ preventScroll: true });
    else area.current?.focus({ preventScroll: true });
  }, [live, d.mode]);

  const place = (i: number) => {
    const el = area.current;
    if (!el) return;
    const at = Math.max(0, Math.min(i, d.text.length));
    el.setSelectionRange(at, at);
    setCaret(at);
  };

  const patch = (p: EditorPatch) => dispatch({ type: "editor", id: win.id, patch: p });

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.altKey || e.metaKey) return;
    const el = e.currentTarget;
    const i = el.selectionStart;
    if (d.mode === "insert") {
      if (e.key === "Escape") {
        e.preventDefault();
        patch({ mode: "normal" });
      } else if (e.key === "Tab") {
        e.preventDefault();
        const text = d.text.slice(0, i) + "  " + d.text.slice(el.selectionEnd);
        patch({ text, dirty: true });
        requestAnimationFrame(() => place(i + 2));
      }
      return;
    }
    // Normal mode: the textarea is read-only, so every printable key is a motion or verb.
    if (e.ctrlKey || e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End" || e.key.startsWith("Page")) return;
    if (e.key.length !== 1) return;
    e.preventDefault();
    const t = d.text;
    switch (e.key) {
      case "i":
        patch({ mode: "insert" });
        break;
      case "a":
        place(i + 1);
        patch({ mode: "insert" });
        break;
      case "A":
        place(lineEnd(t, i));
        patch({ mode: "insert" });
        break;
      case "o": {
        const end = lineEnd(t, i);
        patch({ text: t.slice(0, end) + "\n" + t.slice(end), dirty: true, mode: "insert" });
        requestAnimationFrame(() => place(end + 1));
        break;
      }
      case "x":
        if (i < t.length && t[i] !== "\n") {
          patch({ text: t.slice(0, i) + t.slice(i + 1), dirty: true });
          requestAnimationFrame(() => place(i));
        }
        break;
      case "h":
        if (i > lineStart(t, i)) place(i - 1);
        break;
      case "l":
        if (i < lineEnd(t, i)) place(i + 1);
        break;
      case "j":
        place(moveLine(t, i, 1));
        break;
      case "k":
        place(moveLine(t, i, -1));
        break;
      case "0":
        place(lineStart(t, i));
        break;
      case "$":
        place(lineEnd(t, i));
        break;
      case "G":
        place(lineStart(t, t.length));
        break;
      case "g":
        place(0);
        break;
      case ":":
        patch({ mode: "command", cmd: "" });
        break;
    }
  };

  const modeName = d.mode === "insert" ? "INSERT" : d.mode === "command" ? "COMMAND" : "NORMAL";

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.scroll)}>
        <pre aria-hidden {...stylex.props(s.gutter)}>
          {lines.map((_, n) => (
            <span key={n} {...stylex.props(n + 1 === line && s.cur)}>
              {n + 1}
              {"\n"}
            </span>
          ))}
        </pre>
        <textarea
          ref={area}
          aria-label={`Editing ${pretty(d.path)}, ${modeName.toLowerCase()} mode`}
          value={d.text}
          rows={lines.length}
          readOnly={!interactive || d.mode !== "insert"}
          tabIndex={interactive ? 0 : -1}
          spellCheck={false}
          wrap="off"
          onChange={(e) => patch({ text: e.target.value, dirty: true })}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyDown={onKeyDown}
          {...stylex.props(s.area, d.mode !== "insert" && s.normal)}
        />
      </div>
      <div {...stylex.props(typo.label, s.status)}>
        {d.mode === "command" ? (
          <>
            <span {...stylex.props(s.seg, s.mode, s.command)}>:</span>
            <input
              ref={cmd}
              aria-label="Editor command"
              value={d.cmd}
              readOnly={!interactive}
              tabIndex={interactive ? 0 : -1}
              onChange={(e) => patch({ cmd: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  dispatch({ type: "editor-command", id: win.id });
                } else if (e.key === "Escape" || (e.key === "Backspace" && !d.cmd)) {
                  e.preventDefault();
                  patch({ mode: "normal", cmd: "" });
                }
              }}
              {...stylex.props(s.cmd, s.seg)}
            />
          </>
        ) : (
          <>
            <span {...stylex.props(s.seg, s.mode, d.mode === "insert" && s.insert)}>{modeName}</span>
            <span {...stylex.props(s.seg, s.muted)}>
              {pretty(d.path)}
              {d.dirty ? " [+]" : ""}
            </span>
            <span {...stylex.props(s.grow)} />
            <span {...stylex.props(s.seg, s.faint)}>{d.path.split(".").pop()}</span>
            <span {...stylex.props(s.seg, s.muted)}>
              {line}:{col}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
