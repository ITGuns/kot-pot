export default function Loading() {
  return (
    <div className="bg-ivory-50">
      <div className="bg-ink-950 pb-14 pt-32 md:pt-40">
        <div className="container-site space-y-4">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="skeleton h-16 w-3/4 max-w-2xl rounded-2xl" />
        </div>
      </div>
      <div className="container-site space-y-3 py-14">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-light h-24 rounded-[22px]" />
        ))}
      </div>
    </div>
  );
}
