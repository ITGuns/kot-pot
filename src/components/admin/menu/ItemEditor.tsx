"use client";

import { useState } from "react";
import { deleteMenuItem, saveMenuItem } from "@/actions/menu";
import type { AvailabilityType, DietaryTag, Media } from "@/db/schema";
import { AVAILABILITY_TYPES, DIETARY_TAGS } from "@/db/schema";
import { Btn, Checkbox, DaysPicker, Field, Input, Select, Textarea, Toggle, centsToInput } from "@/components/admin/ui";
import { ConfirmDialog } from "@/components/admin/overlays";
import { useToast } from "@/components/admin/toast";
import { AVAILABILITY_LABELS, DIETARY_LABELS } from "@/lib/constants";
import type { CategoryNode, GroupNode, ItemNode } from "@/lib/data/menu";
import { ImageUpload } from "./ImageUpload";

type Form = {
  sectionId: string; name: string; koreanName: string; description: string; price: string; priceNote: string; image: string; imageAlt: string;
  dietaryTags: DietaryTag[]; availabilityType: AvailabilityType; availableDays: number[]; availableStartTime: string; availableEndTime: string; availabilityNote: string;
  notes: string; featured: boolean; active: boolean; modifierGroupIds: number[];
};

export function ItemEditor({ item, defaultSectionId, categories, groups, library, onSaved, onClose }: { item: ItemNode | null; defaultSectionId?: number; categories: CategoryNode[]; groups: GroupNode[]; library: Pick<Media, "id" | "file" | "alt" | "tag">[]; onSaved: (mode: "close" | "another") => void; onClose: () => void }) {
  const toast = useToast();
  const [f, setF] = useState<Form>({
    sectionId: String(item?.sectionId ?? defaultSectionId ?? categories[0]?.sections[0]?.id ?? ""),
    name: item?.name ?? "",
    koreanName: item?.koreanName ?? "",
    description: item?.description ?? "",
    price: centsToInput(item?.price),
    priceNote: item?.priceNote ?? "",
    image: item?.image ?? "",
    imageAlt: item?.imageAlt ?? "",
    dietaryTags: item?.dietaryTags ?? [],
    availabilityType: item?.availabilityType ?? "always",
    availableDays: item?.availableDays ?? [],
    availableStartTime: item?.availableStartTime ?? "",
    availableEndTime: item?.availableEndTime ?? "",
    availabilityNote: item?.availabilityNote ?? "",
    notes: item?.notes ?? "",
    featured: item?.featured ?? false,
    active: item?.active ?? true,
    modifierGroupIds: item?.modifierGroups.map((g) => g.id) ?? [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<false | "close" | "another" | "archive" | "delete">(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = async (mode: "close" | "another", overrides: Partial<Form> = {}) => {
    setBusy(mode);
    setErrors({});
    const payload = { ...f, ...overrides, id: item?.id, sectionId: Number(f.sectionId) };
    const res = await saveMenuItem(payload);
    setBusy(false);
    if (res.ok) {
      toast.success(item ? "Item saved" : "Item created", f.name);
      onSaved(mode);
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };

  const archive = async () => {
    setBusy("archive");
    const res = await saveMenuItem({ ...f, id: item?.id, sectionId: Number(f.sectionId), active: false });
    setBusy(false);
    if (res.ok) {
      toast.success("Item archived", "Hidden from the public menu.");
      onSaved("close");
    } else toast.error(res.error);
  };

  const remove = async () => {
    if (!item) return;
    setBusy("delete");
    const res = await deleteMenuItem(item.id);
    setBusy(false);
    setConfirmDelete(false);
    if (res.ok) {
      toast.success("Item deleted");
      onSaved("close");
    } else toast.error(res.error);
  };

  const toggleTag = (t: DietaryTag) => set("dietaryTags", f.dietaryTags.includes(t) ? f.dietaryTags.filter((x) => x !== t) : [...f.dietaryTags, t]);
  const toggleGroup = (id: number) => set("modifierGroupIds", f.modifierGroupIds.includes(id) ? f.modifierGroupIds.filter((x) => x !== id) : [...f.modifierGroupIds, id]);
  const timed = f.availabilityType === "days" || f.availabilityType === "schedule";

  return (
    <form onSubmit={(e) => { e.preventDefault(); save("close"); }} className="space-y-6">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name" htmlFor="i-name" error={errors.name} required><Input id="i-name" value={f.name} onChange={(e) => set("name", e.target.value)} error={!!errors.name} required /></Field>
          <Field label="Korean name" htmlFor="i-korean" error={errors.koreanName} hint="Shown under the English name, e.g. 차돌박이"><Input id="i-korean" lang="ko" value={f.koreanName} onChange={(e) => set("koreanName", e.target.value)} error={!!errors.koreanName} /></Field>
        </div>
        <Field label="Description" htmlFor="i-desc" error={errors.description}><Textarea id="i-desc" value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Thinly shaved, melts on the grill" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category / section" htmlFor="i-section" error={errors.sectionId} required className="sm:col-span-1">
            <Select id="i-section" value={f.sectionId} onChange={(e) => set("sectionId", e.target.value)}>
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  {c.sections.filter((s) => s.sectionType === "items").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              ))}
            </Select>
          </Field>
          <Field label="Price ($)" htmlFor="i-price" error={errors.price} hint="Leave blank for no price (e.g. sauce bar)"><Input id="i-price" inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} error={!!errors.price} placeholder="14" /></Field>
          <Field label="Price note" htmlFor="i-pnote" error={errors.priceNote} hint='e.g. "per broth", "Bottle"'><Input id="i-pnote" value={f.priceNote} onChange={(e) => set("priceNote", e.target.value)} /></Field>
        </div>
      </section>

      <section className="space-y-3 border-t border-zinc-100 pt-5">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">Photo</h3>
        <ImageUpload value={f.image} onChange={(v) => set("image", v)} library={library} altSuggestion={f.name} />
        <Field label="Image alt text" htmlFor="i-alt" error={errors.imageAlt}><Input id="i-alt" value={f.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} placeholder="Describe the photo for screen readers" /></Field>
        <p className="text-[12px] text-zinc-500">Items without a photo get a typographic tile with their Korean name. No stock photos are used.</p>
      </section>

      <section className="space-y-3 border-t border-zinc-100 pt-5">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">Dietary tags</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {DIETARY_TAGS.map((t) => <Checkbox key={t} checked={f.dietaryTags.includes(t)} onChange={() => toggleTag(t)} label={<span>{DIETARY_LABELS[t].label} <span className="text-zinc-400">({DIETARY_LABELS[t].short})</span></span>} />)}
        </div>
      </section>

      <section className="space-y-4 border-t border-zinc-100 pt-5">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">Availability</h3>
        <Field label="Rule" htmlFor="i-avail">
          <Select id="i-avail" value={f.availabilityType} onChange={(e) => set("availabilityType", e.target.value as AvailabilityType)}>
            {AVAILABILITY_TYPES.map((t) => <option key={t} value={t}>{AVAILABILITY_LABELS[t]}</option>)}
          </Select>
        </Field>
        {timed && (
          <Field label="Available days" error={errors.availableDays}><DaysPicker value={f.availableDays} onChange={(v) => set("availableDays", v)} /></Field>
        )}
        {timed && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time" htmlFor="i-start" error={errors.availableStartTime} hint="Optional"><Input id="i-start" type="time" value={f.availableStartTime} onChange={(e) => set("availableStartTime", e.target.value)} /></Field>
            <Field label="End time" htmlFor="i-end" error={errors.availableEndTime} hint="Optional"><Input id="i-end" type="time" value={f.availableEndTime} onChange={(e) => set("availableEndTime", e.target.value)} /></Field>
          </div>
        )}
        <Field label="Availability label" htmlFor="i-anote" error={errors.availabilityNote} hint='Shown as a badge on the menu, e.g. "Weekends only", "Seasonal", "Limited"'><Input id="i-anote" value={f.availabilityNote} onChange={(e) => set("availabilityNote", e.target.value)} /></Field>
      </section>

      <section className="space-y-3 border-t border-zinc-100 pt-5">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">Modifiers & add-ons</h3>
        {groups.length === 0 ? (
          <p className="text-[13px] text-zinc-500">No modifier groups yet. Create them under Menu → Modifiers.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {groups.map((g) => (
              <Checkbox key={g.id} checked={f.modifierGroupIds.includes(g.id)} onChange={() => toggleGroup(g.id)} label={<span>{g.name} <span className="text-zinc-400">· {g.modifiers.length} options{g.required ? " · required" : ""}</span></span>} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-zinc-100 pt-5">
        <Field label="Notes" htmlFor="i-notes" error={errors.notes} hint="Shown under the description (pairings, allergens…)"><Textarea id="i-notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
        <div className="flex flex-wrap gap-6">
          <Toggle checked={f.featured} onChange={(v) => set("featured", v)} label="Featured" description="Show in the homepage featured carousel" />
          <Toggle checked={f.active} onChange={(v) => set("active", v)} label="Active" description="Visible on the public menu" />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-5">
        <div className="flex gap-2">
          {item && f.active && <Btn type="button" variant="outline" onClick={archive} loading={busy === "archive"}>Archive item</Btn>}
          {item && <Btn type="button" variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(true)}>Delete</Btn>}
        </div>
        <div className="flex gap-2">
          <Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn>
          {!item && <Btn type="button" onClick={() => save("another")} loading={busy === "another"}>Save & add another</Btn>}
          <Btn type="submit" variant="primary" loading={busy === "close"}>Save changes</Btn>
        </div>
      </div>

      <ConfirmDialog open={confirmDelete} title={`Delete "${item?.name}"?`} body="This removes the item permanently. Archive it instead if you might bring it back." confirmLabel="Delete item" loading={busy === "delete"} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
    </form>
  );
}
