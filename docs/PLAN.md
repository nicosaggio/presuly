# PLAN.md — Presuly (nombre provisional)

> Fase 0 — Validación y decisiones. Sin código todavía. Pendiente de tu OK para pasar a Fase 1.

## 1. Tesis

Herramienta de **presupuestos/propuestas que se envían como link**, dirigida a freelancers y estudios chicos hispanohablantes (AR, MX, ES, CO, CL), con interfaz bilingüe es/en y precios en USD desde el día uno.

Bucle viral: emisor (paga) → link → receptor (impresión gratis, ve marca discreta) → receptor se convierte en emisor. Mismo mecanismo que Calendly/Typeform/Loom.

No encontré evidencia de saturación ni de un competidor gratuito dominante en español — el arquetipo se mantiene sin cambios.

## 2. Competencia — hallazgos

**En inglés (mercado saturado y caro):** PandaDoc, Better Proposals, Qwilr, Proposify, Nusii, Bidsketch.
- Debilidad común y explotable: **ninguno de los especializados en propuestas (Nusii, Bidsketch, Proposify, Better Proposals) tiene plan gratis real** — solo trial de 14 días. PandaDoc sí tiene free tier, pero es generalista para equipos de venta, no para freelancers, y es caro arriba ($19–49/asiento).
- Confirma la tesis: un plan gratis *de verdad* es la palanca competitiva.

**En español (nicho desatendido):** no existe un SaaS equivalente con cuenta + tracking de apertura + firma + plantillas. Lo que hay son generadores de PDF sin cuenta (ej. Cotizadora Online) — útiles pero sin retención ni loop viral porque no hay cuenta ni notificación al emisor. Herramientas de firma (Signaturit, Yousign) están enfocadas en compliance eIDAS, no en el flujo de presupuesto.
- Conclusión: hueco real. Seguir adelante con el arquetipo.

**Precios propuestos ($12/mes Pro, $29/mes Estudio):** están calibrados por debajo de toda la competencia especializada en inglés y son coherentes con lo que un freelancer hispanohablante paga hoy por herramientas similares (facturación, firma). Se mantienen sin cambios.

## 3. Verificación de infraestructura — 2 cambios de stack respecto al prompt original

**Cambio 1 — Hosting: Netlify Free en vez de Vercel Hobby.**
El plan Hobby de Vercel **prohíbe explícitamente uso comercial** en sus términos de servicio (no solo un límite técnico — es una restricción contractual; el enforcement es inconsistente pero el riesgo de suspensión existe apenas se activa un cobro). Netlify Free sí permite explícitamente proyectos comerciales/SaaS de pago dentro de su cuota (300 créditos/mes, 100GB banda, 300 min build, buen soporte nativo de Next.js vía su runtime). Cloudflare Pages también permite uso comercial y es más generoso en banda, pero exige un adapter (`@cloudflare/next-on-pages`) que añade fricción para App Router — lo dejo como alternativa de respaldo, no como elección primaria.

**Cambio 2 — Base de datos: Neon en vez de Supabase.**
Ambos tienen free tier viable, pero Supabase **pausa automáticamente los proyectos gratuitos tras 7 días sin requests** (hay que reactivarlos a mano), lo cual es inaceptable para una app que un cliente puede abrir en cualquier momento sin aviso. Neon no tiene ese comportamiento, no expira, permite uso comercial, y da 100 CU-hours/mes + 0.5GB storage, suficiente para arrancar.

**Analytics: PostHog Cloud free en vez de Plausible self-host.**
Plausible "self-host" implica un servidor propio, lo que rompe la restricción de "sin servidores propios". PostHog Cloud free da 1M eventos/mes, de sobra, y puede configurarse sin cookies.

**Resto del stack verificado y sin cambios:** Resend (3.000 emails/mes, 100/día — suficiente para arrancar), Sentry (5.000 errores/mes gratis), GitHub Actions (2.000 min/mes gratis en repo privado, más que suficiente para crons livianos), Next.js + TypeScript + Drizzle + Tailwind/shadcn, magic link auth.

## 4. Pagos — Paddle como primario, no Lemon Squeezy

Verifiqué que **Paddle confirma explícitamente a Argentina** como país soportado para vendedores (acepta ARS, es Merchant of Record, factura IVA/VAT global). Lemon Squeezy no confirma Argentina en su documentación pública de países soportados que pude consultar (la página de la lista completa devolvió error de acceso) — su histórico es más restrictivo con LatAm que Paddle. **Recomiendo Paddle como procesador principal**; dejar Lemon Squeezy como alternativa a validar con una cuenta de prueba real antes de decidir, no como default.

## 5. Nombre de marca

Evalué 8 candidatos en un buscador de dominios. La mayoría de los nombres obvios en español para este uso ("vistolo", "firmalo", "presulo", "vistaly") ya están registrados o en el mercado secundario a precios de US$1.500–7.500 (no viables). Dos quedaron disponibles a precio de registro estándar:

| Nombre | Dominio | Estado | Nota |
|---|---|---|---|
| **Presuly** | presuly.com | Disponible, precio estándar | Puntaje de marca 90/100. Conexión semántica clara con "presupuesto" + patrón de sufijo fácil de pronunciar en ambos idiomas. **Recomendado.** |
| Quotia | quotia.com | Disponible, precio estándar | Más neutro/internacional (conecta con "quote" en inglés), puntaje 73/100. Buena alternativa si se quiere priorizar el mercado angloparlante. |
| Chapalo | chapalo.com | Disponible, precio estándar | Descartado: "chapar" tiene connotación de "besarse/agarrar algo" en Argentina/Uruguay — riesgo de malentendido en un producto profesional B2B. |

**Propuesta: Presuly.**

## 6. ICP (perfil de cliente ideal)

Freelancers y estudios chicos (1–5 personas) de diseño, desarrollo, marketing, fotografía, arquitectura y consultoría en AR/MX/ES/CO/CL, que hoy mandan presupuestos por PDF/WhatsApp sin ningún tracking y pierden tiempo preguntando "¿lo viste?".

## 7. Métrica objetivo

Coeficiente viral `k = nuevos registros por links compartidos / usuarios activos`. Si a los 60 días de Fase 3 (motor de crecimiento) `k < 0.15`, se rediseña el mecanismo antes de invertir en adquisición paga.

## 8. Stack final (con los 2 cambios de arriba)

Next.js (App Router) + TypeScript · Netlify Free · Neon (Postgres) + Drizzle · Magic link (Resend) · Paddle (pagos) · PostHog Cloud free (analytics) · Sentry free (errores) · GitHub Actions (crons) · Tailwind + shadcn/ui.

## 9. Próximo paso

Con tu OK, arranco **Fase 1 — Bucle central**: auth, crear presupuesto, publicar, ver como cliente, aceptar, notificar. Sin pagos ni plantillas todavía. Criterio de aceptación: crear un presupuesto, abrirlo en el celular en modo incógnito, aceptarlo y recibir el email con el PDF.
