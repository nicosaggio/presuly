import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";
import { upsertUserByEmail, getUserByReferralCode } from "@/lib/db/queries";
import { setLocale } from "@/lib/actions/auth";
import { getLocale } from "@/lib/i18n/server";
import { ATTRIBUTION_COOKIE, type AttributionPayload } from "@/lib/attribution";
import { OAUTH_STATE_COOKIE, GOOGLE_REDIRECT_URI } from "@/app/api/auth/google/route";

// `request.nextUrl.origin` resuelve al hostname interno del deploy de
// Netlify, no al dominio público — ver docs/RUNBOOK.md y la entrada del
// 2026-09-11 en docs/DECISIONS.md (rompió el login por magic link). Mismo
// fix acá: APP_URL como fuente de verdad, y un query propio en el destino
// final para que Netlify no le pegue el `code`/`state` del request original.
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function loginError(reason: string) {
  const url = new URL("/login", APP_URL);
  url.searchParams.set("error", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const stateCookieRaw = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  let stateCookie: { csrf?: string; next?: string } = {};
  if (stateCookieRaw) {
    try {
      stateCookie = JSON.parse(stateCookieRaw);
    } catch {
      stateCookie = {};
    }
  }

  if (!code || !state || !stateCookie.csrf || state !== stateCookie.csrf) {
    return loginError("oauth_failed");
  }

  let email: string;
  try {
    const googleUser = await exchangeGoogleCode(code, GOOGLE_REDIRECT_URI);
    if (!googleUser.emailVerified) {
      return loginError("oauth_failed");
    }
    email = googleUser.email;
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    return loginError("oauth_failed");
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

    const locale = await getLocale();
    const user = await upsertUserByEmail(email, locale, attribution);
    await createSession({ userId: user.id, email: user.email });
    await setLocale(user.locale);
  } catch (err) {
    console.error("Google OAuth session creation failed", err);
    return loginError("oauth_failed");
  }

  const destination =
    stateCookie.next && stateCookie.next.startsWith("/") && !stateCookie.next.startsWith("//")
      ? stateCookie.next
      : "/dashboard";
  const destinationUrl = new URL(destination, APP_URL);
  if (!destinationUrl.search) destinationUrl.search = "login=ok";

  const response = NextResponse.redirect(destinationUrl);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(ATTRIBUTION_COOKIE);
  return response;
}
