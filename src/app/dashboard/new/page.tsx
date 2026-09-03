import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { createBudget } from "@/lib/actions/budgets";
import { BudgetForm } from "@/components/budget-form";

export default async function NewBudgetPage(props: PageProps<"/dashboard/new">) {
  const dict = await getDictionary();
  const searchParams = await props.searchParams;
  const limitReached = searchParams?.error === "limit_reached";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.editor.newTitle}</h1>
      {limitReached ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm space-y-2">
          <p>{dict.dashboard.freeLimitReached}</p>
          <Link href="/dashboard/billing" className="font-medium underline">
            {dict.dashboard.upgradeToPro}
          </Link>
        </div>
      ) : (
        <BudgetForm dict={dict} action={createBudget} />
      )}
    </div>
  );
}
