import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Página de acceso, sin contenido único para buscadores — se excluye del índice
// (ver también robots.ts, que ya bloquea el crawling de /login).
export const metadata: Metadata = {
  title: "Entrá a tu cuenta | Presuly",
  robots: { index: false, follow: true },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const dict = await getDictionary();
  const searchParams = await props.searchParams;
  const hasOAuthError = searchParams?.error === "oauth_failed";
  const next = typeof searchParams?.next === "string" ? searchParams.next : undefined;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Logo size="md" className="mb-2" />
          <CardTitle>{dict.auth.loginTitle}</CardTitle>
          <CardDescription>{dict.auth.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasOAuthError && (
            <p className="mb-4 text-sm text-destructive">{dict.auth.oauthError}</p>
          )}
          <LoginForm dict={dict} next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
