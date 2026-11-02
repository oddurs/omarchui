import * as stylex from "@stylexjs/stylex";
import { face, numeric, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { size } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { weight } from "../tokens/type.stylex";
import { Icon, type IconName } from "./Icon";

const s = stylex.create({
  osd: {
    display: "grid",
    gridTemplateColumns: `${size.iconLg} 1fr 2.6em`,
    alignItems: "center",
    gap: space.u3,
    width: "100%",
    maxWidth: "300px",
    paddingBlock: space.u3,
    paddingInline: space.u4,
    backgroundColor: chrome.panelBg,
    border: chrome.panelBorder,
    color: color["--text"],
  },
  track: { position: "relative", height: space.u1, backgroundColor: color["--sunken"] },
  fill: { position: "absolute", top: 0, bottom: 0, left: 0, backgroundColor: color["--accent"] },
  muted: { backgroundColor: color["--text-3"] },
  value: { fontWeight: weight.semibold, textAlign: "right" },
});

const dyn = stylex.create({ width: (pct: number) => ({ width: `${pct}%` }) });

export type OsdProps = { icon: IconName; value: number; muted?: boolean; label: string };

/** The volume and brightness overlay: one icon, a 1u track, the value in mono. Shows for 1.2s and never takes focus. */
export function Osd({ icon, value, muted, label }: OsdProps) {
  return (
    <div role="status" aria-label={`${label} ${muted ? "muted" : value}`} {...stylex.props(s.osd)}>
      <Icon name={icon} large />
      <span {...stylex.props(s.track)}>
        <span {...stylex.props(s.fill, muted && s.muted, dyn.width(value))} />
      </span>
      <span {...stylex.props(typo.caption, face.mono, numeric.tabular, s.value)}>{muted ? "—" : value}</span>
    </div>
  );
}
