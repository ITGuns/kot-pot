import { expect, test } from "@playwright/test";

test.describe("Other public pages & routes", () => {
  test("visit page has the real business details and CTAs", async ({ page }) => {
    await page.goto("/visit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find us — visit tonight.");
    await expect(page.locator("main").getByRole("link", { name: /400 W Nolana Ave Ste V/ }).first()).toHaveAttribute("href", /google\.com\/maps/);
    await expect(page.getByRole("link", { name: "(956) 843-0065" }).first()).toHaveAttribute("href", "tel:+19568430065");
    await expect(page.locator("main")).toContainText("Dine-in · Takeout · Delivery");
    await expect(page.locator("main")).toContainText("Sun");
    await expect(page.locator("main")).toContainText("11 AM – 10 PM");
    await expect(page.locator("main").getByRole("link", { name: "Get Directions" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Book a Table" }).first()).toHaveAttribute("href", "/book");
  });

  test("Korean BBQ and Hot Pot pages render their menu sections", async ({ page }) => {
    await page.goto("/korean-bbq");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Korean BBQ.");
    await expect(page.locator("main")).toContainText("Grill at Your Table");
    await expect(page.locator("main").getByRole("link", { name: /Shrimp Skewers/ })).toBeVisible();
    await expect(page.locator("main")).toContainText("새우꼬치");
    await page.goto("/hot-pot");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Hot Pot.");
    await expect(page.getByRole("tab", { name: /Mushroom Forest/ })).toBeVisible();
    await page.getByRole("tab", { name: /Mushroom Forest/ }).click();
    await expect(page.locator("#broth-panel")).toContainText("Six wild mushrooms, herb infusion");
  });

  test("gallery lightbox opens, navigates and closes", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Come hungry.");
    await page.getByRole("tab", { name: "Korean BBQ" }).click();
    const first = page.locator("ul.columns-2 button").first();
    await first.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("figcaption")).toContainText(/1 \/ \d+/);
    await page.keyboard.press("ArrowRight");
    await expect(dialog.locator("figcaption")).toContainText(/2 \/ \d+/);
    await expect(page).toHaveURL(/photo=\d+/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("gallery lightbox moves focus in, traps Tab and restores focus on close", async ({ page }) => {
    await page.goto("/gallery");
    const thumb = page.locator("ul.columns-2 button").first();
    await thumb.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await dialog.getByRole("button", { name: "Close" }).focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(thumb).toBeFocused();
  });

  test("scrolled desktop header leaves no hidden focusable links", async ({ page }) => {
    await page.goto("/menu");
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    const hiddenFocusable = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[aria-hidden="true"] a, [aria-hidden="true"] button')).filter((el) => !el.closest("[inert]")).length,
    );
    expect(hiddenFocusable).toBe(0);
  });

  test("gallery deep link opens the lightbox", async ({ page }) => {
    await page.goto("/gallery?photo=1");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("404, sitemap, robots, icons, uploads and admin guard", async ({ request, page }) => {
    const nf = await request.get("/this-page-does-not-exist");
    expect(nf.status()).toBe(404);
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByRole("heading", { name: "That page went cold." })).toBeVisible();

    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const p of ["/menu", "/book", "/korean-bbq", "/hot-pot", "/visit", "/gallery"]) expect(sitemap).toContain(p);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/admin/);
    expect((await request.get("/favicon.ico")).status()).toBe(200);
    expect((await request.get("/icon")).headers()["content-type"]).toContain("image/png");
    expect((await request.get("/uploads/does-not-exist.png")).status()).toBe(404);
    expect([400, 404]).toContain((await request.get("/uploads/..%2F..%2Fetc%2Fpasswd")).status()); // Vercel rejects traversal at the edge with 400

    const admin = await request.get("/admin", { maxRedirects: 0 });
    expect(admin.status()).toBe(307);
    expect(admin.headers()["location"]).toContain("/admin/login");
    const forged = await request.get("/admin/menu", { maxRedirects: 0, headers: { cookie: "sm_admin=forged.token.value" } });
    expect(forged.status()).toBe(307);
  });

  test("admin login rejects wrong credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("owner@kotpot.local");
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Incorrect" })).toHaveText("Incorrect email or password.");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
