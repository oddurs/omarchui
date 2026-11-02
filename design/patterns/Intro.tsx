import type { ElementType, ReactNode } from "react";
import { Stack } from "../primitives/Stack";
import { Text } from "../primitives/Text";

export type IntroProps = {
  id?: string;
  title: ReactNode;
  /** h1 on a page's first block, h2 for sections, h3 inside them. */
  as?: "h1" | "h2" | "h3";
  /** One or two sentences under the title, at reading measure. */
  children?: ReactNode;
  size?: "page" | "section" | "sub";
};

const VARIANT = { page: "display", section: "heading", sub: "title" } as const;
const LEDE = { page: "lede", section: "body", sub: "body" } as const;

/** The opening of a page, section or sub-section: a title and a short lede. */
export function Intro({ id, title, as, children, size = "section" }: IntroProps) {
  const As: ElementType = as ?? (size === "page" ? "h1" : size === "section" ? "h2" : "h3");
  return (
    <Stack gap={size === "page" ? "u5" : "u3"}>
      <Text as={As} id={id} variant={VARIANT[size]}>
        {title}
      </Text>
      {children && (
        <Text variant={LEDE[size]} tone="muted" measure>
          {children}
        </Text>
      )}
    </Stack>
  );
}
