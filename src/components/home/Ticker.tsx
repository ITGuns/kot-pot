export function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-ivory-50/10 bg-ink-900 py-3.5">
      <div className="flex w-max animate-ticker gap-10 whitespace-nowrap motion-reduce:animate-none">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-label text-[15px] uppercase tracking-[0.26em] text-ivory-100/75">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-chili-500" />
          </span>
        ))}
      </div>
    </div>
  );
}
