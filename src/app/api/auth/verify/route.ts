import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";
import { createSession } from "@/lib/auth/session";
import { upsertUserByEmail, getUserByReferralCode } from "@/lib/db/queries";
import { setLocale } from "@/lib/actions/auth";
import { ATTRIBUTION_COOKIE, type AttributionPayload } from "@/lib/attribution";

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

  try {
    const attributionRaw = request.cookies.get(ATTRIBUTION_COOKIE)?.value;
    let attribution: { signupSource?: AttributionPayload["source"]; referredByUserId?: string } = {};
    if (attributionRaw) {
      try {
        const parsed = JSON.parse(attributionRaw) as AttributionPayload;
        attribution.signupSource = parsed.source;
        if (parsed.source === "referral" && parsed.ref) {
          const referrer = await getUserByReferralCode(parsed.ref);
          if (referrer) attribution.referredByUserId = referrer.id;
        }
      } catch {
        attribution = {};
      }
    }

    const user = await upsertUserByEmail(payload.email, payload.locale, attribution);
    await createSession({ userId: user.id, email: user.email });
    await setLocale(payload.locale);
  } catch (err) {
    console.error("magic link verification failed", err);
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const destination =
    payload.next && payload.next.startsWith("/") && !payload.next.startsWith("//")
      ? payload.next
      : "/dashboard";
  const response = NextResponse.redirect(`${origin}${destination}`);
  response.cookies.delete(ATTRIBUTION_COOKIE);
  return response;
}
