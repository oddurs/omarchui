import { Chord } from "@/design/components/Kbd";
import { Row, Rows } from "@/design/components/Rows";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { GROUPS, sheet } from "@/lib/keymap";
import { Tile } from "../Tile";
import { Motion } from "./Motion";

export function Keys() {
  return (
    <Tile ws={7} span={7} labelledBy="h-keys" aside="• = binding Omarchy uses today">
      <Intro id="h-keys" title="Modifiers are verbs">
        Omarchy already hangs almost everything off Super. The tuning gives each modifier one meaning, so you can guess a binding before you look it up. In the
        demo, Alt stands in for Super.
      </Intro>
      <Rows>
        {GROUPS.map((g) => (
          <Row key={g.group} layout="keyed">
            <Stack gap="u2">
              <Chord chord={g.mods} />
              <Text as="h3" variant="small" weight="semibold">
                {g.verb}
              </Text>
            </Stack>
            <Grid layout="fitMd" gap="u2" as="ul">
              {sheet(g.group).map((r) => (
                <li key={r.chord}>
                  <Inline justify="between" gap="u2">
                    <Text as="span" variant="small" tone={r.today ? "text" : "muted"}>
                      {r.label}
                      {r.today && (
                        <Text as="span" variant="small" tone="accent">
                          {" "}
                          •
                        </Text>
                      )}
                    </Text>
                    <Chord chord={r.chord.replace(`${g.mods}+`, "")} />
                  </Inline>
                </li>
              ))}
            </Grid>
          </Row>
        ))}
      </Rows>
      <Intro size="sub" title="Three speeds, one curve">
        Motion confirms what you did and gets out of the way. Nothing bounces, nothing fades text in. The curve is cubic-bezier(0.2, 0.7, 0.1, 1).
      </Intro>
      <Motion />
    </Tile>
  );
}
