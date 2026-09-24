import type { Metadata } from "next";
import { AycePricing } from "@/components/restaurant/AycePricing";
import { BrothSelector } from "@/components/restaurant/BrothSelector";
import { CtaBand } from "@/components/restaurant/CtaBand";
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
import { getSiteChrome } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [r, tree] = await Promise.all([getRestaurant(), getMenuTree()]);
  const cat = tree.categories.find((c) => c.slug === "hot-pot");
  const lead = `${cat?.tagline ?? "Hot pot"} at ${r.name} in ${r.city}, ${r.state}. Broths: `;
  const names = joinWithin(cat?.sections.flatMap((s) => s.items.map((i) => i.name)) ?? [], 152 - lead.length);
  return {
    title: "Hot Pot",
    description: names ? `${lead}${names}.` : `${cat?.tagline ?? "Hot pot"} at ${r.name} in ${r.city}, ${r.state}.`,
    alternates: { canonical: "/hot-pot" },
  };
}

export default async function HotPotPage() {
  const [{ restaurant, clock, todayIsHoliday, phoneHref }, tree, ayce, media] = await Promise.all([getSiteChrome(), getMenuTree(), getAyce(), getMedia()]);
  const cat = tree.categories.find((c) => c.slug === "hot-pot");
  const sauce = tree.categories.find((c) => c.slug === "sauce-bar");
  const broths = cat ? cat.sections.flatMap((s) => s.items).map((i) => toLite(i, { categoryImage: cat.image })) : [];
  const sauces = sauce ? sauce.sections.flatMap((s) => s.items).map((i) => toLite(i)) : [];
  const image = mediaForFile(media, cat?.image, cat?.name ?? "Hot pot") ?? (media.find((m) => m.tag === "hot-pot") ? mediaForFile(media, media.find((m) => m.tag === "hot-pot")!.file, "Hot pot") : null);
  const groups = groupAyce(ayce);

  return (
    <>
      <PageHero eyebrow={restaurant.tagline} title="Hot" accent="Pot." body={cat?.tagline ? `${cat.tagline}. ${restaurant.description}` : restaurant.description} image={image}>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/book" arrow>
            Book a Table
          </ButtonLink>
          <ButtonLink href="/menu?category=hot-pot" variant="glass">
            See the hot pot menu
          </ButtonLink>
        </div>
      </PageHero>

      <section aria-labelledby="broths-title" className="relative bg-ink-950 py-20 text-ivory-50 lg:py-28">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow text-chili-300">{cat?.sections[0]?.name ?? "Broths"}</p>
            <h2 id="broths-title" className="mt-4 font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">
              {cat?.tagline ?? "Two broths per pot"}
              <span className="text-chili-300">.</span>
            </h2>
          </Reveal>
          <div className="mt-10">
            <BrothSelector broths={broths} image={image} tagline={null} />
          </div>
        </div>
      </section>

      <AycePricing groups={groups} blurb={restaurant.ayceBlurb} todayKey={todaysAyceGroup(ayce, clock, todayIsHoliday)?.key ?? null} currentId={currentAyce(ayce, clock, todayIsHoliday)?.id ?? null} compact />
      <SauceBuilder sauces={sauces} tagline={sauce?.tagline ?? null} compact />
      <CtaBand title="Get the pot bubbling." body="Reserve online in under a minute. Larger groups can call ahead." phone={restaurant.phone} phoneHref={phoneHref} />
    </>
  );
}
