// Downloads the restaurant's existing photography from the previous website into
// /public/images so the site never depends on hotlinks. Sources: kot-pot-i-mcallen.md.
import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "images");
const SITE = "https://hotpot-feast-forge.lovable.app/assets";

// Keys match `media.file` values in the seed.
export const ASSETS = [
  ["hero-bbq.jpg", `${SITE}/hero-bbq-Bkkbd3rK.jpg`],
  ["meat-platter.jpg", `${SITE}/meat-platter-C_qJs0Sr.jpg`],
  ["hotpot.jpg", `${SITE}/hotpot-CbWViJiH.jpg`],
  ["banchan.jpg", `${SITE}/banchan-DXZFqz6J.jpg`],
];

async function exists(p) {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  let ok = 0, skipped = 0, failed = 0;
  for (const [file, url] of ASSETS) {
    const dest = join(OUT, file);
    if (await exists(dest)) { skipped++; continue; }
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (asset fetch)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      ok++;
      console.log(`✓ ${file}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
  console.log(`\nDone. downloaded=${ok} skipped=${skipped} failed=${failed}`);
  if (failed) process.exitCode = 1;
}

main();
