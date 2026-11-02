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
import { LockPanel } from "@/design/shell/LockPanel";
import { MenuPanel } from "@/design/shell/MenuPanel";
import { Osd } from "@/design/shell/Osd";
import { Toast } from "@/design/shell/Toast";
import { WindowFrame } from "@/design/shell/WindowFrame";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Tile } from "../Tile";
import { LockSample, PartsCompare, SetupSample } from "./PartsCompare";

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
            desc="8u tall. Occupied workspaces are brighter than empty ones; the active one gets a 2px underline. The clock is the only centred thing."
            tokens={["wall", "line", "text", "text-2", "text-3", "accent", "ok"]}
          >
            <Bar
              framed
              workspaces={ws}
              clock={{ day: "Sunday", time: "14:32" }}
              modules={[
                { id: "cpu", icon: "cpu", label: "CPU", value: "13%" },
                { id: "wifi", icon: "wifi", label: "Wifi", value: "home" },
                { id: "vol", icon: "volume", label: "Volume", value: "64" },
                { id: "bat", icon: "battery", label: "Battery", value: "82", tone: "ok" },
              ]}
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
            desc="No title bars, as today. State lives in the border alone. The halo is the one focus signal on the system."
            tokens={["surface", "line", "accent", "halo", "err"]}
          >
            <Grid layout="three" gap="u4">
              {(
                [
                  ["Inactive", "1px line", "btop", null],
                  ["Active", "1px accent + 3px halo", "nvim .", "active"],
                  ["Urgent", "1px err, no halo", "make ✗ failed", "urgent"],
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
            desc="9u rows. Name in the UI face, description one tone quieter, shortcut at the far edge. The selected row takes the focus ring."
            tokens={["raised", "line-2", "tint", "accent", "text-2"]}
          >
            <MenuPanel
              label="Omarchy menu"
              trail={[]}
              listId="parts-menu"
              sel={1}
              search={
                <Text as="span" variant="small">
                  app
                </Text>
              }
              rows={[
                { key: "learn", glyph: "¶", name: "Learn", desc: "Keybindings and the manuals", more: true },
                { key: "appearance", glyph: "◐", name: "Appearance", desc: "Theme, background", hint: "Super Ctrl T", more: true },
                { key: "trigger", glyph: "◎", name: "Trigger", desc: "Toggle, capture, remind", more: true },
              ]}
            />
          </Part>

          <Part
            href="/system/shell/toast"
            name="Notification"
            desc="Source and time as a label, title in the UI face, body one tone quieter. Critical swaps the border and dot to err."
            tokens={["raised", "line-2", "info", "err"]}
          >
            <div {...stylex.props(s.narrow)}>
              <Stack gap="u2">
                <Toast who="Signal" time="2m" title="Kitchen group" body="Pizza is here. Come before it goes." />
                <Toast who="Battery" critical title="Battery at 9%" body="Plug in within 15 minutes to avoid suspending." />
              </Stack>
            </div>
          </Part>

          <Part
            href="/system/shell/osd"
            name="Overlay"
            desc="Volume and brightness. One icon, a 1u track, the value in mono. Shows for 1.2s and never takes focus."
            tokens={["raised", "sunken", "accent"]}
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
            desc="The one place display type is used at scale. Time in mono 800, date in the UI face, a single field that already has focus."
            tokens={["wall", "text", "text-2", "sunken", "halo"]}
          >
            <LockPanel time="14:32" date="Sunday 1 November">
              <LockSample />
            </LockPanel>
          </Part>
        </Grid>
      </PartsCompare>
    </Tile>
  );
}
