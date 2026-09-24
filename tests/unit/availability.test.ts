import { describe, expect, it } from "vitest";
import { categoryOpenNow, getClock, itemAvailability, storeStatus, summarizeHours } from "@/lib/availability";
import { category, clock, item, storeHours } from "./fixtures";

describe("getClock", () => {
  it("resolves the restaurant's local date/time in Central time", () => {
    const c = getClock("America/Chicago", new Date("2026-09-26T23:30:00Z")); // 6:30 PM CDT Saturday
    expect(c).toMatchObject({ date: "2026-09-26", time: "18:30", minutes: 1110, dayOfWeek: 6 });
    const late = getClock("America/Chicago", new Date("2026-09-27T04:30:00Z")); // still Saturday 11:30 PM local
    expect(late.date).toBe("2026-09-26");
  });
});

describe("storeStatus", () => {
  it("is open during restaurant hours and reports closing time", () => {
    expect(storeStatus(storeHours, clock({ dayOfWeek: 3, time: "13:00", minutes: 780 }))).toMatchObject({ isOpen: true, label: "Open now", detail: "Closes 10 PM" });
    expect(storeStatus(storeHours, clock({ dayOfWeek: 5, time: "22:30", minutes: 1350 }))).toMatchObject({ isOpen: true, label: "Closing soon", detail: "Closes 11 PM" });
  });
  it("points to the next opening when closed", () => {
    expect(storeStatus(storeHours, clock({ dayOfWeek: 3, time: "10:00", minutes: 600 })).detail).toBe("Opens today at 11 AM");
    expect(storeStatus(storeHours, clock({ dayOfWeek: 0, time: "23:00", minutes: 1380 })).detail).toBe("Opens tomorrow at 11 AM");
  });
});

describe("itemAvailability", () => {
  const bbq = category();
  it("follows restaurant hours for always-available items", () => {
    expect(itemAvailability(item(), bbq, storeHours, clock({ dayOfWeek: 3, minutes: 13 * 60 }))).toMatchObject({ availableNow: true, availableToday: true, label: null });
    expect(itemAvailability(item(), bbq, storeHours, clock({ dayOfWeek: 3, minutes: 9 * 60 })).availableNow).toBe(false);
    expect(itemAvailability(item(), bbq, storeHours, clock({ dayOfWeek: 3, minutes: 9 * 60 })).availableToday).toBe(true);
  });
  it("respects weekend-only items", () => {
    const weekend = item({ availabilityType: "days", availableDays: [0, 6], availabilityNote: "Weekends only" });
    expect(itemAvailability(weekend, bbq, storeHours, clock({ dayOfWeek: 3, minutes: 13 * 60 }))).toMatchObject({ availableToday: false, availableNow: false, label: "Weekends only" });
    expect(itemAvailability(weekend, bbq, storeHours, clock({ dayOfWeek: 6, minutes: 13 * 60 }))).toMatchObject({ availableToday: true, availableNow: true });
  });
  it("derives a label from the days when none is given and applies time windows", () => {
    const lunch = item({ availabilityType: "schedule", availableDays: [1, 2, 3, 4, 5], availableStartTime: "11:00", availableEndTime: "16:00" });
    expect(itemAvailability(lunch, bbq, storeHours, clock({ dayOfWeek: 3, minutes: 12 * 60 }))).toMatchObject({ availableNow: true, label: "11 AM–4 PM" });
    expect(itemAvailability(lunch, bbq, storeHours, clock({ dayOfWeek: 3, minutes: 17 * 60 })).availableNow).toBe(false);
    const days = item({ availabilityType: "days", availableDays: [5, 6] });
    expect(itemAvailability(days, bbq, storeHours, clock()).label).toBe("Fri & Sat only");
  });
  it("marks seasonal, limited and inactive items", () => {
    expect(itemAvailability(item({ availabilityType: "seasonal" }), bbq, storeHours, clock()).label).toBe("Seasonal");
    expect(itemAvailability(item({ availabilityType: "limited" }), bbq, storeHours, clock()).label).toBe("Limited availability");
    expect(itemAvailability(item({ active: false }), bbq, storeHours, clock())).toMatchObject({ availableNow: false, label: "Currently unavailable" });
  });
});

describe("categoryOpenNow", () => {
  it("uses custom days/times when no hours category is linked", () => {
    const cat = category({ hoursCategory: null, availableDays: [0], startTime: "11:00", endTime: "16:00" });
    expect(categoryOpenNow(cat, storeHours, clock({ dayOfWeek: 0, minutes: 12 * 60 }))).toBe(true);
    expect(categoryOpenNow(cat, storeHours, clock({ dayOfWeek: 0, minutes: 17 * 60 }))).toBe(false);
    expect(categoryOpenNow(cat, storeHours, clock({ dayOfWeek: 1, minutes: 12 * 60 }))).toBe(false);
  });
});

describe("summarizeHours", () => {
  it("groups consecutive days with identical hours", () => {
    const rows = summarizeHours(storeHours, "store");
    expect(rows.map((r) => `${r.days} ${r.hours}`)).toEqual(["Mon – Thu 11 AM – 10 PM", "Fri – Sat 11 AM – 11 PM", "Sun 11 AM – 10 PM"]);
  });
});
