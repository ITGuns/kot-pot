import { expect, test } from "@playwright/test";
import { cleanupAll, closePool, QA, query } from "../helpers/db";
import { expectToast, gotoReady } from "../helpers/ui";

test.describe("Admin menu CMS", () => {
  test.beforeAll(cleanupAll);
  test.afterAll(async () => {
    await cleanupAll();
    await closePool();
  });

  test("modifier group → item create → publish → edit price → hide → duplicate → delete", async ({ page, browser }) => {
    // A modifier group to attach (the source menu has none)
    await gotoReady(page, "/admin/menu/modifiers");
    await page.getByRole("button", { name: "+ New modifier group" }).click();
    const g = page.getByRole("dialog", { name: "New modifier group" });
    await g.getByLabel("Group name").fill(`${QA.prefix}Spice level`);
    await g.getByRole("switch", { name: "Required" }).click();
    await g.getByRole("button", { name: "Create group" }).click();
    await expect(page.getByRole("status")).toContainText("Group created");
    await page.getByRole("button", { name: "+ Option" }).click();
    const o = page.getByRole("dialog", { name: /New option in/ });
    await o.getByLabel("Option name").fill(`${QA.prefix}Extra hot`);
    await o.getByLabel("Price adjustment ($)").fill("1.25");
    await o.getByRole("checkbox", { name: "Spicy", exact: true }).check();
    await o.getByRole("button", { name: "Add option" }).click();
    await expect(page.getByRole("status")).toContainText("Option added");
    await expect(page.locator("main")).toContainText("+$1.25");

    const name = `${QA.prefix}Test Plate`;
    await gotoReady(page, "/admin/menu?new=1");
    const drawer = page.getByRole("dialog", { name: "New menu item" });
    await drawer.getByLabel("Item name").fill(name);
    await drawer.getByLabel("Korean name").fill("큐에이");
    await drawer.getByLabel("Description").fill("temporary QA item");
    await drawer.getByLabel("Price ($)").fill("12.5");
    await drawer.getByLabel("Category / section").selectOption({ label: "BBQ Meats" });
    await drawer.getByRole("checkbox", { name: /Gluten-free \(GF\)/ }).check();
    await drawer.getByRole("checkbox", { name: new RegExp(`${QA.prefix}Spice level`) }).check();
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Item created");
    await expect(page.locator("main").getByText(name, { exact: true })).toBeVisible();

    // Public site reflects it immediately
    const pub = await browser.newPage();
    await pub.goto("/menu?category=korean-bbq");
    const card = pub.locator("button[aria-haspopup='dialog']", { hasText: name });
    await expect(card).toContainText("$12.50");
    await expect(card).toContainText("큐에이");
    await card.click();
    await expect(pub.getByRole("dialog").getByRole("heading", { name: `${QA.prefix}Spice level` })).toBeVisible();
    await expect(pub.getByRole("dialog")).toContainText("+$1.25");
    await pub.keyboard.press("Escape");

    // Edit price
    await page.getByLabel("Search items").fill("QA Test");
    await expect(page.getByRole("heading", { name: /matching item/ })).toBeVisible();
    await page.getByRole("button", { name: "Edit", exact: true }).first().click();
    const edit = page.getByRole("dialog", { name: `Edit ${name}` });
    await edit.getByLabel("Price ($)").fill("13");
    await edit.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Item saved");
    await pub.reload();
    await expect(pub.locator("button[aria-haspopup='dialog']", { hasText: name })).toContainText("$13");

    // Hide
    await page.getByRole("button", { name: "Hide", exact: true }).first().click();
    await expect(page.getByRole("status")).toContainText("Item hidden");
    await pub.reload();
    await expect(pub.locator("button[aria-haspopup='dialog']", { hasText: name })).toHaveCount(0);
    await pub.close();

    // Duplicate + delete both
    await page.getByRole("button", { name: "Copy" }).first().click();
    await expect(page.getByRole("status")).toContainText("Duplicated");
    await expect(page.locator("main").getByText(`${name} (copy)`)).toBeVisible();
    for (let i = 0; i < 2; i++) {
      await page.locator("main").getByRole("button", { name: "Delete", exact: true }).first().click();
      await page.getByRole("alertdialog").getByRole("button", { name: "Delete item" }).click();
      await expectToast(page, "Item deleted");
    }
    expect(await query(`select 1 from menu_items where name like $1`, [`${name}%`])).toHaveLength(0);
  });

  test("categories and sections can be created and removed", async ({ page }) => {
    await gotoReady(page, "/admin/menu/categories");
    await page.getByRole("button", { name: "+ New category" }).click();
    const drawer = page.getByRole("dialog", { name: "New category" });
    await drawer.locator("#c-name").fill(`${QA.prefix}Category`);
    await drawer.getByLabel("Tagline").fill("QA tagline");
    await drawer.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByRole("status")).toContainText("Category created");
    await expect(page.locator("main")).toContainText("/qa-category");

    await page.goto("/admin/menu");
    await page.getByRole("button", { name: `${QA.prefix}Category` }).click();
    await page.getByRole("button", { name: "+ Section" }).click();
    const sec = page.getByRole("dialog", { name: /New section/ });
    await sec.getByLabel("Section name").fill(`${QA.prefix}Section`);
    await sec.getByRole("button", { name: "Create section" }).click();
    await expect(page.getByRole("status")).toContainText("Section created");
    await expect(page.getByRole("heading", { name: `${QA.prefix}Section` })).toBeVisible();

    await page.goto("/admin/menu/categories");
    await page.locator("main div", { hasText: `${QA.prefix}Category` }).getByRole("button", { name: "Delete" }).last().click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete category" }).click();
    await expect(page.getByRole("status")).toContainText("Category deleted");
    expect(await query(`select 1 from menu_categories where slug = 'qa-category'`)).toHaveLength(0);
  });

  test("all-you-can-eat sessions flow to the public pricing section", async ({ page, browser }) => {
    await gotoReady(page, "/admin/menu/ayce");
    await expect(page.locator("main")).toContainText("Monday – Friday");
    await expect(page.locator("main")).toContainText("$22.99");
    await page.getByRole("button", { name: "+ Add session" }).click();
    const d = page.getByRole("dialog", { name: "New session" });
    await d.getByLabel("Day group label").fill(`${QA.prefix}Holiday week`);
    await d.getByRole("button", { name: "Wed" }).click();
    await d.getByLabel("Session").fill("Brunch");
    await d.getByLabel("Adult price ($)").fill("19.99");
    await d.getByLabel("Child price ($)").fill("9.99");
    await d.getByRole("button", { name: "Add session" }).click();
    await expect(page.getByRole("status")).toContainText("Session added");

    const pub = await browser.newPage();
    await pub.goto("/");
    const section = pub.locator("#all-you-can-eat");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("tab", { name: new RegExp(`${QA.prefix}Holiday week`) }).click();
    await expect(section.getByText("$19.99").first()).toBeVisible();
    await expect(section.getByText("$9.99").first()).toBeVisible();
    await pub.close();

    await page.getByTestId("ayce-row").filter({ hasText: `${QA.prefix}Holiday week` }).getByRole("button", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Pricing row deleted");
    expect(await query(`select 1 from ayce_pricing where label like $1`, [`${QA.prefix}%`])).toHaveLength(0);
  });
});
