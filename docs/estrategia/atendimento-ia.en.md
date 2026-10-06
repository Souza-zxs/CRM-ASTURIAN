# AI-Powered Customer Service and Support

Guide for configuring the AI that answers questions, qualifies leads, and decides when to escalate to human support — within the funnel's WhatsApp flow.

## Technical foundation in the current repository

The CRM already has the central piece ready: `packages/zyra-server/src/modules/whatsapp-agent/` is an automatic responder for incoming WhatsApp messages, already connected to an AI model (OpenAI). The workflow engine (`packages/zyra-server/src/modules/workflow/`) also has a native action of type `ai-agent`, available for use within any sequence, not just WhatsApp.

This means the missing technical piece isn't "build an AI agent from scratch" — it's **configuring the behavior** (prompt, knowledge base, qualification and escalation rules) on top of the infrastructure that already exists.

## 1. AI trained with business and offer information

**Minimum knowledge base the AI needs to receive** (via system/context prompt, not model "training" — faster and easier to keep up to date):
- The workshop's central promise and who it is / isn't for (see `estrutura-do-workshop.md`).
- Full offer structure: main product, bonuses, guarantee, price, deadline/scarcity (see `estrutura-do-workshop.md`, section 4).
- Complete FAQ (same base as the FAQ section of the sales page, `funil-de-vendas.md` section 3) — the AI must answer consistently with what's already written on the page, never inventing a different answer.
- Brand voice and tone (same principle from `PRODUCT.md`/`DESIGN.md` applied to copy instead of visuals) — the AI should sound like the same person/brand that speaks in the workshop, not like a generic support bot.

**Maintenance**: any change to price, deadline, or offer needs to update this knowledge base at the same time — an AI answering with an outdated price is worse than having no AI at all (it breaks trust right at the moment of purchase).

## 2. Automatic answers to the main questions

Categories of questions expected in a workshop funnel (use as a knowledge base checklist):
- Content/audience fit questions ("is this for me, a beginner?").
- Logistics questions (when it's released, how long it stays available, how to access it).
- Commercial questions (price, payment method, installments).
- Trust objections ("does this really work?", "what if I don't like it?").
- Technical problems (didn't receive the link, couldn't access it) — this type should get priority fast-response treatment, as it's the biggest source of frustration and drop-off.

## 3. Qualifying potential customers

If volume justifies it (a funnel with a higher ticket or an offer with a consultative sales step), the AI can, during the conversation, collect qualification signals and record them in the CRM (`update-record` action in the workflow engine):
- Declared urgency/intent level ("when do you plan to get started?").
- Budget/investment capacity, if the offer requires that filter.
- Main objection identified in the conversation — this becomes valuable data for improving the sales page and the workshop itself (`funil-de-vendas.md`, `estrutura-do-workshop.md`), not just for closing that specific sale.

These signals become fields on the `Inscrição Workshop` object (`crm-e-leads.md`) — the qualification done by the AI remains visible in the lead's history, alongside the rest of the journey.

## 4. Handoff to human support when needed

**Escalation criteria** (the AI must recognize and act on these, not leave the person stuck in a bot loop):
- Explicit request to speak with a human.
- Question outside the knowledge base (the AI shouldn't "guess" an answer about something not in its base — better to admit it and escalate).
- Sign of frustration/complaint (tone of the message, repetition of the same question without a satisfactory answer).
- Any mention of refund/cancellation — always handled by a human, never resolved automatically by the AI.
- Lead already qualified as high purchase intent on a high-ticket offer, if the operation prefers to close those conversations with a real person.

**Escalation mechanics**: the AI action within the workflow engine can, upon detecting one of these criteria, trigger a notification (email/Slack/whatever the operation uses) and mark the lead's record in the CRM with a "waiting for human" tag/field — the conversation doesn't disappear, it just changes owner, and the full history is already in the CRM for whoever takes over, so they don't need to ask the person to repeat what they already said.

---

*The technical piece (`whatsapp-agent` + the workflow's `ai-agent` action) already exists in the product. The real work here is writing and maintaining the knowledge base (section 1) and precisely defining the escalation criteria (section 4) — this is a business decision, not an engineering one.*
