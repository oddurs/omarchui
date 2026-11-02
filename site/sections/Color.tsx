import { Grid } from "@/design/primitives/Grid";
import { Intro } from "@/design/patterns/Intro";
import { Tile } from "../Tile";
import { Contrast, Roles, ThemeCards, ThemeName } from "./ColorParts";

export function Color() {
  return (
    <Tile ws={3} labelledBy="h-color" aside={<ThemeName />}>
      <Intro id="h-color" title="Eighteen colors, each with a job">
        An Omarchy theme is already a palette: a colors.toml of named hues. The tuning derives eighteen roles from it by one rule, so the bar, the menu,
        notifications and the lock screen ask for the same names and agree. All 23 of Omarchy&apos;s themes are here. Pick one and every role on this page
        changes. Press T to cycle.
      </Intro>
      <ThemeCards />
      <Roles />
      <Grid layout="split" gap="u8">
        <Intro size="sub" title="Contrast on this theme">
          Recomputed from the palette you are viewing. Every ink level, including the faint one used for labels, holds 4.5:1 on every ground in every theme.
        </Intro>
        <Contrast />
      </Grid>
    </Tile>
  );
}
