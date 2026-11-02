import { Row, Rows } from "@/design/components/Rows";
import { TextLink } from "@/design/components/TextLink";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { Tile } from "../Tile";

const RULES = [
  [
    "Unit",
    "Style.space steps of 2, 3, 4, 6, 8, 10, 12, 14 and 18px, a pixel or two apart. The bar is 26, menu rows 50, card padding 18.",
    "One 4px unit. Every step lands on it, one unit from Omarchy's at most, so nine steps become 2, 4, 8, 12, 16 and 20. Bar 28, rows 48, padding 16. The layout stays Omarchy's.",
  ],
  [
    "Type",
    "JetBrains Mono at eight sizes from 10 to 16px, most a pixel apart, and four raw hero sizes up to 64. Notifications switch to Liberation Sans. Regular, medium and bold.",
    "One face for the whole shell, at Omarchy's own base-size 13 with the loud end pinned: 11, 12, 13, 14 and 15, then 24, 28 and one 44px hero. Two weights: regular and medium.",
  ],
  [
    "Color",
    "colors.toml names hues; shell.toml mixes them per surface. Nothing checks contrast: Catppuccin Latte's selected menu row is 3.86:1.",
    "Eighteen colors named by job, each ink held to 4.5:1 on every ground of every theme.",
  ],
  [
    "Accent",
    "Marks the active window and the menu cursor, and also frames every notification and overlay.",
    "Means current, and only that: the active window, the current workspace, the cursor row. Frames use the theme's lines.",
  ],
  [
    "State",
    "The bar has no hover state. The menu cursor is an 8% fill with accent text.",
    "One light fill means under the pointer or the cursor, in the bar and the menu alike.",
  ],
  ["Depth", "Square and flat. Every surface is the theme background.", "Still square and flat. Panels sit one tone above the desktop; nothing casts a shadow."],
  [
    "Bar",
    "The current workspace swaps its number for a layout glyph.",
    "The current workspace keeps its number, in accent. The one visible opinion in the bar.",
  ],
] as const;

export function Rules() {
  return (
    <Tile ws={2} labelledBy="h-rules" aside="Today → tuned">
      <Intro id="h-rules" title="Seven principles, no new features">
        Each row names how Omarchy 4 draws something today, read from its source, and the principle that tunes it. The layout, the density and the parts stay
        Omarchy&apos;s. The changes are underneath, so the parts agree.
      </Intro>
      <Rows role="table" aria-label="Today and tuned">
        <Row layout="compare" density="tight" desktopOnly role="row">
          {["Part", "Omarchy 4 today", "Tuned"].map((h) => (
            <Text key={h} as="span" variant="label" tone="faint" role="columnheader">
              {h}
            </Text>
          ))}
        </Row>
        {RULES.map(([k, was, now]) => (
          <Row key={k} layout="compare" role="row">
            <Text as="span" variant="label" tone="accent" role="rowheader">
              {k}
            </Text>
            <Text as="span" tone="faint" role="cell">
              {was}
            </Text>
            <Text as="span" role="cell">
              {now}
            </Text>
          </Row>
        ))}
      </Rows>
      <Text variant="small" tone="faint">
        Every value on the left is cited to a file and line in <TextLink href="/omarchy">How Omarchy is built</TextLink>.
      </Text>
    </Tile>
  );
}
