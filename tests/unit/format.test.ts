import { describe, expect, it } from "vitest";
import { addDays, dayOfWeek, daysLabel, daysLabelWeek, formatRelative, fromMinutes, joinWithin, money, phoneHref, priceAdjustment, time12, toMinutes } from "@/lib/format";

describe("money", () => {
  it("formats cents, dropping .00 unless forced", () => {
    expect(money(2299)).toBe("$22.99");
    expect(money(1400)).toBe("$14");
    expect(money(1400, { always: true })).toBe("$14.00");
    expect(money(4800)).toBe("$48");
    expect(money(null)).toBe("");
  });
  it("labels modifier price adjustments", () => {
    expect(priceAdjustment(0)).toBe("included");
    expect(priceAdjustment(200)).toBe("+$2");
    expect(priceAdjustment(75)).toBe("+$0.75");
    expect(priceAdjustment(-100)).toBe("−$1");
  });
});

describe("time helpers", () => {
  it("converts between HH:MM and minutes", () => {
    expect(toMinutes("11:30")).toBe(690);
    expect(fromMinutes(690)).toBe("11:30");
    expect(fromMinutes(1440)).toBe("00:00");
  });
  it("renders 12-hour labels", () => {
    expect(time12("17:30")).toBe("5:30 PM");
    expect(time12("12:00", { compact: true })).toBe("12 PM");
    expect(time12("00:15")).toBe("12:15 AM");
    expect(time12(null)).toBe("");
  });
});

describe("date helpers", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
  it("returns weekday independent of local timezone", () => {
    expect(dayOfWeek("2026-09-26")).toBe(6);
    expect(dayOfWeek("2026-09-27")).toBe(0);
  });
  it("labels day sets", () => {
    expect(daysLabel([5, 6])).toBe("Fri & Sat");
    expect(daysLabel([3, 4, 5])).toBe("Wed–Fri");
    expect(daysLabel([2, 4])).toBe("Tue, Thu");
    expect(daysLabel([0, 1, 2, 3, 4, 5, 6])).toBe("Daily");
    expect(daysLabel([])).toBe("");
  });
  it("labels day sets Monday-first for pricing groups", () => {
    expect(daysLabelWeek([1, 2, 3, 4, 5])).toBe("Mon–Fri");
    expect(daysLabelWeek([6, 0])).toBe("Sat & Sun");
    expect(daysLabelWeek([0, 6])).toBe("Sat & Sun");
    expect(daysLabelWeek([5, 6, 0])).toBe("Fri–Sun");
    expect(daysLabelWeek([0, 1, 2, 3, 4, 5, 6])).toBe("Daily");
  });
  it("joins names within a character budget", () => {
    expect(joinWithin(["Brisket", "Bulgogi", "Pork Belly"], 18)).toBe("Brisket, Bulgogi");
    expect(joinWithin(["Brisket"], 3)).toBe("");
  });
});

describe("formatRelative", () => {
  it("accepts ISO and Postgres timestamptz strings", () => {
    const now = Date.now();
    const iso = new Date(now - 5 * 60_000).toISOString();
    expect(formatRelative(iso)).toBe("5m ago");
    const pg = new Date(now - 3 * 3600_000).toISOString().replace("T", " ").replace("Z", "+00");
    expect(formatRelative(pg)).toBe("3h ago");
    expect(formatRelative("not a date")).toBe("");
  });
});

describe("phoneHref", () => {
  it("builds a tel: link", () => {
    expect(phoneHref("(956) 843-0065")).toBe("tel:+19568430065");
  });
});
