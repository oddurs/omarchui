import * as stylex from "@stylexjs/stylex";
import { chrome } from "../tokens/chrome.stylex";
import { shelltype } from "../tokens/shelltype.stylex";
import { color } from "../tokens/color.stylex";
import { size } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { ICON_INK, ICON_PATHS, type IconName } from "./icon-paths";

export type { IconName };

// Omarchy sizes a bar glyph by its ink, not its box: the longer painted side is exactly the bar's
// icon size, centred on the ink (research/omarchy/spec/bar.json, icon.paintedSize). The stroke does
// not scale with the box, so the ink is fitted with room for it: a tenth covers 1–1.25px of stroke
// at 12–13px within a tenth of a pixel.
const STROKE_ROOM = 1.1;
function inkBox(name: IconName): string {
  const [x, y, w, h] = ICON_INK[name];
  const side = Math.max(w, h) * STROKE_ROOM;
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return `${r(x + w / 2 - side / 2)} ${r(y + h / 2 - side / 2)} ${r(side)} ${r(side)}`;
}

const s = stylex.create({
  icon: {
    width: size.icon,
    height: size.icon,
    flexShrink: 0,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "square",
  },
  large: { width: size.iconLg, height: size.iconLg },
  bar: { width: chrome.barIcon, height: chrome.barIcon },
  // One line weight for every bar glyph, whatever its ink box scales it by.
  barLine: { strokeWidth: chrome.barStroke, vectorEffect: "non-scaling-stroke" },
  charge: { fill: "currentColor", stroke: "none" },
  osd: { width: chrome.osdIcon, height: chrome.osdIcon },
  hero: { width: shelltype.display, height: shelltype.display },
  clock: { width: shelltype.clockGlyph, height: shelltype.clockGlyph },
  weather: { width: shelltype.weatherGlyph, height: shelltype.weatherGlyph },
});

/** A 24-unit stroke icon at 14px, or 16px where it stands alone. Decorative: always aria-hidden. */
export type IconProps = {
  name: IconName;
  /** 16px instead of 14px, for icons that stand alone. */
  large?: boolean;
  /** Sized by its ink to the bar's icon token, as Omarchy sizes its glyphs: 12px in the stock view. */
  bar?: boolean;
  /** The battery's charge, 0 to 1, drawn in tenths as MDI's battery glyphs step. */
  level?: number;
  /** Sized by the OSD's icon token: Omarchy's 28px glyph in the stock view. */
  osd?: boolean;
  /** Panel sizes: a hero glyph (24px), the clock's (48px), the weather's (64px). */
  panel?: "hero" | "clock" | "weather";
};

export function Icon({ name, large, bar, osd, panel, level }: IconProps) {
  // The charge fills the battery's 6x12 well from the bottom, in tenths: 87% draws as 80%.
  const tenths = level === undefined ? 0 : Math.floor(Math.min(Math.max(level, 0), 1) * 10);
  const charge = name === "battery" && tenths > 0 ? `M9.5 ${19 - 1.2 * tenths}h5v${1.2 * tenths}h-5z` : null;
  return (
    <svg
      viewBox={bar ? inkBox(name) : "0 0 24 24"}
      aria-hidden
      focusable="false"
      {...stylex.props(s.icon, large && s.large, bar && s.bar, osd && s.osd, panel && s[panel])}
    >
      <path d={ICON_PATHS[name]} {...stylex.props(bar && s.barLine)} />
      {charge && <path d={charge} {...stylex.props(s.charge)} />}
    </svg>
  );
}

const m = stylex.create({
  mark: { width: size.iconLg, height: size.iconLg, flexShrink: 0 },
  large: { width: size.glyph, height: size.glyph },
  display: { width: space.u16, height: space.u16 },
  bar: { width: chrome.barIcon, height: chrome.barIcon },
  fill: { fill: color["--accent"] },
  line: { fill: "none", stroke: color["--text-2"], strokeWidth: 1.5 },
});

/** The Omarchui mark: the dwindle layout itself, one focused tile and two waiting. */
export type MarkProps = {
  /** 24px instead of 16px. */
  large?: boolean;
  /** 64px, for the boot splash. */
  display?: boolean;
  /** In the bar: sized by its ink to the bar's icon token, like every other bar glyph. */
  bar?: boolean;
};

export function Mark({ large, display, bar }: MarkProps) {
  // The mark's ink runs from 1 to 15.5; in the bar the box is fitted to it.
  return (
    <svg
      viewBox={bar ? "0.75 0.75 15 15" : "0 0 16 16"}
      aria-hidden
      focusable="false"
      {...stylex.props(m.mark, large && m.large, display && m.display, bar && m.bar)}
    >
      <rect x="1" y="1" width="7" height="14" {...stylex.props(m.fill)} />
      <rect x="10.25" y="1.75" width="4.5" height="5.5" {...stylex.props(m.line)} />
      <rect x="10.25" y="9.25" width="4.5" height="5.5" {...stylex.props(m.line)} />
    </svg>
  );
}
