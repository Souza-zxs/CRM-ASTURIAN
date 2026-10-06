# Atención y Soporte con IA

Guía para configurar la IA que responde dudas, califica leads y decide cuándo escalar a atención humana — dentro del flujo de WhatsApp del embudo.

## Base técnica en el repositorio actual

El CRM ya tiene la pieza central lista: `packages/zyra-server/src/modules/whatsapp-agent/` es un respondedor automático de mensajes de WhatsApp recibidos, ya conectado a un modelo de IA (OpenAI). El motor de workflow (`packages/zyra-server/src/modules/workflow/`) también tiene una acción nativa de tipo `ai-agent`, disponible para usar dentro de cualquier secuencia, no solo en WhatsApp.

Esto significa que la pieza técnica que falta no es "construir un agente de IA desde cero" — es **configurar el comportamiento** (prompt, base de conocimiento, reglas de calificación y de escalamiento) sobre la infraestructura que ya existe.

## 1. IA entrenada con información del negocio y de la oferta

**Base de conocimiento mínima que la IA necesita recibir** (vía prompt de sistema/contexto, no "entrenamiento" del modelo — más rápido y más fácil de mantener actualizado):
- La promesa central del workshop y para quién es / no es (ver `estrutura-do-workshop.md`).
- Estructura completa de la oferta: producto principal, bonos, garantía, precio, plazo/escasez (ver `estrutura-do-workshop.md`, sección 4).
- FAQ completo (misma base de la sección de FAQ de la página de ventas, `funil-de-vendas.md` sección 3) — la IA debe responder de forma consistente con lo que ya está escrito en la página, nunca inventar una respuesta diferente.
- Tono de voz de la marca (mismo principio de `PRODUCT.md`/`DESIGN.md` aplicado al texto, no al visual) — la IA debe sonar como la misma persona/marca que habla en el workshop, no como un bot genérico de soporte.

**Mantenimiento**: cualquier cambio de precio, plazo u oferta necesita actualizar esa base de conocimiento en el mismo momento — una IA respondiendo con un precio antiguo es peor que no tener IA (rompe la confianza justo en el momento de la compra).

## 2. Respuestas automáticas a las principales dudas

Categorías de dudas esperadas en un embudo de workshop (usar como checklist de la base de conocimiento):
- Duda sobre contenido/para quién es ("¿esto sirve para mí que soy principiante?").
- Duda sobre logística (cuándo se libera, cuánto tiempo queda disponible, cómo acceder).
- Duda comercial (precio, forma de pago, cuotas).
- Objeción de confianza ("¿esto realmente funciona?", "¿y si no me gusta?").
- Problema técnico (no recibió el enlace, no logró acceder) — este tipo debe tener prioridad de respuesta rápida, es lo que más genera frustración y abandono.

## 3. Calificación de potenciales clientes

Si el volumen lo justifica (embudo con ticket más alto u oferta con una etapa de venta consultiva), la IA puede, durante la conversación, recolectar señales de calificación y registrarlas en el CRM (acción de `update-record` en el motor de workflow):
- Nivel de urgencia/intención declarada ("¿cuándo pretendes empezar?").
- Presupuesto/capacidad de inversión, si la oferta exige ese filtro.
- Principal objeción identificada en la conversación — se convierte en un dato valioso para mejorar la página de ventas y el propio workshop (`funil-de-vendas.md`, `estrutura-do-workshop.md`), no solo para cerrar esa venta específica.

Estas señales se convierten en campos del objeto `Inscrição Workshop` (`crm-e-leads.md`) — la calificación hecha por la IA queda visible en el historial del lead, junto con el resto del recorrido.

## 4. Derivación a atención humana cuando sea necesario

**Criterios de escalamiento** (la IA debe reconocerlos y actuar, no dejar a la persona atrapada en un bucle de bot):
- Pedido explícito de hablar con un humano.
- Pregunta fuera de la base de conocimiento (la IA no debe "adivinar" una respuesta sobre algo que no está en su base — es mejor admitirlo y escalar).
- Señal de frustración/reclamo (tono del mensaje, repetición de la misma pregunta sin una respuesta satisfactoria).
- Cualquier mención a reembolso/cancelación — siempre se trata con un humano, nunca se resuelve automáticamente vía IA.
- Lead ya calificado como de alta intención de compra en una oferta de ticket alto, si la operación prefiere cerrar esas conversaciones con una persona real.

**Mecánica de escalamiento**: la acción de IA dentro del motor de workflow puede, al detectar uno de estos criterios, disparar una notificación (correo electrónico/Slack/lo que use la operación) y marcar el registro del lead en el CRM con una etiqueta/campo "esperando humano" — la conversación no desaparece, solo cambia de responsable, y todo el historial ya está en el CRM para quien la retome, sin necesidad de pedirle a la persona que repita lo que ya dijo.

---

*La pieza técnica (`whatsapp-agent` + acción `ai-agent` del workflow) ya existe en el producto. El trabajo real aquí es escribir y mantener la base de conocimiento (sección 1) y definir con precisión los criterios de escalamiento (sección 4) — eso es una decisión de negocio, no de ingeniería.*
