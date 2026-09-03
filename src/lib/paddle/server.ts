import "server-only";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let client: Paddle | null = null;

export function getPaddleClient(): Paddle {
  if (!client) {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      throw new Error("PADDLE_API_KEY no está configurado. Agregalo a .env.local.");
    }
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";
    client = new Paddle(apiKey, {
      environment: env === "production" ? Environment.production : Environment.sandbox,
    });
  }
  return client;
}

export function getPaddleWebhookSecret(): string {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("PADDLE_WEBHOOK_SECRET no está configurado. Agregalo a .env.local.");
  }
  return secret;
}

/** IDs de precio de Paddle, uno por plan/frecuencia. Se configuran una vez creados en el dashboard de Paddle. */
export function getPriceIds() {
  return {
    proMonthly: process.env.PADDLE_PRICE_PRO_MONTHLY ?? "",
    proAnnual: process.env.PADDLE_PRICE_PRO_ANNUAL ?? "",
    studioMonthly: process.env.PADDLE_PRICE_STUDIO_MONTHLY ?? "",
  };
}
