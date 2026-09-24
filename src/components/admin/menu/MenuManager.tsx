"use client";

import { Reorder, useDragControls } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { deleteMenuItem, duplicateMenuItem, reorderItems, reorderSections, setItemFlag } from "@/actions/menu";
import { Drawer, ConfirmDialog } from "@/components/admin/overlays";
import { useToast } from "@/components/admin/toast";
import { Btn, Card, EmptyState, Input, Select, Tag } from "@/components/admin/ui";
import { DIETARY_LABELS } from "@/lib/constants";
import type { CategoryNode, GroupNode, ItemNode, SectionNode } from "@/lib/data/menu";
import type { Media } from "@/db/schema";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ItemEditor } from "./ItemEditor";
import { SectionEditor } from "./SectionEditor";

export function MenuManager({ categories, groups, library }: { categories: CategoryNode[]; groups: GroupNode[]; library: Pick<Media, "id" | "file" | "alt" | "tag">[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const [catId, setCatId] = useState<number>(() => Number(sp.get("category")) || categories[0]?.id || 0);
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [featured, setFeatured] = useState(sp.get("featured") === "1");
  const [editing, setEditing] = useState<{ item: ItemNode | null; sectionId?: number; nonce: number } | null>(sp.get("new") ? { item: null, nonce: 1 } : null);
  // "?new=1" (dashboard quick action) opens the editor once; drop it from the URL so reload/back doesn't reopen it.
  useEffect(() => {
    if (!sp.get("new")) return;
    const params = new URLSearchParams(sp.toString());
    params.delete("new");
    router.replace(params.size ? `/admin/menu?${params.toString()}` : "/admin/menu", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [sectionEdit, setSectionEdit] = useState<{ section: SectionNode | null } | null>(null);
  const [deleting, setDeleting] = useState<ItemNode | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const category = categories.find((c) => c.id === catId) ?? categories[0];
  const searching = q.trim().length > 0 || status !== "all" || featured;

  const matches = (i: ItemNode) => {
    if (status === "active" && !i.active) return false;
    if (status === "inactive" && i.active) return false;
    if (featured && !i.featured) return false;
    const t = q.trim().toLowerCase();
    if (t && !`${i.name} ${i.koreanName ?? ""} ${i.description ?? ""} ${i.sectionName} ${i.categoryName}`.toLowerCase().includes(t)) return false;
    return true;
  };

  const searchResults = useMemo(() => (searching ? categories.flatMap((c) => c.sections.flatMap((s) => s.items.filter(matches))) : []), [categories, q, status, featured]); // eslint-disable-line react-hooks/exhaustive-deps

  const flag = async (item: ItemNode, field: "active" | "featured", value: boolean) => {
    setBusy(item.id);
    const res = await setItemFlag(item.id, field, value);
    setBusy(null);
    if (res.ok) {
      toast.success(field === "active" ? (value ? "Item shown" : "Item hidden") : value ? "Featured" : "Unfeatured", item.name);
      router.refresh();
    } else toast.error(res.error);
  };
  const duplicate = async (item: ItemNode) => {
    setBusy(item.id);
    const res = await duplicateMenuItem(item.id);
    setBusy(null);
    if (res.ok) {
      toast.success("Duplicated as hidden copy", `${item.name} (copy)`);
      router.refresh();
    } else toast.error(res.error);
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(deleting.id);
    const res = await deleteMenuItem(deleting.id);
    setBusy(null);
    setDeleting(null);
    if (res.ok) {
      toast.success("Item deleted");
      router.refresh();
    } else toast.error(res.error);
  };

  const row = (item: ItemNode, withCategory = false) => (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 sm:flex-nowrap", !item.active && "opacity-60")}>
      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-zinc-100">
        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center bg-zinc-900 px-0.5 text-center text-[10px] leading-tight text-amber-200" lang="ko">{item.koreanName ?? item.name[0]}</span>}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setEditing({ item, nonce: item.id })} className="truncate text-[14px] font-medium text-zinc-900 hover:underline">{item.name}</button>
          {item.koreanName && <span className="text-[12px] text-zinc-500" lang="ko">{item.koreanName}</span>}
          {item.featured && <Tag tone="amber">Featured</Tag>}
          {!item.active && <Tag tone="gray">Hidden</Tag>}
          {item.availabilityNote && <Tag tone="blue">{item.availabilityNote}</Tag>}
          {item.dietaryTags.map((t) => <Tag key={t} tone="green">{DIETARY_LABELS[t].short}</Tag>)}
        </div>
        <p className="truncate text-[12px] text-zinc-500">{withCategory && `${item.categoryName} › ${item.sectionName} · `}{item.description ?? item.notes ?? "No description"}{item.modifierGroups.length ? ` · ${item.modifierGroups.length} modifier group${item.modifierGroups.length > 1 ? "s" : ""}` : ""}</p>
      </div>
      <span className="w-24 text-right text-[14px] font-medium tabular-nums text-zinc-900">
        {item.price == null ? <span className="text-zinc-400">{item.priceNote ?? "no price"}</span> : money(item.price)}
        {item.price != null && item.priceNote && <span className="block text-[11px] text-zinc-400">{item.priceNote}</span>}
      </span>
      <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-1 sm:w-auto">
        <Btn size="sm" variant="ghost" onClick={() => flag(item, "featured", !item.featured)} disabled={busy === item.id} title="Toggle featured">{item.featured ? "★" : "☆"}</Btn>
        <Btn size="sm" variant="ghost" onClick={() => flag(item, "active", !item.active)} disabled={busy === item.id}>{item.active ? "Hide" : "Show"}</Btn>
        <Btn size="sm" variant="ghost" onClick={() => duplicate(item)} disabled={busy === item.id}>Copy</Btn>
        <Btn size="sm" onClick={() => setEditing({ item, nonce: item.id })}>Edit</Btn>
        <Btn size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleting(item)}>Delete</Btn>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items…" className="w-56" aria-label="Search items" />
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-36" aria-label="Status filter">
            <option value="all">All items</option>
            <option value="active">Active only</option>
            <option value="inactive">Hidden only</option>
          </Select>
          <label className="flex items-center gap-2 text-[13px] text-zinc-700"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-zinc-900" /> Featured only</label>
          {searching && <Btn size="sm" variant="ghost" onClick={() => { setQ(""); setStatus("all"); setFeatured(false); }}>Clear</Btn>}
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => category && setSectionEdit({ section: null })}>+ Section</Btn>
          <Btn variant="primary" onClick={() => setEditing({ item: null, sectionId: category?.sections.find((s) => s.sectionType === "items")?.id, nonce: Date.now() })}>+ Add item</Btn>
        </div>
      </div>

      {searching ? (
        <Card title={`${searchResults.length} matching item${searchResults.length === 1 ? "" : "s"}`} padded={false}>
          {searchResults.length === 0 ? <div className="p-5"><EmptyState title="No items match" /></div> : <ul className="divide-y divide-zinc-100 px-4">{searchResults.map((i) => <li key={i.id}>{row(i, true)}</li>)}</ul>}
        </Card>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="min-w-0 lg:sticky lg:top-8 lg:self-start" aria-label="Categories">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {categories.map((c) => {
                const count = c.sections.reduce((n, s) => n + s.items.length, 0);
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => setCatId(c.id)} className={cn("flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[14px] font-medium transition", c.id === category?.id ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100", !c.active && "opacity-60")}>
                      <span>{c.name}{!c.active && " (hidden)"}</span>
                      <span className={cn("text-[12px]", c.id === category?.id ? "text-white/70" : "text-zinc-400")}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="min-w-0">
            {category ? (
              <CategoryPanel key={category.id} category={category} groups={groups} row={row} onEditSection={(s) => setSectionEdit({ section: s })} onAddItem={(sectionId) => setEditing({ item: null, sectionId, nonce: Date.now() })} />
            ) : (
              <EmptyState title="No categories yet" body="Create a category first under Menu → Categories." />
            )}
          </div>
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing?.item ? `Edit ${editing.item.name}` : "New menu item"} description={editing?.item ? `${editing.item.categoryName} › ${editing.item.sectionName} · /${editing.item.slug}` : undefined}>
        {editing && (
          <ItemEditor
            key={editing.item ? `item-${editing.item.id}` : `new-${editing.nonce}`}
            item={editing.item}
            defaultSectionId={editing.sectionId ?? category?.sections.find((s) => s.sectionType === "items")?.id}
            categories={categories}
            groups={groups}
            library={library}
            onSaved={(mode) => {
              router.refresh();
              if (mode === "another") setEditing({ item: null, sectionId: editing.sectionId, nonce: Date.now() });
              else setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        )}
      </Drawer>

      <Drawer open={!!sectionEdit} onClose={() => setSectionEdit(null)} title={sectionEdit?.section ? `Edit section: ${sectionEdit.section.name}` : `New section in ${category?.name ?? ""}`} width="max-w-lg">
        {sectionEdit && category && <SectionEditor key={sectionEdit.section?.id ?? "new"} section={sectionEdit.section} categoryId={category.id} groups={groups} onDone={() => { setSectionEdit(null); router.refresh(); }} />}
      </Drawer>

      <ConfirmDialog open={!!deleting} title={`Delete "${deleting?.name}"?`} body="This permanently removes the item. Use Hide to keep it for later." confirmLabel="Delete item" loading={busy === deleting?.id} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </>
  );
}

function CategoryPanel({ category, groups, row, onEditSection, onAddItem }: { category: CategoryNode; groups: GroupNode[]; row: (i: ItemNode) => React.ReactNode; onEditSection: (s: SectionNode) => void; onAddItem: (sectionId: number) => void }) {
  const toast = useToast();
  const router = useRouter();
  const [sections, setSections] = useState(category.sections);
  const dirty = useRef(false);
  useEffect(() => setSections(category.sections), [category.sections]);

  const persistSections = async (next: SectionNode[]) => {
    setSections(next);
    dirty.current = true;
  };
  const commitSections = async () => {
    if (!dirty.current) return;
    dirty.current = false;
    const res = await reorderSections(sections.map((s) => s.id));
    if (res.ok) {
      toast.success("Section order saved");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{category.name}</h2>
          <p className="text-[13px] text-zinc-500">{category.hoursNote ?? category.description ?? ""} · Drag ⋮⋮ to reorder sections and items.</p>
        </div>
      </div>
      <Reorder.Group axis="y" values={sections} onReorder={persistSections} className="space-y-4">
        {sections.map((s) => (
          <SectionBlock key={s.id} section={s} groups={groups} row={row} onEdit={() => onEditSection(s)} onAddItem={() => onAddItem(s.id)} onDragEnd={commitSections} />
        ))}
      </Reorder.Group>
      {sections.length === 0 && <EmptyState title="No sections in this category" body="Add a section to start adding items." />}
    </div>
  );
}

function SectionBlock({ section, groups, row, onEdit, onAddItem, onDragEnd }: { section: SectionNode; groups: GroupNode[]; row: (i: ItemNode) => React.ReactNode; onEdit: () => void; onAddItem: () => void; onDragEnd: () => void }) {
  const controls = useDragControls();
  const toast = useToast();
  const router = useRouter();
  const [items, setItems] = useState(section.items);
  const dirty = useRef(false);
  useEffect(() => setItems(section.items), [section.items]);

  const commit = async () => {
    if (!dirty.current) return;
    dirty.current = false;
    const res = await reorderItems(section.id, items.map((i) => i.id));
    if (res.ok) {
      toast.success("Item order saved");
      router.refresh();
    } else toast.error(res.error);
  };
  const linked = section.linkedGroup ?? groups.find((g) => g.id === section.linkedModifierGroupId);

  return (
    <Reorder.Item value={section} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} as="div" className={cn("rounded-xl border border-zinc-200 bg-white", !section.active && "opacity-60")}>
      <header className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
        <button type="button" onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none px-1 text-zinc-400 hover:text-zinc-700 active:cursor-grabbing" aria-label="Drag to reorder section">⋮⋮</button>
        <h3 className="text-[15px] font-semibold text-zinc-900">{section.name}</h3>
        {section.sectionType === "addons" && <Tag tone="purple">Add-on list{linked ? ` · ${linked.name}` : ""}</Tag>}
        {!section.active && <Tag tone="gray">Hidden</Tag>}
        {section.description && <span className="hidden truncate text-[12px] text-zinc-500 md:inline">· {section.description}</span>}
        <span className="ml-auto flex gap-1">
          {section.sectionType === "items" && <Btn size="sm" variant="ghost" onClick={onAddItem}>+ Item</Btn>}
          <Btn size="sm" variant="ghost" onClick={onEdit}>Edit section</Btn>
        </span>
      </header>
      {section.sectionType === "addons" ? (
        <div className="px-4 py-3 text-[13px] text-zinc-600">
          {linked ? (
            <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {linked.modifiers.map((m) => <li key={m.id} className="flex justify-between border-b border-dotted border-zinc-200 py-1"><span>{m.name}</span><span className="tabular-nums">{m.priceAdjustment ? money(m.priceAdjustment) : "incl."}</span></li>)}
            </ul>
          ) : <p>No modifier group linked. Edit the section to choose one.</p>}
          <p className="mt-2 text-[12px] text-zinc-400">Edit prices under Menu → Modifiers.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-6 text-center text-[13px] text-zinc-500">No items yet. <button type="button" onClick={onAddItem} className="font-medium text-zinc-900 underline">Add one</button></div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={(next) => { setItems(next); dirty.current = true; }} className="divide-y divide-zinc-100 px-3">
          {items.map((i) => <ItemRow key={i.id} item={i} onDragEnd={commit}>{row(i)}</ItemRow>)}
        </Reorder.Group>
      )}
    </Reorder.Item>
  );
}

function ItemRow({ item, children, onDragEnd }: { item: ItemNode; children: React.ReactNode; onDragEnd: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} as="div" className="flex items-center gap-1 bg-white">
      <button type="button" onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none px-1 text-zinc-300 hover:text-zinc-700 active:cursor-grabbing" aria-label="Drag to reorder item">⋮⋮</button>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}
