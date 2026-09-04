import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries";
import { getDictionary } from "@/lib/i18n/server";
import { effectivePlan } from "@/lib/plans";
import { ProfileForm } from "@/components/profile-form";
import { LogoutButton } from "@/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getSession();
  const [dict, user] = await Promise.all([getDictionary(), getUserById(session!.userId)]);

  const plan = effectivePlan(user!);
  const planLabel =
    plan === "free"
      ? dict.dashboard.planBadgeFree
      : plan === "pro"
        ? dict.dashboard.planBadgePro
        : dict.dashboard.planBadgeStudio;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">{dict.profile.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{dict.profile.accountTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{dict.profile.email}</p>
            <p>{user!.email}</p>
          </div>
          <ProfileForm dict={dict} name={user!.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {dict.billing.currentPlan}: {planLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/billing" className="text-sm font-medium underline">
            {dict.billing.title}
          </Link>
        </CardContent>
      </Card>

      <LogoutButton label={dict.common.logout} />
    </div>
  );
}
