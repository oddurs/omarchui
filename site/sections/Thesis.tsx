import { ButtonLink } from "@/design/components/ButtonLink";
import { Kbd } from "@/design/components/Kbd";
import { Tag } from "@/design/components/Tag";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { HeroPreview } from "../HeroPreview";
import { Tile } from "../Tile";

const KEEPS = ["Keyboard first", "Tiling by default", "Square corners", "No title bars", "One theme recolors all"];

export function Thesis() {
  return (
    <Tile ws={1} labelledBy="h-thesis" aside="Press 1 to 8 to move between workspaces" asideNeedsKeyboard>
      <Text as="h1" variant="display" id="h-thesis">
        Omarchy, tuned.
      </Text>
      <Grid layout="halves" gap="u8" align="end">
        <Stack gap="u5">
          <Text variant="lede" tone="muted" measure>
            Omarchy gets the hard parts right: every action is a keystroke away, windows tile themselves, one theme recolors the whole machine. Version 4 pulled
            the desktop into one shell with one palette file. This study keeps its layout and its density and tunes the foundations underneath: one spacing
            unit, one face with two weights, colors named by job that hold contrast on every theme, and one meaning for accent.
          </Text>
          <Inline gap="u2" wrap as="ul" aria-label="What stays">
            {KEEPS.map((k) => (
              <li key={k}>
                <Tag>{k}</Tag>
              </li>
            ))}
          </Inline>
        </Stack>
        <Stack gap="u3">
          <Inline gap="u2" wrap>
            <ButtonLink href="/demo" variant="primary" size="large">
              Launch the demo
            </ButtonLink>
            <ButtonLink href="/system" size="large">
              Read the system
            </ButtonLink>
          </Inline>
          <Text variant="caption" tone="faint" measure>
            A working desktop with Omarchy 4&apos;s real menu and bindings, before and after, and a reference mode that cites the source. Alt stands in for
            Super. Or press <Kbd>D</Kbd>.
          </Text>
        </Stack>
      </Grid>
      <HeroPreview />
    </Tile>
  );
}
