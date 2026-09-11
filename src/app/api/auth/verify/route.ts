import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";
import { createSession } from "@/lib/auth/session";
import { upsertUserByEmail, getUserByReferralCode } from "@/lib/db/queries";
import { setLocale } from "@/lib/actions/auth";
import { ATTRIBUTION_COOKIE, type AttributionPayload } from "@/lib/attribution";

// En Netlify, `request.nextUrl.origin` resuelve al hostname interno del
// deploy (`https://<deploy-id>--presuly.netlify.app`), no al dominio público
// que usó el visitante — un redirect armado con eso manda la sesión a un
// dominio distinto de donde quedó la cookie, y el login por magic link
// termina rebotando a /login. `APP_URL` es la fuente de verdad correcta.
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", APP_URL));
  }

  const payload = verifyMagicLinkToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", APP_URL));
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
    return NextResponse.redirect(new URL("/login?error=invalid_link", APP_URL));
  }

  const destination =
    payload.next && payload.next.startsWith("/") && !payload.next.startsWith("//")
      ? payload.next
      : "/dashboard";
  const destinationUrl = new URL(destination, APP_URL);
  // Netlify le pega el query string del request original a cualquier redirect
  // 307 cuyo destino no tenga uno propio (confirmado a mano contra prod,
  // 2026-09-11) — sin esto, el token del magic link terminaba colgando en la
  // URL final. Con un query propio, Netlify no lo toca.
  if (!destinationUrl.search) destinationUrl.search = "login=ok";
  const response = NextResponse.redirect(destinationUrl);
  response.cookies.delete(ATTRIBUTION_COOKIE);
  return response;
}
