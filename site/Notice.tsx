import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Box } from "@/design/primitives/Box";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { Mark } from "@/design/shell/Icon";
import { space } from "@/design/tokens/space.stylex";

const s = stylex.create({
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    paddingBlock: space.u12,
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
  },
  card: { width: "100%", maxWidth: "520px" },
});

/** A single focused window: the layout for not-found and error pages. */
export function Notice({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <main id="main" {...stylex.props(s.page)}>
      <div {...stylex.props(s.card)}>
        <Box tone="surface" border="accent" pad="u8" focused>
          <Stack gap="u5">
            <Mark large />
            <Text variant="label" tone="faint">
              {code}
            </Text>
            <Text as="h1" variant="heading">
              {title}
            </Text>
            {children}
          </Stack>
        </Box>
      </div>
    </main>
  );
}
