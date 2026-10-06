# Ecosistema Integrado

Visión de cómo todas las piezas del sistema (tráfico, embudo, WhatsApp, workshop, CRM, IA) se conectan para funcionar como un flujo prácticamente automático, desde el primer clic hasta la venta y la posventa. Este documento es el mapa general — los detalles de cada pieza están en los demás documentos de esta carpeta.

## 1. El flujo completo

```
1. TRÁFICO PAGO ──────► docs/estrategia/estrutura-de-trafego-pago.md
      │
      │  clic en el anuncio
      ▼
2. INSCRIPCIÓN ──────────► docs/estrategia/funil-de-vendas.md (sección 1)
      │
      │  Lead creado en el CRM (docs/estrategia/crm-e-leads.md)
      │  dispara la secuencia de WhatsApp/correo pre-workshop
      ▼
3. WHATSAPP (antes) ───► docs/estrategia/automacao-whatsapp.md (sección "antes")
      │
      │  confirmación + recordatorios
      ▼
4. WORKSHOP ────────────► docs/estrategia/estrutura-do-workshop.md
      │                   docs/estrategia/workshop-automatizado.md
      │
      │  vio / no vio → cambia la etapa en el CRM
      ▼
5. OFERTA (dentro del workshop) ► docs/estrategia/funil-de-vendas.md (sección 3)
      │
      ├──► COMPRÓ ──► WhatsApp/correo post-compra ──► onboarding del producto
      │
      └──► NO COMPRÓ ──► docs/estrategia/workshop-automatizado.md (follow-up)
                            docs/estrategia/automacao-whatsapp.md (recuperación)
                            remarketing pago (estrutura-de-trafego-pago.md)

En paralelo, en cualquier momento del flujo:
   IA DE ATENCIÓN ──► docs/estrategia/atendimento-ia.md
   (responde dudas, califica, recupera leads detenidos, escala a un humano)

En paralelo, todo el tiempo:
   CRM ──► docs/estrategia/crm-e-leads.md
   (registra cada evento anterior, es la única fuente de verdad sobre dónde está cada lead)
```

## 2. Principio de integración

**El CRM es el eje central, no una pieza más.** Cada página del embudo, cada automatización de WhatsApp, cada evento del workshop y cada conversación de la IA escribe en el mismo lugar — el CRM. Esto evita el problema más común de este tipo de sistema: que cada herramienta (página de ventas, envío de WhatsApp, checkout, IA) guarde su propia versión fragmentada del lead, sin que nadie pueda ver el recorrido completo.

Regla práctica: **ninguna herramienta del ecosistema debe ser la única fuente de verdad sobre un lead** — todas escriben en el CRM vía webhook/API, y el CRM es el lugar donde se responde "¿en qué punto está Fulano?".

## 3. Eventos que amarran el sistema

Estos son los eventos que atraviesan todas las piezas — cada uno, al ocurrir, debe (a) actualizar la etapa del lead en el CRM y (b) disparar la automatización de WhatsApp/correo correspondiente, y opcionalmente (c) alimentar el píxel de tráfico pago:

| Evento | Dónde ocurre | Actualiza en el CRM | Dispara |
|---|---|---|---|
| Inscripción confirmada | Página de inscripción | Crea el lead, etapa "Inscrito" | Secuencia pre-workshop |
| Vio más del 50% | Página del workshop | Etapa "Vio el workshop" | — |
| Inició el checkout | Página de ventas | Etapa "Inició checkout" | Recuperación de checkout |
| Compra aprobada | Webhook del pago | Etapa "Comprador" | Secuencia post-compra, onboarding |
| Sin actividad X días | Regla de tiempo (CRM/automatización) | Etapa "Inactivo" | Follow-up de reactivación |

Esta tabla es la columna vertebral técnica del ecosistema — en la práctica, cada fila se convierte en un disparador de automatización (ver `workshop-automatizado.md`) y en una etapa del pipeline (ver `crm-e-leads.md`).

## 4. Por qué en este orden de construcción

El orden recomendado de implementación no es el orden de lectura de los documentos — es este:

1. **CRM primero** (`crm-e-leads.md`) — sin etapas de pipeline definidas, no hay dónde escriban las demás piezas.
2. **Embudo de páginas** (`funil-de-vendas.md`) — la fuente de los eventos que alimentan todo lo demás.
3. **WhatsApp** (`automacao-whatsapp.md`) — depende del CRM (para saber quién está en qué etapa) y del embudo (para saber cuándo disparar).
4. **Automatización del workshop** (`workshop-automatizado.md`) — amarra embudo + CRM + WhatsApp en secuencias temporizadas.
5. **Tráfico pago** (`estrutura-de-trafego-pago.md`) — solo escala cuando el embudo y el tracking (píxel/CAPI) ya funcionan de punta a punta; activar tráfico antes de eso quema presupuesto sin datos confiables.
6. **IA de atención** (`atendimento-ia.md`) — última pieza porque depende de que todo lo demás ya exista para tener contexto real (oferta, FAQ, estado del lead en el CRM) y poder responder bien.

**No saltes a la IA ni al tráfico pago antes de que los pasos 1-4 funcionen manualmente al menos una vez.** Automatizar un proceso roto solo lo rompe más rápido y a mayor escala.

## 5. Señal de que el ecosistema está funcionando

La prueba real no es "todas las herramientas están conectadas" — es: **un lead nuevo logra pasar del anuncio hasta la compra (o hasta un follow-up de recuperación) sin ninguna acción manual**, y en cualquier momento es posible abrir el CRM y responder, para cualquier lead individual, "dónde está esta persona ahora y qué se le ha disparado ya".

---

*Este documento debe revisarse cada vez que una pieza del ecosistema cambie de herramienta (por ejemplo, cambiar de procesador de pagos, cambiar de proveedor de WhatsApp) — la tabla de la sección 3 es el contrato entre las piezas y necesita seguir siendo válida.*
