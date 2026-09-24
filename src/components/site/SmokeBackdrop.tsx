/** Layered CSS smoke + grain. Purely decorative. */
export function SmokeBackdrop({ intensity = 1 }: { intensity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: intensity }}>
      <div className="smoke-layer smoke-a" />
      <div className="smoke-layer smoke-b" />
      <div className="smoke-layer smoke-c" />
    </div>
  );
}
