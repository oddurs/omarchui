"use client";

import * as stylex from "@stylexjs/stylex";
import { useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@/design/components/Button";
import { ButtonLink } from "@/design/components/ButtonLink";
import { Checkbox } from "@/design/components/Checkbox";
import { CodeBlock } from "@/design/components/CodeBlock";
import { Chord, Kbd } from "@/design/components/Kbd";
import { Menu } from "@/design/components/Menu";
import { Row, Rows } from "@/design/components/Rows";
import { Segmented } from "@/design/components/Segmented";
import { Swatch } from "@/design/components/Swatch";
import { Switch } from "@/design/components/Switch";
import { Tag } from "@/design/components/Tag";
import { TextField } from "@/design/components/TextField";
import { TextLink } from "@/design/components/TextLink";
import { Tooltip } from "@/design/components/Tooltip";
import { Intro } from "@/design/patterns/Intro";
import { Box } from "@/design/primitives/Box";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import type { TypeVariant } from "@/design/primitives/typography";
import { Bar } from "@/design/shell/Bar";
import { Icon, Mark, type IconName } from "@/design/shell/Icon";
import { previewSrc } from "@/lib/background-images";
import { THEMES } from "@/lib/themes";
import { ImagePicker } from "@/design/shell/ImagePicker";
import { LockField, LockPanel } from "@/design/shell/LockPanel";
import { MenuPanel } from "@/design/shell/MenuPanel";
import { Osd } from "@/design/shell/Osd";
import { Toast } from "@/design/shell/Toast";
import { WindowFrame } from "@/design/shell/WindowFrame";
import { space } from "@/design/tokens/space.stylex";

const s = stylex.create({
  win: { height: "120px" },
  winBody: { paddingBlock: space.u2, paddingInline: space.u3 },
  narrow: { width: "100%", maxWidth: "340px" },
  fill: { width: "100%" },
});

/** A labelled cell in a state matrix. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="u2">
      <Text variant="label" tone="faint">
        {label}
      </Text>
      <div>{children}</div>
    </Stack>
  );
}

const BAR_WS = [1, 2, 3, 4, 5].map((n) => ({ n, busy: n <= 3, active: n === 2 }));

export type Example = { Live: ComponentType; States?: ComponentType };

export const EXAMPLES: Record<string, Example> = {
  box: {
    Live: () => (
      <Box tone="wall" pad="u6" border="line">
        <Box tone="surface" pad="u6" border="line">
          <Box tone="raised" pad="u4" border="line-2">
            <Text variant="small">Raised on surface on wall: each layer one tone up.</Text>
          </Box>
        </Box>
      </Box>
    ),
    States: () => (
      <Grid layout="fitSm" gap="u3">
        {(["wall", "sunken", "surface", "raised"] as const).map((t) => (
          <Cell key={t} label={t}>
            <Box tone={t} border="line" pad="u4">
              <Text variant="caption" face="mono">
                tone=&quot;{t}&quot;
              </Text>
            </Box>
          </Cell>
        ))}
        <Cell label="focused">
          <Box tone="surface" border="line" pad="u4" focused>
            <Text variant="caption" face="mono">
              focused
            </Text>
          </Box>
        </Cell>
      </Grid>
    ),
  },
  stack: {
    Live: () => (
      <Stack gap="u3">
        <Inline gap="u2" wrap>
          {["u1", "u2", "u3", "u4"].map((g) => (
            <Tag key={g} variant="token">
              {g}
            </Tag>
          ))}
        </Inline>
        <Inline gap="u2">
          <Button size="small">Save</Button>
          <Button size="small" variant="ghost">
            Cancel
          </Button>
        </Inline>
      </Stack>
    ),
    States: () => (
      <Grid layout="three" gap="u4">
        {(["u1", "u3", "u6"] as const).map((g) => (
          <Cell key={g} label={`gap ${g}`}>
            <Stack gap={g}>
              {[1, 2, 3].map((i) => (
                <Box key={i} tone="sunken" border="line" pad="u2">
                  <Text variant="caption" face="mono">
                    item {i}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Cell>
        ))}
      </Grid>
    ),
  },
  grid: {
    Live: () => (
      <Grid layout="fitSm" gap="u2">
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} tone="sunken" border="line" pad="u4">
            <Text variant="caption" face="mono">
              cell {i + 1}
            </Text>
          </Box>
        ))}
      </Grid>
    ),
    States: () => (
      <Stack gap="u4">
        {(["two", "three", "aside"] as const).map((l) => (
          <Cell key={l} label={`layout ${l}`}>
            <Grid layout={l} gap="u2">
              {Array.from({ length: l === "aside" ? 2 : l === "two" ? 2 : 3 }, (_, i) => (
                <Box key={i} tone="sunken" border="line" pad="u2">
                  <Text variant="caption" face="mono">
                    {i + 1}
                  </Text>
                </Box>
              ))}
            </Grid>
          </Cell>
        ))}
      </Stack>
    ),
  },
  text: {
    Live: () => (
      <Stack gap="u2">
        <Text variant="title">Design review moved to 15:00</Text>
        <Text variant="small" tone="muted">
          Same room. Bring the theme file.
        </Text>
        <Text variant="caption" face="mono" tone="faint">
          ~/.config/omarchy/themes/nord/theme.toml
        </Text>
      </Stack>
    ),
    States: () => (
      <Rows>
        {(["display", "heading", "lede", "title", "body", "small", "caption", "label"] as TypeVariant[]).map((v) => (
          <Row key={v} layout="keyed" density="tight">
            <Text as="span" variant="caption" face="mono" tone="faint">
              {v}
            </Text>
            <Text variant={v} truncate>
              {v === "display" ? "14:32" : "Workspace three, tiled"}
            </Text>
          </Row>
        ))}
      </Rows>
    ),
  },
  intro: {
    Live: () => (
      <Intro title="Two faces, eight sizes">
        Keep the monospace face for what the machine says. Give human text a sans so menus and dialogs read as sentences.
      </Intro>
    ),
    States: () => (
      <Stack gap="u8">
        <Intro size="sub" as="h3" title="Sub-section">
          A title-size heading with a body lede.
        </Intro>
        <Intro size="section" as="h3" title="Section">
          A heading with a body lede.
        </Intro>
      </Stack>
    ),
  },
  button: {
    Live: () => {
      const [n, setN] = useState(0);
      return (
        <Inline gap="u3" wrap>
          <Button variant="primary" onPress={() => setN((x) => x + 1)}>
            Save
          </Button>
          <Button onPress={() => setN(0)}>Reset</Button>
          <Text as="span" variant="small" tone="faint" tabular>
            Saved {n} {n === 1 ? "time" : "times"}
          </Text>
        </Inline>
      );
    },
    States: () => (
      <Grid layout="three" gap="u4">
        {(["primary", "secondary", "ghost"] as const).map((v) => (
          <Cell key={v} label={v}>
            <Stack gap="u2" align="start">
              <Button variant={v} size="small">
                Small
              </Button>
              <Button variant={v}>Medium</Button>
              <Button variant={v} size="large">
                Large
              </Button>
              <Button variant={v} isDisabled>
                Disabled
              </Button>
            </Stack>
          </Cell>
        ))}
      </Grid>
    ),
  },
  "button-link": {
    Live: () => (
      <Inline gap="u2" wrap>
        <ButtonLink href="/demo" variant="primary">
          Launch the demo
        </ButtonLink>
        <ButtonLink href="/">Read the exposition</ButtonLink>
      </Inline>
    ),
  },
  "text-link": {
    Live: () => (
      <Text measure>
        Omarchy is made by DHH and contributors; read the{" "}
        <TextLink href="https://omarchy.org" external>
          Omarchy manual
        </TextLink>{" "}
        for the real thing, or go back to the <TextLink href="/">exposition</TextLink>.
      </Text>
    ),
    States: () => (
      <Inline gap="u6" wrap>
        <Cell label="default">
          <Text as="span" variant="small">
            <TextLink href="/system">System reference</TextLink>
          </Text>
        </Cell>
        <Cell label="quiet">
          <Text as="span" variant="small">
            <TextLink href="/system" quiet>
              Reference →
            </TextLink>
          </Text>
        </Cell>
      </Inline>
    ),
  },
  checkbox: {
    Live: () => {
      const [on, setOn] = useState(true);
      return (
        <Checkbox isSelected={on} onChange={setOn}>
          Slow down 5×
        </Checkbox>
      );
    },
    States: () => (
      <Inline gap="u6" wrap>
        <Checkbox>Unchecked</Checkbox>
        <Checkbox defaultSelected>Checked</Checkbox>
        <Checkbox isDisabled>Disabled</Checkbox>
      </Inline>
    ),
  },
  switch: {
    Live: () => (
      <div {...stylex.props(s.narrow)}>
        <Stack gap="u3">
          <Switch defaultSelected>Night light</Switch>
          <Switch>Do not disturb</Switch>
          <Switch defaultSelected>Idle lock</Switch>
        </Stack>
      </div>
    ),
    States: () => (
      <div {...stylex.props(s.narrow)}>
        <Stack gap="u3">
          <Switch>Off</Switch>
          <Switch defaultSelected>On</Switch>
          <Switch isDisabled>Disabled</Switch>
        </Stack>
      </div>
    ),
  },
  segmented: {
    Live: () => {
      const [v, setV] = useState<"stock" | "split" | "tuned">("split");
      return (
        <Inline gap="u4" wrap>
          <Segmented
            label="View"
            value={v}
            onChange={setV}
            options={[
              { id: "stock", label: "Stock" },
              { id: "split", label: "Split" },
              { id: "tuned", label: "Tuned" },
            ]}
          />
          <Text as="span" variant="small" tone="faint">
            Showing {v}
          </Text>
        </Inline>
      );
    },
  },
  "text-field": {
    Live: () => {
      const [v, setV] = useState("omarchy");
      const invalid = !/^[a-z0-9-]+$/.test(v);
      return (
        <div {...stylex.props(s.narrow)}>
          <TextField
            label="Hostname"
            value={v}
            onChange={setV}
            mono
            description="Lowercase letters, digits and hyphens."
            isInvalid={invalid}
            errorMessage="Use only lowercase letters, digits and hyphens."
          />
        </div>
      );
    },
    States: () => (
      <Grid layout="two" gap="u6">
        <TextField label="Default" placeholder="omarchy" />
        <TextField label="With description" description="Shown under the field." />
        <TextField label="Invalid" defaultValue="Omarchy Box" isInvalid errorMessage="No spaces or capitals." mono />
        <TextField label="Disabled" defaultValue="omarchy" isDisabled mono />
        <TextField label="Large" defaultValue="omarchui" type="password" size="large" />
      </Grid>
    ),
  },
  menu: {
    Live: () => {
      const [v, setV] = useState("tokyo-night");
      return (
        <Inline gap="u4" wrap>
          <Menu
            label="Theme"
            trigger={<>{v}</>}
            selected={v}
            onAction={setV}
            options={[
              { id: "tokyo-night", label: "Tokyo Night", detail: "dark" },
              { id: "nord", label: "Nord", detail: "dark" },
              { id: "catppuccin-latte", label: "Catppuccin Latte", detail: "light" },
            ]}
          />
          <Text as="span" variant="small" tone="faint">
            Picks a value; it does not change this page.
          </Text>
        </Inline>
      );
    },
  },
  tooltip: {
    Live: () => (
      <Inline gap="u2">
        {["Thesis", "Rules", "Color"].map((name, i) => (
          <Tooltip key={name} content={name}>
            <Button size="small" variant="ghost" aria-label={`${i + 1}: ${name}`}>
              {i + 1}
            </Button>
          </Tooltip>
        ))}
        <Text as="span" variant="small" tone="faint">
          Hover or tab to a number.
        </Text>
      </Inline>
    ),
  },
  kbd: {
    Live: () => (
      <Stack gap="u3">
        <Inline gap="u2">
          <Kbd>Super</Kbd>
          <Kbd>Return</Kbd>
          <Kbd>Esc</Kbd>
        </Inline>
        <Chord chord="Super+Shift+1" />
        <Chord chord="Super+Alt+Space" />
      </Stack>
    ),
  },
  tag: {
    Live: () => (
      <Stack gap="u3">
        <Inline gap="u2" wrap>
          <Tag>Keyboard first</Tag>
          <Tag>Square corners</Tag>
        </Inline>
        <Inline gap="u3" wrap>
          <Tag variant="token">raised</Tag>
          <Tag variant="token">line-2</Tag>
          <Tag variant="token">accent</Tag>
        </Inline>
      </Stack>
    ),
  },
  swatch: {
    Live: () => (
      <Grid layout="fitSm" gap="u3">
        <Swatch role="accent" fill="var(--accent)" use="Focus, selection, active workspace" />
        <Swatch role="ok" alias="green" fill="var(--green)" use="Success, charging" />
        <Swatch role="raised" fill="var(--raised)" use="Menus, toasts, overlays" />
      </Grid>
    ),
  },
  "code-block": {
    Live: () => <CodeBlock title="~/.config/hypr/looknfeel.conf" copy={"general {\n    gaps_in = 4\n    gaps_out = 12\n    border_size = 1\n}"} />,
  },
  rows: {
    Live: () => (
      <Rows>
        {[
          ["Unit", "One 4px unit for every gap."],
          ["Focus", "One ring for windows, fields and rows."],
          ["Type", "Mono for machines, sans for people."],
        ].map(([k, v]) => (
          <Row key={k} layout="keyed">
            <Text as="span" variant="label" tone="accent">
              {k}
            </Text>
            <Text as="span">{v}</Text>
          </Row>
        ))}
      </Rows>
    ),
  },
  bar: {
    Live: () => {
      const [ws, setWs] = useState(2);
      const [vol, setVol] = useState(64);
      return (
        <div {...stylex.props(s.fill)}>
          <Bar
            framed
            workspaces={BAR_WS.map((w) => ({ ...w, active: w.n === ws }))}
            onWorkspace={setWs}
            clock={{ day: "Sunday", time: "14:32" }}
            modules={[
              { id: "cpu", icon: "cpu", label: "CPU", value: "13%" },
              { id: "wifi", icon: "wifi", label: "Wifi", value: "home" },
              { id: "vol", icon: "volume", label: "Volume", value: String(vol), onPress: () => setVol((v) => (v >= 100 ? 0 : v + 10)) },
              { id: "bat", icon: "battery", label: "Battery", value: "82", tone: "ok" },
            ]}
          />
        </div>
      );
    },
    States: () => (
      <Stack gap="u4">
        <Cell label="battery low">
          <Bar
            framed
            workspaces={BAR_WS}
            clock={{ day: "Sunday", time: "14:32" }}
            modules={[
              { id: "cpu", icon: "cpu", label: "CPU", value: "91%", tone: "warn" },
              { id: "bat", icon: "battery", label: "Battery", value: "9", tone: "err" },
            ]}
          />
        </Cell>
      </Stack>
    ),
  },
  window: {
    Live: () => {
      const [active, setActive] = useState(0);
      return (
        <Grid layout="three" gap="u2">
          {["Terminal", "Neovim", "btop"].map((name, i) => (
            <div key={name} {...stylex.props(s.win)}>
              <WindowFrame label={name} active={active === i} onPointerDown={() => setActive(i)}>
                <div {...stylex.props(s.winBody)}>{name.toLowerCase()} · click to focus</div>
              </WindowFrame>
            </div>
          ))}
        </Grid>
      );
    },
    States: () => (
      <Grid layout="three" gap="u4">
        {(["inactive", "active", "urgent"] as const).map((st) => (
          <Cell key={st} label={st}>
            <div {...stylex.props(s.win)}>
              <WindowFrame label={st} active={st === "active"} urgent={st === "urgent"}>
                <div {...stylex.props(s.winBody)}>~ ❯ {st}</div>
              </WindowFrame>
            </div>
          </Cell>
        ))}
      </Grid>
    ),
  },
  "menu-panel": {
    Live: () => {
      const [sel, setSel] = useState(1);
      const rows = [
        { key: "learn", glyph: "¶", name: "Learn", more: true },
        { key: "appearance", glyph: "◐", name: "Appearance", more: true },
        { key: "update", glyph: "↻", name: "Update" },
      ];
      return (
        <MenuPanel
          label="Omarchy menu"
          listId="doc-menu"
          sel={sel}
          onHover={setSel}
          onPick={setSel}
          search={
            <Text as="span" variant="small" tone="faint">
              Search the menu
            </Text>
          }
          rows={rows}
        />
      );
    },
  },
  toast: {
    Live: () => (
      <div {...stylex.props(s.narrow)}>
        <Stack gap="u2">
          <Toast who="Calendar" title="Design review moved to 15:00" body="Same room. Bring the theme file." />
          <Toast who="Battery" critical title="Battery at 9%" body="Plug in within 15 minutes to avoid suspending." />
        </Stack>
      </div>
    ),
  },
  "image-picker": {
    Live: () => {
      const themes = ["catppuccin", "everforest", "gruvbox", "kanagawa", "nord", "rose-pine", "tokyo-night"] as const;
      const [sel, setSel] = useState(2);
      return (
        <ImagePicker
          label="Themes"
          listId="example-picker"
          showLabels
          sel={sel}
          images={themes.map((t) => ({ key: t, label: THEMES[t].name, src: previewSrc(t) }))}
          onSelect={setSel}
          onPick={setSel}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setSel((i) => (i + themes.length - 1) % themes.length);
            else if (e.key === "ArrowRight") setSel((i) => (i + 1) % themes.length);
            else return;
            e.preventDefault();
          }}
        />
      );
    },
  },
  osd: {
    Live: () => {
      const [v, setV] = useState(64);
      const [muted, setMuted] = useState(false);
      return (
        <Stack gap="u3" align="start">
          <Osd icon={muted ? "mute" : "volume"} value={v} muted={muted} label="Volume" />
          <Inline gap="u2">
            <Button size="small" onPress={() => setV((x) => Math.max(0, x - 10))}>
              −10
            </Button>
            <Button size="small" onPress={() => setV((x) => Math.min(100, x + 10))}>
              +10
            </Button>
            <Button size="small" variant="ghost" onPress={() => setMuted((m) => !m)}>
              {muted ? "Unmute" : "Mute"}
            </Button>
          </Inline>
        </Stack>
      );
    },
  },
  "lock-panel": {
    Live: () => (
      <LockPanel hint="Any password works in the demo.">
        <LockField />
      </LockPanel>
    ),
  },
  icon: {
    Live: () => (
      <Stack gap="u4">
        <Inline gap="u4" wrap>
          {(
            ["wifi", "volume", "mute", "battery", "bluetooth", "cpu", "search", "sun", "moon", "bell", "bellOff", "expand", "exit", "chevron"] as IconName[]
          ).map((n) => (
            <Inline key={n} gap="u1">
              <Icon name={n} />
              <Text as="span" variant="caption" face="mono" tone="faint">
                {n}
              </Text>
            </Inline>
          ))}
        </Inline>
        <Inline gap="u4">
          <Mark />
          <Mark large />
        </Inline>
      </Stack>
    ),
  },
};

/** Client-side renderers, so server pages pass a slug rather than reading client exports. */
export function ExampleBlock({ slug, kind }: { slug: string; kind: "live" | "states" }) {
  const ex = EXAMPLES[slug];
  const Body = kind === "live" ? ex?.Live : ex?.States;
  if (!Body) return null;
  return (
    <Stack gap="u4" as="section" aria-labelledby={`h-${kind}`}>
      <Text as="h2" variant="title" id={`h-${kind}`}>
        {kind === "live" ? "Example" : "Variants and states"}
      </Text>
      <Box tone="wall" border="line" pad={kind === "live" ? "u8" : "u6"}>
        <Body />
      </Box>
    </Stack>
  );
}
