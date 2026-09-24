"use client";

import { Reorder, useDragControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteCategory, reorderCategories, saveCategory } from "@/actions/menu";
import type { HoursCategory, Media } from "@/db/schema";
import { ImageUpload } from "./ImageUpload";
import { HOURS_CATEGORIES } from "@/db/schema";
import { Drawer, ConfirmDialog } from "@/components/admin/overlays";
import { useToast } from "@/components/admin/toast";
import { Btn, Card, DaysPicker, EmptyState, Field, Input, Select, Tag, Textarea, Toggle } from "@/components/admin/ui";
import { HOURS_CATEGORY_LABELS } from "@/lib/constants";
import type { CategoryNode } from "@/lib/data/menu";
import { cn } from "@/lib/cn";

export function CategoriesManager({ categories, library }: { categories: CategoryNode[]; library: Pick<Media, "id" | "file" | "alt" | "tag">[] }) {
  const router = useRouter();
  const toast = useToast();
  const [list, setList] = useState(categories);
  const [editing, setEditing] = useState<CategoryNode | null | "new">(null);
  const [deleting, setDeleting] = useState<CategoryNode | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);
  useEffect(() => setList(categories), [categories]);

  const commit = async () => {
    if (!dirty.current) return;
    dirty.current = false;
    const res = await reorderCategories(list.map((c) => c.id));
    if (res.ok) {
      toast.success("Category order saved");
      router.refresh();
    } else toast.error(res.error);
  };
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await deleteCategory(deleting.id);
    setBusy(false);
    setDeleting(null);
    if (res.ok) {
      toast.success("Category deleted");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><Btn variant="primary" onClick={() => setEditing("new")}>+ New category</Btn></div>
      <Card padded={false}>
        {list.length === 0 ? (
          <div className="p-5"><EmptyState title="No categories" /></div>
        ) : (
          <Reorder.Group axis="y" values={list} onReorder={(n) => { setList(n); dirty.current = true; }} className="divide-y divide-zinc-100">
            {list.map((c) => <CategoryRow key={c.id} category={c} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} onDragEnd={commit} />)}
          </Reorder.Group>
        )}
      </Card>
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New category" : `Edit ${editing?.name ?? ""}`} width="max-w-lg">
        {editing !== null && <CategoryForm key={editing === "new" ? "new" : editing.id} category={editing === "new" ? null : editing} library={library} onDone={() => { setEditing(null); router.refresh(); }} />}
      </Drawer>
      <ConfirmDialog open={!!deleting} title={`Delete "${deleting?.name}"?`} body={`This deletes the category, its ${deleting?.sections.length ?? 0} sections and every item in them.`} confirmLabel="Delete category" loading={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </>
  );
}

function CategoryRow({ category: c, onEdit, onDelete, onDragEnd }: { category: CategoryNode; onEdit: () => void; onDelete: () => void; onDragEnd: () => void }) {
  const controls = useDragControls();
  const items = c.sections.reduce((n, s) => n + s.items.length, 0);
  return (
    <Reorder.Item value={c} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} as="div" className={cn("flex items-center gap-3 bg-white px-4 py-3", !c.active && "opacity-60")}>
      <button type="button" onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-zinc-400 hover:text-zinc-700 active:cursor-grabbing" aria-label="Drag to reorder">⋮⋮</button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[14px] font-medium text-zinc-900">{c.name} <span className="font-mono text-[11px] text-zinc-400">/{c.slug}</span> {!c.active && <Tag tone="gray">Hidden</Tag>}</p>
        <p className="truncate text-[12px] text-zinc-500">{c.sections.length} {c.sections.length === 1 ? "section" : "sections"} · {items} {items === 1 ? "item" : "items"}{c.hoursCategory ? ` · follows ${HOURS_CATEGORY_LABELS[c.hoursCategory].toLowerCase()}` : ""}{c.hoursNote ? ` · ${c.hoursNote}` : ""}</p>
      </div>
      <Btn size="sm" onClick={onEdit}>Edit</Btn>
      <Btn size="sm" variant="ghost" className="text-red-600" onClick={onDelete}>Delete</Btn>
    </Reorder.Item>
  );
}

function CategoryForm({ category, library, onDone }: { category: CategoryNode | null; library: Pick<Media, "id" | "file" | "alt" | "tag">[]; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: category?.name ?? "",
    tagline: category?.tagline ?? "",
    image: category?.image ?? "",
    description: category?.description ?? "",
    hoursNote: category?.hoursNote ?? "",
    hoursCategory: (category?.hoursCategory ?? "") as HoursCategory | "",
    availableDays: category?.availableDays ?? [],
    startTime: category?.startTime ?? "",
    endTime: category?.endTime ?? "",
    active: category?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveCategory({ ...f, id: category?.id, availableDays: f.availableDays.length ? f.availableDays : null });
    setBusy(false);
    if (res.ok) {
      toast.success(category ? "Category saved" : "Category created", f.name);
      onDone();
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name" htmlFor="c-name" error={errors.name} required><Input id="c-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
      <Field label="Tagline" htmlFor="c-tag" error={errors.tagline} hint='Short line under the name, e.g. "Grill at Your Table"'><Input id="c-tag" value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field>
      <Field label="Description" htmlFor="c-desc" error={errors.description}><Textarea id="c-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <Field label="Category photo" hint="Used as the backdrop for this category's cards on the homepage and section pages"><ImageUpload value={f.image} onChange={(v) => setF({ ...f, image: v })} library={library} altSuggestion={f.name} /></Field>
      <Field label="Hours line" htmlFor="c-hours" error={errors.hoursNote} hint="Optional note shown under the category title on the public menu"><Input id="c-hours" value={f.hoursNote} onChange={(e) => setF({ ...f, hoursNote: e.target.value })} placeholder="Dinner only" /></Field>
      <Field label="Availability follows" htmlFor="c-hc" hint="Drives 'Available now' badges. Leave blank to use the days/times below.">
        <Select id="c-hc" value={f.hoursCategory} onChange={(e) => setF({ ...f, hoursCategory: e.target.value as HoursCategory | "" })}>
          <option value="">Custom days/times</option>
          {HOURS_CATEGORIES.map((h) => <option key={h} value={h}>{HOURS_CATEGORY_LABELS[h]}</option>)}
        </Select>
      </Field>
      {!f.hoursCategory && (
        <>
          <Field label="Available days" hint="Leave all unselected for every day"><DaysPicker value={f.availableDays} onChange={(v) => setF({ ...f, availableDays: v })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start time" htmlFor="c-start" error={errors.startTime}><Input id="c-start" type="time" value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} /></Field>
            <Field label="End time" htmlFor="c-end" error={errors.endTime}><Input id="c-end" type="time" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} /></Field>
          </div>
        </>
      )}
      <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" description="Hidden categories don't appear on the public menu" />
      <div className="flex justify-end gap-2 pt-2">
        <Btn type="button" variant="ghost" onClick={onDone}>Cancel</Btn>
        <Btn type="submit" variant="primary" loading={busy}>{category ? "Save" : "Create category"}</Btn>
      </div>
    </form>
  );
}
