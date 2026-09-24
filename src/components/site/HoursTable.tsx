import type { Hours, HoursCategory } from "@/db/schema";
import { summarizeHours } from "@/lib/availability";
import { DAY_SHORT } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function HoursTable({
  hours,
  category = "store",
  className,
  todayDow,
  tone = "dark",
}: {
  hours: Hours[];
  category?: HoursCategory;
  className?: string;
  todayDow?: number;
  tone?: "light" | "dark";
}) {
  const rows = summarizeHours(hours, category);
  const dark = tone === "dark";
  return (
    <dl className={cn("divide-y", dark ? "divide-ivory-50/10" : "divide-ink-900/10", className)}>
      {rows.map((r) => {
        const isToday = todayDow != null && r.days.split(" – ").length === 1 && r.days === DAY_SHORT[todayDow];
        return (
          <div key={r.days} className={cn("flex items-baseline justify-between gap-6 py-2.5", isToday && "font-semibold")}>
            <dt className={cn("text-[15px]", dark ? "text-ivory-100/80" : "text-ink-700")}>{r.days}</dt>
            <dd className={cn("font-label text-[17px] tracking-[0.08em]", r.hours === "Closed" ? "text-chili-400" : dark ? "text-ivory-50" : "text-ink-900")}>{r.hours}</dd>
          </div>
        );
      })}
    </dl>
  );
}
