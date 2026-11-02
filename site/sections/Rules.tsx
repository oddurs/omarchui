import { Row, Rows } from "@/design/components/Rows";
import { TextLink } from "@/design/components/TextLink";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { Tile } from "../Tile";

const RULES = [
  [
    "Unit",
    "Style.space steps of 2, 3, 4, 6, 8, 10, 12, 14 and 18px; terminals pad 14.",
    "One 4px unit. Gaps, padding, bar height and row height are all multiples of it.",
  ],
  [
    "Focus",
    "A 2px accent border on the active window. Menus mark the selected row with accent text, an 8% fill and a 25% border.",
    "A 1px accent border plus a soft halo. The same ring marks a focused window, field, menu row or theme card.",
  ],
  [
    "Type",
    "JetBrains Mono for everything, at eight sizes from 10 to 28px. Menu rows at 16, terminals at 9.",
    "Mono for what a machine wrote, a sans for what a person reads. Eight sizes, no others.",
  ],
  [
    "Color",
    "colors.toml names hues; shell.toml mixes them per surface, such as foreground at 25% for a selected border.",
    "Eighteen colors named by job, and every ink checked to 4.5:1 on every ground.",
  ],
  [
    "Bar",
    "26px. Workspaces 1 to 5; the active one swaps its number for a layout glyph, with no other marker.",
    "32px in three zones. Numbers stay numbers and the active one is underlined.",
  ],
  ["Menus", "A 300px card with 50px rows and 16px labels. Some rows add a detail line.", "36px rows with name, description and shortcut on every one."],
  [
    "Depth",
    "Square and flat; corners follow Hyprland rounding, 0 by default.",
    "Still square. Layers step up in tone: wall, sunken, surface, raised. Nothing casts a shadow.",
  ],
] as const;

export function Rules() {
  return (
    <Tile ws={2} labelledBy="h-rules" aside="Today → tuned">
      <Intro id="h-rules" title="Seven adjustments, no new features">
        Each row names how Omarchy 4 draws something today, read from its source, and the change. None of them adds a capability. They make the parts agree.
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
