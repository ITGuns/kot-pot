import type { Hours, HoursCategory, MenuCategory, MenuItem, Modifier } from "@/db/schema";
import { DAY_NAMES } from "./constants";
import { daysLabel, time12, toMinutes } from "./format";

export type Clock = {
  /** YYYY-MM-DD in restaurant timezone */
  date: string;
  /** HH:MM */
  time: string;
  minutes: number;
  dayOfWeek: number;
};

export function getClock(timezone: string, now: Date = new Date()): Clock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  const time = `${hour}:${get("minute")}`;
  const weekdayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time,
    minutes: toMinutes(time),
    dayOfWeek: weekdayIdx,
  };
}

export function hoursFor(rows: Hours[], category: HoursCategory, dayOfWeek: number): Hours | undefined {
  return rows.find((h) => h.category === category && h.dayOfWeek === dayOfWeek);
}

/** Resolve an hours row's window, falling back to store opening time when opensAt is null. */
export function resolveWindow(rows: Hours[], row: Hours | undefined): { open: number; close: number } | null {
  if (!row || row.isClosed || !row.closesAt) return null;
  let opensAt = row.opensAt;
  if (!opensAt) {
    const store = hoursFor(rows, "store", row.dayOfWeek);
    opensAt = store?.opensAt ?? null;
  }
  if (!opensAt) return null;
  const store = hoursFor(rows, "store", row.dayOfWeek);
  const storeClose = store?.closesAt ? toMinutes(store.closesAt) : Infinity;
  return { open: toMinutes(opensAt), close: Math.min(toMinutes(row.closesAt), storeClose) };
}

export function isOpenNow(rows: Hours[], category: HoursCategory, clock: Clock): boolean {
  const win = resolveWindow(rows, hoursFor(rows, category, clock.dayOfWeek));
  if (!win) return false;
  return clock.minutes >= win.open && clock.minutes < win.close;
}

export type StoreStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
  today: Hours | undefined;
};

export function storeStatus(rows: Hours[], clock: Clock): StoreStatus {
  const today = hoursFor(rows, "store", clock.dayOfWeek);
  const win = resolveWindow(rows, today);
  if (win && clock.minutes >= win.open && clock.minutes < win.close) {
    const closingSoon = win.close - clock.minutes <= 60;
    return {
      isOpen: true,
      label: closingSoon ? "Closing soon" : "Open now",
      detail: `Closes ${time12(today!.closesAt, { compact: true })}`,
      today,
    };
  }
  if (win && clock.minutes < win.open) {
    return { isOpen: false, label: "Closed", detail: `Opens today at ${time12(today!.opensAt, { compact: true })}`, today };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (clock.dayOfWeek + i) % 7;
    const row = hoursFor(rows, "store", d);
    const w = resolveWindow(rows, row);
    if (w) {
      const dayLabel = i === 1 ? "tomorrow" : DAY_NAMES[d];
      return { isOpen: false, label: "Closed", detail: `Opens ${dayLabel} at ${time12(row!.opensAt, { compact: true })}`, today };
    }
  }
  return { isOpen: false, label: "Closed", detail: "", today };
}

export type AvailabilityInfo = {
  /** true when both the category service window and the item's own rule pass right now */
  availableNow: boolean;
  /** true when the item's own rule passes today regardless of time */
  availableToday: boolean;
  /** short badge text, e.g. "Fri & Sat only", "Seasonal", "Limited availability" */
  label: string | null;
  /** longer explanation for modals */
  detail: string | null;
};

function withinTimes(start: string | null | undefined, end: string | null | undefined, minutes: number): boolean {
  if (start && minutes < toMinutes(start)) return false;
  if (end && minutes >= toMinutes(end)) return false;
  return true;
}

export function categoryOpenNow(category: MenuCategory, rows: Hours[], clock: Clock): boolean {
  if (category.hoursCategory) {
    return isOpenNow(rows, category.hoursCategory, clock);
  }
  if (category.availableDays && !category.availableDays.includes(clock.dayOfWeek)) return false;
  return withinTimes(category.startTime, category.endTime, clock.minutes);
}

export function categoryOpenToday(category: MenuCategory, rows: Hours[], clock: Clock): boolean {
  if (category.hoursCategory) {
    return resolveWindow(rows, hoursFor(rows, category.hoursCategory, clock.dayOfWeek)) !== null;
  }
  if (category.availableDays && !category.availableDays.includes(clock.dayOfWeek)) return false;
  return true;
}

export function itemAvailability(
  item: Pick<MenuItem, "active" | "availabilityType" | "availableDays" | "availableStartTime" | "availableEndTime" | "availabilityNote">,
  category: MenuCategory,
  rows: Hours[],
  clock: Clock,
): AvailabilityInfo {
  const catNow = categoryOpenNow(category, rows, clock);
  const catToday = categoryOpenToday(category, rows, clock);

  let itemToday = true;
  let itemNow = true;
  let label: string | null = item.availabilityNote ?? null;
  let detail: string | null = null;

  switch (item.availabilityType) {
    case "days":
      if (item.availableDays && !item.availableDays.includes(clock.dayOfWeek)) {
        itemToday = false;
        itemNow = false;
      }
      if (!withinTimes(item.availableStartTime, item.availableEndTime, clock.minutes)) itemNow = false;
      if (!label && item.availableDays) label = `${daysLabel(item.availableDays)} only`;
      detail = `Available ${daysLabel(item.availableDays)}${item.availableEndTime ? ` until ${time12(item.availableEndTime, { compact: true })}` : ""}`;
      break;
    case "schedule":
      if (item.availableDays && !item.availableDays.includes(clock.dayOfWeek)) {
        itemToday = false;
        itemNow = false;
      }
      if (!withinTimes(item.availableStartTime, item.availableEndTime, clock.minutes)) itemNow = false;
      if (!label) {
        const s = item.availableStartTime ? time12(item.availableStartTime, { compact: true }) : null;
        const e = item.availableEndTime ? time12(item.availableEndTime, { compact: true }) : null;
        label = s && e ? `${s}–${e}` : e ? `Until ${e}` : s ? `From ${s}` : null;
      }
      detail = label;
      break;
    case "seasonal":
      if (!label) label = "Seasonal";
      detail = "Rotating seasonal item. Ask your server what's on today.";
      break;
    case "limited":
      if (!label) label = "Limited availability";
      detail = "Limited quantities each day. Ask your server before ordering.";
      break;
    default:
      break;
  }

  if (!item.active) {
    return { availableNow: false, availableToday: false, label: "Currently unavailable", detail: "Temporarily off the menu." };
  }

  return {
    availableNow: catNow && itemNow,
    availableToday: catToday && itemToday,
    label,
    detail,
  };
}

export function modifierAvailableToday(mod: Pick<Modifier, "availableDays" | "active">, clock: Clock): boolean {
  if (!mod.active) return false;
  if (mod.availableDays && !mod.availableDays.includes(clock.dayOfWeek)) return false;
  return true;
}

/** Human summary for a hours category across the week, grouping identical consecutive days. */
export function summarizeHours(rows: Hours[], category: HoursCategory): { days: string; hours: string; note?: string }[] {
  const week = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
  const groups: { days: number[]; key: string; hours: string; note?: string }[] = [];
  for (const d of week) {
    const row = hoursFor(rows, category, d);
    let key: string;
    let hoursText: string;
    if (!row || row.isClosed) {
      key = "closed";
      hoursText = "Closed";
    } else {
      const open = row.opensAt ? time12(row.opensAt, { compact: true }) : "Open";
      const close = row.closesAt ? time12(row.closesAt, { compact: true }) : "";
      hoursText = row.opensAt ? `${open} – ${close}` : `’til ${close}`;
      key = hoursText;
    }
    const last = groups[groups.length - 1];
    if (last && last.key === key && last.days[last.days.length - 1] === (d === 0 ? 6 : d - 1)) {
      last.days.push(d);
    } else {
      groups.push({ days: [d], key, hours: hoursText, note: row?.note ?? undefined });
    }
  }
  // The week is grouped Mon→Sun; fold a matching Sunday into the leading Monday group ("Sun – Thu").
  if (groups.length > 1) {
    const first = groups[0];
    const last = groups[groups.length - 1];
    if (last.days.length === 1 && last.days[0] === 0 && first.days[0] === 1 && last.key === first.key) {
      first.days = [0, ...first.days];
      groups.pop();
    }
  }
  return groups
    .filter((g) => !(g.key === "closed" && category !== "store"))
    .map((g) => ({ days: daysLabelOrdered(g.days), hours: g.hours, note: g.note }));
}

function daysLabelOrdered(days: number[]): string {
  const short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (days.length === 1) return short[days[0]];
  if (days.length === 7) return "Every day";
  return `${short[days[0]]} – ${short[days[days.length - 1]]}`;
}
