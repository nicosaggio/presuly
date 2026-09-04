import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Presuly — Presupuestos que se envían como link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const isotipoBlanco = readFileSync(
  join(process.cwd(), "public/brand/presuly-isotipo-blanco-512.png")
).toString("base64");

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
          background: "#101917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${isotipoBlanco}`}
            width={40}
            height={41}
            alt=""
          />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#FBFAF8" }}>
            Presuly
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 700,
            color: "#FBFAF8",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          Presupuestos que se envían como link
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#2A9E8E", marginTop: 24 }}>
          presuly.com.ar
        </div>
      </div>
    ),
    { ...size }
  );
}
