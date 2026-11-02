import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ENTRIES, FOUNDATIONS } from "../docs/registry";

const PAGES = ["/system", ...FOUNDATIONS.map((f) => `/system/foundations/${f.slug}`), ...ENTRIES.map((e) => `/system/${e.layer}/${e.slug}`)];

for (const path of PAGES) {
  test(`${path} renders and passes axe`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

// Regression: a folder missing from StyleX's extraction list rendered with partial CSS and
// no error. The side nav's desktop column only exists if docs/ is extracted.
test("the reference nav is a column at desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/system/components/button");
  const dir = await page
    .getByRole("navigation", { name: "System reference" })
    .locator("ul")
    .first()
    .evaluate((el) => getComputedStyle(el).flexDirection);
  expect(dir).toBe("column");
  await expect(page.getByRole("link", { name: "Button", exact: true })).toHaveAttribute("aria-current", "page");
});

test("prop tables come from the component types", async ({ page }) => {
  await page.goto("/system/components/button");
  const table = page.getByRole("table").filter({ hasText: "variant" });
  await expect(table.getByRole("cell", { name: "'primary' | 'secondary' | 'ghost'" })).toBeVisible();
});

test("examples are live", async ({ page }) => {
  await page.goto("/system/components/button");
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByText("Saved 1 time")).toBeVisible();
});
