import * as stylex from "@stylexjs/stylex";
import { color } from "@/design/tokens/color.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { font, weight } from "@/design/tokens/type.stylex";

// SVG text sizes are in viewBox units, not the page type scale: the drawing scales as a whole.
const s = stylex.create({
  geo: { width: "100%", height: "auto", display: "block", borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line"] },
  wall: { fill: color["--wall"] },
  bar: { fill: color["--wall"], stroke: color["--line"] },
  win: { fill: color["--surface"], stroke: color["--line"], strokeWidth: 1 },
  act: { fill: color["--surface"], stroke: color["--accent"], strokeWidth: 1 },
  halo: { fill: "none", stroke: color["--halo"], strokeWidth: 3 },
  dim: { stroke: color["--accent"], strokeWidth: 1, fill: "none" },
  txt: { fill: color["--text-2"], fontFamily: font.mono, fontSize: "9px", fontWeight: weight.medium },
  strong: { fill: color["--text"], fontFamily: font.mono, fontSize: "9px", fontWeight: weight.semibold },
  faint: { fill: color["--text-3"], fontFamily: font.mono, fontSize: "8px", fontWeight: weight.medium },
  mark: { fill: color["--accent"] },
});

/** The tile geometry, annotated: bar, outer gap, inner gap, border and halo. */
export function Geometry() {
  return (
    <svg
      viewBox="0 0 520 330"
      role="img"
      aria-label="Tile geometry: a 32 pixel bar, 12 pixel outer gap, 8 pixel inner gap, 1 pixel borders and a 3 pixel focus halo"
      {...stylex.props(s.geo)}
    >
      <rect x="0" y="0" width="520" height="330" {...stylex.props(s.wall)} />
      <rect x="0.5" y="0.5" width="519" height="31" {...stylex.props(s.bar)} />
      <rect x="16" y="29" width="12" height="2" {...stylex.props(s.mark)} />
      <text x="18" y="20" {...stylex.props(s.strong)}>
        1
      </text>
      <text x="36" y="20" {...stylex.props(s.faint)}>
        2 3 4 5
      </text>
      <text x="508" y="20" textAnchor="end" {...stylex.props(s.txt)}>
        bar · 32px · 8u
      </text>
      <rect x="10.5" y="42.5" width="303" height="277" {...stylex.props(s.halo)} />
      <rect x="12.5" y="44.5" width="299" height="273" {...stylex.props(s.act)} />
      <rect x="320.5" y="44.5" width="187" height="132" {...stylex.props(s.win)} />
      <rect x="320.5" y="185.5" width="187" height="132" {...stylex.props(s.win)} />
      <path d="M0 210h12M0 206v8M12 206v8" {...stylex.props(s.dim)} />
      <text x="22" y="213" {...stylex.props(s.txt)}>
        outer gap · 12px · 3u
      </text>
      <path d="M312 110h8M312 106v8M320 106v8" {...stylex.props(s.dim)} />
      <text x="330" y="113" {...stylex.props(s.txt)}>
        inner gap · 8px · 2u
      </text>
      <text x="28" y="72" {...stylex.props(s.strong)}>
        active window
      </text>
      <text x="28" y="86" {...stylex.props(s.txt)}>
        1px accent border
      </text>
      <text x="28" y="100" {...stylex.props(s.txt)}>
        3px halo, 32% accent
      </text>
      <text x="330" y="212" {...stylex.props(s.txt)}>
        inactive window
      </text>
      <text x="330" y="226" {...stylex.props(s.txt)}>
        1px line
      </text>
    </svg>
  );
}
