# Embudo de Ventas Completo

Guía/plantilla para estructurar cada página del embudo, desde el primer clic hasta la compra. Completa cada sección con la copy real antes de armar las páginas — esto se convierte en el brief final de contenido y diseño.

Este embudo asume un formato de workshop evergreen (ver `estrutura-do-workshop.md`): el lead se inscribe, lo ve (en vivo o grabado) y recibe la oferta al final. Todas las páginas a continuación conforman ese recorrido.

## 1. Página de inscripción

**Objetivo único**: convertir tráfico pago/orgánico en inscripción (nombre + correo + WhatsApp). Nada más que eso — sin menú de navegación, sin enlaces de salida, sin distracciones.

**Estructura recomendada**:

| Bloque | Contenido |
|---|---|
| Headline | La promesa central del workshop, en forma de resultado específico ("Cómo [resultado] en [plazo/condición], aunque [objeción común]") |
| Subheadline | Refuerza para quién es / qué va a aprender, en 1 frase |
| Fecha/formato | Si es en vivo: fecha y hora reales. Si es evergreen (bajo demanda): "Ver ahora" o un selector de horario simulado — nunca mentir diciendo que es en vivo si no lo es |
| Formulario | Nombre + correo + WhatsApp (con código de país). Cada campo adicional reduce la conversión — pide solo lo que realmente se use en las automatizaciones |
| Bullets del contenido | 3-5 bullets de lo que la persona va a aprender, cada uno como resultado ("cómo hacer X", no "sobre X") |
| Prueba social | Si existe: número de alumnos/resultados, no elogios genéricos |
| CTA | Verbo de acción único, repetido en el botón (ej.: "Asegurar mi lugar") |

**Meta de conversión**: 30-50% de los clics (ver `estrutura-de-trafego-pago.md`, sección 4).

**Tracking obligatorio en esta página**: dispara `PageView` al cargar y `Lead` al confirmarse el envío del formulario (Pixel + Conversions API, del lado del servidor — ver sección 5 más abajo).

## 2. Página del workshop

**Objetivo único**: mantener a la persona viendo hasta el pitch. Cero navegación hacia afuera.

**Estructura**:
- Reproductor de video centrado, sin controles de avance rápido si el formato exige sensación de "en vivo" (evergreen con chat simulado).
- Chat lateral (real o simulado con marcas de tiempo fijas) — ver la sección de retención en `estrutura-do-workshop.md`.
- Contador/indicador de que el contenido es por tiempo limitado, si esa es la estrategia de escasez.
- Sin menú, sin pie de página con enlaces, sin forma de salir de la página por accidente.
- En mobile: reproductor totalmente destacado, el chat puede colapsar en una pestaña.

**Tracking obligatorio**: dispara `ViewContent` cuando la persona alcanza el 50% del video visto (mediante el evento de progreso del reproductor, no solo la carga de la página).

## 3. Página de ventas/checkout

**Objetivo único**: convertir a quienes llegaron hasta la oferta. Esta página existe tanto como destino del CTA dentro del workshop como página independiente para remarketing de quienes "vieron, pero no compraron".

**Estructura recomendada** (carta de ventas larga, formato estándar de infoproducto):
1. Headline que refuerza la transformación (no el producto).
2. Reafirmación de para quién es / para quién no es (califica y descalifica al mismo tiempo — reduce reembolsos).
3. Stack de valor completo (producto + bonos, ver `estrutura-do-workshop.md` sección 4), cada ítem con nombre, descripción y valor percibido.
4. Prueba social (testimonios reales, con resultado específico — nunca inventar).
5. Precio con ancla de valor total vs. precio real.
6. Garantía, explicada sin letra chica.
7. FAQ — responde objeciones reales antes de que la persona necesite preguntar (precio, tiempo, nivel de experiencia necesario, soporte, plazo de acceso).
8. CTA final, repetido al menos 3 veces a lo largo de la página (arriba, en medio, al final).
9. Escasez visible (contador real de plazo/cupos, no decorativo).

**Checkout**: integración con el procesador de pagos elegido (definir la plataforma — Stripe, Hotmart, Kiwify, Eduzz, etc.). El checkout debe:
- Capturar el mismo WhatsApp/correo ya recolectado en la inscripción siempre que sea posible (evita volver a escribir los datos y permite emparejar el registro de compra con el lead existente en el CRM).
- Disparar `InitiateCheckout` al cargar y `Purchase` en el webhook de confirmación de pago (nunca en el clic del botón — solo en la confirmación real).

**Meta de conversión**: 1-3% del total de inscritos (ver `estrutura-de-trafego-pago.md`, sección 4).

## 4. Páginas de confirmación y redirección

| Página | Cuándo aparece | Contenido mínimo |
|---|---|---|
| **Confirmación de inscripción** | Justo después de enviar el formulario de inscripción | "Inscripción confirmada" + instrucción del siguiente paso (ej.: "revisa tu WhatsApp/correo") + refuerzo de la fecha/enlace de acceso |
| **Gracias por tu compra** | Después del pago aprobado | Confirmación de la compra + siguiente paso inmediato (dónde acceder al producto, cuándo llega el acceso) + reduce la ansiedad posterior a la compra ("recibirás un correo/WhatsApp en hasta X minutos con...") |
| **Pago rechazado/pendiente** | Retorno del checkout en caso de falla | Reduce la fricción para volver a intentar: motivo probable + botón directo de vuelta al checkout, sin tener que volver a completar todo |
| **Redirección posterior al workshop** | Quien termina de ver sin comprar en el momento | Lleva de vuelta a la página de ventas o a una página de "última oportunidad" con la oferta aún visible por un plazo corto |

Estas páginas rara vez tienen tráfico pago directo, pero son donde la automatización (WhatsApp/correo, ver `automacao-whatsapp.md`) se conecta con lo que la persona acaba de hacer — el mensaje que recibe a continuación debe coincidir con lo que la página confirmó.

## 5. Recorrido completo del lead hasta la compra

```
Anuncio (tráfico pago)
   │  PageView
   ▼
Página de inscripción ──────────────► [Lead perdido — no convirtió]
   │  Lead
   ▼
Confirmación de inscripción → dispara la secuencia de WhatsApp/correo pre-workshop
   │
   ▼
Página del workshop ────────────────► [Vio parcialmente, no llegó al pitch]
   │  ViewContent (>50%)
   ▼
Oferta presentada dentro del workshop
   │
   ▼
Página de ventas/checkout ─────────► [Inició checkout, abandonó → remarketing + recuperación por WhatsApp]
   │  InitiateCheckout
   ▼
Pago confirmado (webhook)
   │  Purchase
   ▼
Página de agradecimiento → acceso liberado → entra en la secuencia post-compra
```

Cada flecha de "salida" de este embudo es una etapa del CRM (ver `crm-e-leads.md`) y un disparador de automatización (ver `workshop-automatizado.md` y `automacao-whatsapp.md`) — nadie debería salir de este embudo sin recibir al menos un intento de recuperación, excepto quienes ya compraron.

---

*Cada página de arriba necesita la copy real completada antes de convertirse en brief de diseño. El layout y el sistema visual siguen los principios de `DESIGN.md`/`PRODUCT.md` del proyecto, adaptados para páginas de conversión (menos editorial, más enfoque en un único CTA por página).*
