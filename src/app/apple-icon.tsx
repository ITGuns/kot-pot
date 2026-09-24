import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0908" }}>
      <div style={{ width: 124, height: 124, borderRadius: 999, background: "#cc3a1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#faf5ea", fontSize: 84, fontWeight: 700, fontFamily: "Georgia, serif" }}>K</div>
    </div>,
    size,
  );
}
