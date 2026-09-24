#!/usr/bin/env node
/**
 * Captures full-page screenshots of every public page (and the admin, when
 * ADMIN_EMAIL/ADMIN_PASSWORD are set) at several viewport widths so layout can
 * be reviewed quickly. Output: ./data/qa-screens/<page>-<width>.png
 *   node scripts/qa-screens.mjs            # all pages, widths 390 + 1440
 *   node scripts/qa-screens.mjs --widths 320,768,1920 --pages /,/menu
 */
import { config } from "dotenv";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

config({ path: ".env.local" });
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const BASE = opt("base", "http://localhost:3000");
const WIDTHS = opt("widths", "390,1440").split(",").map(Number);
const PAGES = opt("pages", "/,/menu,/korean-bbq,/hot-pot,/gallery,/visit,/book").split(",");
const ADMIN = args.includes("--admin");
const OUT = join(process.cwd(), "data", "qa-screens");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    if (ADMIN) {
      await page.goto(`${BASE}/admin/login`);
      await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL ?? "");
      await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD ?? "");
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL(/\/admin$/);
    }
    const list = ADMIN ? ["/admin", "/admin/reservations", "/admin/menu", "/admin/menu/categories", "/admin/menu/modifiers", "/admin/menu/ayce", "/admin/media", "/admin/hours", "/admin/settings"] : PAGES;
    for (const path of list) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      // walk the page so lazy images load
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 700) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const name = (path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-")) + `-${width}.png`;
      await page.screenshot({ path: join(OUT, name), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      console.log(`${name}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ""}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
