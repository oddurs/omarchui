"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, type ReactNode } from "react";
import { face } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { focus } from "../tokens/effect.stylex";
import { shellspace } from "../tokens/shellspace.stylex";
import { shelltype } from "../tokens/shelltype.stylex";

// research/omarchy/spec/panels.json: the container, then the control kit (shell/Ui/Panel*.qml).
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const grow = stylex.keyframes({ from: { opacity: 0, transform: "scale(0.97)" }, to: { opacity: 1, transform: "none" } });

const s = stylex.create({
  // One card, no scrim: a 2px popups border, 14px padding, square corners. KeyboardPanel.
  card: {
    display: "flex",
    flexDirection: "column",
    gap: shellspace.panelGap,
    padding: shellspace.popupPadding,
    maxHeight: "calc(100% - 36px)",
    overflowY: "auto",
    textAlign: "left",
    backgroundColor: chrome.panelBg,
    borderWidth: chrome.panelBorderWidth,
    borderStyle: "solid",
    borderColor: chrome.panelBorderColor,
    color: chrome.panelInk,
    // Opens from 0.97 over 180ms. panel.anim.open.
    animationName: grow,
    animationDuration: chrome.panelIn,
    animationTimingFunction: EASE,
    animationFillMode: "both",
  },
  hero: { display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", columnGap: shellspace.xxxl, minHeight: "34px" },
  heroDim: { opacity: 0.5 },
  heroText: { display: "flex", flexDirection: "column", gap: shellspace.xxs, minWidth: 0 },
  title: { fontSize: shelltype.title, fontWeight: chrome.panelBold, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  // Caption 10, bold, tracked 1.2, uppercase, in Qt.darker(foreground, 1.4). PanelHero.
  meta: {
    fontSize: shelltype.caption,
    fontWeight: chrome.panelBold,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    color: chrome.panelDim,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  section: { display: "flex", flexDirection: "column", gap: shellspace.md },
  head: { display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: shellspace.xxs, paddingRight: shellspace.md },
  headText: { fontSize: shelltype.caption, fontWeight: chrome.panelBold, color: chrome.panelDim, letterSpacing: "1px" },
  rule: { height: "1px", flexShrink: 0, backgroundColor: chrome.panelLine },
  // Slider: a 4px rounded track inset by half the 14px knob, foreground fill, a knob ringed in the bar's background.
  slider: { position: "relative", height: "30px", marginInline: shellspace.md, display: "flex", alignItems: "center" },
  track: { position: "absolute", left: "7px", right: "7px", height: "4px", borderRadius: "2px", backgroundColor: chrome.panelPick },
  fill: { position: "absolute", left: "7px", height: "4px", borderRadius: "2px", backgroundColor: chrome.panelInk },
  knob: {
    position: "absolute",
    width: "14px",
    height: "14px",
    marginLeft: "-7px",
    borderRadius: "50%",
    backgroundColor: chrome.panelInk,
    boxShadow: `0 0 0 2px ${chrome.panelBg}`,
    pointerEvents: "none",
    transitionProperty: "transform",
    transitionDuration: "110ms",
  },
  range: {
    position: "absolute",
    inset: 0,
    width: "100%",
    margin: 0,
    opacity: 0,
    cursor: "pointer",
  },
  // Switch: a 42x22 track with a 16px knob inset 3, square at rounding 0. ToggleSwitch.qml.
  switch: {
    position: "relative",
    flexShrink: 0,
    width: "42px",
    height: "22px",
    margin: shellspace.md,
    padding: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: chrome.panelEdge,
    backgroundColor: "color-mix(in srgb, currentColor 4%, transparent)",
    cursor: "pointer",
    outline: "none",
    transitionProperty: "background-color, border-color",
    transitionDuration: "120ms",
    ":focus-visible": { boxShadow: focus.ring },
  },
  switchOn: { borderColor: "transparent", backgroundColor: chrome.panelPick },
  switchKnob: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "16px",
    height: "16px",
    backgroundColor: chrome.panelDim,
    transitionProperty: "transform, background-color",
    transitionDuration: "120ms",
  },
  switchKnobOn: { transform: "translateX(20px)", backgroundColor: chrome.panelInk },
  // Rows: transparent at rest; the cursor paints 8% with a 25% edge; the current row 18%. CursorSurface.
  row: {
    display: "flex",
    alignItems: "center",
    gap: shellspace.xl,
    width: "100%",
    minHeight: "30px",
    paddingBlock: shellspace.md,
    paddingInline: shellspace.xl,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: "inherit",
    textAlign: "left",
    cursor: "pointer",
    outline: "none",
    ":hover": { backgroundColor: chrome.selBg, borderColor: chrome.panelEdge },
    ":focus-visible": { backgroundColor: chrome.selBg, borderColor: chrome.panelEdge },
  },
  rowCurrent: { backgroundColor: chrome.panelPick, ":hover": { backgroundColor: chrome.panelPick } },
  rowText: { display: "flex", flexDirection: "column", gap: shellspace.hairline, minWidth: 0, flex: 1 },
  rowName: { fontSize: shelltype.body, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rowStrong: { fontWeight: chrome.panelBold },
  rowSub: { fontSize: shelltype.caption, color: chrome.panelDim },
  rowEnd: { marginLeft: "auto", color: chrome.panelDim },
  // Pills: equal bordered buttons 6px apart, the current one selected. Power profiles, DNS.
  pills: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "1fr", gap: shellspace.md },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: shellspace.lg,
    paddingBlock: shellspace.lg,
    paddingInline: shellspace.xl,
    fontSize: shelltype.bodySmall,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: chrome.panelEdge,
    backgroundColor: { default: "transparent", ":hover": chrome.selBg },
    color: "inherit",
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  pillOn: { backgroundColor: chrome.panelPick },
});

const at = stylex.create({
  card: (width: number, origin: number) => ({ width: `${width}px`, transformOrigin: `${origin}px 0` }),
  fill: (v: number) => ({ width: `calc((100% - 14px) * ${v})` }),
  knob: (v: number) => ({ left: `calc(7px + (100% - 14px) * ${v})` }),
});

export type PanelCardProps = {
  label: string;
  /** Outer width, border and padding included: 380 for most panels. */
  width: number;
  /** Where the widget's centre falls on the card's top edge; the card grows from there. */
  origin: number;
  children: ReactNode;
};

/** A bar panel's card: opaque, a 2px border, no scrim, growing from its widget. */
export function PanelCard({ label, width, origin, children }: PanelCardProps) {
  return (
    <div role="dialog" aria-label={label} data-ref="panel" {...stylex.props(face.mono, s.card, at.card(width, origin))}>
      {children}
    </div>
  );
}

/** The panel's opening line: a 24px glyph, a 14px title, a caps status line, and an optional switch. */
export function PanelHero({ glyph, title, meta, dim, end }: { glyph: ReactNode; title: string; meta?: string; dim?: boolean; end?: ReactNode }) {
  return (
    <div {...stylex.props(s.hero)}>
      <span aria-hidden {...stylex.props(dim && s.heroDim)}>
        {glyph}
      </span>
      <span {...stylex.props(s.heroText)}>
        <span {...stylex.props(s.title)}>{title}</span>
        {meta ? (
          <span aria-live="polite" {...stylex.props(s.meta)}>
            {meta}
          </span>
        ) : null}
      </span>
      {end ?? <span />}
    </div>
  );
}

/** A captioned block: 10px bold header, an optional value at the right, then its content. */
export function PanelSection({ title, value, children }: { title: string; value?: string; children?: ReactNode }) {
  return (
    <section aria-label={title} {...stylex.props(s.section)}>
      <div {...stylex.props(s.head)}>
        <span {...stylex.props(s.headText)}>{title}</span>
        {value ? <span {...stylex.props(s.headText)}>{value}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function PanelRule() {
  return <div aria-hidden {...stylex.props(s.rule)} />;
}

/** A 0..1 slider: drag or arrow keys. Omarchy steps by 0.05. */
export function PanelSlider({ label, value, onChange, step = 0.05 }: { label: string; value: number; onChange?: (v: number) => void; step?: number }) {
  const v = Math.min(1, Math.max(0, value));
  return (
    <div {...stylex.props(s.slider)}>
      <span aria-hidden {...stylex.props(s.track)} />
      <span aria-hidden {...stylex.props(s.fill, at.fill(v))} />
      <span aria-hidden {...stylex.props(s.knob, at.knob(v))} />
      <input
        type="range"
        aria-label={label}
        min={0}
        max={1}
        step={step}
        value={v}
        readOnly={!onChange}
        onChange={(e) => onChange?.(Number(e.target.value))}
        {...stylex.props(s.range)}
      />
    </div>
  );
}

export function PanelSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange?: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      {...stylex.props(s.switch, checked && s.switchOn)}
    >
      <span aria-hidden {...stylex.props(s.switchKnob, checked && s.switchKnobOn)} />
    </button>
  );
}

/** A list row: glyph, a name with an optional second line, and something at the right. */
export function PanelRow({
  glyph,
  name,
  sub,
  end,
  current,
  strong,
  onPress,
}: {
  glyph?: ReactNode;
  name: string;
  sub?: string;
  end?: ReactNode;
  current?: boolean;
  strong?: boolean;
  onPress?: () => void;
}) {
  return (
    <button type="button" aria-current={current || undefined} onClick={onPress} {...stylex.props(s.row, current && s.rowCurrent)}>
      {glyph ? <span aria-hidden>{glyph}</span> : null}
      <span {...stylex.props(s.rowText)}>
        <span {...stylex.props(s.rowName, strong && s.rowStrong)}>{name}</span>
        {sub ? <span {...stylex.props(s.rowSub)}>{sub}</span> : null}
      </span>
      {end ? <span {...stylex.props(s.rowEnd)}>{end}</span> : null}
    </button>
  );
}

/** Equal bordered pills, one of them current: power profiles, DNS providers. */
export function PanelPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; glyph?: ReactNode }[];
  value: T;
  onChange?: (v: T) => void;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} id={id} {...stylex.props(s.pills)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange?.(o.value)}
          {...stylex.props(s.pill, o.value === value && s.pillOn)}
        >
          {o.glyph}
          {o.label}
        </button>
      ))}
    </div>
  );
}
