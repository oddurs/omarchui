import * as stylex from "@stylexjs/stylex";
import { color } from "../tokens/color.stylex";
import { size } from "../tokens/size.stylex";

const PATHS = {
  wifi: "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  volume: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12",
  mute: "M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6",
  battery: "M2 7h18v10H2zM22 10.5v3M5 10h10v4H5z",
  bluetooth: "M7 7l10 10-5 4V3l5 4L7 17",
  cpu: "M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 21 21",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20h4",
  bellOff: "M6 16V11a6 6 0 0 1 9-5.2M18 11v5l2 2H8M10 20h4M3 3l18 18",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  exit: "M14 4h6v16h-6M10 8l-4 4 4 4M6 12h10",
  chevron: "M9 6l6 6-6 6",
  dwindle: "M3 4h8v16H3zM14 4h7v7h-7zM14 14h7v6h-7z",
} as const;

export type IconName = keyof typeof PATHS;

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
});

/** A 24-unit stroke icon at 14px, or 16px where it stands alone. Decorative: always aria-hidden. */
export type IconProps = { name: IconName; /** 16px instead of 14px, for icons that stand alone. */ large?: boolean };

export function Icon({ name, large }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...stylex.props(s.icon, large && s.large)}>
      <path d={PATHS[name]} />
    </svg>
  );
}

const m = stylex.create({
  mark: { width: size.iconLg, height: size.iconLg, flexShrink: 0 },
  large: { width: size.glyph, height: size.glyph },
  fill: { fill: color["--accent"] },
  line: { fill: "none", stroke: color["--text-2"], strokeWidth: 1.5 },
});

/** The Omarchui mark: the dwindle layout itself, one focused tile and two waiting. */
export type MarkProps = { /** 24px instead of 16px. */ large?: boolean };

export function Mark({ large }: MarkProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false" {...stylex.props(m.mark, large && m.large)}>
      <rect x="1" y="1" width="7" height="14" {...stylex.props(m.fill)} />
      <rect x="10.25" y="1.75" width="4.5" height="5.5" {...stylex.props(m.line)} />
      <rect x="10.25" y="9.25" width="4.5" height="5.5" {...stylex.props(m.line)} />
    </svg>
  );
}
