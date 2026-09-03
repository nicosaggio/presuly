import { NextRequest, NextResponse } from "next/server";
import { getBudgetByToken, getAcceptanceForBudget } from "@/lib/db/queries";
import { renderBudgetPdf } from "@/lib/pdf/budget-pdf";
import type { Locale } from "@/lib/i18n";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const budget = await getBudgetByToken(token);

  if (!budget || budget.status === "draft") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const acceptance =
    budget.status === "accepted" ? await getAcceptanceForBudget(budget.id) : null;

  const pdf = await renderBudgetPdf(budget, acceptance, (budget.locale as Locale) ?? "es");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="presupuesto-${budget.token}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
