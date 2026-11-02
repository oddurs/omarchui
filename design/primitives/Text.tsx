import * as stylex from "@stylexjs/stylex";
import type { ElementType, ReactNode } from "react";
import { size } from "../tokens/size.stylex";
import { face as faces, heft, ink, numeric, typo, type Face, type Heft, type Ink, type TypeVariant } from "./typography";

const s = stylex.create({
  reset: { margin: 0 },
  measure: { maxWidth: size.measure },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 },
  block: { display: "block" },
});

export type TextProps = {
  /** The type preset: size, line height, default face and weight together. */
  variant?: TypeVariant;
  face?: Face;
  tone?: Ink;
  weight?: Heft;
  /** The element to render; the preset never decides semantics. */
  as?: ElementType;
  /** Cap the line length near 64 characters. */
  measure?: boolean;
  truncate?: boolean;
  tabular?: boolean;
  id?: string;
  role?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
  children?: ReactNode;
};

/** Every piece of text: a preset, an element, and nothing else. */
export function Text({ variant = "body", face, tone, weight, as: As = "p", measure, truncate, tabular, children, ...rest }: TextProps) {
  return (
    <As
      {...rest}
      {...stylex.props(
        s.reset,
        typo[variant],
        face && faces[face],
        tone && ink[tone],
        weight && heft[weight],
        measure && s.measure,
        truncate && s.truncate,
        tabular && numeric.tabular,
        As === "span" && truncate && s.block,
      )}
    >
      {children}
    </As>
  );
}
