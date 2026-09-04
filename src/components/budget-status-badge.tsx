import { Badge } from "@/components/ui/badge";
import type { Budget } from "@/lib/db/schema";
import type { Dictionary } from "@/lib/i18n";

/** Colores de estado exactos de la marca — ver docs/MARCA.md. No usar los
 * variants genéricos de shadcn acá: cada estado tiene un color fijo. */
const STATUS_COLOR: Record<Budget["status"], string> = {
  draft: "var(--presuly-borrador)",
  sent: "var(--presuly-enviado)",
  viewed: "var(--presuly-visto)",
  accepted: "var(--presuly-aceptado)",
  expired: "var(--presuly-vencido)",
};

export function BudgetStatusBadge({
  status,
  dict,
}: {
  status: Budget["status"];
  dict: Dictionary;
}) {
  const color = STATUS_COLOR[status];
  return (
    <Badge
      variant="outline"
      style={{ color, borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {dict.dashboard.status[status]}
    </Badge>
  );
}
