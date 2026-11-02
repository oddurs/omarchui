"use client";

import * as stylex from "@stylexjs/stylex";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { typo } from "@/design/primitives/typography";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { size, stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";

export type NavGroup = { title: string; links: { href: string; label: string }[] };

const s = stylex.create({
  nav: {
    position: { default: "static", [bp.lg]: "sticky" },
    top: `calc(${size.header} + ${space.u6})`,
    maxHeight: { default: "none", [bp.lg]: `calc(100dvh - ${size.header} - ${space.u12})` },
    overflowY: { default: "visible", [bp.lg]: "auto" },
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: { default: "row", [bp.lg]: "column" },
    flexWrap: "wrap",
    gap: { default: space.u1, [bp.lg]: 0 },
  },
  link: {
    display: "block",
    paddingBlock: space.u1,
    paddingInline: space.u3,
    color: color["--text-2"],
    textDecoration: "none",
    borderLeftWidth: { default: 0, [bp.lg]: stroke.strong },
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
    outline: "none",
    ":hover": { color: color["--text"] },
    ":focus-visible": { boxShadow: focus.inset },
  },
  wideOnly: { display: { default: "none", [bp.lg]: "block" } },
  phoneOnly: { display: { default: "block", [bp.lg]: "none" } },
  summary: {
    paddingBlock: space.u2,
    paddingInline: space.u3,
    cursor: "pointer",
    color: color["--text"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  panel: { paddingTop: space.u4 },
  on: { color: color["--text"], borderLeftColor: color["--accent"], backgroundColor: { default: color["--tint"], [bp.lg]: "transparent" } },
});

/** The reference's table of contents; the current page carries the accent rule. */
export function SideNav({ groups }: { groups: NavGroup[] }) {
  return <NavLinks groups={groups} path={usePathname()} summary="System contents" />;
}

/** The same list without the current page marked: the static shell before the path is known. */
export function NavLinks({ groups, path, summary = "Contents" }: { groups: NavGroup[]; path: string | null; summary?: string }) {
  const list = (
    <Stack gap="u6">
      {groups.map((g) => (
        <Stack key={g.title} gap="u2">
          <Text as="h2" variant="label" tone="faint">
            {g.title}
          </Text>
          <ul {...stylex.props(s.list)}>
            {g.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href as Route} aria-current={path === l.href ? "page" : undefined} {...stylex.props(typo.small, s.link, path === l.href && s.on)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Stack>
      ))}
    </Stack>
  );
  return (
    <nav aria-label={summary} {...stylex.props(s.nav)}>
      <div {...stylex.props(s.wideOnly)}>{list}</div>
      {/* On a phone the list would push the page a screen down; it folds away instead. */}
      <details {...stylex.props(s.phoneOnly)}>
        <summary {...stylex.props(typo.small, s.summary)}>{summary}</summary>
        <div {...stylex.props(s.panel)}>{list}</div>
      </details>
    </nav>
  );
}
