import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/menu", "/korean-bbq", "/hot-pot", "/book", "/visit", "/gallery", "/admin/login"];

for (const path of PAGES) {
  test(`accessibility: ${path} has no serious or critical violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500); // let entrance animations finish so axe measures final colours, not mid-fade blends
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const summary = blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nodes, e.g. ${v.nodes[0]?.target.join(" ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
