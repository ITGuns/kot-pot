import type { GroupNode } from "@/lib/data/menu";
import { DietaryBadge } from "@/components/ui/Badge";
import { priceAdjustment } from "@/lib/format";

export function AddonsList({ group, description }: { group: GroupNode; description?: string | null }) {
  return (
    <div className="rounded-[20px] border border-ink-900/8 bg-ivory-50/70 p-5 sm:p-6">
      {description && <p className="mb-3 text-[14px] text-ink-500">{description}</p>}
      <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {group.modifiers.map((m) => (
          <li key={m.id} className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink-900/15 pb-1.5">
            <span className="flex items-center gap-2 text-[15px] text-ink-800">
              {m.name}
              {m.dietaryTags.map((t) => (
                <DietaryBadge key={t} tag={t} size="xs" tone="light" />
              ))}
              {m.availabilityNote && <span className="text-[12px] text-ink-500">({m.availabilityNote})</span>}
            </span>
            <span className="font-label text-[17px] tracking-wide text-ink-900">{m.priceAdjustment ? priceAdjustment(m.priceAdjustment).replace("+", "") : "included"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
