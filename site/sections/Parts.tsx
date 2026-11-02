import * as stylex from "@stylexjs/stylex";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Chord } from "@/design/components/Kbd";
import { Tag } from "@/design/components/Tag";
import { TextLink } from "@/design/components/TextLink";
import { Box } from "@/design/primitives/Box";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { Bar } from "@/design/shell/Bar";
import { LockField, LockPanel } from "@/design/shell/LockPanel";
import { MenuPanel } from "@/design/shell/MenuPanel";
import { Osd } from "@/design/shell/Osd";
import { Toast } from "@/design/shell/Toast";
import { WindowFrame } from "@/design/shell/WindowFrame";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Tile } from "../Tile";
import { PartsCompare, SetupSample } from "./PartsCompare";

const s = stylex.create({
  full: { gridColumn: "1 / -1" },
  stage: { minHeight: "220px", display: "grid", placeItems: "center" },
  stageWide: { display: "block", placeItems: "normal", minHeight: 0 },
  narrow: { width: "100%", maxWidth: "320px" },
  win: { height: "96px" },
  legend: { display: { default: "none", [bp.md]: "grid" }, gridTemplateColumns: "1fr auto 1fr", alignItems: "baseline", marginTop: space.u2 },
  center: { textAlign: "center" },
  end: { textAlign: "right" },
  winBody: { paddingBlock: space.u2, paddingInline: space.u3 },
});

function Part<T extends string>({
  name,
  children,
  tokens,
  full,
  wide,
  desc,
  href,
}: {
  name: string;
  children: ReactNode;
  tokens: string[];
  full?: boolean;
  wide?: boolean;
  desc: string;
  href: Route<T>;
}) {
  return (
    <div {...stylex.props(full && s.full)}>
      <Box border="line" clip>
        <Box tone="wall" pad="u6">
          <div {...stylex.props(s.stage, wide && s.stageWide)}>{children}</div>
        </Box>
        <Box pad="u4">
          <Stack gap="u2">
            <Inline justify="between" gap="u3" wrap>
              <Text as="h3" variant="title">
                {name}
              </Text>
              <Text as="span" variant="caption">
                <TextLink href={href} quiet>
                  Reference →
                </TextLink>
              </Text>
            </Inline>
            <Text variant="small" tone="muted">
              {desc}
            </Text>
            <Inline gap="u2" wrap as="ul" aria-label="Roles read">
              {tokens.map((t) => (
                <li key={t}>
                  <Tag variant="token">{t}</Tag>
                </li>
              ))}
            </Inline>
          </Stack>
        </Box>
      </Box>
    </div>
  );
}

const ws = [1, 2, 3, 4, 5].map((n) => ({ n, busy: n <= 2, active: n === 1 }));

export function Parts() {
  return (
    <Tile ws={6} labelledBy="h-parts" aside="Built from the same roles">
      <Intro id="h-parts" title="Every surface Omarchy draws">
        The bar, windows, the menu, notifications, the volume overlay, setup prompts and the lock screen, rebuilt from one set of roles. Switch to stock to see
        the same components with Omarchy&apos;s defaults.
      </Intro>
      <PartsCompare>
        <Grid layout="fitLg" gap="u2">
          <Part
            full
            wide
            href="/system/shell/bar"
            name="Bar"
            desc="Omarchy's bar at 7u. Occupied workspaces are brighter than empty ones and the current one keeps its number, in accent. The clock is centred on the whole bar."
            tokens={["surface", "text", "text-2", "text-3", "accent"]}
          >
            <Bar
              framed
              workspaces={ws}
              clock={{ day: "Sunday", time: "14:32" }}
              modules={[
                { id: "agents", icon: "agents", label: "Agents" },
                { id: "bt", icon: "bluetooth", label: "Bluetooth" },
                { id: "wifi", icon: "wifi", label: "Network" },
                { id: "vol", icon: "volume", label: "Audio" },
                { id: "display", icon: "monitor", label: "Display" },
                { id: "bat", icon: "battery", label: "Power" },
              ]}
              beside={{
                before: [],
                after: [
                  { id: "elsewhen", icon: "globe", label: "World clock", status: true },
                  { id: "weather", icon: "cloud", label: "Weather", status: true },
                ],
              }}
            />
            <div aria-hidden {...stylex.props(s.legend)}>
              <Text as="span" variant="label" tone="faint">
                Where · workspaces
              </Text>
              <span {...stylex.props(s.center)}>
                <Text as="span" variant="label" tone="faint">
                  When
                </Text>
              </span>
              <span {...stylex.props(s.end)}>
                <Text as="span" variant="label" tone="faint">
                  State · system
                </Text>
              </span>
            </div>
          </Part>

          <Part
            full
            wide
            href="/system/shell/window"
            name="Windows"
            desc="No title bars, as today. State lives in Omarchy's 2px border, which is accent on the current window, the theme's line on the rest and err when one needs you."
            tokens={["surface", "line-2", "accent", "err"]}
          >
            <Grid layout="three" gap="u4">
              {(
                [
                  ["Inactive", "2px line-2", "btop", null],
                  ["Active", "2px accent", "nvim .", "active"],
                  ["Urgent", "2px err", "make ✗ failed", "urgent"],
                ] as const
              ).map(([name, sub, cmd, state]) => (
                <Stack key={name} gap="u2" as="figure">
                  <div {...stylex.props(s.win)}>
                    <WindowFrame label={`${name} window`} active={state === "active"} urgent={state === "urgent"}>
                      <div {...stylex.props(s.winBody)}>~ ❯ {cmd}</div>
                    </WindowFrame>
                  </div>
                  <Text as="figcaption" variant="caption" face="mono" tone="muted">
                    {name} · {sub}
                  </Text>
                </Stack>
              ))}
            </Grid>
          </Part>

          <Part
            href="/system/shell/menu-panel"
            name="Menu"
            desc="Omarchy's card on the 4px unit: 12u rows, a field that names the open menu. The cursor row takes the light fill and accent text, nothing more."
            tokens={["raised", "line-2", "text", "text-3", "accent"]}
          >
            <MenuPanel
              label="Omarchy menu"
              listId="parts-menu"
              sel={1}
              search={
                <Text as="span" variant="small" tone="faint">
                  Go…
                </Text>
              }
              rows={[
                { key: "learn", glyph: "¶", name: "Learn", more: true },
                { key: "appearance", glyph: "◐", name: "Appearance", more: true },
                { key: "trigger", glyph: "◎", name: "Trigger", more: true },
              ]}
            />
          </Part>

          <Part
            href="/system/shell/toast"
            name="Notification"
            desc="Omarchy's card, set in the shell's mono: title in medium, body one tone quieter. Critical takes an err border and nothing else."
            tokens={["raised", "line-2", "text", "text-2", "err"]}
          >
            <div {...stylex.props(s.narrow)}>
              <Stack gap="u2">
                <Toast who="Signal" title="Kitchen group" body="Pizza is here. Come before it goes." />
                <Toast who="Battery" critical title="Battery at 9%" body="Plug in within 15 minutes to avoid suspending." />
              </Stack>
            </div>
          </Part>

          <Part
            href="/system/shell/osd"
            name="Overlay"
            desc="Volume and brightness as Omarchy lays them out: glyph, a 36u track, the value. Shows for 1.2s and never takes focus."
            tokens={["raised", "line-2", "accent"]}
          >
            <div {...stylex.props(s.narrow)}>
              <Stack gap="u2">
                <Osd icon="volume" value={64} label="Volume" />
                <Osd icon="sun" value={40} label="Brightness" />
              </Stack>
            </div>
          </Part>

          <Part
            href="/system/components/kbd"
            name="Key hint"
            desc="Square caps with a 2px base. Used in menus, the keybinding sheet and first-run tips."
            tokens={["sunken", "line-2", "text"]}
          >
            <div {...stylex.props(s.narrow)}>
              <Stack gap="u3">
                {(
                  [
                    ["Super+Return", "Terminal"],
                    ["Super+Alt+Space", "Apps"],
                    ["Super+Space", "Omarchy menu"],
                    ["Super+W", "Close window"],
                  ] as const
                ).map(([c, l]) => (
                  <Inline key={c} justify="between" gap="u3">
                    <Chord chord={c} />
                    <Text as="span" variant="small" tone="muted">
                      {l}
                    </Text>
                  </Inline>
                ))}
              </Stack>
            </div>
          </Part>

          <Part
            href="/system/components/text-field"
            name="Setup controls"
            desc="For the few places Omarchy asks a question. Fields sit in sunken wells; one primary action per prompt."
            tokens={["sunken", "line-2", "accent", "on-accent", "tint"]}
          >
            <div {...stylex.props(s.narrow)}>
              <SetupSample />
            </div>
          </Part>

          <Part
            href="/system/shell/lock-panel"
            name="Lock screen"
            desc="Only the field, as in Omarchy: no clock, no name. A 2px line that turns accent once it has focus."
            tokens={["surface", "line-2", "accent", "text-3"]}
          >
            <LockPanel>
              <LockField defaultValue="omarchui" />
            </LockPanel>
          </Part>
        </Grid>
      </PartsCompare>
    </Tile>
  );
}
