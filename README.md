# Omarchui

[![ci](https://github.com/oddurs/omarchui/actions/workflows/ci.yml/badge.svg)](https://github.com/oddurs/omarchui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A re-tuning of [Omarchy](https://omarchy.org) 4's interface, as a site, a design system
and a working demo. It keeps the paradigm (keyboard first, tiling, square corners, one
theme for everything) and tightens the structure: one 4px unit, one focus ring, a second
face for human text, and eighteen colour roles derived from Omarchy's own palettes.

| Route      | What                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`        | The exposition: rules, colour, type, space, parts and keys, each with stock beside tuned.                                                                                                                   |
| `/demo`    | A desktop in the browser: dwindle tiling, nine workspaces, a shell, an editor, btop, lazygit, the Omarchy menu, notifications, a lock screen and a before/after divider. Alt stands in for Super.           |
| `/system`  | The design system reference: foundations, then a page per primitive, pattern, component and shell part, with live examples, generated props and accessibility notes.                                        |
| `/omarchy` | How Omarchy is built: a cited map of its repository, theme system, Hyprland config, all 257 bindings, the bar, the 423-entry menu, shell services, type and spacing. Every fact links to its file and line. |

## Run it

```sh
git clone https://github.com/oddurs/omarchui && cd omarchui
scripts/setup            # hooks, dependencies, the Playwright browser
pnpm dev                 # prints its URL; the port is derived from the folder name
```

## Development

Work happens in worktrees through `scripts/agent`; `main` only moves through merged pull
requests. See [CONTRIBUTING.md](CONTRIBUTING.md).

| Command                               | Does                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `scripts/agent doctor`                | Check the toolchain, auth, hooks and a clean tree                                     |
| `scripts/agent start <type>/<slug>`   | New branch from `origin/main` in its own worktree                                     |
| `scripts/agent check`                 | `scripts/task check`: format, lint, types, generated files, build, unit and e2e tests |
| `scripts/agent commit "<msg>"`        | Conventional commit                                                                   |
| `scripts/agent pr [--draft] [--auto]` | Check, push, open the PR; `--auto` squash-merges when CI passes                       |
| `scripts/agent sync`                  | Rebase onto `origin/main`                                                             |
| `scripts/agent done`                  | After the merge: remove the worktree and branch, update `main`                        |
| `scripts/agent list`                  | Worktrees and their PR state                                                          |

## Where things live

| Path                                   | What                                                                                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design/tokens`                        | StyleX tokens. Colours keep literal `--role` names so themes apply at runtime; `chrome.stylex.ts` holds the structural tokens, and `stock` overrides them with Omarchy 4's shipped values. Before/after is that theme. |
| `design/primitives`, `design/patterns` | Box, Stack, Inline, Grid, Text and the type presets; Intro.                                                                                                                                                            |
| `design/components`                    | Button, ButtonLink, TextLink, Checkbox, Switch, Segmented, TextField, Menu, Tooltip, Kbd, Tag, Swatch, CodeBlock, Rows. Behaviour from React Aria.                                                                     |
| `design/shell`                         | The desktop's own parts: bar, window, menu card, notification, overlay, lock panel, icons.                                                                                                                             |
| `docs`                                 | The reference: registry (guidance), examples, token reader, generated `props.json`, and the `/omarchy` renderers.                                                                                                      |
| `research/omarchy`                     | `facts.json` and `README.md`: Omarchy's UI read from source at a pinned commit. Inputs to `/omarchy`, the stock theme, the keymap test and the theme generator.                                                        |
| `lib`                                  | Pure logic: themes (generated), contrast, tiling, keymap, shell, menus, file system.                                                                                                                                   |
| `demo`, `site`                         | The desktop and the exposition.                                                                                                                                                                                        |
| `prototype/index.html`                 | The first single-file sketch.                                                                                                                                                                                          |

## Rules the tests hold

- Every ink, accent and spectrum colour reaches 4.5:1 on every ground in all 23 themes (`tests/contrast.test.ts`).
- Font sizes, z-indexes and focus rings come only from tokens; design-system components have no `style` or `className` prop (`tests/system-rules.test.ts`).
- A keybinding marked as Omarchy's today must exist in Omarchy's source (`tests/keymap-omarchy.test.ts`).
- Generated themes and prop tables are current (`scripts/task lint`).
- Every `/system` and `/omarchy` page passes axe in light and dark (`e2e/`).

Set `SITE_URL` when deploying so Open Graph and the sitemap use the real origin.

## License

[MIT](LICENSE). Omarchy is made by DHH and contributors; this is an unofficial study.
