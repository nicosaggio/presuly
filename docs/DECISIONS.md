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

## 2026-09-04 — Precio de Pro bajado a USD 5/mes y USD 45/año

Feedback de un grupo de testers cercanos comparó Presuly con Odoo (que ofrece presupuestos dentro de un ERP completo por USD 7). El usuario decidió bajar el precio de Pro de USD 9/mes y 75/año (fijado el mismo día, ver entrada anterior) a **USD 5/mes y USD 45/año**. Igual que en el cambio anterior, se crearon precios nuevos en Paddle (Live y Sandbox) en vez de modificar los existentes — grandfathering para cuando haya suscriptores reales. `PLAN_PRICES` en `src/lib/plans.ts`, `PADDLE_PRICE_PRO_MONTHLY`/`PADDLE_PRICE_PRO_ANNUAL` (Netlify producción y `.env.local`) y las menciones de precio hardcodeadas en `src/lib/i18n/{es,en}.ts` y `src/app/pricing/page.tsx` actualizadas.

**Nota:** en esta sesión se confirmó que Paddle Live ya está activo en producción (Netlify tiene `NEXT_PUBLIC_PADDLE_ENV=production` con API key y precios Live reales) — `docs/ESTADO.md` de la sesión anterior todavía lo listaba como pendiente. Parece haberse activado fuera de una sesión de agente; queda corregido en el próximo `ESTADO.md`.

## 2026-09-04 — Botones e inputs más grandes (feedback de testers)

Feedback del mismo grupo: los inputs y botones del login y de las tarjetas de precios se veían "pequeñitos", con poco padding. Se subieron las alturas y el padding horizontal en los componentes base compartidos (`src/components/ui/{button,input,select,textarea}.tsx`) — no en instancias sueltas — para que el ajuste alcance a toda la app de una vez: botón `default` de `h-8` a `h-10`, `sm` de `h-7` a `h-9`, `lg` de `h-9` a `h-12` (con `text-base`); inputs y el trigger de `Select` de `h-8` a `h-11`. El botón grande de la landing (que se había agrandado a mano un rato antes) quedó cubierto por el nuevo tamaño `lg` y se le sacó el override.

## 2026-09-05 — Biblioteca de ítems reutilizables por cuenta

El usuario pidió poder reusar en un presupuesto nuevo los ítems que ya cargó antes, sin que precios viejos generen confusión. Se agregó la tabla `saved_items` (`user_id`, `description`, `price`, `currency`, `updated_at`), con un índice único en `(user_id, description)`: cada vez que se guarda o publica un presupuesto (`createBudget`/`updateBudget`), sus ítems se hacen upsert ahí — la misma descripción nunca se duplica, siempre queda con el precio y la moneda del uso más reciente (`saveItemsForUser` en `src/lib/db/queries.ts`). En el editor, un botón "Usar ítem guardado" (dropdown, hasta 50 ítems más recientes) agrega el ítem elegido como una línea nueva editable — si reemplaza la línea vacía inicial en vez de sumarla, para no dejar un renglón de más. El precio siempre se puede cambiar ahí mismo antes de guardar, como pidió el usuario explícitamente.

No se filtra ni convierte por moneda: si el mismo ítem se usó antes en otra moneda, el dropdown lo muestra con esa moneda (ej. "US$ 550,00") para que quede claro que puede no corresponder a la moneda del presupuesto actual.

## 2026-09-11 — SEO off-page: Search Console, Bing, y primer blog

Arranque del trabajo de SEO off-page (lo técnico on-page ya estaba, ver entrada del 2026-09-04): sitio verificado en Google Search Console (meta tag en `src/app/layout.tsx`, `verification.google`) y en Bing Webmaster Tools (importado desde Search Console). Sitemap enviado y páginas clave con indexación solicitada a mano.

**Blog nuevo** (`src/app/blog`, contenido en `src/lib/blog/posts.ts`): 3 artículos en español apuntados a búsquedas reales ("cómo hacer un presupuesto profesional", "plantilla de presupuesto", "cuánto tarda un cliente en aceptar un presupuesto"), no relleno genérico — cada uno linkea a `/templates` o `/pricing` según corresponda. Solo en español por ahora: escribir y traducir contenido real lleva tiempo, y el hispanohablante es el mercado desatendido que define la tesis (ver `docs/PLAN.md`). Con `BlogPosting` + `BreadcrumbList` en JSON-LD, canonical, y listado en `sitemap.ts`.

**Ojo al escribir contenido de marketing:** el primer borrador de dos artículos vendía "tildar ítems opcionales" como feature de Presuly — pero esa opción se sacó del editor el 2026-09-05 (ver esa entrada). Quedó corregido antes de publicar. Vale la pena releer `DECISIONS.md` antes de escribir copy nuevo, para no prometer algo que el producto ya no hace.

## 2026-09-11 — Borrar presupuestos desde "Mis presupuestos"

Faltaba: no había forma de eliminar un presupuesto ya creado, el usuario lo notó al revisar el dashboard. Se agregó `deleteBudget(id)` en `src/lib/actions/budgets.ts` (verifica ownership, borra los adjuntos en Netlify Blobs uno por uno, borra la fila — la aceptación, si la hay, se borra en cascada por la FK) y un ícono de basura por fila en `BudgetsTable`, con un diálogo de confirmación (irreversible, se avisa que el link del cliente deja de funcionar). Sin restricción por estado: se puede borrar un presupuesto en cualquier estado, incluido uno ya aceptado — es el dueño de la cuenta borrando su propio dato, no algo que decida la app por él.

## 2026-09-11 — Bug crítico: el login por magic link rebotaba a /login en producción

Una amiga del usuario probó registrarse, hizo clic en el link mágico de su email, y volvió a caer en la pantalla de "poné tu email" — el login nunca se completaba. Diagnosticado con un token armado a mano contra `https://presuly.com.ar/api/auth/verify`: el `Location` del redirect final apuntaba a `https://<deploy-id>--presuly.netlify.app/dashboard?token=...` — el hostname interno del deploy de Netlify, no `presuly.com.ar`, y encima con el token colgando como query string. Como es otro dominio, la cookie de sesión (que sí había quedado bien puesta en `presuly.com.ar`) no viajaba ahí, y el dashboard redirigía a `/login` sin sesión.

Causa: `src/app/api/auth/verify/route.ts` armaba el redirect con `request.nextUrl.origin`, que en el entorno serverless de Netlify resuelve al hostname interno del deploy, no al dominio público que usó el visitante. **Ningún otro archivo del repo usaba ese patrón** (se confirmó por grep) — no es un problema generalizado, estaba aislado a este endpoint.

Este bug estuvo presente probablemente desde que se armó el login (Fase 1) y nunca se detectó antes porque ninguna sesión de trabajo probó el flujo completo con un click real desde un email real — todo el testeo de este proyecto usó cookies de sesión firmadas a mano o sesiones ya existentes, nunca el circuito completo "pedir link → recibirlo → clickearlo". **Lección para el RUNBOOK**: antes de dar por buena una feature de auth, probarla con un flujo real de punta a punta al menos una vez, no solo con atajos de testing.

Arreglado usando `APP_URL` (la env var ya pensada para esto, ver `.env.local`) como fuente de verdad del dominio en los tres redirects de ese archivo, con `new URL(path, APP_URL)` en vez de interpolar un string — así tampoco puede colarse un query string residual. Verificado con un token real contra producción antes y después del fix.
