# Estructura de Tráfico Pago (Bono)

Guía para estructurar las campañas pagas que alimentan el embudo de inscripción del workshop. Enfocada en Meta Ads (Instagram/Facebook), ya que es el canal más común para este tipo de embudo — los principios se aplican a otras plataformas con algunos ajustes.

## 1. Estructura de las campañas

**Estructura de cuenta recomendada** (CBO — Campaign Budget Optimization):

```
Campaña: [Oferta] — Adquisición de Leads
├── Conjunto 1: Frío — Intereses amplios
├── Conjunto 2: Frío — Lookalike 1% (compradores, si ya existe base)
├── Conjunto 3: Frío — Lookalike 1% (leads/inscritos, si ya existe base)
└── Conjunto 4: Frío — Advantage+ Audience (deja que Meta optimice sin restricción de interés)

Campaña: [Oferta] — Remarketing (embudo caliente)
├── Conjunto 1: Visitó la página de inscripción, no se inscribió (7 días)
├── Conjunto 2: Se inscribió, no vio (3 días)
├── Conjunto 3: Vio, no compró (7 días)
└── Conjunto 4: Inició checkout, no compró (3 días) — mayor prioridad de presupuesto
```

- **Objetivo de campaña**: Leads (optimizado para el evento de conversión "Lead"/inscripción) para la campaña fría; Ventas (optimizado para el evento "Purchase") para el remarketing, siempre que haya suficiente volumen de datos (a partir de ~50 conversiones/semana el algoritmo optimiza mejor por resultado final que por lead).
- **Presupuesto inicial**: empieza con un presupuesto diario fijo por conjunto de anuncios (no CBO) hasta tener datos de qué público rinde mejor; migra a CBO/Advantage+ después de identificar los 2-3 mejores públicos.
- **Prueba**: nunca pongas más de 1 variable nueva por conjunto de prueba (prueba público o prueba creativo, no ambos a la vez) — de lo contrario no podrás saber qué fue lo que funcionó.

## 2. Configuración de públicos y remarketing

**Públicos fríos** (quienes nunca han oído hablar de ti):
- Intereses relacionados con el problema que el workshop resuelve (no con tu nicho — piensa en "qué busca esta persona en Google cuando tiene este problema", no en "a quién le interesa el marketing digital").
- Lookalikes de 1% construidos a partir de: compradores > inscritos que vieron >75% > todos los inscritos, en ese orden de prioridad si tienes más de una base.
- Advantage+ Audience como conjunto separado siempre — suele superar a los intereses manuales después de ~1-2 semanas de aprendizaje.

**Públicos de remarketing** (el segmento que generalmente más convierte, a un costo real menor):
- Pixel/Conversions API disparando estos eventos a lo largo del embudo (ver sección 4): `PageView` (página de inscripción), `Lead` (inscripción confirmada), `ViewContent` (vio al menos 50% del workshop), `InitiateCheckout` (llegó a la página de oferta/checkout), `Purchase` (compró).
- Ventanas de remarketing cortas (3-7 días) — quien no convirtió en una semana de un embudo de webinar generalmente no va a convertir por un recordatorio, solo por una nueva oferta/gatillo.
- **Exclusión obligatoria**: excluir a los compradores de TODAS las campañas activas (frías y de remarketing) — evita desperdiciar presupuesto mostrando anuncios a quien ya compró.
- **Secuencia de mensajes en el remarketing**: quien no se inscribió → refuerza la promesa/prueba social; quien se inscribió y no vio → recordatorio + FOMO del contenido; quien vio y no compró → objeción específica + prueba de resultados + urgencia de plazo.

## 3. Estrategia de creativos

- **Formato**: el video nativo (grabado con celular, no producción de estudio) tiende a convertir mejor para ofertas de infoproducto/workshop — parece contenido, no un anuncio.
- **Gancho en los primeros 3 segundos**: sin un gancho visual/verbal fuerte al inicio, el resto del creativo no importa. Prueba ganchos como: una pregunta directa sobre el dolor, una afirmación contraintuitiva, o un resultado mostrado primero ("antes/después").
- **Ángulos de creativo a probar** (corre al menos 3-4 ángulos diferentes a la vez, no solo 1):
  1. Prueba social/resultado de un alumno.
  2. Autoridad/detrás de escena de cómo descubriste el método.
  3. Romper un mito ("por qué [solución común] no funciona").
  4. Invitación directa y simple al workshop gratuito (baja fricción, funciona bien para público frío de intereses amplios).
- **Copy del anuncio**: la primera línea tiene que funcionar sola (es lo que aparece antes de "ver más") — repite ahí el gancho del video, no introduzcas información nueva.
- **Cadencia de renovación**: monitorea la frecuencia (Ads Manager) — por encima de 3-4 suele indicar fatiga de creativo para el público frío; renueva el creativo, no solo el público.

## 4. Seguimiento y optimización para generación de leads y ventas

**Métricas por etapa del embudo** (haz seguimiento en este orden, de arriba hacia abajo — el cuello de botella generalmente está en la primera etapa con un número malo):

| Etapa | Métrica | Referencia inicial* |
|---|---|---|
| Anuncio → Clic | CTR (link click-through rate) | por encima de 1% ya es saludable para video |
| Clic → Inscripción | Tasa de conversión de la página de inscripción | 30-50% es una buena página |
| Inscripción → Vio | Tasa de asistencia (en vivo/replay) | 20-40% es común en evergreen |
| Vio → Llegó a la oferta | Retención hasta el pitch | por encima de 50% de quienes vieron >10min |
| Oferta → Compra | Tasa de conversión del checkout | 1-3% del total de inscritos es un rango común de mercado |

*Estos números varían MUCHO según el nicho/precio/oferta — trátalos como un punto de partida para saber dónde investigar, no como una meta fija.

**Rutina de optimización**:
- **Diaria** (primeros 7-14 días de una campaña nueva): CPL (costo por lead) por conjunto de anuncios, pausar lo que esté 2x o más por encima del promedio de los demás conjuntos.
- **Semanal**: CAC (costo de adquisición de cliente = gasto total ÷ ventas) vs. el precio de la oferta — si el CAC > 30-40% del ticket, revisar público/creativo antes de escalar el presupuesto.
- **Al escalar**: aumenta el presupuesto en incrementos de 20-30% cada 2-3 días (no lo dupliques de una vez) — esto evita reiniciar el aprendizaje del algoritmo.
- **Tracking necesario del lado del producto** (ver `docs/estrategia/`, no es responsabilidad exclusiva del gestor de tráfico): Pixel + Conversions API (server-side) disparando los 5 eventos de la sección 2 desde las páginas del embudo y desde el webhook de pago confirmado — sin esto, la optimización del algoritmo de anuncios queda ciega ante lo que realmente importa (ventas), no solo los clics.

---

*Este documento asume Meta Ads como canal principal. Para Google Ads/TikTok Ads, la lógica del embudo (frío → remarketing → exclusión de compradores) se mantiene, pero los formatos de público/creativo cambian — pide una versión adaptada cuando vayas a expandirte a otro canal.*
