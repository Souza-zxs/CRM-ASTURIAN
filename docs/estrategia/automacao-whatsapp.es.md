# Automatización Oficial de WhatsApp

Guía para configurar el canal de WhatsApp (API oficial de Meta) como parte de las secuencias del funnel — confirmación, recordatorios, recuperación y seguimiento posterior al workshop.

## Base técnica en el repositorio actual

El CRM ya se integra con la **API oficial de WhatsApp (Meta Cloud API)** — no es una biblioteca no oficial ni un parche de automatización mediante una app personal:

- `packages/zyra-server/src/modules/whatsapp/` — conexión mediante el flujo OAuth de Embedded Signup de Meta y envío de mensajes de **texto libre** a través de la Graph API.
- `packages/zyra-server/src/modules/whatsapp-webhooks/` — recepción de mensajes entrantes (webhook firmado/verificado).
- `packages/zyra-server/src/modules/whatsapp-agent/` — respondedor automático ya conectado a un modelo de IA (OpenAI) para calificar/responder mensajes recibidos (base directa para `atendimento-ia.md`).

**Brecha importante, ya señalada en el propio código**: el envío hoy solo admite **mensajes de texto libre**, válidos únicamente dentro de la ventana de 24 horas de atención al cliente (la persona debe haber escrito en las últimas 24 horas). **Los mensajes de plantilla preaprobados por Meta — obligatorios para iniciar una conversación fuera de esa ventana — aún no están implementados.**

Esto representa un bloqueo técnico real para buena parte de este funnel: cualquier recordatorio disparado horas/días después de la inscripción (sin que la persona haya respondido nada) requiere una plantilla aprobada, no texto libre. **Antes de configurar las secuencias siguientes en producción, es necesario desarrollar este soporte de plantillas** — es el primer elemento de trabajo técnico que genera este documento, fuera del alcance de "solo configuración".

## 1. Integración con la API oficial de WhatsApp

- Conexión del número de WhatsApp Business al CRM mediante Embedded Signup (flujo ya existente en el producto) — sin depender de un número personal ni de una herramienta externa de envío masivo (que viola los términos de Meta y arriesga el baneo del número).
- Registrar y enviar a aprobación de Meta las plantillas necesarias para cada mensaje fuera de la ventana de 24 horas (ver sección 5 — lista de plantillas a crear).
- Confirmar que el número tiene calidad "verde"/alta antes de escalar el volumen — los números nuevos deben calentarse gradualmente (pocos mensajes por día, en aumento), no empezar enviando a toda la base de una sola vez.

## 2. Confirmación de inscripción

- Disparo: inmediatamente después de que el evento de inscripción crea el registro en el CRM (ver `crm-e-leads.md`).
- Dentro de la ventana de 24 horas en la mayoría de los casos (mensaje inmediato) — puede usar texto libre ya hoy, sin depender del soporte de plantillas.
- Contenido: confirma la inscripción + entrega el enlace de acceso + refuerza fecha/formato.

## 3. Recordatorios automáticos

- Disparo: N horas/días antes del horario de la "sesión" de la persona (ver `workshop-automatizado.md`, sección 1).
- **Necesita plantilla aprobada** en la mayoría de los casos, ya que normalmente supera la ventana de 24 horas desde la inscripción.
- Contenido: refuerzo de valor + urgencia de horario, nunca repetir el mensaje de confirmación tal cual.

## 4. Recuperación de leads

- Disparo: secuencia de seguimiento para quienes no compraron (ver `workshop-automatizado.md`, sección 4).
- Combina texto libre (si la persona respondió algo recientemente) y plantilla (si no hay interacción reciente) — la automatización debe verificar la última interacción antes de decidir qué tipo de mensaje enviar, o simplemente usar siempre plantilla para estos envíos programados (más simple y más robusto que verificar la ventana de forma dinámica).
- Cada mensaje de la secuencia es una plantilla diferente (distintos ángulos de objeción, ver `workshop-automatizado.md`) — Meta no permite reutilizar la misma plantilla para contenidos diferentes; cada variación de texto necesita su propia aprobación.

## 5. Seguimientos y mensajes posteriores al workshop

- Confirmación de compra + instrucciones de acceso: dentro de la ventana de 24 horas en la mayoría de los casos (se desprende directamente de la interacción de compra).
- Secuencia de reactivación para quienes no asistieron: plantillas, misma lógica de las secciones 3-4.

**Lista mínima de plantillas a enviar para aprobación de Meta** (nombres sugeridos, ajustar a la voz de la marca):
1. `confirmacao_inscricao` (respaldo en caso de que el envío inmediato se salga de la ventana de 24 horas por algún retraso)
2. `lembrete_sessao`
3. `sessao_liberando`
4. `recuperacao_nao_comprou_1`, `recuperacao_nao_comprou_2`, `recuperacao_nao_comprou_3` (una por ángulo de objeción)
5. `reativacao_nao_assistiu`
6. `oferta_encerrando`

Las plantillas de utilidad/marketing tienen reglas de aprobación diferentes en Meta (marketing tiene restricciones de opt-in más estrictas) — confirmar la categoría correcta de cada una al momento de enviarla.

## 6. Consentimiento (opt-in)

- El campo `WhatsApp opt-in` del CRM (`crm-e-leads.md`, sección 1) debe ser verdadero antes de cualquier envío fuera de la ventana de 24 horas — la página de inscripción debe dejar claro que la persona recibirá mensajes de WhatsApp sobre el workshop (casilla o texto de consentimiento explícito), no solo recolectar el número.
- Cualquier solicitud de baja ("detener", "salir", etc.) recibida mediante el webhook entrante debe marcar automáticamente el registro como opt-out y finalizar la secuencia — el motor de workflow (disparador de mensaje recibido + condición de texto + `update-record`) cubre esto sin trabajo manual.

---

*Resumen de lo que falta construir antes de activar este canal en producción: soporte para el envío de mensajes de plantilla (hoy solo existe el texto libre), y el envío/aprobación de las plantillas listadas en la sección 5 ante Meta. El resto es configuración de las secuencias sobre la infraestructura de workflow ya existente (`workshop-automatizado.md`).*
