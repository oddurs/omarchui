import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { THEMES } from "../lib/themes";

test("the study renders with styles and passes axe", async ({ page }) => {
  await page.goto("/study");
  await expect(page.getByRole("heading", { level: 1, name: "Omarchy, tuned." })).toBeVisible();
  // StyleX extraction: an unstyled page would leave the body transparent.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("number keys jump between workspaces", async ({ page }) => {
  await page.goto("/study");
  // The clock only shows digits once React has hydrated and the key listener is live.
  await expect(page.getByRole("banner")).toContainText(/\d\d:\d\d/);
  await page.keyboard.press("3");
  await expect(page.getByRole("button", { name: "3: Color" })).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#color")).toBeInViewport();
});

test("the theme menu repaints the page and persists", async ({ page }) => {
  await page.goto("/study");
  await page.getByRole("button", { name: /^Theme:/ }).click();
  await page.getByRole("menuitemradio", { name: /^Nord/ }).click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe(THEMES.nord.accent);
  await page.reload();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe(THEMES.nord.accent);
});

test("the parts grid switches to stock chrome", async ({ page }) => {
  await page.goto("/study");
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

test("the root boots: splash, password, then the desktop with the site panel", async ({ page }) => {
  await page.goto("/");
  const boot = page.getByRole("dialog", { name: "Boot" });
  await expect(boot).toBeVisible();
  const pw = boot.getByLabel("Password");
  await expect(pw).toBeFocused();
  await pw.fill("anything");
  await pw.press("Enter");
  await expect(page.getByRole("progressbar", { name: "Starting" })).toBeVisible();
  await expect(boot).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole("toolbar", { name: "Bar" }).first()).toBeVisible();

  const nav = page.getByRole("navigation", { name: "Site" });
  await nav.getByRole("link", { name: "Read the study" }).click();
  await expect(page).toHaveURL(/\/study$/);
  await expect(page.getByRole("heading", { level: 1, name: "Omarchy, tuned." })).toBeVisible();
});

test("the site panel folds to the mark and remembers it", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Site" });
  await nav.getByRole("button", { name: "Hide site menu" }).click();
  await expect(nav.getByRole("link")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Site" }).getByRole("button", { name: /show site menu/ })).toHaveAttribute("aria-expanded", "false");
});

test("/demo moved to the root", async ({ page }) => {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/$/);
});

test("the contact page renders and passes axe", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1, name: "Contact" })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
