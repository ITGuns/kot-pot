import type { Metadata } from "next";
import { MediaManager } from "@/components/admin/media/MediaManager";
import { PageHeader } from "@/components/admin/ui";
import { readMedia } from "@/lib/data/media";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const media = await readMedia(true);
  return (
    <>
      <PageHeader title="Media library" description="Photos for the gallery, hero, section backdrops and menu items. Uploads are validated (type, size, dimensions) and served with long-lived caching." />
      <MediaManager media={media} />
    </>
  );
}
