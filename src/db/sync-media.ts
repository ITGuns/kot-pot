/* eslint-disable no-console */
/**
 * Adds bundled photos from the seed data that the database does not have yet,
 * without touching anything else (unlike `db:reseed`, which wipes content).
 *
 *   npm run db:sync-media              # append missing photos after the existing ones
 *   npm run db:sync-media -- --reorder # also put bundled photos back in seed order,
 *                                      # with admin uploads kept after them
 *
 * Rows are matched by `file`, so photos staff edited or hid are left as they are.
 * The public site caches media until an admin edit revalidates it, so bump
 * MEDIA_CACHE_VERSION in src/lib/data/media.ts when shipping new bundled photos.
 */
import { config as loadEnv } from "dotenv";
import { eq } from "drizzle-orm";
import { mediaSeedRows } from "./seed-data/restaurant";

loadEnv({ path: ".env.local" });
loadEnv();

async function main() {
  const { db, schema } = await import("./index");
  const { media } = schema;
  const reorder = process.argv.includes("--reorder");
  const seed = mediaSeedRows();

  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: media.id, file: media.file, displayOrder: media.displayOrder }).from(media);
    const have = new Set(existing.map((m) => m.file));
    const missing = seed.filter((m) => !have.has(m.file));
    const after = existing.reduce((n, m) => Math.max(n, m.displayOrder + 1), 0);

    if (missing.length) {
      await tx.insert(media).values(missing.map((m, i) => (reorder ? m : { ...m, displayOrder: after + i })));
    }

    if (reorder) {
      const seedOrder = new Map(seed.map((m) => [m.file, m.displayOrder]));
      const others = existing.filter((m) => !seedOrder.has(m.file)).sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
      for (const m of existing) {
        const order = seedOrder.get(m.file) ?? seed.length + others.indexOf(m);
        if (order !== m.displayOrder) await tx.update(media).set({ displayOrder: order }).where(eq(media.id, m.id));
      }
    }

    console.log(`Media: ${existing.length} existing, ${missing.length} added${reorder ? ", display order reset to the seed order" : ""}.`);
    for (const m of missing) console.log(`  + ${m.file}`);
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
