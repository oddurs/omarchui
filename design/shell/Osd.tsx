import * as stylex from "@stylexjs/stylex";
import { face, numeric, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { shelltype } from "../tokens/shelltype.stylex";
import { Icon, type IconName } from "./Icon";

const s = stylex.create({
  osd: {
    display: "grid",
    gridTemplateColumns: chrome.osdCols,
    alignItems: "center",
    gap: chrome.osdGap,
    maxWidth: "300px",
    padding: chrome.osdPad,
    backgroundColor: chrome.osdBg,
    borderWidth: chrome.panelBorderWidth,
    borderStyle: "solid",
    borderColor: chrome.panelBorderColor,
    color: chrome.osdInk,
  },
  icon: { display: "grid", placeItems: "center" },
  track: { position: "relative", height: chrome.osdTrack, backgroundColor: chrome.osdTrackBg },
  fill: { position: "absolute", top: 0, bottom: 0, left: 0, backgroundColor: chrome.osdFill },
  muted: { backgroundColor: chrome.osdMutedFill },
  value: { fontSize: shelltype.title, fontWeight: chrome.osdValueWeight, textAlign: "right" },
  // A message instead of a level: the glyph, 11px, then the text, at most 190px. Osd.qml:22,34,49.
  said: { display: "flex", alignItems: "center", gap: "11px" },
  message: {
    maxWidth: "190px",
    fontSize: shelltype.title,
    fontWeight: chrome.osdValueWeight,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

const dyn = stylex.create({ width: (pct: number) => ({ width: `${pct}%` }) });

export type OsdProps = {
  icon: IconName;
  value: number;
  muted?: boolean;
  label: string;
  /** Says something instead of showing a level: "Logging out", "Microphone muted". */
  message?: string;
};

/** The volume and brightness overlay, laid out as Omarchy's: glyph, track, value. Shows for 1.2s and never takes focus. */
export function Osd({ icon, value, muted, label, message }: OsdProps) {
  if (message) {
    return (
      <div role="status" data-ref="osd" aria-label={message} {...stylex.props(s.osd, s.said)}>
        <span {...stylex.props(s.icon)}>
          <Icon name={icon} osd />
        </span>
        <span {...stylex.props(face.mono, s.message)}>{message}</span>
      </div>
    );
  }
  return (
    <div role="status" data-ref="osd" aria-label={`${label} ${muted ? "muted" : value}`} {...stylex.props(s.osd)}>
      <span {...stylex.props(s.icon)}>
        <Icon name={icon} osd />
      </span>
      <span {...stylex.props(s.track)}>
        <span {...stylex.props(s.fill, muted && s.muted, dyn.width(value))} />
      </span>
      <span {...stylex.props(typo.caption, face.mono, numeric.tabular, s.value)}>{value}%</span>
    </div>
  );
}
