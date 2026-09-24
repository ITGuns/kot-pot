import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { gotoReady } from "../helpers/ui";

config({ path: ".env.local" });

test.describe("Admin dashboard & shell", () => {
  test("dashboard shows today's stats, hours, pricing and quick actions", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Today at a glance" })).toBeVisible();
    for (const label of ["Reservations today", "Expected guests", "Pending", "Cancelled today", "Upcoming (active)"]) await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today's hours" })).toBeVisible();
    await expect(page.locator("main")).toContainText("All-you-can-eat");
    await expect(page.getByRole("link", { name: "+ New Menu Item" })).toHaveAttribute("href", "/admin/menu?new=1");
    await expect(page.getByRole("link", { name: "View Reservations" })).toHaveAttribute("href", "/admin/reservations");
    await expect(page.getByRole("link", { name: "Edit Hours", exact: true })).toHaveAttribute("href", "/admin/hours");
    await expect(page.getByRole("heading", { name: "Featured menu items" })).toBeVisible();
    await expect(page.getByText("Sliced Beef Brisket")).toBeVisible();
  });

  test("sidebar navigates and toggles render inside their tracks", async ({ page }) => {
    await gotoReady(page, "/admin");
    const nav = page.getByRole("navigation", { name: "Admin" });
    await expect(nav.getByRole("link", { name: "Media" })).toBeVisible();
    await nav.getByRole("link", { name: "Settings" }).click();
    await page.waitForURL(/\/admin\/settings/);
    await page.waitForLoadState("networkidle");
    const toggle = page.getByRole("switch", { name: "Online booking enabled" });
    const track = await toggle.boundingBox();
    const knob = await toggle.locator("span").boundingBox();
    expect(knob!.x).toBeGreaterThanOrEqual(track!.x);
    expect(knob!.x + knob!.width).toBeLessThanOrEqual(track!.x + track!.width + 0.5);
    expect(await toggle.getAttribute("aria-checked")).toBe("true");
  });

  test("sign out ends the session and revokes the old token", async ({ page }) => {
    const { cookies } = await page.context().storageState();
    const oldToken = cookies.find((c) => c.name === "sm_admin")?.value;
    expect(oldToken).toBeTruthy();
    await page.goto("/admin");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    const res = await page.request.get("/admin", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    // A copy of the previous token must be rejected too (server-side revocation)
    const replay = await page.request.get("/admin", { maxRedirects: 0, headers: { cookie: `sm_admin=${oldToken}` } });
    expect(replay.status()).toBe(307);

    // Sign back in so the remaining admin specs keep a valid session
    await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL ?? "owner@kotpot.local");
    await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD ?? "kotpot-admin-2026");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.context().storageState({ path: "tests/.auth/admin.json" });
  });
});
