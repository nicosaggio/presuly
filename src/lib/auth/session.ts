import { cookies } from "next/headers";
import { createSignedToken, verifySignedToken } from "./token";

const SESSION_COOKIE = "presuly_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const token = createSignedToken(payload, SESSION_TTL_SECONDS);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySignedToken<SessionPayload>(token);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
