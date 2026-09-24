import type { Metadata } from "next";
import { ModifiersManager } from "@/components/admin/menu/ModifiersManager";
import { PageHeader } from "@/components/admin/ui";
import { flattenItems, readMenuTree } from "@/lib/data/menu";

export const metadata: Metadata = { title: "Modifiers" };

export default async function ModifiersPage() {
  const tree = await readMenuTree(true);
  const usage: Record<number, string[]> = {};
  for (const item of flattenItems(tree)) for (const g of item.modifierGroups) (usage[g.id] ??= []).push(item.name);
  for (const c of tree.categories) for (const s of c.sections) if (s.linkedModifierGroupId) (usage[s.linkedModifierGroupId] ??= []).push(`${s.name} (section list)`);
  return (
    <>
      <PageHeader title="Modifiers & add-ons" description="Reusable option groups (broth choices, spice levels, add-ons). Attach them to items from the item editor." />
      <ModifiersManager groups={tree.groups} usage={usage} />
    </>
  );
}
