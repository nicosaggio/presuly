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
