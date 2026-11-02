import type { Route } from "next";
import { Chord } from "@/design/components/Kbd";
import { Row, Rows } from "@/design/components/Rows";
import { Tag } from "@/design/components/Tag";
import { TextLink } from "@/design/components/TextLink";
import { Intro } from "@/design/patterns/Intro";
import { Box } from "@/design/primitives/Box";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { ExampleBlock } from "../examples";
import { ENTRIES, LAYERS, type Entry } from "../registry";
import { PropsTable } from "./PropsTable";
import { DocSection } from "./Section";

function Rule({ kind, children }: { kind: "do" | "dont"; children: string }) {
  return (
    <Box tone="surface" border="line" pad="u4">
      <Stack gap="u2">
        <Text variant="label" tone={kind === "do" ? "ok" : "err"}>
          {kind === "do" ? "✓ Do" : "✕ Don't"}
        </Text>
        <Text variant="small">{children}</Text>
      </Stack>
    </Box>
  );
}

const keyChord = (k: string) => k.split(" / ").map((x) => x.trim());

/** One page of the reference: what, when, a live example, anatomy, states, props, rules, access. */
export function ComponentDoc({ e }: { e: Entry }) {
  const layer = LAYERS.find((l) => l.id === e.layer);
  return (
    <Stack gap="u12">
      <Stack gap="u4">
        <Text variant="label" tone="faint">
          {layer?.name}
        </Text>
        <Intro size="page" title={e.name}>
          {e.summary}
        </Intro>
      </Stack>

      <Grid layout="halves" gap="u6">
        <Stack gap="u2">
          <Text variant="label" tone="faint">
            Use it for
          </Text>
          <Text>{e.use}</Text>
        </Stack>
        {e.instead.length > 0 && (
          <Stack gap="u2">
            <Text variant="label" tone="faint">
              Reach for something else when
            </Text>
            <Stack gap="u1" as="ul">
              {e.instead.map((i) => (
                <li key={i.name}>
                  <Text as="span">
                    {i.slug ? <TextLink href={`/system/${entryLayer(i.slug)}/${i.slug}` as Route}>{i.name}</TextLink> : i.name}: {i.when}
                  </Text>
                </li>
              ))}
            </Stack>
          </Stack>
        )}
      </Grid>

      <ExampleBlock slug={e.slug} kind="live" />

      <DocSection title="Anatomy" id="anatomy">
        <Rows>
          {e.anatomy.map(([part, note]) => (
            <Row key={part} layout="keyed">
              <Text as="span" variant="caption" face="mono" weight="semibold">
                {part}
              </Text>
              <Text as="span" tone="muted">
                {note}
              </Text>
            </Row>
          ))}
        </Rows>
      </DocSection>

      <ExampleBlock slug={e.slug} kind="states" />

      <DocSection title="Props" id="props">
        <Stack gap="u6">
          {e.exports.map((name) => (
            <PropsTable key={name} name={name} />
          ))}
        </Stack>
      </DocSection>

      <DocSection title="Do and don't" id="rules">
        <Grid layout="two" gap="u2">
          {e.dos.map((d) => (
            <Rule key={d} kind="do">
              {d}
            </Rule>
          ))}
          {e.donts.map((d) => (
            <Rule key={d} kind="dont">
              {d}
            </Rule>
          ))}
        </Grid>
      </DocSection>

      <DocSection title="Accessibility" id="a11y">
        <Stack gap="u4">
          {e.keys && (
            <Rows role="table" aria-label="Keyboard">
              {e.keys.map(([k, action]) => (
                <Row key={k} layout="keyed" density="tight" role="row">
                  <span role="cell">
                    <Inline gap="u1" wrap>
                      {keyChord(k).map((c) => (
                        <Chord key={c} chord={c} />
                      ))}
                    </Inline>
                  </span>
                  <Text as="span" variant="small" role="cell">
                    {action}
                  </Text>
                </Row>
              ))}
            </Rows>
          )}
          <Stack gap="u2" as="ul">
            {e.a11y.map((a) => (
              <li key={a}>
                <Text variant="small" tone="muted">
                  {a}
                </Text>
              </li>
            ))}
          </Stack>
        </Stack>
      </DocSection>

      <DocSection title="Tokens it reads" id="tokens">
        <Inline gap="u3" wrap as="ul" aria-label="Tokens">
          {e.tokens.map((t) => (
            <li key={t}>
              <Tag variant="token">{t}</Tag>
            </li>
          ))}
        </Inline>
      </DocSection>
    </Stack>
  );
}

function entryLayer(slug: string) {
  return ENTRIES.find((x) => x.slug === slug)?.layer ?? "components";
}
