import { getSession } from "@/lib/auth/session";
import { getUserBudgets } from "@/lib/db/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { LinkButton } from "@/components/link-button";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetsTable } from "@/components/budgets-table";

export default async function DashboardPage() {
  const session = await getSession();
  const [dict, locale, budgetList] = await Promise.all([
    getDictionary(),
    getLocale(),
    getUserBudgets(session!.userId),
  ]);

  const rows = budgetList.map((budget) => ({
    id: budget.id,
    title: budget.title,
    clientName: budget.clientName,
    kind: budget.kind,
    status: budget.status,
    currency: budget.currency,
    updatedAt: budget.updatedAt,
    total: budget.items
      .filter((it) => !it.optional || it.selected)
      .reduce((sum, it) => sum + it.price, 0),
  }));

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
        <BudgetsTable budgets={rows} dict={dict} locale={locale} />
      )}
    </div>
  );
}
