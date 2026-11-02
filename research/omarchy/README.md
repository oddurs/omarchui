# How Omarchy is built: a cited map of its user interface

- **Source:** `basecamp/omarchy`, commit `175e63b62dc3201866722e45ee9a60714cde16fa` ("Sync Slack's native theme with Omarchy (#17113)"), committed 2026-11-01 18:10:30 -0500.
- **Version:** `4.0.0.alpha` (`version`), codename "quattro".
- **Method:** files were read, never executed. Each fact cites `path:line` relative to the repository root. Structured data is in [`facts.json`](facts.json). Palettes, bindings and the menu tree were extracted by script from the files cited, and the README tables are rendered from that JSON.

## Read this first: Omarchy 4 is a different desktop

Most published descriptions of Omarchy (and Omarchui's current guesses) describe 3.x. At this commit the UI stack has been replaced:

| Concern                  | Omarchy 3.x                     | Omarchy 4.0 (this commit)                                                                       | Evidence                                                                                    |
| ------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Status bar               | Waybar                          | `omarchy.bar`, a Quickshell (QML) plugin                                                        | `shell/plugins/bar/README.md:3-6`, `bin/omarchy-upgrade-to-quattro:925`                     |
| Launcher                 | Walker + Elephant               | none; the Omarchy menu (Super+Space) lists apps, and the dock has an app grid (Super+Alt+Space) | `default/hypr/bindings/utilities.lua:1-2`, `bin/omarchy-upgrade-to-quattro:883-896,910,921` |
| Notifications            | mako                            | `omarchy.notifications` shell service                                                           | `docs/notifications.md:3`, `bin/omarchy-upgrade-to-quattro:907`                             |
| OSD                      | swayosd                         | `omarchy.osd`                                                                                   | `shell/plugins/README.md:39`, `bin/omarchy-upgrade-to-quattro:920`                          |
| Lock / idle              | hyprlock / hypridle             | `omarchy.lock` / `omarchy.idle`                                                                 | `shell/plugins/README.md:38`, `bin/omarchy-upgrade-to-quattro:899-900`                      |
| Wallpaper                | swaybg                          | shell background plugin + OWE for video                                                         | `bin/omarchy-upgrade-to-quattro:919`, `install/omarchy-base.packages:111-112`               |
| Polkit                   | polkit-gnome                    | `omarchy.polkit`                                                                                | `bin/omarchy-upgrade-to-quattro:916`                                                        |
| Audio / Wi-Fi / BT setup | wiremix / impala / bluetui TUIs | bar panels                                                                                      | `bin/omarchy-upgrade-to-quattro:878,901,929`                                                |
| Hyprland config          | `hyprland.conf`                 | Lua (`hyprland.lua`, `hl.config`, `o.bind`)                                                     | `config/hypr/hyprland.lua:1-32`                                                             |
| Default terminal         | Alacritty                       | foot                                                                                            | `default/xdg-terminal-exec/hyprland-xdg-terminals.list:3`                                   |

All of it runs in one long-lived process, `omarchy-shell`: "Its bar, panels, overlays, menus, and services are plugins hosted by `shell.qml`" (`shell/README.md:3`). Every shell surface takes its colours from one generated `shell.toml` and its sizes from one `Style` singleton (`shell/Commons/Style.qml`). That makes 4.0 much more internally consistent than the 3.x mix of Waybar CSS, Walker CSS, mako and hyprlock configs.

---

## 1. Repository map

| dir                | files | purpose                                                                                                                                                                                                                                       | ships in                 | source                                                  |
| ------------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| `bin/`             | 575   | omarchy-* commands (theme, menu, launch, hyprland, install, toggle, capture...). Installed to /usr/bin.                                                                                                                                       | omarchy package          | docs/file-layout.md:89-90                               |
| `shell/`           | 282   | The Quickshell desktop: bar, Omarchy menu, notifications, OSD, lock screen, dock, panels, polkit, image picker. Installed to /usr/share/omarchy/shell.                                                                                        | omarchy package          | shell/README.md:3; docs/file-layout.md:100              |
| `default/`         | 463   | Omarchy-managed defaults read in place from /usr/share/omarchy/default: Hyprland Lua modules, theme templates (default/themed/*.tpl), menu definition, plymouth and SDDM themes, fontconfig, icon font, i18n strings. Not meant to be edited. | omarchy-settings package | docs/file-layout.md:123-144; default/hypr/omarchy.lua:6 |
| `config/`          | 49    | User-editable dotfiles seeded into ~/.config through /etc/skel (hypr/*.lua overrides, terminal configs, omarchy/shell.json, menu extension sample, hook samples).                                                                             | omarchy-settings package | docs/file-layout.md:104-105                             |
| `themes/`          | 274   | 23 first-party themes (colors.toml plus optional overrides, backgrounds, previews).                                                                                                                                                           | omarchy package          | docs/theming.md:3-9                                     |
| `applications/`    | 33    | .desktop launchers for preinstalled web apps and default apps, plus their icons.                                                                                                                                                              | omarchy-settings package | docs/file-layout.md:113-118                             |
| `install/`         | 124   | Install/finalize scripts and package lists (omarchy-base.packages etc.).                                                                                                                                                                      | omarchy package          | docs/file-layout.md:96                                  |
| `migrations/`      | 226   | One-shot upgrade scripts run on update.                                                                                                                                                                                                       | omarchy package          | docs/file-layout.md:97                                  |
| `etc/`             | 59    | System /etc drop-ins (sddm.conf.d, fastfetch, kitty system config, xkb compose option, NetworkManager, sudoers...).                                                                                                                           | omarchy-settings package | docs/file-layout.md:107-129                             |
| `manual/`          | 2594  | The user manual: 51 English chapters plus 50 locale directories. Repo only.                                                                                                                                                                   | neither                  | README.md:9; docs/file-layout.md:31-33                  |
| `docs/`            | 17    | Developer reference (theming, shell, menu, notifications, file layout...). Repo only.                                                                                                                                                         | neither                  | docs/file-layout.md:31-33                               |
| `test/`            | 531   | CLI, shell, acceptance and CI-VM test suites. Repo only.                                                                                                                                                                                      | neither                  | docs/file-layout.md:31-33                               |
| `agents/`          | 10    | Contributor task guides (skills) for coding agents. Repo only.                                                                                                                                                                                | neither                  | docs/file-layout.md:31-33                               |
| `oligarchy-tests/` | 7     | JSON acceptance scenarios (lock screen, menu, workspace switching...).                                                                                                                                                                        | neither                  | oligarchy-tests/                                        |
| `plans/`           | 7     | Design plans (backup, dots, remote, server). Repo only.                                                                                                                                                                                       | neither                  | docs/file-layout.md:31-33                               |
| `scripts/`         | 1     | i18n-sync.py.                                                                                                                                                                                                                                 | neither                  | scripts/i18n-sync.py                                    |

Root files that matter for the UI: `logo.txt` (the OMARCHY wordmark in block characters), `icon.txt`/`icon.png`/`logo.svg`, and `version`.

Two Arch packages are built from the repo. `omarchy` carries `bin/`, `install/`, `migrations/`, `themes/` and `shell/`. `omarchy-settings` carries everything that must exist before the user is created: `/etc/skel` (from `config/`), `/etc` drop-ins, `default/`, fonts, and the Plymouth and SDDM themes (`docs/file-layout.md:7-25`). `bin/` holds 575 commands. The largest families are install (48), theme (41), hw (41), agent (40), remove (36), hyprland (36) and launch (25).

### `~/.config` vs `default/` vs `~/.local/state`

Three layers, in Lua `package.path` order: `~/.local/state/?.lua`, then `~/.config/?.lua`, then `$OMARCHY_PATH/?.lua` (default `/usr/share/omarchy`) (`default/hypr/bootstrap.lua:31-39`).

- **Managed, read in place:** `/usr/share/omarchy/default/**`. The Hyprland defaults carry the comment "Use Omarchy defaults, but don't edit these directly" (`default/hypr/omarchy.lua:6`). Package updates replace them.
- **User-editable, seeded once:** `config/**` is copied to `/etc/skel/.config/**` and then into `$HOME` by `useradd -m` (`docs/file-layout.md:35-49,104-105`). `~/.config/hypr/hyprland.lua` loads Omarchy's bootstrap, `require("default.hypr.omarchy")`, then the user's `hypr.monitors`, `hypr.input`, `hypr.bindings`, `hypr.looknfeel` and `hypr.autostart`, then `default.hypr.toggles` (`config/hypr/hyprland.lua:4-29`). The user files ship as commented examples, so they override only what the user uncomments. `omarchy-reinstall-configs` resets them by replaying `/etc/skel` (`docs/file-layout.md:405-417`).
- **Generated state:** `~/.local/state/omarchy/current/theme/` (the rendered theme), `theme.name`, the `background` symlink, and `toggles/hypr/*.lua` flags (`docs/theming.md:19-28`, `default/hypr/toggles.lua:4-17`).
- **Shell layout:** `~/.config/omarchy/shell.json`. When the user has no file the shell uses `config/omarchy/shell.json`. Once the user customises anything, their file is canonical, with no deep merge (`shell/plugins/bar/README.md:12,17`).
- **Menu:** `default/omarchy/omarchy-menu.jsonc`, merged per key with `~/.config/omarchy/extensions/omarchy-menu.jsonc` (`docs/menu.md:3-9,51-57`).

---

## 2. Theme system

### Anatomy of a theme

`themes/<slug>/` normally starts with `colors.toml`. Everything else is optional (`docs/theming.md:3-11`):

- `backgrounds/`: wallpapers, picked in sorted filename order. `backgrounds/intros/<same-name>.mp4` is an optional 5–7 s intro video that OWE plays on login and on theme switch.
- `preview.png`, `preview-unlock.png`: images for the theme picker.
- `unlock.png`: per-theme Plymouth/unlock art.
- `icons.theme`: the Yaru icon variant.
- `neovim.lua`, `vscode.json`: editor theme selection.
- Hand-written overrides that beat the generated file: `hyprland.lua`, `btop.theme`, `chromium.theme`, `shell.toml` or `shell.<section>.toml`, `keyboard.rgb`.

The Tokyo Night directory is typical: `colors.toml icons.theme keyboard.rgb neovim.lua preview-unlock.png preview.png shell.lock.toml unlock.png vscode.json` plus nine backgrounds.

### `colors.toml` → every app

`colors.toml` keys, grouped semantic-first (`docs/theming.md:65-102`, `themes/tokyo-night/colors.toml:1-31`):

```toml
mode = "dark"
accent = "#7aa2f7"   selection = "#292e42"   muted = "#414868"
background = "#1a1b26"  dark_background  darker_background  lighter_background
foreground = "#a9b1d6"  dark_foreground  light_foreground  bright_foreground
red yellow orange green cyan blue magenta brown
bright_red bright_yellow bright_green bright_cyan bright_blue bright_magenta
# optional: hyprland_active_border / hyprland_inactive_border (colour or "rgba(..) rgba(..) 45deg")
```

There are **no `color0..color15` keys** in any first-party theme. ANSI slots are derived (`bin/omarchy-theme-color:249-269`, `default/themed/alacritty.toml.tpl:29-47`): c0 = background, c1–c6 = red, green, yellow, blue, magenta, cyan, c7 = foreground, c8 = **muted**, c9–c14 = the bright hues, c15 = **bright_foreground**. Missing keys get computed defaults: dark/darker background = background mixed with black at 25% / 50%, bright hues = hue mixed with white at 20%, orange = yellow, brown = orange mixed with black at 50% (`bin/omarchy-theme-color:223-245`). Mode resolves as the `mode` key, then `theme_type`, then a `light.mode` file, then background luminance (r+g+b > 382), then dark (`bin/omarchy-theme-color:120-135`).

Templates live in `default/themed/*.tpl` (21 files): alacritty, btop, chromium, claude, fcitx5, foot, ghostty, gum_env.lua, helix, hermes, hyprland-preview-share-picker.css, **hyprland.lua**, keyboard.rgb, kitty, neovim.lua, obsidian.css, pi, **shell.toml**, slack, t3code and vscode-theme. Placeholders are `{{ key }}`, `{{ key_strip }}` and `{{ key_rgb }}`, plus `{{ mix a b 15% }}` and gradient helpers (`hypr_gradient`, `shell_gradient`, `gradient_start`) (`docs/theming.md:128-173`). One awk pass renders them all. User templates in `~/.config/omarchy/themed/` are rendered first, and a template never overwrites a file the theme ships (`bin/omarchy-theme-set-templates:428-454`).

### `omarchy-theme-set <name>`, end to end

1. Takes a `flock` and waits out any intro that is still playing (`bin/omarchy-theme-set:398-405`).
2. Rebuilds `~/.local/state/omarchy/current/next-theme`: copies `themes/<slug>/*`, then overlays `~/.config/omarchy/themes/<slug>`. If that directory was git-cloned (`omarchy theme install`), `*.lua`, terminal configs, `vscode.json` and symlinks are dropped (`bin/omarchy-theme-set:35,410-422`; `docs/theming.md:45-63`).
3. Converts `alacritty.toml` to `colors.toml` for legacy themes (`:424-427`).
4. Chooses the background: the remembered choice for that theme, else the first sorted file across `~/.config/omarchy/backgrounds/<theme>/` and `themes/<slug>/backgrounds/`. It also prepares a snapshot, or the intro video (`:147-197,439-477`).
5. Runs `omarchy-theme-set-templates` (`:480`).
6. Swaps the staged directory into `current/theme` and writes `theme.name` (`:488-501`).
7. Pipes `colors.toml` and `shell.toml` (base64) into the running shell, which crossfades wallpaper and bar palette (`background themeTransition`), and points the `current/background` symlink at the new still (`:505-516,256-272`). The crossfade takes 420 ms (`docs/theming.md:13`).
8. Runs the visible retints in parallel: `omarchy-restart-terminal`, `-theme-set-foot`, `-theme-set-tmux`, `-restart-btop`, `-restart-opencode`, `-restart-helix`, `-theme-set-hunk`, plus `omarchy-restart-hyprctl` (a Hyprland reload) unless an intro is playing (`:526-534,608-614`).
9. Runs the background retints: GNOME/GTK, pi, claude, hermes, t3code, slack, browser policy, vscode, obsidian, keyboard RGB and fcitx5. Then it fires `~/.config/omarchy/hooks/theme-set*` (`:539-606`).
10. Optionally mirrors the theme to herdr machines over SSH (`:628-629`).

Hyprland picks the new borders up because `default/hypr/omarchy.lua:31-32` does `require_optional.module("omarchy.current.theme.hyprland")` last. That loads `~/.local/state/omarchy/current/theme/hyprland.lua`, which is the theme's hand-written file or the rendered `hyprland.lua.tpl`.

### Light mode

The template system has no light-specific branch. A light theme simply sets `mode = "light"` and a light `background`. `omarchy-theme-set-gnome` then sets `color-scheme prefer-light` and `gtk-theme Adwaita`, or `prefer-dark` and `Adwaita-dark` (`bin/omarchy-theme-set-gnome:18-26`). It also sets the GTK icon theme from `icons.theme`, defaulting to `Yaru-blue` (`:29-34`). Five themes are light: catppuccin-latte, flexoki-light, lupine, rose-pine (the Dawn palette, despite the generic name) and white.

### Shell surface tokens (`shell.toml`)

`default/themed/shell.toml.tpl` maps the palette onto every shell surface. These are the defaults every theme inherits unless it ships `shell.toml` or `shell.<section>.toml`:

| Section                           | Background                                                         | Text       | Border                                                                                                                        | Other                                                                                    | Lines   |
| --------------------------------- | ------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------- |
| `[bar]`                           | background, alpha 1.0                                              | foreground | —                                                                                                                             | `active` (attention) = red; size 26 / 28                                                 | 5-17    |
| `[hyprland]`                      | —                                                                  | —          | `active-border` = hyprland_active_border or **accent**; `active-border-foreground` = hyprland_active_border or **foreground** | —                                                                                        | 19-24   |
| `[controls]`                      | fill foreground @ 0.04 / hover 0.08 / selected 0.18 / pressed 0.22 | —          | foreground @ 0.4 (1px), hover/focus @ 0.25, selected 0px                                                                      | selection fill 0.35                                                                      | 26-65   |
| `[popups]` (bar flyouts, OSD)     | background 1.0                                                     | foreground | hyprland.active-border                                                                                                        | —                                                                                        | 122-132 |
| `[tooltip]`                       | background 0.97                                                    | foreground | active-border-foreground                                                                                                      | —                                                                                        | 134-141 |
| `[notifications]`                 | background 1.0                                                     | foreground | hyprland.active-border                                                                                                        | countdown = accent                                                                       | 143-152 |
| `[menu]` (also clipboard, emojis) | background 1.0                                                     | foreground | active-border-foreground                                                                                                      | scrim background @ 0.5; selected: fill foreground @ 0.08, text **accent**, border @ 0.25 | 172-187 |
| `[launcher]`                      | background **0.95**                                                | foreground | active-border-foreground                                                                                                      | same as menu. **Read by no QML at this commit**                                          | 154-170 |
| `[polkit]`                        | background 1.0                                                     | foreground | hyprland.active-border, red on error                                                                                          | scrim 0.5; accent on the lock glyph                                                      | 189-205 |
| `[lock]`                          | background **0.8**                                                 | foreground | hyprland.active-border, red on error                                                                                          | placeholder = mix(fg, bg, 34%); selection = accent @ 0.45                                | 207-224 |
| `[image-picker]`                  | none (over desktop)                                                | foreground | selected = accent; unselected = foreground @ 0.28                                                                             | —                                                                                        | 226-235 |

Border widths default to 2 for cards (`Border.surfaceSpec(..., Math.max(1, Style.space(2)))`, e.g. `shell/plugins/menu/Menu.qml:117`).

---

## 3. Every theme

Display names come from the slug: hyphens become spaces and each word is capitalised (`bin/omarchy-theme-list:9`), so `tokyo-night` becomes "Tokyo Night" and `retro-82` becomes "Retro 82". Hex casing is as written in each `colors.toml`. The default theme is **Tokyo Night** (`install/user/theme.sh:7,10`).

### Core palette and borders

Active border rules: themes without a `hyprland.lua` get `hyprland_active_border`, or else `accent`. The inactive border is `hyprland_inactive_border`, or else `rgba(595959aa)` (`default/themed/hyprland.lua.tpl:1-2`). Five themes ship a hand-written `hyprland.lua` (kanagawa, last-horizon, lumon, retro-82, solitude), and that file wins. The shell's border tokens still come from `colors.toml`, so the two can drift. Lumon's windows get `#f2fcff`, but its notifications, OSD and lock get the accent `#8bc9eb`. Retro 82's menu border is its foreground `#f6dcac`, but its window border is `#faa968`. Last Horizon's `hyprland.lua` adds a 45° angle that its `colors.toml` gradient lacks.

| slug             | name             | mode  | background | foreground | accent    | selection | Hyprland active border                 | inactive border | icon theme      | source                              |
| ---------------- | ---------------- | ----- | ---------- | ---------- | --------- | --------- | -------------------------------------- | --------------- | --------------- | ----------------------------------- |
| catppuccin       | Catppuccin       | dark  | `#1e1e2e`  | `#cdd6f4`  | `#89b4fa` | `#45475a` | `#89b4fa`                              | `#595959aa`     | Yaru-purple     | themes/catppuccin/colors.toml       |
| catppuccin-latte | Catppuccin Latte | light | `#eff1f5`  | `#4c4f69`  | `#1e66f5` | `#ccd0da` | `#1e66f5`                              | `#595959aa`     | Yaru-blue       | themes/catppuccin-latte/colors.toml |
| ethereal         | Ethereal         | dark  | `#060B1E`  | `#ffcead`  | `#7d82d9` | `#252e56` | `#7d82d9`                              | `#595959aa`     | Yaru-blue       | themes/ethereal/colors.toml         |
| everforest       | Everforest       | dark  | `#2d353b`  | `#d3c6aa`  | `#7fbbb3` | `#3d484d` | `#7fbbb3`                              | `#595959aa`     | Yaru-sage       | themes/everforest/colors.toml       |
| flexoki-light    | Flexoki Light    | light | `#FFFCF0`  | `#100F0F`  | `#205EA6` | `#CECDC3` | `#205EA6`                              | `#595959aa`     | Yaru-blue       | themes/flexoki-light/colors.toml    |
| gruvbox          | Gruvbox          | dark  | `#282828`  | `#d4be98`  | `#7daea3` | `#504945` | `#7daea3`                              | `#595959aa`     | Yaru-olive      | themes/gruvbox/colors.toml          |
| hackerman        | Hackerman        | dark  | `#0B0C16`  | `#ddf7ff`  | `#82FB9C` | `#1f253a` | gradient `#26a269ee` → `#2ec27eee` 45° | `#595959aa`     | Yaru-blue       | themes/hackerman/colors.toml        |
| jade-horse       | Jade Horse       | dark  | `#142620`  | `#dfede5`  | `#8bcbb1` | `#2b5147` | `#8bcbb1`                              | `#595959aa`     | Yaru-sage       | themes/jade-horse/colors.toml       |
| kanagawa         | Kanagawa         | dark  | `#1f1f28`  | `#dcd7ba`  | `#dcd7ba` | `#363646` | `#dcd7ba`                              | `#595959aa`     | Yaru-blue       | themes/kanagawa/colors.toml         |
| last-horizon     | Last Horizon     | dark  | `#0c0b0c`  | `#FAFCFB`  | `#b59790` | `#584e51` | gradient `#8a8588ee` → `#e2dddcee` 45° | `#584e51aa`     | Yaru-purple     | themes/last-horizon/colors.toml     |
| lumon            | Lumon            | dark  | `#16242d`  | `#d6e2ee`  | `#8bc9eb` | `#243d56` | `#f2fcff`                              | `#30486099`     | Yaru-blue       | themes/lumon/colors.toml            |
| lupine           | Lupine           | light | `#fafafa`  | `#212121`  | `#3264eb` | `#d0d0d0` | `#3264eb`                              | `#595959aa`     | Yaru-purple     | themes/lupine/colors.toml           |
| matte-black      | Matte Black      | dark  | `#121212`  | `#bebebe`  | `#e68e0d` | `#2a2a2a` | `#e68e0d`                              | `#595959aa`     | Yaru-red        | themes/matte-black/colors.toml      |
| miasma           | Miasma           | dark  | `#222222`  | `#c2c2b0`  | `#78824b` | `#383838` | `#78824b`                              | `#595959aa`     | Yaru-wartybrown | themes/miasma/colors.toml           |
| nord             | Nord             | dark  | `#2e3440`  | `#d8dee9`  | `#81a1c1` | `#434c5e` | `#81a1c1`                              | `#595959aa`     | Yaru-blue       | themes/nord/colors.toml             |
| retro-82         | Retro 82         | dark  | `#05182e`  | `#f6dcac`  | `#faa968` | `#134e5a` | `#faa968`                              | `#595959aa`     | Yaru-wartybrown | themes/retro-82/colors.toml         |
| ristretto        | Ristretto        | dark  | `#2c2525`  | `#e6d9db`  | `#f38d70` | `#403e41` | `#f38d70`                              | `#595959aa`     | Yaru-yellow     | themes/ristretto/colors.toml        |
| rose-pine        | Rose Pine        | light | `#faf4ed`  | `#575279`  | `#56949f` | `#dfdad9` | `#56949f`                              | `#595959aa`     | Yaru-blue       | themes/rose-pine/colors.toml        |
| solitude         | Solitude         | dark  | `#101315`  | `#cacccc`  | `#798186` | `#343d41` | gradient `#798186ee` → `#caccccee` 45° | `#1e1e1e`       | Yaru-sage-dark  | themes/solitude/colors.toml         |
| starship         | Starship         | dark  | `#1c1c1e`  | `#f5f5f7`  | `#ff9f0a` | `#3a3a3c` | `#ff9f0a`                              | `#595959aa`     | —               | themes/starship/colors.toml         |
| tokyo-night      | Tokyo Night      | dark  | `#1a1b26`  | `#a9b1d6`  | `#7aa2f7` | `#292e42` | `#7aa2f7`                              | `#595959aa`     | Yaru-magenta    | themes/tokyo-night/colors.toml      |
| vantablack       | Vantablack       | dark  | `#000000`  | `#ffffff`  | `#8d8d8d` | `#1a1a1a` | `#8d8d8d`                              | `#595959aa`     | Yaru-gray       | themes/vantablack/colors.toml       |
| white            | White            | light | `#ffffff`  | `#000000`  | `#6e6e6e` | `#c0c0c0` | `#6e6e6e`                              | `#595959aa`     | Yaru-grey       | themes/white/colors.toml            |

### ANSI 16 (c0–c15)

Derived as described above. These are the values every generated terminal config gets.

| slug             | c0        | c1        | c2        | c3        | c4        | c5        | c6        | c7        | c8        | c9        | c10       | c11       | c12       | c13       | c14       | c15       |
| ---------------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| catppuccin       | `#1e1e2e` | `#f38ba8` | `#a6e3a1` | `#f9e2af` | `#89b4fa` | `#f5c2e7` | `#94e2d5` | `#cdd6f4` | `#585b70` | `#f38ba8` | `#a6e3a1` | `#f9e2af` | `#89b4fa` | `#f5c2e7` | `#94e2d5` | `#cdd6f4` |
| catppuccin-latte | `#eff1f5` | `#d20f39` | `#40a02b` | `#df8e1d` | `#1e66f5` | `#ea76cb` | `#179299` | `#4c4f69` | `#acb0be` | `#d20f39` | `#40a02b` | `#df8e1d` | `#1e66f5` | `#ea76cb` | `#179299` | `#4c4f69` |
| ethereal         | `#060B1E` | `#ED5B5A` | `#92a593` | `#E9BB4F` | `#7d82d9` | `#c89dc1` | `#a3bfd1` | `#ffcead` | `#6d7db6` | `#faaaa9` | `#c4cfc4` | `#f7dc9c` | `#c2c4f0` | `#ead7e7` | `#dfeaf0` | `#ffcead` |
| everforest       | `#2d353b` | `#e67e80` | `#a7c080` | `#dbbc7f` | `#7fbbb3` | `#d699b6` | `#83c092` | `#d3c6aa` | `#475258` | `#e67e80` | `#a7c080` | `#dbbc7f` | `#7fbbb3` | `#d699b6` | `#83c092` | `#d3c6aa` |
| flexoki-light    | `#FFFCF0` | `#D14D41` | `#879A39` | `#D0A215` | `#205EA6` | `#CE5D97` | `#3AA99F` | `#100F0F` | `#B7B5AC` | `#D14D41` | `#879A39` | `#D0A215` | `#4385BE` | `#CE5D97` | `#3AA99F` | `#100F0F` |
| gruvbox          | `#282828` | `#ea6962` | `#a9b665` | `#d8a657` | `#7daea3` | `#d3869b` | `#89b482` | `#d4be98` | `#665c54` | `#ea6962` | `#a9b665` | `#d8a657` | `#7daea3` | `#d3869b` | `#89b482` | `#d4be98` |
| hackerman        | `#0B0C16` | `#50f872` | `#4fe88f` | `#50f7d4` | `#829dd4` | `#86a7df` | `#7cf8f7` | `#ddf7ff` | `#2d3450` | `#85ff9d` | `#9cf7c2` | `#a4ffec` | `#c4d2ed` | `#cddbf4` | `#d1fffe` | `#ddf7ff` |
| jade-horse       | `#142620` | `#d88d91` | `#8bcbb1` | `#c5cc91` | `#96b7d0` | `#b7a1c8` | `#86c7c5` | `#dfede5` | `#64887b` | `#e6a6aa` | `#a7dfc5` | `#dce1ac` | `#b0cde3` | `#cfbce0` | `#a2dcda` | `#f0faf4` |
| kanagawa         | `#1f1f28` | `#c34043` | `#76946a` | `#c0a36e` | `#7e9cd8` | `#957fb8` | `#6a9589` | `#dcd7ba` | `#54546D` | `#e82424` | `#98bb6c` | `#e6c384` | `#7fb4ca` | `#938aa9` | `#7aa89f` | `#dcd7ba` |
| last-horizon     | `#0c0b0c` | `#c38b7b` | `#87a9b0` | `#6B5E73` | `#b59790` | `#c4d8e2` | `#a5a0b6` | `#FAFCFB` | `#584e51` | `#c38b7b` | `#87a9b0` | `#6B5E73` | `#b59790` | `#c4d8e2` | `#a5a0b6` | `#e2dddc` |
| lumon            | `#16242d` | `#4d86b0` | `#5e95bc` | `#6fa4c9` | `#6fb8e3` | `#8bc9eb` | `#b4e4f6` | `#d6e2ee` | `#304860` | `#73a6cb` | `#86b7d8` | `#9dcae5` | `#f2fcff` | `#b1d8ee` | `#d1eef8` | `#f2fcff` |
| lupine           | `#fafafa` | `#c900c4` | `#4a2fd0` | `#026fde` | `#3264eb` | `#8a4ad7` | `#0c67de` | `#212121` | `#9e9e9e` | `#f930fb` | `#9f85e0` | `#358fff` | `#5482ff` | `#b363ff` | `#3986ff` | `#000000` |
| matte-black      | `#121212` | `#D35F5F` | `#FFC107` | `#b91c1c` | `#e68e0d` | `#D35F5F` | `#bebebe` | `#bebebe` | `#333333` | `#B91C1C` | `#FFC107` | `#b90a0a` | `#f59e0b` | `#B91C1C` | `#eaeaea` | `#bebebe` |
| miasma           | `#222222` | `#685742` | `#5f875f` | `#b36d43` | `#78824b` | `#bb7744` | `#c9a554` | `#c2c2b0` | `#666666` | `#685742` | `#5f875f` | `#b36d43` | `#78824b` | `#bb7744` | `#c9a554` | `#c2c2b0` |
| nord             | `#2e3440` | `#bf616a` | `#a3be8c` | `#ebcb8b` | `#81a1c1` | `#b48ead` | `#88c0d0` | `#d8dee9` | `#4c566a` | `#bf616a` | `#a3be8c` | `#ebcb8b` | `#81a1c1` | `#b48ead` | `#8fbcbb` | `#d8dee9` |
| retro-82         | `#05182e` | `#f85525` | `#028391` | `#e97b3c` | `#3f8f8a` | `#3f8f8a` | `#8cbfb8` | `#f6dcac` | `#2a6b78` | `#f85525` | `#028391` | `#e97b3c` | `#faa968` | `#3f8f8a` | `#8cbfb8` | `#f6dcac` |
| ristretto        | `#2c2525` | `#fd6883` | `#adda78` | `#f9cc6c` | `#f38d70` | `#a8a9eb` | `#85dacc` | `#e6d9db` | `#72696a` | `#ff8297` | `#c8e292` | `#fcd675` | `#f8a788` | `#bebffd` | `#9bf1e1` | `#e6d9db` |
| rose-pine        | `#faf4ed` | `#b4637a` | `#286983` | `#ea9d34` | `#56949f` | `#907aa9` | `#d7827e` | `#575279` | `#cecacd` | `#b4637a` | `#286983` | `#ea9d34` | `#56949f` | `#907aa9` | `#d7827e` | `#575279` |
| solitude         | `#101315` | `#565d60` | `#9fa5a9` | `#d9dbdc` | `#798186` | `#aeaeae` | `#707070` | `#cacccc` | `#4b4e55` | `#de6145` | `#343d41` | `#c9c2b4` | `#5d6367` | `#9a9a9a` | `#707070` | `#a5aeb4` |
| starship         | `#1c1c1e` | `#ff5f4a` | `#ff9f0a` | `#ffc27a` | `#8fb8de` | `#ff8fa3` | `#a6dcef` | `#f5f5f7` | `#8e8e93` | `#ff8373` | `#ffb340` | `#ffd8a8` | `#b5d0ea` | `#ffb3c1` | `#cdeefa` | `#ffffff` |
| tokyo-night      | `#1a1b26` | `#f7768e` | `#9ece6a` | `#e0af68` | `#7aa2f7` | `#ad8ee6` | `#449dab` | `#a9b1d6` | `#414868` | `#ff7a93` | `#b9f27c` | `#ff9e64` | `#7da6ff` | `#bb9af7` | `#0db9d7` | `#c0caf5` |
| vantablack       | `#000000` | `#a4a4a4` | `#b6b6b6` | `#cecece` | `#8d8d8d` | `#9b9b9b` | `#b0b0b0` | `#ffffff` | `#7a7a7a` | `#a4a4a4` | `#b6b6b6` | `#cecece` | `#8d8d8d` | `#9b9b9b` | `#b0b0b0` | `#ffffff` |
| white            | `#ffffff` | `#2a2a2a` | `#3a3a3a` | `#4a4a4a` | `#1a1a1a` | `#2e2e2e` | `#3e3e3e` | `#000000` | `#808080` | `#2a2a2a` | `#3a3a3a` | `#4a4a4a` | `#1a1a1a` | `#2e2e2e` | `#3e3e3e` | `#000000` |

### Neutral ramp and extra hues

| slug             | muted     | darker_bg | dark_bg   | lighter_bg | dark_fg   | light_fg  | bright_fg | orange    | brown     | derived (not in file) |
| ---------------- | --------- | --------- | --------- | ---------- | --------- | --------- | --------- | --------- | --------- | --------------------- |
| catppuccin       | `#585b70` | `#101019` | `#161622` | `#313244`  | `#6c7086` | `#bac2de` | `#cdd6f4` | `#f6b6ab` | `#7b5b55` | —                     |
| catppuccin-latte | `#acb0be` | `#d7d8dc` | `#e3e4e8` | `#dce0e8`  | `#9ca0b0` | `#5c5f77` | `#4c4f69` | `#d84e2b` | `#6c2715` | —                     |
| ethereal         | `#6d7db6` | `#030610` | `#040816` | `#131a3a`  | `#6d7db6` | `#c9b8a6` | `#ffcead` | `#eb8b54` | `#75452a` | —                     |
| everforest       | `#475258` | `#181d20` | `#21272c` | `#343f44`  | `#4f585e` | `#9da9a0` | `#d3c6aa` | `#e09d7f` | `#704e3f` | —                     |
| flexoki-light    | `#B7B5AC` | `#e5e2d8` | `#f2efe4` | `#E6E4D9`  | `#878580` | `#403E3C` | `#100F0F` | `#d0772b` | `#683b15` | —                     |
| gruvbox          | `#665c54` | `#161616` | `#1e1e1e` | `#3c3836`  | `#7c6f64` | `#bdae93` | `#d4be98` | `#e1875c` | `#70432e` | —                     |
| hackerman        | `#2d3450` | `#06060c` | `#080910` | `#151828`  | `#6a6e95` | `#b5c5db` | `#ddf7ff` | `#50f7a3` | `#287b51` | —                     |
| jade-horse       | `#64887b` | `#0a1713` | `#0f1e19` | `#203b31`  | `#91ad9f` | `#bed6c9` | `#f0faf4` | `#d2ab8d` | `#7e8970` | —                     |
| kanagawa         | `#54546D` | `#111116` | `#17171e` | `#223249`  | `#727169` | `#c8c093` | `#dcd7ba` | `#c17158` | `#60382c` | —                     |
| last-horizon     | `#584e51` | `#060606` | `#090809` | `#0c0b0c`  | `#584e51` | `#cfd3cd` | `#e2dddc` | `#6B5E73` | `#362f3a` | brown, orange         |
| lumon            | `#304860` | `#0b1216` | `#101b21` | `#1b2d40`  | `#4d86b0` | `#d6e2ee` | `#f2fcff` | `#8bc9eb` | `#456475` | —                     |
| lupine           | `#9e9e9e` | `#dedede` | `#ececec` | `#f5f5f5`  | `#757575` | `#424242` | `#000000` | `#026fde` | `#013a6f` | —                     |
| matte-black      | `#333333` | `#090909` | `#0d0d0d` | `#1e1e1e`  | `#555555` | `#8a8a8d` | `#bebebe` | `#c63d3d` | `#631e1e` | —                     |
| miasma           | `#666666` | `#121212` | `#191919` | `#2c2c2c`  | `#555555` | `#8a8a7e` | `#c2c2b0` | `#8d6242` | `#463121` | —                     |
| nord             | `#4c566a` | `#191c23` | `#222730` | `#3b4252`  | `#667080` | `#adb5c4` | `#d8dee9` | `#d5967a` | `#6a4b3d` | —                     |
| retro-82         | `#2a6b78` | `#020c17` | `#031222` | `#0a2540`  | `#3f8f8a` | `#a7c9c6` | `#f6dcac` | `#faa968` | `#743d1e` | —                     |
| ristretto        | `#72696a` | `#181414` | `#211b1b` | `#3d2f2a`  | `#72696a` | `#c3b7b8` | `#e6d9db` | `#fb9a77` | `#7d4d3b` | —                     |
| rose-pine        | `#cecacd` | `#e1dbd5` | `#ede7e1` | `#f2e9e1`  | `#9893a5` | `#6e6a86` | `#575279` | `#cf8057` | `#67402b` | —                     |
| solitude         | `#4b4e55` | `#080a0b` | `#0c0e10` | `#101315`  | `#4b4e55` | `#cbc2be` | `#a5aeb4` | `#d9dbdc` | `#6d6e6e` | brown, orange         |
| starship         | `#8e8e93` | `#0e0e10` | `#161618` | `#2c2c2e`  | `#98989d` | `#fbfbfd` | `#ffffff` | `#ff6a3d` | `#b8a99a` | —                     |
| tokyo-night      | `#414868` | `#0e0e14` | `#13141c` | `#24283b`  | `#565f89` | `#b4bee6` | `#c0caf5` | `#eb927b` | `#75493d` | —                     |
| vantablack       | `#7a7a7a` | `#070707` | `#090909` | `#1a1a1a`  | `#505050` | `#ececec` | `#ffffff` | `#b9b9b9` | `#5c5c5c` | —                     |
| white            | `#808080` | `#e8e8e8` | `#f5f5f5` | `#c0c0c0`  | `#c0c0c0` | `#000000` | `#000000` | `#4a4a4a` | `#252525` | brown, orange         |

### Per-surface values (shell and btop)

Menu borders use `active-border-foreground`, so with no `hyprland_active_border` key they are the theme's foreground. Notification, OSD and lock borders use `active-border`, which falls back to accent. btop values come from `default/themed/btop.theme.tpl:2-20` unless the theme ships `btop.theme`. Tokyo Night overrides every lock colour to `#a9b1d6` (`themes/tokyo-night/shell.lock.toml`).

| slug             | menu border                 | notification/OSD/lock border | lock placeholder | btop main_bg | btop hi_fg | btop selected_bg | btop selected_fg | btop source                    |
| ---------------- | --------------------------- | ---------------------------- | ---------------- | ------------ | ---------- | ---------------- | ---------------- | ------------------------------ |
| catppuccin       | `#cdd6f4`                   | `#89b4fa`                    | `#9197b1`        | `#1e1e2e`    | `#89b4fa`  | `#45475a`        | `#89b4fa`        | tpl: btop.theme.tpl            |
| catppuccin-latte | `#4c4f69`                   | `#1e66f5`                    | `#838699`        | `#eff1f5`    | `#1e66f5`  | `#ccd0da`        | `#1e66f5`        | tpl: btop.theme.tpl            |
| ethereal         | `#ffcead`                   | `#7d82d9`                    | `#aa8c7c`        | `#060B1E`    | `#7d82d9`  | `#252e56`        | `#7d82d9`        | tpl: btop.theme.tpl            |
| everforest       | `#d3c6aa`                   | `#7fbbb3`                    | `#9b9584`        | `#2d353b`    | `#7fbbb3`  | `#3d484d`        | `#7fbbb3`        | tpl: btop.theme.tpl            |
| flexoki-light    | `#100F0F`                   | `#205EA6`                    | `#61605c`        | `#FFFCF0`    | `#205EA6`  | `#CECDC3`        | `#205EA6`        | tpl: btop.theme.tpl            |
| gruvbox          | `#d4be98`                   | `#7daea3`                    | `#9a8b72`        | `#282828`    | `#7daea3`  | `#504945`        | `#7daea3`        | tpl: btop.theme.tpl            |
| hackerman        | `rgba(26a269ee)` (gradient) | `rgba(26a269ee)` (gradient)  | `#96a7b0`        | `#0B0C16`    | `#82FB9C`  | `#1f253a`        | `#82FB9C`        | tpl: btop.theme.tpl            |
| jade-horse       | `#dfede5`                   | `#8bcbb1`                    | `#9aa9a2`        | `#142620`    | `#8bcbb1`  | `#2b5147`        | `#8bcbb1`        | tpl: btop.theme.tpl            |
| kanagawa         | `#dcd7ba`                   | `#dcd7ba`                    | `#9c9888`        | `#1f1f28`    | `#dcd7ba`  | `#363646`        | `#dcd7ba`        | tpl: btop.theme.tpl            |
| last-horizon     | `rgba(8a8588ee)` (gradient) | `rgba(8a8588ee)` (gradient)  | `#a9aaaa`        | `#0c0b0c`    | `#c4d8e2`  | `#e2dddc`        | `#0c0b0c`        | themes/last-horizon/btop.theme |
| lumon            | `#d6e2ee`                   | `#8bc9eb`                    | `#95a1ac`        | —            | `#b5deef`  | `#355066`        | `#c7d2de`        | themes/lumon/btop.theme        |
| lupine           | `#212121`                   | `#3264eb`                    | `#6b6b6b`        | `#fafafa`    | `#3264eb`  | `#d0d0d0`        | `#3264eb`        | tpl: btop.theme.tpl            |
| matte-black      | `#bebebe`                   | `#e68e0d`                    | `#848484`        | `#121212`    | `#e68e0d`  | `#2a2a2a`        | `#e68e0d`        | tpl: btop.theme.tpl            |
| miasma           | `#c2c2b0`                   | `#78824b`                    | `#8c8c80`        | `#222222`    | `#78824b`  | `#383838`        | `#78824b`        | tpl: btop.theme.tpl            |
| nord             | `#d8dee9`                   | `#81a1c1`                    | `#9ea4b0`        | `#2e3440`    | `#81a1c1`  | `#434c5e`        | `#81a1c1`        | tpl: btop.theme.tpl            |
| retro-82         | `#f6dcac`                   | `#faa968`                    | `#a49981`        | —            | `#8cbfb8`  | `#134e5a`        | `#f6dcac`        | themes/retro-82/btop.theme     |
| ristretto        | `#e6d9db`                   | `#f38d70`                    | `#a79c9d`        | `#2c2525`    | `#f38d70`  | `#403e41`        | `#f38d70`        | tpl: btop.theme.tpl            |
| rose-pine        | `#575279`                   | `#56949f`                    | `#8e89a0`        | `#faf4ed`    | `#56949f`  | `#dfdad9`        | `#56949f`        | tpl: btop.theme.tpl            |
| solitude         | `rgba(798186ee)` (gradient) | `rgba(798186ee)` (gradient)  | `#8b8d8e`        | `#101315`    | `#565d60`  | `#a3a6a7`        | `#101315`        | themes/solitude/btop.theme     |
| starship         | `#f5f5f7`                   | `#ff9f0a`                    | `#ababad`        | `#1c1c1e`    | `#ff9f0a`  | `#3a3a3c`        | `#ff9f0a`        | tpl: btop.theme.tpl            |
| tokyo-night      | `#a9b1d6`                   | `#7aa2f7`                    | `#a9b1d6`        | `#1a1b26`    | `#7aa2f7`  | `#292e42`        | `#7aa2f7`        | tpl: btop.theme.tpl            |
| vantablack       | `#ffffff`                   | `#8d8d8d`                    | `#a8a8a8`        | `#000000`    | `#8d8d8d`  | `#1a1a1a`        | `#8d8d8d`        | tpl: btop.theme.tpl            |
| white            | `#000000`                   | `#6e6e6e`                    | `#575757`        | `#ffffff`    | `#6e6e6e`  | `#c0c0c0`        | `#6e6e6e`        | tpl: btop.theme.tpl            |

### Files and backgrounds per theme

| slug             | files (excluding backgrounds/)                                                                                                           | backgrounds | intro videos | first background (default pick) |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ | ------------------------------- |
| catppuccin       | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 4           | 3            | 1-totoro.webp                   |
| catppuccin-latte | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 2           | 1            | 1-color-fade.webp               |
| ethereal         | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 4           | 1            | 1-cosmic.webp                   |
| everforest       | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 2           | 1            | 1-tree-tops.webp                |
| flexoki-light    | chromium.theme, colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                           | 2           | 1            | 1-orb.webp                      |
| gruvbox          | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 6           | 0            | 1-the-backwater.jpg             |
| hackerman        | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 3           | 1            | 1-synth-scape.jpg               |
| jade-horse       | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 4           | 0            | 01-mountain-horses.webp         |
| kanagawa         | colors.toml, hyprland.lua, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                             | 2           | 0            | 1-kanagawa.jpg                  |
| last-horizon     | btop.theme, chromium.theme, colors.toml, hyprland.lua, icons.theme, preview-unlock.png, preview.png, unlock.png, vscode.json             | 4           | 1            | 1-eyes-wide.webp                |
| lumon            | btop.theme, chromium.theme, colors.toml, hyprland.lua, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json | 3           | 2            | 01-united-in-severance.webp     |
| lupine           | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 6           | 0            | 01-cherry-blossom-bokeh.webp    |
| matte-black      | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 4           | 1            | 0-ship-at-sea.jpg               |
| miasma           | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 3           | 1            | 01-nature-of-fear.webp          |
| nord             | colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                                           | 4           | 1            | 0-black-moon.jpg                |
| retro-82         | btop.theme, chromium.theme, colors.toml, hyprland.lua, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json | 9           | 1            | 1-in-the-groove.webp            |
| ristretto        | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 5           | 1            | 0-launch.webp                   |
| rose-pine        | chromium.theme, colors.toml, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                           | 4           | 1            | 1-funky-shapes.webp             |
| solitude         | btop.theme, colors.toml, hyprland.lua, icons.theme, neovim.lua, preview-unlock.png, preview.png, unlock.png, vscode.json                 | 5           | 0            | 1-on-pole.webp                  |
| starship         | colors.toml, preview.png                                                                                                                 | 4           | 0            | 1-starbase.webp                 |
| tokyo-night      | colors.toml, icons.theme, keyboard.rgb, neovim.lua, preview-unlock.png, preview.png, shell.lock.toml, unlock.png, vscode.json            | 9           | 0            | 0-liftoff.webp                  |
| vantablack       | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 5           | 1            | 0-dot-hands.webp                |
| white            | colors.toml, icons.theme, preview-unlock.png, preview.png, unlock.png                                                                    | 4           | 1            | 1-white.webp                    |

Theme-specific Hyprland extras: Solitude sets `rounding = 6, rounding_power = 3`. Lumon enables shadows (range 6, render_power 4, `rgb(6fb8e3)`) with inactive border `rgba(30486099)`. Kanagawa raises terminal opacity to `0.99 0.985` (`themes/*/hyprland.lua`).

---

## 4. Hyprland look and feel

Defaults are in `default/hypr/looknfeel.lua`. Users override them in `~/.config/hypr/looknfeel.lua`, which ships with only commented examples (`config/hypr/looknfeel.lua:1-55`).

| Setting                                | Value                                                                                                                                                    | Source                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `gaps_in` / `gaps_out` / `border_size` | **5 / 10 / 2**                                                                                                                                           | `default/hypr/looknfeel.lua:8-10`                                                            |
| `rounding`                             | **0**                                                                                                                                                    | `:25`                                                                                        |
| Built-in active border                 | gradient `rgba(33ccffee)` → `rgba(00ff99ee)` 45°                                                                                                         | `:3`                                                                                         |
| Built-in inactive border               | `rgba(595959aa)`                                                                                                                                         | `:4`                                                                                         |
| Effective active border                | overridden by the theme, e.g. Tokyo Night = solid `#7aa2f7` (accent)                                                                                     | `default/hypr/omarchy.lua:31-32`, `default/themed/hyprland.lua.tpl:1`                        |
| Shadow                                 | disabled                                                                                                                                                 | `:27-29`                                                                                     |
| Blur                                   | disabled (the Glassy mode enables size 4, passes 2, brightness 0.75, vibrancy 0.35, noise 0.01, popups and special on)                                   | `:31-33`, `default/hypr/glass.lua:4-20`                                                      |
| Dim                                    | `dim_inactive` off; `dim_special = 0.6` (behind the Quake console and scratchpad)                                                                        | `default/hypr/qconsole.lua:34-38`                                                            |
| Opacity                                | `0.985` active / `0.96` inactive for terminals, omawrite, 1Password, Nautilus, LocalSend                                                                 | `default/hypr/helpers.lua:327-329`, `default/hypr/windows.lua:22-26`                         |
| Layout                                 | `dwindle` (`preserve_split`, `force_split = 2`); `scrolling.column_width = 0.49`; `master.new_status = master`                                           | `:21,94-106`                                                                                 |
| Per-workspace layouts                  | Tiling (dwindle), Scrolling, Floating; Super+L cycles, the bar's active workspace glyph shows the mode, and the dock appears only on floating workspaces | `default/hypr/bindings/tiling.lua:14-15`, `shell/plugins/bar/widgets/Workspaces.qml:138-142` |
| Resize                                 | `resize_on_border`, `extend_border_grab_area = 8`, `hover_icon_on_border`                                                                                | `:17-19`                                                                                     |
| Misc                                   | no logo/splash, `background_color rgb(000000)`, `focus_on_activate`, `bell_sound none`                                                                   | `:108-122`                                                                                   |
| Cursor                                 | `hide_on_key_press`, `warp_on_change_workspace = 1`, size 24, no custom theme ("default")                                                                | `:124-127`, `default/hypr/envs.lua:8-9`, `default/hypr/startup-cursor.lua:5-18`              |
| Monitors                               | `preferred`, `auto` position, `auto` scale, `GDK_SCALE=2`                                                                                                | `default/hypr/monitors.lua:5,11`                                                             |
| Workspaces                             | 10 per monitor, numbered in blocks (laptop 1–10, next screen 11–20)                                                                                      | `default/hypr/monitor-workspaces.lua:1-30`                                                   |

**Groupbar:** font `monospace` 12, active weight `ultraheavy`, height 22, indicator 1px, gap 5, text `rgb(ffffff)` / `rgba(ffffff90)`, fill `rgba(00000040)` / `rgba(00000020)`, gradients on (`default/hypr/looknfeel.lua:42-61`).

### Animations

Speeds are in tenths of a second. The comment says they are "the animations from before #16889 with every duration cut by a fifth" (`default/hypr/looknfeel.lua:76-77`).

| leaf                | speed (×100 ms) | bezier       | style        | enabled |
| ------------------- | --------------- | ------------ | ------------ | ------- |
| global              | 8               | default      | —            | yes     |
| border              | 4.31            | easeOutQuint | —            | yes     |
| windows             | 3.03            | easeOutQuint | —            | yes     |
| windowsIn           | 3.28            | easeOutQuint | popin 87%    | yes     |
| windowsOut          | 1.19            | linear       | popin 87%    | yes     |
| fadeIn              | 1.38            | almostLinear | —            | yes     |
| fadeOut             | 1.17            | almostLinear | —            | yes     |
| fade                | 2.42            | quick        | —            | yes     |
| fadeSwitch          | —               | —            | —            | no      |
| layers              | 3.05            | easeOutQuint | —            | yes     |
| layersIn            | 3.2             | easeOutQuint | fade         | yes     |
| layersOut           | 1.2             | linear       | fade         | yes     |
| fadeLayersIn        | 1.43            | almostLinear | —            | yes     |
| fadeLayersOut       | 1.11            | almostLinear | —            | yes     |
| workspaces          | —               | —            | —            | no      |
| specialWorkspaceIn  | 3               | easeOutQuint | slide top    | yes     |
| specialWorkspaceOut | 2               | easeOutQuint | slide bottom | yes     |

Beziers (`default/hypr/looknfeel.lua:70-74`). `easeInOutCubic` is defined but unused:

| name           | points              |
| -------------- | ------------------- |
| easeOutQuint   | 0.23, 1, 0.32, 1    |
| easeInOutCubic | 0.65, 0.05, 0.36, 1 |
| linear         | 0, 0, 1, 1          |
| almostLinear   | 0.5, 0.5, 0.75, 1.0 |
| quick          | 0.15, 0, 0.1, 1     |

The shell's own motion uses `Style.easeOut = [0.23, 1.0, 0.32, 1.0]`, the same curve as easeOutQuint. It is disabled whenever Hyprland animations are off (`shell/Commons/Style.qml:360-371`).

### Input

`kb_layout` comes from the vconsole layout (default `us`; non-Latin layouts get `us` prepended plus `grp:alts_toggle`). Other values: `kb_options = omarchy:shift_caps_compose` (Shift+Caps is Compose), `follow_mouse = 1`, `sensitivity = 0`, `repeat_rate = 40`, `repeat_delay = 250`, numlock on. Touchpad: `natural_scroll = false`, `clickfinger_behavior = true`, `scroll_factor = 0.4`. Terminal touchpad scroll factors are Alacritty/kitty 1.5, foot 2.0 and Ghostty 0.2 (`default/hypr/input.lua:12-104`).

### Window rules worth knowing

- Windows tagged `floating-window` float centred at **875×600**. That covers btop, the Omarchy terminals, foot, NautilusPreviewer, Evince, About, `TUI.float`, imv, mpv and file dialogs (`default/hypr/apps/system.lua:2-20`).
- About: 920×480. Popped windows (Super+O): rounding 8 (`:26-33`).
- Picture-in-picture and Google Meet: float, pin, 600×338, no border, 40px from the right edge (`default/hypr/apps/pip.lua`).
- Chromium-based browsers are forced tiled (`default/hypr/apps/browser.lua:4`).
- Shell layer surfaces (bar, menu, OSD, dock, image picker…) have Hyprland animations disabled because the shell animates them itself (`default/hypr/apps/omarchy-shell.lua`).
- Quake console (`special:qconsole`, Super+grave or a three-finger swipe up) drops over the top 50% of the screen, boxed at 2:1 when it holds one window. It is seeded with the default AI agent and slides in over 300 ms and out over 200 ms (`default/hypr/qconsole.lua:6-29,199-200`).

### Toggles (flags copied into `~/.local/state/omarchy/toggles/hypr/`)

`window-no-gaps` (gaps 0, border 0, rounding 0; Super+Shift+Backspace), `corners-rounded` (rounding 6, power 3), `corners-sharp`, `window-glassy`, `window-opaque`, `bar-glassy`, `no-animations` (applied automatically in VMs), `single-window-aspect-ratio` (1:1; Super+Ctrl+Backspace) (`default/hypr/toggles/*.lua`).

---

## 5. Keybindings

257 bindings, written with `o.bind("MODS + KEY", "Description", action)`. The helper wraps `hl.bind` and stores the description so `omarchy menu keybindings` can list it (`default/hypr/helpers.lua:138-152`). Files load in this order: media, clipboard, input-method, jis, tiling, utilities, dictation, applications (`default/hypr/omarchy.lua:10-19`). Setting `omarchy_default_bindings = false` drops every default. `omarchy_preinstalled_bindings = false` drops only the app and web-app ones (`config/hypr/hyprland.lua:6-11`).

Key-code notes: `code:10`–`code:19` are the number row 1–0, `code:20`/`code:21` are `-`/`=`, `code:34`/`code:35` are `[`/`]`, and `code:201` (with Super+Shift) is the Copilot key. Menu, panel, volume, brightness and media binds listed in `default/omarchy/shortcuts` dispatch a Hyprland _global shortcut_ (`omarchy:menu.root` etc.) straight to the running shell. No process spawns per keypress (`default/hypr/helpers.lua:79-88`, `default/omarchy/shortcuts:1-41`).

**The essentials, as shipped:**

| Chord                                          | Does                                                           | Line                    |
| ---------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| Super + Space                                  | **Omarchy menu** (root; apps are its first row and searchable) | `utilities.lua:1`       |
| Super + Alt + Space                            | **Apps** (dock app grid)                                       | `utilities.lua:2`       |
| Super + Escape                                 | System menu (lock, suspend, reboot, shutdown…)                 | `utilities.lua:8`       |
| Super + K                                      | Keybindings viewer                                             | `utilities.lua:10`      |
| Super + Return                                 | Terminal (foot)                                                | `applications.lua:2`    |
| Super + W / Super + Q                          | Close window                                                   | `tiling.lua:1-2`        |
| Super + 1…0 / + Shift / + Shift + Alt          | Workspace / move window / move silently (per monitor)          | `tiling.lua:24-29`      |
| Super + L                                      | **Cycle workspace layout** (not lock)                          | `tiling.lua:14`         |
| Super + Ctrl + L                               | Lock                                                           | `utilities.lua:143`     |
| Super + Ctrl + T, Super + Shift + Ctrl + Space | Theme picker                                                   | `utilities.lua:16-17`   |
| Super + Ctrl + Space, Super + Ctrl + W         | Background picker                                              | `utilities.lua:14-15`   |
| Super + Shift + Space                          | Toggle bar                                                     | `utilities.lua:13`      |
| Print / Alt + Print / Super + Print            | Screenshot / screen recording / colour picker                  | `utilities.lua:40-45`   |
| Super + Ctrl + A/B/N/D/P                       | Audio / Bluetooth / Network / Display / Power panels           | `utilities.lua:113-119` |

### Full list, grouped as the source groups it (by file)

#### Tiling and window management — `default/hypr/bindings/tiling.lua`

| chord                        | description                          | action                                                                               | notes | line               |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ | ----- | ------------------ |
| SUPER + W                    | Close window                         | `hyprland: hl.dsp.window.close()`                                                    |       | tiling.lua:1       |
| SUPER + Q                    | Close window                         | `hyprland: hl.dsp.window.close()`                                                    |       | tiling.lua:2       |
| CTRL + ALT + DELETE          | Close all windows                    | `omarchy-hyprland-window-close-all`                                                  |       | tiling.lua:3       |
| SUPER + J                    | Toggle window split                  | `hyprland: hl.dsp.layout("togglesplit")`                                             |       | tiling.lua:5       |
| SUPER + P                    | Pseudo window                        | `hyprland: hl.dsp.window.pseudo()`                                                   |       | tiling.lua:6       |
| SUPER + T                    | Toggle window floating/tiling        | `hyprland: hl.dsp.window.float({ action = "toggle" })`                               |       | tiling.lua:7       |
| SUPER + F                    | Full screen                          | `hyprland: hl.dsp.window.fullscreen({ mode = "fullscreen" })`                        |       | tiling.lua:8       |
| SUPER + CTRL + F             | Tiled full screen                    | `omarchy-hyprland-window-tiled-fullscreen-toggle`                                    |       | tiling.lua:9       |
| SUPER + ALT + F              | Full width                           | `hyprland: hl.dsp.window.fullscreen({ mode = "maximized" })`                         |       | tiling.lua:10      |
| SUPER + O                    | Pop window out (float & pin)         | `omarchy-hyprland-window-pop`                                                        |       | tiling.lua:11      |
| SUPER + ALT + HOME           | Save window width                    | `omarchy-hyprland-window-width save`                                                 |       | tiling.lua:12      |
| SUPER + HOME                 | Restore window width                 | `omarchy-hyprland-window-width restore`                                              |       | tiling.lua:13      |
| SUPER + L                    | Cycle workspace layout               | `omarchy-hyprland-workspace-layout-toggle`                                           |       | tiling.lua:14      |
| SUPER + ALT + L              | Cycle workspace layout back          | `omarchy-hyprland-workspace-layout-toggle back`                                      |       | tiling.lua:15      |
| XF86Display                  | Cycle workspace layout               | `omarchy-hyprland-workspace-layout-toggle`                                           |       | tiling.lua:16      |
| SUPER + LEFT                 | Focus on left window                 | `hyprland: hl.dsp.focus({ direction = "l" })`                                        |       | tiling.lua:18      |
| SUPER + RIGHT                | Focus on right window                | `hyprland: hl.dsp.focus({ direction = "r" })`                                        |       | tiling.lua:19      |
| SUPER + UP                   | Focus on above window                | `hyprland: hl.dsp.focus({ direction = "u" })`                                        |       | tiling.lua:20      |
| SUPER + DOWN                 | Focus on below window                | `hyprland: hl.dsp.focus({ direction = "d" })`                                        |       | tiling.lua:21      |
| SUPER + S                    | Toggle scratchpad                    | `hyprland: hl.dsp.workspace.toggle_special("scratchpad")`                            |       | tiling.lua:31      |
| SUPER + ALT + S              | Move window to scratchpad            | `hyprland: hl.dsp.window.move({ workspace = "special:scratchpad", follow = false })` |       | tiling.lua:32      |
| SUPER + GRAVE                | Toggle Quake console                 | `hyprland: hl.dsp.workspace.toggle_special("qconsole")`                              |       | tiling.lua:33      |
| SUPER + M                    | Minimize window to the dock          | `omarchy-hyprland-window-minimize`                                                   |       | tiling.lua:34      |
| SUPER + SHIFT + GRAVE        | Move window to Quake console         | `hyprland: hl.dsp.window.move({ workspace = "special:qconsole", follow = false })`   |       | tiling.lua:35      |
| SUPER + TAB                  | Next workspace                       | `hyprland: hl.dsp.focus({ workspace = "m+1" })`                                      |       | tiling.lua:37      |
| SUPER + SHIFT + TAB          | Previous workspace                   | `hyprland: hl.dsp.focus({ workspace = "m-1" })`                                      |       | tiling.lua:38      |
| SUPER + CTRL + TAB           | Former workspace                     | `hyprland: hl.dsp.focus({ workspace = "previous_per_monitor" })`                     |       | tiling.lua:39      |
| SUPER + SHIFT + ALT + LEFT   | Move workspace to left monitor       | `hyprland: o.workspaces.move_to_monitor("l")`                                        |       | tiling.lua:41      |
| SUPER + SHIFT + ALT + RIGHT  | Move workspace to right monitor      | `hyprland: o.workspaces.move_to_monitor("r")`                                        |       | tiling.lua:42      |
| SUPER + SHIFT + ALT + UP     | Move workspace to up monitor         | `hyprland: o.workspaces.move_to_monitor("u")`                                        |       | tiling.lua:43      |
| SUPER + SHIFT + ALT + DOWN   | Move workspace to down monitor       | `hyprland: o.workspaces.move_to_monitor("d")`                                        |       | tiling.lua:44      |
| SUPER + SHIFT + CTRL + LEFT  | Move window to left monitor          | `hyprland: o.workspaces.move_window_to_monitor("l")`                                 |       | tiling.lua:46      |
| SUPER + SHIFT + CTRL + RIGHT | Move window to right monitor         | `hyprland: o.workspaces.move_window_to_monitor("r")`                                 |       | tiling.lua:47      |
| SUPER + SHIFT + CTRL + UP    | Move window to up monitor            | `hyprland: o.workspaces.move_window_to_monitor("u")`                                 |       | tiling.lua:48      |
| SUPER + SHIFT + CTRL + DOWN  | Move window to down monitor          | `hyprland: o.workspaces.move_window_to_monitor("d")`                                 |       | tiling.lua:49      |
| SUPER + SHIFT + LEFT         | Swap window to the left              | `hyprland: hl.dsp.window.swap({ direction = "l" })`                                  |       | tiling.lua:51      |
| SUPER + SHIFT + RIGHT        | Swap window to the right             | `hyprland: hl.dsp.window.swap({ direction = "r" })`                                  |       | tiling.lua:52      |
| SUPER + SHIFT + UP           | Swap window up                       | `hyprland: hl.dsp.window.swap({ direction = "u" })`                                  |       | tiling.lua:53      |
| SUPER + SHIFT + DOWN         | Swap window down                     | `hyprland: hl.dsp.window.swap({ direction = "d" })`                                  |       | tiling.lua:54      |
| ALT + SHIFT + TAB            | Reveal active window on top          | `hyprland: hl.dsp.window.alter_zorder({ mode = "bottom" })`                          |       | tiling.lua:58      |
| ALT + TAB                    | Focus on next window                 | `hyprland: hl.dsp.window.cycle_next()`                                               |       | tiling.lua:59      |
| ALT + SHIFT + TAB            | Focus on previous window             | `hyprland: hl.dsp.window.cycle_next({ next = false })`                               |       | tiling.lua:60      |
| ALT + TAB                    | Reveal active window on top          | `hyprland: hl.dsp.window.bring_to_top()`                                             |       | tiling.lua:61      |
| CTRL + ALT + TAB             | Focus on next monitor                | `hyprland: hl.dsp.focus({ monitor = "+1" })`                                         |       | tiling.lua:63      |
| CTRL + ALT + SHIFT + TAB     | Focus on previous monitor            | `hyprland: hl.dsp.focus({ monitor = "-1" })`                                         |       | tiling.lua:64      |
| SUPER + MINUS                | Expand window left                   | `hyprland: hl.dsp.window.resize({ x = -100, y = 0, relative = true })`               |       | tiling.lua:66      |
| SUPER + EQUAL                | Shrink window left                   | `hyprland: hl.dsp.window.resize({ x = 100, y = 0, relative = true })`                |       | tiling.lua:67      |
| SUPER + SHIFT + MINUS        | Shrink window up                     | `hyprland: hl.dsp.window.resize({ x = 0, y = -100, relative = true })`               |       | tiling.lua:68      |
| SUPER + SHIFT + EQUAL        | Expand window down                   | `hyprland: hl.dsp.window.resize({ x = 0, y = 100, relative = true })`                |       | tiling.lua:69      |
| SUPER + ALT + MINUS          | Expand window left a little          | `hyprland: hl.dsp.window.resize({ x = -25, y = 0, relative = true })`                |       | tiling.lua:71      |
| SUPER + ALT + EQUAL          | Shrink window left a little          | `hyprland: hl.dsp.window.resize({ x = 25, y = 0, relative = true })`                 |       | tiling.lua:72      |
| SUPER + SHIFT + ALT + MINUS  | Shrink window up a little            | `hyprland: hl.dsp.window.resize({ x = 0, y = -25, relative = true })`                |       | tiling.lua:73      |
| SUPER + SHIFT + ALT + EQUAL  | Expand window down a little          | `hyprland: hl.dsp.window.resize({ x = 0, y = 25, relative = true })`                 |       | tiling.lua:74      |
| SUPER + CTRL + MINUS         | Expand window left a lot             | `hyprland: hl.dsp.window.resize({ x = -300, y = 0, relative = true })`               |       | tiling.lua:76      |
| SUPER + CTRL + EQUAL         | Shrink window left a lot             | `hyprland: hl.dsp.window.resize({ x = 300, y = 0, relative = true })`                |       | tiling.lua:77      |
| SUPER + CTRL + SHIFT + MINUS | Shrink window up a lot               | `hyprland: hl.dsp.window.resize({ x = 0, y = -300, relative = true })`               |       | tiling.lua:78      |
| SUPER + CTRL + SHIFT + EQUAL | Expand window down a lot             | `hyprland: hl.dsp.window.resize({ x = 0, y = 300, relative = true })`                |       | tiling.lua:79      |
| SUPER + SCROLL_DOWN          | Scroll active workspace forward      | `hyprland: hl.dsp.focus({ workspace = "m+1" })`                                      |       | tiling.lua:81      |
| SUPER + SCROLL_UP            | Scroll active workspace backward     | `hyprland: hl.dsp.focus({ workspace = "m-1" })`                                      |       | tiling.lua:82      |
| SUPER + LMB                  | Move window                          | `hyprland: hl.dsp.window.drag()`                                                     |       | tiling.lua:84      |
| SUPER + RMB                  | Resize window                        | `hyprland: hl.dsp.window.resize()`                                                   |       | tiling.lua:85      |
| SUPER + G                    | Toggle window grouping               | `hyprland: hl.dsp.group.toggle()`                                                    |       | tiling.lua:87      |
| SUPER + ALT + G              | Move active window out of group      | `hyprland: hl.dsp.window.move({ out_of_group = true })`                              |       | tiling.lua:88      |
| SUPER + ALT + LEFT           | Move window to group on left         | `hyprland: hl.dsp.window.move({ into_group = "l" })`                                 |       | tiling.lua:90      |
| SUPER + ALT + RIGHT          | Move window to group on right        | `hyprland: hl.dsp.window.move({ into_group = "r" })`                                 |       | tiling.lua:91      |
| SUPER + ALT + UP             | Move window to group on top          | `hyprland: hl.dsp.window.move({ into_group = "u" })`                                 |       | tiling.lua:92      |
| SUPER + ALT + DOWN           | Move window to group on bottom       | `hyprland: hl.dsp.window.move({ into_group = "d" })`                                 |       | tiling.lua:93      |
| SUPER + ALT + TAB            | Next window in group                 | `hyprland: hl.dsp.group.next()`                                                      |       | tiling.lua:95      |
| SUPER + ALT + SHIFT + TAB    | Previous window in group             | `hyprland: hl.dsp.group.prev()`                                                      |       | tiling.lua:96      |
| SUPER + CTRL + LEFT          | Move grouped window focus left       | `hyprland: hl.dsp.group.prev()`                                                      |       | tiling.lua:98      |
| SUPER + CTRL + RIGHT         | Move grouped window focus right      | `hyprland: hl.dsp.group.next()`                                                      |       | tiling.lua:99      |
| SUPER + ALT + SCROLL_DOWN    | Next window in group                 | `hyprland: hl.dsp.group.next()`                                                      |       | tiling.lua:101     |
| SUPER + ALT + SCROLL_UP      | Previous window in group             | `hyprland: hl.dsp.group.prev()`                                                      |       | tiling.lua:102     |
| SUPER + SLASH                | Monitor scaling up                   | `omarchy-hyprland-monitor-scaling up`                                                |       | tiling.lua:108     |
| SUPER + ALT + SLASH          | Monitor scaling down                 | `omarchy-hyprland-monitor-scaling down`                                              |       | tiling.lua:109     |
| SUPER + 1                    | Switch to workspace 1                | `hyprland: o.workspaces.focus(1)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 1            | Move window to workspace 1           | `hyprland: o.workspaces.move_window(1)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 1      | Move window silently to workspace 1  | `hyprland: o.workspaces.move_window(1, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 2                    | Switch to workspace 2                | `hyprland: o.workspaces.focus(2)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 2            | Move window to workspace 2           | `hyprland: o.workspaces.move_window(2)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 2      | Move window silently to workspace 2  | `hyprland: o.workspaces.move_window(2, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 3                    | Switch to workspace 3                | `hyprland: o.workspaces.focus(3)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 3            | Move window to workspace 3           | `hyprland: o.workspaces.move_window(3)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 3      | Move window silently to workspace 3  | `hyprland: o.workspaces.move_window(3, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 4                    | Switch to workspace 4                | `hyprland: o.workspaces.focus(4)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 4            | Move window to workspace 4           | `hyprland: o.workspaces.move_window(4)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 4      | Move window silently to workspace 4  | `hyprland: o.workspaces.move_window(4, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 5                    | Switch to workspace 5                | `hyprland: o.workspaces.focus(5)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 5            | Move window to workspace 5           | `hyprland: o.workspaces.move_window(5)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 5      | Move window silently to workspace 5  | `hyprland: o.workspaces.move_window(5, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 6                    | Switch to workspace 6                | `hyprland: o.workspaces.focus(6)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 6            | Move window to workspace 6           | `hyprland: o.workspaces.move_window(6)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 6      | Move window silently to workspace 6  | `hyprland: o.workspaces.move_window(6, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 7                    | Switch to workspace 7                | `hyprland: o.workspaces.focus(7)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 7            | Move window to workspace 7           | `hyprland: o.workspaces.move_window(7)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 7      | Move window silently to workspace 7  | `hyprland: o.workspaces.move_window(7, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 8                    | Switch to workspace 8                | `hyprland: o.workspaces.focus(8)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 8            | Move window to workspace 8           | `hyprland: o.workspaces.move_window(8)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 8      | Move window silently to workspace 8  | `hyprland: o.workspaces.move_window(8, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 9                    | Switch to workspace 9                | `hyprland: o.workspaces.focus(9)`                                                    |       | tiling.lua:24-29   |
| SUPER + SHIFT + 9            | Move window to workspace 9           | `hyprland: o.workspaces.move_window(9)`                                              |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 9      | Move window silently to workspace 9  | `hyprland: o.workspaces.move_window(9, false)`                                       |       | tiling.lua:24-29   |
| SUPER + 0                    | Switch to workspace 10               | `hyprland: o.workspaces.focus(10)`                                                   |       | tiling.lua:24-29   |
| SUPER + SHIFT + 0            | Move window to workspace 10          | `hyprland: o.workspaces.move_window(10)`                                             |       | tiling.lua:24-29   |
| SUPER + SHIFT + ALT + 0      | Move window silently to workspace 10 | `hyprland: o.workspaces.move_window(10, false)`                                      |       | tiling.lua:24-29   |
| SUPER + ALT + 1              | Switch to group window 1             | `hyprland: hl.dsp.group.active({ index = 1 })`                                       |       | tiling.lua:104-106 |
| SUPER + ALT + 2              | Switch to group window 2             | `hyprland: hl.dsp.group.active({ index = 2 })`                                       |       | tiling.lua:104-106 |
| SUPER + ALT + 3              | Switch to group window 3             | `hyprland: hl.dsp.group.active({ index = 3 })`                                       |       | tiling.lua:104-106 |
| SUPER + ALT + 4              | Switch to group window 4             | `hyprland: hl.dsp.group.active({ index = 4 })`                                       |       | tiling.lua:104-106 |
| SUPER + ALT + 5              | Switch to group window 5             | `hyprland: hl.dsp.group.active({ index = 5 })`                                       |       | tiling.lua:104-106 |

#### Utilities, menus, capture, panels — `default/hypr/bindings/utilities.lua`

| chord                                 | description                                 | action                                                                                                   | notes                | line                  |
| ------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------- | --------------------- |
| SUPER + SPACE                         | Omarchy menu                                | `omarchy-menu toggle root (dispatched as Hyprland global omarchy:menu.root)`                             |                      | utilities.lua:1       |
| SUPER + ALT + SPACE                   | Apps                                        | `omarchy-shell omarchy.dock apps`                                                                        |                      | utilities.lua:2       |
| SUPER + CTRL + E                      | Emojis                                      | `omarchy-shell shell toggle omarchy.emojis (global omarchy:panel.omarchy.emojis)`                        |                      | utilities.lua:3       |
| SUPER + CTRL + C                      | Capture menu                                | `omarchy-menu toggle capture (dispatched as Hyprland global omarchy:menu.capture)`                       |                      | utilities.lua:4       |
| SUPER + CTRL + O                      | Toggle menu                                 | `omarchy-menu toggle toggle (dispatched as Hyprland global omarchy:menu.toggle)`                         |                      | utilities.lua:5       |
| SUPER + CTRL + H                      | Hardware menu                               | `omarchy-menu toggle hardware (dispatched as Hyprland global omarchy:menu.hardware)`                     |                      | utilities.lua:6       |
| SUPER + SHIFT + F23 (Copilot key)     | Omarchy menu                                | `omarchy-menu toggle root (dispatched as Hyprland global omarchy:menu.root)`                             |                      | utilities.lua:7       |
| SUPER + ESCAPE                        | System menu                                 | `omarchy-menu toggle system (dispatched as Hyprland global omarchy:menu.system)`                         |                      | utilities.lua:8       |
| XF86PowerOff                          | Power menu                                  | `omarchy-menu toggle system (dispatched as Hyprland global omarchy:menu.system)`                         | works on lock screen | utilities.lua:9       |
| SUPER + K                             | Keybindings                                 | `omarchy-menu-keybindings`                                                                               |                      | utilities.lua:10      |
| SUPER + ALT + K                       | Tmux keybindings                            | `omarchy-menu-tmux-keybindings`                                                                          |                      | utilities.lua:11      |
| SUPER + CTRL + K                      | Herdr keybindings                           | `omarchy-menu-herdr-keybindings`                                                                         |                      | utilities.lua:12      |
| SUPER + SHIFT + SPACE                 | Toggle top bar                              | `omarchy-toggle-bar`                                                                                     |                      | utilities.lua:13      |
| SUPER + CTRL + SPACE                  | Background switcher                         | `omarchy-menu toggle background (dispatched as Hyprland global omarchy:menu.background)`                 |                      | utilities.lua:14      |
| SUPER + CTRL + W                      | Background switcher                         | `omarchy-menu toggle background (dispatched as Hyprland global omarchy:menu.background)`                 |                      | utilities.lua:15      |
| SUPER + SHIFT + CTRL + SPACE          | Theme menu                                  | `omarchy-menu toggle theme (dispatched as Hyprland global omarchy:menu.theme)`                           |                      | utilities.lua:16      |
| SUPER + CTRL + T                      | Theme menu                                  | `omarchy-menu toggle theme (dispatched as Hyprland global omarchy:menu.theme)`                           |                      | utilities.lua:17      |
| SUPER + BACKSPACE                     | Toggle transparency on a window             | `omarchy-hyprland-window-transparency-toggle`                                                            |                      | utilities.lua:18      |
| SUPER + SHIFT + BACKSPACE             | Toggle window gaps                          | `omarchy-hyprland-window-gaps-toggle`                                                                    |                      | utilities.lua:19      |
| SUPER + CTRL + BACKSPACE              | Toggle single-window square aspect          | `omarchy-hyprland-window-single-square-aspect-toggle`                                                    |                      | utilities.lua:20      |
| SUPER + CTRL + ALT + F                | Toggle full screen desktop                  | `omarchy-toggle-fullscreen-desktop`                                                                      |                      | utilities.lua:21      |
| SUPER + COMMA                         | Dismiss, invoke, or focus last notification | `omarchy-shell notifications act (global omarchy:ipc.notifications.act)`                                 |                      | utilities.lua:24      |
| SUPER + SHIFT + COMMA                 | Dismiss all notifications                   | `omarchy-shell notifications dismissAll (global omarchy:ipc.notifications.dismissAll)`                   |                      | utilities.lua:25      |
| SUPER + CTRL + COMMA                  | Control notifications with the keyboard     | `omarchy-shell notifications keyboard (global omarchy:ipc.notifications.keyboard)`                       |                      | utilities.lua:26      |
| SUPER + ALT + COMMA                   | Dismiss last notification                   | `omarchy-shell notifications dismissOne (global omarchy:ipc.notifications.dismissOne)`                   |                      | utilities.lua:27      |
| SUPER + SHIFT + ALT + COMMA           | Open notification history                   | `omarchy-shell notifications showHistory (global omarchy:ipc.notifications.showHistory)`                 |                      | utilities.lua:28      |
| SUPER + CTRL + ALT + COMMA            | Toggle silencing notifications              | `omarchy-toggle-notification-silencing`                                                                  |                      | utilities.lua:29      |
| SUPER + CTRL + I                      | Toggle locking on idle                      | `omarchy-toggle-idle`                                                                                    |                      | utilities.lua:31      |
| SUPER + CTRL + DELETE                 | Toggle laptop display                       | `omarchy-hyprland-monitor-internal toggle`                                                               |                      | utilities.lua:32      |
| SUPER + CTRL + ALT + DELETE           | Toggle laptop display mirroring             | `omarchy-hyprland-monitor-internal-mirror toggle`                                                        |                      | utilities.lua:33      |
| switch:on:Lid Switch                  | (no description)                            | `omarchy-system-lid-close`                                                                               | works on lock screen | utilities.lua:34      |
| switch:off:Lid Switch                 | (no description)                            | `omarchy-hyprland-monitor-clamshell`                                                                     | works on lock screen | utilities.lua:35      |
| switch:on:Apple SMC power/lid events  | (no description)                            | `omarchy-system-lid-close`                                                                               | works on lock screen | utilities.lua:37      |
| switch:off:Apple SMC power/lid events | (no description)                            | `omarchy-hyprland-monitor-clamshell`                                                                     | works on lock screen | utilities.lua:38      |
| PRINT                                 | Screenshot                                  | `omarchy-capture-screenshot`                                                                             |                      | utilities.lua:40      |
| SUPER + CTRL + ALT + C                | Screenshot                                  | `omarchy-capture-screenshot`                                                                             |                      | utilities.lua:41      |
| ALT + PRINT                           | Screenrecording                             | `omarchy-capture-screenrecording --stop-recording \|\| omarchy-menu toggle trigger.capture.screenrecord` |                      | utilities.lua:42      |
| SUPER + ALT + BRACKETLEFT             | Make webcam overlay smaller                 | `omarchy-capture-webcam-resize smaller`                                                                  |                      | utilities.lua:43      |
| SUPER + ALT + BRACKETRIGHT            | Make webcam overlay larger                  | `omarchy-capture-webcam-resize larger`                                                                   |                      | utilities.lua:44      |
| SUPER + PRINT                         | Color picker                                | `pkill hyprpicker \|\| hyprpicker -a`                                                                    |                      | utilities.lua:45      |
| SUPER + CTRL + PRINT                  | Extract text (OCR) from screenshot          | `omarchy-capture-text`                                                                                   |                      | utilities.lua:46      |
| SUPER + CTRL + S                      | Share                                       | `omarchy-menu toggle share (dispatched as Hyprland global omarchy:menu.share)`                           |                      | utilities.lua:100     |
| SUPER + CTRL + PERIOD                 | Transcode                                   | `omarchy-transcode`                                                                                      |                      | utilities.lua:102     |
| SUPER + CTRL + R                      | Set reminder                                | `omarchy-menu toggle reminder-set (dispatched as Hyprland global omarchy:menu.reminder-set)`             |                      | utilities.lua:104     |
| SUPER + CTRL + ALT + R                | Show reminders                              | `omarchy-reminder show`                                                                                  |                      | utilities.lua:105     |
| SUPER + SHIFT + CTRL + R              | Clear reminders                             | `omarchy-reminder clear`                                                                                 |                      | utilities.lua:106     |
| SUPER + CTRL + ALT + T                | Show time                                   | `omarchy-notification-time`                                                                              |                      | utilities.lua:108     |
| SUPER + CTRL + ALT + B                | Show battery remaining                      | `omarchy-notification-battery`                                                                           |                      | utilities.lua:109     |
| SUPER + CTRL + ALT + W                | Toggle weather                              | `omarchy-notification-weather`                                                                           |                      | utilities.lua:110     |
| SUPER + SHIFT + CTRL + A              | Agent                                       | `omarchy-agent --pick`                                                                                   |                      | utilities.lua:112     |
| SUPER + CTRL + A                      | Audio                                       | `omarchy-shell shell toggle omarchy.audio (global omarchy:panel.omarchy.audio)`                          |                      | utilities.lua:113     |
| SUPER + CTRL + B                      | Bluetooth                                   | `omarchy-shell shell toggle omarchy.bluetooth (global omarchy:panel.omarchy.bluetooth)`                  |                      | utilities.lua:114     |
| SUPER + CTRL + D                      | Display                                     | `omarchy-shell shell toggle omarchy.monitor (global omarchy:panel.omarchy.monitor)`                      |                      | utilities.lua:115     |
| SUPER + CTRL + ALT + D                | Calendar                                    | `omarchy-shell shell toggle omarchy.clock (global omarchy:panel.omarchy.clock)`                          |                      | utilities.lua:116     |
| SUPER + CTRL + ALT + E                | World clock                                 | `omarchy-shell shell toggle omarchy.elsewhen (global omarchy:panel.omarchy.elsewhen)`                    |                      | utilities.lua:117     |
| SUPER + CTRL + N                      | Network                                     | `omarchy-shell shell toggle omarchy.network (global omarchy:panel.omarchy.network)`                      |                      | utilities.lua:118     |
| SUPER + CTRL + P                      | Power                                       | `omarchy-shell shell toggle omarchy.power (global omarchy:panel.omarchy.power)`                          |                      | utilities.lua:119     |
| SUPER + SHIFT + T                     | Activity                                    | `omarchy-launch-tui btop`                                                                                |                      | utilities.lua:120     |
| SUPER + CTRL + Z                      | Zoom in                                     | `lua: cursor.zoom_factor + 1`                                                                            |                      | utilities.lua:134     |
| SUPER + CTRL + ALT + Z                | Reset zoom                                  | `lua: cursor.zoom_factor = 1`                                                                            |                      | utilities.lua:139     |
| SUPER + CTRL + L                      | Lock system                                 | `omarchy-system-lock`                                                                                    |                      | utilities.lua:143     |
| SUPER + CTRL + 1                      | Bar panel 1                                 | `omarchy-shell -q shell togglePanelAt right 1`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 2                      | Bar panel 2                                 | `omarchy-shell -q shell togglePanelAt right 2`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 3                      | Bar panel 3                                 | `omarchy-shell -q shell togglePanelAt right 3`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 4                      | Bar panel 4                                 | `omarchy-shell -q shell togglePanelAt right 4`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 5                      | Bar panel 5                                 | `omarchy-shell -q shell togglePanelAt right 5`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 6                      | Bar panel 6                                 | `omarchy-shell -q shell togglePanelAt right 6`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 7                      | Bar panel 7                                 | `omarchy-shell -q shell togglePanelAt right 7`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 8                      | Bar panel 8                                 | `omarchy-shell -q shell togglePanelAt right 8`                                                           |                      | utilities.lua:126-132 |
| SUPER + CTRL + 9                      | Bar panel 9                                 | `omarchy-shell -q shell togglePanelAt right 9`                                                           |                      | utilities.lua:126-132 |

#### Applications — `default/hypr/bindings/applications.lua`

| chord                    | description        | action                                                                                      | notes                                                                 | line                |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------- |
| SUPER + RETURN           | Terminal           | `omarchy-launch-terminal [--pid=<focused pid>]`                                             |                                                                       | applications.lua:2  |
| SUPER + SHIFT + RETURN   | Browser            | `omarchy-launch-browser`                                                                    |                                                                       | applications.lua:3  |
| SUPER + SHIFT + F        | File manager       | `omarchy-launch-nautilus`                                                                   |                                                                       | applications.lua:4  |
| SUPER + ALT + SHIFT + F  | File manager (cwd) | `omarchy-launch-nautilus-cwd`                                                               |                                                                       | applications.lua:5  |
| SUPER + SHIFT + B        | Browser            | `omarchy-launch-browser`                                                                    |                                                                       | applications.lua:6  |
| SUPER + SHIFT + ALT + B  | Browser (private)  | `omarchy-launch-browser --private`                                                          |                                                                       | applications.lua:7  |
| SUPER + SHIFT + N        | Editor             | `omarchy-launch-editor`                                                                     |                                                                       | applications.lua:8  |
| SUPER + ALT + RETURN     | Tmux               | `omarchy-launch-terminal-tmux`                                                              | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:12 |
| SUPER + CTRL + RETURN    | Herdr              | `omarchy-launch-terminal-herdr`                                                             | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:13 |
| SUPER + SHIFT + Q        | Calculator         | `omacalc`                                                                                   | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:14 |
| XF86Calculator           | Calculator         | `omacalc`                                                                                   | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:15 |
| SUPER + SHIFT + M        | Music              | `omarchy-launch-spotify`                                                                    | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:16 |
| SUPER + SHIFT + ALT + M  | Music TUI          | `omarchy-launch-or-focus-tui cliamp`                                                        | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:17 |
| SUPER + SHIFT + D        | Docker             | `omarchy-launch-tui omarchy-launch-docker-tui`                                              | only when lazydocker is installed                                     | applications.lua:19 |
| SUPER + SHIFT + G        | Signal             | `omarchy-launch-signal`                                                                     | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:21 |
| SUPER + SHIFT + O        | Obsidian           | `omarchy-launch-or-focus '^obsidian$' 'uwsm-app -- obsidian'`                               | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:22 |
| SUPER + SHIFT + W        | Omawrite           | `uwsm-app -- omawrite`                                                                      | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:23 |
| SUPER + SHIFT + SLASH    | Passwords          | `omarchy-launch-1password`                                                                  | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:24 |
| SUPER + SHIFT + A        | ChatGPT            | `omarchy-launch-webapp https://chatgpt.com`                                                 | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:26 |
| SUPER + SHIFT + ALT + A  | Grok               | `omarchy-launch-webapp https://grok.com`                                                    | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:27 |
| SUPER + SHIFT + C        | Calendar           | `omarchy-launch-webapp https://app.hey.com/calendar/weeks/`                                 | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:28 |
| SUPER + SHIFT + E        | Email              | `omarchy-launch-webapp https://app.hey.com`                                                 | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:29 |
| SUPER + SHIFT + ALT + E  | New email          | `omarchy-launch-webapp https://app.hey.com/messages/new?display=standalone&new_window=true` | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:30 |
| SUPER + SHIFT + Y        | YouTube            | `omarchy-launch-webapp https://youtube.com/`                                                | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:31 |
| SUPER + SHIFT + ALT + G  | WhatsApp           | `omarchy-launch-or-focus-webapp <name> https://web.whatsapp.com/`                           | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:32 |
| SUPER + SHIFT + CTRL + G | Google Messages    | `omarchy-launch-or-focus-webapp <name> https://messages.google.com/web/conversations`       | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:33 |
| SUPER + SHIFT + P        | Google Photos      | `omarchy-launch-or-focus-webapp <name> https://photos.google.com/`                          | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:34 |
| SUPER + SHIFT + S        | Google Maps        | `omarchy-launch-or-focus-webapp <name> https://maps.google.com/`                            | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:35 |
| SUPER + SHIFT + X        | X                  | `omarchy-launch-webapp https://x.com/`                                                      | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:36 |
| SUPER + SHIFT + ALT + X  | X Post             | `omarchy-launch-webapp https://x.com/compose/post`                                          | preinstalled-app bindings (omarchy_preinstalled_bindings, default on) | applications.lua:37 |

#### Media and hardware keys — `default/hypr/bindings/media.lua`

| chord                         | description              | action                                                                       | notes                | line         |
| ----------------------------- | ------------------------ | ---------------------------------------------------------------------------- | -------------------- | ------------ |
| XF86AudioRaiseVolume          | Volume up                | `omarchy-audio-output-volume raise (global omarchy:audio.raise)`             | works on lock screen | media.lua:2  |
| XF86AudioLowerVolume          | Volume down              | `omarchy-audio-output-volume lower (global omarchy:audio.lower)`             | works on lock screen | media.lua:3  |
| XF86AudioMute                 | Mute                     | `omarchy-audio-output-volume mute-toggle (global omarchy:audio.mute-toggle)` | works on lock screen | media.lua:4  |
| XF86AudioMicMute              | Mute microphone          | `omarchy-audio-input-mute`                                                   | works on lock screen | media.lua:5  |
| XF86MonBrightnessUp           | Brightness up            | `omarchy-brightness-display +5% (global omarchy:brightness.raise)`           | works on lock screen | media.lua:6  |
| XF86MonBrightnessDown         | Brightness down          | `omarchy-brightness-display 5%- (global omarchy:brightness.lower)`           | works on lock screen | media.lua:7  |
| SHIFT + XF86MonBrightnessUp   | Brightness maximum       | `omarchy-brightness-display 100%`                                            | works on lock screen | media.lua:8  |
| SHIFT + XF86MonBrightnessDown | Brightness minimum       | `omarchy-brightness-display 1%`                                              | works on lock screen | media.lua:9  |
| XF86KbdBrightnessUp           | Keyboard brightness up   | `omarchy-brightness-keyboard up`                                             | works on lock screen | media.lua:10 |
| XF86KbdBrightnessDown         | Keyboard brightness down | `omarchy-brightness-keyboard down`                                           | works on lock screen | media.lua:11 |
| XF86KbdLightOnOff             | Keyboard backlight cycle | `omarchy-brightness-keyboard cycle`                                          | works on lock screen | media.lua:12 |
| XF86TouchpadToggle            | Toggle touchpad          | `omarchy-toggle-touchpad`                                                    | works on lock screen | media.lua:13 |
| XF86TouchpadOn                | Enable touchpad          | `omarchy-toggle-touchpad on`                                                 | works on lock screen | media.lua:14 |
| XF86TouchpadOff               | Disable touchpad         | `omarchy-toggle-touchpad off`                                                | works on lock screen | media.lua:15 |
| ALT + XF86AudioRaiseVolume    | Volume up precise        | `omarchy-audio-output-volume +1`                                             | works on lock screen | media.lua:18 |
| ALT + XF86AudioLowerVolume    | Volume down precise      | `omarchy-audio-output-volume -1`                                             | works on lock screen | media.lua:19 |
| ALT + XF86MonBrightnessUp     | Brightness up precise    | `omarchy-brightness-display +1%`                                             | works on lock screen | media.lua:20 |
| ALT + XF86MonBrightnessDown   | Brightness down precise  | `omarchy-brightness-display 1%-`                                             | works on lock screen | media.lua:21 |
| XF86AudioNext                 | Next track               | `omarchy-shell media next (global omarchy:ipc.media.next)`                   | works on lock screen | media.lua:24 |
| ALT + XF86AudioPlay           | Next track               | `omarchy-shell media next (global omarchy:ipc.media.next)`                   | works on lock screen | media.lua:25 |
| XF86AudioPause                | Pause                    | `omarchy-shell media playPause (global omarchy:ipc.media.playPause)`         | works on lock screen | media.lua:26 |
| XF86AudioPlay                 | Play                     | `omarchy-shell media playPause (global omarchy:ipc.media.playPause)`         | works on lock screen | media.lua:27 |
| XF86AudioPrev                 | Previous track           | `omarchy-shell media previous (global omarchy:ipc.media.previous)`           | works on lock screen | media.lua:28 |
| ALT + SHIFT + XF86AudioPlay   | Previous track           | `omarchy-shell media previous (global omarchy:ipc.media.previous)`           | works on lock screen | media.lua:29 |
| XF86Eject                     | Eject media              | `eject`                                                                      | works on lock screen | media.lua:30 |
| SHIFT + XF86AudioMute         | Switch audio output      | `omarchy-audio-output-switch`                                                | works on lock screen | media.lua:32 |
| SHIFT + XF86AudioPause        | Switch media source      | `omarchy-audio-source-switch`                                                | works on lock screen | media.lua:33 |
| SHIFT + XF86AudioPlay         | Switch media source      | `omarchy-audio-source-switch`                                                | works on lock screen | media.lua:34 |

#### Clipboard — `default/hypr/bindings/clipboard.lua`

| chord            | description       | action                                                                                  | notes | line             |
| ---------------- | ----------------- | --------------------------------------------------------------------------------------- | ----- | ---------------- |
| SUPER + A        | Select all        | `send Ctrl+A to the focused surface`                                                    |       | clipboard.lua:45 |
| SUPER + C        | Universal copy    | `send Ctrl+C (Ctrl+Shift+C when a terminal is focused)`                                 |       | clipboard.lua:46 |
| SUPER + V        | Universal paste   | `send Ctrl+V (Ctrl+Shift+V when a terminal is focused)`                                 |       | clipboard.lua:47 |
| SUPER + X        | Universal cut     | `send Ctrl+X to the focused surface`                                                    |       | clipboard.lua:48 |
| SUPER + CTRL + V | Clipboard manager | `omarchy-shell shell toggle omarchy.clipboard (global omarchy:panel.omarchy.clipboard)` |       | clipboard.lua:49 |

#### Input method — `default/hypr/bindings/input-method.lua`

| chord             | description                          | action                                                                                                        | notes | line                |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----- | ------------------- |
| SUPER + I         | Switch input language                | `omarchy-input-method cycle`                                                                                  |       | input-method.lua:19 |
| SUPER + SHIFT + I | Switch input language back           | `omarchy-input-method cycle back`                                                                             |       | input-method.lua:20 |
| CTRL + SPACE      | Direct input for the terminal prefix | `non-consuming: in a terminal, run fcitx5-remote --check -c so the tmux/Herdr prefix reaches the multiplexer` |       | input-method.lua:24 |

#### Dictation — `default/hypr/bindings/dictation.lua`

| chord                  | description                                      | action                                             | notes                                                 | line             |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------- | ---------------- |
| ALT + SPACE            | Toggle dictation                                 | `omarchy-dictation toggle`                         | only when the selected dictation backend is installed | dictation.lua:15 |
| ALT + RIGHT_ALT (hold) | Start dictation (push-to-talk) / Stop on release | `omarchy-dictation start / omarchy-dictation stop` | only when the selected dictation backend is installed | dictation.lua:18 |

#### JIS keyboards — `default/hypr/bindings/jis.lua`

| chord                    | description         | action                                                                          | notes                                  | line       |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------- | -------------------------------------- | ---------- |
| CTRL + SHIFT + SEMICOLON | Zoom in (JIS + key) | `send Ctrl+KP_Add (Ctrl+asciicircum for Obsidian) so JIS keyboards can zoom in` | only on Japanese (jp) keyboard layouts | jis.lua:32 |

#### Screenshot region picker (temporary) — `default/hypr/bindings/utilities.lua:55-98`

| chord         | description      | action                                         | notes                                    | line                |
| ------------- | ---------------- | ---------------------------------------------- | ---------------------------------------- | ------------------- |
| RETURN        | (no description) | `omarchy-capture-region --take-window`         | only while selecting a screenshot region | utilities.lua:55-98 |
| CTRL + RETURN | (no description) | `omarchy-capture-region --take-fullscreen`     | only while selecting a screenshot region | utilities.lua:55-98 |
| TAB           | (no description) | `omarchy-capture-region --select-window next`  | only while selecting a screenshot region | utilities.lua:55-98 |
| CTRL + TAB    | (no description) | `omarchy-capture-region --select-window prev`  | only while selecting a screenshot region | utilities.lua:55-98 |
| LEFT          | (no description) | `omarchy-capture-region --select-window left`  | only while selecting a screenshot region | utilities.lua:55-98 |
| RIGHT         | (no description) | `omarchy-capture-region --select-window right` | only while selecting a screenshot region | utilities.lua:55-98 |
| UP            | (no description) | `omarchy-capture-region --select-window up`    | only while selecting a screenshot region | utilities.lua:55-98 |
| DOWN          | (no description) | `omarchy-capture-region --select-window down`  | only while selecting a screenshot region | utilities.lua:55-98 |

### Touchpad gestures (`default/hypr/gestures.lua`)

| fingers | direction | action                                               | source                       |
| ------- | --------- | ---------------------------------------------------- | ---------------------------- |
| 3       | left      | focus workspace r-1                                  | default/hypr/gestures.lua:11 |
| 3       | right     | focus workspace r+1                                  | default/hypr/gestures.lua:12 |
| 3       | up        | toggle special workspace qconsole (AI/Quake console) | default/hypr/gestures.lua:15 |
| 3       | down      | Omarchy menu (global omarchy:menu.root)              | default/hypr/gestures.lua:16 |
| 4       | left      | move window to workspace r-1                         | default/hypr/gestures.lua:19 |
| 4       | right     | move window to workspace r+1                         | default/hypr/gestures.lua:20 |
| 4       | down      | fullscreen                                           | default/hypr/gestures.lua:21 |

---

## 6. The bar (Waybar's replacement)

**There is no Waybar.** The status bar is `omarchy.bar`, laid out by the `bar:` subtree of `shell.json` (`config/omarchy/shell.json:7-69`):

| Section     | Widgets, in order                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| left        | `omarchy.menu`, `omarchy.workspaces`                                                                                                                     |
| centerBegin | `omarchy.indicators`                                                                                                                                     |
| center      | `omarchy.clock` (`format "dddd HH:mm"`, `formatAlt "d MMMM 'W'ww yyyy"`, `verticalFormat "HH\n—\nmm"`)                                                   |
| centerEnd   | `omarchy.elsewhen`, `omarchy.weather`, `omarchy.system-update`                                                                                           |
| right       | `omarchy.tray`, `omarchy.keyboard-layout`, `omarchy.agents`, `omarchy.bluetooth`, `omarchy.network`, `omarchy.audio`, `omarchy.monitor`, `omarchy.power` |

`center` is centred on the exact middle of the screen, and `centerBegin`/`centerEnd` hang off its edges (`shell/plugins/bar/README.md:51`). The bar can sit on any edge; position `top` and background `opaque` are the defaults (`config/omarchy/shell.json:8-9`).

**Geometry:** 26px tall (28px wide when vertical) at the 12px base font. It scales with `[font] base-size` (`default/themed/shell.toml.tpl:15-17`, `shell/Commons/Style.qml:344-345`). It spans the full screen width with no margins, uses an exclusive zone equal to its thickness (`shell/plugins/bar/Bar.qml:1727,1745-1756`), and pads 8px at the left and right edges (`:1948,1957`).

**Type:** `monospace`, which is JetBrainsMono Nerd Font, at 12px (`Style.font.body`) (`shell/plugins/bar/Bar.qml:79`, `shell/Ui/WidgetButton.qml:10-11`). Icons are fitted to a 12px target in a 16px canvas, with 27px icon slots and 21px status slots (`shell/Commons/Style.qml:353-357`).

**Colours:** background = `background`, text = `foreground`, attention (recording, dictation, alerts, updates) = `red` (`default/themed/shell.toml.tpl:7-11`). Glassy mode draws the background at alpha 0.35 over a Hyprland blur (`shell/plugins/bar/Bar.qml:89`, `default/hypr/toggles/bar-glassy.lua`).

**Workspaces** (`shell/plugins/bar/widgets/Workspaces.qml`):

- Slots 1–5 of the monitor always show. Slots 6–10 appear only when they exist, and slot 10 is labelled `0` (`:79-84,273`).
- Each button is 20px wide and bar-height, 1px apart, with text at 12px, horizontal margin 6 and vertical padding 6 (`:252,275-278`).
- Empty workspaces sit at 50% opacity; occupied and active ones at 100% (`:274`).
- The active workspace shows its **layout glyph instead of its number**: dwindle 󱓻 `U+F14FB`, scrolling 󰝥 `U+F0765`, floating 󰔶 `U+F0536` (`:138-142,273`). There is no pill, underline or fill on it.
- Clicking another workspace focuses it. Clicking the active one cycles its layout. Scrolling moves along the row.

**Widget glyphs and clicks:**

| Widget     | Glyph(s)                                                                                                                      | Clicks                                                  | Source                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| menu       | `U+E900` (omarchy icon font)                                                                                                  | left: menu · right: terminal                            | `shell/plugins/menu/BarWidget.qml:11-21`                          |
| clock      | text                                                                                                                          | left: calendar · right: cycle format · middle: timezone | `shell/plugins/bar/README.md:61`                                  |
| bluetooth  | 󰂯 on · 󰂱 connected · 󰂲 off                                                                                                    | left: panel · right: radio toggle                       | `shell/plugins/panels/bluetooth/Panel.qml:59-64`                  |
| network    | 󰤯 󰤟 󰤢 󰤥 󰤨 (Wi-Fi strength), 󰤩 restricted, 󰈀 Ethernet, 󰤮 none                                                                  | left: panel                                             | `shell/plugins/panels/network/Model.js:17-21,60-65`               |
| audio      | by level, 󰋋 headphones (the old Waybar glyph set)                                                                             | left: panel · right: mute · scroll: volume              | `shell/plugins/panels/audio/Panel.qml:475-486`                    |
| monitor    | 󰍹 / 󰍺 (multiple screens)                                                                                                      | left: brightness/display panel                          | `shell/plugins/panels/monitor/Panel.qml:812`                      |
| power      | 󰁺…󰁹 discharging, 󰢜…󰂅 charging                                                                                                 | left: battery/profile panel · right: toggle percentage  | `shell/plugins/panels/power/Model.js:66-82`                       |
| indicators | Dnd, NightLight, PasswordlessSudo, Reminder, RemoteSession, ScreenRecording, StayAwake. Inactive ones stay hidden until hover | left: action                                            | `shell/plugins/bar/indicators/`, `shell/plugins/bar/README.md:77` |

Direct manipulation: drag empty bar space to move the bar to another edge, double-click the empty centre to cycle clear → glassy → opaque, and drag widgets to reorder them (`shell/plugins/bar/README.md:19`). Custom widgets can be `command` modules, which accept Waybar-style JSON output, or QML (`:95-166`).

---

## 7. Launcher and the Omarchy menu

### No launcher; the menu covers it

Walker and all `elephant-*` providers were removed (`bin/omarchy-upgrade-to-quattro:883-896,910,921`). **Super+Space** opens the Omarchy menu root. Its first row, **Apps**, is backed by the `apps` provider (desktop entries with icons), and typing searches apps along with every menu label (`default/omarchy/omarchy-menu.jsonc:24`, `docs/menu.md:116-120`, `manual/07-hotkeys.md:9`). **Super+Alt+Space** opens the dock's full-screen **app grid** (`default/hypr/bindings/utilities.lua:2`).

**Menu card** (`shell/plugins/menu/Menu.qml`):

- Width 300, or 520 for the screen-record, font and kernel menus (`:138`).
- Padding 18, header 34, rows 50 (58 with a detail line), row spacing 3, content spacing 6 (`:126-134`).
- Border 2px (`:117`). Radius equals Hyprland rounding, 0 by default (`:125`).
- Horizontally centred and vertically centred, then frozen in place while open (`:1286-1313`). The scrim behind it is the background colour at 50%.
- Rows: a 36px icon column with 18px glyphs, labels at **16px** (heading), detail lines at 11px, and a 16px header title (`:1413,1521-1527,1564,1578`).
- The selected row fills with foreground at 8%, turns its text and icon **accent**, and gains a border at 25% (`default/themed/shell.toml.tpl:183-187`).
- Font: `monospace`, unless `OMARCHY_MENU_FONT` is set (`shell/Commons/Style.qml:314-321`).

**App grid** (`shell/plugins/dock/AppGrid.qml:32-52`): 56px icons, 123px cells (icon × 2.2), cell padding 8, gutter 4, up to 7 columns, 4 visible rows, border 2, padding 18, header 36, a 40px screen margin, 12px labels and a 16px header.

The `[launcher]` token block in `shell.toml.tpl:154-170` (card alpha 0.95) is **not read by any QML** at this commit. It looks like a placeholder for a future launcher.

### Menu definition

The menu is data. Each entry in `default/omarchy/omarchy-menu.jsonc` is keyed by a dotted id (`trigger.capture.screenshot` is a child of `trigger.capture`). Entries carry `icon`, `label`, `action`, `target`, `provider`, `when` (hide), `checked` (✓) and `disabled` (dimmed, meaning already installed) (`docs/menu.md:21-108`). The shell parses it once, watches it for changes, batches all guard checks into one subprocess, and runs actions detached (`shell/plugins/README.md`, Omarchy menu section). It has 423 entries.

**Top level, in order:**

| #   | entry      | icon | codepoint | kind                                     | source                                |
| --- | ---------- | ---- | --------- | ---------------------------------------- | ------------------------------------- |
| 1   | Apps       | 󰀻    | U+F003B   | action `omarchy-shell omarchy.dock apps` | default/omarchy/omarchy-menu.jsonc:24 |
| 2   | Learn      | 󰧑    | U+F09D1   | submenu (9 children)                     | default/omarchy/omarchy-menu.jsonc:25 |
| 3   | Appearance | 󰏘    | U+F03D8   | submenu (11 children)                    | default/omarchy/omarchy-menu.jsonc:26 |
| 4   | Trigger    | 󱓞    | U+F14DE   | submenu (9 children)                     | default/omarchy/omarchy-menu.jsonc:27 |
| 5   | Setup      |     | U+E615    | submenu (10 children)                    | default/omarchy/omarchy-menu.jsonc:28 |
| 6   | Install    | 󰉉    | U+F0249   | submenu (14 children)                    | default/omarchy/omarchy-menu.jsonc:29 |
| 7   | Remove     | 󰭌    | U+F0B4C   | submenu (13 children)                    | default/omarchy/omarchy-menu.jsonc:30 |
| 8   | Update     |     | U+F021    | submenu (11 children)                    | default/omarchy/omarchy-menu.jsonc:31 |
| 9   | About      |     | U+EA74    | action `omarchy-launch-about`            | default/omarchy/omarchy-menu.jsonc:32 |
| 10  | System     |     | U+F011    | submenu (7 children)                     | default/omarchy/omarchy-menu.jsonc:33 |

### Complete menu tree

The glyph is the Nerd Font icon shown in the row, followed by its codepoint. Where a row has a command, it follows the dash, truncated at 90 characters. The full commands and guard expressions are in `facts.json` → `menu`. Children are listed in file order under their dotted parent.

- 󰀻 **Apps** `U+F003B` — `omarchy-shell omarchy.dock apps` _(provider: apps)_
- 󰧑 **Learn** `U+F09D1`
  -  **Keybindings** `U+F11C` — `omarchy-menu-keybindings`
  -  **Omarchy** `U+F405` — `omarchy-launch-webapp 'https://omarchy.org/manual/'`
  -  **Hyprland** `U+F359` — `omarchy-launch-webapp 'https://wiki.hypr.land/'`
  - 󰣇 **Arch** `U+F08C7` — `omarchy-launch-webapp 'https://wiki.archlinux.org/title/Main_page'`
  -  **Neovim** `U+E6AE` — `omarchy-launch-webapp 'https://www.lazyvim.org/keymaps'`
  - 󱆃 **Bash** `U+F1183` — `omarchy-launch-webapp 'https://devhints.io/bash'`
  -  **Tmux** `U+F489` — `omarchy-menu-tmux-keybindings`
  -  **Herdr** `U+F0DB` — `omarchy-menu-herdr-keybindings`
  - 󰙯 **Community** `U+F066F` — `omarchy-launch-discord-community`
- 󰏘 **Appearance** `U+F03D8`
  - 󰸌 **Theme** `U+F0E0C` — `omarchy-shell shell summon omarchy.image-picker '{"source":"themes"}'`
  -  **Background** `U+F03E` — `background=$(omarchy-theme-bg-switcher); [[ -n $background ]] && omarchy-theme-bg-set "...`
  -  **Font** `U+E659` _(provider: fonts)_
  - 󰍜 **Menu Bar** `U+F035C`
    - 󰈉 **Hide Bar** `U+F0209` — `omarchy-toggle-bar` _(when-guarded)_
    - 󰈈 **Show Bar** `U+F0208` — `omarchy-toggle-bar` _(when-guarded)_
    -  **Position Bar** `U+F047`
      - 󰁝 **Top Bar** `U+F005D` — `omarchy-bar position top`
      - 󰁅 **Bottom Bar** `U+F0045` — `omarchy-bar position bottom`
      - 󰁍 **Left Bar** `U+F004D` — `omarchy-bar position left`
      - 󰁔 **Right Bar** `U+F0054` — `omarchy-bar position right`
    - 󰂵 **Bar Background** `U+F00B5`
      - 󰝤 **Opaque Bar** `U+F0764` — `omarchy-bar background opaque` _(✓ when current)_
      - 󰂵 **Glassy Bar** `U+F00B5` — `omarchy-bar background glassy` _(✓ when current)_
      - 󰝣 **Clear Bar** `U+F0763` — `omarchy-bar background none` _(✓ when current)_
    - 󰋽 **Bar Indicators** `U+F02FD`
      - 󰁹 **Show Battery %** `U+F0079` — `omarchy-shell omarchy.power togglePercentage` _(when-guarded)_
      - 󰁹 **Hide Battery %** `U+F0079` — `omarchy-shell omarchy.power togglePercentage` _(when-guarded)_
      - 󰥔 **Clock** `U+F0954`
        - 󰥔 **Sunday 14:30** `U+F0954` — `omarchy-bar set omarchy.clock format "dddd HH:mm"` _(when-guarded; ✓ when current)_
        - 󰥔 **Sunday 2:30 PM** `U+F0954` — `omarchy-bar set omarchy.clock format "dddd h:mm AP"` _(when-guarded; ✓ when current)_
        - 󰥔 **Sunday 14:30:05** `U+F0954` — `omarchy-bar set omarchy.clock format "dddd HH:mm:ss"` _(when-guarded; ✓ when current)_
        - 󰥔 **Sunday 2:30:05 PM** `U+F0954` — `omarchy-bar set omarchy.clock format "dddd h:mm:ss AP"` _(when-guarded; ✓ when current)_
        - 󰥔 **14:30** `U+F0954` — `omarchy-bar set omarchy.clock format "HH:mm"` _(when-guarded; ✓ when current)_
        - 󰥔 **2:30 PM** `U+F0954` — `omarchy-bar set omarchy.clock format "h:mm AP"` _(when-guarded; ✓ when current)_
        - 󰥔 **Sun 3 May 14:30** `U+F0954` — `omarchy-bar set omarchy.clock format "ddd d MMM HH:mm"` _(when-guarded; ✓ when current)_
        - 󰥔 **Sun 3 May 2:30 PM** `U+F0954` — `omarchy-bar set omarchy.clock format "ddd d MMM h:mm AP"` _(when-guarded; ✓ when current)_
        - 󰥔 **3 May W18 2026** `U+F0954` — `omarchy-bar set omarchy.clock format "d MMMM 'W'ww yyyy"` _(when-guarded; ✓ when current)_
        - 󰥔 **2026-05-03 14:30** `U+F0954` — `omarchy-bar set omarchy.clock format "yyyy-MM-dd HH:mm"` _(when-guarded; ✓ when current)_
        - 󰥔 **14 — 30** `U+F0954` — `omarchy-bar set omarchy.clock verticalFormat $'HH\n—\nmm'` _(when-guarded; ✓ when current)_
        - 󰥔 **2 — 30 PM** `U+F0954` — `omarchy-bar set omarchy.clock verticalFormat $'h\n—\nmm\nAP'` _(when-guarded; ✓ when current)_
        - 󰥔 **03 May W18 '26** `U+F0954` — `omarchy-bar set omarchy.clock verticalFormat $'dd\nMMM\n\'W\'ww\n\'\'yy'` _(when-guarded; ✓ when current)_
        - 󰥔 **14 30** `U+F0954` — `omarchy-bar set omarchy.clock verticalFormat $'HH\nmm'` _(when-guarded; ✓ when current)_
  - 󰖲 **Windows** `U+F05B2`
    -  **Window Gaps On** `U+E62A` — `omarchy-hyprland-window-gaps-toggle` _(when-guarded)_
    -  **Window Gaps Off** `U+E62A` — `omarchy-hyprland-window-gaps-toggle` _(when-guarded)_
    - 󰘇 **Window Corners** `U+F0607`
      - 󰏘 **Theme Corners** `U+F03D8` — `omarchy-hyprland-corners theme` _(✓ when current)_
      - 󰝣 **Sharp Corners** `U+F0763` — `omarchy-hyprland-corners sharp` _(✓ when current)_
      - 󰘇 **Rounded Corners** `U+F0607` — `omarchy-hyprland-corners rounded` _(✓ when current)_
    - 󰂵 **Window Opacity** `U+F00B5`
      - 󰝤 **Opaque Windows** `U+F0764` — `omarchy-hyprland-window-transparency opaque` _(✓ when current)_
      - 󰝣 **Transparent Windows** `U+F0763` — `omarchy-hyprland-window-transparency transparent` _(✓ when current)_
      - 󰂵 **Glassy Windows** `U+F00B5` — `omarchy-hyprland-window-transparency glassy` _(✓ when current)_
    -  **1-Window Ratio On** `U+F2D0` — `omarchy-hyprland-window-single-square-aspect-toggle` _(when-guarded)_
    -  **1-Window Ratio Off** `U+F2D0` — `omarchy-hyprland-window-single-square-aspect-toggle` _(when-guarded)_
  -  **Branding** `U+E900` (omarchy font)
    - 󱄄 **Screensaver** `U+F1104`
      -  **Edit Text** `U+F044` — `omarchy-branding-screensaver text`
      -  **Set From Image** `U+F03E` — `omarchy-branding-screensaver image`
      -  **Restore Default** `U+F46A` — `omarchy-branding-screensaver reset`
    -  **About** `U+EA74`
      -  **Edit Text** `U+F044` — `omarchy-branding-about text`
      -  **Set From Image** `U+F03E` — `omarchy-branding-about image`
      -  **Restore Default** `U+F46A` — `omarchy-branding-about reset`
  - 󱂩 **Dock** `U+F10A9` _(when-guarded)_
    - 󰈉 **Auto-hide Dock** `U+F0209` — `omarchy-dock autohide on` _(when-guarded)_
    - 󰈈 **Always-on Dock** `U+F0208` — `omarchy-dock autohide off` _(when-guarded)_
    -  **Dock Position** `U+F047`
      - 󰁝 **Top Dock** `U+F005D` — `omarchy-dock position top` _(✓ when current)_
      - 󰁅 **Bottom Dock** `U+F0045` — `omarchy-dock position bottom` _(✓ when current)_
      - 󰁍 **Left Dock** `U+F004D` — `omarchy-dock position left` _(✓ when current)_
      - 󰁔 **Right Dock** `U+F0054` — `omarchy-dock position right` _(✓ when current)_
  - 󱂬 **Workspace Layout** `U+F10AC`
    - 󱓻 **Tiling** `U+F14FB` — `omarchy-hyprland-workspace-layout-default dwindle` _(✓ when current)_
    - 󰝥 **Scrolling** `U+F0765` — `omarchy-hyprland-workspace-layout-default scrolling` _(✓ when current)_
    - 󰔶 **Floating** `U+F0536` — `omarchy-hyprland-workspace-layout-default floating` _(✓ when current)_
  - 󰗘 **Animations On** `U+F05D8` — `omarchy-toggle-animations` _(when-guarded)_
  - 󰗘 **Animations Off** `U+F05D8` — `omarchy-toggle-animations` _(when-guarded)_
  - 󰟵 **Unlock** `U+F07F5` — `unlock=$(omarchy-plymouth-switcher); if [[ $unlock == default ]]; then omarchy-launch-f...`
- 󱓞 **Trigger** `U+F14DE`
  - 󰔎 **Toggle** `U+F050E`
    -  **Stay Awake** `U+EF59` — `omarchy-toggle-idle` _(when-guarded)_
    -  **Allow Sleep** `U+EF59` — `omarchy-toggle-idle` _(when-guarded)_
    - 󰂛 **Notifications On** `U+F009B` — `omarchy-toggle-notification-silencing` _(when-guarded)_
    - 󰂛 **Silence Notifications** `U+F009B` — `omarchy-toggle-notification-silencing` _(when-guarded)_
    - 󰔎 **Nightlight On** `U+F050E` — `omarchy-toggle-nightlight` _(when-guarded)_
    - 󰔎 **Nightlight Off** `U+F050E` — `omarchy-toggle-nightlight` _(when-guarded)_
    - 󱄄 **Screensaver On** `U+F1104` — `omarchy-toggle-screensaver` _(when-guarded)_
    - 󱄄 **Screensaver Off** `U+F1104` — `omarchy-toggle-screensaver` _(when-guarded)_
    - 󱚡 **Crash Capture On** `U+F16A1` — `omarchy-toggle-crash-capture` _(when-guarded)_
    - 󱚡 **Crash Capture Off** `U+F16A1` — `omarchy-toggle-crash-capture` _(when-guarded)_
  -  **Emoji** `U+F118` — `omarchy-menu-emoji`
  - 󰅇 **Clipboard History** `U+F0147` — `omarchy-shell shell summon omarchy.clipboard`
  - 󰢌 **Reminder** `U+F088C`
    - 󰢌 **Set one** `U+F088C` — `omarchy-reminder -i`
    - 󰢌 **Show all** `U+F088C` — `omarchy-reminder show`
    - 󰢌 **Clear all** `U+F088C` — `omarchy-reminder clear`
  -  **Capture** `U+F030`
    -  **Screenshot** `U+F030` — `omarchy-capture-screenshot`
    -  **Screenrecord** `U+F03D`
      -  **Stop Screenrecording** `U+F03D` — `omarchy-capture-screenrecording --stop-recording` _(when-guarded)_
      -  **With no audio** `U+F03D` — `omarchy-capture-screenrecording`
      -  **With desktop audio** `U+F03D` — `omarchy-capture-screenrecording --with-desktop-audio`
      -  **With desktop + microphone audio** `U+F03D` — `omarchy-capture-screenrecording --with-desktop-audio --with-microphone-audio`
      -  **With desktop + microphone audio + webcam** `U+F03D` — `omarchy-capture-screenrecording-with-webcam` _(when-guarded)_
    - 󰴑 **Text** `U+F0D11` — `omarchy-capture-text`
    - 󰐲 **QR Code** `U+F0432` — `omarchy-capture-qr`
    - 󰃉 **Color** `U+F00C9` — `pkill hyprpicker || hyprpicker -a`
  - 󰧸 **Transcode** `U+F09F8` — `omarchy-transcode`
  -  **Share** `U+F50E`
    -  **Clipboard** `U+F07F` — `omarchy-menu-share clipboard`
    -  **File** `U+EA7B` — `omarchy-menu-share file`
    -  **Folder** `U+F114` — `omarchy-menu-share folder`
    - 󰥦 **Receive** `U+F0966` — `uwsm-app -- localsend`
  -  **Hardware** `U+EF70`
    - 󰛧 **Laptop Display On** `U+F06E7` — `omarchy-hyprland-monitor-internal toggle` _(when-guarded)_
    - 󰛧 **Laptop Display Off** `U+F06E7` — `omarchy-hyprland-monitor-internal toggle` _(when-guarded)_
    - 󰍹 **Display Mirroring On** `U+F0379` — `omarchy-hyprland-monitor-internal-mirror toggle` _(when-guarded)_
    - 󰍹 **Display Mirroring Off** `U+F0379` — `omarchy-hyprland-monitor-internal-mirror toggle` _(when-guarded)_
    -  **Switch to Hybrid GPU** `U+EC19` — `omarchy-launch-floating-terminal-with-presentation omarchy-toggle-hybrid-gpu` _(when-guarded)_
    -  **Switch to Integrated GPU** `U+EC19` — `omarchy-launch-floating-terminal-with-presentation omarchy-toggle-hybrid-gpu` _(when-guarded)_
    - 󰟸 **Enable Touchpad** `U+F07F8` — `omarchy-toggle-touchpad` _(when-guarded)_
    - 󰟸 **Disable Touchpad** `U+F07F8` — `omarchy-toggle-touchpad` _(when-guarded)_
    - 󰌌 **Touchpad Haptics** `U+F030C`
      - 󰌌 **low** `U+F030C` — `dell-xps-touchpad-haptics set low` _(when-guarded; ✓ when current)_
      - 󰌌 **mid** `U+F030C` — `dell-xps-touchpad-haptics set mid` _(when-guarded; ✓ when current)_
      - 󰌌 **high** `U+F030C` — `dell-xps-touchpad-haptics set high` _(when-guarded; ✓ when current)_
    - 󰆽 **Enable Touchscreen** `U+F01BD` — `omarchy-toggle-touchscreen` _(when-guarded)_
    - 󰆽 **Disable Touchscreen** `U+F01BD` — `omarchy-toggle-touchscreen` _(when-guarded)_
  - 󰓅 **Speed Test** `U+F04C5`
    - 󰓅 **Network Speed Test** `U+F04C5` — `omarchy-shell shell summon omarchy.speedtest`
    - 󰋊 **Disk Speed Test** `U+F02CA` — `omarchy-shell shell summon omarchy.disk-speedtest`
-  **Setup** `U+E615`
  -  **Keyboard** `U+F11C`
    -  **Keybindings** `U+F11C` — `omarchy-launch-config-editor "$HOME/.config/hypr/bindings.lua"` _(when-guarded)_
    -  **Keyboard Inputs** `U+F11C` — `omarchy-setup-keyboard`
    -  **Input Methods** `U+F11C` — `omarchy-setup-input`
  -  **Input** `U+EFBA` — `omarchy-launch-config-editor "$HOME/.config/hypr/input.lua"` _(when-guarded)_
  -  **Language** `U+F1AB` _(provider: languages)_
  - 󰛳 **Network** `U+F06F3`
    - 󰇖 **DNS** `U+F01D6`
      - 󰩟 **DHCP** `U+F0A5F` — `omarchy-dns DHCP` _(✓ when current)_
      - 󰅟 **Cloudflare** `U+F015F` — `omarchy-dns Cloudflare` _(✓ when current)_
      - 󰊭 **Google** `U+F02AD` — `omarchy-dns Google` _(✓ when current)_
      -  **Custom** `U+F040` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-dns Custom'` _(✓ when current)_
    - 󰐲 **QR Code** `U+F0432` — `omarchy-shell shell summon omarchy.wifiqr` _(when-guarded)_
  -  **Defaults** `U+F005`
    - 󰚩 **Agent** `U+F06A9`
      -  **Amp** `U+E919` (omarchy font) — `omarchy-default-agent amp` _(✓ when current)_
      -  **Antigravity** `U+E91C` (omarchy font) — `omarchy-default-agent agy` _(✓ when current)_
      -  **Claude** `U+E90E` (omarchy font) — `omarchy-default-agent claude` _(✓ when current)_
      -  **Codex** `U+E905` (omarchy font) — `omarchy-default-agent codex` _(✓ when current)_
      -  **Command Code** `U+E91A` (omarchy font) — `omarchy-default-agent commandcode` _(✓ when current)_
      -  **Copilot** `U+F4B8` — `omarchy-default-agent copilot` _(✓ when current)_
      -  **Crush** `U+E91E` (omarchy font) — `omarchy-default-agent crush` _(✓ when current)_
      -  **Cursor CLI** `U+E90D` (omarchy font) — `omarchy-default-agent cursor-agent` _(✓ when current)_
      -  **DeepSeek Harness** `U+E911` (omarchy font) — `omarchy-default-agent dsh` _(✓ when current)_
      -  **Devin CLI** `U+E918` (omarchy font) — `omarchy-default-agent devin` _(✓ when current)_
      -  **Freebuff** `U+E916` (omarchy font) — `omarchy-default-agent freebuff` _(✓ when current)_
      -  **Grok** `U+E904` (omarchy font) — `omarchy-default-agent grok` _(✓ when current)_
      -  **Hermes** `U+E90A` (omarchy font) — `omarchy-default-agent hermes` _(✓ when current)_
      -  **Kilo** `U+E917` (omarchy font) — `omarchy-default-agent kilo` _(✓ when current)_
      -  **Kimi** `U+E91D` (omarchy font) — `omarchy-default-agent kimi` _(✓ when current)_
      -  **Kiro CLI** `U+E914` (omarchy font) — `omarchy-default-agent kiro-cli` _(✓ when current)_
      -  **MiniMax Code** `U+E912` (omarchy font) — `omarchy-default-agent mcode` _(✓ when current)_
      -  **Muse Code** `U+E91F` (omarchy font) — `omarchy-default-agent muse` _(✓ when current)_
      -  **omp** `U+E903` (omarchy font) — `omarchy-default-agent omp` _(✓ when current)_
      -  **OpenClaw** `U+E90C` (omarchy font) — `omarchy-default-agent openclaw` _(✓ when current)_
      -  **OpenCode** `U+E902` (omarchy font) — `omarchy-default-agent opencode` _(✓ when current)_
      -  **Ori** `U+E909` (omarchy font) — `omarchy-default-agent ori` _(✓ when current)_
      -  **Pi** `U+E901` (omarchy font) — `omarchy-default-agent pi` _(✓ when current)_
      -  **Qwen Code** `U+E910` (omarchy font) — `omarchy-default-agent qwen` _(✓ when current)_
    -  **Browser** `U+F488`
      -  **Chromium** `U+F268` — `omarchy-default-browser chromium` _(✓ when current)_
      - 󰊯 **Chrome** `U+F02AF` — `omarchy-default-browser chrome` _(✓ when current)_
      - 󰖟 **Brave** `U+F059F` — `omarchy-default-browser brave` _(✓ when current)_
      - 󰖟 **Brave Origin** `U+F059F` — `omarchy-default-browser brave-origin` _(✓ when current)_
      - 󰇩 **Edge** `U+F01E9` — `omarchy-default-browser edge` _(✓ when current)_
      -  **Firefox** `U+F269` — `omarchy-default-browser firefox` _(✓ when current)_
      - 󰖟 **Zen** `U+F059F` — `omarchy-default-browser zen` _(✓ when current)_
    -  **Dictation** `U+EC12`
      -  **Hex** `U+EC12` — `omarchy-default-dictation hex` _(✓ when current)_
      -  **Superwhisper** `U+EC12` — `omarchy-default-dictation superwhisper` _(✓ when current)_
      -  **Voxtype** `U+EC12` — `omarchy-default-dictation voxtype` _(✓ when current)_
    -  **Terminal** `U+F489`
      -  **Alacritty** `U+E795` — `omarchy-default-terminal alacritty` _(✓ when current)_
      -  **Foot** `U+E795` — `omarchy-default-terminal foot` _(✓ when current)_
      -  **Ghostty** `U+E795` — `omarchy-default-terminal ghostty` _(✓ when current)_
      -  **Kitty** `U+E795` — `omarchy-default-terminal kitty` _(✓ when current)_
    -  **Editor** `U+F15C`
      -  **Neovim** `U+E6AE` — `omarchy-default-editor nvim` _(✓ when current)_
      -  **VSCode** `U+E8DA` — `omarchy-default-editor code` _(✓ when current)_
      -  **Cursor** `U+E90D` (omarchy font) — `omarchy-default-editor cursor` _(✓ when current)_
      -  **Zed** `U+F15C` — `omarchy-default-editor zed` _(✓ when current)_
      -  **Sublime Text** `U+E7AA` — `omarchy-default-editor sublime_text` _(✓ when current)_
      -  **Helix** `U+F15C` — `omarchy-default-editor helix` _(✓ when current)_
      -  **Vim** `U+E62B` — `omarchy-default-editor vim` _(✓ when current)_
      -  **Emacs** `U+E632 U+0020` — `omarchy-default-editor emacs` _(✓ when current)_
  - 󰐱 **Plugins** `U+F0431`
    - 󰄬 **Enable Plugin** `U+F012C` — `omarchy-menu-plugin enable`
    - 󰅖 **Disable Plugin** `U+F0156` — `omarchy-menu-plugin disable`
    - 󰖟 **Add Plugin** `U+F059F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-plugin-add'`
    - 󰆏 **Clone Plugin** `U+F018F` — `omarchy-menu-plugin clone`
    - 󰭌 **Remove Plugin** `U+F0B4C` — `omarchy-menu-plugin remove` _(when-guarded)_
  -  **Security** `U+EB11`
    - 󰈷 **Fingerprint** `U+F0237` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-security-fingerprint` _(when-guarded)_
    -  **Fido2** `U+EB11` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-security-fido2`
    - 󰣀 **SSHD** `U+F08C0` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-security-sshd`
    - 󰣀 **SSH Agent** `U+F08C0` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-security-ssh-agent` _(when-guarded)_
    - 󰡨 **Sudoless Docker** `U+F0868` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-security-sudoless-docker` _(when-guarded)_
    - 󰟵 **Passwordless Sudo** `U+F07F5` — `omarchy-launch-floating-terminal-with-presentation omarchy-sudo-passwordless`
  -  **Config** `U+E615`
    -  **Git** `U+F09B` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-git`
    -  **Hyprland** `U+F359` — `omarchy-launch-config-editor "$HOME/.config/hypr/hyprland.lua"`
    -  **Hyprsunset** `U+F359` — `omarchy-launch-config-editor ~/.config/hypr/hyprsunset.conf && omarchy-restart-hyprsunset`
    - 󰞅 **XCompose** `U+F0785` — `omarchy-launch-config-editor ~/.XCompose && omarchy-restart-xcompose`
  -  **Direct Boot** `U+F03A` — `omarchy-launch-floating-terminal-with-presentation omarchy-setup-direct-boot` _(when-guarded)_
  - 󰑓 **Reset Computer** `U+F0453` — `omarchy-launch-floating-terminal-with-presentation omarchy-system-factory-reset` _(when-guarded)_
- 󰉉 **Install** `U+F0249`
  - 󰣇 **Package** `U+F08C7` — `xdg-terminal-exec --app-id=org.omarchy.terminal omarchy-pkg-install`
  - 󱚤 **AI** `U+F16A4`
    -  **ChatGPT Desktop** `U+E905` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-install-ai-chatgpt` _(dimmed when installed)_
    -  **Claude Desktop** `U+E90E` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-install-ai-claude` _(dimmed when installed)_
    -  **Grok Bot** `U+E904` (omarchy font) — `omarchy-install-and-launch 'Grok Bot' grok-bot grok-bot` _(dimmed when installed)_
    -  **Hermes Desktop** `U+E90A` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-install-ai-hermes` _(dimmed when installed)_
    -  **LM Studio** `U+E906` (omarchy font) — `omarchy-install-app 'LM Studio' lmstudio-bin` _(dimmed when installed)_
    -  **Ollama** `U+E907` (omarchy font) — `if omarchy-cmd-present nvidia-smi; then ollama_pkg=ollama-cuda; elif omarchy-cmd-presen...` _(dimmed when installed)_
    -  **OpenClaw** `U+E90C` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-install-ai-openclaw` _(dimmed when installed)_
    -  **Perplexity** `U+E90B` (omarchy font) — `omarchy-install-and-launch Perplexity perplexity perplexity` _(dimmed when installed)_
    -  **T3 Code** `U+E908` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-install-ai-t3-code` _(dimmed when installed)_
  -  **Service** `U+F487`
    - 󰢁 **1Password** `U+F0881` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-1password` _(dimmed when installed)_
    -  **Dropbox** `U+E707` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-dropbox` _(when-guarded; dimmed when installed)_
    - 󰓇 **Spotify** `U+F04C7` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-spotify` _(dimmed when installed)_
    - 󰭹 **Signal** `U+F0B79` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-signal` _(dimmed when installed)_
    - 󰒱 **Slack** `U+F04B1` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-slack` _(dimmed when installed)_
    -  **Tailscale** `U+E90F` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-tailscale` _(dimmed when installed)_
    - 󱇱 **NordVPN** `U+F11F1` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-nordvpn` _(dimmed when installed)_
    - 󰏖 **ONCE** `U+F03D6` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-once` _(dimmed when installed)_
    - 󰟵 **Bitwarden** `U+F07F5` — `omarchy-install-and-launch Bitwarden 'bitwarden bitwarden-cli' bitwarden` _(dimmed when installed)_
    - 󰍲 **Microsoft** `U+F0372` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-service-microsoft` _(dimmed when installed)_
    -  **Chromium Account** `U+E7F0` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-chromium-google-account` _(when-guarded; dimmed when installed)_
  - 󰵮 **Development** `U+F0D6E`
    - 󰫏 **Ruby on Rails** `U+F0ACF` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env ruby'` _(dimmed when installed)_
    -  **Docker DB** `U+F21F` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-docker-dbs`
    -  **JavaScript** `U+E781`
      -  **Node.js** `U+ED0D` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env node'` _(dimmed when installed)_
      -  **Bun** `U+E76F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env bun'` _(dimmed when installed)_
      -  **Deno** `U+E7C0` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env deno'` _(dimmed when installed)_
    -  **Go** `U+E627` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env go'` _(dimmed when installed)_
    -  **PHP** `U+E73D`
      -  **PHP** `U+E73D` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env php'` _(dimmed when installed)_
      -  **Laravel** `U+E73F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env laravel'` _(dimmed when installed)_
      -  **Symfony** `U+E757` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env symfony'` _(dimmed when installed)_
    -  **Python** `U+E73C` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env python'` _(dimmed when installed)_
    -  **Elixir** `U+E62D`
      -  **Elixir** `U+E62D` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env elixir'` _(dimmed when installed)_
      -  **Phoenix** `U+E860` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env phoenix'` _(dimmed when installed)_
    -  **Zig** `U+E8EF` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env zig'` _(dimmed when installed)_
    -  **Rust** `U+E7A8` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env rust'` _(dimmed when installed)_
    -  **Java** `U+E738` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env java'` _(dimmed when installed)_
    -  **.NET** `U+E77F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env dotnet'` _(dimmed when installed)_
    -  **OCaml** `U+E84E` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env ocaml'` _(dimmed when installed)_
    -  **Clojure** `U+E768` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env clojure'` _(dimmed when installed)_
    -  **Scala** `U+E737` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-dev-env scala'` _(dimmed when installed)_
  -  **Editor** `U+F15C`
    -  **VSCode** `U+E8DA` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-editor-vscode` _(dimmed when installed)_
    -  **Cursor** `U+E90D` (omarchy font) — `omarchy-install-and-launch Cursor cursor-bin cursor` _(dimmed when installed)_
    -  **Zed** `U+F15C` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-editor-zed` _(dimmed when installed)_
    -  **Sublime Text** `U+F15C` — `omarchy-install-and-launch 'Sublime Text' sublime-text-4 sublime_text` _(dimmed when installed)_
    -  **Helix** `U+F15C` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-editor-helix` _(dimmed when installed)_
    -  **Vim** `U+E62B` — `omarchy-install-app Vim vim` _(dimmed when installed)_
    -  **Emacs** `U+F15C` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-editor-emacs` _(dimmed when installed)_
  -  **Style** `U+EBCF`
    - 󰸌 **Theme** `U+F0E0C` — `omarchy-launch-floating-terminal-with-presentation omarchy-theme-install`
    -  **Background** `U+F03E` — `omarchy-theme-bg-install`
    -  **Font** `U+E659`
      -  **Cascadia Mono** `U+E659` — `omarchy-install-font 'Cascadia Mono' ttf-cascadia-mono-nerd 'CaskaydiaMono Nerd Font'`
      -  **Meslo LG Mono** `U+E659` — `omarchy-install-font 'Meslo LG Mono' ttf-meslo-nerd 'MesloLGL Nerd Font'`
      -  **Fira Code** `U+E659` — `omarchy-install-font 'Fira Code' ttf-firacode-nerd 'FiraCode Nerd Font'`
      -  **Victor Code** `U+E659` — `omarchy-install-font 'Victor Code' ttf-victor-mono-nerd 'VictorMono Nerd Font'`
      -  **Bitstream Vera Mono** `U+E659` — `omarchy-install-font 'Bitstream Vera Code' ttf-bitstream-vera-mono-nerd 'BitstromWera N...`
      -  **Iosevka** `U+E659` — `omarchy-install-font Iosevka ttf-iosevka-nerd 'Iosevka Nerd Font Mono'`
  -  **Gaming** `U+F11B`
    -  **Steam** `U+F1B6` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-steam` _(dimmed when installed)_
    - 󰯉 **RetroArch** `U+F0BC9` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-retroarch` _(dimmed when installed)_
    - 󰍳 **Minecraft** `U+F0373` — `omarchy-install-and-launch Minecraft minecraft-launcher minecraft-launcher` _(when-guarded; dimmed when installed)_
    - 󰢹 **NVIDIA GeForce NOW** `U+F08B9` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-geforce-now` _(when-guarded; dimmed when installed)_
    -  **Xbox Cloud Gaming** `U+ED3E` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-xbox-cloud` _(dimmed when installed)_
    - 󰂯 **Xbox Controllers** `U+F00AF` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-xbox-controllers` _(dimmed when installed)_
    -  **Battle.net** `U+F835` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-battlenet` _(when-guarded; dimmed when installed)_
    -  **Lutris** `U+EF94` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-lutris` _(when-guarded; dimmed when installed)_
    - 󱓟 **Heroic (Epic Games)** `U+F14DF` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-gaming-heroic` _(when-guarded; dimmed when installed)_
    - 󰯉 **RetroArch Game Launcher** `U+F0BC9` — `omarchy-games-retro-install`
  -  **Browser** `U+F488`
    -  **Chrome** `U+F268` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-browser chrome'` _(dimmed when installed)_
    - 󰇩 **Edge** `U+F01E9` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-browser edge'` _(when-guarded; dimmed when installed)_
    -  **Brave** `U+F268` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-browser brave'` _(dimmed when installed)_
    -  **Brave Origin** `U+F268` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-browser brave-origin'` _(dimmed when installed)_
    -  **Firefox** `U+F269` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-browser firefox'` _(dimmed when installed)_
    - 󰖟 **Zen** `U+F059F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-browser zen'` _(dimmed when installed)_
  -  **Web App** `U+F268` — `omarchy-launch-floating-terminal-with-presentation omarchy-webapp-install`
  -  **Terminal** `U+F489`
    -  **Alacritty** `U+F489` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-terminal alacritty'` _(dimmed when installed)_
    -  **Foot** `U+F489` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-terminal foot'` _(dimmed when installed)_
    -  **Ghostty** `U+F489` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-terminal ghostty'` _(dimmed when installed)_
    -  **Kitty** `U+F489` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-install-terminal kitty'` _(dimmed when installed)_
  -  **TUI** `U+F489` — `omarchy-launch-floating-terminal-with-presentation omarchy-tui-install`
  - 󰍲 **Windows** `U+F0372` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-windows-vm install'` _(when-guarded; dimmed when installed)_
  - 󰣇 **AUR** `U+F08C7` — `xdg-terminal-exec --app-id=org.omarchy.terminal omarchy-pkg-aur-install`
  - 󰏓 **Preinstalls** `U+F03D3` — `omarchy-launch-floating-terminal-with-presentation omarchy-install-preinstalls` _(dimmed when installed)_
- 󰭌 **Remove** `U+F0B4C`
  - 󰣇 **Package** `U+F08C7` — `xdg-terminal-exec --app-id=org.omarchy.terminal omarchy-pkg-remove`
  - 󱚤 **AI** `U+F16A4`
    -  **Hermes Desktop** `U+E90A` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-hermes` _(when-guarded)_
    -  **ChatGPT Desktop** `U+E905` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-chatgpt` _(when-guarded)_
    -  **Claude Desktop** `U+E90E` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-claude` _(when-guarded)_
    -  **Grok Bot** `U+E904` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-grok-bot` _(when-guarded)_
    -  **LM Studio** `U+E906` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-lm-studio` _(when-guarded)_
    -  **Ollama** `U+E907` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-ollama` _(when-guarded)_
    -  **OpenClaw** `U+E90C` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-openclaw` _(when-guarded)_
    -  **Perplexity** `U+E90B` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-perplexity` _(when-guarded)_
    -  **T3 Code** `U+E908` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-ai-t3-code` _(when-guarded)_
  -  **Dictation** `U+EC12` _(when-guarded)_
    -  **Hex** `U+EC12` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-dictation-hex` _(when-guarded)_
    -  **Superwhisper** `U+EC12` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-dictation-superwhisper` _(when-guarded)_
    -  **Voxtype** `U+EC12` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-dictation-voxtype` _(when-guarded)_
  -  **Services** `U+F487`
    - 󰢁 **1Password** `U+F0881` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-service-1password` _(when-guarded)_
    -  **Dropbox** `U+E707` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-service-dropbox` _(when-guarded)_
    -  **Tailscale** `U+E90F` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-service-tailscale` _(when-guarded)_
    - 󰍲 **Microsoft** `U+F0372` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-service-microsoft` _(when-guarded)_
    - 󰣀 **SSH Agent** `U+F08C0` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-service-ssh-agent` _(when-guarded)_
  - 󰵮 **Development** `U+F0D6E`
    - 󰫏 **Ruby on Rails** `U+F0ACF` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env ruby'` _(when-guarded)_
    -  **JavaScript** `U+E781`
      -  **Node.js** `U+ED0D` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env node'` _(when-guarded)_
      -  **Bun** `U+E76F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env bun'` _(when-guarded)_
      -  **Deno** `U+E7C0` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env deno'` _(when-guarded)_
    -  **Go** `U+E627` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env go'` _(when-guarded)_
    -  **PHP** `U+E73D`
      -  **PHP** `U+E73D` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env php'` _(when-guarded)_
      -  **Laravel** `U+E73F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env laravel'` _(when-guarded)_
      -  **Symfony** `U+E757` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env symfony'` _(when-guarded)_
    -  **Python** `U+E73C` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env python'` _(when-guarded)_
    -  **Elixir** `U+E62D`
      -  **Elixir** `U+E62D` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env elixir'` _(when-guarded)_
      -  **Phoenix** `U+E860` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env phoenix'` _(when-guarded)_
    -  **Zig** `U+E8EF` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env zig'` _(when-guarded)_
    -  **Rust** `U+E7A8` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env rust'` _(when-guarded)_
    -  **Java** `U+E738` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env java'` _(when-guarded)_
    -  **.NET** `U+E77F` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env dotnet'` _(when-guarded)_
    -  **OCaml** `U+E84E` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env ocaml'` _(when-guarded)_
    -  **Clojure** `U+E768` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env clojure'` _(when-guarded)_
    -  **Scala** `U+E737` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-dev-env scala'` _(when-guarded)_
  - 󰸌 **Theme** `U+F0E0C` — `omarchy-theme-remove`
  -  **Gaming** `U+F11B`
    -  **Steam** `U+F1B6` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-steam` _(when-guarded)_
    -  **RetroArch** `U+F11B` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-retroarch` _(when-guarded)_
    - 󰍳 **Minecraft** `U+F0373` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-minecraft` _(when-guarded)_
    - 󰢹 **NVIDIA GeForce NOW** `U+F08B9` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-geforce-now` _(when-guarded)_
    -  **Xbox Cloud Gaming** `U+ED3E` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-xbox-cloud` _(when-guarded)_
    - 󰖺 **Xbox Controllers (󰂯)** `U+F05BA` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-xbox-controllers` _(when-guarded)_
    -  **Battle.net** `U+F835` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-battlenet` _(when-guarded)_
    -  **Lutris** `U+EF94` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-lutris` _(when-guarded)_
    - 󱓟 **Heroic (Epic Games)** `U+F14DF` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-gaming-heroic` _(when-guarded)_
  -  **Browser** `U+F268`
    -  **Chrome** `U+F268` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-browser chrome'` _(when-guarded)_
    - 󰇩 **Edge** `U+F01E9` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-browser edge'` _(when-guarded)_
    -  **Brave** `U+F268` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-browser brave'` _(when-guarded)_
    -  **Brave Origin** `U+F268` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-browser brave-origin'` _(when-guarded)_
    -  **Firefox** `U+F269` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-browser firefox'` _(when-guarded)_
    -  **Zen** `U+F269` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-remove-browser zen'` _(when-guarded)_
  -  **Web App** `U+F268` — `omarchy-webapp-remove` _(when-guarded)_
  -  **TUI** `U+F489` — `omarchy-tui-remove` _(when-guarded)_
  - 󰍲 **Windows** `U+F0372` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-windows-vm remove'` _(when-guarded)_
  - 󰏓 **Preinstalls** `U+F03D3` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-preinstalls` _(when-guarded)_
  -  **Security** `U+EB11`
    - 󰈷 **Fingerprint** `U+F0237` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-security-fingerprint` _(when-guarded)_
    -  **Fido2** `U+EB11` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-security-fido2` _(when-guarded)_
    - 󰣀 **SSHD** `U+F08C0` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-security-sshd` _(when-guarded)_
    - 󰡨 **Sudoless Docker** `U+F0868` — `omarchy-launch-floating-terminal-with-presentation omarchy-remove-security-sudoless-docker` _(when-guarded)_
-  **Update** `U+F021`
  -  **Omarchy** `U+E900` (omarchy font) — `omarchy-launch-floating-terminal-with-presentation omarchy-update`
  - 󰔫 **Channel** `U+F052B`
    - 🟢 **Stable** `U+1F7E2` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-channel-set stable'` _(✓ when current)_
    - 🟡 **RC** `U+1F7E1` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-channel-set rc'` _(✓ when current)_
    - 🟠 **Edge** `U+1F7E0` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-channel-set edge'` _(✓ when current)_
    - 🔴 **Dev** `U+1F534` — `omarchy-launch-floating-terminal-with-presentation 'omarchy-channel-set dev'` _(✓ when current)_
  -  **Kernel** `U+F17C` _(provider: kernels; when-guarded)_
  -  **Config** `U+E615`
    -  **Hyprland** `U+F359` — `omarchy-launch-floating-terminal-with-presentation omarchy-refresh-hyprland`
    -  **Hyprsunset** `U+F359` — `omarchy-launch-floating-terminal-with-presentation omarchy-refresh-hyprsunset`
    - 󱣴 **Plymouth** `U+F18F4` — `omarchy-launch-floating-terminal-with-presentation omarchy-refresh-plymouth`
    -  **Tmux** `U+F489` — `omarchy-launch-floating-terminal-with-presentation omarchy-refresh-tmux`
    - 󰍜 **Shell** `U+F035C` — `omarchy-launch-floating-terminal-with-presentation omarchy-refresh-shell`
  - 󰸌 **Extra Themes** `U+F0E0C` — `omarchy-launch-floating-terminal-with-presentation omarchy-theme-update` _(when-guarded)_
  -  **Process** `U+EBA2`
    -  **Hyprsunset** `U+F359` — `omarchy-restart-hyprsunset`
    - 󰍜 **Shell** `U+F035C` — `omarchy-restart-shell`
  - 󰇅 **Hardware** `U+F01C5`
    -  **Audio** `U+E638` — `omarchy-launch-floating-terminal-with-presentation omarchy-restart-audio`
    - 󱚾 **Wi-Fi** `U+F16BE` — `omarchy-launch-floating-terminal-with-presentation omarchy-restart-wifi`
    - 󰂯 **Bluetooth** `U+F00AF` — `omarchy-launch-floating-terminal-with-presentation omarchy-restart-bluetooth`
    - 󰟸 **Trackpad** `U+F07F8` — `omarchy-launch-floating-terminal-with-presentation omarchy-restart-trackpad`
  -  **Firmware** `U+EA78` — `omarchy-launch-floating-terminal-with-presentation omarchy-update-firmware`
  -  **Password** `U+EB11`
    -  **Drive Encryption** `U+EB11` — `omarchy-launch-floating-terminal-with-presentation omarchy-drive-password`
    -  **User** `U+EB11` — `omarchy-launch-floating-terminal-with-presentation passwd`
  -  **Timezone** `U+EB01` — `omarchy-menu-timezone`
  -  **Time** `U+E383` — `omarchy-launch-floating-terminal-with-presentation omarchy-update-time`
-  **About** `U+EA74` — `omarchy-launch-about`
-  **System** `U+F011`
  - 󱄄 **Screensaver** `U+F1104` — `omarchy-launch-screensaver force`
  -  **Lock** `U+F023` — `omarchy-system-lock`
  - 󰒲 **Suspend** `U+F04B2` — `systemctl suspend` _(when-guarded)_
  - 󰤁 **Hibernate** `U+F0901` — `systemctl hibernate` _(when-guarded)_
  - 󰍃 **Logout** `U+F0343` — `omarchy-system logout`
  - 󰜉 **Reboot** `U+F0709` — `omarchy-system reboot`
  - 󰐥 **Shutdown** `U+F0425` — `omarchy-system shutdown`

Menu providers that fill rows at runtime: `apps`, `fonts`, `languages`, `kernels` and `power-profiles` (`docs/menu.md:110-129`).

---

## 8. Notifications, OSD, lock, idle, terminals, fonts, app theming

### Notifications: `omarchy.notifications` (mako retired)

- Daemon: a Quickshell `NotificationServer` on `org.freedesktop.Notifications`. Cards sit in a deck at the **top-right** of the focused display and clear the bar when it is on the top or right edge (`docs/notifications.md:3`, `shell/plugins/notifications/Service.qml:66-77`).
- Width **380**. Cards are 6px apart, decks 11px apart. Border 2px, horizontal padding 12, icon slot 40 (`Service.qml:64,77,535`, `Toast.qml:28,229,250-264`).
- Inset from the screen edge = `Style.gapsOut`, which is **half** of Hyprland `gaps_out`, so 5px (`shell/Commons/Style.qml:13-19,393-403`).
- Type: title 14px bold, body 12px, meta 11px, source 12px demibold (`Toast.qml:321-454`).
- Timeouts: low 5 s, normal 8 s, critical until dismissed, capped at 30 s (`docs/notifications.md:33`).
- Colours: background and foreground. The border is the Hyprland active border, or accent; the countdown is accent. Corners follow Hyprland rounding (`default/themed/shell.toml.tpl:143-152`, `docs/notifications.md:80-82`).

### OSD: `omarchy.osd` (swayosd retired)

Bottom centre, 67px above the screen edge. Padding 16, gap 16, a 142×6 progress bar, border 2px, 28px icon and 14px value text. It stays up for 1200 ms (`shell/plugins/osd/Osd.qml:20,28-36,93,106,140-172`). Colours come from `[popups]`.

### Lock screen: `omarchy.lock` (hyprlock retired)

- A centred password field, **381×67**, with a 3px outline (`shell/plugins/lock/LockView.qml:24-26`).
- Text is 18px; the password dots are 21px (`:27-29`). Placeholder: "Enter Password" (`default/i18n/en/shell.json:316`).
- Background is the theme background at 0.8 over the current wallpaper, blurred (MultiEffect blur 1.0, blurMax 128, contrast −0.08) (`:124-150`).
- The border is the Hyprland active border, red on error. The plugin README says it "mirrors the previous lock screen field dimensions, colors, blurred wallpaper, placeholder".

### Idle: `omarchy.idle` (hypridle retired)

Screensaver at **150 s**, lock at **300 s** (`config/omarchy/shell.json:3-6`, `shell/plugins/services/idle/Service.qml:17-18`). The screensaver is the separate `omarchy-screensaver` package (`bin/omarchy-launch-screensaver:4`). I found no display power-off timer.

### Terminals

foot is the default (`default/xdg-terminal-exec/hyprland-xdg-terminals.list:3`); Alacritty, Ghostty and Kitty are selectable under Setup > Defaults > Terminal. All four ship **JetBrainsMono Nerd Font at size 9 with 14px padding** and a block cursor:

- foot: `font=JetBrainsMono Nerd Font:size=9`, `pad=14x14`, scrollback 10000 (`config/foot/foot.ini:4-15`).
- Alacritty: size 9, padding 14/14, `decorations = "None"` (`config/alacritty/alacritty.toml:9-18`).
- Ghostty: size 9, `window-padding-x/y = 14` (`config/ghostty/config:5-12`).
- Kitty: `font_size 9.0`, `window_padding_width 14`, powerline-slanted tab bar (`etc/xdg/kitty/kitty.conf`).

Opacity comes from the Hyprland rule (0.985 / 0.96). Glassy mode moves the transparency into each terminal's theme file instead (`bin/omarchy-theme-set-glass`).

### Fonts

- `monospace` → **JetBrainsMono Nerd Font** (package `ttf-jetbrains-mono-nerd-basic`). `sans-serif` and `system-ui` → Liberation Sans. `serif` → Liberation Serif. Noto CJK, Noto Naskh Arabic and Noto Color Emoji are fallbacks (`default/fontconfig/conf.avail/50-omarchy.conf:312-337,421-426`, `install/omarchy-base.packages:149`).
- The shell binds every surface to `monospace`, so changing the font (Appearance > Font, or `omarchy font set`) changes the whole desktop (`shell/Commons/Style.qml:267-277,510-536`).
- Private icon font `omarchy` (`default/fonts/omarchy/omarchy.ttf`): `U+E900` is the Omarchy logo and `U+E901`–`U+E91F` are AI-agent marks (`default/fonts/omarchy/README.md`).
- Optional installs: Cascadia Mono (CaskaydiaMono Nerd Font), Meslo, Fira Code, Victor, Bitstream Vera and Iosevka (`default/omarchy/omarchy-menu.jsonc:278-283`).
- Shell type scale from base 12: caption 10, body-small 11, body 12, subtitle 13, title 14, heading 16, display 24, display-large 28, icons 11/14/18 (`shell/Commons/Style.qml:329-340`).

### btop, Neovim, other apps

- btop: `color_theme = "current"`, `theme_background = true`, `rounded_corners = true`, braille graphs (`config/btop/btop.conf:5-38`). Its colours come from `btop.theme.tpl`: main_bg = background, hi_fg = accent, selected_bg = selection, selected_fg = accent, boxes in magenta, green, red and accent.
- Neovim: `omarchy-nvim` (LazyVim). Themes name a real colorscheme in `neovim.lua` (e.g. `tokyonight-night`). Otherwise `neovim.lua.tpl` configures `omacom/aether.nvim` from the palette (`default/themed/neovim.lua.tpl:1-30`).
- Also themed: Chromium, VS Code, Obsidian, Slack, Helix, fcitx5, tmux, keyboard RGB, gum, Claude, pi, Hermes and T3 Code.

### Cursor and icons

No custom cursor theme ("default"), size 24 (`default/hypr/envs.lua:8-9`). Icons: Yaru, in the variant from each theme's `icons.theme`, defaulting to Yaru-blue. GTK theme: Adwaita or Adwaita-dark (`bin/omarchy-theme-set-gnome:20-34`).

### Dock

Shown on floating workspaces only, at the bottom. Pinned apps: Nautilus, Chromium, foot, omacalc, omawrite, X, YouTube (`config/omarchy/shell.json:71-82`). Icons are 36px with a 6px inset and 3px gap. Pinned apps that aren't running sit at 0.7 opacity (`shell/plugins/dock/DockWindow.qml:50-57`).

---

## 9. Typography and spacing as shipped

Every shell dimension goes through `Style.space(px)`, which multiplies by `[spacing] scale` (1.0) and by `base-size / 12` (`shell/Commons/Style.qml:210-231`). The shell is therefore one scalable system. The values below are at the defaults.

### Typography

| where                                               | family                                 | sizes (px/pt)                                       | source                                                                                                        |
| --------------------------------------------------- | -------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Shell (bar, panels, menu, notifications, OSD, lock) | monospace -> JetBrainsMono Nerd Font   | 10/11/12/13/14/16/24/28 scale from base 12          | shell/Commons/Style.qml:271-341                                                                               |
| Bar labels                                          | monospace                              | 12                                                  | shell/Ui/WidgetButton.qml:11                                                                                  |
| Menu                                                | monospace (OMARCHY_MENU_FONT override) | rows 16, detail 11, header 16, icons 18             | shell/plugins/menu/Menu.qml:1413,1522,1564,1578                                                               |
| Notifications                                       | monospace                              | title 14 bold, body 12, meta 11, source 12 demibold | shell/plugins/notifications/Toast.qml:321-454                                                                 |
| OSD                                                 | monospace                              | icon 28, value 14                                   | shell/plugins/osd/Osd.qml:93,106                                                                              |
| Lock                                                | monospace                              | field 18, dots 21                                   | shell/plugins/lock/LockView.qml:27-29                                                                         |
| Hyprland groupbar                                   | monospace                              | 12                                                  | default/hypr/looknfeel.lua:43-44                                                                              |
| Terminals                                           | JetBrainsMono Nerd Font                | 9                                                   | config/foot/foot.ini:4; config/alacritty/alacritty.toml:13; config/ghostty/config:7; etc/xdg/kitty/kitty.conf |
| SDDM password                                       | JetBrainsMono Nerd Font                | 24                                                  | default/sddm/omarchy/Main.qml:92-93                                                                           |
| Plymouth                                            | Cantarell                              | 11                                                  | default/plymouth/omarchy.plymouth:10-11                                                                       |
| GTK/web sans                                        | Liberation Sans                        | —                                                   | default/fontconfig/conf.avail/50-omarchy.conf:312-319                                                         |

### Spacing, padding, radius

| where                | property                                                        | value                                                       | source                                                                                                               |
| -------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Hyprland             | gaps_in                                                         | 5                                                           | default/hypr/looknfeel.lua:8                                                                                         |
| Hyprland             | gaps_out                                                        | 10                                                          | default/hypr/looknfeel.lua:9                                                                                         |
| Hyprland             | border_size                                                     | 2                                                           | default/hypr/looknfeel.lua:10                                                                                        |
| Hyprland             | rounding                                                        | 0 (6 with corners-rounded or Solitude; 8 on popped windows) | default/hypr/looknfeel.lua:25; default/hypr/toggles/corners-rounded.lua; default/hypr/apps/system.lua:33             |
| Hyprland groupbar    | height / gaps_in / indicator                                    | 22 / 5 / 1                                                  | default/hypr/looknfeel.lua:47-50                                                                                     |
| Shell                | cornerRadius                                                    | = Hyprland rounding (0)                                     | shell/Commons/Style.qml:13,33,383-391                                                                                |
| Shell                | gapsOut (panel/notification inset from screen edge)             | = Hyprland gaps_out / 2 (5)                                 | shell/Commons/Style.qml:13-19,34,393-403                                                                             |
| Shell spacing scale  | xxs/xs/sm/md/lg/xl/xxl/xxxl/huge                                | 2/3/4/6/8/10/12/14/18                                       | shell/Commons/Style.qml:236-245                                                                                      |
| Shell controls       | control-gap / padding-x / padding-y / input-padding-y / height  | 8 / 10 / 6 / 7 / 28                                         | shell/Commons/Style.qml:247-251                                                                                      |
| Shell rows           | popup-row-height / row-gap / row-padding-x / label-gap          | 28 / 8 / 12 / 4                                             | shell/Commons/Style.qml:252,257-259                                                                                  |
| Shell panels         | panel-gap / panel-padding / popup-padding                       | 14 / 18 / 14                                                | shell/Commons/Style.qml:260-262                                                                                      |
| Shell widths         | dropdown / searchable-dropdown / number-field                   | 240 / 260 / 120                                             | shell/Commons/Style.qml:253-255                                                                                      |
| Shell controls       | border width normal/hover/focus/selected                        | 1 / 1 / 1 / 0                                               | shell/Commons/Style.qml:79-82                                                                                        |
| Shell controls       | fill alpha normal/hover/selected/pressed/selection              | 0.04 / 0.08 / 0.18 / 0.22 / 0.35                            | shell/Commons/Style.qml:84-89                                                                                        |
| Bar                  | height (horizontal / vertical)                                  | 26 / 28                                                     | shell/Commons/Style.qml:344-345                                                                                      |
| Bar                  | edge padding left/right                                         | 8                                                           | shell/plugins/bar/Bar.qml:1948,1957                                                                                  |
| Bar                  | icon size / canvas / slot / status slot                         | 12 / 16 / 27 / 21                                           | shell/Commons/Style.qml:353-357                                                                                      |
| Bar workspaces       | button width / spacing / margin / padding                       | 20 / 1 / 6 / 6                                              | shell/plugins/bar/widgets/Workspaces.qml:252,275-277                                                                 |
| Bar widget button    | horizontal margin / vertical padding                            | 8.5 / 6                                                     | shell/Ui/WidgetButton.qml:15-16                                                                                      |
| Menu card            | width / wide width                                              | 300 / 520                                                   | shell/plugins/menu/Menu.qml:138                                                                                      |
| Menu card            | padding / header / row / row+detail / row spacing / border      | 18 / 34 / 50 / 58 / 3 / 2                                   | shell/plugins/menu/Menu.qml:117,126-134                                                                              |
| Menu row             | icon column / icon left inset                                   | 36 / 8                                                      | shell/plugins/menu/Menu.qml:1523-1527                                                                                |
| App grid             | icon / cell width / cell padding / gutter / screen margin       | 56 / 123 / 8 / 4 / 40                                       | shell/plugins/dock/AppGrid.qml:32-45                                                                                 |
| Notifications        | width / card gap / deck gap / border / padding-x / icon slot    | 380 / 6 / 11 / 2 / 12 / 40                                  | shell/plugins/notifications/Service.qml:64,77,535; shell/plugins/notifications/Toast.qml:28,229,250-264              |
| OSD                  | padding / gap / bar width / bar height / bottom offset / border | 16 / 16 / 142 / 6 / 67 / 2                                  | shell/plugins/osd/Osd.qml:28-35,142-144,172                                                                          |
| Lock                 | field width / height / outline / text inset                     | 381 / 67 / 3 / 18                                           | shell/plugins/lock/LockView.qml:24-26,157-160                                                                        |
| Dock                 | icon / inset / gap                                              | 36 / 6 / 3                                                  | shell/plugins/dock/DockWindow.qml:50-55                                                                              |
| Popup card (default) | content width / height                                          | 280 / 200                                                   | shell/Ui/PopupCard.qml:15-16                                                                                         |
| Terminals            | padding                                                         | 14 (foot, alacritty, ghostty, kitty)                        | config/foot/foot.ini:5; config/alacritty/alacritty.toml:16-17; config/ghostty/config:11-12; etc/xdg/kitty/kitty.conf |
| Floating windows     | default size                                                    | 875x600                                                     | default/hypr/apps/system.lua:4                                                                                       |

**Consistency verdict:**

- **Consistent:** one font family everywhere, one type scale, one spacing scale (2/3/4/6/8/10/12/14/18), 2px card borders everywhere, radius always equal to Hyprland rounding, and the screen-edge inset always half of gaps_out.
- **Outliers:**
  - Terminals use size 9, a different unit from the 12px shell base.
  - Lock field dimensions are fixed (381×67), copied from hyprlock and not scaled.
  - Menu row labels are 16px, larger than any other shell body text.
  - The OSD bottom offset (67) and the notification width (380) are one-off numbers.
  - Plymouth uses Cantarell.

---

## 10. Default apps, web apps, boot and login

**Base install** (`install/omarchy-base.packages`):

| Category           | Apps                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| Core desktop       | Chromium, Nautilus, foot, nvim (omarchy-nvim)                                |
| Viewers and office | imv, mpv, Evince, LibreOffice                                                |
| Writing and notes  | Obsidian, omawrite, omacalc, omacut                                          |
| System and dev     | btop, lazygit, tmux, herdr                                                   |
| Capture            | omasnap, grim, slurp, gpu-screen-recorder, hyprpicker                        |
| Other              | LocalSend, moonlight-qt, Pinta, cliamp (music TUI), Docker, superwhisper-bin |

**Desktop-entry web apps** (`applications/*.desktop`): Basecamp, Discord, Google Contacts, Google Maps, Google Messages, Google Photos, HEY, WhatsApp, X, YouTube, Zoom.

**Web apps reachable only by binding:** ChatGPT, Grok, HEY Calendar, X Post (`default/hypr/bindings/applications.lua:26-37`).

Spotify, Signal and 1Password launchers are bound, but those apps are optional installs from the menu.

**Boot and login:**

- Plymouth theme "Omarchy" (script) on `#1a1b26`, Cantarell 11, with logo, progress bar and lock assets (`default/plymouth/omarchy.plymouth`, `default/plymouth/omarchy.script:3-4`). Appearance > Unlock swaps in a theme's `unlock.png` and colours (`bin/omarchy-plymouth-set-by-theme`).
- SDDM theme `omarchy` (QML) on `#1a1b26`, with the password in JetBrainsMono Nerd Font 24px and letter-spacing 5 (`etc/sddm.conf.d/10-theme.conf`, `default/sddm/omarchy/Main.qml:8,92-94`).
- At login, a black cover fades bar and wallpaper in together over 420 ms, and an intro video plays if the background has one (`docs/theming.md:13`).

**Logo and screensaver:**

- `logo.txt` is a nine-line OMARCHY wordmark in block characters. `icon.txt` is the square mark.
- Both seed `~/.config/omarchy/branding/{about,screensaver}.txt`, editable under Appearance > Branding. fastfetch shows `about.txt` in green (`docs/file-layout.md:146-149`, `etc/fastfetch/config.jsonc:3-11`).
- The screensaver is the separate `omarchy-screensaver` binary.

---

## 11. Omarchui's assumptions, checked

| claim                                                                                       | verdict   | actual                                                                                                                                                                                                                     | source                                                                                                                              |
| ------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Hyprland gaps_in = 5                                                                        | **true**  | 5                                                                                                                                                                                                                          | default/hypr/looknfeel.lua:8                                                                                                        |
| Hyprland gaps_out = 10                                                                      | **true**  | 10                                                                                                                                                                                                                         | default/hypr/looknfeel.lua:9                                                                                                        |
| Hyprland border_size = 2                                                                    | **true**  | 2                                                                                                                                                                                                                          | default/hypr/looknfeel.lua:10                                                                                                       |
| Hyprland rounding = 0                                                                       | **true**  | 0 by default; Solitude theme sets 6; corners-rounded toggle sets 6                                                                                                                                                         | default/hypr/looknfeel.lua:25; themes/solitude/hyprland.lua                                                                         |
| Default font is CaskaydiaMono Nerd Font                                                     | **FALSE** | JetBrainsMono Nerd Font (monospace alias; terminals size 9). Cascadia Mono is only an optional install under Install > Style > Font                                                                                        | default/fontconfig/conf.avail/50-omarchy.conf:330-337; config/foot/foot.ini:4; default/omarchy/omarchy-menu.jsonc:278               |
| Launcher is Walker                                                                          | **FALSE** | Walker/Elephant retired; Super+Space opens the Quickshell Omarchy menu (Apps row + app search), Super+Alt+Space the dock app grid                                                                                          | bin/omarchy-upgrade-to-quattro:883-896,910,921; default/hypr/bindings/utilities.lua:1-2                                             |
| Notifications are mako                                                                      | **FALSE** | omarchy-shell notifications plugin (Quickshell NotificationServer); mako retired                                                                                                                                           | docs/notifications.md:3; bin/omarchy-upgrade-to-quattro:907                                                                         |
| OSD is swayosd                                                                              | **FALSE** | omarchy-shell plugin omarchy.osd; swayosd retired                                                                                                                                                                          | shell/plugins/README.md:39; bin/omarchy-upgrade-to-quattro:920                                                                      |
| Super+Return opens a terminal                                                               | **true**  | Terminal (omarchy-launch-terminal, foot by default)                                                                                                                                                                        | default/hypr/bindings/applications.lua:2                                                                                            |
| Super+Space opens the launcher                                                              | **FALSE** | Super+Space opens the Omarchy menu (root); there is no separate launcher, though the menu's Apps row and search cover apps                                                                                                 | default/hypr/bindings/utilities.lua:1; manual/07-hotkeys.md:9                                                                       |
| Super+Alt+Space opens the Omarchy menu                                                      | **FALSE** | Super+Alt+Space opens 'Apps', the dock's app grid (omarchy-shell omarchy.dock apps)                                                                                                                                        | default/hypr/bindings/utilities.lua:2; manual/07-hotkeys.md:10                                                                      |
| Super+W closes the window                                                                   | **true**  | Close window (Super+Q does the same)                                                                                                                                                                                       | default/hypr/bindings/tiling.lua:1-2                                                                                                |
| Super+K shows keybindings                                                                   | **true**  | omarchy-menu-keybindings                                                                                                                                                                                                   | default/hypr/bindings/utilities.lua:10                                                                                              |
| Super+Escape opens the system/power menu                                                    | **true**  | System menu (menu route 'system'); XF86PowerOff too                                                                                                                                                                        | default/hypr/bindings/utilities.lua:8-9                                                                                             |
| Super+1..9 switch workspaces                                                                | **true**  | Super+1..9 and Super+0 (workspace 10), per monitor                                                                                                                                                                         | default/hypr/bindings/tiling.lua:24-29                                                                                              |
| Super+Shift+1..9 move the window                                                            | **true**  | Super+Shift+1..0 move and follow; Super+Shift+Alt+1..0 move silently                                                                                                                                                       | default/hypr/bindings/tiling.lua:27-28                                                                                              |
| Waybar with persistent workspaces 1-5                                                       | **FALSE** | No Waybar (retired). The Quickshell bar does always show workspaces 1-5 of each monitor                                                                                                                                    | bin/omarchy-upgrade-to-quattro:925; shell/plugins/bar/widgets/Workspaces.qml:79-84                                                  |
| Bar clock format "%A %H:%M"                                                                 | **true**  | "dddd HH:mm" in Qt date syntax, which renders the same (e.g. 'Sunday 14:30'); alt format "d MMMM 'W'ww yyyy"                                                                                                               | config/omarchy/shell.json:27-28                                                                                                     |
| Menu top level = Apps, Learn, Trigger, Style, Setup, Install, Remove, Update, About, System | **FALSE** | Apps, Learn, Appearance, Trigger, Setup, Install, Remove, Update, About, System. 'Style' is renamed 'Appearance' (style survives as an alias) and sits before Trigger                                                      | default/omarchy/omarchy-menu.jsonc:24-33                                                                                            |
| Setup TUIs: Wiremix (audio), Impala (wifi), bluetui (bluetooth)                             | **FALSE** | All three retired. Audio, Wi-Fi and Bluetooth are shell panels on the bar (Super+Ctrl+A / N / B); Setup has Keyboard, Input, Language, Network (DNS, QR), Defaults, Plugins, Security, Config, Direct Boot, Reset Computer | bin/omarchy-upgrade-to-quattro:878,901,929; default/hypr/bindings/utilities.lua:113-118; default/omarchy/omarchy-menu.jsonc:182-266 |

**Net change for Omarchui:**

- The Hyprland geometry numbers and the core window/workspace bindings are right.
- Replace the component names (Waybar, Walker, mako, swayosd) with the Quickshell shell.
- Swap the Super+Space and Super+Alt+Space semantics.
- Rename Style to Appearance and move it before Trigger.
- Drop the three Setup TUIs.
- Change the font to JetBrainsMono Nerd Font.

### What could not be determined from the source

- **Display power-off (DPMS) idle timeout.** the idle service only has screensaver (150 s) and lock (300 s) timers
- **Whether new users start with window-no-gaps and single-window-aspect-ratio active.** docs/file-layout.md:126-127 lists both toggles as seeded into /etc/skel/.local/state/omarchy/toggles/hypr/, which would mean gaps 0 and border 0 on a fresh install; but omarchy-refresh-hyprland:13-14 and the quattro upgrade (bin/omarchy-upgrade-to-quattro:2063-2066) reset the directory to flags.lua only. The PKGBUILD that decides this lives in the separate omarchy-pkgs repo.
- **Exact rendered pixel output.** every shell dimension is multiplied by [spacing] scale x (base-size / 12); values here are at the default 12px base and scale 1.0
- **Which of logo.txt / icon.txt seeds about.txt vs screensaver.txt.** docs/file-layout.md:146-149 maps both pairs without saying which goes where
