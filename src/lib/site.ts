import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getClock, storeStatus, type Clock, type StoreStatus } from "./availability";
import { getBookingSettings, getHours, getRestaurant } from "./data/restaurant";
import { phoneHref } from "./format";
import type { Hours, RestaurantInfo } from "@/db/schema";

export type SiteChrome = {
  restaurant: RestaurantInfo;
  hours: Hours[];
  clock: Clock;
  status: StoreStatus;
  phoneHref: string;
  /** Today is flagged as a holiday under Hours → date overrides */
  todayIsHoliday: boolean;
};

export async function getSiteChrome(): Promise<SiteChrome> {
  const [restaurant, hours, settings] = await Promise.all([getRestaurant(), getHours(), getBookingSettings()]);
  const clock = getClock(settings.timezone);
  const [override] = await db
    .select({ isHoliday: schema.dateOverrides.isHoliday })
    .from(schema.dateOverrides)
    .where(eq(schema.dateOverrides.date, clock.date))
    .limit(1);
  return { restaurant, hours, clock, status: storeStatus(hours, clock), phoneHref: phoneHref(restaurant.phone), todayIsHoliday: Boolean(override?.isHoliday) };
}

export function fullAddress(r: Pick<RestaurantInfo, "addressLine1" | "addressLine2" | "city" | "state" | "zip">): string {
  return [r.addressLine1, r.addressLine2, `${r.city}, ${r.state} ${r.zip}`].filter(Boolean).join(", ");
}

export function mapsUrl(r: RestaurantInfo): string {
  if (r.googleMapsUrl) return r.googleMapsUrl;
  const q = encodeURIComponent(`${r.name}, ${fullAddress(r)}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function mapsEmbedUrl(r: RestaurantInfo): string {
  const q = encodeURIComponent(`${r.name}, ${fullAddress(r)}`);
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}
