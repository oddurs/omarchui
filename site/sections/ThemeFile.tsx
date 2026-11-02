import { Row, Rows } from "@/design/components/Rows";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { Tile } from "../Tile";
import { ThemeFileView } from "./ThemeFileView";

// Omarchy 4's templates, default/themed/*.tpl. The tuning keeps this pipeline and changes its input.
const GENERATED = [
  ["shell.toml", "Bar, menu, notifications, OSD, lock"],
  ["hyprland.lua", "Active and inactive borders"],
  ["foot · alacritty · ghostty · kitty", "Terminal palettes"],
  ["btop", "System monitor"],
  ["neovim.lua", "Editor colorscheme"],
  ["chromium · vscode-theme · obsidian.css", "Apps that take a theme"],
] as const;

export function ThemeFile() {
  return (
    <Tile ws={8} span={5} labelledBy="h-file" aside="Proposed roles">
      <Intro id="h-file" title="A theme is one file">
        Omarchy 4 already does this: a theme is a colors.toml of named hues, rendered through 21 templates into every app. The tuning changes what the file
        names. Roles by job replace hues, so the shell asks for text-3 instead of foreground mixed at 25%. This is the file for the theme on screen.
      </Intro>
      <ThemeFileView />
      <Text as="h3" variant="label" tone="faint">
        Rendered from it, as today
      </Text>
      <Rows as="ul">
        {GENERATED.map(([f, d]) => (
          <Row key={f} as="li" layout="keyed" density="tight">
            <Text as="code" variant="caption" face="mono" weight="medium">
              {f}
            </Text>
            <Text as="span" variant="small" tone="muted">
              {d}
            </Text>
          </Row>
        ))}
      </Rows>
    </Tile>
  );
}
