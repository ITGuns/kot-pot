import type { Metadata } from "next";
import { Experience } from "@/components/home/Experience";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { GalleryBento } from "@/components/home/GalleryBento";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Ticker } from "@/components/home/Ticker";
import { Visit } from "@/components/home/Visit";
import { AycePricing } from "@/components/restaurant/AycePricing";
import { Drinks } from "@/components/restaurant/Drinks";
import { SauceBuilder } from "@/components/restaurant/SauceBuilder";
import { itemAvailability } from "@/lib/availability";
import { currentAyce, groupAyce, todaysAyceGroup } from "@/lib/ayce";
import { flattenItems, getMenuTree } from "@/lib/data/menu";
import { getMedia } from "@/lib/data/media";
import { getAyce, getRestaurant } from "@/lib/data/restaurant";
import { mediaForFile, toLite, toMediaLite } from "@/lib/menu-types";
import { getSiteChrome } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const r = await getRestaurant();
  return { title: { absolute: r.seoTitle ?? `${r.name} — ${r.category} · ${r.city}, ${r.state}` }, description: r.seoDescription ?? r.description, alternates: { canonical: "/" } };
}

export default async function HomePage() {
  const [{ restaurant, hours, status, phoneHref, clock, todayIsHoliday }, tree, ayce, media] = await Promise.all([getSiteChrome(), getMenuTree(), getAyce(), getMedia()]);

  const category = (slug: string) => tree.categories.find((c) => c.slug === slug);
  const itemsOf = (slug: string) => {
    const c = category(slug);
    return c ? c.sections.flatMap((s) => s.items).map((i) => toLite(i, { categoryImage: c.image })) : [];
  };
  const meats = itemsOf("korean-bbq");
  const broths = itemsOf("hot-pot");
  const sauces = itemsOf("sauce-bar");
  const cocktails = itemsOf("cocktails");
  const beerSake = itemsOf("beer-sake");

  const catById = new Map(tree.categories.map((c) => [c.id, c]));
  const featured = flattenItems(tree)
    .filter((i) => i.featured)
    .slice(0, 8)
    .map((i) => {
      const c = catById.get(i.categoryId)!;
      const a = itemAvailability(i, c, hours, clock);
      return toLite(i, { categoryImage: c.image, availabilityLabel: a.label });
    });

  const heroImage = mediaForFile(media, restaurant.heroImage, restaurant.heroImageAlt ?? restaurant.name);
  const byTag = (tag: string, skip: string[] = []) => media.find((m) => m.tag === tag && !skip.includes(m.file));
  const introMain = byTag("bbq", [restaurant.heroImage ?? ""]) ?? byTag("bbq");
  const introLeft = byTag("banchan") ?? byTag("hot-pot");
  const introRight = byTag("hot-pot", [introLeft?.file ?? ""]) ?? byTag("interior");
  const gallery = media.filter((m) => m.inGallery).map(toMediaLite);

  const groups = groupAyce(ayce);
  const todayGroup = todaysAyceGroup(ayce, clock, todayIsHoliday);
  const current = currentAyce(ayce, clock, todayIsHoliday);

  const tickerItems = [...restaurant.tagline.split(/\s*[·•|]\s*/), ...(groups.length ? ["All-you-can-eat"] : []), ...restaurant.serviceTypes, `${restaurant.city}, ${restaurant.state}`].filter(Boolean);

  return (
    <>
      <Hero
        name={restaurant.name}
        tagline={restaurant.tagline}
        headline={restaurant.heroHeadline ?? restaurant.tagline}
        subheadline={restaurant.heroSubheadline}
        image={heroImage}
        status={status}
        addressShort={`${restaurant.addressLine1} · ${restaurant.city}, ${restaurant.state}`}
      />
      <Ticker items={tickerItems} />
      <Intro
        tagline={restaurant.tagline}
        description={restaurant.description}
        rating={restaurant.rating}
        reviewCount={restaurant.reviewCount}
        priceRange={restaurant.priceRange}
        serviceTypes={restaurant.serviceTypes}
        images={{ main: introMain ? toMediaLite(introMain) : null, left: introLeft ? toMediaLite(introLeft) : null, right: introRight ? toMediaLite(introRight) : null }}
      />
      <AycePricing groups={groups} blurb={restaurant.ayceBlurb} todayKey={todayGroup?.key ?? null} currentId={current?.id ?? null} />
      <Experience meats={meats} broths={broths} hotpotImage={mediaForFile(media, category("hot-pot")?.image, "Bubbling hot pot")} bbqTagline={category("korean-bbq")?.tagline ?? null} brothTagline={category("hot-pot")?.tagline ?? null} />
      <FeaturedCarousel items={featured} />
      <SauceBuilder sauces={sauces} tagline={category("sauce-bar")?.tagline ?? null} />
      <Drinks cocktails={cocktails} beerSake={beerSake} cocktailsTagline={category("cocktails")?.tagline ?? null} beerTagline={category("beer-sake")?.tagline ?? null} />
      <GalleryBento images={gallery} />
      <Visit restaurant={restaurant} hours={hours} phoneHref={phoneHref} todayDow={clock.dayOfWeek} status={status} />
    </>
  );
}
