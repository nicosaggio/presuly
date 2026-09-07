import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth/session";
import { getSavedItems } from "@/lib/db/queries";
import { createBudget } from "@/lib/actions/budgets";
import { getTemplateBySlug } from "@/lib/templates/data";
import { BudgetForm } from "@/components/budget-form";
import { nanoid } from "nanoid";

export default async function NewBudgetPage(props: PageProps<"/dashboard/new">) {
  const session = await getSession();
  const [dict, locale, savedItems] = await Promise.all([
    getDictionary(),
    getLocale(),
    session ? getSavedItems(session.userId) : Promise.resolve([]),
  ]);
  const searchParams = await props.searchParams;
  const limitReached = searchParams?.error === "limit_reached";

  const templateSlug =
    typeof searchParams?.template === "string" ? searchParams.template : undefined;
  const template = templateSlug ? getTemplateBySlug(templateSlug) : null;

  const initialValues = template
    ? {
        title: template.title[locale],
        intro: template.intro[locale],
        scope: template.scope[locale],
        conditions: template.conditions[locale],
        currency: template.currency,
        items: template.items.map((item) => ({
          id: nanoid(8),
          description: item.description[locale],
          price: item.price,
          optional: item.optional,
          selected: true,
        })),
      }
    : undefined;

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
        <BudgetForm
          dict={dict}
          locale={locale}
          action={createBudget}
          initialValues={initialValues}
          savedItems={savedItems}
        />
      )}
    </div>
  );
}
