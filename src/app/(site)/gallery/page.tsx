import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";
import { PageHero } from "@/components/restaurant/PageHero";
import { getGallery } from "@/lib/data/media";
import { getRestaurant } from "@/lib/data/restaurant";
import { toMediaLite } from "@/lib/menu-types";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const r = await getRestaurant();
  return pageMeta(r, { title: "Gallery", description: `Photos from ${r.name}: ${r.tagline}. ${r.city}, ${r.state}.`, path: "/gallery" });
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ photo?: string }> }) {
  const [images, params] = await Promise.all([getGallery(), searchParams]);
  const initial = params.photo ? Number(params.photo) : undefined;
  const hero = images.find((m) => m.tag === "banchan") ?? images[0] ?? null;
  return (
    <>
      <PageHero eyebrow="Gallery" title="Come" accent="hungry." body={`${images.length} photos from the grill, the pot and the table.`} image={hero ? toMediaLite(hero) : null} />
      <GalleryExplorer images={images.map(toMediaLite)} initialPhoto={Number.isFinite(initial) ? initial : undefined} />
    </>
  );
}
