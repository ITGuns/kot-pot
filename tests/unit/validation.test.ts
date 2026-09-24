import { describe, expect, it } from "vitest";
import { ayceInput, bookingSettingsInput, dateOverrideInput, fieldErrors, hoursRowInput, mediaInput, menuItemInput, reservationInput, restaurantInfoInput } from "@/lib/validation";

const validReservation = {
  date: "2026-09-26",
  time: "19:00",
  partySize: "4",
  firstName: " Ada ",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "(956) 555-0100",
  specialRequests: "",
  seatingPreference: "",
  occasion: "",
  idempotencyKey: "0f3c1b2a-1111-2222-3333-444455556666",
};

describe("reservationInput", () => {
  it("coerces and trims a valid submission", () => {
    const r = reservationInput.parse(validReservation);
    expect(r.partySize).toBe(4);
    expect(r.firstName).toBe("Ada");
    expect(r.specialRequests).toBeNull();
  });
  it("reports field-level errors", () => {
    const r = reservationInput.safeParse({ ...validReservation, email: "nope", phone: "12", time: "7pm", firstName: "" });
    expect(r.success).toBe(false);
    if (r.success) return;
    const errs = fieldErrors(r.error);
    expect(errs.email).toBe("Enter a valid email");
    expect(errs.phone).toBeTruthy();
    expect(errs.time).toBeTruthy();
    expect(errs.firstName).toBe("First name is required");
  });
});

describe("menuItemInput", () => {
  const base = { sectionId: "3", name: "Test", dietaryTags: [], modifierGroupIds: [] };
  it("parses dollar strings into cents and blanks into null", () => {
    const r = menuItemInput.parse({ ...base, price: "$14", koreanName: " 차돌박이 " });
    expect(r.price).toBe(1400);
    expect(r.koreanName).toBe("차돌박이");
    expect(r.availabilityType).toBe("always");
    expect(menuItemInput.parse({ ...base, price: "" }).price).toBeNull();
  });
  it("rejects negative or non-numeric prices", () => {
    expect(menuItemInput.safeParse({ ...base, price: "-2" }).success).toBe(false);
    expect(menuItemInput.safeParse({ ...base, price: "abc" }).success).toBe(false);
  });
  it("normalises day lists and accepts the limited availability type", () => {
    expect(menuItemInput.parse({ ...base, availabilityType: "days", availableDays: ["6", "5", "5"] }).availableDays).toEqual([5, 6]);
    expect(menuItemInput.parse({ ...base, availabilityType: "limited" }).availabilityType).toBe("limited");
  });
});

describe("hoursRowInput", () => {
  it("accepts HH:MM and rejects bad formats", () => {
    expect(hoursRowInput.parse({ category: "store", dayOfWeek: "1", opensAt: "11:00", closesAt: "22:00", isClosed: false })).toMatchObject({ opensAt: "11:00", closesAt: "22:00" });
    expect(hoursRowInput.safeParse({ category: "store", dayOfWeek: 1, opensAt: "11am", closesAt: "22:00" }).success).toBe(false);
  });
});

describe("bookingSettingsInput", () => {
  it("bounds every numeric rule", () => {
    const ok = bookingSettingsInput.safeParse({ slotIntervalMinutes: 30, turnTimeMinutes: 90, minPartySize: 1, maxPartySize: 8, largePartyThreshold: 7, maxBookingsPerSlot: 6, maxCoversPerSlot: 36, minLeadTimeMinutes: 60, maxDaysInAdvance: 60 });
    expect(ok.success).toBe(true);
    expect(bookingSettingsInput.safeParse({ slotIntervalMinutes: 3, turnTimeMinutes: 90, minPartySize: 1, maxPartySize: 8, largePartyThreshold: 7, maxBookingsPerSlot: 6, maxCoversPerSlot: 36, minLeadTimeMinutes: 60, maxDaysInAdvance: 60 }).success).toBe(false);
  });
});

describe("restaurantInfoInput", () => {
  const base = { name: "Kot Pot I", tagline: "Authentic Korean · Korean BBQ · Hot Pot", category: "Korean BBQ & Hot Pot", description: "d", addressLine1: "400 W Nolana Ave Ste V", city: "McAllen", state: "TX", zip: "78504", phone: "(956) 843-0065", serviceTypes: ["Dine-in"] };
  it("accepts blank optional fields and validates rating, review count and URLs", () => {
    const r = restaurantInfoInput.parse({ ...base, email: "", website: "", rating: "4.5", reviewCount: "411", instagramUrl: "https://instagram.com/x" });
    expect(r.email).toBeNull();
    expect(r.website).toBeNull();
    expect(r.rating).toBe("4.5");
    expect(r.reviewCount).toBe(411);
    expect(restaurantInfoInput.safeParse({ ...base, rating: "7" }).success).toBe(false);
    expect(restaurantInfoInput.safeParse({ ...base, instagramUrl: "instagram.com/x" }).success).toBe(false);
    expect(restaurantInfoInput.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });
});

describe("ayceInput / mediaInput / dateOverrideInput", () => {
  it("parses all-you-can-eat rows", () => {
    const r = ayceInput.parse({ label: "Monday – Friday", days: ["1", "2"], session: "Lunch", startTime: "11:00", endTime: "16:00", adultPrice: "22.99", childPrice: "12.99", childLabel: "Child (4–10)" });
    expect(r.adultPrice).toBe(2299);
    expect(r.childPrice).toBe(1299);
    expect(r.days).toEqual([1, 2]);
    expect(ayceInput.safeParse({ label: "x", days: [1], session: "Lunch", adultPrice: "" }).success).toBe(false);
  });
  it("requires alt text on media and bounds the focal point", () => {
    expect(mediaInput.safeParse({ id: 1, alt: "", tag: "bbq" }).success).toBe(false);
    expect(mediaInput.parse({ id: 1, alt: "Grill", tag: "bbq", focalX: "70", focalY: "40" })).toMatchObject({ focalX: 70, focalY: 40, inGallery: true });
    expect(mediaInput.safeParse({ id: 1, alt: "Grill", focalX: 120 }).success).toBe(false);
  });
  it("parses holiday overrides", () => {
    expect(dateOverrideInput.parse({ date: "2026-11-26", closed: false, startTime: "", endTime: "", isHoliday: true, reason: "Thanksgiving" })).toMatchObject({ closed: false, isHoliday: true, startTime: null, endTime: null });
  });
});
