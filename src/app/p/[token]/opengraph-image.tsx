import { ImageResponse } from "next/og";
import { getBudgetByToken } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export const alt = "Presupuesto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const budget = await getBudgetByToken(token);
  const locale = (budget?.locale as Locale) ?? "es";
  const isEn = locale === "en";

  const total = budget
    ? budget.items
        .filter((i) => !i.optional || i.selected)
        .reduce((sum, i) => sum + i.price, 0)
    : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#FBFAF8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#0C6E63" }}>
          Presuly
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#101917" }}>
            {budget?.title ?? "Presupuesto"}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#5B6A67" }}>
            {budget
              ? `${isEn ? "For" : "Para"} ${budget.clientName}`
              : isEn
                ? "Sent via Presuly"
                : "Enviado con Presuly"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ display: "flex", fontSize: 24, color: "#5B6A67" }}>
            {isEn ? "Total" : "Total"}
          </div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#0C6E63" }}>
            {budget ? formatCurrency(total, budget.currency, locale) : ""}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
