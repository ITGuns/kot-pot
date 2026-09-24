import type { AycePricing } from "@/db/schema";
import type { Clock } from "./availability";
import { toMinutes } from "./format";

export type AyceGroup = { key: string; label: string; days: number[]; includesHolidays: boolean; sessions: AycePricing[] };

/** Group pricing rows by their day-group label, preserving display order. */
export function groupAyce(rows: AycePricing[]): AyceGroup[] {
  const groups: AyceGroup[] = [];
  for (const row of [...rows].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)) {
    if (!row.active) continue;
    let g = groups.find((x) => x.label === row.label);
    if (!g) {
      g = { key: row.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: row.label, days: row.days, includesHolidays: row.includesHolidays, sessions: [] };
      groups.push(g);
    }
    g.sessions.push(row);
  }
  return groups;
}

export function rowAppliesToday(row: Pick<AycePricing, "days" | "includesHolidays" | "active">, clock: Clock, isHoliday: boolean): boolean {
  if (!row.active) return false;
  if (isHoliday && row.includesHolidays) return true;
  return row.days.includes(clock.dayOfWeek);
}

/** Which day group applies today (holiday-aware). */
export function todaysAyceGroup(rows: AycePricing[], clock: Clock, isHoliday: boolean): AyceGroup | null {
  const groups = groupAyce(rows);
  if (isHoliday) {
    const holiday = groups.find((g) => g.includesHolidays);
    if (holiday) return holiday;
  }
  return groups.find((g) => g.days.includes(clock.dayOfWeek)) ?? null;
}

/** The session running right now, if any. */
export function currentAyce(rows: AycePricing[], clock: Clock, isHoliday: boolean): AycePricing | null {
  const group = todaysAyceGroup(rows, clock, isHoliday);
  if (!group) return null;
  return (
    group.sessions.find((s) => {
      if (s.startTime && clock.minutes < toMinutes(s.startTime)) return false;
      if (s.endTime && clock.minutes >= toMinutes(s.endTime)) return false;
      return true;
    }) ?? null
  );
}

/** "11AM – 4PM", "4PM – Close", "All day" */
export function sessionHoursLabel(s: Pick<AycePricing, "startTime" | "endTime">, time12: (t: string, o?: { compact?: boolean }) => string): string {
  if (!s.startTime && !s.endTime) return "All day";
  const start = s.startTime ? time12(s.startTime, { compact: true }) : "Open";
  const end = s.endTime ? time12(s.endTime, { compact: true }) : "Close";
  return `${start} – ${end}`;
}
