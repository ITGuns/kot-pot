/**
 * Restaurant facts transcribed from kot-pot-i-mcallen.md (the previous website).
 * Nothing here is invented; anything the source does not state is null / empty
 * and can be filled in from the admin dashboard.
 */
import type { HoursCategory, MediaTag } from "../schema";
import { $, FRI, MON, SAT, SUN, THU, TUE, WED } from "./types";

export const RESTAURANT = {
  id: 1,
  name: "Kot Pot I",
  tagline: "Authentic Korean · Korean BBQ · Hot Pot",
  category: "Korean BBQ & Hot Pot",
  description: "Authentic Korean BBQ and bubbling hot pot in McAllen, TX. All-you-can-eat menu, premium marbled meats, signature broths and soju cocktails.",
  addressLine1: "400 W Nolana Ave Ste V",
  addressLine2: null,
  city: "McAllen",
  state: "TX",
  zip: "78504",
  phone: "(956) 843-0065",
  email: null,
  website: null,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  yelpUrl: null,
  googleMapsUrl: null,
  rating: "4.5",
  reviewCount: 411,
  priceRange: "$30–40 per person",
  serviceTypes: ["Dine-in", "Takeout", "Delivery"],
  heroImage: "/images/hero-bbq.jpg",
  heroImageAlt: "Sizzling Korean BBQ marbled beef on charcoal grill",
  // Hero copy is editable under Admin → Settings. The headline is campaign copy; the tagline above is the official one.
  heroHeadline: "Fire-grilled. Broth-bubbling. Korean comfort.",
  heroSubheadline: "Premium Korean BBQ and bubbling hot pot in McAllen.",
  ayceBlurb: "Free refills, fresh-cut meats and bubbling broths — kept coming until you say stop.",
  seoTitle: "Kot Pot I — Korean BBQ & Hot Pot · McAllen, TX",
  seoDescription: "Authentic Korean BBQ and bubbling hot pot in McAllen, TX. All-you-can-eat menu, premium marbled meats, signature broths and soju cocktails.",
  ogImageUrl: "/images/og-image.jpg",
};

type HoursRow = {
  category: HoursCategory;
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed?: boolean;
  note?: string;
};

const days = (list: number[], row: Omit<HoursRow, "dayOfWeek">): HoursRow[] => list.map((dayOfWeek) => ({ dayOfWeek, ...row }));

/** Source: "Sun – Thu 11AM – 10PM · Fri – Sat 11AM – 11PM" */
export const HOURS: HoursRow[] = [
  ...days([SUN, MON, TUE, WED, THU], { category: "store", opensAt: "11:00", closesAt: "22:00" }),
  ...days([FRI, SAT], { category: "store", opensAt: "11:00", closesAt: "23:00" }),
];

/** Source: "Featured — All You Can Eat" pricing tables. Prices in cents. */
export const AYCE = [
  { label: "Monday – Friday", days: [MON, TUE, WED, THU, FRI], includesHolidays: false, session: "Lunch", startTime: "11:00", endTime: "16:00", adultPrice: $(22.99), childPrice: $(12.99), childLabel: "Child (4–10)" },
  { label: "Monday – Friday", days: [MON, TUE, WED, THU, FRI], includesHolidays: false, session: "Dinner", startTime: "16:00", endTime: null, adultPrice: $(28.99), childPrice: $(14.99), childLabel: "Child (4–10)" },
  { label: "Sat · Sun · Holidays", days: [SAT, SUN], includesHolidays: true, session: "All Day", startTime: null, endTime: null, adultPrice: $(34.99), childPrice: $(16.99), childLabel: "Child (4–10)" },
];

/**
 * Default reservation rules. These are NOT from the source (the old site had
 * no booking system); they are derived from the restaurant hours and are fully
 * editable in /admin/settings and /admin/hours.
 */
export const BOOKING_SETTINGS = {
  id: 1,
  slotIntervalMinutes: 30,
  turnTimeMinutes: 90,
  minPartySize: 1,
  maxPartySize: 8,
  largePartyThreshold: 7,
  maxBookingsPerSlot: 6,
  maxCoversPerSlot: 36,
  minLeadTimeMinutes: 60,
  maxDaysInAdvance: 60,
  autoConfirm: true,
  bookingsEnabled: true,
  // No seating layout is described in the source; leave empty (guests get a free-text field) and add options in Settings.
  seatingPreferences: [] as string[],
  occasions: ["Birthday", "Anniversary", "Date night", "Business meal", "Celebration", "Just hungry"],
  timezone: "America/Chicago",
};

/** First seating at opening, last seating 60 minutes before close (derived from hours; editable). */
export const BOOKING_WINDOWS = [
  ...[SUN, MON, TUE, WED, THU].map((dayOfWeek) => ({ dayOfWeek, startTime: "11:00", endTime: "21:00", label: "Lunch & Dinner" })),
  ...[FRI, SAT].map((dayOfWeek) => ({ dayOfWeek, startTime: "11:00", endTime: "22:00", label: "Lunch & Dinner" })),
];

const SITE = "https://hotpot-feast-forge.lovable.app/assets";

/** The four photos on the previous site, with their original alt text. */
export const MEDIA: { file: string; alt: string; tag: MediaTag; width: number; height: number; featured?: boolean; focalX?: number; focalY?: number; sourceUrl: string }[] = [
  { file: "hero-bbq.jpg", alt: "Sizzling Korean BBQ marbled beef on charcoal grill", tag: "bbq", width: 1920, height: 1080, featured: true, focalY: 55, sourceUrl: `${SITE}/hero-bbq-Bkkbd3rK.jpg` },
  { file: "meat-platter.jpg", alt: "Premium marbled beef platter", tag: "bbq", width: 1024, height: 1024, featured: true, sourceUrl: `${SITE}/meat-platter-C_qJs0Sr.jpg` },
  { file: "hotpot.jpg", alt: "Bubbling spicy Korean hot pot", tag: "hot-pot", width: 1024, height: 1024, featured: true, sourceUrl: `${SITE}/hotpot-CbWViJiH.jpg` },
  { file: "banchan.jpg", alt: "Korean banchan side dishes", tag: "banchan", width: 1024, height: 1024, featured: true, sourceUrl: `${SITE}/banchan-DXZFqz6J.jpg` },
];
