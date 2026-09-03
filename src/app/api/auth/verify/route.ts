import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";
import { createSession } from "@/lib/auth/session";
import { upsertUserByEmail } from "@/lib/db/queries";
import { setLocale } from "@/lib/actions/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const origin = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const payload = verifyMagicLinkToken(token);
  if (!payload) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const user = await upsertUserByEmail(payload.email, payload.locale);
  await createSession({ userId: user.id, email: user.email });
  await setLocale(payload.locale);

  return NextResponse.redirect(`${origin}/dashboard`);
}
