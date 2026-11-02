"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Box } from "@/design/primitives/Box";
import { Text } from "@/design/primitives/Text";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { size } from "@/design/tokens/size.stylex";
import { SECTIONS } from "./sections";
import { useWorkspaces } from "./workspaces";

const s = stylex.create({
  cell: { gridColumn: "span 12", minWidth: 0, scrollMarginTop: `calc(${size.header} + 12px + env(safe-area-inset-top, 0px))` },
  span7: { gridColumn: { default: "span 12", [bp.lg]: "span 7" } },
  span5: { gridColumn: { default: "span 12", [bp.lg]: "span 5" } },
});

type Props = { ws: number; aside?: ReactNode; span?: 12 | 7 | 5; children: ReactNode; labelledBy: string };

/** A section as a tiled window: numbered like a workspace, focused when in view or under the mouse. */
export function Tile({ ws, aside, span = 12, children, labelledBy }: Props) {
  const { active, focus } = useWorkspaces();
  const sec = SECTIONS.find((x) => x.ws === ws);
  return (
    <div {...stylex.props(s.cell, span === 7 && s.span7, span === 5 && s.span5)} id={sec?.id} data-ws={ws} tabIndex={-1}>
      <Box
        as="section"
        tone="surface"
        border="line"
        pad="page"
        focused={active === ws}
        aria-labelledby={labelledBy}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") focus(ws);
        }}
      >
        <Stack gap="u8">
          <Inline justify="between" wrap gap="u4">
            <Text as="span" variant="label" tone="faint">
              <Text as="span" variant="label" tone="accent" weight="semibold">
                {ws}
              </Text>
              {"  "}
              {sec?.name}
            </Text>
            {aside && (
              <Text as="span" variant="label" tone="faint">
                {aside}
              </Text>
            )}
          </Inline>
          {children}
        </Stack>
      </Box>
    </div>
  );
}
