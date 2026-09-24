import type { AvailabilityType, DietaryTag, HoursCategory, MediaTag, ReservationStatus } from "@/db/schema";

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const DIETARY_LABELS: Record<DietaryTag, { label: string; short: string; description: string }> = {
  vegetarian: { label: "Vegetarian", short: "V", description: "Vegetarian" },
  vegan: { label: "Vegan", short: "VG", description: "Vegan" },
  "gluten-free": { label: "Gluten-free", short: "GF", description: "Gluten-free" },
  spicy: { label: "Spicy", short: "Spicy", description: "Spicy" },
  "contains-shellfish": { label: "Contains shellfish", short: "Shellfish", description: "Contains shellfish" },
  "contains-nuts": { label: "Contains nuts", short: "Nuts", description: "Contains nuts" },
  "non-alcoholic": { label: "Non-alcoholic", short: "N.A.", description: "Non-alcoholic" },
};

export const DIETARY_FILTERS = [
  { key: "vegetarian", label: "Vegetarian", matches: ["vegetarian", "vegan"] },
  { key: "vegan", label: "Vegan", matches: ["vegan"] },
  { key: "gluten-free", label: "Gluten-free", matches: ["gluten-free"] },
  { key: "spicy", label: "Spicy", matches: ["spicy"] },
  { key: "non-alcoholic", label: "Non-alcoholic", matches: ["non-alcoholic"] },
] as const satisfies ReadonlyArray<{ key: string; label: string; matches: readonly DietaryTag[] }>;

export type DietaryFilterKey = (typeof DIETARY_FILTERS)[number]["key"];

export const HOURS_CATEGORY_LABELS: Record<HoursCategory, string> = {
  store: "Restaurant hours",
};

export const AVAILABILITY_LABELS: Record<AvailabilityType, string> = {
  always: "Always (follows restaurant hours)",
  days: "Specific days",
  schedule: "Specific days + times",
  seasonal: "Seasonal / rotating",
  limited: "Limited availability",
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No-show",
};

export const MEDIA_TAG_LABELS: Record<MediaTag, string> = {
  bbq: "Korean BBQ",
  "hot-pot": "Hot Pot",
  banchan: "Banchan",
  drinks: "Drinks",
  interior: "The room",
  other: "Other",
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
