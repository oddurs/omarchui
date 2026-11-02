import * as stylex from "@stylexjs/stylex";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./button-styles";

export type ButtonLinkProps<T extends string = string> = {
  href: Route<T>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  "aria-label"?: string;
};

/** Navigation that looks like a button. Use Button for actions that stay on the page. */
export function ButtonLink<T extends string>({ href, variant = "secondary", size = "medium", children, ...rest }: ButtonLinkProps<T>) {
  return (
    <Link href={href} {...rest} {...stylex.props(...buttonStyles(variant, size))}>
      {children}
    </Link>
  );
}
