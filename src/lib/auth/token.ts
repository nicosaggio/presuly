import { createHmac, timingSafeEqual } from "crypto";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET no está configurado. Generá uno con `openssl rand -base64 32` y agregalo a .env.local."
    );
  }
  return secret;
}

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/**
 * Token firmado sin estado (HMAC), no JWT completo: alcanza para magic links
 * y sesión porque solo necesitamos payload + expiración verificables server-side.
 */
export function createSignedToken(
  payload: Record<string, unknown>,
  expiresInSeconds: number
): string {
  const secret = getSecret();
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = sign(data, secret);
  return `${data}.${sig}`;
}

export function verifySignedToken<T extends Record<string, unknown>>(
  token: string
): T | null {
  const secret = getSecret();
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = sign(data, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload as T;
  } catch {
    return null;
  }
}
