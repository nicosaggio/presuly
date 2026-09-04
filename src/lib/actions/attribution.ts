"use server";

import { cookies } from "next/headers";
import { ATTRIBUTION_COOKIE, type AttributionPayload } from "@/lib/attribution";

const ATTRIBUTION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días

/** Guarda de dónde vino la visita (primer touch) para atribuir el registro si se convierte en usuario. */
export async function captureAttribution(payload: AttributionPayload) {
  const store = await cookies();
  // No pisar una atribución ya guardada: gana el primer link que trajo a la persona.
  if (store.get(ATTRIBUTION_COOKIE)) return;
  store.set(ATTRIBUTION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ATTRIBUTION_TTL_SECONDS,
  });
}
