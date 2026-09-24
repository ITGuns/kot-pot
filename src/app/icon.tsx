import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0908", borderRadius: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 999, background: "#cc3a1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#faf5ea", fontSize: 30, fontWeight: 700, fontFamily: "Georgia, serif" }}>K</div>
    </div>,
    size,
  );
}
