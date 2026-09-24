"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveBookingSettings } from "@/actions/settings";
import type { BookingSettings } from "@/db/schema";
import { useToast } from "@/components/admin/toast";
import { Btn, Card, Field, Input, Textarea, Toggle } from "@/components/admin/ui";

export function BookingSettingsForm({ settings: s }: { settings: BookingSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({
    slotIntervalMinutes: String(s.slotIntervalMinutes), turnTimeMinutes: String(s.turnTimeMinutes), minPartySize: String(s.minPartySize), maxPartySize: String(s.maxPartySize),
    largePartyThreshold: String(s.largePartyThreshold), maxBookingsPerSlot: String(s.maxBookingsPerSlot), maxCoversPerSlot: String(s.maxCoversPerSlot), minLeadTimeMinutes: String(s.minLeadTimeMinutes),
    maxDaysInAdvance: String(s.maxDaysInAdvance), autoConfirm: s.autoConfirm, bookingsEnabled: s.bookingsEnabled, seatingPreferences: s.seatingPreferences.join("\n"), occasions: s.occasions.join("\n"),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const num = (k: keyof typeof f) => ({ value: f[k] as string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value }), error: !!errors[k], type: "number" as const });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveBookingSettings({ ...f, seatingPreferences: f.seatingPreferences.split("\n").map((x) => x.trim()).filter(Boolean), occasions: f.occasions.split("\n").map((x) => x.trim()).filter(Boolean) });
    setBusy(false);
    if (res.ok) {
      toast.success("Booking rules saved");
      router.refresh();
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={submit}>
      <Card title="Reservation rules" description="Capacity and pacing for online bookings. Reservation windows and blackout dates live under Hours." actions={<Btn type="submit" variant="primary" loading={busy}>Save rules</Btn>}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Toggle checked={f.bookingsEnabled} onChange={(v) => setF({ ...f, bookingsEnabled: v })} label="Online booking enabled" description="Turn off to pause the /book page" />
          <Toggle checked={f.autoConfirm} onChange={(v) => setF({ ...f, autoConfirm: v })} label="Auto-confirm" description="Otherwise every booking waits as Pending" />
          <div />
          <Field label="Slot interval (min)" htmlFor="b-int" error={errors.slotIntervalMinutes}><Input id="b-int" min={5} max={120} {...num("slotIntervalMinutes")} /></Field>
          <Field label="Turn time (min)" htmlFor="b-turn" error={errors.turnTimeMinutes} hint="How long a table is occupied"><Input id="b-turn" min={15} max={360} {...num("turnTimeMinutes")} /></Field>
          <Field label="Min lead time (min)" htmlFor="b-lead" error={errors.minLeadTimeMinutes} hint="Same-day bookings must be this far out"><Input id="b-lead" min={0} {...num("minLeadTimeMinutes")} /></Field>
          <Field label="Min party size" htmlFor="b-min" error={errors.minPartySize}><Input id="b-min" min={1} {...num("minPartySize")} /></Field>
          <Field label="Max party size (online)" htmlFor="b-max" error={errors.maxPartySize}><Input id="b-max" min={1} {...num("maxPartySize")} /></Field>
          <Field label="Large party threshold" htmlFor="b-large" error={errors.largePartyThreshold} hint="Parties this size or bigger are held as Pending"><Input id="b-large" min={1} {...num("largePartyThreshold")} /></Field>
          <Field label="Max bookings per slot" htmlFor="b-mb" error={errors.maxBookingsPerSlot} hint="Overlapping within the turn time"><Input id="b-mb" min={1} {...num("maxBookingsPerSlot")} /></Field>
          <Field label="Max covers per slot" htmlFor="b-mc" error={errors.maxCoversPerSlot}><Input id="b-mc" min={1} {...num("maxCoversPerSlot")} /></Field>
          <Field label="Days in advance" htmlFor="b-days" error={errors.maxDaysInAdvance}><Input id="b-days" min={1} max={365} {...num("maxDaysInAdvance")} /></Field>
          <Field label="Seating preferences (one per line)" htmlFor="b-seat" className="sm:col-span-1" hint="Leave empty to let guests type a free-text preference"><Textarea id="b-seat" value={f.seatingPreferences} onChange={(e) => setF({ ...f, seatingPreferences: e.target.value })} /></Field>
          <Field label="Occasions (one per line)" htmlFor="b-occ" className="sm:col-span-1"><Textarea id="b-occ" value={f.occasions} onChange={(e) => setF({ ...f, occasions: e.target.value })} /></Field>
        </div>
      </Card>
    </form>
  );
}
