import { expect, test } from "@playwright/test";

test.describe("Mobile layout", () => {
  test("home: hamburger menu, sticky booking bar, no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav.getByRole("link", { name: "Hot Pot" })).toBeVisible();
    await expect(page.locator("#mobile-nav")).toContainText("400 W Nolana Ave Ste V");
    await page.getByRole("button", { name: "Close menu" }).click();

    const bar = page.locator(".fixed.inset-x-0.bottom-0");
    await expect(bar.getByRole("link", { name: "Book a Table" })).toBeVisible();
    const box = await bar.getByRole("link", { name: "Book a Table" }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("menu: category chips scroll and rows fill the width", async ({ page }) => {
    await page.goto("/menu");
    const nav = page.getByRole("navigation", { name: "Menu categories" });
    const scrollable = await nav.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrollable).toBe(true);
    const card = page.locator("button[aria-haspopup='dialog']").first();
    const width = (await card.boundingBox())!.width;
    expect(width).toBeGreaterThan(300);
    await card.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("booking wizard hides the desktop rail and keeps touch targets large", async ({ page }) => {
    await page.goto("/book");
    await expect(page.locator("aside")).toBeHidden();
    const enabledDay = page.locator("button[aria-pressed]:not([disabled])").first();
    const box = await enabledDay.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(38);
    await enabledDay.click();
    await expect(page.getByRole("heading", { name: "How many guests?" })).toBeVisible();
  });

  test("Korean BBQ and Hot Pot pages have no horizontal overflow", async ({ page }) => {
    for (const path of ["/korean-bbq", "/hot-pot", "/gallery", "/visit"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Mobile header (regression: double wordmark pushed the menu button off-screen)", () => {
  for (const width of [320, 375, 390, 430]) {
    test(`header controls fit and the menu works at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 780 });
      await page.goto("/");
      const logo = page.getByRole("link", { name: "Kot Pot I home" });
      expect(((await logo.innerText()).match(/kot pot i/gi) ?? []).length).toBe(1);
      const toggle = page.getByRole("button", { name: "Open menu" });
      const book = page.getByRole("banner").getByRole("link", { name: "Book", exact: true });
      for (const el of [toggle, book]) {
        const box = (await el.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      await toggle.click();
      const nav = page.getByRole("navigation", { name: "Mobile" });
      await expect(nav.getByRole("link")).toHaveCount(6);
      // Content behind the overlay is inert while the menu is open
      expect(await page.locator("main").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(nav).toBeHidden();
      await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
      expect(await page.locator("main").evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    });
  }
});
