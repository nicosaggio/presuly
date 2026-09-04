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
5. Variables de Paddle (Fase 2): `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_ENV`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_PRO_MONTHLY`, `PADDLE_PRICE_PRO_ANNUAL` — ver `.env.example` para dónde sacar cada uno. Con solo la `PADDLE_API_KEY` ya se puede crear el producto y los precios por API (`paddle.products.create` / `paddle.prices.create`) y el webhook (`paddle.notificationSettings.create`, que devuelve el secret directo) sin tocar el dashboard.
6. **Dominios aprobados en Paddle**: el checkout de Paddle.js solo abre desde dominios aprobados manualmente (Checkout → Checkout Settings → Approved Domains) — esto no se puede hacer por API, es una pantalla del dashboard. `localhost` no siempre lo acepta; para probar el checkout localmente puede hacer falta un túnel (ngrok) o probar directo contra el dominio de producción ya aprobado.

### Pasar Paddle de Sandbox a Live

El catálogo, precios y webhook de Live ya están creados por API (ver `.env.local`, comentado bajo "Paddle LIVE"). Falta, antes de activarlo en producción:

1. **Client-side token Live**: Developer Tools → Authentication → Client-side tokens, con la cuenta en modo Live (no lo genera la API).
2. **Verificación de cuenta**: datos del negocio + cuenta bancaria para payouts, en Business account → Payouts. Esto lo carga el usuario directo en Paddle, nunca por acá — son datos financieros reales.
3. **Approved Domains** (modo Live, es una lista separada de la de Sandbox): Checkout → Checkout Settings → agregar `presuly.com.ar`.
4. **Default payment link** (modo Live, también separado de Sandbox): mismo lugar, poner `https://presuly.com.ar/dashboard/billing`.
5. **Solicitar aprobación de dominio**: Checkout → Request domain approval. A diferencia de Sandbox (que aprueba automático), en Live esto lo revisa Paddle — conviene mandarlo ni bien se activa Live para que corra en paralelo con la verificación.

Recién cuando 1-5 estén listos tiene sentido cambiar las variables de entorno de producción (`PADDLE_API_KEY`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_ENV=production`, `PADDLE_PRICE_PRO_MONTHLY`, `PADDLE_PRICE_PRO_ANNUAL`, `PADDLE_WEBHOOK_SECRET`) de los valores de Sandbox a los de Live — hacerlo antes rompe el checkout para cualquiera que esté probando en producción mientras tanto.

### Bloqueante conocido: "Unrecognized Git contributor" en Netlify

Los pushes automáticos (CI) desde este entorno quedan bloqueados con `Build blocked: Unrecognized Git contributor` — el plan de Netlify exige aprobar manualmente commits de contribuidores no reconocidos antes de buildearlos. No es algo resoluble por API (lo intenté, `updateSite` con `untrusted_flow` no tuvo efecto). Hay que entrar a **Site configuration → Build & deploy** (o la pestaña **Deploys** del sitio) y aprobar/reintentar el deploy bloqueado, o agregar el email del commit como colaborador de confianza del team.

## Simplificaciones deliberadas de Fase 1 (no son bugs)

- **Rate limiting del magic link**: cooldown de 30s por cookie de navegador, nada más. Es un piso, no protección real contra abuso distribuido. Reforzar en Fase 4 si el reporte diario muestra picos anómalos de registro.
- **Límite de 3 presupuestos del plan gratis**: aplicado desde Fase 2 (`src/lib/plans.ts`). "Activo" = `draft`/`sent`/`viewed`; un presupuesto aceptado o vencido libera el cupo.
- **PDF sin storage**: se regenera al vuelo en cada descarga (`/api/p/[token]/pdf`), no se guarda ningún archivo. Evita necesitar un servicio de storage — alineado con costo cero — a costa de recomputar el render en cada request (barato, es una operación de milisegundos).
- **Tracking de apertura**: solo se registra "visto por primera vez" + contador total de vistas. El tracking granular por sección (cuánto tiempo en cada parte del presupuesto) es una feature de Fase 3, no de Fase 1.
- **Sesión sin tabla en base**: el magic link y la cookie de sesión son tokens firmados (HMAC) con expiración, no hay tabla de sesiones ni de tokens de un solo uso. Más simple de operar, a cambio de que un magic link filtrado sigue siendo válido hasta que expira (15 min) en vez de invalidarse al primer uso.

## Qué NO hacer sin autorización humana (ampliar en Fase 4)

- No tocar precios del plan gratis/Pro sin decisión del usuario.
- No mandar emails masivos fuera del flujo transaccional (magic link, notificación de visto, notificación de aceptación).
- No borrar datos de usuarios o presupuestos salvo pedido explícito de borrado de cuenta.
- No responder reclamos legales o pedidos de reembolso — escalar al usuario.
