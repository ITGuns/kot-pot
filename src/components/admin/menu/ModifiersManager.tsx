"use client";

import { Reorder, useDragControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteModifier, deleteModifierGroup, reorderModifiers, saveModifier, saveModifierGroup } from "@/actions/menu";
import type { DietaryTag } from "@/db/schema";
import { DIETARY_TAGS } from "@/db/schema";
import { Drawer, ConfirmDialog } from "@/components/admin/overlays";
import { useToast } from "@/components/admin/toast";
import { Btn, Card, Checkbox, DaysPicker, EmptyState, Field, Input, Tag, Textarea, Toggle, centsToInput } from "@/components/admin/ui";
import { DIETARY_LABELS } from "@/lib/constants";
import type { GroupNode } from "@/lib/data/menu";
import type { Modifier } from "@/db/schema";
import { daysLabel, money } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ModifiersManager({ groups, usage }: { groups: GroupNode[]; usage: Record<number, string[]> }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<number>(groups[0]?.id ?? 0);
  const [groupEdit, setGroupEdit] = useState<GroupNode | null | "new">(null);
  const [modEdit, setModEdit] = useState<{ mod: Modifier | null } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: "group"; g: GroupNode } | { kind: "mod"; m: Modifier } | null>(null);
  const [busy, setBusy] = useState(false);
  const group = groups.find((g) => g.id === selected) ?? groups[0];

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = deleting.kind === "group" ? await deleteModifierGroup(deleting.g.id) : await deleteModifier(deleting.m.id);
    setBusy(false);
    setDeleting(null);
    if (res.ok) {
      toast.success(deleting.kind === "group" ? "Group deleted" : "Modifier deleted");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><Btn variant="primary" onClick={() => setGroupEdit("new")}>+ New modifier group</Btn></div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card padded={false} className="lg:sticky lg:top-8 lg:self-start">
          {groups.length === 0 ? (
            <div className="p-5"><EmptyState title="No modifier groups" /></div>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto">
              {groups.map((g) => (
                <li key={g.id}>
                  <button type="button" onClick={() => setSelected(g.id)} className={cn("flex w-full flex-col items-start px-4 py-2.5 text-left transition", g.id === group?.id ? "bg-zinc-900 text-white" : "hover:bg-zinc-50", !g.active && "opacity-60")}>
                    <span className="text-[14px] font-medium">{g.name}</span>
                    <span className={cn("text-[12px]", g.id === group?.id ? "text-white/70" : "text-zinc-500")}>{g.modifiers.length} options · {g.required ? "required" : "optional"} · {(usage[g.id] ?? []).length} items</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {group ? (
          <GroupPanel key={group.id} group={group} usedBy={usage[group.id] ?? []} onEditGroup={() => setGroupEdit(group)} onDeleteGroup={() => setDeleting({ kind: "group", g: group })} onAdd={() => setModEdit({ mod: null })} onEdit={(m) => setModEdit({ mod: m })} onDelete={(m) => setDeleting({ kind: "mod", m })} />
        ) : (
          <EmptyState title="Select a group" />
        )}
      </div>

      <Drawer open={groupEdit !== null} onClose={() => setGroupEdit(null)} title={groupEdit === "new" ? "New modifier group" : `Edit group: ${groupEdit?.name ?? ""}`} width="max-w-lg">
        {groupEdit !== null && <GroupForm key={groupEdit === "new" ? "new" : groupEdit.id} group={groupEdit === "new" ? null : groupEdit} onDone={(id) => { setGroupEdit(null); if (id) setSelected(id); router.refresh(); }} />}
      </Drawer>
      <Drawer open={!!modEdit} onClose={() => setModEdit(null)} title={modEdit?.mod ? `Edit ${modEdit.mod.name}` : `New option in ${group?.name ?? ""}`} width="max-w-lg">
        {modEdit && group && <ModifierForm key={modEdit.mod?.id ?? "new"} mod={modEdit.mod} groupId={group.id} onDone={() => { setModEdit(null); router.refresh(); }} />}
      </Drawer>
      <ConfirmDialog
        open={!!deleting}
        title={deleting?.kind === "group" ? `Delete group "${deleting.g.name}"?` : `Delete "${deleting?.kind === "mod" ? deleting.m.name : ""}"?`}
        body={deleting?.kind === "group" ? `Removes the group, its ${deleting.g.modifiers.length} options, and unlinks it from ${(usage[deleting.g.id] ?? []).length} menu items.` : "This option will be removed from every item using this group."}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function GroupPanel({ group, usedBy, onEditGroup, onDeleteGroup, onAdd, onEdit, onDelete }: { group: GroupNode; usedBy: string[]; onEditGroup: () => void; onDeleteGroup: () => void; onAdd: () => void; onEdit: (m: Modifier) => void; onDelete: (m: Modifier) => void }) {
  const toast = useToast();
  const router = useRouter();
  const [mods, setMods] = useState(group.modifiers);
  const dirty = useRef(false);
  useEffect(() => setMods(group.modifiers), [group.modifiers]);
  const commit = async () => {
    if (!dirty.current) return;
    dirty.current = false;
    const res = await reorderModifiers(mods.map((m) => m.id));
    if (res.ok) {
      toast.success("Order saved");
      router.refresh();
    } else toast.error(res.error);
  };
  return (
    <Card
      title={group.name}
      description={`${group.required ? "Required" : "Optional"} · choose ${group.minSelections === group.maxSelections ? group.minSelections : `${group.minSelections}–${group.maxSelections}`}${group.description ? ` · ${group.description}` : ""}`}
      padded={false}
      actions={<div className="flex gap-1"><Btn size="sm" onClick={onAdd}>+ Option</Btn><Btn size="sm" variant="ghost" onClick={onEditGroup}>Edit group</Btn><Btn size="sm" variant="ghost" className="text-red-600" onClick={onDeleteGroup}>Delete</Btn></div>}
    >
      {mods.length === 0 ? (
        <div className="p-5"><EmptyState title="No options yet" action={<Btn onClick={onAdd}>+ Add option</Btn>} /></div>
      ) : (
        <Reorder.Group axis="y" values={mods} onReorder={(n) => { setMods(n); dirty.current = true; }} className="divide-y divide-zinc-100">
          {mods.map((m) => <ModRow key={m.id} mod={m} onEdit={() => onEdit(m)} onDelete={() => onDelete(m)} onDragEnd={commit} />)}
        </Reorder.Group>
      )}
      <div className="border-t border-zinc-100 px-4 py-3 text-[12px] text-zinc-500">
        {usedBy.length ? <>Used by: {usedBy.join(", ")}</> : "Not attached to any items yet. Assign it from an item's editor."}
      </div>
    </Card>
  );
}

function ModRow({ mod: m, onEdit, onDelete, onDragEnd }: { mod: Modifier; onEdit: () => void; onDelete: () => void; onDragEnd: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={m} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} as="div" className={cn("flex items-center gap-3 bg-white px-4 py-2.5", !m.active && "opacity-60")}>
      <button type="button" onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-zinc-300 hover:text-zinc-700 active:cursor-grabbing" aria-label="Drag to reorder">⋮⋮</button>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-medium text-zinc-900">
          {m.name}
          {m.dietaryTags.map((t) => <Tag key={t} tone="green">{DIETARY_LABELS[t].short}</Tag>)}
          {m.availableDays && <Tag tone="blue">{daysLabel(m.availableDays)}</Tag>}
          {!m.active && <Tag tone="gray">Hidden</Tag>}
        </p>
        {(m.description || m.availabilityNote) && <p className="text-[12px] text-zinc-500">{[m.description, m.availabilityNote].filter(Boolean).join(" · ")}</p>}
      </div>
      <span className="w-20 text-right text-[14px] font-medium tabular-nums">{m.priceAdjustment ? `+${money(m.priceAdjustment)}` : <span className="text-zinc-400">incl.</span>}</span>
      <Btn size="sm" onClick={onEdit}>Edit</Btn>
      <Btn size="sm" variant="ghost" className="text-red-600" onClick={onDelete}>Delete</Btn>
    </Reorder.Item>
  );
}

function GroupForm({ group, onDone }: { group: GroupNode | null; onDone: (id?: number) => void }) {
  const toast = useToast();
  const [f, setF] = useState({ name: group?.name ?? "", description: group?.description ?? "", required: group?.required ?? false, minSelections: String(group?.minSelections ?? 0), maxSelections: String(group?.maxSelections ?? 1), active: group?.active ?? true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveModifierGroup({ ...f, id: group?.id });
    setBusy(false);
    if (res.ok) {
      toast.success(group ? "Group saved" : "Group created", f.name);
      onDone(res.data.id);
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Group name" htmlFor="g-name" error={errors.name} required><Input id="g-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Broth choice" required /></Field>
      <Field label="Description" htmlFor="g-desc" error={errors.description}><Textarea id="g-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <Toggle checked={f.required} onChange={(v) => setF({ ...f, required: v, minSelections: v && f.minSelections === "0" ? "1" : f.minSelections })} label="Required" description="Guest must choose at least the minimum" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Min selections" htmlFor="g-min" error={errors.minSelections}><Input id="g-min" type="number" min={0} max={20} value={f.minSelections} onChange={(e) => setF({ ...f, minSelections: e.target.value })} /></Field>
        <Field label="Max selections" htmlFor="g-max" error={errors.maxSelections} hint="1 = single choice"><Input id="g-max" type="number" min={1} max={20} value={f.maxSelections} onChange={(e) => setF({ ...f, maxSelections: e.target.value })} /></Field>
      </div>
      <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" />
      <div className="flex justify-end gap-2 pt-2">
        <Btn type="button" variant="ghost" onClick={() => onDone()}>Cancel</Btn>
        <Btn type="submit" variant="primary" loading={busy}>{group ? "Save" : "Create group"}</Btn>
      </div>
    </form>
  );
}

function ModifierForm({ mod, groupId, onDone }: { mod: Modifier | null; groupId: number; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: mod?.name ?? "",
    description: mod?.description ?? "",
    priceAdjustment: centsToInput(mod?.priceAdjustment ?? 0),
    dietaryTags: (mod?.dietaryTags ?? []) as DietaryTag[],
    availabilityNote: mod?.availabilityNote ?? "",
    availableDays: mod?.availableDays ?? [],
    limitDays: Boolean(mod?.availableDays),
    active: mod?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveModifier({ ...f, id: mod?.id, groupId, availableDays: f.limitDays && f.availableDays.length ? f.availableDays : null });
    setBusy(false);
    if (res.ok) {
      toast.success(mod ? "Option saved" : "Option added", f.name);
      onDone();
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };
  const toggleTag = (t: DietaryTag) => setF({ ...f, dietaryTags: f.dietaryTags.includes(t) ? f.dietaryTags.filter((x) => x !== t) : [...f.dietaryTags, t] });
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Option name" htmlFor="m-name" error={errors.name} required><Input id="m-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
      <Field label="Description" htmlFor="m-desc" error={errors.description}><Input id="m-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="extra spicy" /></Field>
      <Field label="Price adjustment ($)" htmlFor="m-price" error={errors.priceAdjustment} hint="0 = included"><Input id="m-price" inputMode="decimal" value={f.priceAdjustment} onChange={(e) => setF({ ...f, priceAdjustment: e.target.value })} /></Field>
      <Field label="Dietary tags">
        <div className="grid grid-cols-2 gap-2">{DIETARY_TAGS.map((t) => <Checkbox key={t} checked={f.dietaryTags.includes(t)} onChange={() => toggleTag(t)} label={DIETARY_LABELS[t].label} />)}</div>
      </Field>
      <Toggle checked={f.limitDays} onChange={(v) => setF({ ...f, limitDays: v })} label="Only on certain days" description="e.g. weekend-only options" />
      {f.limitDays && <DaysPicker value={f.availableDays} onChange={(v) => setF({ ...f, availableDays: v })} />}
      <Field label="Availability note" htmlFor="m-note" error={errors.availabilityNote}><Input id="m-note" value={f.availabilityNote} onChange={(e) => setF({ ...f, availabilityNote: e.target.value })} placeholder="Weekends only" /></Field>
      <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" />
      <div className="flex justify-end gap-2 pt-2">
        <Btn type="button" variant="ghost" onClick={onDone}>Cancel</Btn>
        <Btn type="submit" variant="primary" loading={busy}>{mod ? "Save" : "Add option"}</Btn>
      </div>
    </form>
  );
}
