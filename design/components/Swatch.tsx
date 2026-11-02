import * as stylex from "@stylexjs/stylex";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.u2, minWidth: 0 },
  chip: { height: space.u12, borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line-2"] },
  meta: { display: "grid", gap: "2px" },
  name: { color: color["--text"] },
  alias: { color: color["--text-3"], textTransform: "none" },
  hex: { color: color["--text-3"], textTransform: "uppercase" },
  use: { color: color["--text-2"] },
});

const dyn = stylex.create({ fill: (c: string) => ({ backgroundColor: c }) });

export type SwatchProps = {
  /** The role, written without the leading dashes. */
  role: string;
  /** Any CSS colour; usually `var(--role)` so it follows the theme. */
  fill: string;
  hex?: string;
  alias?: string;
  use?: string;
};

/** One colour role: the colour itself, its name, its current value and what it is for. */
export function Swatch({ role, fill, hex, alias, use }: SwatchProps) {
  return (
    <div {...stylex.props(s.root)}>
      <span aria-hidden {...stylex.props(s.chip, dyn.fill(fill))} />
      <span {...stylex.props(s.meta)}>
        <span {...stylex.props(typo.label, s.name)}>
          --{role}
          {alias && <span {...stylex.props(s.alias)}> = {alias}</span>}
        </span>
        {hex && <span {...stylex.props(typo.label, s.hex)}>{hex}</span>}
        {use && <span {...stylex.props(typo.caption, s.use)}>{use}</span>}
      </span>
    </div>
  );
}
