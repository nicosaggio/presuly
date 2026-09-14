import "server-only";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function getClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("GOOGLE_CLIENT_ID no está configurado. Agregalo a .env.local.");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("GOOGLE_CLIENT_SECRET no está configurado. Agregalo a .env.local.");
  return secret;
}

/** URL de "Sign in with Google". `redirectUri` tiene que estar cargada tal
 * cual en Google Cloud Console → Authorized redirect URIs. */
export function getGoogleAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type GoogleUserInfo = {
  email: string;
  emailVerified: boolean;
  name?: string;
};

/** Intercambia el `code` del callback por los datos del usuario. Tira si
 * Google rechaza el code o si la cuenta no tiene el email verificado. */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<GoogleUserInfo> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange falló: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const tokenData = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(`Google userinfo falló: ${userRes.status} ${await userRes.text()}`);
  }
  const user = (await userRes.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!user.email) throw new Error("Google no devolvió un email");

  return {
    email: user.email.toLowerCase(),
    emailVerified: user.email_verified ?? false,
    name: user.name,
  };
}
