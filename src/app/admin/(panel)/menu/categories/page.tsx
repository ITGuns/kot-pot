import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/menu/CategoriesManager";
import { PageHeader } from "@/components/admin/ui";
import { readMenuTree } from "@/lib/data/menu";
import { readMedia } from "@/lib/data/media";

export const metadata: Metadata = { title: "Menu categories" };

export default async function CategoriesPage() {
  const [tree, library] = await Promise.all([readMenuTree(true), readMedia(true)]);
  return (
    <>
      <PageHeader title="Categories" description="Top-level menus (Korean BBQ, Hot Pot, Sauce Bar…). Drag to reorder; sections live inside each category on the Items page." />
      <CategoriesManager categories={tree.categories} library={library.map((m) => ({ id: m.id, file: m.file, alt: m.alt, tag: m.tag }))} />
    </>
  );
}
