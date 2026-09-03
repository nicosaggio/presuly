import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUserBudgets } from "@/lib/db/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { formatCurrency } from "@/lib/format";
import { LinkButton } from "@/components/link-button";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetStatusBadge } from "@/components/budget-status-badge";

export default async function DashboardPage() {
  const session = await getSession();
  const [dict, locale, budgetList] = await Promise.all([
    getDictionary(),
    getLocale(),
    getUserBudgets(session!.userId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dict.dashboard.title}</h1>
        <LinkButton href="/dashboard/new">{dict.dashboard.newBudget}</LinkButton>
      </div>

      {budgetList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {dict.dashboard.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgetList.map((budget) => {
            const total = budget.items
              .filter((it) => !it.optional || it.selected)
              .reduce((sum, it) => sum + it.price, 0);
            return (
              <Link key={budget.id} href={`/dashboard/${budget.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{budget.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {budget.clientName} · {formatCurrency(total, budget.currency, locale)}
                      </p>
                    </div>
                    <BudgetStatusBadge status={budget.status} dict={dict} />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
