import { Resend } from "resend";
import { checkEmailQuota } from "./quota";

let client: Resend | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY no está configurado. Agregalo a .env.local."
      );
    }
    client = new Resend(apiKey);
  }
  return client;
}

function getFrom() {
  return process.env.EMAIL_FROM ?? "Presuly <onboarding@resend.dev>";
}

export type SendEmailOpts = {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
};

/** Pega directo a Resend, sin tocar el contador de cuota (lo usa el propio aviso de cuota). */
export async function sendRaw(opts: SendEmailOpts) {
  const resend = getClient();
  const result = await resend.emails.send({
    from: getFrom(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });
  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
  return result.data;
}

export async function sendEmail(opts: SendEmailOpts) {
  const data = await sendRaw(opts);
  // Fire-and-forget: nunca debe romper el envío real si falla el conteo.
  checkEmailQuota().catch((err) => console.error("checkEmailQuota failed", err));
  return data;
}
