import { getDictionary } from "@/lib/i18n/server";
import { createBudget } from "@/lib/actions/budgets";
import { BudgetForm } from "@/components/budget-form";

export default async function NewBudgetPage() {
  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.editor.newTitle}</h1>
      <BudgetForm dict={dict} action={createBudget} />
    </div>
  );
}
