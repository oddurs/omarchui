import { Row, Rows } from "@/design/components/Rows";
import { Box } from "@/design/primitives/Box";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import type { TypeVariant } from "@/design/primitives/typography";
import { Intro } from "@/design/patterns/Intro";
import { Tile } from "../Tile";

export const SPECIMEN: { name: TypeVariant; face: string; metric: string; sample: string; mono?: boolean }[] = [
  { name: "display", face: "Mono 800", metric: "40–76 / 0.95", sample: "14:32" },
  { name: "heading", face: "Sans 600", metric: "28 / 34", sample: "Choose a background" },
  { name: "lede", face: "Sans 400", metric: "19 / 29", sample: "A page's opening sentence." },
  { name: "title", face: "Sans 600", metric: "17 / 24", sample: "Design review moved to 15:00" },
  { name: "body", face: "Sans 400", metric: "15 / 24", sample: "Pick a background for this theme. It changes right away from the Style menu." },
  { name: "small", face: "Sans or mono", metric: "13 / 20", sample: "Launch an application", mono: false },
  { name: "caption", face: "Sans or mono", metric: "12 / 19", sample: "192.168.1.24  up 3d 4h  load 0.42", mono: true },
  { name: "label", face: "Mono 500 caps", metric: "11 / 16 · +8%", sample: "Network · wlan0 · connected" },
];

export function Type() {
  return (
    <Tile ws={4} span={7} labelledBy="h-type" aside="1 face in the shell · 8 sizes">
      <Intro id="h-type" title="One face in the shell, two on the page">
        Omarchy sets its shell in JetBrains Mono, and the tune keeps it: one face, regular and medium, notifications included. These pages are documents, not a
        desktop, so they add a sans for prose.
      </Intro>
      <Box tone="sunken" border="line-2" pad="u4">
        <Stack gap="u2">
          <Text variant="label" tone="faint">
            The rule
          </Text>
          <Text>
            In the shell, everything is mono. On a page, if you would copy it into a terminal, set it in mono; if you would read it aloud, set it in sans.
          </Text>
        </Stack>
      </Box>
      <Rows>
        {SPECIMEN.map((x) => (
          <Row key={x.name} layout="keyed">
            <Stack gap="u0">
              <Text as="span" variant="caption" face="mono" weight="semibold">
                {x.name}
              </Text>
              <Text as="span" variant="caption" face="mono" tone="faint">
                {x.face}
              </Text>
              <Text as="span" variant="caption" face="mono" tone="faint">
                {x.metric}
              </Text>
            </Stack>
            <Text variant={x.name} face={x.mono ? "mono" : undefined} tone={x.name === "label" ? "faint" : undefined}>
              {x.sample}
            </Text>
          </Row>
        ))}
      </Rows>
      <Text variant="caption" tone="faint">
        JetBrains Mono is Omarchy&apos;s default monospace. Instrument Sans is for these pages only.
      </Text>
    </Tile>
  );
}
