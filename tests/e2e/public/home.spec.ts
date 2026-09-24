import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero, navigation and every section from the database", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Kot Pot I — Korean BBQ & Hot Pot · McAllen, TX/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Fire-grilled. Broth-bubbling. Korean comfort.");
    await expect(page.getByText("Premium Korean BBQ and bubbling hot pot in McAllen.")).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const label of ["Home", "Menu", "Korean BBQ", "Hot Pot", "Gallery", "Visit Us"]) await expect(nav.getByRole("link", { name: label })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Book a Table" })).toBeVisible();
    await expect(page.getByRole("banner")).toContainText("400 W Nolana Ave Ste V");
    await expect(page.getByRole("banner")).toContainText("(956) 843-0065");

    for (const heading of ["All you can eat.", "Choose your experience.", "The table is the kitchen.", "Build your own sauce.", "Signature Pours.", "Smoke, steam & sizzle.", "Visit tonight."]) {
      const h = page.locator("main").getByRole("heading", { name: heading, exact: true });
      await h.scrollIntoViewIfNeeded();
      await expect(h).toBeVisible();
    }
    await expect(page.locator("main")).toContainText("4.5");
    await expect(page.locator("main")).toContainText("411 reviews");
    await expect(page.locator("main")).toContainText("$30–40 per person");
    await expect(page.locator("footer")).toContainText("Sun – Thu");
    await expect(page.locator("footer")).toContainText("11 AM – 11 PM");
    await expect(page.locator("footer")).toContainText("Dine-in");
    await expect(page.locator('iframe[title^="Map showing"]')).toBeVisible();
  });

  test("all-you-can-eat pricing switches between day groups and sessions", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#all-you-can-eat");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("tab", { name: /Monday – Friday/ })).toBeVisible();
    await section.getByRole("tab", { name: /Monday – Friday/ }).click();
    await section.getByRole("tab", { name: /^Lunch/ }).click();
    await expect(section.getByText("$22.99").first()).toBeVisible();
    await expect(section.getByText("$12.99").first()).toBeVisible();
    await section.getByRole("tab", { name: /^Dinner/ }).click();
    await expect(section.getByText("$28.99").first()).toBeVisible();
    await section.getByRole("tab", { name: /Sat · Sun · Holidays/ }).click();
    await expect(section.getByText("$34.99").first()).toBeVisible();
    await expect(section.getByText("$16.99").first()).toBeVisible();
  });

  test("experience toggle shows meats then the broth selector", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#experience");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("link", { name: /Sliced Beef Brisket/ })).toBeVisible();
    await expect(section.getByText("차돌박이")).toBeVisible();
    await section.getByRole("tab", { name: "Hot Pot" }).click();
    await section.getByRole("tab", { name: /Tom Yum/ }).click();
    await expect(section.locator("#broth-panel").getByRole("heading", { name: "Tom Yum" })).toBeVisible();
    await expect(section.locator("#broth-panel")).toContainText("Lemongrass, galangal, lime leaf");
  });

  test("sauce builder toggles sauces into the bowl", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#sauce-bar");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Korean Ssamjang" }).click();
    await section.getByRole("button", { name: "Ponzu Citrus" }).click();
    await expect(section.getByText("Your mix")).toBeVisible();
    await expect(section).toContainText("Fermented bean & chili");
    await expect(section).toContainText("Yuzu, soy, mirin");
    await section.getByRole("button", { name: "Start over" }).click();
    await expect(section.getByText("Your bowl is empty")).toBeVisible();
  });

  test("exposes Restaurant structured data and metadata from the source", async ({ page }) => {
    await page.goto("/");
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json!);
    expect(data["@type"]).toBe("Restaurant");
    expect(data.telephone).toBe("(956) 843-0065");
    expect(data.address.streetAddress).toBe("400 W Nolana Ave Ste V");
    expect(data.address.postalCode).toBe("78504");
    expect(data.openingHoursSpecification.length).toBe(7);
    expect(data.priceRange).toBe("$30–40 per person");
    expect(data.aggregateRating).toMatchObject({ ratingValue: "4.5", reviewCount: 411 });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`^${(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000").replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\/?$`));
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Kot Pot I");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /All-you-can-eat menu, premium marbled meats/);
  });

  test("has no critical console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && !/favicon|404/.test(m.text()) && errors.push(m.text()));
    await page.goto("/");
    await page.mouse.wheel(0, 6000);
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });
});
