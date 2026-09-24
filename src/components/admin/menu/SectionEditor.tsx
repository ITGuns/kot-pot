"use client";

import { useState } from "react";
import { deleteSection, saveSection } from "@/actions/menu";
import type { SectionType } from "@/db/schema";
import { Btn, Field, Input, Select, Textarea, Toggle } from "@/components/admin/ui";
import { ConfirmDialog } from "@/components/admin/overlays";
import { useToast } from "@/components/admin/toast";
import type { GroupNode, SectionNode } from "@/lib/data/menu";

export function SectionEditor({ section, categoryId, groups, onDone }: { section: SectionNode | null; categoryId: number; groups: GroupNode[]; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: section?.name ?? "",
    description: section?.description ?? "",
    sectionType: (section?.sectionType ?? "items") as SectionType,
    linkedModifierGroupId: section?.linkedModifierGroupId ? String(section.linkedModifierGroupId) : "",
    active: section?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveSection({ ...f, id: section?.id, categoryId });
    setBusy(false);
    if (res.ok) {
      toast.success(section ? "Section saved" : "Section created", f.name);
      onDone();
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };
  const remove = async () => {
    if (!section) return;
    setBusy(true);
    const res = await deleteSection(section.id);
    setBusy(false);
    setConfirm(false);
    if (res.ok) {
      toast.success("Section deleted");
      onDone();
    } else toast.error(res.error);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Section name" htmlFor="s-name" error={errors.name} required><Input id="s-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
      <Field label="Description / hours line" htmlFor="s-desc" error={errors.description}><Textarea id="s-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Avail. til 11:30AM Wed-Sat" /></Field>
      <Field label="Section type" htmlFor="s-type" hint="Add-on sections render a modifier group as a simple price list">
        <Select id="s-type" value={f.sectionType} onChange={(e) => setF({ ...f, sectionType: e.target.value as SectionType })}>
          <option value="items">Menu items</option>
          <option value="addons">Add-on price list</option>
        </Select>
      </Field>
      {f.sectionType === "addons" && (
        <Field label="Linked modifier group" htmlFor="s-group" error={errors.linkedModifierGroupId}>
          <Select id="s-group" value={f.linkedModifierGroupId} onChange={(e) => setF({ ...f, linkedModifierGroupId: e.target.value })}>
            <option value="">Choose a group</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        </Field>
      )}
      <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" description="Hidden sections (and their items) don't show publicly" />
      <div className="flex items-center justify-between gap-2 pt-2">
        <div>{section && <Btn type="button" variant="ghost" className="text-red-600" onClick={() => setConfirm(true)}>Delete section</Btn>}</div>
        <div className="flex gap-2">
          <Btn type="button" variant="ghost" onClick={onDone}>Cancel</Btn>
          <Btn type="submit" variant="primary" loading={busy}>{section ? "Save" : "Create section"}</Btn>
        </div>
      </div>
      <ConfirmDialog open={confirm} title={`Delete "${section?.name}"?`} body={`This deletes the section and its ${section?.items.length ?? 0} items permanently.`} confirmLabel="Delete section" loading={busy} onConfirm={remove} onCancel={() => setConfirm(false)} />
    </form>
  );
}
