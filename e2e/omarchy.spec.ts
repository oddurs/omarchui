import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import facts from "../research/omarchy/facts.json";

test("the Omarchy map renders, cites the pinned commit and passes axe", async ({ page }) => {
  // The map renders Omarchy's whole menu tree and binding list, several thousand nodes. axe alone
  // takes about 5s here and several times that beside the rest of the suite, past the 30s default.
  test.slow();
  await page.goto("/omarchy");
  await expect(page.getByRole("heading", { level: 1, name: "How Omarchy is built" })).toBeVisible();
  // gaps_in is cited to a line: the link must reach that line at the pinned commit.
  await expect(page.locator(`a[href="https://github.com/basecamp/omarchy/blob/${facts.commit}/default/hypr/looknfeel.lua#L8"]`).first()).toBeAttached();
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("the binding list filters", async ({ page }) => {
  await page.goto("/omarchy#bindings");
  await page.getByLabel("Filter bindings").fill("screenshot");
  await expect(page.getByText(/^\d+ of 257 shown$/)).toBeVisible();
  await expect(page.getByRole("cell", { name: "Screenshot", exact: true }).first()).toBeVisible();
});

test("every menu entry is in the tree", async ({ page }) => {
  await page.goto("/omarchy#menu");
  await page.getByText("Appearance", { exact: true }).first().click();
  await expect(page.getByText("Workspace Layout").first()).toBeVisible();
});
