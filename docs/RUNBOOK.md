# RUNBOOK.md

> Este documento se expande en Fase 4 (capa de operación: endpoint de reporte, jobs,
> alertas). Por ahora cubre lo necesario para levantar y desplegar el bucle central de Fase 1.

## Setup local

1. `npm install`
2. Copiá `.env.example` a `.env.local` y completá:
   - `DATABASE_URL`: connection string de un proyecto Neon (gratis, sin tarjeta) — [neon.tech](https://neon.tech)
   - `AUTH_SECRET`: generá uno con `openssl rand -base64 32`
   - `RESEND_API_KEY`: de [resend.com/api-keys](https://resend.com/api-keys) (plan gratis)
   - `EMAIL_FROM`: mientras no verifiques un dominio propio en Resend, usá `Presuly <onboarding@resend.dev>` — Resend solo entrega ese remitente al email de tu propia cuenta, así que para probar el flujo completo con un cliente real hace falta verificar `presuly.com.ar` en Resend (registros DNS, es gratis).
   - `APP_URL`: `http://localhost:3000` en local
3. Corré las migraciones contra tu Neon: `npm run db:push` (usa el schema directo, sin generar SQL — más rápido para desarrollo. Para producción preferí `npm run db:generate` + `npm run db:migrate`, que sí versiona el SQL en `/drizzle`).
4. `npm run dev`

## Deploy a Netlify

1. Conectar el repo a Netlify (o `netlify deploy` con la CLI).
2. Configurar las mismas variables de entorno del paso 2 de arriba en el panel de Netlify (Site settings → Environment variables), con `APP_URL` apuntando al dominio real (`https://presuly.com.ar`).
3. El `netlify.toml` ya declara el plugin `@netlify/plugin-nextjs`, que Netlify detecta automáticamente.
4. Correr las migraciones contra la base de producción una vez (`DATABASE_URL` de prod + `npm run db:migrate`) antes del primer deploy.

## Simplificaciones deliberadas de Fase 1 (no son bugs)

- **Rate limiting del magic link**: cooldown de 30s por cookie de navegador, nada más. Es un piso, no protección real contra abuso distribuido. Reforzar en Fase 4 si el reporte diario muestra picos anómalos de registro.
- **Límite de 3 presupuestos del plan gratis**: todavía no se aplica en código. No tiene sentido enforcarlo sin sistema de planes/billing (eso es Fase 2). Se agrega ahí.
- **PDF sin storage**: se regenera al vuelo en cada descarga (`/api/p/[token]/pdf`), no se guarda ningún archivo. Evita necesitar un servicio de storage — alineado con costo cero — a costa de recomputar el render en cada request (barato, es una operación de milisegundos).
- **Tracking de apertura**: solo se registra "visto por primera vez" + contador total de vistas. El tracking granular por sección (cuánto tiempo en cada parte del presupuesto) es una feature de Fase 3, no de Fase 1.
- **Sesión sin tabla en base**: el magic link y la cookie de sesión son tokens firmados (HMAC) con expiración, no hay tabla de sesiones ni de tokens de un solo uso. Más simple de operar, a cambio de que un magic link filtrado sigue siendo válido hasta que expira (15 min) en vez de invalidarse al primer uso.

## Qué NO hacer sin autorización humana (ampliar en Fase 4)

- No tocar precios del plan gratis/Pro sin decisión del usuario.
- No mandar emails masivos fuera del flujo transaccional (magic link, notificación de visto, notificación de aceptación).
- No borrar datos de usuarios o presupuestos salvo pedido explícito de borrado de cuenta.
- No responder reclamos legales o pedidos de reembolso — escalar al usuario.
