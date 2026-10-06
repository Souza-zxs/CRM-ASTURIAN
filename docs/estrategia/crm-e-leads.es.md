# CRM Completo (Organización de Leads)

Guía para configurar el CRM como el hub central del embudo del workshop — todo lead, en cualquier etapa, debe ser rastreable aquí. Este documento define la estructura de datos y las etapas; la configuración real (creación de objetos/campos) se realiza dentro del propio CRM, sin necesidad de deploy (arquitectura orientada a metadatos).

## Base técnica en el repositorio actual

El CRM ya está orientado a metadatos: objetos, campos y etapas de pipeline (`stage`) son configurables dentro del producto, sin cambios de código — el objeto estándar `Opportunity` ya usa un campo `stage` de ese tipo para el pipeline Kanban. Esto significa que el pipeline de leads del workshop puede modelarse como un **objeto personalizado propio** (ej.: "Inscripción de Workshop"), con un campo de etapa dedicado, en lugar de forzar el embudo dentro del objeto de Oportunidades — esto mantiene intacto el significado de "oportunidad de venta" para otros usos del CRM y da un campo de etapa con el vocabulario correcto (Inscrito, Vio, etc., en lugar de etapas genéricas de venta).

## 1. Organización automática de los leads

**Objeto recomendado**: crear un objeto personalizado `Inscripción Workshop` (o un nombre equivalente), relacionado con el objeto estándar `Persona` (contacto) — de esta forma, el historial de correo/WhatsApp de la persona ya existente en el CRM queda automáticamente vinculado a la inscripción, sin duplicar registros.

**Campos mínimos**:

| Campo | Tipo | Uso |
|---|---|---|
| Etapa | Selección (pipeline) | Ver sección 2 |
| Origen | Selección/texto | De qué campaña/anuncio proviene (coincide con el UTM de la inscripción) |
| Fecha de inscripción | Fecha | Marca de tiempo de cuando entró al embudo |
| Vio (%) | Número | Progreso en el workshop, alimentado por el evento `ViewContent` |
| Fecha de compra | Fecha | Se completa solo cuando `Purchase` confirma |
| Valor de la compra | Moneda | Ticket pagado, si hay upsell/variación de oferta |
| WhatsApp opt-in | Booleano | Confirmación de consentimiento para la automatización de WhatsApp (ver `automacao-whatsapp.md`) |

**Creación automática del registro**: toda inscripción en la página de inscripción (`funil-de-vendas.md`, sección 1) debe crear este registro vía webhook/API en el momento del envío — nunca importación manual/por lotes, que genera retraso y rompe la automatización en tiempo real.

## 2. Etapas personalizadas del embudo

Etapas recomendadas (en el orden del pipeline), reflejando la tabla de eventos de `ecossistema-integrado.md` sección 3:

```
Inscrito → Confirmado (WhatsApp/correo validado) → Vio → Llegó a la oferta
   → Inició checkout → Comprador
                      ↘ No compró (inactivo) → Recuperado (si vuelve a comprar después)
```

- Cada cambio de etapa debe ser automático (disparado por un evento, nunca movido manualmente por alguien que mira el embudo) — ver `workshop-automatizado.md` para los disparadores técnicos.
- Las etapas "muertas" (No compró / Inactivo) no deben tratarse como una papelera — son la lista fuente del seguimiento de recuperación (`workshop-automatizado.md`, `automacao-whatsapp.md`).
- Vistas recomendadas en el CRM: una vista Kanban por etapa (visión general del embudo, cuello de botella visible de arriba abajo) y una vista de tabla filtrada por "Comprador" (visión de ingresos).

## 3. Identificación de inscritos, participantes y compradores

Regla: la etapa en el CRM **es** la identificación — nunca mantener esa distinción solo en la cabeza de quien opera o en una hoja de cálculo paralela. Tres segmentos vivos, siempre derivados de la etapa actual:

- **Inscritos**: etapa ≥ "Inscrito", en cualquier momento del embudo.
- **Participantes**: etapa ≥ "Vio" (campo "Vio (%)" > umbral definido, ej. 50%).
- **Compradores**: etapa = "Comprador".

Estos tres segmentos son la base de cualquier lista usada en remarketing pago (`estrutura-de-trafego-pago.md`, exclusión de compradores) y en el envío de WhatsApp/correo (`automacao-whatsapp.md`) — nunca construir estas listas directamente en la herramienta de anuncios o de envío; siempre a partir del CRM, que es la única fuente de verdad.

## 4. Historial y seguimiento de cada lead

Cada registro de `Inscripción Workshop` debe mostrar, en una única línea de tiempo (función nativa de timeline/actividades del CRM):
- Todos los mensajes de WhatsApp/correo intercambiados (automáticos y manuales).
- Todos los cambios de etapa, con marca de tiempo.
- Eventos de tracking relevantes (vio X%, inició checkout).
- Cualquier nota manual de quien esté operando (ej.: respuesta de soporte vía IA escalada a un humano, ver `atendimento-ia.md`).

**Prueba de suficiencia**: cualquier persona del equipo de operaciones debe poder abrir el registro de un lead y responder, sin preguntarle a nadie, "qué se le ha enviado ya a esta persona y por qué todavía no ha comprado" — si esa pregunta requiere revisar otra herramienta, falta integración (ver `ecossistema-integrado.md`, sección 2).

---

*La estructura de objeto/campos/etapas de arriba se configura dentro del propio CRM (sin deploy). Lo que requiere trabajo de ingeniería es la automatización que escribe en estos campos a partir de cada evento del embudo — ese es el tema de `workshop-automatizado.md`.*
