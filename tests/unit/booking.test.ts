import { describe, expect, it } from "vitest";
import { computeAvailability, generateConfirmationCode, type AvailabilityContext } from "@/lib/booking";
import type { Reservation } from "@/db/schema";
import { clock, settings, window } from "./fixtures";

const SAT = "2026-09-26"; // Saturday
const ctx = (over: Partial<AvailabilityContext> = {}): AvailabilityContext => ({
  settings: settings(),
  windows: [window(6, "11:00", "22:00", "Lunch & Dinner"), window(3, "11:00", "21:00")],
  override: undefined,
  reservations: [],
  clock: clock(),
  ...over,
});
const reservation = (time: string, partySize: number, status: Reservation["status"] = "confirmed"): Reservation =>
  ({ id: 1, confirmationCode: "KP-10001", manageToken: "t", idempotencyKey: null, firstName: "A", lastName: "B", email: "a@b.c", phone: "1", partySize, date: SAT, time, specialRequests: null, seatingPreference: null, occasion: null, status, source: "web", internalNotes: null, createdAt: "", updatedAt: "" });

describe("computeAvailability", () => {
  it("generates a slot every interval from first to last seating, inclusive", () => {
    const r = computeAvailability(SAT, 2, ctx());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.slots).toHaveLength(23); // 11:00 … 22:00 every 30 min
    expect(r.slots[0]).toMatchObject({ time: "11:00", label: "11:00 AM", available: true });
    expect(r.slots.at(-1)).toMatchObject({ time: "22:00", label: "10:00 PM" });
    expect(r.label).toBe("Lunch & Dinner");
  });

  it("rejects when online booking is disabled", () => {
    expect(computeAvailability(SAT, 2, ctx({ settings: settings({ bookingsEnabled: false }) }))).toMatchObject({ ok: false, code: "disabled" });
  });

  it("rejects malformed, past and too-far dates", () => {
    expect(computeAvailability("26/09/2026", 2, ctx())).toMatchObject({ ok: false, code: "invalid_date" });
    expect(computeAvailability("2026-09-22", 2, ctx())).toMatchObject({ ok: false, code: "past" });
    expect(computeAvailability("2026-12-31", 2, ctx())).toMatchObject({ ok: false, code: "too_far" });
  });

  it("enforces the configurable online party-size range", () => {
    expect(computeAvailability(SAT, 0, ctx())).toMatchObject({ ok: false, code: "party_size" });
    expect(computeAvailability(SAT, 9, ctx())).toMatchObject({ ok: false, code: "party_size" });
    expect(computeAvailability(SAT, 8, ctx()).ok).toBe(true);
    expect(computeAvailability(SAT, 12, ctx({ settings: settings({ maxPartySize: 12 }) })).ok).toBe(true);
  });

  it("is closed on days without a reservation window", () => {
    expect(computeAvailability("2026-09-28", 2, ctx())).toMatchObject({ ok: false, code: "closed" }); // Monday: no window in this ctx
  });

  it("honours blackout dates and special-hours overrides", () => {
    const closed = computeAvailability(SAT, 2, ctx({ override: { id: 1, date: SAT, closed: true, startTime: null, endTime: null, isHoliday: false, reason: "Private event", createdAt: "", updatedAt: "" } }));
    expect(closed).toMatchObject({ ok: false, code: "closed" });
    expect(closed.ok ? "" : closed.message).toContain("Private event");

    const special = computeAvailability(SAT, 2, ctx({ override: { id: 1, date: SAT, closed: false, startTime: "17:00", endTime: "18:00", isHoliday: false, reason: "Late open", createdAt: "", updatedAt: "" } }));
    expect(special.ok).toBe(true);
    if (special.ok) {
      expect(special.slots.map((s) => s.time)).toEqual(["17:00", "17:30", "18:00"]);
      expect(special.note).toBe("Special hours: Late open");
    }
  });

  it("uses the regular weekly window when a holiday override keeps regular hours", () => {
    const holiday = computeAvailability(SAT, 2, ctx({ override: { id: 1, date: SAT, closed: false, startTime: null, endTime: null, isHoliday: true, reason: "Holiday", createdAt: "", updatedAt: "" } }));
    expect(holiday.ok).toBe(true);
    if (holiday.ok) expect(holiday.slots).toHaveLength(23);
  });

  it("marks past and lead-time slots on the current day", () => {
    const today = "2026-09-23"; // Wednesday, clock at 12:00 → lead 60 min
    const r = computeAvailability(today, 2, ctx({ clock: clock({ time: "12:00", minutes: 720 }) }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const byTime = Object.fromEntries(r.slots.map((s) => [s.time, s]));
    expect(byTime["11:30"]).toMatchObject({ available: false, reason: "past" });
    expect(byTime["12:30"]).toMatchObject({ available: false, reason: "lead" });
    expect(byTime["13:00"]).toMatchObject({ available: true });
  });

  it("fills a slot once max bookings overlap within the turn time", () => {
    const reservations = ["18:00", "18:30", "17:30", "18:00", "18:00", "18:30"].map((t) => reservation(t, 2));
    const r = computeAvailability(SAT, 2, ctx({ reservations }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const byTime = Object.fromEntries(r.slots.map((s) => [s.time, s]));
    expect(byTime["18:00"]).toMatchObject({ available: false, reason: "full" });
    expect(byTime["18:30"]).toMatchObject({ available: false, reason: "full" });
    expect(byTime["16:00"]).toMatchObject({ available: true });
    expect(byTime["20:00"]).toMatchObject({ available: true });
  });

  it("fills a slot when covers would exceed the cap, ignoring cancelled bookings", () => {
    const reservations = [reservation("18:00", 8), reservation("18:00", 8), reservation("18:00", 8), reservation("18:00", 8), reservation("18:00", 8, "cancelled")];
    const r = computeAvailability(SAT, 5, ctx({ reservations }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.slots.find((s) => s.time === "18:00")).toMatchObject({ available: false, reason: "full" }); // 32 + 5 > 36
    const smaller = computeAvailability(SAT, 4, ctx({ reservations }));
    expect(smaller.ok && smaller.slots.find((s) => s.time === "18:00")?.available).toBe(true); // 32 + 4 = 36
  });
});

describe("generateConfirmationCode", () => {
  it("produces KP- codes that never look sequential from 1", () => {
    expect(generateConfirmationCode(1)).toBe("KP-10001");
    expect(generateConfirmationCode(42)).toBe("KP-10042");
  });
});
