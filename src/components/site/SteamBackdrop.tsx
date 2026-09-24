/** Layered CSS steam. Purely decorative. */
export function SteamBackdrop({ intensity = 1, className }: { intensity?: number; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} style={{ opacity: intensity }}>
      <div className="steam-layer steam-a" />
      <div className="steam-layer steam-b" />
      <div className="steam-layer steam-c" />
    </div>
  );
}
