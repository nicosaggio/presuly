import { ImageResponse } from "next/og";

export const alt = "Presuly — Presupuestos que se envían como link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 100,
          background: "#18181b",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#fafafa", marginBottom: 24 }}>
          Presuly
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 700,
            color: "#fafafa",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          Presupuestos que se envían como link
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", marginTop: 24 }}>
          presuly.com.ar
        </div>
      </div>
    ),
    { ...size }
  );
}
