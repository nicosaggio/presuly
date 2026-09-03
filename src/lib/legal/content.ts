export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalContent = {
  title: string;
  updated: string;
  disclaimer: string;
  sections: LegalSection[];
};

const CONTACT_EMAIL = "hola@presuly.com.ar";

export const legalContent: Record<"es" | "en", { terms: LegalContent; privacy: LegalContent; refunds: LegalContent }> = {
  es: {
    terms: {
      title: "Términos y Condiciones",
      updated: "Última actualización: septiembre de 2026",
      disclaimer:
        "Este documento describe de forma clara cómo funciona Presuly. No reemplaza el asesoramiento de un abogado — antes de escalar el negocio, o si tenés dudas específicas sobre tu caso, te recomendamos una revisión legal profesional.",
      sections: [
        {
          heading: "1. Qué es Presuly",
          paragraphs: [
            "Presuly es una herramienta para crear presupuestos, enviarlos como link a tus clientes y que ellos los acepten con un registro de aceptación electrónico. Lo ofrece un equipo pequeño y se opera de forma mayormente automatizada.",
          ],
        },
        {
          heading: "2. Tu cuenta",
          paragraphs: [
            "Entrás con tu email mediante un link mágico, sin contraseña. Sos responsable de mantener el acceso a esa casilla de email — cualquiera que pueda leer tus emails puede entrar a tu cuenta.",
          ],
        },
        {
          heading: "3. Uso permitido",
          paragraphs: [
            "Podés usar Presuly para crear y enviar presupuestos reales a clientes reales. No está permitido: usarlo para enviar spam, suplantar a otra persona o empresa, cargar contenido ilegal, o intentar vulnerar la seguridad del servicio.",
          ],
        },
        {
          heading: "4. Contenido que cargás",
          paragraphs: [
            "Vos sos responsable del contenido de los presupuestos que creás, incluidos los datos de tus clientes que cargues (nombre, email). Presuly no revisa ni garantiza la exactitud de ese contenido.",
          ],
        },
        {
          heading: "5. Alcance de la firma electrónica",
          paragraphs: [
            "Cuando un cliente 'acepta' un presupuesto, Presuly genera un registro de aceptación con nombre, fecha, hora e IP. Esto es un registro de aceptación con sello de tiempo, no una firma digital certificada según la Ley 25.506 (Argentina) ni un esquema equivalente como eIDAS en la Unión Europea.",
            "Puede no tener el mismo valor probatorio que una firma digital certificada. Para acuerdos de alto valor o que requieran validez legal reforzada, te recomendamos usar una firma digital certificada además de (o en vez de) este registro.",
          ],
        },
        {
          heading: "6. Pagos entre vos y tu cliente",
          paragraphs: [
            "Presuly nunca cobra, retiene ni administra el pago del proyecto entre vos y tu cliente. Si agregás un link de pago (por ejemplo de Mercado Pago, Stripe o PayPal), ese link es tuyo y el pago va directo a tu cuenta — Presuly no participa en esa transacción ni es responsable por ella.",
          ],
        },
        {
          heading: "7. Planes y suscripción",
          paragraphs: [
            "Presuly tiene un plan gratis con límites y planes pagos (Pro, Estudio) con más funciones. Los pagos de la suscripción los procesa Paddle.com, que actúa como Merchant of Record: te factura en su nombre y gestiona los impuestos aplicables según tu ubicación.",
          ],
        },
        {
          heading: "8. Cancelación y reembolsos",
          paragraphs: [
            "Podés cancelar tu suscripción cuando quieras desde el portal de facturación. Ver la Política de Reembolsos para los detalles de devoluciones.",
          ],
        },
        {
          heading: "9. Disponibilidad y responsabilidad",
          paragraphs: [
            "Presuly se ofrece 'tal cual', sin garantía de disponibilidad ininterrumpida. No somos responsables por pérdidas indirectas derivadas del uso o la imposibilidad de uso del servicio, dentro de lo permitido por la ley aplicable.",
          ],
        },
        {
          heading: "10. Cambios a estos términos",
          paragraphs: [
            "Podemos actualizar estos términos. Si el cambio es importante, te avisamos por email antes de que entre en vigencia.",
          ],
        },
        {
          heading: "11. Contacto",
          paragraphs: [`Escribinos a ${CONTACT_EMAIL} ante cualquier duda.`],
        },
      ],
    },
    privacy: {
      title: "Política de Privacidad",
      updated: "Última actualización: septiembre de 2026",
      disclaimer:
        "Este documento describe de forma clara qué datos manejamos y para qué. No reemplaza el asesoramiento de un abogado — antes de escalar el negocio te recomendamos una revisión legal profesional.",
      sections: [
        {
          heading: "1. Qué datos recolectamos",
          paragraphs: [
            "Tu email y, si lo cargás, tu nombre. El contenido de los presupuestos que creás, incluidos los datos de tus clientes que vos ingreses (nombre, email). Cuando un cliente acepta un presupuesto: su nombre, dirección IP y navegador, como parte del registro de aceptación. Datos básicos de uso del servicio (por ejemplo, cuándo se abrió un presupuesto).",
          ],
        },
        {
          heading: "2. Para qué los usamos",
          paragraphs: [
            "Para operar el servicio (crear, publicar y mostrar tus presupuestos), enviarte notificaciones (por ejemplo, cuándo un cliente ve o acepta un presupuesto), procesar el pago de tu suscripción si tenés un plan pago, y mejorar el producto.",
          ],
        },
        {
          heading: "3. Con quién los compartimos",
          paragraphs: [
            "Usamos proveedores externos para operar Presuly: Neon (base de datos), Resend (envío de emails), Paddle (pagos y facturación de tu suscripción) y Netlify (hosting). Cada uno procesa los datos estrictamente necesarios para su función. No vendemos tus datos a terceros ni los usamos con fines publicitarios.",
          ],
        },
        {
          heading: "4. Dónde se almacenan",
          paragraphs: [
            "En los servidores de los proveedores mencionados arriba, ubicados según su infraestructura (principalmente Estados Unidos y la Unión Europea).",
          ],
        },
        {
          heading: "5. Cuánto tiempo los guardamos",
          paragraphs: [
            "Mientras tu cuenta esté activa. Si la cerrás o pedís el borrado de tus datos, los eliminamos dentro de un plazo razonable, salvo que debamos conservar algún registro por obligación legal o fiscal.",
          ],
        },
        {
          heading: "6. Tus derechos",
          paragraphs: [
            `Podés pedirnos acceder, corregir o borrar tus datos en cualquier momento escribiendo a ${CONTACT_EMAIL}. Por ahora este proceso lo gestionamos manualmente por email; estamos trabajando en que se pueda hacer de forma autoservicio desde tu cuenta.`,
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "Hoy usamos una única cookie técnica esencial para mantener tu sesión iniciada. No usamos cookies de seguimiento ni de publicidad.",
          ],
        },
        {
          heading: "8. Menores de edad",
          paragraphs: ["Presuly no está dirigido a personas menores de 18 años."],
        },
        {
          heading: "9. Cambios a esta política",
          paragraphs: [
            "Podemos actualizar esta política. Si el cambio es importante, te avisamos por email antes de que entre en vigencia.",
          ],
        },
        {
          heading: "10. Contacto",
          paragraphs: [`Escribinos a ${CONTACT_EMAIL} ante cualquier duda sobre tus datos.`],
        },
      ],
    },
    refunds: {
      title: "Política de Reembolsos",
      updated: "Última actualización: septiembre de 2026",
      disclaimer:
        "Este documento describe de forma clara nuestra política de reembolsos. No reemplaza el asesoramiento de un abogado.",
      sections: [
        {
          heading: "14 días, sin preguntas",
          paragraphs: [
            "Si no estás conforme con tu suscripción paga a Presuly (Pro o Estudio), escribinos dentro de los 14 días desde el cobro y te devolvemos el 100%, sin necesidad de justificar el motivo.",
          ],
        },
        {
          heading: "Cómo pedirlo",
          paragraphs: [
            `Mandanos un email a ${CONTACT_EMAIL} con el asunto "Reembolso" indicando el email de tu cuenta. El reembolso lo procesa Paddle, nuestro procesador de pagos, y puede tardar unos días hábiles en verse reflejado según tu medio de pago.`,
          ],
        },
        {
          heading: "Después de los 14 días",
          paragraphs: [
            "Podés cancelar tu suscripción cuando quieras desde el portal de facturación. La cancelación evita el próximo cobro, pero no genera devolución del período ya pagado — seguís teniendo acceso al plan pago hasta el final de ese período.",
          ],
        },
      ],
    },
  },
  en: {
    terms: {
      title: "Terms & Conditions",
      updated: "Last updated: September 2026",
      disclaimer:
        "This document describes clearly how Presuly works. It doesn't replace legal advice — before scaling the business, or if you have specific questions about your case, we recommend a professional legal review.",
      sections: [
        {
          heading: "1. What Presuly is",
          paragraphs: [
            "Presuly is a tool for creating proposals, sending them as a link to your clients, and having them accept with an electronic acceptance record. It's run by a small team and operated in a mostly automated way.",
          ],
        },
        {
          heading: "2. Your account",
          paragraphs: [
            "You log in with your email via a magic link, no password. You're responsible for keeping access to that inbox — anyone who can read your email can access your account.",
          ],
        },
        {
          heading: "3. Permitted use",
          paragraphs: [
            "You can use Presuly to create and send real proposals to real clients. Not allowed: sending spam, impersonating another person or company, uploading illegal content, or attempting to breach the service's security.",
          ],
        },
        {
          heading: "4. Content you upload",
          paragraphs: [
            "You're responsible for the content of the proposals you create, including any client data you enter (name, email). Presuly doesn't review or guarantee the accuracy of that content.",
          ],
        },
        {
          heading: "5. Scope of the electronic signature",
          paragraphs: [
            "When a client 'accepts' a proposal, Presuly generates an acceptance record with name, date, time and IP address. This is a timestamped acceptance record, not a certified digital signature under Argentina's Law 25.506 or an equivalent scheme like eIDAS in the EU.",
            "It may not carry the same evidentiary weight as a certified digital signature. For high-value agreements or ones requiring stronger legal validity, we recommend using a certified digital signature in addition to (or instead of) this record.",
          ],
        },
        {
          heading: "6. Payments between you and your client",
          paragraphs: [
            "Presuly never charges, holds, or manages the payment for the project between you and your client. If you add a payment link (e.g. Mercado Pago, Stripe, or PayPal), that link is yours and the payment goes directly to your account — Presuly doesn't participate in or take responsibility for that transaction.",
          ],
        },
        {
          heading: "7. Plans and subscription",
          paragraphs: [
            "Presuly has a free plan with limits and paid plans (Pro, Studio) with more features. Subscription payments are processed by Paddle.com, which acts as Merchant of Record: it invoices you on our behalf and handles applicable taxes based on your location.",
          ],
        },
        {
          heading: "8. Cancellation and refunds",
          paragraphs: [
            "You can cancel your subscription anytime from the billing portal. See the Refund Policy for details on refunds.",
          ],
        },
        {
          heading: "9. Availability and liability",
          paragraphs: [
            "Presuly is provided 'as is', without a guarantee of uninterrupted availability. We're not liable for indirect losses arising from the use or inability to use the service, to the extent permitted by applicable law.",
          ],
        },
        {
          heading: "10. Changes to these terms",
          paragraphs: [
            "We may update these terms. If the change is significant, we'll notify you by email before it takes effect.",
          ],
        },
        {
          heading: "11. Contact",
          paragraphs: [`Email us at ${CONTACT_EMAIL} with any questions.`],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      updated: "Last updated: September 2026",
      disclaimer:
        "This document describes clearly what data we handle and why. It doesn't replace legal advice — before scaling the business we recommend a professional legal review.",
      sections: [
        {
          heading: "1. What data we collect",
          paragraphs: [
            "Your email and, if you enter it, your name. The content of the proposals you create, including any client data you enter (name, email). When a client accepts a proposal: their name, IP address and browser, as part of the acceptance record. Basic usage data (e.g. when a proposal was opened).",
          ],
        },
        {
          heading: "2. What we use it for",
          paragraphs: [
            "To operate the service (create, publish and display your proposals), send you notifications (e.g. when a client views or accepts a proposal), process your subscription payment if you're on a paid plan, and improve the product.",
          ],
        },
        {
          heading: "3. Who we share it with",
          paragraphs: [
            "We use external providers to operate Presuly: Neon (database), Resend (email delivery), Paddle (subscription payments and billing) and Netlify (hosting). Each processes only the data strictly necessary for its function. We don't sell your data to third parties or use it for advertising.",
          ],
        },
        {
          heading: "4. Where it's stored",
          paragraphs: [
            "On the servers of the providers above, located according to their infrastructure (mainly the United States and the European Union).",
          ],
        },
        {
          heading: "5. How long we keep it",
          paragraphs: [
            "For as long as your account is active. If you close it or request deletion, we remove it within a reasonable timeframe, unless we must retain some record for legal or tax obligations.",
          ],
        },
        {
          heading: "6. Your rights",
          paragraphs: [
            `You can ask us to access, correct or delete your data at any time by writing to ${CONTACT_EMAIL}. For now we handle this manually by email; we're working on making it self-service from your account.`,
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "We currently use a single essential technical cookie to keep you logged in. We don't use tracking or advertising cookies.",
          ],
        },
        {
          heading: "8. Children",
          paragraphs: ["Presuly is not directed at people under 18 years old."],
        },
        {
          heading: "9. Changes to this policy",
          paragraphs: [
            "We may update this policy. If the change is significant, we'll notify you by email before it takes effect.",
          ],
        },
        {
          heading: "10. Contact",
          paragraphs: [`Email us at ${CONTACT_EMAIL} with any questions about your data.`],
        },
      ],
    },
    refunds: {
      title: "Refund Policy",
      updated: "Last updated: September 2026",
      disclaimer: "This document describes our refund policy clearly. It doesn't replace legal advice.",
      sections: [
        {
          heading: "14 days, no questions asked",
          paragraphs: [
            "If you're not satisfied with your paid Presuly subscription (Pro or Studio), email us within 14 days of the charge and we'll refund it in full, no need to justify why.",
          ],
        },
        {
          heading: "How to request it",
          paragraphs: [
            `Email ${CONTACT_EMAIL} with the subject "Refund" and your account email. The refund is processed by Paddle, our payment processor, and may take a few business days to reflect depending on your payment method.`,
          ],
        },
        {
          heading: "After 14 days",
          paragraphs: [
            "You can cancel your subscription anytime from the billing portal. Cancelling stops the next charge, but doesn't refund the period already paid — you'll keep access to the paid plan until the end of that period.",
          ],
        },
      ],
    },
  },
};
