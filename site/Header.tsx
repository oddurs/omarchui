"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Button as AriaButton } from "react-aria-components";
import { ButtonLink } from "@/design/components/ButtonLink";
import { Tooltip } from "@/design/components/Tooltip";
import { face, typo } from "@/design/primitives/typography";
import { Mark } from "@/design/shell/Icon";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { size, stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { weight } from "@/design/tokens/type.stylex";
import { formatClock, useNow } from "@/lib/use-clock";
import { SECTIONS } from "./sections";
import { ThemeMenu } from "./ThemeMenu";
import { useWorkspaces } from "./workspaces";

const s = stylex.create({
  bar: {
    position: "sticky",
    top: "env(safe-area-inset-top, 0px)",
    zIndex: layer.sticky,
    backgroundColor: color["--wall"],
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
  },
  inner: {
    maxWidth: size.page,
    marginInline: "auto",
    height: size.header,
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr) auto", [bp.lg]: "1fr auto 1fr" },
    alignItems: "center",
    gap: space.u4,
  },
  zone: { display: "flex", alignItems: "center", minWidth: 0 },
  right: { justifyContent: "flex-end", gap: space.u2 },
  home: {
    display: "inline-flex",
    alignItems: "center",
    paddingInline: space.u1,
    marginRight: space.u2,
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  ws: {
    position: "relative",
    height: size.header,
    minWidth: space.u6,
    paddingInline: "3px",
    color: color["--text-3"],
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    outline: "none",
    fontVariantNumeric: "tabular-nums",
    textTransform: "none",
    transitionProperty: "color",
    transitionDuration: motion.tick,
    ":hover": { color: color["--text-2"] },
    ":focus-visible": { boxShadow: focus.inset },
    "::after": { content: '""', position: "absolute", left: "5px", right: "5px", bottom: 0, height: 0, backgroundColor: color["--accent"] },
  },
  wsOn: { color: color["--text"], "::after": { height: stroke.strong } },
  title: {
    display: { default: "none", [bp.lg]: "block" },
    marginLeft: space.u3,
    paddingLeft: space.u3,
    borderLeftWidth: stroke.hair,
    borderLeftStyle: "solid",
    borderLeftColor: color["--line"],
    color: color["--text-2"],
    whiteSpace: "nowrap",
  },
  clock: {
    display: { default: "none", [bp.lg]: "block" },
    fontWeight: weight.semibold,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    color: color["--text"],
  },
  day: { fontWeight: weight.regular, color: color["--text-2"], marginRight: space.u2 },
  link: {
    display: { default: "none", [bp.md]: "inline-flex" },
    alignItems: "center",
    height: size.controlSm,
    paddingInline: space.u2,
    color: color["--text-2"],
    textDecoration: "none",
    outline: "none",
    ":hover": { color: color["--text"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
  launch: { display: { default: "none", [bp.md]: "contents" } },
});

/** The page's bar: sections as workspaces on the left, the clock, then theme and navigation. */
export function Header({ sections = true }: { sections?: boolean }) {
  const { active, jump } = useWorkspaces();
  const c = formatClock(useNow());
  const current = SECTIONS.find((x) => x.ws === active);
  return (
    <header {...stylex.props(s.bar)}>
      <div {...stylex.props(s.inner)}>
        <nav aria-label={sections ? "Sections" : "Site"} {...stylex.props(s.zone)}>
          <Link href="/" aria-label="Omarchui home" {...stylex.props(s.home)}>
            <Mark />
          </Link>
          {sections &&
            SECTIONS.map((x) => (
              <Tooltip key={x.ws} content={x.name}>
                <AriaButton
                  aria-label={`${x.ws}: ${x.name}`}
                  aria-current={x.ws === active ? "true" : undefined}
                  onPress={() => jump(x.ws)}
                  {...stylex.props(typo.small, face.mono, s.ws, x.ws === active && s.wsOn)}
                >
                  {x.ws}
                </AriaButton>
              </Tooltip>
            ))}
          {sections && (
            <span aria-hidden {...stylex.props(typo.small, s.title)}>
              {current?.name}
            </span>
          )}
        </nav>
        <div {...stylex.props(typo.small, s.clock)} suppressHydrationWarning>
          <span {...stylex.props(s.day)}>{c.day}</span>
          {c.time}
        </div>
        <div {...stylex.props(s.zone, s.right)}>
          <Link href="/omarchy" {...stylex.props(typo.small, s.link)}>
            Omarchy
          </Link>
          <Link href="/system" {...stylex.props(typo.small, s.link)}>
            System
          </Link>
          <ThemeMenu />
          <span {...stylex.props(s.launch)}>
            <ButtonLink href="/demo" variant="primary" size="small">
              Launch demo
            </ButtonLink>
          </span>
        </div>
      </div>
    </header>
  );
}
