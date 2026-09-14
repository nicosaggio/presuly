import { dictionaries, t, type Locale } from "@/lib/i18n";

function layout(locale: Locale, bodyHtml: string, ctaUrl?: string, ctaLabel?: string) {
  const appName = dictionaries[locale].common.appName;
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#18181b;">
    <div style="font-weight:700;font-size:18px;margin-bottom:24px;">${appName}</div>
    <div style="font-size:15px;line-height:1.6;">${bodyHtml}</div>
    ${
      ctaUrl && ctaLabel
        ? `<div style="margin-top:28px;">
            <a href="${ctaUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">${ctaLabel}</a>
          </div>`
        : ""
    }
    <div style="margin-top:40px;font-size:12px;color:#a1a1aa;">${appName} · presuly.com.ar</div>
  </div>`;
}

export function budgetViewedEmail(
  locale: Locale,
  vars: { clientName: string; title: string; dashboardUrl: string }
) {
  const d = dictionaries[locale].emails;
  return {
    subject: t(d.viewedSubject, vars),
    html: layout(
      locale,
      `<p>${t(d.viewedBody, vars)}</p>`,
      vars.dashboardUrl,
      d.viewedCta
    ),
  };
}

export function budgetAcceptedOwnerEmail(
  locale: Locale,
  vars: { clientName: string; title: string }
) {
  const d = dictionaries[locale].emails;
  return {
    subject: t(d.acceptedOwnerSubject, vars),
    html: layout(locale, `<p>${t(d.acceptedOwnerBody, vars)}</p>`),
  };
}

export function budgetAcceptedClientEmail(
  locale: Locale,
  vars: { title: string }
) {
  const d = dictionaries[locale].emails;
  return {
    subject: t(d.acceptedClientSubject, vars),
    html: layout(locale, `<p>${t(d.acceptedClientBody, vars)}</p>`),
  };
}
