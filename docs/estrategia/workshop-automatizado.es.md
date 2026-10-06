# Workshop 100% Automatizado

Guía para configurar el workshop como un evento evergreen — la persona se inscribe en cualquier momento, lo ve, recibe la oferta y entra en secuencias de seguimiento, todo sin intervención manual.

## Base técnica en el repositorio actual

El CRM ya incluye un motor de automatización completo (`packages/zyra-server/src/modules/workflow/`), heredado de la base del CRM, con:
- **Disparadores**: evento de base de datos (registro creado/actualizado/eliminado — ej.: cambio de etapa en el objeto `Inscrição Workshop`), programación (`CRON`, incluyendo intervalos en días/horas/minutos), webhook externo (GET/POST autenticado por API key) y disparo manual.
- **Acciones**: enviar/guardar borrador de correo, solicitud HTTP, crear/actualizar/eliminar/buscar registros, ejecución de código personalizado, condicionales (`if-else`), filtro, iterador, agente de IA, formulario y **`delay`** (etapa de espera con cola propia) — esencial para secuencias espaciadas en el tiempo.
- Esto cubre la base técnica necesaria para todo lo que sigue: ninguna de estas secuencias requiere una herramienta externa de automatización — el motor ya existe dentro del producto.

## 1. Configuración para funcionar como evento automático

**Formato evergreen recomendado**: la fecha/hora del workshop no es fija — cada persona ve "su" workshop a partir del momento en que se inscribe (ej.: "tu sesión se habilita en 10 minutos" o acceso inmediato con chat simulado, ver `estrutura-do-workshop.md`, sección 2).

**Configuración**:
- Disparador: `DATABASE_EVENT` — registro creado en el objeto `Inscrição Workshop` (ver `crm-e-leads.md`).
- Acción inicial: genera el horario de "sesión" de la persona (ej.: ahora + N minutos) y lo guarda en el registro — es ese campo el que la página del workshop usa para decidir qué mostrar.
- Todo el resto del flujo (recordatorios, liberación de acceso, seguimiento) está vinculado a ese timestamp individual, no a un horario global de evento.

## 2. Entrada y gestión automática de los leads

- La creación del registro en el CRM (webhook de la página de inscripción) es el único punto de entrada al flujo — ninguna inscripción debe depender de que alguien importe una lista después.
- Gestión de etapa: cada evento del embudo (ver `ecossistema-integrado.md`, sección 3) dispara una acción de `update-record` que mueve la etapa en el CRM — esto reemplaza cualquier "gestión manual de hoja de cálculo de inscritos".
- Duplicidad: antes de crear un nuevo registro, verificar (acción de búsqueda) si ya existe una inscripción con el mismo correo/WhatsApp en una ventana reciente (ej.: la misma cohorte evergreen) — evita disparar toda la secuencia de nuevo para quien ya está en ella.

## 3. Secuencias antes, durante y después del workshop

**Antes** (entre la inscripción y la "sesión" de la persona):

| Cuándo (relativo al horario de la sesión) | Canal | Contenido |
|---|---|---|
| Inmediato | WhatsApp + correo | Confirmación de inscripción + enlace de acceso |
| N horas/días antes (si aplica al formato) | WhatsApp | Recordatorio + refuerzo de valor ("lo que vas a aprender") |
| Poco antes del horario de la sesión | WhatsApp | "Está por habilitarse" — aumenta la asistencia |

**Durante** (solo si es posible una interacción en tiempo real, ej. sesión en vivo real o chat con IA):
- Los mensajes de chat simulados y cronometrados (ver `estrutura-do-workshop.md`, sección 3) no son responsabilidad del motor de workflow — permanecen en el reproductor/página del workshop.
- Si llegan dudas reales (WhatsApp durante la sesión), se enrutan hacia la IA de atención (`atendimento-ia.md`).

**Después** (post-workshop, dividido por resultado):

| Segmento | Secuencia |
|---|---|
| Compró | Confirmación de compra → instrucciones de acceso → onboarding del producto (fuera del alcance de este embudo, pero debe iniciarse automáticamente) |
| Vio, no compró | Ver sección 4 — seguimiento de recuperación |
| No vio | Secuencia de "lo perdiste, pero aún estás a tiempo" con un nuevo plazo/refuerzo, antes de caer en la recuperación estándar |

Cada línea de "cuándo" anterior es, en la práctica: disparador `DATABASE_EVENT` (cambio de etapa) → acción `delay` (espera el intervalo) → acción de envío (correo nativo; WhatsApp vía `http-request` hasta que exista una acción nativa, ver `automacao-whatsapp.md`) → acción `update-record` (marca que fue enviado, evita duplicar).

## 4. Seguimiento automático para quienes no compraron

**Principio**: nadie que haya llegado hasta la oferta sale del embudo sin al menos 2-3 intentos de recuperación, espaciados, cada uno con un ángulo diferente (sin repetir el mismo mensaje).

**Secuencia recomendada** (disparador: etapa = "Assistiu" o "Iniciou checkout" Y "Comprador" != true, después de un plazo sin `Purchase`):

1. **+pocas horas**: recordatorio directo — "todavía estás a tiempo, aquí está el enlace".
2. **+1 día**: desmontaje de objeción específica (precio, tiempo, "¿esto funciona para mí?") — usar la etapa exacta (vio vs. inició checkout) para elegir la objeción más probable.
3. **+2-3 días**: urgencia real de plazo/cupos que se cierran, u oferta final reducida — solo si es verdad (ver `estrutura-do-workshop.md`, "escasez real").
4. **Cierre del plazo**: mensaje final "se está cerrando" y, opcionalmente, mueve a la persona a un segmento de remarketing pago de largo plazo (`estrutura-de-trafego-pago.md`) en lugar de seguir intentando por WhatsApp/correo indefinidamente.

**Corte automático**: toda la secuencia de seguimiento debe verificar `Comprador = true` como condición de salida antes de cada envío (`if-else`) — nunca enviar un mensaje de recuperación a quien ya compró.

---

*El motor de workflow ya soporta todo esto de forma nativa, excepto el envío de WhatsApp como acción de primera clase (hoy sería vía `http-request` llamando al módulo de WhatsApp — ver la brecha técnica en `automacao-whatsapp.md`). Construir estas secuencias es configuración dentro del producto, no desarrollo nuevo, con esa única salvedad.*
