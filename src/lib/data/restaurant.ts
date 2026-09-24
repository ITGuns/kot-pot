import "server-only";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db, schema, type DbLike } from "@/db";
import type { AycePricing, BookingSettings, Hours, RestaurantInfo } from "@/db/schema";

const { restaurantInfo, hours, bookingSettings, aycePricing } = schema;

export const CONTENT_TAG = "content";

/** Uncached reads (admin) */
export async function readRestaurant(): Promise<RestaurantInfo> {
  const [row] = await db.select().from(restaurantInfo).where(eq(restaurantInfo.id, 1)).limit(1);
  if (!row) throw new Error("restaurant_info not seeded: run `npm run db:seed`");
  return row;
}
export async function readHours(): Promise<Hours[]> {
  return db.select().from(hours).orderBy(asc(hours.category), asc(hours.dayOfWeek));
}
export async function readBookingSettings(ex: DbLike = db): Promise<BookingSettings> {
  const [row] = await ex.select().from(bookingSettings).where(eq(bookingSettings.id, 1)).limit(1);
  if (!row) throw new Error("booking_settings not seeded: run `npm run db:seed`");
  return row;
}
export async function readAyce(includeInactive = false): Promise<AycePricing[]> {
  const rows = await db.select().from(aycePricing).orderBy(asc(aycePricing.displayOrder), asc(aycePricing.id));
  return includeInactive ? rows : rows.filter((r) => r.active);
}

/** Cached reads (public site). Invalidated via revalidateTag(CONTENT_TAG). */
export const getRestaurant = cache(unstable_cache(() => readRestaurant(), ["restaurant-info"], { tags: [CONTENT_TAG] }));
export const getHours = cache(unstable_cache(() => readHours(), ["hours"], { tags: [CONTENT_TAG] }));
export const getBookingSettings = cache(unstable_cache(() => readBookingSettings(), ["booking-settings"], { tags: [CONTENT_TAG] }));
export const getAyce = cache(unstable_cache(() => readAyce(false), ["ayce"], { tags: [CONTENT_TAG] }));
