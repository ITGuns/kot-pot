import { z } from "zod";
import { AVAILABILITY_TYPES, DIETARY_TAGS, HOURS_CATEGORIES, MEDIA_TAGS, RESERVATION_STATUSES } from "@/db/schema";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h)");
const optionalHhmm = z.union([hhmm, z.literal(""), z.null()]).transform((v) => (v ? v : null));
const phone = z
  .string()
  .trim()
  .min(7, "Enter a phone number")
  .max(25)
  .regex(/^[\d\s()+.-]+$/, "Enter a valid phone number");
const emptyToNull = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v ? v : null))
    .nullable()
    .optional();
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v ? v : null))
  .refine((v) => v == null || /^https?:\/\/\S+$/.test(v), "Enter a full URL starting with https://")
  .nullable()
  .optional();
const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .transform((v) => (v ? v : null))
  .refine((v) => v == null || z.email().safeParse(v).success, "Enter a valid email")
  .nullable()
  .optional();

/** cents from a dollar string / number; "" → null */
const cents = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((v, ctx) => {
    if (v === "" || v == null) return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/[$,\s]/g, ""));
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({ code: "custom", message: "Enter a valid price" });
      return z.NEVER;
    }
    return Math.round(n * 100);
  });

const daysArray = z
  .array(z.coerce.number().int().min(0).max(6))
  .transform((a) => [...new Set(a)].sort())
  .nullable()
  .optional();

const stringList = (max = 60) => z.array(z.string().trim().min(1).max(max)).default([]);

/* ---------------- Public ---------------- */

export const reservationInput = z.object({
  date: ymd,
  time: hhmm,
  partySize: z.coerce.number().int().min(1).max(50),
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.email("Enter a valid email").max(120),
  phone,
  specialRequests: emptyToNull(500),
  seatingPreference: emptyToNull(60),
  occasion: emptyToNull(60),
  idempotencyKey: z.string().trim().min(8).max(64),
});
export type ReservationInput = z.infer<typeof reservationInput>;

export const loginInput = z.object({
  email: z.email().max(120),
  password: z.string().min(1).max(200),
});

/* ---------------- Admin: menu ---------------- */

export const categoryInput = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().max(80).optional(),
  tagline: emptyToNull(120),
  description: emptyToNull(500),
  hoursNote: emptyToNull(200),
  hoursCategory: z.union([z.enum(HOURS_CATEGORIES), z.literal("")]).transform((v) => (v ? v : null)),
  availableDays: daysArray,
  startTime: optionalHhmm.optional(),
  endTime: optionalHhmm.optional(),
  image: emptyToNull(300),
  active: z.coerce.boolean().default(true),
});

export const sectionInput = z.object({
  id: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int(),
  name: z.string().trim().min(1).max(80),
  description: emptyToNull(300),
  sectionType: z.enum(["items", "addons"]).default("items"),
  linkedModifierGroupId: z
    .union([z.coerce.number().int(), z.literal(""), z.null()])
    .transform((v) => (v === "" || v == null ? null : v))
    .optional(),
  active: z.coerce.boolean().default(true),
});

export const menuItemInput = z.object({
  id: z.coerce.number().int().optional(),
  sectionId: z.coerce.number().int(),
  name: z.string().trim().min(1, "Name is required").max(120),
  koreanName: emptyToNull(80),
  slug: z.string().trim().max(120).optional(),
  description: emptyToNull(600),
  price: cents,
  priceNote: emptyToNull(60),
  image: emptyToNull(300),
  imageAlt: emptyToNull(200),
  dietaryTags: z.array(z.enum(DIETARY_TAGS)).default([]),
  availabilityType: z.enum(AVAILABILITY_TYPES).default("always"),
  availableDays: daysArray,
  availableStartTime: optionalHhmm.optional(),
  availableEndTime: optionalHhmm.optional(),
  availabilityNote: emptyToNull(80),
  notes: emptyToNull(300),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
  modifierGroupIds: z.array(z.coerce.number().int()).default([]),
});
export type MenuItemInput = z.infer<typeof menuItemInput>;

export const modifierGroupInput = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(1).max(80),
  description: emptyToNull(200),
  required: z.coerce.boolean().default(false),
  minSelections: z.coerce.number().int().min(0).max(20).default(0),
  maxSelections: z.coerce.number().int().min(1).max(20).default(1),
  active: z.coerce.boolean().default(true),
});

export const modifierInput = z.object({
  id: z.coerce.number().int().optional(),
  groupId: z.coerce.number().int(),
  name: z.string().trim().min(1).max(80),
  description: emptyToNull(200),
  priceAdjustment: cents.transform((v) => v ?? 0),
  dietaryTags: z.array(z.enum(DIETARY_TAGS)).default([]),
  availabilityNote: emptyToNull(80),
  availableDays: daysArray,
  active: z.coerce.boolean().default(true),
});

export const ayceInput = z.object({
  id: z.coerce.number().int().optional(),
  label: z.string().trim().min(1, "Give this day group a name").max(60),
  days: z.array(z.coerce.number().int().min(0).max(6)).transform((a) => [...new Set(a)].sort()),
  includesHolidays: z.coerce.boolean().default(false),
  session: z.string().trim().min(1, "Name the session (Lunch, Dinner, All Day…)").max(40),
  startTime: optionalHhmm.optional(),
  endTime: optionalHhmm.optional(),
  adultPrice: cents.refine((v) => v != null, "Enter the adult price"),
  childPrice: cents,
  childLabel: z.string().trim().min(1).max(40).default("Child"),
  note: emptyToNull(160),
  active: z.coerce.boolean().default(true),
});

/* ---------------- Admin: media ---------------- */

export const mediaInput = z.object({
  id: z.coerce.number().int(),
  alt: z.string().trim().min(1, "Alt text is required for accessibility").max(200),
  caption: emptyToNull(200),
  tag: z.enum(MEDIA_TAGS).default("other"),
  focalX: z.coerce.number().int().min(0).max(100).default(50),
  focalY: z.coerce.number().int().min(0).max(100).default(50),
  featured: z.coerce.boolean().default(false),
  inGallery: z.coerce.boolean().default(true),
  active: z.coerce.boolean().default(true),
});

/* ---------------- Admin: hours + booking ---------------- */

export const hoursRowInput = z.object({
  category: z.enum(HOURS_CATEGORIES),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  opensAt: optionalHhmm,
  closesAt: optionalHhmm,
  isClosed: z.coerce.boolean().default(false),
  note: emptyToNull(300),
});

export const bookingSettingsInput = z.object({
  slotIntervalMinutes: z.coerce.number().int().min(5).max(120),
  turnTimeMinutes: z.coerce.number().int().min(15).max(360),
  minPartySize: z.coerce.number().int().min(1).max(50),
  maxPartySize: z.coerce.number().int().min(1).max(50),
  largePartyThreshold: z.coerce.number().int().min(1).max(51),
  maxBookingsPerSlot: z.coerce.number().int().min(1).max(100),
  maxCoversPerSlot: z.coerce.number().int().min(1).max(500),
  minLeadTimeMinutes: z.coerce.number().int().min(0).max(10080),
  maxDaysInAdvance: z.coerce.number().int().min(1).max(365),
  autoConfirm: z.coerce.boolean().default(true),
  bookingsEnabled: z.coerce.boolean().default(true),
  seatingPreferences: stringList(),
  occasions: stringList(),
});

export const bookingWindowInput = z.object({
  id: z.coerce.number().int().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: hhmm,
  endTime: hhmm,
  label: emptyToNull(60),
  active: z.coerce.boolean().default(true),
});

export const dateOverrideInput = z.object({
  id: z.coerce.number().int().optional(),
  date: ymd,
  closed: z.coerce.boolean().default(true),
  startTime: optionalHhmm.optional(),
  endTime: optionalHhmm.optional(),
  isHoliday: z.coerce.boolean().default(false),
  reason: emptyToNull(160),
});

export const restaurantInfoInput = z.object({
  name: z.string().trim().min(1).max(100),
  tagline: z.string().trim().min(1).max(200),
  category: z.string().trim().max(120),
  description: z.string().trim().max(1000),
  addressLine1: z.string().trim().min(1).max(120),
  addressLine2: emptyToNull(120),
  city: z.string().trim().min(1).max(60),
  state: z.string().trim().min(2).max(20),
  zip: z.string().trim().min(3).max(12),
  phone: z.string().trim().min(7).max(25),
  email: optionalEmail,
  website: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  yelpUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  rating: z
    .string()
    .trim()
    .max(4)
    .transform((v) => (v ? v : null))
    .refine((v) => v == null || (/^\d(\.\d)?$/.test(v) && Number(v) <= 5), "Rating must be 0–5, e.g. 4.5")
    .nullable()
    .optional(),
  reviewCount: z
    .union([z.coerce.number().int().min(0).max(1_000_000), z.literal(""), z.null()])
    .transform((v) => (v === "" || v == null ? null : v))
    .optional(),
  priceRange: emptyToNull(40),
  serviceTypes: stringList(40),
  heroImage: emptyToNull(300),
  heroImageAlt: emptyToNull(200),
  heroHeadline: emptyToNull(120),
  heroSubheadline: emptyToNull(200),
  ayceBlurb: emptyToNull(300),
  seoTitle: emptyToNull(120),
  seoDescription: emptyToNull(300),
  ogImageUrl: emptyToNull(300),
});

/* ---------------- Admin: reservations ---------------- */

export const adminReservationInput = z.object({
  id: z.coerce.number().int().optional(),
  date: ymd,
  time: hhmm,
  partySize: z.coerce.number().int().min(1).max(100),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.email().max(120),
  phone,
  specialRequests: emptyToNull(500),
  seatingPreference: emptyToNull(60),
  occasion: emptyToNull(60),
  internalNotes: emptyToNull(500),
  status: z.enum(RESERVATION_STATUSES).default("confirmed"),
});

export const statusInput = z.enum(RESERVATION_STATUSES);

/** Flatten zod issues into { field: message } */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
