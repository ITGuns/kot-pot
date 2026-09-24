import type { Metadata } from "next";
import { BookingWindowsEditor } from "@/components/admin/hours/BookingWindowsEditor";
import { HoursEditor } from "@/components/admin/hours/HoursEditor";
import { OverridesEditor } from "@/components/admin/hours/OverridesEditor";
import { PageHeader } from "@/components/admin/ui";
import { getClock } from "@/lib/availability";
import { readBookingWindows, readDateOverrides } from "@/lib/data/booking";
import { readBookingSettings, readHours } from "@/lib/data/restaurant";

export const metadata: Metadata = { title: "Hours" };

export default async function HoursPage() {
  const [hours, settings] = await Promise.all([readHours(), readBookingSettings()]);
  const clock = getClock(settings.timezone);
  const [windows, overrides] = await Promise.all([readBookingWindows(), readDateOverrides(clock.date)]);
  return (
    <>
      <PageHeader title="Hours & availability" description="Restaurant hours, weekly reservation windows, holidays and date-specific overrides." />
      <div className="space-y-8">
        <HoursEditor hours={hours} />
        <BookingWindowsEditor windows={windows} slotInterval={settings.slotIntervalMinutes} />
        <OverridesEditor overrides={overrides} />
      </div>
    </>
  );
}
