# RUNBOOK.md

> Fase 4 (capa de operación) en curso: el endpoint de reporte y el rate limiting
> reforzado ya están. Faltan jobs programados y alertas — ver ESTADO.md.

## Setup local

1. `npm install`
2. Copiá `.env.example` a `.env.local` y completá:
   - `DATABASE_URL`: connection string de un proyecto Neon (gratis, sin tarjeta) — [neon.tech](https://neon.tech)
   - `AUTH_SECRET`: generá uno con `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: [console.cloud.google.com](https://console.cloud.google.com) → crear proyecto → APIs & Services → Credentials → Create Credentials → OAuth client ID (Web application). Agregar como Authorized redirect URI tanto `http://localhost:3000/api/auth/google/callback` como `https://presuly.com.ar/api/auth/google/callback`. También hay que configurar la pantalla de consentimiento OAuth (OAuth consent screen) una vez — nombre de la app, logo, email de soporte — antes de que Google deje crear el client ID.
   - `RESEND_API_KEY`: de [resend.com/api-keys](https://resend.com/api-keys) (plan gratis) — el login ya no manda email (ver login por Google arriba), esto sigue haciendo falta para las notificaciones transaccionales (presupuesto visto/aceptado) y el aviso de cupo.
   - `EMAIL_FROM`: mientras no verifiques un dominio propio en Resend, usá `Presuly <onboarding@resend.dev>` — Resend solo entrega ese remitente al email de tu propia cuenta, así que para probar el flujo completo con un cliente real hace falta verificar `presuly.com.ar` en Resend (registros DNS, es gratis).
   - `APP_URL`: `http://localhost:3000` en local
   - `ADMIN_REPORT_TOKEN` (opcional): para que un agente/cron llame `GET /api/admin/report` sin sesión de navegador. Generá uno con `openssl rand -base64 32`.
3. Corré las migraciones contra tu Neon: `npm run db:push` (usa el schema directo, sin generar SQL — más rápido para desarrollo. Para producción preferí `npm run db:generate` + `npm run db:migrate`, que sí versiona el SQL en `/drizzle`).
4. `npm run dev`

**Ojo:** el `DATABASE_URL` de `.env.local` y el que está cargado en Netlify (producción) apuntan al **mismo** proyecto Neon — no hay base separada de desarrollo. Cualquier dato que se crea corriendo `npm run dev` local queda en la base real. Tenerlo presente al probar features que escriben datos (usar cuentas/datos de prueba identificables y borrarlos después).

**`npm run db:migrate` no funciona en este entorno** (agente en sandbox): usa el driver `pg` de `drizzle-kit`, que conecta por TCP directo (puerto 5432) y ese puerto no tiene salida acá — solo sale HTTPS. Se cuelga sin error claro (exit 1 después de "applying migrations..." sin más detalle). Workaround usado: generar la migración igual con `npm run db:generate` (no toca la red) y después aplicar el SQL resultante a mano contra `DATABASE_URL` con `@neondatabase/serverless` (el mismo driver HTTP que usa la app en runtime), vía un script de una sola vez. Si esto corre en una terminal normal del usuario (no en el agente), `npm run db:migrate` debería andar sin problema.

## Deploy a Netlify

1. Conectar el repo a Netlify (o `netlify deploy` con la CLI).
2. Configurar las mismas variables de entorno del paso 2 de arriba en el panel de Netlify (Site settings → Environment variables), con `APP_URL` apuntando al dominio real (`https://presuly.com.ar`).
3. El `netlify.toml` ya declara el plugin `@netlify/plugin-nextjs`, que Netlify detecta automáticamente.
4. Correr las migraciones contra la base de producción una vez (`DATABASE_URL` de prod + `npm run db:migrate`) antes del primer deploy.
5. Variables de Paddle (Fase 2): `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_ENV`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_PRO_MONTHLY`, `PADDLE_PRICE_PRO_ANNUAL` — ver `.env.example` para dónde sacar cada uno. Con solo la `PADDLE_API_KEY` ya se puede crear el producto y los precios por API (`paddle.products.create` / `paddle.prices.create`) y el webhook (`paddle.notificationSettings.create`, que devuelve el secret directo) sin tocar el dashboard.
6. **Dominios aprobados en Paddle**: el checkout de Paddle.js solo abre desde dominios aprobados manualmente (Checkout → Checkout Settings → Approved Domains) — esto no se puede hacer por API, es una pantalla del dashboard. `localhost` no siempre lo acepta; para probar el checkout localmente puede hacer falta un túnel (ngrok) o probar directo contra el dominio de producción ya aprobado.
7. **Nunca uses `request.nextUrl.origin` (ni `request.url`) para armar un redirect absoluto en un Route Handler.** En el entorno serverless de Netlify resuelve al hostname interno del deploy (`https://<deploy-id>--presuly.netlify.app`), no al dominio público que usó el visitante — un bug real de esta forma tumbó el login por magic link en producción (ver `docs/DECISIONS.md`, 2026-09-11: el redirect post-verificación mandaba a los usuarios a ese hostname interno, donde la cookie de sesión de `presuly.com.ar` no viaja, y rebotaban a `/login`). Usar siempre `process.env.APP_URL` como base, con `new URL(path, APP_URL)` en vez de interpolar un string a mano.
8. **Netlify le pega el query string del request original a cualquier redirect 3xx cuyo destino no tenga uno propio.** Confirmado a mano contra producción (mismo día que el bug de arriba): un redirect a `/dashboard` (sin query) terminaba en `/dashboard?token=...` con el token del request original colgando; un redirect a `/login?error=invalid_link` (con query propia) no se tocaba. Si un Route Handler redirige a un destino que puede no tener query propia, agregale una (`if (!url.search) url.search = "algo=1"`) para que Netlify no mezcle nada.

### Paddle Live — activo en producción (confirmado 2026-09-04)

Netlify tiene `NEXT_PUBLIC_PADDLE_ENV=production` con API key, client-side token y precios Live reales. El checkout de producción cobra con tarjetas de verdad.

**Cambiar un precio de Pro/Estudio en Live** (ya se hizo una vez, ver `DECISIONS.md`): crear el precio nuevo por API en vez de editar el existente (grandfathering — nadie que ya paga se entera):

```
POST https://api.paddle.com/prices
Authorization: Bearer <PADDLE_API_KEY live>
{ "product_id": "<el mismo de siempre>", "unit_price": { "amount": "<centavos>", "currency_code": "USD" },
  "billing_cycle": { "interval": "month"|"year", "frequency": 1 }, "tax_mode": "account_setting" }
```

Después actualizar `PADDLE_PRICE_PRO_MONTHLY`/`PADDLE_PRICE_PRO_ANNUAL` en Netlify (Site configuration → Environment variables, o por su API: `PUT /api/v1/accounts/{account}/env/{key}?site_id={id}`) y en `.env.local` los equivalentes de Sandbox (mismo endpoint pero `sandbox-api.paddle.com`, con la API key sandbox), y hacer un deploy nuevo para que tome el cambio.

**Local sigue en Sandbox a propósito** (localhost no está en Approved Domains de Live). Las credenciales Live quedan comentadas en `.env.local` bajo "Paddle LIVE" como referencia — no descomentar ahí, ya están cargadas en Netlify.

### Bloqueante conocido: "Unrecognized Git contributor" en Netlify

Los pushes automáticos (CI) desde este entorno quedan bloqueados con `Build blocked: Unrecognized Git contributor` — el plan de Netlify exige aprobar manualmente commits de contribuidores no reconocidos antes de buildearlos. No es algo resoluble por API (lo intenté, `updateSite` con `untrusted_flow` no tuvo efecto). Hay que entrar a **Site configuration → Build & deploy** (o la pestaña **Deploys** del sitio) y aprobar/reintentar el deploy bloqueado, o agregar el email del commit como colaborador de confianza del team.

## Límites de los servicios y aviso de cuota

Todo corre sobre planes gratis (Neon, Resend, Netlify) — el primero en quedarse corto con uso real va a ser **Resend** (100 emails/día en el free). Para no enterarse por una notificación transaccional que no llegó:

- Cada `sendEmail()` (`src/lib/email/resend.ts`) registra el envío en la tabla `email_sends` y dispara `checkEmailQuota()` (`src/lib/email/quota.ts`), en background, sin bloquear el envío real.
- Si en las últimas 24hs se llega a 80 emails (80% del límite de 100/día), le manda un aviso por mail a `ADMIN_EMAIL` — como mucho uno cada 20hs (guardado en la tabla `system_state`, clave `resend_daily_quota_alert`), para no saturar con avisos repetidos el mismo día en que ya se sabe.
- `email_sends` se poda solo (borra registros de más de 2 días) en cada chequeo — no crece sin límite.
- Esto NO cubre Neon (horas de cómputo del plan free) ni Netlify (invocaciones de funciones) — para esos dos conviene activar las alertas de uso propias de cada dashboard (Neon: Project settings → Billing; Netlify: Team settings → Usage), no hay forma de leerlas por API con lo que tenemos configurado hoy.

## Simplificaciones deliberadas de Fase 1 (no son bugs)

- **Límite de 3 presupuestos del plan gratis**: aplicado desde Fase 2 (`src/lib/plans.ts`). "Activo" = `draft`/`sent`/`viewed`; un presupuesto aceptado o vencido libera el cupo.
- **PDF sin storage**: se regenera al vuelo en cada descarga (`/api/p/[token]/pdf`), no se guarda ningún archivo. Evita necesitar un servicio de storage — alineado con costo cero — a costa de recomputar el render en cada request (barato, es una operación de milisegundos).
- **Tracking de apertura**: solo se registra "visto por primera vez" + contador total de vistas. El tracking granular por sección (cuánto tiempo en cada parte del presupuesto) es una feature de Fase 3, no de Fase 1.
- **Sesión sin tabla en base**: la cookie de sesión es un token firmado (HMAC) con expiración de 30 días, no hay tabla de sesiones. Más simple de operar, a cambio de que no hay forma de invalidar una sesión puntual desde el servidor (ej: "cerrar sesión en todos los dispositivos") sin rotar `AUTH_SECRET`, lo que invalidaría todas las sesiones activas de todos los usuarios.
- **Adjuntos de presupuestos**: hasta 5 archivos por presupuesto, 10MB cada uno, tipos permitidos: imágenes (jpg/png/webp/gif), PDF, Word, Excel y CSV (`src/lib/storage/attachments.ts`). Se guardan en Netlify Blobs (store `budget-attachments`), no en la base — `budgets.attachments` solo tiene la metadata (nombre, tamaño, clave del blob). La descarga (`/api/attachments/[key]`) es tan pública como el resto del link del presupuesto: la clave es un nanoid no adivinable, sin chequeo de auth adicional, mismo modelo de seguridad que ya usa toda la app. Disponible en todos los planes, no solo Pro.

## Reporte de operación (Fase 4)

**`GET /api/admin/report`** (`src/app/api/admin/report/route.ts`): JSON con usuarios
(total, nuevos últimos 7 días, suscriptos, breakdown por plan), presupuestos
(total, activos, aceptados, tasa de aceptación), MRR estimado, señales de churn
(usuarios `past_due`/`canceled` — es una foto de hoy, no una tasa: `users` no
tiene `updatedAt`), coeficiente viral `k` y uso del cupo diario de Resend.

Dos formas de acceso, para no depender de una sesión de navegador:
- **Token**: `Authorization: Bearer <ADMIN_REPORT_TOKEN>` — para que un agente o
  cron lo llame solo. Generar con `openssl rand -base64 32` y cargarlo en
  `ADMIN_REPORT_TOKEN` (local y Netlify). Si no está seteada, esta vía queda
  deshabilitada (no hay bypass).
- **Sesión**: si quien pide el reporte tiene una cookie de sesión válida con
  `email === ADMIN_EMAIL`, también entra — para abrirlo a mano desde el navegador.

**Falta todavía** (no implementado en esta pasada): errores de las últimas 24hs
y "5 anomalías más relevantes con severidad" — depende de tener Sentry
configurado, que no está en el proyecto todavía.

## Identidad de marca

`public/brand/` tiene el logo, isotipo, favicons e íconos oficiales; los tokens
de color/tipografía/radios están en `src/styles/presuly-tokens.css` (importado
desde `globals.css`, mapeado a las variables semánticas de shadcn — no hay
`tailwind.config.js`, Tailwind v4 es CSS-first). `docs/MARCA.md` tiene las
reglas de uso completas (aire mínimo, tamaños, qué no se hace). **No inventar
colores, logos ni tipografías nuevas** — está todo resuelto ahí.

## Qué NO hacer sin autorización humana

- No tocar precios del plan gratis/Pro/Estudio sin decisión del usuario.
- No mandar emails masivos fuera del flujo transaccional (notificación de visto, notificación de aceptación).
- No borrar datos de usuarios o presupuestos salvo pedido explícito de borrado de cuenta.
- No responder reclamos legales o pedidos de reembolso — escalar al usuario.
- No cambiar la identidad de marca (logo, colores, tipografía) sin pedido explícito — ver `docs/MARCA.md`.
- No agregar un chatbot de IA, CRM, facturación ni gestión de proyectos "porque queda bien" — no es la tesis del producto (ver `docs/PLAN.md`).
- No generar contenido SEO automatizado en masa (la galería de `/templates` son plantillas reales, no relleno).
- No sacar la verificación de `email_verified` del login por Google sin pensarlo bien — es lo único que evita que cualquiera entre con un email que no controla.
