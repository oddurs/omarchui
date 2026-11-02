"use client";

import * as stylex from "@stylexjs/stylex";
import { Menu } from "@/design/components/Menu";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { choose } from "@/lib/theme-runtime";
import { isSlug, SLUGS, THEMES } from "@/lib/themes";
import { useTheme } from "./use-theme";

const s = stylex.create({
  name: { display: { default: "none", [bp.md]: "inline" } },
  dots: { display: "inline-flex", gap: "2px" },
  dot: { width: "6px", height: "6px", display: "block" },
});

const dyn = stylex.create({ bg: (c: string) => ({ backgroundColor: c }) });

function Dots({ colors }: { colors: string[] }) {
  return (
    <span aria-hidden {...stylex.props(s.dots)}>
      {colors.map((c, i) => (
        <i key={i} {...stylex.props(s.dot, dyn.bg(c))} />
      ))}
    </span>
  );
}

/** The theme picker in the page bar: one of Omarchy's 23 palettes, or follow the system. */
export function ThemeMenu() {
  const { slug, chosen } = useTheme();
  return (
    <Menu
      label="Theme"
      triggerLabel={`Theme: ${THEMES[slug].name}`}
      trigger={
        <>
          <Dots colors={["var(--accent)", "var(--green)", "var(--magenta)"]} />
          <span {...stylex.props(s.name)}>{THEMES[slug].name}</span>
        </>
      }
      selected={chosen ?? "system"}
      onAction={(id) => choose(isSlug(id) ? id : null)}
      options={[
        { id: "system", label: "Match system", detail: "auto", lead: <Dots colors={[THEMES["catppuccin-latte"].surface, THEMES["tokyo-night"].surface]} /> },
        ...SLUGS.map((k, i) => ({
          id: k,
          label: THEMES[k].name,
          detail: THEMES[k].mode,
          separatorBefore: i === 0,
          lead: <Dots colors={[THEMES[k].accent, THEMES[k].green, THEMES[k].magenta]} />,
        })),
      ]}
    />
  );
}
