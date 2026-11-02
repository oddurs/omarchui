# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Reference mode in the demo (dock button or Alt+Ctrl+R): hover any part of the desktop to compare its rendered size with Omarchy's value and source line, or with the tuned token. Click pins the card.
- The demo's Omarchy menu is Omarchy 4's real tree: all 423 entries in order, search across the whole tree, toggle pairs that follow demo state, and links and shortcut hints taken from the commands Omarchy runs.
- The Keybindings app lists all 257 of Omarchy 4's bindings beside the tuned grammar, marking those that work in the demo.
- The stock view matches more of Omarchy 4: menu card width and label size, accent text on the selected row, notification width and title, overlay track and position, lock field size, the bar's widgets in shell.json order, and the layout glyph on the active workspace.

### Fixed

- Key caps read as printed (Super, Return, Esc) instead of in capitals.
- The stock bar draws a layout glyph on the active workspace that no longer duplicates the menu logo.
- Phones: the demo dock is one row, the System and Omarchy navs fold behind a disclosure, keyboard-only hints hide, the bar sample clips instead of overlapping its clock, and the footer links to every page.
- The hero's "press D" hint sits inside its sentence; long theme names wrap instead of truncating; type sizes on the Type page read in pixels.
- Menus, notifications, the volume overlay and the bar rule had no border in either view: StyleX drops border shorthands built from variables without an error. Borders are now longhand, and a test rejects the shorthand.
- In split view, the live screen's menus and toasts drew over the stock half. Each screen now isolates its own stacking.
- Menu rows shrank below their height when the list scrolled.

### Added

- The exposition at `/`: the tuning's rules against Omarchy 4 as shipped, colour roles for all 23 themes, type, space, parts and keybindings, each with stock beside tuned.
- A desktop demo at `/demo`: dwindle tiling, workspaces, a shell, editor, btop, lazygit, the Omarchy menu, notifications, a lock screen and a before/after divider.
- The design system and its reference at `/system`: tokens, primitives, components and shell parts with live examples, generated prop tables and accessibility notes.
- `/omarchy`: a cited map of Omarchy 4's interface read from its source, and the research behind it in `research/omarchy`.
