"use client";

import * as stylex from "@stylexjs/stylex";
import { useRef } from "react";
import { color } from "@/design/tokens/color.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { typo } from "@/design/primitives/typography";
import { focus } from "@/design/tokens/effect.stylex";

const s = stylex.create({
  rail: { position: "absolute", top: 0, bottom: 0, width: 0, zIndex: layer.dock },
  line: { position: "absolute", top: 0, bottom: 0, left: "-1px", width: "2px", backgroundColor: color["--accent"], pointerEvents: "none" },
  handle: {
    position: "absolute",
    top: "50%",
    left: "-14px",
    width: "28px",
    height: "56px",
    transform: "translateY(-50%)",
    display: "grid",
    placeItems: "center",
    backgroundColor: color["--accent"],
    color: color["--on-accent"],
    cursor: "ew-resize",
    touchAction: "none",
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  tag: {
    position: "absolute",
    top: "40px",
    paddingBlock: "3px",
    paddingInline: "8px",
    whiteSpace: "nowrap",
    backgroundColor: color["--accent"],
    color: color["--on-accent"],
    pointerEvents: "none",
  },
  left: { right: "6px" },
  right: { left: "6px" },
});

const dyn = stylex.create({ at: (v: number) => ({ left: `${v * 100}%` }) });

/** The before/after divider: stock to its left, tuned to its right. */
export function Splitter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const rail = useRef<HTMLDivElement>(null);

  const fromPointer = (clientX: number) => {
    const parent = rail.current?.parentElement;
    if (!parent) return;
    const r = parent.getBoundingClientRect();
    onChange((clientX - r.left) / r.width);
  };

  return (
    <div ref={rail} {...stylex.props(s.rail, dyn.at(value))}>
      <span {...stylex.props(s.line)} />
      <span {...stylex.props(typo.label, s.tag, s.left)}>Stock</span>
      <span {...stylex.props(typo.label, s.tag, s.right)}>Tuned</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Before and after divider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={`${Math.round(value * 100)}% stock`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.altKey || e.metaKey) return;
          const step = e.shiftKey ? 0.1 : 0.02;
          if (e.key === "ArrowLeft") onChange(value - step);
          else if (e.key === "ArrowRight") onChange(value + step);
          else if (e.key === "Home") onChange(0);
          else if (e.key === "End") onChange(1);
          else return;
          e.preventDefault();
        }}
        {...stylex.props(typo.caption, s.handle)}
      >
        ⇔
      </div>
    </div>
  );
}
