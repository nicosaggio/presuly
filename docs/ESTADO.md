# ESTADO.md — Punto de retomada

> Actualizado el 2026-09-04, al cierre de la sesión que aplicó identidad de marca
> y avanzó Fase 4. Leer junto con `PLAN.md`, `DECISIONS.md` y `RUNBOOK.md`.

## Dónde estamos

Rama `master`, remoto `github.com/nicosaggio/presuly`. Local en
`C:\Users\aipsa\Documents\WEB-IA`, deployado en producción (`presuly.com.ar`,
Netlify) y funcionando.

**Fase 1, 2 y 3 (parte 1) — cerradas y validadas end-to-end.** Ver sesiones
anteriores / `DECISIONS.md` para el detalle.

**Fase 4 (parte 1) — implementada en esta sesión.**
- Rate limiting del magic link reforzado: server-side por email (5/hora) y por
  IP (15/hora), además del cooldown de 30s por cookie. Tabla nueva
  `magic_link_requests`, migración `drizzle/0007_striped_vargas.sql` ya
  aplicada en producción.
- `GET /api/admin/report`: reporte de operación en JSON (usuarios, presupuestos,
  MRR, churn, `k` viral, cupo de Resend). Protegido por `ADMIN_REPORT_TOKEN`
  (bearer) o por sesión de `ADMIN_EMAIL`. Ver `docs/RUNBOOK.md`.

**Identidad de marca — aplicada en esta sesión.** El usuario pasó el paquete
`marca/` (logo, isotipo, favicons, paleta, Poppins) que hasta ahora no estaba
cableado — la app corría con el tema gris por defecto de shadcn. Ahora: colores
y tipografía de marca en toda la UI, logo en los headers y en el pie de la
vista pública, favicons reales, PDF y OpenGraph con la paleta y el logo.
Verificado visualmente (landing, login, pricing, vista pública, PDF) y con
`npm run build` limpio. Manual completo en `docs/MARCA.md` — no inventar
variantes sin consultarlo.

## Qué sigue

1. **Paddle: pasar de Sandbox a Live.** Sigue pendiente de sesiones anteriores.
   El catálogo, precios y webhook de Live ya están creados por API. Faltan 5
   pasos del checklist en `RUNBOOK.md` → "Pasar Paddle de Sandbox a Live". Dos
   los tiene que hacer el usuario a mano (token client-side Live, verificación
   bancaria).

2. **Fase 4 (resto): jobs programados y alertas.** Recordatorios de presupuesto
   sin respuesta, vencimiento automático, reporte diario que se manda solo
   (hoy `GET /api/admin/report` hay que pedirlo, no llega proactivamente),
   backup de la base. Errores/anomalías del reporte quedan pendientes de que
   se configure Sentry (no está en el proyecto todavía).

3. **Netlify:** verificar si el bloqueo `Build blocked: Unrecognized Git
   contributor` de sesiones anteriores sigue activo para los próximos pushes —
   el usuario mencionó que el deploy actual ya está andando, pero eso no
   confirma que un push nuevo no vuelva a toparse con el mismo bloqueo (que
   solo se resuelve a mano en el panel de Netlify, no por API).

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

## Restricciones de producto que no se negocian sin hablarlo

- **El dinero entre emisor y receptor nunca pasa por Presuly.** Se usa un campo
  `paymentLink` que completa el propio emisor.
- **Netlify, no Vercel**: el plan Hobby de Vercel prohíbe uso comercial por contrato.
- **Neon, no Supabase**: Supabase pausa los proyectos gratis tras 7 días sin requests.
- **No inventar colores, logos ni tipografías** — está todo resuelto en `docs/MARCA.md`.
- No tocar precios, no mandar emails fuera del flujo transaccional, no borrar
  datos de usuarios, no responder reclamos legales ni pedidos de reembolso sin
  el usuario.
