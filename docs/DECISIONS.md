# DECISIONS.md — Bitácora de decisiones

## 2026-09-03 — Dominio: presuly.com.ar
El usuario compró `presuly.com.ar` (en vez de `presuly.com`, que había quedado como recomendación de Fase 0).
**Por qué importa:** un ccTLD `.com.ar` puede leerse como "solo Argentina" para clientes en México/España/Colombia/Chile, lo que roza la meta de mercado regional bilingüe del plan.
**Decisión:** seguir adelante sin bloquear. No afecta nada técnico (Resend, Netlify, Paddle funcionan igual con cualquier TLD). Si la percepción de "solo AR" se vuelve un problema real más adelante, comprar `presuly.com` como alias/redirect es una opción barata y no requiere cambios de código.
