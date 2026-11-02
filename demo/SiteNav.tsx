"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { useId, useState } from "react";
import { face, typo } from "@/design/primitives/typography";
import { Icon, Mark } from "@/design/shell/Icon";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";

const KEY = "omarchui-nav";

const LINKS = [
  { href: "/study", label: "Read the study" },
  { href: "/system", label: "Design system" },
  { href: "/omarchy", label: "How Omarchy is built" },
  { href: "/contact", label: "Contact" },
] as const;

const s = stylex.create({
  root: {
    position: "fixed",
    left: `max(${space.u3}, env(safe-area-inset-left, 0px))`,
    bottom: `max(${space.u3}, env(safe-area-inset-bottom, 0px))`,
    zIndex: layer.nav,
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    padding: space.u1,
    backgroundColor: color["--raised"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    color: color["--text-2"],
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space.u2,
    height: space.u8,
    paddingInline: space.u2,
    color: "inherit",
    textDecoration: "none",
    whiteSpace: "nowrap",
    backgroundColor: { default: "transparent", ":hover": "color-mix(in srgb, var(--text) 8%, transparent)" },
    borderWidth: 0,
    cursor: "pointer",
    outline: "none",
    transitionProperty: "background-color, color",
    transitionDuration: motion.tick,
    ":hover": { color: color["--text"] },
    ":focus-visible": { boxShadow: focus.inset },
  },
  head: { width: "100%", color: color["--text"] },
  // Collapsed, the panel is the mark alone.
  headClosed: { width: space.u8, justifyContent: "center", paddingInline: 0 },
  name: { flex: 1, textAlign: "left" },
  // Points down, toward folding the list away.
  chev: { display: "inline-grid", transform: "rotate(90deg)" },
  list: { listStyle: "none", margin: 0, padding: 0, minWidth: "13rem" },
});

function remembered(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "closed";
  } catch {
    // Storage can be blocked; the panel then opens on every visit.
    return true;
  }
}

/** The way out of the machine and into the reading: floats over the desktop, bottom left. */
export function SiteNav() {
  const [open, setOpen] = useState(remembered);
  const id = useId();
  const toggle = () => {
    setOpen((o) => {
      try {
        window.localStorage.setItem(KEY, o ? "closed" : "open");
      } catch {
        // Not remembered; it still toggles for this visit.
      }
      return !o;
    });
  };
  return (
    <nav aria-label="Site" data-dock {...stylex.props(s.root)}>
      <div {...stylex.props(s.panel)}>
        {open && (
          <ul id={id} {...stylex.props(s.list)}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} {...stylex.props(typo.small, face.mono, s.row)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={open ? "Hide site menu" : "Omarchui: show site menu"}
          onClick={toggle}
          {...stylex.props(typo.small, face.mono, s.row, open ? s.head : s.headClosed)}
        >
          <Mark />
          {open && (
            <>
              <span {...stylex.props(s.name)}>Omarchui</span>
              <span aria-hidden {...stylex.props(s.chev)}>
                <Icon name="chevron" />
              </span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
