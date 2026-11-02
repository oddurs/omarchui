import * as stylex from "@stylexjs/stylex";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { stroke } from "../tokens/size.stylex";

const s = stylex.create({
  link: {
    color: "inherit",
    textDecorationLine: "underline",
    textDecorationColor: color["--accent"],
    textDecorationThickness: stroke.strong,
    textUnderlineOffset: "3px",
    outline: "none",
    ":hover": { color: color["--accent"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
  quiet: { textDecorationLine: "none", color: color["--accent"], ":hover": { textDecorationLine: "underline" } },
});

export type TextLinkProps<T extends string = string> = {
  /** A typed route inside the site, or a full URL with external. */
  href: Route<T>;
  children: ReactNode;
  /** quiet: accent text, underline on hover; for "Reference →" style links in dense UI. */
  quiet?: boolean;
  /** For links that leave the site. */
  external?: boolean;
};

/**
 * A link inside text. It keeps the surrounding ink and carries an accent underline, because
 * accent-coloured text falls under AA on some light grounds.
 */
export function TextLink<T extends string>({ href, children, quiet, external }: TextLinkProps<T>) {
  if (external && typeof href === "string") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...stylex.props(s.link, quiet && s.quiet)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...stylex.props(s.link, quiet && s.quiet)}>
      {children}
    </Link>
  );
}
