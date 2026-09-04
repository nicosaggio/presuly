# DECISIONS.md — Bitácora de decisiones

## 2026-09-03 — Dominio: presuly.com.ar
El usuario compró `presuly.com.ar` (en vez de `presuly.com`, que había quedado como recomendación de Fase 0).
**Por qué importa:** un ccTLD `.com.ar` puede leerse como "solo Argentina" para clientes en México/España/Colombia/Chile, lo que roza la meta de mercado regional bilingüe del plan.
**Decisión:** seguir adelante sin bloquear. No afecta nada técnico (Resend, Netlify, Paddle funcionan igual con cualquier TLD). Si la percepción de "solo AR" se vuelve un problema real más adelante, comprar `presuly.com` como alias/redirect es una opción barata y no requiere cambios de código.

## 2026-09-03 — Link de pago externo, no integración de cobro
El usuario pidió integrar Mercado Pago (y una opción para USD) para que el cliente pague desde el presupuesto.
**Por qué importa:** el plan de Fase 0 fija como restricción no negociable "sin custodia de dinero de terceros — el pago entre emisor y receptor no pasa por el producto". Una integración de cobro real (split payment) obliga a Presuly a ser marketplace de pagos: KYC de cada usuario, contracargos, disputas — exactamente la carga operativa que la tesis "lo opera una IA sola" busca evitar.
**Decisión:** se implementó un campo `paymentLink` (URL) que el propio emisor completa con su link de cobro (Mercado Pago si el presupuesto es en ARS, Stripe/PayPal si es en otra moneda). La vista pública muestra un botón "Pagar" que abre ese link en una pestaña nueva. Presuly nunca ve ni toca esa plata. Confirmado con el usuario antes de implementar.
**Moneda por defecto:** se cambió de USD a ARS a pedido del usuario (el selector de moneda sigue permitiendo USD y otras).

## 2026-09-03 — Definición de "presupuesto activo" para el límite del plan gratis
El plan gratis limita a 3 presupuestos activos, pero "activo" era ambiguo: ¿cuenta un presupuesto ya aceptado para siempre?
**Decisión:** "activo" = estado `draft`, `sent` o `viewed`. Un presupuesto `accepted` o `expired` libera el cupo. Razón: penalizar a un freelancer por sus presupuestos ya cerrados (aceptados) sería un castigo raro al éxito, no al uso de recursos — el cupo tiene sentido como límite de "trabajo en curso", no de historial.

## 2026-09-03 — Paddle Billing (no Classic) y customData para asociar usuario↔suscripción
Se integró `@paddle/paddle-node-sdk` + `@paddle/paddle-js` (Paddle Billing, la API vigente). El checkout pasa `customData: { userId }` al abrir Paddle.Checkout; el webhook usa ese dato para el evento `subscription.created` (primera vez que sabemos qué usuario es), y para eventos posteriores busca por `paddleSubscriptionId` ya guardado — más robusto si Paddle no reenvía `customData` en updates/cancelaciones.

## 2026-09-04 — Fase 2 cerrada: checkout de Paddle validado de punta a punta
Pago de prueba real completado en producción (presuly.com.ar, cuenta Paddle sandbox): checkout abrió con precio/usuario correctos, el webhook `subscription.created` activó el plan Pro automáticamente (sin intervención manual) y quedó guardado `paddle_customer_id`/`paddle_subscription_id`/`plan_renews_at` en la base. Dos configuraciones de cuenta de Paddle que no son API-configurables y hubo que setear a mano en el dashboard: **Approved Domains** (localhost no siempre es aceptado; hubo que aprobar `presuly.netlify.app`/`presuly.com.ar`) y **Default payment link** (sin esto, el checkout falla con `transaction_default_checkout_url_not_set`). Quedan documentadas en RUNBOOK.md para cuando se pase a producción real.

## 2026-09-04 — Precio de Pro bajado a USD 9/mes y USD 75/año
El usuario pidió bajar el precio de Fase 0 (USD 12/mes, USD 108/año) a **USD 9/mes y USD 75/año**. Se crearon precios nuevos en Paddle en vez de modificar los existentes (todavía en Sandbox, sin clientes reales pagando, pero es la práctica correcta igual: así el día que haya suscriptores reales, un cambio de precio no les modifica lo que ya están pagando — grandfathering, tal como preveía la Sección 4.3 del plan original). `PLAN_PRICES` en `src/lib/plans.ts` y las variables `PADDLE_PRICE_PRO_MONTHLY`/`PADDLE_PRICE_PRO_ANNUAL` actualizadas.

## 2026-09-04 — Fase 3 (parte 1): atribución, referidos, plantillas, OpenGraph
Implementado: cookie de atribución de 30 días (primer touch gana) que distingue `shared_link` (footer de presupuesto), `referral` (link con `?ref=`) y `template_gallery`; sistema de referidos con recompensa de dos lados (1 mes de Pro c/u) que se otorga cuando el referido publica su primer presupuesto, no en el registro (para evitar premiar cuentas que nunca llegan a usar el producto); galería pública de 6 plantillas por rubro en `/templates` (indexable, a diferencia de `/p/[token]`); imágenes OpenGraph dinámicas para presupuestos y landing con `next/og`.

**Definición de "usuarios activos" para k**: usuarios que publicaron al menos un presupuesto (no solo se registraron). Es una definición defendible pero no la única posible — documentada en `src/lib/metrics.ts` por si se quiere ajustar.

**`/dashboard/metrics`**: gateado por `ADMIN_EMAIL` (chequeo simple por ahora, no hay sistema de roles). Es el "dashboard" que pide el criterio de cierre de Fase 3, no el reporte completo de operación (`GET /api/admin/report`), que es de Fase 4.

## 2026-09-04 — Fase 4: rate limiting reforzado y endpoint de reporte

**Rate limiting del magic link**: el cooldown de 30s por cookie (Fase 1) es fácil de esquivar (incógnito, borrar cookies, otro navegador). Se agregó un límite server-side en `src/lib/auth/rate-limit.ts`, guardado en la tabla nueva `magic_link_requests`: 5 pedidos por email por hora, 15 por IP por hora. Los dos límites conviven — la cookie evita el viaje a la base en el caso normal (un usuario pidiendo su propio link), el server-side es el que realmente importa contra abuso distribuido.

**`GET /api/admin/report`**: implementado con dos formas de acceso — token (`Authorization: Bearer <ADMIN_REPORT_TOKEN>`, para que un agente/cron lo llame sin sesión) o la sesión de `ADMIN_EMAIL` (para abrirlo a mano). Devuelve usuarios, presupuestos, MRR estimado, churn (`past_due`/`canceled`, conteo actual — no hay forma de medir una tasa en el tiempo con el schema de hoy: `users` no tiene `updatedAt` y Paddle manda `nextBilledAt: null` al cancelar), `k` viral y uso del cupo de Resend. Errores/anomalías de Sentry quedan pendientes porque Sentry todavía no está configurado en el proyecto.

## 2026-09-04 — Identidad de marca aplicada (Poppins, verde `#0C6E63`, logo)

El usuario pasó un paquete (`marca/`) con el logo definitivo (isotipo P+check), paleta de colores y tipografía (Poppins) que hasta ahora no estaban cableados — la app corría con el tema gris por defecto de shadcn y sin favicon propio. Se copiaron los archivos a `public/brand/` (+ `favicon.ico`, `apple-touch-icon-180.png` y `presuly-favicon.svg` en la raíz de `public/`), se importaron los tokens (`src/styles/presuly-tokens.css`) en `globals.css` mapeándolos a las variables semánticas de shadcn (`--primary`, `--background`, etc. — no hay `tailwind.config.js`, Tailwind v4 es CSS-first), se cambió la fuente de Geist a Poppins en `layout.tsx`, y se agregó el logo (`src/components/logo.tsx`) al header del dashboard, la landing, el login y el pie de la vista pública del presupuesto (el isotipo de 16px que pide `docs/MARCA.md`). Los colores de estado del presupuesto (`BudgetStatusBadge`) pasaron a usar los hex exactos de la marca en vez de los variants genéricos de shadcn. El PDF (`budget-pdf.tsx`) y las imágenes OpenGraph también se actualizaron para usar la paleta y el logo a una tinta.

El manual completo de marca queda en `docs/MARCA.md` — no rediseñar ni inventar variantes sin consultarlo primero.
