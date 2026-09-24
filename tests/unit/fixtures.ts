import type { AycePricing, BookingSettings, BookingWindow, Hours, MenuCategory, MenuItem } from "@/db/schema";
import type { Clock } from "@/lib/availability";

export const settings = (over: Partial<BookingSettings> = {}): BookingSettings => ({
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
  seatingPreferences: [],
  occasions: [],
  timezone: "America/Chicago",
  createdAt: "",
  updatedAt: "",
  ...over,
});

export const window = (dayOfWeek: number, startTime: string, endTime: string, label: string | null = null): BookingWindow => ({
  id: dayOfWeek * 10,
  dayOfWeek,
  startTime,
  endTime,
  label,
  active: true,
  createdAt: "",
  updatedAt: "",
});

/** Wednesday 2026-09-23 10:00 in the restaurant's zone. */
export const clock = (over: Partial<Clock> = {}): Clock => ({ date: "2026-09-23", time: "10:00", minutes: 600, dayOfWeek: 3, ...over });

export const hoursRow = (category: Hours["category"], dayOfWeek: number, opensAt: string | null, closesAt: string | null, isClosed = false): Hours => ({
  id: 0,
  category,
  dayOfWeek,
  opensAt,
  closesAt,
  isClosed,
  note: null,
  createdAt: "",
  updatedAt: "",
});

export const category = (over: Partial<MenuCategory> = {}): MenuCategory => ({
  id: 1,
  name: "Korean BBQ",
  slug: "korean-bbq",
  tagline: "Grill at Your Table",
  description: null,
  hoursNote: null,
  hoursCategory: "store",
  availableDays: null,
  startTime: null,
  endTime: null,
  image: null,
  displayOrder: 0,
  active: true,
  createdAt: "",
  updatedAt: "",
  ...over,
});

export const item = (over: Partial<MenuItem> = {}): MenuItem => ({
  id: 1,
  sectionId: 1,
  name: "Sliced Beef Brisket",
  koreanName: "차돌박이",
  slug: "sliced-beef-brisket",
  description: "Thinly shaved, melts on the grill",
  price: 1400,
  priceNote: null,
  image: null,
  imageAlt: null,
  dietaryTags: [],
  availabilityType: "always",
  availableDays: null,
  availableStartTime: null,
  availableEndTime: null,
  availabilityNote: null,
  notes: null,
  featured: true,
  active: true,
  displayOrder: 0,
  createdAt: "",
  updatedAt: "",
  ...over,
});

/** Store hours matching the seed: Sun–Thu 11–10, Fri–Sat 11–11. */
export const storeHours: Hours[] = [
  hoursRow("store", 0, "11:00", "22:00"),
  hoursRow("store", 1, "11:00", "22:00"),
  hoursRow("store", 2, "11:00", "22:00"),
  hoursRow("store", 3, "11:00", "22:00"),
  hoursRow("store", 4, "11:00", "22:00"),
  hoursRow("store", 5, "11:00", "23:00"),
  hoursRow("store", 6, "11:00", "23:00"),
];

const ayceRow = (id: number, over: Partial<AycePricing>): AycePricing => ({
  id,
  label: "Monday – Friday",
  days: [1, 2, 3, 4, 5],
  includesHolidays: false,
  session: "Lunch",
  startTime: null,
  endTime: null,
  adultPrice: 0,
  childPrice: null,
  childLabel: "Child (4–10)",
  note: null,
  displayOrder: id,
  active: true,
  createdAt: "",
  updatedAt: "",
  ...over,
});

/** All-you-can-eat rows matching the seed. */
export const ayceRows: AycePricing[] = [
  ayceRow(1, { session: "Lunch", startTime: "11:00", endTime: "16:00", adultPrice: 2299, childPrice: 1299 }),
  ayceRow(2, { session: "Dinner", startTime: "16:00", endTime: null, adultPrice: 2899, childPrice: 1499 }),
  ayceRow(3, { label: "Sat · Sun · Holidays", days: [6, 0], includesHolidays: true, session: "All Day", adultPrice: 3499, childPrice: 1699 }),
];
