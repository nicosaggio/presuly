import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function LoginPage(props: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const dict = await getDictionary();
  const searchParams = await props.searchParams;
  const hasLinkError = searchParams?.error === "invalid_link";
  const next = typeof searchParams?.next === "string" ? searchParams.next : undefined;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{dict.auth.loginTitle}</CardTitle>
          <CardDescription>{dict.auth.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasLinkError && (
            <p className="mb-4 text-sm text-destructive">{dict.auth.invalidLink}</p>
          )}
          <LoginForm dict={dict} next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
