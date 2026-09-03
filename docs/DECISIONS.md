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
