import { expect, test } from "@playwright/test";

const row = (page: import("@playwright/test").Page, text: string) => page.locator("button[aria-haspopup='dialog']", { hasText: text }).first();

test.describe("Menu", () => {
  test("lists every source category with real items, Korean names and prices", async ({ page }) => {
    await page.goto("/menu");
    const cats = page.getByRole("navigation", { name: "Menu categories" }).getByRole("button");
    await expect(cats).toHaveText(["All", "Korean BBQ", "Hot Pot", "Sauce Bar", "Cocktails", "Beer & Sake"]);

    const brisket = row(page, "Sliced Beef Brisket");
    await expect(brisket).toContainText("차돌박이");
    await expect(brisket).toContainText("Thinly shaved, melts on the grill");
    await expect(brisket).toContainText("$14");
    await expect(row(page, "Beef Short Rib (LA Galbi)")).toContainText("$18");

    await cats.filter({ hasText: "Hot Pot" }).click();
    await expect(page.getByRole("heading", { name: "Hot Pot.", level: 2 })).toBeVisible();
    await expect(page.getByText("Two Broths per Pot").first()).toBeVisible();
    await expect(row(page, "Pork Bone (Tonkotsu)")).toContainText("18-hour rich, milky broth");
    await expect(row(page, "Pork Bone (Tonkotsu)")).toContainText("$8");

    await cats.filter({ hasText: "Sauce Bar" }).click();
    const sesame = row(page, "House Sesame");
    await expect(sesame).toContainText("Toasted sesame paste, garlic oil");
    await expect(sesame).not.toContainText("$");

    await cats.filter({ hasText: "Beer & Sake" }).click();
    await expect(row(page, "Dassai 45 (Bottle)")).toContainText("$48");
    await expect(row(page, "Hakutsuru Junmai (Hot)")).toContainText("$10");
  });

  test("item modal opens with details, updates the URL and closes with Escape", async ({ page }) => {
    await page.goto("/menu?category=korean-bbq");
    await row(page, "Beef Short Rib (LA Galbi)").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Beef Short Rib (LA Galbi)" })).toBeVisible();
    await expect(dialog).toContainText("Cross-cut, soy-marinated");
    await expect(dialog).toContainText("LA갈비");
    await expect(page).toHaveURL(/item=beef-short-rib-la-galbi/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/item=/);
  });

  test("deep links open the item directly", async ({ page }) => {
    await page.goto("/menu?item=korean-ember");
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Korean Ember" })).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText("Smoked whiskey, gochujang honey");
    await expect(page.getByRole("dialog")).toContainText("$14");
  });

  test("search spans every category, including Korean names, and filters narrow results", async ({ page }) => {
    await page.goto("/menu");
    const search = page.getByRole("searchbox", { name: "Search the menu" });
    await search.fill("soju");
    await expect(page.getByRole("status")).toContainText(/2 items for “soju”/);
    await expect(row(page, "Cherry Soju Spritz")).toBeVisible();
    await expect(row(page, "Lychee Martini")).toBeVisible();
    await expect(row(page, "Hite Draft")).toHaveCount(0);

    await search.fill("삼겹살");
    await expect(page.getByRole("status")).toContainText(/1 item for “삼겹살”/);
    await expect(row(page, "Sliced Pork Belly")).toBeVisible();

    await search.fill("");
    await page.getByRole("button", { name: /^Filters/ }).click();
    await page.getByRole("button", { name: "Signature", exact: true }).click();
    await expect(row(page, "Marinated Beef Bulgogi")).toBeVisible();
    await expect(row(page, "Sliced Chicken")).toHaveCount(0);
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(row(page, "Sliced Chicken")).toBeVisible();

    await search.fill("zzzz-nothing");
    await expect(page.getByRole("status")).toContainText("No items match");
  });
});
