import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { THEMES } from "../lib/themes";

test("the exposition renders with styles and passes axe", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Omarchy, tuned." })).toBeVisible();
  // StyleX extraction: an unstyled page would leave the body transparent.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("number keys jump between workspaces", async ({ page }) => {
  await page.goto("/");
  // The clock only shows digits once React has hydrated and the key listener is live.
  await expect(page.getByRole("banner")).toContainText(/\d\d:\d\d/);
  await page.keyboard.press("3");
  await expect(page.getByRole("button", { name: "3: Color" })).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#color")).toBeInViewport();
});

test("the theme menu repaints the page and persists", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Theme:/ }).click();
  await page.getByRole("menuitemradio", { name: /^Nord/ }).click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe(THEMES.nord.accent);
  await page.reload();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe(THEMES.nord.accent);
});

test("the parts grid switches to stock chrome", async ({ page }) => {
  await page.goto("/");
  const parts = page.locator("#parts");
  await parts
    .getByRole("radio", { name: "Stock" })
    .or(parts.getByRole("button", { name: "Stock" }))
    .first()
    .click();
  await expect(parts.locator("[data-mode=stock]")).toHaveCount(1);
});

test("unknown pages get the styled 404", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Nothing is open here" })).toBeVisible();
});
