import "server-only";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db, schema } from "@/db";
import type { Media } from "@/db/schema";
import { CONTENT_TAG } from "./restaurant";

const { media } = schema;

export async function readMedia(includeInactive = false): Promise<Media[]> {
  const rows = await db.select().from(media).orderBy(asc(media.displayOrder), asc(media.id));
  return includeInactive ? rows : rows.filter((m) => m.active);
}

export async function readMediaById(id: number): Promise<Media | undefined> {
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return row;
}

/** Active media, cached for the public site. */
export const getMedia = cache(unstable_cache(() => readMedia(false), ["media"], { tags: [CONTENT_TAG] }));

export const getGallery = cache(async (): Promise<Media[]> => (await getMedia()).filter((m) => m.inGallery));

/** object-position for a media row's focal point */
export function focal(m: Pick<Media, "focalX" | "focalY">): string {
  return `${m.focalX}% ${m.focalY}%`;
}
