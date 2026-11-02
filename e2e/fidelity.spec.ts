// Measures the stock view against research/omarchy/spec/*.json, Omarchy's values read from
// source at a pinned commit. Each failure names the spec id and the path:line it came from.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { OMARCHY_PALETTES } from "../lib/themes.generated";

type Item = { id: string; value: string | number; source?: string };
type Spec = { items?: Item[]; [part: string]: unknown };

const load = (file: string) => JSON.parse(readFileSync(path.join(process.cwd(), "research/omarchy/spec", `${file}.json`), "utf8")) as Spec;
const SPECS = { bar: load("bar"), menu: load("menu"), services: load("services"), windows: load("windows"), panels: load("panels") };

/** A numeric value from a spec file, with its citation for the failure message. */
function spec(file: keyof typeof SPECS, id: string, part?: string): { n: number; why: string } {
  const doc = part ? (SPECS[file][part] as Spec) : SPECS[file];
  const it = doc.items?.find((i) => i.id === id);
  if (!it) throw new Error(`no ${id} in research/omarchy/spec/${file}.json`);
  return { n: Number(it.value), why: `${id} (${it.source ?? "no source"})` };
}

// Tokyo Night is Omarchy's default theme, and the one whose own shell.lock.toml changes the lock.
const THEME = "tokyo-night";
const O = OMARCHY_PALETTES[THEME];
const rgb = (hex: string, alpha?: number) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return alpha === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
const o = (k: string) => {
  const v = O[k];
  if (!v) throw new Error(`no ${k} in OMARCHY_PALETTES`);
  return v;
};

async function stock(page: Page, locked = false) {
  await page.addInitScript((slug) => window.localStorage.setItem("omarchui-theme", slug), THEME);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const pw = page.getByRole("dialog", { name: "Boot" }).getByLabel("Password");
  await pw.fill("anything");
  await pw.press("Enter");
  await expect(page.getByRole("dialog", { name: "Boot" })).toHaveCount(0, { timeout: 15_000 });
  await page.getByRole("region", { name: "Demo controls" }).getByRole("radio", { name: "Stock" }).click();
  const screen = page.locator("[data-mode=stock]");
  await expect(screen).toHaveCount(1);
  if (locked) {
    // Super+Ctrl+L locks; Alt stands in for Super in the browser.
    await page.keyboard.press("Alt+Control+l");
    await expect(page.getByRole("dialog", { name: "Lock screen" })).toBeVisible();
  }
  return screen;
}

const box = async (l: Locator) => {
  const b = await l.boundingBox();
  if (!b) throw new Error("not rendered");
  return b;
};
/** A computed style once the element's transitions and animations have finished. */
const css = (l: Locator, prop: string) =>
  l.evaluate(async (e, p) => {
    await Promise.all(e.getAnimations().map((a) => a.finished.catch(() => undefined)));
    return getComputedStyle(e).getPropertyValue(p);
  }, prop);

/** Computed colours come back as rgb(), rgba() or color(srgb ...) depending on how they were written. */
function channels(c: string): number[] {
  const srgb = /^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/.exec(c);
  if (srgb) return [...srgb.slice(1, 4).map((v) => Number(v) * 255), Number(srgb[4] ?? 1)];
  const m = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(c);
  if (!m) throw new Error(`unparsed colour ${c}`);
  return [...m.slice(1, 4).map(Number), Number(m[4] ?? 1)];
}
async function expectColour(l: Locator, prop: string, want: string, why: string) {
  const got = channels(await css(l, prop));
  const exp = channels(want);
  got.forEach((v, i) =>
    expect(Math.abs(v - (exp[i] ?? 0)), `${why}: ${prop} is ${got.join(",")}, want ${exp.join(",")}`).toBeLessThanOrEqual(i === 3 ? 0.01 : 1),
  );
}

test.describe("the stock view matches Omarchy's source", () => {
  test("bar", async ({ page }) => {
    const screen = await stock(page);
    const bar = screen.locator("[data-ref=bar]");
    const b = await box(bar);
    const h = spec("bar", "bar.height");
    expect(b.height, h.why).toBe(h.n);
    await expectColour(bar, "background-color", rgb(o("--o-background")), "bar.background (shell/Commons/Color.qml:80)");
    expect(await css(bar, "color"), "bar.text (shell/Commons/Color.qml:81)").toBe(rgb(o("--o-foreground")));

    // The clock is centred on the full bar width, whatever sits beside it. Bar.qml:2360.
    const clock = await box(screen.locator("[data-ref=clock]"));
    expect(Math.abs(clock.x + clock.width / 2 - b.width / 2), spec("bar", "bar.center.x").why).toBeLessThanOrEqual(1);
    expect(await css(screen.locator("[data-ref=clock]"), "font-size"), spec("bar", "font.body").why).toBe(`${spec("bar", "font.body").n}px`);
    expect(await css(screen.locator("[data-ref=clock]"), "font-weight"), spec("bar", "font.weight").why).toBe(String(spec("bar", "font.weight").n));

    // Menu button at the 8px inset, 27 wide; workspaces 20 wide, 1px apart. Workspaces.qml:252,275-277.
    const ws = screen.locator("[data-ref=workspace]");
    const [w1, w2] = [await box(ws.nth(0)), await box(ws.nth(1))];
    const inset = spec("bar", "bar.edgePadding.left");
    const slot = spec("bar", "slot.icon");
    expect(w1.x, `${inset.why} + ${slot.why}`).toBe(inset.n + slot.n);
    expect(w1.width, "workspace button width (Workspaces.qml:252)").toBe(20);
    expect(w2.x - w1.x, "workspace spacing (Workspaces.qml:275-277)").toBe(21);
    await expect(ws, "buttons 1-5 always show (Workspaces.qml:17)").toHaveCount(5);

    // The right group ends 8px from the edge, each widget in a 27px slot with no gap.
    const right = screen.locator("[data-panel=power]");
    const p = await box(right);
    expect(b.width - (p.x + p.width), spec("bar", "bar.edgePadding.right").why).toBe(spec("bar", "bar.edgePadding.right").n);
    expect(p.width, slot.why).toBe(slot.n);
    expect(await css(right, "color"), "the battery is never tinted (bar.json omarchy.power)").toBe(rgb(o("--o-foreground")));
  });

  test("menu", async ({ page }) => {
    const screen = await stock(page);
    await page.keyboard.press("Alt+Space");
    const card = screen.locator("[data-ref=menu]");
    await expect(card).toBeVisible();
    const c = await box(card);
    expect(c.width, spec("menu", "menu.card.width").why).toBe(spec("menu", "menu.card.width").n);
    expect(await css(card, "border-top-width"), spec("menu", "menu.card.border.width").why).toBe(`${spec("menu", "menu.card.border.width").n}px`);
    expect(await css(card, "padding-top"), spec("menu", "menu.card.padding").why).toBe(`${spec("menu", "menu.card.padding").n}px`);
    await expectColour(card, "background-color", rgb(o("--o-background")), "menu.card.background (shell.toml.tpl:176-177)");
    // Centred on the whole screen, bar included. Menu.qml:1278-1312.
    expect(Math.abs(c.x + c.width / 2 - 720), spec("menu", "menu.card.position.x").why).toBeLessThanOrEqual(1);
    expect(Math.abs(c.y + c.height / 2 - 450), spec("menu", "menu.card.position.y").why).toBeLessThanOrEqual(1);

    const input = screen.getByRole("combobox");
    await expect(input, "placeholder 'Go…' (Menu.qml:1417-1428)").toHaveAttribute("placeholder", "Go…");

    const rows = screen.getByRole("option");
    await expect(rows, spec("menu", "menu.root.rows").why).toHaveCount(10);
    const [r1, r2] = [await box(rows.nth(0)), await box(rows.nth(1))];
    expect(r1.height, "row.height.base (Menu.qml:129)").toBe(50);
    expect(r2.y - (r1.y + r1.height), "row.spacing (Menu.qml:134)").toBe(3);
    const sel = rows.nth(0);
    await expectColour(sel, "background-color", rgb(o("--o-foreground"), 0.08), "cursor fill: foreground at 0.08 (Menu.qml:1501-1502)");
    expect(await css(sel, "box-shadow"), "selected border width resolves to 0 (Menu.qml:122)").toBe("none");
    const label = sel.getByText("Apps", { exact: true });
    expect(await css(label, "font-size"), "label 16px (Menu.qml:1562)").toBe("16px");
    expect(await css(label, "font-weight"), "label Medium (Menu.qml:1562)").toBe("500");
    expect(await css(label, "color"), "selected text is accent (shell.toml.tpl:185)").toBe(rgb(o("--o-accent")));

    // Up on the first row wraps to the last. Menu.qml:807-818.
    await page.keyboard.press("ArrowUp");
    await expect(rows.nth(9), "key.up-down wraps (Menu.qml:807-818)").toHaveAttribute("aria-selected", "true");

    // Search shows the path as an 11px detail line; rows grow to 58. Then Escape clears first.
    await input.fill("qr code");
    await expect(rows).toHaveCount(2);
    expect((await box(rows.nth(0))).height, "row.height.detail (Menu.qml:130)").toBe(58);
    const detail = rows.nth(0).getByText("Trigger › Capture", { exact: true });
    expect(await css(detail, "font-size"), "detail 11px (Menu.qml:1575)").toBe("11px");
    expect(Number(await css(detail, "opacity")), "detail opacity (Menu.qml:1576)").toBeCloseTo(0.52);
    const frozen = (await box(card)).y;
    expect(frozen, "the card's top freezes at the first keystroke (menu.card.position.y)").toBe(c.y);
    await page.keyboard.press("Escape");
    await expect(input, "key.escape clears the filter first (Menu.qml)").toHaveValue("");
    await expect(card).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card).toHaveCount(0);
  });

  test("notification", async ({ page }) => {
    const screen = await stock(page);
    const toast = screen.locator("[data-ref=toast]").first();
    await expect(toast).toBeVisible();
    await css(toast, "opacity"); // let the arrival animation land
    const t = await box(toast);
    const w = spec("services", "toast.width", "notifications");
    expect(t.width, w.why).toBe(w.n);
    const right = spec("services", "toast.offset.right", "notifications");
    expect(1440 - (t.x + t.width), right.why).toBe(right.n);
    const top = spec("services", "toast.offset.top", "notifications");
    expect(t.y, top.why).toBe(top.n);
    const bw = spec("services", "toast.border.width", "notifications");
    expect(await css(toast, "border-top-width"), bw.why).toBe(`${bw.n}px`);
    await expectColour(toast, "border-top-color", rgb(o("--o-active-border")), "toast.border: active border, else accent");
  });

  test("volume OSD", async ({ page }) => {
    const screen = await stock(page);
    // The audio widget's wheel steps the volume, which shows the OSD.
    await screen.locator("[data-panel=audio]").hover();
    await page.mouse.wheel(0, -100);
    const osd = screen.locator("[data-ref=osd]");
    await expect(osd).toBeVisible();
    const b = await box(osd);
    const h = spec("services", "osd.height", "osd");
    expect(b.height, h.why).toBe(h.n);
    const bottom = spec("services", "osd.position.bottom", "osd");
    expect(900 - (b.y + b.height), bottom.why).toBe(bottom.n);
    expect(Math.abs(b.x + b.width / 2 - 720), "centred horizontally (Osd.qml:140-141)").toBeLessThanOrEqual(1);
    const track = osd.locator("span").nth(1);
    const tw = spec("services", "osd.track.width", "osd");
    const th = spec("services", "osd.track.height", "osd");
    const tb = await box(track);
    expect(tb.width, tw.why).toBe(tw.n);
    expect(tb.height, th.why).toBe(th.n);
    await expect(osd, "the level reads N% (OsdModel.js:45)").toContainText(/\d+%/);
  });

  test("lock", async ({ page }) => {
    const screen = await stock(page, true);
    const field = screen.getByLabel("Password");
    const f = await box(field);
    const w = spec("services", "lock.field.width", "lock");
    const h = spec("services", "lock.field.height", "lock");
    const bw = spec("services", "lock.field.border.width", "lock");
    expect(f.width, w.why).toBe(w.n);
    expect(f.height, h.why).toBe(h.n);
    expect(await css(field, "border-top-width"), bw.why).toBe(`${bw.n}px`);
    await expect(field, "lock.placeholder.text (default/i18n/en/shell.json:316)").toHaveAttribute("placeholder", "Enter Password");
    // Tokyo Night's shell.lock.toml sets the outline to its foreground.
    await expectColour(field, "border-top-color", rgb(o("--o-lock-border")), "themes/tokyo-night/shell.lock.toml:5");
    expect(o("--o-lock-border"), "themes/tokyo-night/shell.lock.toml:5").toBe("#a9b1d6");
    expect(Math.abs(f.x + f.width / 2 - 720), "lock.field.position centre").toBeLessThanOrEqual(1);
    await expect(screen.getByText(/^\d{1,2}:\d{2}/), "lock.clock absent (LockView.qml:105-263)").toBeHidden();
  });

  test("background and picker", async ({ page }) => {
    const screen = await stock(page);
    // The theme's first background, scaled to cover. omarchy-theme-set:186-196, BackgroundMedia.qml:38-47.
    const wall = screen.locator("[data-wallpaper] > div").last();
    expect(await css(wall, "background-image"), "theme.first-run: 0-liftoff.webp").toContain("0-liftoff.webp");
    expect(await css(wall, "background-size"), "bg.render.fill PreserveAspectCrop").toBe("cover");

    // Super+Ctrl+W opens the background picker on the background in use. utilities.lua:14-15.
    await page.keyboard.press("Alt+Control+w");
    const picker = screen.getByRole("listbox", { name: "Backgrounds" });
    await expect(picker).toBeFocused();
    const options = picker.getByRole("option");
    await expect(options, "tokyo-night ships 9 backgrounds").toHaveCount(9);
    const [card, slice, next] = [await box(options.nth(0)), await box(options.nth(1)), await box(options.nth(2))];
    expect([card.width, card.height], "picker.layout card 768x475 (ImagePicker.qml:58-59)").toEqual([768, 475]);
    expect([slice.width, slice.height], "picker.layout slice 108x432 (ImagePicker.qml:60-61)").toEqual([108, 432]);
    expect(next.x - slice.x, "slice step = 108 + spacing -30 (ImagePicker.qml:62)").toBe(78);
    expect(slice.x - (card.x + card.width), "first slice overlaps the card by 30").toBe(-30);

    // Enter on another background reveals it; the picker closes.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(picker).toHaveCount(0);
    // The swap waits for the image to decode, as Omarchy's does; that includes fetching it.
    await expect.poll(() => css(screen.locator("[data-wallpaper] > div").last(), "background-image"), { timeout: 30_000 }).toContain("1-winding-road.webp");
  });

  test("notification deck", async ({ page }) => {
    const screen = await stock(page);
    await page.keyboard.press("Alt+Enter");
    const term = screen.getByRole("textbox", { name: "Terminal input" });
    for (const m of ["One", "Two", "Three", "Four"]) {
      await term.fill(`notify-send "${m}" "body"`);
      await term.press("Enter");
    }
    const cards = screen.locator("[data-ref=toast]");
    // The welcome card, and three of the four in a closed deck.
    await expect(cards).toHaveCount(4);
    const front = screen.getByRole("status", { name: "notify-send: Four" });
    await css(front, "opacity");
    const peek = spec("services", "toast.deck.peek", "notifications");
    const fb = await box(front);
    // Card r of a closed deck sits r*10px lower, scaled 1 - 0.035r about its top centre, at 0.85 then 0.55.
    for (const [name, r, opacity] of [
      ["Three", 1, 0.85],
      ["Two", 2, 0.55],
    ] as const) {
      // Back cards are hidden from assistive tech, so find them by label rather than role.
      const holder = screen.locator(`[data-ref=toast][aria-label="notify-send: ${name}"]`).locator("..");
      const b = await box(holder);
      expect(b.y - fb.y, `${peek.why}, card ${r}`).toBeCloseTo(r * peek.n, 0);
      expect(b.width / fb.width, "toast.deck.shrink (Layout.js:7,58)").toBeCloseTo(1 - r * 0.035, 2);
      expect(Number(await css(holder, "opacity")), "toast.deck.opacity (Layout.js:9,59)").toBeCloseTo(opacity, 2);
    }
    await expect(screen.getByRole("status", { name: "notify-send: One" }), "toast.deck.visible: 3 cards").toHaveCount(0);

    // Decks are 11px apart; the welcome card is a deck of its own below.
    const welcome = await box(screen.getByRole("status", { name: /Welcome/ }));
    const gap = spec("services", "toast.deck.deckGap", "notifications");
    expect(welcome.y - (fb.y + fb.height + 2 * peek.n), gap.why).toBeCloseTo(gap.n, 0);

    // Hovering opens the deck: every card, 6px apart.
    await front.hover();
    await expect(screen.getByRole("status", { name: "notify-send: One" })).toBeVisible();
    // Opening moves cards; it must not replay their arrival.
    const replaying = await screen
      .getByRole("status", { name: "notify-send: Three" })
      .evaluate((e) => e.getAnimations().filter((x) => x.playState === "running").length);
    expect(replaying, "anim.expandCollapse moves cards, it does not re-drop them").toBe(0);
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((x) => x.effect?.getTiming().iterations !== Infinity)
          .map((x) => x.finished.catch(() => undefined)),
      ),
    );
    const [a, b] = [
      await box(screen.getByRole("status", { name: "notify-send: Four" })),
      await box(screen.getByRole("status", { name: "notify-send: Three" })),
    ];
    const open = spec("services", "toast.deck.gap", "notifications");
    expect(b.y - (a.y + a.height), open.why).toBeCloseTo(open.n, 0);
  });

  test("windows", async ({ page }) => {
    const screen = await stock(page);
    for (let i = 0; i < 3; i++) await page.keyboard.press("Alt+Enter");
    const wins = screen.locator("section[aria-label=Terminal]");
    await expect(wins).toHaveCount(3);
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((x) => x.effect?.getTiming().iterations !== Infinity)
          .map((x) => x.finished.catch(() => undefined)),
      ),
    );
    const [a, b, c] = [await box(wins.nth(0)), await box(wins.nth(1)), await box(wins.nth(2))];
    const gin = spec("windows", "gaps.in", "layout");
    const gout = spec("windows", "gaps.out", "layout");
    // Side by side, then the right tile stacked: force_split 2, w > h. looknfeel.lua:97.
    expect(b.x - (a.x + a.width), `2 x ${gin.why}`).toBeCloseTo(2 * gin.n, 0);
    expect(c.y - (b.y + b.height), `2 x ${gin.why}`).toBeCloseTo(2 * gin.n, 0);
    expect(c.x, "the third window stacks under the second").toBeCloseTo(b.x, 0);
    expect(a.x, gout.why).toBeCloseTo(gout.n, 0);
    const border = spec("windows", "border.size", "layout");
    expect(await css(wins.nth(0), "border-top-width"), border.why).toBe(`${border.n}px`);

    // btop floats centred at 875x600.
    await page.keyboard.press("Alt+Shift+t");
    const btop = screen.locator("section[aria-label=btop]");
    await expect(btop).toBeVisible();
    await css(btop, "opacity");
    await page.evaluate(() => Promise.all(document.getAnimations().map((x) => x.finished.catch(() => undefined))));
    const f = await box(btop);
    expect([Math.round(f.width), Math.round(f.height)], spec("windows", "float.tag.size", "floating").why).toEqual([875, 600]);
    const area = await box(screen.locator("[data-wallpaper]"));
    expect(Math.abs(f.x + f.width / 2 - area.width / 2), spec("windows", "float.tag.center", "floating").why).toBeLessThanOrEqual(1);

    // A new window pops in from 87% over 328ms on easeOutQuint.
    await page.keyboard.press("Alt+Enter");
    const pop = wins.last().locator("xpath=ancestor::div[2]");
    expect(await pop.evaluate((e) => getComputedStyle(e).animationDuration), spec("windows", "anim.windowsIn", "animations").why).toBe("0.328s");
  });

  test("bar panels", async ({ page }) => {
    const screen = await stock(page);
    const bar = await box(screen.locator("[data-ref=bar]"));
    const W = 1440;

    // Audio, on the right: 380 wide, 5px under the bar, pinned 5px from the screen's right edge.
    await screen.locator("[data-panel=audio]").click();
    const audio = screen.getByRole("dialog", { name: "Audio" });
    await expect(audio).toBeVisible();
    await css(audio, "opacity");
    const a = await box(audio);
    expect(a.width, "panel.sizes: audio 380").toBe(380);
    expect(a.y - (bar.y + bar.height), spec("panels", "panel.card.y", "container").why).toBe(5);
    expect(W - (a.x + a.width), spec("panels", "panel.card.x", "container").why).toBe(5);
    expect(await css(audio, "border-top-width"), spec("panels", "panel.card.border.width", "container").why).toBe("2px");
    expect(await css(audio, "padding-top"), spec("panels", "panel.card.padding", "container").why).toBe("14px");
    // The widget wears the open pill while its panel shows.
    await expect(screen.locator("[data-panel=audio]")).toHaveAttribute("aria-expanded", "true");
    // "Steady groove" at 64%, set in capitals by CSS. audio.hero.status.ladder.
    await expect(audio).toContainText("Steady groove");

    // Opening another closes the first; the clock's calendar is 560 wide, centred on the clock.
    await screen.locator("[data-panel=clock]").click();
    await expect(audio).toHaveCount(0);
    const cal = screen.getByRole("dialog", { name: "Calendar" });
    await css(cal, "opacity");
    const c = await box(cal);
    const clock = await box(screen.locator("[data-panel=clock]"));
    expect(c.width, "panel.sizes: clock 560").toBe(560);
    expect(Math.abs(c.x + c.width / 2 - (clock.x + clock.width / 2)), spec("panels", "panel.card.x", "container").why).toBeLessThanOrEqual(1);
    await expect(cal.locator("[aria-current=date]"), "today is the only marked day").toHaveCount(1);

    // Esc closes. panel.dismiss.escape.
    await page.keyboard.press("Escape");
    await expect(cal).toHaveCount(0);
  });

  test("boot and login", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const boot = page.getByRole("dialog", { name: "Boot" });
    // Limine, quiet: nothing drawn for its 1s timeout, so the firmware's black stays. limine.json quiet.
    await expect(boot).toHaveAttribute("data-stage", "bootloader");
    await expect(boot.locator("img")).toHaveCount(0);
    // The hold lasts one second, so the colour is polled while it shows rather than read once.
    await expect(boot, "quiet.screen-kept: the firmware's image").toHaveCSS("background-color", "rgb(0, 0, 0)");

    // Plymouth: the logo centred, the entry 40px under it, the lock 15px to its left at 80% of its
    // height, bullets from 20px in, 12px apart. default/plymouth/omarchy.script:122-134, 216-232.
    const pw = boot.getByLabel("Password");
    await expect(pw).toBeFocused();
    await pw.pressSequentially("abc");
    const img = (name: string) => boot.locator(`img[src$="/${name}"]`);
    const logo = await box(img("logo.png"));
    expect([logo.x, logo.y, logo.width, logo.height], "logo centred at its own size").toEqual([320, 356, 800, 188]);
    const entry = await box(img("entry.png"));
    expect([entry.x, entry.y], "entry centred, 40px under the logo").toEqual([577, 584]);
    const lock = await box(img("lock.png"));
    expect(lock.height, "lock at 80% of the entry's 48px").toBeCloseTo(38.4, 1);
    expect(entry.x - (lock.x + lock.width), "15px between lock and entry").toBeCloseTo(15, 1);
    const dots = img("bullet.png");
    await expect(dots, "one bullet a character").toHaveCount(3);
    const [d0, d1] = [await box(dots.nth(0)), await box(dots.nth(1))];
    expect([d0.x - entry.x, d1.x - d0.x, d0.width], "bullets 7px, from 20px in, 12px apart").toEqual([20, 12, 7]);

    // After the passphrase the dialog gives way to the progress bar.
    await pw.press("Enter");
    await expect(boot.getByRole("progressbar", { name: "Starting" })).toBeVisible();
    await expect(img("entry.png")).toHaveCount(0);
    await expect(boot).toHaveCount(0, { timeout: 15_000 });

    // Logging out says so, closes the windows, and leaves SDDM's greeter. bin/omarchy-system:28-55.
    await page.keyboard.press("Alt+Escape");
    await page
      .getByRole("option", { name: /Logout/ })
      .first()
      .click();
    await expect(page.getByRole("status", { name: "Logging out" })).toBeVisible();
    const login = page.getByRole("dialog", { name: "Login" });
    await expect(login).toBeVisible();
    // A centred column: the logo, 40px, then lock (33.25x38), 15px, entry. default/sddm/omarchy/Main.qml:33-56.
    const gl = await box(login.locator('img[src$="/logo.png"]'));
    const ge = await box(login.locator('img[src$="/entry.png"]'));
    expect([gl.y, ge.y - (gl.y + gl.height)], "column centred, 40px apart").toEqual([312, 40]);
    // An empty password fails: the field turns red. Main.qml:21-31.
    await login.getByLabel("Password").press("Enter");
    await expect(login.locator('img[src$="/entry-failed.png"]')).toBeVisible();
    await login.getByLabel("Password").fill("anything");
    await login.getByLabel("Password").press("Enter");
    await expect(login).toHaveCount(0);
  });

  test("Limine's menu", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const boot = page.getByRole("dialog", { name: "Boot" });
    await expect(boot).toHaveAttribute("data-stage", "bootloader");
    await expect(boot).toHaveAttribute("data-live", "true");
    // A key during the quiet second reveals the menu, with no countdown. limine.json quiet.reveal.
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("dialog", { name: "Limine boot menu" });
    await expect(menu).toBeVisible();
    expect(await css(menu, "background-color"), "grid.background 1a1b26").toBe("rgb(26, 27, 38)");
    await expect(menu).toContainText("Omarchy Bootloader");
    await expect(menu).toContainText("ARROWS Select    ENTER Boot    E Edit");
    await expect(menu).toContainText("S Firmware Setup    B Blank Entry");
    // default_entry 2: the kernel is selected, its comment in cyan near the bottom.
    const entries = menu.getByRole("option");
    await expect(entries).toHaveCount(3);
    await expect(entries.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(menu).toContainText("Kernel version:");
    // 9x16 cells: the branding sits on row 1, the help on rows 3 and 5. At 1440x900: 160x56, offset (0, 2).
    const brand = await box(menu.getByText("O", { exact: true }).first().locator(".."));
    expect(brand.y, "grid.cell 16px rows; branding on row 1").toBe(2 + 16);
    // Enter boots it: black while the kernel starts, then Plymouth.
    await page.keyboard.press("Enter");
    await expect(boot).toHaveAttribute("data-stage", "handoff");
    await expect(boot).toHaveAttribute("data-stage", "logo");
  });
});
