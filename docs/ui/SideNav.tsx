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
  on: { color: color["--text"], borderLeftColor: color["--accent"], backgroundColor: { default: color["--tint"], [bp.lg]: "transparent" } },
});

/** The reference's table of contents; the current page carries the accent rule. */
export function SideNav({ groups }: { groups: NavGroup[] }) {
  return <NavLinks groups={groups} path={usePathname()} />;
}

/** The same list without the current page marked: the static shell before the path is known. */
export function NavLinks({ groups, path }: { groups: NavGroup[]; path: string | null }) {
  return (
    <nav aria-label="System reference" {...stylex.props(s.nav)}>
      <Stack gap="u6">
        {groups.map((g) => (
          <Stack key={g.title} gap="u2">
            <Text as="h2" variant="label" tone="faint">
              {g.title}
            </Text>
            <ul {...stylex.props(s.list)}>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href as Route}
                    aria-current={path === l.href ? "page" : undefined}
                    {...stylex.props(typo.small, s.link, path === l.href && s.on)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Stack>
        ))}
      </Stack>
    </nav>
  );
}
