import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getBudgetById } from "@/lib/db/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { updateBudget, publishBudget } from "@/lib/actions/budgets";
import { BudgetForm } from "@/components/budget-form";
import { BudgetPublishPanel } from "@/components/budget-publish-panel";

export default async function EditBudgetPage(props: PageProps<"/dashboard/[id]">) {
  const { id } = await props.params;
  const session = await getSession();
  const [dict, locale, budget, h] = await Promise.all([
    getDictionary(),
    getLocale(),
    getBudgetById(id),
    headers(),
  ]);

  if (!budget || budget.userId !== session!.userId) notFound();

  const origin = h.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";
  const publicUrl = `${origin}/p/${budget.token}`;

  const boundUpdate = updateBudget.bind(null, id);
  const boundPublish = publishBudget.bind(null, id);

  async function publishAction() {
    "use server";
    await boundPublish();
    redirect(`/dashboard/${id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.editor.editTitle}</h1>
      <BudgetPublishPanel
        budget={budget}
        dict={dict}
        locale={locale}
        publicUrl={publicUrl}
        onPublish={publishAction}
      />
      <BudgetForm dict={dict} locale={locale} budget={budget} action={boundUpdate} />
    </div>
  );
}
