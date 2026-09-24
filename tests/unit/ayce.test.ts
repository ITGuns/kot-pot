import { describe, expect, it } from "vitest";
import { currentAyce, groupAyce, sessionHoursLabel, todaysAyceGroup } from "@/lib/ayce";
import { time12 } from "@/lib/format";
import { ayceRows, clock } from "./fixtures";

describe("groupAyce", () => {
  it("groups rows by day-group label in display order", () => {
    const groups = groupAyce(ayceRows);
    expect(groups.map((g) => g.label)).toEqual(["Monday – Friday", "Sat · Sun · Holidays"]);
    expect(groups[0].sessions.map((s) => s.session)).toEqual(["Lunch", "Dinner"]);
    expect(groups[1].includesHolidays).toBe(true);
    expect(groups[1].key).toBe("sat-sun-holidays");
  });
  it("skips inactive rows", () => {
    expect(groupAyce(ayceRows.map((r) => (r.id === 3 ? { ...r, active: false } : r))).map((g) => g.label)).toEqual(["Monday – Friday"]);
  });
});

describe("todaysAyceGroup / currentAyce", () => {
  it("picks the weekday group with the running session", () => {
    expect(todaysAyceGroup(ayceRows, clock({ dayOfWeek: 3 }), false)?.label).toBe("Monday – Friday");
    expect(currentAyce(ayceRows, clock({ dayOfWeek: 3, minutes: 12 * 60 }), false)?.session).toBe("Lunch");
    expect(currentAyce(ayceRows, clock({ dayOfWeek: 3, minutes: 18 * 60 }), false)?.session).toBe("Dinner");
    expect(currentAyce(ayceRows, clock({ dayOfWeek: 3, minutes: 23 * 60 }), false)?.session).toBe("Dinner"); // open-ended until close
    expect(currentAyce(ayceRows, clock({ dayOfWeek: 3, minutes: 9 * 60 }), false)).toBeNull();
  });
  it("uses the weekend group on Saturday/Sunday and on flagged holidays", () => {
    expect(todaysAyceGroup(ayceRows, clock({ dayOfWeek: 6 }), false)?.label).toBe("Sat · Sun · Holidays");
    expect(todaysAyceGroup(ayceRows, clock({ dayOfWeek: 2 }), true)?.label).toBe("Sat · Sun · Holidays");
    expect(currentAyce(ayceRows, clock({ dayOfWeek: 0, minutes: 12 * 60 }), false)?.adultPrice).toBe(3499);
  });
});

describe("sessionHoursLabel", () => {
  it("formats open-ended and all-day sessions", () => {
    expect(sessionHoursLabel(ayceRows[0], time12)).toBe("11 AM – 4 PM");
    expect(sessionHoursLabel(ayceRows[1], time12)).toBe("4 PM – Close");
    expect(sessionHoursLabel(ayceRows[2], time12)).toBe("All day");
  });
});
