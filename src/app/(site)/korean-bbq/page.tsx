import type { Metadata } from "next";
import { AycePricing } from "@/components/restaurant/AycePricing";
import { CtaBand } from "@/components/restaurant/CtaBand";
import { MeatGrid } from "@/components/restaurant/MeatGrid";
import { PageHero } from "@/components/restaurant/PageHero";
import { SauceBuilder } from "@/components/restaurant/SauceBuilder";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { currentAyce, groupAyce, todaysAyceGroup } from "@/lib/ayce";
import { getMenuTree } from "@/lib/data/menu";
import { getMedia } from "@/lib/data/media";
import { getAyce, getRestaurant } from "@/lib/data/restaurant";
import { joinWithin } from "@/lib/format";
import { mediaForFile, toLite } from "@/lib/menu-types";
import { pageMeta } from "@/lib/seo";
import { getSiteChrome } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [r, tree] = await Promise.all([getRestaurant(), getMenuTree()]);
  const cat = tree.categories.find((c) => c.slug === "korean-bbq");
  const lead = `${cat?.tagline ?? "Grill at your table"} at ${r.name} in ${r.city}, ${r.state}`;
  const names = joinWithin(cat?.sections.flatMap((s) => s.items.map((i) => i.name)) ?? [], 150 - lead.length);
  return pageMeta(r, { title: "Korean BBQ", description: `${lead}${names ? `: ${names} and more` : ""}.`, path: "/korean-bbq" });
}

export default async function KoreanBbqPage() {
  const [{ restaurant, clock, todayIsHoliday, phoneHref }, tree, ayce, media] = await Promise.all([getSiteChrome(), getMenuTree(), getAyce(), getMedia()]);
  const cat = tree.categories.find((c) => c.slug === "korean-bbq");
  const sauce = tree.categories.find((c) => c.slug === "sauce-bar");
  const meats = cat ? cat.sections.flatMap((s) => s.items).map((i) => toLite(i, { categoryImage: cat.image })) : [];
  const sauces = sauce ? sauce.sections.flatMap((s) => s.items).map((i) => toLite(i)) : [];
  const hero = mediaForFile(media, cat?.image, cat?.name ?? "Korean BBQ") ?? (media.find((m) => m.tag === "bbq") ? mediaForFile(media, media.find((m) => m.tag === "bbq")!.file, "Korean BBQ") : null);
  const groups = groupAyce(ayce);

  return (
    <>
      <PageHero eyebrow={restaurant.tagline} title="Korean" accent="BBQ." body={cat?.tagline ? `${cat.tagline}. ${restaurant.description}` : restaurant.description} image={hero}>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/book" arrow>
            Book a Table
          </ButtonLink>
          <ButtonLink href="/menu?category=korean-bbq" variant="glass">
            See the BBQ menu
          </ButtonLink>
        </div>
      </PageHero>

      <section aria-labelledby="meats-title" className="relative bg-ink-950 py-20 text-ivory-50 lg:py-28">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow text-chili-300">{cat?.sections[0]?.name ?? "BBQ meats"}</p>
            <h2 id="meats-title" className="mt-4 font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">
              {cat?.tagline ?? "Grill at your table"}
              <span className="text-chili-300">.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[16px] text-ivory-100/70">Every cut is listed with its Korean name and price. Tap a card for the details.</p>
          </Reveal>
          <div className="mt-10">
            <MeatGrid items={meats} />
          </div>
        </div>
      </section>

      <AycePricing groups={groups} blurb={restaurant.ayceBlurb} todayKey={todaysAyceGroup(ayce, clock, todayIsHoliday)?.key ?? null} currentId={currentAyce(ayce, clock, todayIsHoliday)?.id ?? null} compact />
      <SauceBuilder sauces={sauces} tagline={sauce?.tagline ?? null} compact />
      <CtaBand title="Fire up a table." body="Reserve online, or call us for larger groups." phone={restaurant.phone} phoneHref={phoneHref} />
    </>
  );
}
