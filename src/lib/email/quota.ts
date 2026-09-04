import { sql, gte, lt, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailSends, systemState } from "@/lib/db/schema";
import { sendRaw } from "./resend";

/** Límite del plan free de Resend. Si esto cambia (plan pago), subir o sacar el chequeo. */
const DAILY_LIMIT = 100;
const ALERT_THRESHOLD = 80;
const ALERT_COOLDOWN_MS = 20 * 60 * 60 * 1000;
const ALERT_KEY = "resend_daily_quota_alert";
const RETENTION_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Se llama después de cada email real enviado (ver sendEmail() en resend.ts). Registra el
 * envío y, si en las últimas 24hs nos acercamos al límite diario de Resend, manda un aviso
 * único por día a ADMIN_EMAIL — para enterarse antes de que empiecen a fallar magic links y
 * notificaciones, no después. No lanza: un fallo acá nunca debe tumbar un envío real.
 */
export async function checkEmailQuota() {
  await db.insert(emailSends).values({});
  await db.delete(emailSends).where(lt(emailSends.createdAt, new Date(Date.now() - RETENTION_MS)));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailSends)
    .where(gte(emailSends.createdAt, since));

  if (count < ALERT_THRESHOLD) return;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const [state] = await db
    .select()
    .from(systemState)
    .where(eq(systemState.key, ALERT_KEY))
    .limit(1);
  if (state && Date.now() - new Date(state.value).getTime() < ALERT_COOLDOWN_MS) return;

  await sendRaw({
    to: adminEmail,
    subject: `Presuly: cerca del límite diario de emails (${count}/${DAILY_LIMIT})`,
    html: `<p>Se enviaron ${count} emails en las últimas 24 horas. El plan free de Resend permite ${DAILY_LIMIT} por día — si se supera, dejan de salir magic links y notificaciones hasta el día siguiente.</p><p>Si esto se repite seguido, conviene pasar a un plan pago de Resend.</p>`,
  });

  await db
    .insert(systemState)
    .values({ key: ALERT_KEY, value: new Date().toISOString() })
    .onConflictDoUpdate({
      target: systemState.key,
      set: { value: new Date().toISOString(), updatedAt: new Date() },
    });
}
