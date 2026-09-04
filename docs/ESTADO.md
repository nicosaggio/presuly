# ESTADO.md — Punto de retomada

> Actualizado el 2026-09-04, tras una sesión de identidad de marca + Fase 4 +
> ajustes de UI y precio a partir de feedback de testers. Leer junto con
> `PLAN.md`, `DECISIONS.md` y `RUNBOOK.md`.

## Dónde estamos

Rama `master`, remoto `github.com/nicosaggio/presuly`. Local en
`C:\Users\aipsa\Documents\WEB-IA`, deployado en producción (`presuly.com.ar`,
Netlify) y funcionando.

**Paddle Live: confirmado activo en producción.** Netlify tiene
`NEXT_PUBLIC_PADDLE_ENV=production` con API key y precios Live reales — no es
Sandbox. El `ESTADO.md` de la sesión anterior todavía lo listaba como
pendiente ("faltan 5 pasos"); se ve que se activó fuera de una sesión de
agente. Dar por hecha la Fase de "pasar a Live".

**Fase 1, 2, 3 (parte 1) y 4 (parte 1) — cerradas.** Rate limiting reforzado
del magic link (server-side por email/IP) y `GET /api/admin/report` ya están.
Ver `DECISIONS.md` para el detalle de cada una.

**Identidad de marca — aplicada.** Logo, isotipo, paleta verde `#0C6E63` y
Poppins cableados en toda la app (antes corría con el tema gris de shadcn).
Manual completo en `docs/MARCA.md`.

**Precio de Pro: USD 5/mes y USD 45/año** (bajado de USD 9/75 el mismo día,
por feedback de testers comparando con Odoo). Precios nuevos creados en Paddle
Live y Sandbox — no se tocaron los viejos (grandfathering).

**Componentes de UI más grandes.** Botones e inputs base (`src/components/ui/`)
tenían alturas muy chicas (`h-7`/`h-8`) para el gusto de los testers. Subidos
a `h-9`–`h-12` según tamaño, con más padding horizontal.

**Bug de UX corregido:** una vez logueado no había forma de llegar a
`/templates` desde el dashboard. Se agregó el link "Plantillas" al header.

**Bug visual corregido:** el logotipo (texto "Presuly" en tinta casi negra,
fijo en el SVG) era invisible en modo oscuro. `Logo`/`LogoMark` ahora tienen
`variant="auto"`: muestran la versión blanca automáticamente vía
`prefers-color-scheme`, sin JS.

**Feature sacada a pedido del usuario:** el checkbox "opcional" en los ítems
del presupuesto. Ya no se puede crear un ítem opcional nuevo (ni a mano ni
desde una plantilla). Los presupuestos ya publicados con ítems opcionales
(dato viejo en producción) siguen funcionando igual — no se tocó el schema.

## Qué sigue

1. **Fase 4 (resto): jobs programados y alertas.** Recordatorios de presupuesto
   sin respuesta, vencimiento automático, reporte diario que se manda solo
   (hoy `GET /api/admin/report` hay que pedirlo, no llega proactivamente),
   backup de la base. Errores/anomalías del reporte quedan pendientes de que
   se configure Sentry (no está en el proyecto todavía).

2. **Sin resolver — pide aclaración al usuario:** un tester (ex-administrativa)
   sugirió que al publicar un presupuesto, el envío debería hacerse "por mail
   sólo con una plantilla". No quedó claro qué flujo exacto proponía (¿reemplazar
   el link compartible por un envío de email obligatorio? ¿un asunto/cuerpo de
   email prearmado además del link?) — no se implementó nada todavía.

3. **Verificar el bloqueo de Netlify** (`Build blocked: Unrecognized Git
   contributor`) sigue sin dar señales en los últimos pushes de esta sesión —
   parece resuelto, pero no está confirmado que no vuelva a aparecer.

## Trampas que ya nos mordieron

- **La base de Neon de desarrollo y la de producción son la misma.** `npm run dev`
  en local escribe datos reales. Usar datos de prueba identificables
  (`@presuly.test` funcionó bien: no dispara emails reales) y borrarlos después
  con un script de una sola vez.
- **`npm run db:migrate` falla en entornos de agente en sandbox**: conecta por
  TCP al 5432 y acá solo sale HTTPS. Workaround: `npm run db:generate` (no toca
  la red) + aplicar el SQL a mano con `@neondatabase/serverless` vía
  `sql.query(...)` (no `sql(...)` a secas — esa forma solo acepta template
  tags). La tabla `drizzle.__drizzle_migrations` quedó vacía desde el principio
  (todas las migraciones se aplicaron así, nunca con `drizzle-kit migrate`
  real) — si el usuario corre `npm run db:migrate` en su terminal normal
  alguna vez, va a intentar reaplicar todo desde 0001 y va a fallar con
  "relation already exists". No es nuevo de esta sesión, ya estaba así.
- **`@react-pdf/renderer` no corre bien con `tsx` standalone** (choca con la
  resolución de exports de `@react-pdf/hyphenate`). Para probar el PDF fuera
  del browser hay que pegarle por HTTP a `/api/p/[token]/pdf` con el dev server
  corriendo, no importar `renderBudgetPdf` en un script suelto.
- **El `<Image>` de `@react-pdf/renderer` no acepta un path de archivo local
  como string** — intenta hacer `fetch()` y falla silenciosamente (el PDF se
  genera igual, sin la imagen). Hay que leer el archivo con `readFileSync` y
  pasar el `Buffer` directo a `src`.
- **El checkout de Paddle solo abre desde Approved Domains**, que se cargan a
  mano en el dashboard, no por API. `localhost` no siempre es aceptado. Y sin
  un *Default payment link* configurado, el checkout falla con
  `transaction_default_checkout_url_not_set`.
- **Cambiar precios de Paddle por API**: se puede crear un precio nuevo con
  `POST /prices` (Live: `api.paddle.com`, Sandbox: `sandbox-api.paddle.com`)
  pasando el mismo `product_id` que un precio existente — no hace falta el
  dashboard. Después hay que actualizar el env var del lado de la app
  (`PADDLE_PRICE_PRO_MONTHLY`/`ANNUAL`, en Netlify vía su API de env vars y en
  `.env.local`) y esperar el próximo deploy.

## Restricciones de producto que no se negocian sin hablarlo

- **El dinero entre emisor y receptor nunca pasa por Presuly.** Se usa un campo
  `paymentLink` que completa el propio emisor.
- **Netlify, no Vercel**: el plan Hobby de Vercel prohíbe uso comercial por contrato.
- **Neon, no Supabase**: Supabase pausa los proyectos gratis tras 7 días sin requests.
- **No inventar colores, logos ni tipografías** — está todo resuelto en `docs/MARCA.md`.
- No tocar precios (salvo pedido explícito, como el de esta sesión), no mandar
  emails fuera del flujo transaccional, no borrar datos de usuarios, no
  responder reclamos legales ni pedidos de reembolso sin el usuario.
