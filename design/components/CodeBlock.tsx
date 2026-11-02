"use client";

import * as stylex from "@stylexjs/stylex";
import { useRef, useState, type ReactNode } from "react";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { size, stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { font } from "../tokens/type.stylex";

const s = stylex.create({
  root: { minWidth: 0, backgroundColor: color["--sunken"], borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line-2"] },
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: space.u3,
    height: size.row,
    paddingLeft: space.u4,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  title: { color: color["--text-3"], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textTransform: "none" },
  copy: {
    alignSelf: "stretch",
    paddingInline: space.u4,
    color: color["--text"],
    backgroundColor: "transparent",
    borderWidth: 0,
    borderLeftWidth: stroke.hair,
    borderLeftStyle: "solid",
    borderLeftColor: color["--line"],
    cursor: "pointer",
    outline: "none",
    ":hover": { backgroundColor: color["--surface"] },
    ":focus-visible": { boxShadow: focus.inset },
  },
  pre: {
    margin: 0,
    overflowX: "auto",
    padding: space.u4,
    fontFamily: font.mono,
    lineHeight: 1.7,
    color: color["--text"],
    outline: "none",
    ":focus-visible": { boxShadow: focus.inset },
  },
});

export type CodeBlockProps = {
  /** A path or language shown in the bar. */
  title: string;
  /** The plain text the Copy button writes to the clipboard. */
  copy: string;
  /** Rendered code; defaults to `copy` as plain text. Pass coloured spans to highlight. */
  children?: ReactNode;
};

/** Code you might paste somewhere: scrolls sideways rather than wrapping, with a Copy button. */
export function CodeBlock({ title, copy, children }: CodeBlockProps) {
  const pre = useRef<HTMLPreElement>(null);
  const [label, setLabel] = useState("Copy");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copy);
      setLabel("Copied");
    } catch {
      // Clipboard access can be refused; selecting the text lets the reader copy by hand.
      const range = document.createRange();
      if (pre.current) range.selectNodeContents(pre.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      setLabel("Selected");
    }
    window.setTimeout(() => setLabel("Copy"), 1600);
  };

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.bar)}>
        <span {...stylex.props(typo.label, s.title)}>{title}</span>
        <button type="button" onClick={onCopy} aria-live="polite" {...stylex.props(typo.caption, s.copy)}>
          {label}
        </button>
      </div>
      <pre ref={pre} tabIndex={0} aria-label={title} {...stylex.props(typo.caption, s.pre)}>
        {children ?? copy}
      </pre>
    </div>
  );
}
