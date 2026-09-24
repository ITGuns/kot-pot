"use client";

import { Reorder, useDragControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteAyceRow, reorderAyce, saveAyceRow } from "@/actions/ayce";
import type { AycePricing } from "@/db/schema";
import { ConfirmDialog, Drawer } from "@/components/admin/overlays";
import { useToast } from "@/components/admin/toast";
import { Btn, Card, DaysPicker, EmptyState, Field, Input, Tag, Toggle, centsToInput } from "@/components/admin/ui";
import { sessionHoursLabel } from "@/lib/ayce";
import { daysLabelWeek, money, time12 } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AyceManager({ rows }: { rows: AycePricing[] }) {
  const router = useRouter();
  const toast = useToast();
  const [list, setList] = useState(rows);
  const [editing, setEditing] = useState<AycePricing | null | "new">(null);
  const [deleting, setDeleting] = useState<AycePricing | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);
  useEffect(() => setList(rows), [rows]);

  const commit = async () => {
    if (!dirty.current) return;
    dirty.current = false;
    const res = await reorderAyce(list.map((r) => r.id));
    if (res.ok) {
      toast.success("Order saved");
      router.refresh();
    } else toast.error(res.error);
  };
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await deleteAyceRow(deleting.id);
    setBusy(false);
    setDeleting(null);
    if (res.ok) {
      toast.success("Pricing row deleted");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><Btn variant="primary" onClick={() => setEditing("new")}>+ Add session</Btn></div>
      <Card title="Sessions & prices" description="Rows with the same day-group label are shown together as one tab on the website (e.g. Lunch and Dinner under Monday – Friday). Drag to reorder." padded={false}>
        {list.length === 0 ? (
          <div className="p-5"><EmptyState title="No all-you-can-eat pricing" body="Add a session to show the pricing section on the website." /></div>
        ) : (
          <Reorder.Group axis="y" values={list} onReorder={(n) => { setList(n); dirty.current = true; }} className="divide-y divide-zinc-100">
            {list.map((r) => <Row key={r.id} r={r} onEdit={() => setEditing(r)} onDelete={() => setDeleting(r)} onDragEnd={commit} />)}
          </Reorder.Group>
        )}
      </Card>
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New session" : `Edit ${editing?.label} · ${editing?.session}`} width="max-w-lg">
        {editing !== null && <AyceForm key={editing === "new" ? "new" : editing.id} row={editing === "new" ? null : editing} onDone={() => { setEditing(null); router.refresh(); }} />}
      </Drawer>
      <ConfirmDialog open={!!deleting} title="Delete this pricing row?" body={deleting ? `${deleting.label} · ${deleting.session} will be removed from the website.` : ""} confirmLabel="Delete" loading={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </>
  );
}

function Row({ r, onEdit, onDelete, onDragEnd }: { r: AycePricing; onEdit: () => void; onDelete: () => void; onDragEnd: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={r} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} as="div" data-testid="ayce-row" className={cn("flex flex-wrap items-center gap-3 bg-white px-4 py-3", !r.active && "opacity-60")}>
      <button type="button" onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-zinc-300 hover:text-zinc-700 active:cursor-grabbing" aria-label="Drag to reorder">⋮⋮</button>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-zinc-900">
          {r.label} <span className="text-zinc-400">›</span> {r.session}
          {r.includesHolidays && <Tag tone="amber">+ holidays</Tag>}
          {!r.active && <Tag tone="gray">Hidden</Tag>}
        </p>
        <p className="text-[12px] text-zinc-500">{daysLabelWeek(r.days) || "No days"} · {sessionHoursLabel(r, time12)}{r.note ? ` · ${r.note}` : ""}</p>
      </div>
      <span className="text-right text-[14px] tabular-nums text-zinc-900">
        <span className="font-semibold">{money(r.adultPrice, { always: true })}</span> adult
        {r.childPrice != null && <span className="block text-[12px] text-zinc-500">{money(r.childPrice, { always: true })} {r.childLabel.toLowerCase()}</span>}
      </span>
      <Btn size="sm" onClick={onEdit}>Edit</Btn>
      <Btn size="sm" variant="ghost" className="text-red-600" onClick={onDelete}>Delete</Btn>
    </Reorder.Item>
  );
}

function AyceForm({ row, onDone }: { row: AycePricing | null; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    label: row?.label ?? "",
    days: row?.days ?? [],
    includesHolidays: row?.includesHolidays ?? false,
    session: row?.session ?? "",
    startTime: row?.startTime ?? "",
    endTime: row?.endTime ?? "",
    adultPrice: centsToInput(row?.adultPrice),
    childPrice: centsToInput(row?.childPrice),
    childLabel: row?.childLabel ?? "Child (4–10)",
    note: row?.note ?? "",
    active: row?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await saveAyceRow({ ...f, id: row?.id });
    setBusy(false);
    if (res.ok) {
      toast.success(row ? "Session saved" : "Session added", `${f.label} · ${f.session}`);
      onDone();
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Day group label" htmlFor="a-label" error={errors.label} required hint='Tab name on the website, e.g. "Monday – Friday" or "Sat · Sun · Holidays"'><Input id="a-label" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} required /></Field>
      <Field label="Days" error={errors.days}><DaysPicker value={f.days} onChange={(v) => setF({ ...f, days: v })} /></Field>
      <Toggle checked={f.includesHolidays} onChange={(v) => setF({ ...f, includesHolidays: v })} label="Also applies on holidays" description="Dates flagged as holidays under Hours use this pricing" />
      <Field label="Session" htmlFor="a-session" error={errors.session} required hint='e.g. "Lunch", "Dinner", "All Day"'><Input id="a-session" value={f.session} onChange={(e) => setF({ ...f, session: e.target.value })} required /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Starts" htmlFor="a-start" error={errors.startTime} hint="Blank = from opening"><Input id="a-start" type="time" value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} /></Field>
        <Field label="Ends" htmlFor="a-end" error={errors.endTime} hint="Blank = until close"><Input id="a-end" type="time" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Adult price ($)" htmlFor="a-adult" error={errors.adultPrice} required><Input id="a-adult" inputMode="decimal" value={f.adultPrice} onChange={(e) => setF({ ...f, adultPrice: e.target.value })} error={!!errors.adultPrice} required /></Field>
        <Field label="Child price ($)" htmlFor="a-child" error={errors.childPrice} hint="Blank = no child price"><Input id="a-child" inputMode="decimal" value={f.childPrice} onChange={(e) => setF({ ...f, childPrice: e.target.value })} error={!!errors.childPrice} /></Field>
      </div>
      <Field label="Child label" htmlFor="a-childlabel" error={errors.childLabel}><Input id="a-childlabel" value={f.childLabel} onChange={(e) => setF({ ...f, childLabel: e.target.value })} /></Field>
      <Field label="Note" htmlFor="a-note" error={errors.note} hint="Optional, shown under the prices"><Input id="a-note" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
      <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" description="Hidden rows don't show on the website" />
      <div className="flex justify-end gap-2 pt-2">
        <Btn type="button" variant="ghost" onClick={onDone}>Cancel</Btn>
        <Btn type="submit" variant="primary" loading={busy}>{row ? "Save" : "Add session"}</Btn>
      </div>
    </form>
  );
}
