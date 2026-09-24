import { expect, test } from "@playwright/test";
import { cleanupAll, closePool, QA, query } from "../helpers/db";
import { gotoReady } from "../helpers/ui";

/** A 320×240 PNG rendered in the browser so the upload passes type, size and dimension checks. */
async function pngBuffer(page: import("@playwright/test").Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 240;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#cc3a1e";
    ctx.fillRect(0, 0, 320, 240);
    ctx.fillStyle = "#faf5ea";
    ctx.fillRect(40, 40, 240, 160);
    return c.toDataURL("image/png");
  });
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

test.describe("Admin media library", () => {
  test.afterAll(async () => {
    await cleanupAll();
    await closePool();
  });

  test("upload → edit alt/tag/focal point → appears in the public gallery → delete", async ({ page, browser }) => {
    await gotoReady(page, "/admin/media");
    await expect(page.locator("main")).toContainText("Sizzling Korean BBQ marbled beef on charcoal grill");

    const buffer = await pngBuffer(page);
    await page.locator('input[type="file"]').first().setInputFiles({ name: "qa-upload.png", mimeType: "image/png", buffer });
    await expect(page.getByRole("status")).toContainText("1 image uploaded");
    await expect(page.locator("main")).toContainText("qa upload");

    await page.locator("main").getByRole("button", { name: "qa upload" }).click();
    const d = page.getByRole("dialog", { name: "Edit image" });
    await d.getByLabel("Alt text").fill(`${QA.prefix}Photo`);
    await d.getByLabel("Caption").fill("QA caption");
    await d.getByLabel("Tag").selectOption("hot-pot");
    await d.getByLabel("Focal X (%)").fill("70");
    await d.getByLabel("Focal Y (%)").fill("30");
    await d.getByRole("button", { name: "Save image" }).click();
    await expect(page.getByRole("status")).toContainText("Image saved");
    await expect(page.locator("main")).toContainText(`${QA.prefix}Photo`);
    await expect(page.locator("main")).toContainText("focal 70%, 30%");

    const [row] = await query<{ file: string; width: number; height: number; tag: string }>(`select file, width, height, tag from media where alt = $1`, [`${QA.prefix}Photo`]);
    expect(row).toMatchObject({ width: 320, height: 240, tag: "hot-pot" });
    expect(row.file).toMatch(/^\/uploads\/.+\.png$/);
    expect((await page.request.get(row.file)).headers()["content-type"]).toBe("image/png");

    const pub = await browser.newPage();
    await pub.goto("/gallery");
    await pub.getByRole("tab", { name: "Hot Pot" }).click();
    await expect(pub.locator("ul.columns-2").getByRole("button", { name: `${QA.prefix}Photo` })).toBeVisible();
    await pub.close();

    await page.getByTestId("media-row").filter({ hasText: `${QA.prefix}Photo` }).getByRole("button", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete image" }).click();
    await expect(page.getByRole("status")).toContainText("Image deleted");
    expect(await query(`select 1 from media where alt = $1`, [`${QA.prefix}Photo`])).toHaveLength(0);
    expect((await page.request.get(row.file)).status()).toBe(404);
  });

  test("rejects files that are not valid images", async ({ page }) => {
    await gotoReady(page, "/admin/media");
    await page.locator('input[type="file"]').first().setInputFiles({ name: "qa-bad.png", mimeType: "image/png", buffer: Buffer.from("definitely not a png") });
    await expect(page.getByRole("status")).toContainText("doesn't look like a valid image");
  });
});
