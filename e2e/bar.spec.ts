// The bar's optics and behaviour, measured in both views. Stock numbers come from
// research/omarchy/spec/bar.json; each failure names the spec id it checks.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { ICON_INK, ICON_PATHS } from "../design/shell/icon-paths";

type Item = { id: string; value: string | number; source?: string };
const BAR = JSON.parse(readFileSync(path.join(process.cwd(), "research/omarchy/spec/bar.json"), "utf8")) as { items: Item[] };
const spec = (id: string) => {
  const it = BAR.items.find((i) => i.id === id);
  if (!it) throw new Error(`no ${id} in research/omarchy/spec/bar.json`);
  return { v: it.value, why: `${id} (${it.source ?? "bar.json"})` };
};

async function desktop(page: Page, view: "Stock" | "Tuned") {
  await page.addInitScript(() => window.localStorage.setItem("omarchui-theme", "tokyo-night"));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const pw = page.getByRole("dialog", { name: "Boot" }).getByLabel("Password");
  await pw.fill("anything");
  await pw.press("Enter");
  await expect(page.getByRole("dialog", { name: "Boot" })).toHaveCount(0, { timeout: 15_000 });
  await page.getByRole("region", { name: "Demo controls" }).getByRole("radio", { name: view }).click();
  await expect(page.locator(`[data-mode=${view.toLowerCase()}]`)).toHaveCount(1);
  await page.mouse.move(700, 600);
  return page.locator("[data-screen=live] [data-ref=bar]");
}

test("every icon's ink table matches what the browser measures", async ({ page }) => {
  await page.goto("/system");
  const measured = await page.evaluate((paths) => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    document.body.append(svg);
    return Object.fromEntries(
      Object.entries(paths).map(([k, d]) => {
        const p = document.createElementNS(ns, "path");
        p.setAttribute("d", d);
        svg.append(p);
        const r = p.getBBox();
        return [k, [r.x, r.y, r.width, r.height]];
      }),
    );
  }, ICON_PATHS);
  for (const [name, box] of Object.entries(ICON_INK)) {
    (measured[name] as number[]).forEach((v, i) => expect(v, `${name} ink[${i}]: rerun the ink measurement after changing its path`).toBeCloseTo(box[i]!, 1));
  }
});

for (const [view, size] of [
  ["Stock", 12],
  ["Tuned", 13],
] as const) {
  test(`${view}: every bar glyph paints ${size}px on its longer side, centred in its slot`, async ({ page }) => {
    const bar = await desktop(page, view);
    const glyphs = await bar.evaluate((root) =>
      [...root.querySelectorAll("svg")]
        .filter((s) => s.getBoundingClientRect().width > 0 && s.querySelector("path"))
        .map((s) => {
          const r = s.getBoundingClientRect();
          const k = r.width / s.viewBox.baseVal.width;
          const p = s.querySelector("path")!;
          const bb = p.getBBox();
          const sw = parseFloat(getComputedStyle(p).strokeWidth);
          const slot = s.closest("button, [role=img]")!.getBoundingClientRect();
          return {
            name: s.closest("[aria-label]")?.getAttribute("aria-label") ?? "?",
            long: Math.max(bb.width, bb.height) * k + sw,
            // The ink's centre against the slot's centre.
            dx: r.left + (bb.x - s.viewBox.baseVal.x + bb.width / 2) * k - (slot.left + slot.width / 2),
            dy: r.top + (bb.y - s.viewBox.baseVal.y + bb.height / 2) * k - (slot.top + slot.height / 2),
          };
        }),
    );
    expect(glyphs.length).toBeGreaterThan(6);
    for (const g of glyphs) {
      expect(g.long, `${g.name}: ${spec("icon.paintedSize").why}`).toBeCloseTo(size, 0);
      expect(Math.abs(g.dx), `${g.name} centred across its slot`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(g.dy), `${g.name} centred down its slot`).toBeLessThanOrEqual(0.5);
    }
  });

  test(`${view}: the tooltip waits 400ms, sits under its widget, and is warm for the next`, async ({ page }) => {
    const bar = await desktop(page, view);
    const clock = bar.locator("[data-panel=clock]");
    const tip = bar.getByRole("tooltip");
    await clock.hover();
    await page.waitForTimeout(150);
    await expect(tip, "the first tooltip waits 400ms").toHaveCount(0);
    await expect(tip).toHaveText("Right-click to toggle format");
    const [t, c] = [await tip.boundingBox(), await clock.boundingBox()];
    if (!t || !c) throw new Error("no box");
    expect(Math.abs(t.x + t.width / 2 - (c.x + c.width / 2)), "centred under the clock").toBeLessThanOrEqual(1);
    if (view === "Stock") {
      expect(Math.round(t.y - (c.y + c.height)), spec("tooltip").why).toBe(6);
      expect(await tip.evaluate((e) => [getComputedStyle(e).paddingLeft, getComputedStyle(e).paddingTop]), spec("tooltip").why).toEqual(["10px", "7px"]);
    }
    // Straight onto the world clock: a tooltip that just hid makes the next one show at once.
    await bar.getByRole("img", { name: "World clock" }).hover();
    await expect(tip).toHaveText("World clock", { timeout: 150 });
    // Widgets Omarchy gives no tooltip show none.
    await bar.getByRole("button", { name: /^Network/ }).hover();
    await page.waitForTimeout(600);
    await expect(tip).toHaveCount(0);
  });

  test(`${view}: a held glyph shrinks to 0.9, the clock never does`, async ({ page }) => {
    const bar = await desktop(page, view);
    const net = bar.getByRole("button", { name: /^Network/ });
    await net.hover();
    await page.mouse.down();
    const scale = (sel: string) =>
      bar
        .locator(sel)
        .first()
        .evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
    await expect.poll(() => scale("[data-panel=network] > span"), spec("state.pressed").why).toBeCloseTo(0.9, 2);
    await page.mouse.up();
    await expect.poll(() => scale("[data-panel=network] > span")).toBeCloseTo(1, 2);
  });

  test(`${view}: hovering short of the clock reveals the indicators that are off, dimmed`, async ({ page }) => {
    const bar = await desktop(page, view);
    const off = bar.getByRole("img", { name: /, off$/ });
    await expect(off).toHaveCount(0);
    await page.mouse.move(300, 12);
    // Sudo, recording and remote have nothing to switch here; night light, silence and stay awake do,
    // and all start off: six in Omarchy's order, the 126px Indicators reveals. bar.json notes.
    await expect(off).toHaveCount(3);
    await expect(bar.getByRole("button", { name: /, off$/ })).toHaveCount(3);
    await expect.poll(() => off.first().evaluate((e) => getComputedStyle(e).opacity), spec("state.dimmed").why).toBe(String(spec("state.dimmed").v));
    // Past the start of the clock the peek shuts.
    const c = await bar.locator("[data-panel=clock]").boundingBox();
    await page.mouse.move(c!.x + c!.width / 2, 12);
    await expect(off).toHaveCount(0);
  });

  test(`${view}: right-click swaps the clock's format, a double-click steps the bar's fill`, async ({ page }) => {
    const bar = await desktop(page, view);
    const clock = bar.locator("[data-ref=clock]");
    await clock.click({ button: "right" });
    await expect(clock).toHaveText(/^\d{1,2} [A-Z][a-z]+ W\d{2} \d{4}$/);
    await clock.click({ button: "right" });
    await expect(clock).toHaveText(/^[A-Z][a-z]+day\d{2}:\d{2}$/);
    // Empty space between the clock and the right-hand widgets. bin/omarchy-bar:239-244.
    for (const look of ["clear", "glassy", "opaque"]) {
      await page.mouse.dblclick(1000, 12);
      await expect(bar).toHaveAttribute("data-look", look);
    }
  });
}

test("the speaker follows the volume, as Omarchy steps it", async ({ page }) => {
  const bar = await desktop(page, "Tuned");
  const audio = bar.getByRole("button", { name: /^Audio/ });
  const d = () => audio.locator("svg path").first().getAttribute("d");
  // The demo starts at 64%: one wave.
  await expect.poll(d).toBe(ICON_PATHS.volumeMid);
  await audio.hover();
  for (let i = 0; i < 8; i++) await page.mouse.wheel(0, -100);
  await expect.poll(d).toBe(ICON_PATHS.volume);
  for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 100);
  await expect.poll(d).toBe(ICON_PATHS.mute);
});
