import * as stylex from "@stylexjs/stylex";
import { Suspense, type ReactNode } from "react";
import { size } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { FOUNDATIONS, ENTRIES, LAYERS } from "@/docs/registry";
import { NavLinks, SideNav, type NavGroup } from "@/docs/ui/SideNav";
import { Header } from "@/site/Header";

const s = stylex.create({
  page: {
    maxWidth: size.page,
    marginInline: "auto",
    paddingBlock: `${space.u8} ${space.u16}`,
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
    display: "grid",
    gap: { default: space.u8, [bp.lg]: space.u12 },
    gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.lg]: "200px minmax(0, 1fr)" },
    alignItems: "start",
  },
  main: { minWidth: 0, outline: "none" },
});

const GROUPS: NavGroup[] = [
  { title: "System", links: [{ href: "/system", label: "Overview" }] },
  { title: "Foundations", links: FOUNDATIONS.map((f) => ({ href: `/system/foundations/${f.slug}`, label: f.name })) },
  ...LAYERS.map((l) => ({
    title: l.name,
    links: ENTRIES.filter((e) => e.layer === l.id).map((e) => ({ href: `/system/${e.layer}/${e.slug}`, label: e.name })),
  })),
];

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header sections={false} />
      <div {...stylex.props(s.page)}>
        {/* The active link needs the pathname, which dynamic pages only know at request time. */}
        <Suspense fallback={<NavLinks groups={GROUPS} path={null} />}>
          <SideNav groups={GROUPS} />
        </Suspense>
        <main id="main" tabIndex={-1} {...stylex.props(s.main)}>
          {children}
        </main>
      </div>
    </>
  );
}
