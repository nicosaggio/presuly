import { Badge } from "@/components/ui/badge";
import type { Budget } from "@/lib/db/schema";
import type { Dictionary } from "@/lib/i18n";

const VARIANTS: Record<Budget["status"], "secondary" | "default" | "outline" | "destructive"> = {
  draft: "outline",
  sent: "secondary",
  viewed: "default",
  accepted: "default",
  expired: "destructive",
};

export function BudgetStatusBadge({
  status,
  dict,
}: {
  status: Budget["status"];
  dict: Dictionary;
}) {
  return (
    <Badge variant={VARIANTS[status]} className={status === "accepted" ? "bg-emerald-600" : ""}>
      {dict.dashboard.status[status]}
    </Badge>
  );
}
