import { ImageResponse } from "next/og";

/** Browsers probe /favicon.ico regardless of <link rel="icon">; PNG bytes are accepted. */
export async function GET() {
  const res = new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0908", borderRadius: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: "#cc3a1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#faf5ea", fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif" }}>K</div>
    </div>,
    { width: 32, height: 32 },
  );
  const buf = await res.arrayBuffer();
  return new Response(buf, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800, immutable" } });
}
