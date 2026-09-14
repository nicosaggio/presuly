import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getGoogleAuthUrl } from "@/lib/auth/google";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
export const OAUTH_STATE_COOKIE = "presuly_oauth_state";
export const GOOGLE_REDIRECT_URI = new URL("/api/auth/google/callback", APP_URL).toString();

export async function GET(request: NextRequest) {
  const rawNext = request.nextUrl.searchParams.get("next");
  // Solo rutas relativas propias (evita open-redirect a un dominio externo).
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : undefined;

  const csrf = nanoid(24);
  const response = NextResponse.redirect(getGoogleAuthUrl(csrf, GOOGLE_REDIRECT_URI));
  response.cookies.set(OAUTH_STATE_COOKIE, JSON.stringify({ csrf, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutos — alcanza de sobra para completar el consentimiento
  });
  return response;
}
