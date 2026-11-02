import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import { TextLink } from "@/design/components/TextLink";
import { Grid } from "@/design/primitives/Grid";
import { Inline } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { size } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Header } from "@/site/Header";
import { Color } from "@/site/sections/Color";
import { Keys } from "@/site/sections/Keys";
import { Parts } from "@/site/sections/Parts";
import { Rules } from "@/site/sections/Rules";
import { Space } from "@/site/sections/Space";
import { ThemeFile } from "@/site/sections/ThemeFile";
import { Thesis } from "@/site/sections/Thesis";
import { Type } from "@/site/sections/Type";
import { Workspaces } from "@/site/workspaces";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Omarchui" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const s = stylex.create({
  main: {
    paddingBlock: space.u3,
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
    outline: "none",
  },
  grid: { maxWidth: size.page, marginInline: "auto" },
  foot: {
    maxWidth: size.page,
    marginInline: "auto",
    paddingBlock: `${space.u5} ${space.u12}`,
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
  },
});

export default function Home() {
  return (
    <Workspaces>
      <Header />
      <main id="main" tabIndex={-1} {...stylex.props(s.main)}>
        <div {...stylex.props(s.grid)}>
          <Grid layout="twelve" gap="u2">
            <Thesis />
            <Rules />
            <Color />
            <Type />
            <Space />
            <Parts />
            <Keys />
            <ThemeFile />
          </Grid>
        </div>
      </main>
      <footer {...stylex.props(s.foot)}>
        <Inline justify="between" align="start" gap="u8" wrap>
          <Text variant="small" tone="faint" measure>
            Omarchui is an unofficial design study. Omarchy is made by DHH and contributors at{" "}
            <TextLink href="https://omarchy.org" external>
              omarchy.org
            </TextLink>
            . Theme palettes belong to their authors. The stock view uses Omarchy 4.0&apos;s shipped values, read from its source.
          </Text>
          <Inline gap="u4">
            <Text as="span" variant="small">
              <TextLink href="/system">System reference</TextLink>
            </Text>
            <Text as="span" variant="caption" face="mono" tone="faint">
              1u = 4px · halo 3px · bar 8u · row 9u
            </Text>
          </Inline>
        </Inline>
      </footer>
    </Workspaces>
  );
}
