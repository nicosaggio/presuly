import { Resend } from "resend";

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

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
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
