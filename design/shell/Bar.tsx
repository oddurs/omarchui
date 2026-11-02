"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { clearBarInk } from "@/lib/bar-ink";
import { bp } from "../tokens/breakpoints.stylex";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { layer } from "../tokens/layer.stylex";
import { motion } from "../tokens/motion.stylex";
import { shellspace } from "../tokens/shellspace.stylex";
import { shelltype } from "../tokens/shelltype.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { font } from "../tokens/type.stylex";
import { Icon, Mark, type IconName } from "./Icon";

export type BarWorkspace = { n: number; busy: boolean; active: boolean };
export type BarModule = {
  id: string;
  icon: IconName;
  label: string;
  value?: string;
  tone?: "ok" | "warn" | "err";
  /** A status icon (indicator, world clock, weather): the narrower slot. */
  status?: boolean;
  /** The panel this widget opens, by id; its card is centred on the widget. */
  panel?: string;
  /** Its panel is open: an accent pill sits under the widget. */
  open?: boolean;
  /** Omarchy's tooltip for the widget, if it has one. Most bar widgets have none. */
  tip?: string;
  /** The battery's charge, 0 to 1. */
  level?: number;
  /** An indicator that is off: drawn only while the peek is open, dimmed. */
  inactive?: boolean;
  onPress?: () => void;
  onWheel?: (e: WheelEvent) => void;
};

/** How the bar is filled. A double-click on its empty space steps clear, glassy, opaque. bin/omarchy-bar:239-244. */
export type BarLook = "opaque" | "clear" | "glassy";
const NEXT_LOOK: Record<BarLook, BarLook> = { clear: "glassy", glassy: "opaque", opaque: "clear" };

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const reveal = stylex.keyframes({ from: { opacity: 0 } });

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
    backgroundColor: chrome.barBg,
    color: chrome.barInk,
    // Every label in the bar is one face at one size; line boxes are the glyphs' own.
    fontFamily: font.mono,
    fontSize: shelltype.body,
    fontWeight: chrome.barWeight,
    lineHeight: 1,
    userSelect: "none",
  },
  // Omarchy's glassy bar: its fill at 35% over Hyprland's frosted blur (size 4, two passes,
  // brightness 0.75, vibrancy 0.35). Bar.qml:89; default/hypr/glass.lua.
  glassy: {
    backgroundColor: `color-mix(in srgb, ${chrome.barBg} 35%, transparent)`,
    backdropFilter: "blur(8px) brightness(0.75) saturate(1.35)",
  },
  clear: { backgroundColor: "transparent" },
  framed: { borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line"] },
  zone: { display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" },
  // Workspace buttons sit 1px apart in the stock view, with 1.5px after the last. Workspaces.qml:242,275-277.
  wsGroup: { display: "flex", alignItems: "center", gap: chrome.wsGap, paddingRight: chrome.wsTrail },
  state: { justifyContent: "flex-end" },
  // The clock is centred on the whole bar; Omarchy's centerBegin and centerEnd lists hang off
  // its edges, so it never moves for them. Bar.qml:2338-2360.
  center: { position: "relative", display: "flex", alignItems: "center", height: chrome.barHeight },
  side: { position: "absolute", top: 0, display: "flex", alignItems: "center" },
  before: { right: "100%" },
  after: { left: "100%" },
  press: {
    display: "inline-grid",
    placeItems: "center",
    height: chrome.barHeight,
    // Slots set the width; the browser's button padding would widen them.
    padding: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "inherit",
    font: "inherit",
    cursor: "pointer",
    outline: "none",
    ":focus-visible": { boxShadow: focus.inset },
  },
  markBtn: { minWidth: chrome.modSlot, color: chrome.barInk },
  ws: {
    minWidth: chrome.wsWidth,
    color: chrome.wsIdle,
    transitionProperty: "color, background-color",
    transitionDuration: motion.tick,
  },
  busy: { color: chrome.wsBusy },
  activeNumber: { display: chrome.wsActiveNumber },
  // Omarchy 4 shows the workspace's layout instead of its number; the mark is the dwindle layout.
  activeGlyph: { display: chrome.wsActiveGlyph, placeItems: "center" },
  active: { color: chrome.wsActive },
  // "dddd HH:mm" in one face, one weight, one ink, as Omarchy sets it. shell.json:25-29.
  clock: {
    display: "inline-flex",
    alignItems: "center",
    height: chrome.barHeight,
    paddingInline: chrome.clockPad,
    color: chrome.clockInk,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  day: { display: { default: "inline", [bp.phone]: "none" }, marginRight: chrome.clockGap },
  mod: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: chrome.modSlot,
    height: chrome.barHeight,
    color: chrome.barInk,
    whiteSpace: "nowrap",
  },
  statusSlot: { minWidth: chrome.statusSlot },
  hover: { ":hover": { color: chrome.barHover, backgroundColor: chrome.barHoverBg } },
  ok: { color: color["--ok"] },
  warn: { color: color["--warn"] },
  err: { color: color["--err"] },
  // While held, the glyph, not its slot, shrinks to 0.9. The clock never does. WidgetButton.qml:108-136.
  glyph: {
    display: "inline-grid",
    placeItems: "center",
    transitionProperty: "transform",
    transitionDuration: chrome.barPress,
    transitionTimingFunction: EASE,
  },
  held: { transform: "scale(0.9)" },
  // An indicator that is off shows only in the peek, at 0.45, fading in over 140ms. BarIndicator.qml:28.
  dim: { opacity: 0.45, animationName: reveal, animationDuration: chrome.barFade, animationTimingFunction: "ease-out" },
  // While a widget's panel is open, a 2px accent pill sits 2px above the bar's bottom edge, a
  // little over half the slot wide. shell/plugins/bar/Bar.qml:2871-2878, 3009-3036.
  openable: { position: "relative" },
  pill: {
    position: "absolute",
    left: "50%",
    bottom: "2px",
    width: "55%",
    minWidth: "10px",
    height: "2px",
    borderRadius: "1px",
    transform: "translateX(-50%)",
    backgroundColor: chrome.selText,
    opacity: 0.9,
    pointerEvents: "none",
  },
  clockButton: {
    height: chrome.barHeight,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    cursor: "pointer",
    outline: "none",
    ":focus-visible": { boxShadow: focus.inset },
  },
  // On a phone the bar keeps workspaces, the time and the battery; the rest waits for room.
  minor: { display: { default: "inline-flex", [bp.phone]: "none" } },
  // The tooltip: 6px under its widget and centred on it, slid to stay on screen, padded 10 by 7
  // around one line at the body size. Bar.qml:1887-1925.
  tip: {
    position: "absolute",
    top: `calc(100% + ${shellspace.md})`,
    zIndex: layer.popover,
    paddingInline: shellspace.controlPadX,
    paddingBlock: shellspace.inputPadY,
    whiteSpace: "nowrap",
    color: chrome.tipInk,
    backgroundColor: chrome.tipBg,
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: chrome.tipBorder,
    pointerEvents: "none",
  },
  unplaced: { visibility: "hidden" },
});

const dyn = stylex.create({
  left: (x: number) => ({ left: `${x}px` }),
});

// StyleX names each variable var(--hash); the name inside is what a subtree can redefine.
const name = (v: string) => v.slice(4, -1);

/**
 * A clear bar draws every label and glyph in the one ink read from the wallpaper, with empty
 * workspaces at half of it as Omarchy dims them (Workspaces.qml:274). The bar's own ink variables
 * are redefined for its subtree, so each part keeps reading the token it always reads.
 */
function withInk(props: ReturnType<typeof stylex.props>, ink: string | null): ReturnType<typeof stylex.props> {
  if (!ink) return props;
  const vars = {
    [name(chrome.barInk)]: ink,
    [name(chrome.clockInk)]: ink,
    [name(chrome.barHover)]: ink,
    [name(chrome.wsBusy)]: ink,
    [name(chrome.wsIdle)]: `color-mix(in srgb, ${ink} 50%, transparent)`,
  };
  return { ...props, style: { ...props.style, ...vars } };
}

export type BarProps = {
  workspaces: BarWorkspace[];
  /** The clock's two formats: "dddd HH:mm", and the date a right-click swaps in. */
  clock: { day: string; time: string; alt?: string };
  modules: BarModule[];
  /** Modules on either side of the clock: Omarchy's indicators before it, world clock and weather after. */
  beside?: { before: BarModule[]; after: BarModule[] };
  /** The clock opens the calendar. */
  clockPanel?: { open: boolean; onPress: () => void };
  onWorkspace?: (n: number) => void;
  onMark?: () => void;
  /** The wallpaper under the bar, which a clear bar reads its ink from. */
  wallpaper?: string;
  /** Draw a hairline frame, for showing the bar on its own. */
  framed?: boolean;
};

/** The bar in three zones: where you are, when it is, what the machine is doing. */
export function Bar({ workspaces, clock, modules, beside, clockPanel, onWorkspace, onMark, wallpaper, framed }: BarProps) {
  const root = useRef<HTMLDivElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const tip = useTip(root, bubble);
  const peek = usePeek(root, center, Boolean(beside?.before.some((m) => m.inactive)));
  const [alt, setAlt] = useState(false);
  const [look, setLook] = useState<BarLook>("opaque");
  const ink = useClearInk(root, look === "clear" ? wallpaper : undefined);

  const before = beside?.before.filter((m) => !m.inactive || peek.open) ?? [];
  const clockText = alt && clock.alt ? clock.alt : null;
  const clockTip = "Right-click to toggle format"; // clock.toggleFormat, default/i18n/en/shell.json:209

  return (
    <div
      ref={root}
      role="toolbar"
      aria-label="Bar"
      data-ref="bar"
      data-look={look}
      onPointerMove={peek.move}
      onPointerLeave={peek.leave}
      onDoubleClick={(e: MouseEvent) => {
        // Only the bar's empty space: a widget takes its own clicks. Bar.qml:2547-2553.
        if ((e.target as HTMLElement).closest("button, [role=img]")) return;
        setLook(NEXT_LOOK[look]);
      }}
      {...withInk(stylex.props(s.bar, look === "glassy" && s.glassy, look === "clear" && s.clear, framed && s.framed), look === "clear" ? ink : null)}
    >
      <div {...stylex.props(s.zone)}>
        <Press label="Omarchy menu" onPress={onMark} look={stylex.props(s.press, s.markBtn, s.hover)}>
          <Mark bar />
        </Press>
        <div {...stylex.props(s.wsGroup)}>
          {workspaces.map((w) => (
            <Press
              key={w.n}
              label={`Workspace ${w.n}${w.busy ? "" : ", empty"}`}
              current={w.active}
              onPress={onWorkspace ? () => onWorkspace(w.n) : undefined}
              refKey={`ws:${w.n}`}
              look={stylex.props(s.press, s.mod, s.ws, s.hover, w.busy && s.busy, w.active && s.active)}
            >
              <span {...stylex.props(w.active && s.activeNumber)}>{w.n}</span>
              {w.active && (
                <span aria-hidden {...stylex.props(s.activeGlyph)}>
                  <Icon name="dwindle" bar />
                </span>
              )}
            </Press>
          ))}
        </div>
      </div>
      <div ref={center} {...stylex.props(s.center)}>
        {before.length > 0 && (
          <div {...stylex.props(s.side, s.before)} onPointerEnter={peek.hold}>
            {before.map((m) => (
              <BarMod key={m.id} m={m} minor tip={tip} />
            ))}
          </div>
        )}
        {clockPanel ? (
          <button
            type="button"
            aria-label={`${clockText ?? `${clock.day} ${clock.time}`}. Calendar`}
            aria-expanded={clockPanel.open}
            data-panel="clock"
            onClick={clockPanel.onPress}
            onContextMenu={(e) => {
              e.preventDefault();
              setAlt(!alt);
            }}
            onPointerEnter={(e) => tip.show(e.currentTarget, clockTip)}
            onPointerLeave={tip.hide}
            {...stylex.props(s.clockButton, s.openable)}
          >
            <ClockFace day={clock.day} time={clock.time} alt={clockText} />
            {clockPanel.open && <span aria-hidden {...stylex.props(s.pill)} />}
          </button>
        ) : (
          <ClockFace day={clock.day} time={clock.time} alt={clockText} />
        )}
        {beside && beside.after.length > 0 && (
          <div {...stylex.props(s.side, s.after)}>
            {beside.after.map((m) => (
              <BarMod key={m.id} m={m} minor tip={tip} />
            ))}
          </div>
        )}
      </div>
      <div {...stylex.props(s.zone, s.state)}>
        {modules.map((m, i) => (
          <BarMod key={m.id} m={m} minor={i < modules.length - 1} tip={tip} />
        ))}
      </div>
      {tip.text && (
        <div ref={bubble} role="tooltip" {...stylex.props(s.tip, tip.left === null ? s.unplaced : dyn.left(tip.left))}>
          {tip.text}
        </div>
      )}
    </div>
  );
}

function ClockFace({ day, time, alt }: { day: string; time: string; alt: string | null }) {
  return (
    <span data-ref="clock" {...stylex.props(s.clock)}>
      {alt ?? (
        <>
          <span {...stylex.props(s.day)}>{day}</span>
          {time}
        </>
      )}
    </span>
  );
}

/** What stylex.props returns: the caller composes the look, the button only wears it. */
type Worn = ReturnType<typeof stylex.props>;

/** A bar button whose glyph shrinks while it is held. */
function Press({
  label,
  current,
  onPress,
  refKey,
  look,
  children,
  extra,
}: {
  label: string;
  current?: boolean;
  onPress?: () => void;
  refKey?: string;
  look: Worn;
  children: ReactNode;
  extra?: Record<string, unknown>;
}) {
  const [held, setHeld] = useState(false);
  const release = () => setHeld(false);
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current || undefined}
      tabIndex={onPress ? 0 : -1}
      onClick={onPress}
      onPointerDown={() => setHeld(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      data-ref={refKey ? "workspace" : undefined}
      data-ref-key={refKey}
      {...extra}
      {...look}
    >
      <span {...stylex.props(s.glyph, held && s.held)}>{children}</span>
    </button>
  );
}

function BarMod({ m, minor, tip }: { m: BarModule; minor?: boolean; tip: Tip }) {
  const toneStyle = m.tone === "ok" ? s.ok : m.tone === "warn" ? s.warn : m.tone === "err" ? s.err : null;
  const label = `${m.label}${m.value ? ` ${m.value}` : ""}`;
  const inner = <Icon name={m.icon} bar level={m.level} />;
  const look = [s.mod, m.status && s.statusSlot, toneStyle, minor && s.minor, m.inactive && s.dim];
  const tipEvents = m.tip ? { onPointerEnter: (e: PointerEvent<HTMLElement>) => tip.show(e.currentTarget, m.tip ?? ""), onPointerLeave: tip.hide } : {};
  if (m.onPress) {
    return (
      <Press
        label={label}
        onPress={m.onPress}
        look={stylex.props(s.press, ...look, s.hover, toneStyle, s.openable)}
        extra={{ "aria-expanded": m.panel ? Boolean(m.open) : undefined, "data-panel": m.panel, onWheel: m.onWheel, ...tipEvents }}
      >
        {inner}
        {m.open && <span aria-hidden {...stylex.props(s.pill)} />}
      </Press>
    );
  }
  return (
    <span role="img" aria-label={label} onWheel={m.onWheel} {...tipEvents} {...stylex.props(...look, toneStyle)}>
      {inner}
    </span>
  );
}

type Tip = ReturnType<typeof useTip>;

/**
 * Omarchy's bar tooltip: the first waits 400ms, and for 400ms after one hides the next shows at
 * once. Bar.qml:1570-1625.
 */
function useTip(root: React.RefObject<HTMLDivElement | null>, bubble: React.RefObject<HTMLDivElement | null>) {
  const [at, setAt] = useState<{ text: string; el: HTMLElement } | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const shown = useRef(false);
  const warmUntil = useRef(0);

  const open = (el: HTMLElement, text: string) => {
    shown.current = true;
    setLeft(null);
    setAt({ text, el });
  };
  const show = (el: HTMLElement, text: string) => {
    window.clearTimeout(timer.current);
    if (!text) return;
    if (shown.current || performance.now() < warmUntil.current) open(el, text);
    else timer.current = window.setTimeout(() => open(el, text), 400);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    if (shown.current) warmUntil.current = performance.now() + 400;
    shown.current = false;
    setAt(null);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const bar = root.current?.getBoundingClientRect();
    const box = bubble.current;
    if (!at || !bar || !box) return;
    const t = at.el.getBoundingClientRect();
    const w = box.offsetWidth;
    // Centred under the widget, then slid back inside the screen. PopupAdjustment.Slide.
    // Placing it needs its measured width, so it lands in a second render before paint: the
    // measuring case useLayoutEffect exists for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeft(Math.round(Math.min(Math.max(t.left + t.width / 2 - bar.left - w / 2, 0), bar.width - w)));
  }, [at, root, bubble]);

  return { text: at?.text ?? null, left, show, hide };
}

/**
 * The indicator peek. With the pointer on the bar short of where the clock starts, the indicators
 * that are off appear beside it, dimmed; the edge is measured while the peek is shut and held
 * while it is open, so the widened list cannot pull it from under a still pointer. It shuts
 * 120ms after the pointer leaves the bar or crosses onto the clock. Bar.qml:1010-1036; BarModel.js:656-671.
 */
function usePeek(root: React.RefObject<HTMLDivElement | null>, center: React.RefObject<HTMLDivElement | null>, any: boolean) {
  const [open, setOpen] = useState(false);
  const edge = useRef(0);
  const shut = useRef<number | undefined>(undefined);
  const close = () => {
    window.clearTimeout(shut.current);
    shut.current = window.setTimeout(() => setOpen(false), 120);
  };
  const hold = () => window.clearTimeout(shut.current);
  const move = (e: PointerEvent) => {
    const bar = root.current?.getBoundingClientRect();
    const box = center.current?.getBoundingClientRect();
    if (!any || !bar || !box) return;
    if (!open) edge.current = box.left - bar.left;
    if (e.clientX - bar.left < edge.current) {
      hold();
      if (!open) setOpen(true);
    } else if (open) close();
  };
  useEffect(() => () => window.clearTimeout(shut.current), []);
  return { open: open && any, move, leave: close, hold };
}

/** A clear bar's ink, read from the wallpaper under it; null until read, or while the bar is not clear. */
function useClearInk(root: React.RefObject<HTMLDivElement | null>, wallpaper: string | undefined) {
  const [ink, setInk] = useState<{ src: string; ink: string } | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!wallpaper || !el) return;
    let live = true;
    const css = getComputedStyle(el);
    // The theme's foreground and background as the bar draws them when opaque.
    const fg = hex(css.getPropertyValue(chrome.barInk.slice(4, -1)) || css.color);
    const bg = hex(css.getPropertyValue(chrome.barBg.slice(4, -1)));
    // The wallpaper covers the whole screen the bar sits on, not the bar's own box.
    const screen = (el.closest("[data-screen]") ?? document.documentElement).getBoundingClientRect();
    if (!fg || !bg) return;
    void clearBarInk(wallpaper, screen, el.offsetHeight, fg, bg).then((c) => {
      if (live) setInk({ src: wallpaper, ink: c });
    });
    return () => {
      live = false;
    };
  }, [root, wallpaper]);
  return wallpaper && ink?.src === wallpaper ? ink.ink : null;
}

/** #rrggbb from a computed colour, or null when it is not an opaque sRGB one. */
function hex(value: string): string | null {
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  const m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(v);
  if (!m) return null;
  return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}
