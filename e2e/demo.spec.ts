import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { THEMES } from "../lib/themes";

/** Boots the machine at the root: the splash's password, then the desktop. */
async function unlock(page: Page) {
  await page.goto("/");
  const pw = page.getByRole("dialog", { name: "Boot" }).getByLabel("Password");
  await pw.fill("anything");
  await pw.press("Enter");
  await expect(page.getByRole("dialog", { name: "Boot" })).toHaveCount(0, { timeout: 15_000 });
}

const accent = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

test("unlock, open a terminal and change the theme from the shell", async ({ page }) => {
  await unlock(page);
  await page.keyboard.press("Alt+Enter");
  const input = page.getByRole("textbox", { name: "Terminal input" });
  await expect(input).toBeFocused();
  await input.fill("omarchy-theme-set gruvbox");
  await input.press("Enter");
  await expect.poll(() => accent(page)).toBe(THEMES.gruvbox.accent);
});

test("tiling: three windows split the screen and Alt+W closes the focused one", async ({ page }) => {
  await unlock(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press("Alt+Enter");
  const windows = page.locator("main section[aria-label='Terminal']");
  await expect(windows).toHaveCount(3);
  const boxes = await windows.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
  expect(boxes[0]).toBeGreaterThan(boxes[1]! * 0.9);
  await page.keyboard.press("Alt+W");
  await expect(windows).toHaveCount(2);
});

test("Super+Space opens the Omarchy menu; Super+Alt+Space lists apps", async ({ page }) => {
  await unlock(page);
  await page.keyboard.press("Alt+Space");
  await expect(page.getByRole("listbox", { name: "Omarchy menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  // In the browser, Alt+Ctrl stands in for Super+Alt.
  await page.keyboard.press("Alt+Control+Space");
  const search = page.getByRole("combobox", { name: "Search the menu" });
  await search.fill("btop");
  await search.press("Enter");
  await expect(page.locator("section[aria-label='btop']")).toHaveCount(1);
});

test("before/after: the dock and Alt+Ctrl+B cycle stock, split and tuned", async ({ page }) => {
  await unlock(page);
  const dock = page.getByRole("region", { name: "Demo controls" });
  await dock
    .getByRole("radio", { name: "Split" })
    .or(dock.getByRole("button", { name: "Split" }))
    .first()
    .click();
  const slider = page.getByRole("slider", { name: "Before and after divider" });
  await expect(slider).toBeVisible();
  await slider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuenow", "48");
  await page.keyboard.press("Alt+Control+b");
  await expect(slider).toHaveCount(0);
  await expect(page.locator("[data-mode=tuned]")).toHaveCount(1);
  await page.keyboard.press("Alt+Control+b");
  await expect(page.locator("[data-mode=stock]")).toHaveCount(1);
});

test("the theme picker changes nothing until Enter, then applies the theme, and the demo passes axe", async ({ page }) => {
  await unlock(page);
  const before = await accent(page);
  await page.keyboard.press("Alt+Control+t");
  const picker = page.getByRole("listbox", { name: "Themes" });
  await expect(picker).toBeFocused();
  await page.keyboard.press("ArrowRight");
  // Omarchy shows only the preview image while you move. ImagePicker.qml:196-205.
  expect(await accent(page)).toBe(before);
  await page.keyboard.press("Enter");
  await expect(picker).toHaveCount(0);
  await expect.poll(() => accent(page)).not.toBe(before);
  // Check contrast on the settled theme, not on colours halfway through their transition.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("reference mode compares each side of the divider with its source", async ({ page }) => {
  await unlock(page);
  const dock = page.getByRole("region", { name: "Demo controls" });
  await dock.getByRole("radio", { name: "Split" }).click();
  await dock.getByRole("button", { name: "Reference" }).click();
  const vw = page.viewportSize()?.width ?? 1280;

  // Left of the divider is stock: Omarchy's value, cited to the line that sets it.
  await page.mouse.move(vw * 0.25, 14);
  const stockCard = page.getByRole("dialog", { name: "Bar reference" });
  await expect(stockCard).toContainText("Omarchy 4.0.0.alpha");
  await expect(stockCard.locator('a[href*="shell/Commons/Style.qml#L344"]')).toBeVisible();
  await expect(stockCard.getByRole("cell", { name: "26px" }).first()).toBeVisible();

  // Right of it is tuned: the token instead of a source.
  await page.mouse.move(vw * 0.75, 14);
  await expect(page.getByRole("dialog", { name: "Bar reference" })).toContainText("chrome.barHeight");
});

test("the Omarchy menu searches its whole tree", async ({ page }) => {
  await unlock(page);
  await page.keyboard.press("Alt+Space");
  const search = page.getByRole("combobox", { name: "Search the menu" });
  await search.fill("qr code");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(page.getByRole("option").first()).toContainText("Trigger › Capture");
});

test("shutdown powers off; any key boots again", async ({ page }) => {
  await unlock(page);
  await page.keyboard.press("Alt+Space");
  await page.getByRole("combobox", { name: "Search the menu" }).fill("shutdown");
  await page.keyboard.press("Enter");
  const off = page.getByRole("button", { name: /Powered off/ });
  await expect(off).toBeVisible();
  // The Enter that chose Shutdown must not start the machine again by itself.
  await page.waitForTimeout(600);
  await expect(off).toBeVisible();
  await page.keyboard.press("x");
  await expect(page.getByRole("dialog", { name: "Boot" })).toBeVisible();
});
