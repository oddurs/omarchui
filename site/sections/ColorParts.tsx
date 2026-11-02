"use client";

import * as stylex from "@stylexjs/stylex";
import { Row, Rows } from "@/design/components/Rows";
import { Swatch } from "@/design/components/Swatch";
import { Grid } from "@/design/primitives/Grid";
import { Text } from "@/design/primitives/Text";
import { typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { size, stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { weight } from "@/design/tokens/type.stylex";
import { contrast, grade } from "@/lib/contrast";
import { choose } from "@/lib/theme-runtime";
import { SLUGS, THEMES, type Role } from "@/lib/themes";
import { useTheme } from "../use-theme";

const s = stylex.create({
  card: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: space.u3,
    padding: space.u3,
    textAlign: "left",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    cursor: "pointer",
    outline: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.tick,
    ":hover": { borderColor: color["--text-3"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
  on: { borderColor: color["--accent"], boxShadow: focus.halo },
  system: { backgroundColor: color["--surface"], color: color["--text"] },
  top: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: space.u2 },
  name: { fontWeight: weight.semibold, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  line: { height: "3px" },
  dots: { display: "flex", gap: "3px" },
  dot: { flex: 1, height: "10px" },
  sample: {
    height: size.controlSm,
    display: "grid",
    placeItems: "center",
    fontWeight: weight.semibold,
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line"],
  },
  grade: {
    minWidth: "4.6em",
    paddingBlock: space.u1,
    paddingInline: "6px",
    textAlign: "center",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: "currentColor",
  },
  good: { color: color["--ok"] },
  mid: { color: color["--warn"] },
  low: { color: color["--text-3"] },
});

const dyn = stylex.create({
  bg: (c: string) => ({ backgroundColor: c }),
  fg: (c: string) => ({ color: c }),
  card: (bg: string, fg: string) => ({ backgroundColor: bg, color: fg }),
  split: (a: string, b: string) => ({ backgroundImage: `linear-gradient(90deg, ${a} 50%, ${b} 50%)` }),
});

/** Every Omarchy theme as a pickable card, drawn in its own palette, after one that follows the system. */
export function ThemeCards() {
  const { chosen } = useTheme();
  const light = THEMES["catppuccin-latte"];
  const dark = THEMES["tokyo-night"];
  return (
    <Grid layout="six" gap="u2" as="ul" aria-label="Themes">
      <li>
        <button type="button" aria-pressed={chosen === null} onClick={() => choose(null)} {...stylex.props(s.card, s.system, chosen === null && s.on)}>
          <span {...stylex.props(s.top)}>
            <span {...stylex.props(typo.small, s.name)}>Match system</span>
            <span {...stylex.props(typo.label)}>auto</span>
          </span>
          <span {...stylex.props(s.line, dyn.split(light.accent, dark.accent))} />
          <span {...stylex.props(s.dots)}>
            {[light.surface, light.text, dark.surface, dark.text].map((c, i) => (
              <span key={i} {...stylex.props(s.dot, dyn.bg(c))} />
            ))}
          </span>
        </button>
      </li>
      {SLUGS.map((k) => {
        const t = THEMES[k];
        return (
          <li key={k}>
            <button
              type="button"
              aria-pressed={chosen === k}
              onClick={() => choose(k)}
              {...stylex.props(s.card, dyn.card(t.surface, t.text), chosen === k && s.on)}
            >
              <span {...stylex.props(s.top)}>
                <span {...stylex.props(typo.small, s.name)}>{t.name}</span>
                <span {...stylex.props(typo.label, dyn.fg(t["text-3"]))}>{t.mode}</span>
              </span>
              <span {...stylex.props(s.line, dyn.bg(t.accent))} />
              <span {...stylex.props(s.dots)}>
                {(["red", "yellow", "green", "cyan", "blue", "magenta"] as const).map((c) => (
                  <span key={c} {...stylex.props(s.dot, dyn.bg(t[c]))} />
                ))}
              </span>
            </button>
          </li>
        );
      })}
    </Grid>
  );
}

export const ROLE_GROUPS: [string, [name: string, src: Role, use: string][]][] = [
  [
    "Ground",
    [
      ["wall", "wall", "Behind everything: desktop, bar, gaps"],
      ["sunken", "sunken", "Fields, code, wells"],
      ["surface", "surface", "Window and tile fill"],
      ["raised", "raised", "Menus, toasts, overlays"],
    ],
  ],
  [
    "Line",
    [
      ["line", "line", "Inactive borders, dividers"],
      ["line-2", "line-2", "Control borders, raised edges"],
    ],
  ],
  [
    "Ink",
    [
      ["text", "text", "Primary text"],
      ["text-2", "text-2", "Descriptions, secondary values"],
      ["text-3", "text-3", "Labels, hints, time. Still AA."],
    ],
  ],
  [
    "Signal",
    [
      ["accent", "accent", "Focus, selection, active workspace"],
      ["on-accent", "on-accent", "Text on accent fills"],
      ["ok", "green", "Success, charging"],
      ["warn", "yellow", "Low battery, pending"],
      ["err", "red", "Errors, urgent windows"],
      ["info", "cyan", "Neutral notices, links"],
    ],
  ],
  [
    "Spectrum",
    [
      ["blue", "blue", "Syntax, charts"],
      ["magenta", "magenta", "Syntax, prompts"],
      ["orange", "orange", "Syntax, numbers"],
    ],
  ],
];

/** Every role with its value in the current theme. */
export function Roles() {
  const t = THEMES[useTheme().slug];
  return (
    <Rows>
      {ROLE_GROUPS.map(([g, items]) => (
        <Row key={g} layout="keyed">
          <Text as="h3" variant="label" tone="faint">
            {g}
          </Text>
          <Grid layout="fitSm" gap="u3">
            {items.map(([name, src, use]) => (
              <Swatch key={name} role={name} alias={name !== src ? src : undefined} fill={`var(--${src})`} hex={t[src]} use={use} />
            ))}
          </Grid>
        </Row>
      ))}
    </Rows>
  );
}

const PAIRS: [Role, Role][] = [
  ["text", "surface"],
  ["text-2", "surface"],
  ["text-3", "surface"],
  ["text-3", "wall"],
  ["accent", "surface"],
  ["on-accent", "accent"],
];

/** WCAG ratios for the pairs the system actually draws, recomputed for the current theme. */
export function Contrast() {
  const t = THEMES[useTheme().slug];
  return (
    <Rows role="table" aria-label={`Contrast on ${t.name}`}>
      {PAIRS.map(([fg, bg]) => {
        const r = contrast(t[fg], t[bg]);
        const g = grade(r);
        return (
          <Row key={fg + bg} layout="ledger" density="tight" role="row">
            <span role="cell" aria-hidden {...stylex.props(typo.small, s.sample, dyn.card(`var(--${bg})`, `var(--${fg})`))}>
              Aa
            </span>
            <Text as="span" variant="caption" face="mono" tone="muted" role="rowheader">
              {fg} on {bg}
            </Text>
            <Text as="span" variant="small" face="mono" weight="semibold" tabular role="cell">
              {r.toFixed(1)}:1
            </Text>
            <span role="cell" {...stylex.props(typo.label, s.grade, g === "AAA" || g === "AA" ? s.good : g === "Large" ? s.mid : s.low)}>
              {g}
            </span>
          </Row>
        );
      })}
    </Rows>
  );
}

export function ThemeName() {
  return <>{THEMES[useTheme().slug].name}</>;
}
