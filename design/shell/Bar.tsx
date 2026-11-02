"use client";

import * as stylex from "@stylexjs/stylex";
import type { WheelEvent } from "react";
import { face, typo } from "../primitives/typography";
import { bp } from "../tokens/breakpoints.stylex";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { layer } from "../tokens/layer.stylex";
import { motion } from "../tokens/motion.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { tracking, weight } from "../tokens/type.stylex";
import { Icon, Mark, type IconName } from "./Icon";

export type BarWorkspace = { n: number; busy: boolean; active: boolean };
export type BarModule = {
  id: string;
  icon: IconName;
  label: string;
  value?: string;
  tone?: "ok" | "warn" | "err";
  onPress?: () => void;
  onWheel?: (e: WheelEvent) => void;
};

const s = stylex.create({
  bar: {
    position: "relative",
    zIndex: layer.sticky,
    flexShrink: 0,
    height: chrome.barHeight,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
    alignItems: "center",
    paddingInline: space.u2,
    backgroundColor: color["--wall"],
    borderBottomWidth: chrome.barRule,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    color: color["--text-2"],
  },
  framed: { borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line"] },
  zone: { display: "flex", alignItems: "center", gap: "2px", minWidth: 0, overflow: "hidden" },
  state: { justifyContent: "flex-end", gap: space.u1 },
  press: {
    display: "inline-grid",
    placeItems: "center",
    height: chrome.barHeight,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "inherit",
    cursor: "pointer",
    outline: "none",
    ":focus-visible": { boxShadow: focus.inset },
  },
  markBtn: { paddingInline: space.u2, marginRight: space.u1 },
  ws: {
    position: "relative",
    minWidth: space.u6,
    paddingInline: space.u1,
    color: chrome.wsIdle,
    transitionProperty: "color",
    transitionDuration: motion.tick,
    "::after": {
      content: '""',
      position: "absolute",
      left: "5px",
      right: "5px",
      bottom: 0,
      height: 0,
      backgroundColor: color["--accent"],
      transitionProperty: "height",
      transitionDuration: motion.tick,
    },
  },
  busy: { color: chrome.wsBusy },
  activeNumber: { display: chrome.wsActiveNumber },
  // Omarchy 4 shows the workspace's layout instead of its number; the mark is the dwindle layout.
  activeGlyph: { display: chrome.wsActiveGlyph, placeItems: "center" },
  active: { color: chrome.wsActive, "::after": { height: chrome.wsMark } },
  clock: { fontWeight: chrome.uiWeight, color: color["--text"], fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  day: { display: { default: "inline", [bp.phone]: "none" }, fontWeight: weight.regular, color: chrome.quiet, marginRight: space.u2 },
  mod: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.u1,
    height: chrome.barHeight,
    paddingInline: space.u1,
    color: color["--text-2"],
    whiteSpace: "nowrap",
    textTransform: "none",
    letterSpacing: tracking.normal,
  },
  hover: { ":hover": { color: color["--text"] } },
  ok: { color: color["--ok"] },
  warn: { color: color["--warn"] },
  err: { color: color["--err"] },
  value: { display: chrome.barLabels },
  // On a phone the bar keeps workspaces, the time and the battery; the rest waits for room.
  minor: { display: { default: "inline-flex", [bp.phone]: "none" } },
  sep: {
    display: { default: chrome.dot, [bp.phone]: "none" },
    width: stroke.hair,
    height: space.u3,
    marginInline: space.u1,
    backgroundColor: color["--line-2"],
  },
});

export type BarProps = {
  workspaces: BarWorkspace[];
  clock: { day: string; time: string };
  modules: BarModule[];
  onWorkspace?: (n: number) => void;
  onMark?: () => void;
  /** Draw a hairline frame, for showing the bar on its own. */
  framed?: boolean;
};

/** The bar in three zones: where you are, when it is, what the machine is doing. */
export function Bar({ workspaces, clock, modules, onWorkspace, onMark, framed }: BarProps) {
  const [first, ...rest] = modules;
  return (
    <div role="toolbar" aria-label="Bar" data-ref="bar" {...stylex.props(s.bar, framed && s.framed)}>
      <div {...stylex.props(s.zone)}>
        <button type="button" aria-label="Omarchy menu" onClick={onMark} tabIndex={onMark ? 0 : -1} {...stylex.props(s.press, s.markBtn)}>
          <Mark />
        </button>
        {workspaces.map((w) => (
          <button
            key={w.n}
            type="button"
            aria-label={`Workspace ${w.n}${w.busy ? "" : ", empty"}`}
            aria-current={w.active || undefined}
            tabIndex={onWorkspace ? 0 : -1}
            onClick={() => onWorkspace?.(w.n)}
            data-ref="workspace"
            data-ref-key={`ws:${w.n}`}
            {...stylex.props(s.press, typo.label, face.mono, s.mod, s.ws, w.busy && s.busy, w.active && s.active)}
          >
            <span {...stylex.props(w.active && s.activeNumber)}>{w.n}</span>
            {w.active && (
              <span aria-hidden {...stylex.props(s.activeGlyph)}>
                <Icon name="dwindle" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div data-ref="clock" {...stylex.props(typo.caption, face.ui, s.clock)}>
        <span {...stylex.props(s.day)}>{clock.day}</span>
        {clock.time}
      </div>
      <div {...stylex.props(s.zone, s.state)}>
        {first && <BarMod m={first} minor={rest.length > 0} />}
        {rest.length > 0 && <span aria-hidden {...stylex.props(s.sep)} />}
        {rest.map((m, i) => (
          <BarMod key={m.id} m={m} minor={i < rest.length - 1} />
        ))}
      </div>
    </div>
  );
}

function BarMod({ m, minor }: { m: BarModule; minor?: boolean }) {
  const toneStyle = m.tone === "ok" ? s.ok : m.tone === "warn" ? s.warn : m.tone === "err" ? s.err : null;
  const label = `${m.label}${m.value ? ` ${m.value}` : ""}`;
  const inner = (
    <>
      <Icon name={m.icon} />
      {m.value && <span {...stylex.props(s.value)}>{m.value}</span>}
    </>
  );
  const look = [typo.label, s.mod, toneStyle, minor && s.minor];
  if (m.onPress) {
    return (
      <button type="button" aria-label={label} onClick={m.onPress} onWheel={m.onWheel} {...stylex.props(s.press, ...look, s.hover, toneStyle)}>
        {inner}
      </button>
    );
  }
  return (
    <span role="img" aria-label={label} onWheel={m.onWheel} {...stylex.props(...look, toneStyle)}>
      {inner}
    </span>
  );
}
