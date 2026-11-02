import type { Metadata, Route } from "next";
import { CodeBlock } from "@/design/components/CodeBlock";
import { Row, Rows } from "@/design/components/Rows";
import { TextLink } from "@/design/components/TextLink";
import { Intro } from "@/design/patterns/Intro";
import { Box } from "@/design/primitives/Box";
import { Grid } from "@/design/primitives/Grid";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { ENTRIES, FOUNDATIONS, LAYERS } from "@/docs/registry";
import { DocSection } from "@/docs/ui/Section";

export const metadata: Metadata = {
  title: "System",
  description: "The Omarchui design system: tokens, primitives, components and the desktop shell, with rules, examples and generated props.",
  alternates: { canonical: "/system" },
};

const RULES = [
  ["Tokens only", "No literal colour, size or z-index outside design/tokens. A missing value is a missing token."],
  ["Eight type sizes", "Text comes from a preset. Nothing else sets font-size."],
  ["Depth is tone", "wall, sunken, surface, raised. Nothing casts a shadow; corners are square."],
  ["One focus language", "ring for controls, inset where a ring would clip, halo for windows and fields."],
  ["AA everywhere", "Every ink and spectrum colour holds 4.5:1 on every ground, in every theme. A test enforces it."],
  ["No style escape hatch", "Components take variants, not className or style. Layout belongs to the parent."],
  ["Behaviour is borrowed", "Menus, tooltips, fields and toggles come from React Aria; the system only styles them."],
] as const;

const SNIPPET = `import { Button } from "@/design/components/Button";
import { TextField } from "@/design/components/TextField";
import { Box } from "@/design/primitives/Box";
import { Inline, Stack } from "@/design/primitives/Stack";

export function HostnamePrompt() {
  return (
    <Box tone="raised" border="line-2" pad="u6">
      <Stack gap="u4">
        <TextField label="Hostname" defaultValue="omarchy" mono />
        <Inline gap="u2">
          <Button variant="primary">Save</Button>
          <Button>Cancel</Button>
        </Inline>
      </Stack>
    </Box>
  );
}`;

export default function SystemOverview() {
  return (
    <Stack gap="u12">
      <Intro size="page" title="The Omarchui system">
        The parts the exposition and the demo are built from, and the rules that hold them together. Everything here is live: switch the theme in the bar and
        every page follows.
      </Intro>

      <DocSection title="Layers" id="layers">
        <Rows>
          <Row layout="keyed">
            <Text as="span" variant="label" tone="accent">
              Tokens
            </Text>
            <Text as="span">
              The values: <TextLink href="/system/foundations/color">colour</TextLink>, <TextLink href="/system/foundations/type">type</TextLink>,{" "}
              <TextLink href="/system/foundations/space">space and size</TextLink>, <TextLink href="/system/foundations/depth">depth and focus</TextLink>,{" "}
              <TextLink href="/system/foundations/motion">motion</TextLink> and the <TextLink href="/system/foundations/chrome">chrome tokens</TextLink> that
              make before/after a theme.
            </Text>
          </Row>
          {LAYERS.map((l) => (
            <Row key={l.id} layout="keyed">
              <Text as="span" variant="label" tone="accent">
                {l.name}
              </Text>
              <Stack gap="u1">
                <Text as="span">{l.blurb}</Text>
                <Text as="span" variant="small" tone="muted">
                  {ENTRIES.filter((e) => e.layer === l.id)
                    .map((e) => e.name)
                    .join(" · ")}
                </Text>
              </Stack>
            </Row>
          ))}
        </Rows>
        <Text variant="small" tone="muted">
          A part may only use the layers above it. A component that reaches for a hex value has broken the system.
        </Text>
      </DocSection>

      <DocSection title="Rules" id="rules">
        <Grid layout="two" gap="u2">
          {RULES.map(([title, body]) => (
            <Box key={title} tone="surface" border="line" pad="u4">
              <Stack gap="u2">
                <Text as="h3" variant="small" weight="semibold">
                  {title}
                </Text>
                <Text variant="small" tone="muted">
                  {body}
                </Text>
              </Stack>
            </Box>
          ))}
        </Grid>
      </DocSection>

      <DocSection title="Building with it" id="build">
        <Text tone="muted" measure>
          A setup prompt, from primitives and components only. No CSS of its own.
        </Text>
        <CodeBlock title="HostnamePrompt.tsx" copy={SNIPPET} />
      </DocSection>

      <DocSection title="Every page" id="index">
        <Grid layout="fitMd" gap="u2">
          {[
            ...FOUNDATIONS.map((f) => ({ href: `/system/foundations/${f.slug}`, name: f.name, kind: "Foundation", summary: f.summary })),
            ...ENTRIES.map((e) => ({
              href: `/system/${e.layer}/${e.slug}`,
              name: e.name,
              kind: LAYERS.find((l) => l.id === e.layer)?.name ?? "",
              summary: e.summary,
            })),
          ].map((c) => (
            <Box key={c.href} tone="surface" border="line" pad="u4">
              <Stack gap="u2">
                <Text variant="label" tone="faint">
                  {c.kind}
                </Text>
                <Text as="h3" variant="small" weight="semibold">
                  <TextLink href={c.href as Route}>{c.name}</TextLink>
                </Text>
                <Text variant="caption" tone="muted">
                  {c.summary}
                </Text>
              </Stack>
            </Box>
          ))}
        </Grid>
      </DocSection>
    </Stack>
  );
}
