import type { Metadata } from "next";
import { AyceManager } from "@/components/admin/menu/AyceManager";
import { PageHeader } from "@/components/admin/ui";
import { readAyce } from "@/lib/data/restaurant";

export const metadata: Metadata = { title: "All-you-can-eat pricing" };

export default async function AycePage() {
  const rows = await readAyce(true);
  return (
    <>
      <PageHeader title="All-you-can-eat pricing" description="Sessions, hours and adult / child prices shown in the featured pricing section on the website." />
      <AyceManager rows={rows} />
    </>
  );
}
