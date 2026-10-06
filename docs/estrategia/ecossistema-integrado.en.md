# Integrated Ecosystem

A view of how all the pieces of the system (traffic, funnel, WhatsApp, workshop, CRM, AI) connect to function as a nearly automatic flow, from the first click through to the sale and post-sale. This document is the overall map — the details of each piece live in the other documents in this folder.

## 1. The complete flow

```
1. PAID TRAFFIC ──────► docs/estrategia/estrutura-de-trafego-pago.md
      │
      │  clicks the ad
      ▼
2. SIGNUP ──────────► docs/estrategia/funil-de-vendas.md (section 1)
      │
      │  Lead created in the CRM (docs/estrategia/crm-e-leads.md)
      │  triggers the pre-workshop WhatsApp/email sequence
      ▼
3. WHATSAPP (before) ───► docs/estrategia/automacao-whatsapp.md ("before" section)
      │
      │  confirmation + reminders
      ▼
4. WORKSHOP ────────────► docs/estrategia/estrutura-do-workshop.md
      │                   docs/estrategia/workshop-automatizado.md
      │
      │  watched / didn't watch → changes CRM stage
      ▼
5. OFFER (inside the workshop) ► docs/estrategia/funil-de-vendas.md (section 3)
      │
      ├──► BOUGHT ──► post-purchase WhatsApp/email ──► product onboarding
      │
      └──► DIDN'T BUY ──► docs/estrategia/workshop-automatizado.md (follow-up)
                            docs/estrategia/automacao-whatsapp.md (recovery)
                            paid remarketing (estrutura-de-trafego-pago.md)

In parallel, at any point in the flow:
   AI CUSTOMER SERVICE ──► docs/estrategia/atendimento-ia.md
   (answers questions, qualifies, recovers a stalled lead, escalates to a human)

In parallel, the whole time:
   CRM ──► docs/estrategia/crm-e-leads.md
   (logs every event above, is the single source of truth for where each lead stands)
```

## 2. Integration principle

**The CRM is the hub, not just another piece.** Every funnel page, every WhatsApp automation, every workshop event, and every AI conversation writes to the same place — the CRM. This avoids the most common problem with this type of system: each tool (sales page, WhatsApp sender, checkout, AI) keeping its own fragmented version of the lead, with no one able to see the full journey.

Practical rule: **no tool in the ecosystem should be the sole source of truth about a lead** — all of them write to the CRM via webhook/API, and the CRM is the place where you answer "where does so-and-so stand right now?"

## 3. Events that tie the system together

These are the events that run across all the pieces — when each one happens, it must (a) update the lead's stage in the CRM and (b) trigger the corresponding WhatsApp/email automation, and optionally (c) feed the paid traffic pixel:

| Event | Where it happens | Updates in the CRM | Triggers |
|---|---|---|---|
| Registration confirmed | Registration page | Creates lead, stage "Registered" | Pre-workshop sequence |
| Watched >50% | Workshop page | Stage "Watched" | — |
| Started checkout | Sales page | Stage "Started checkout" | Checkout recovery |
| Purchase approved | Payment webhook | Stage "Buyer" | Post-purchase sequence, onboarding |
| No activity for X days | Time-based rule (CRM/automation) | Stage "Inactive" | Reactivation follow-up |

This table is the technical backbone of the ecosystem — in practice, each row becomes an automation trigger (see `workshop-automatizado.md`) and a pipeline stage (see `crm-e-leads.md`).

## 4. Why build in this order

The recommended implementation order is not the reading order of the documents — it is this:

1. **CRM first** (`crm-e-leads.md`) — without defined pipeline stages, there's nowhere for the other pieces to write to.
2. **Page funnel** (`funil-de-vendas.md`) — the source of the events that feed everything else.
3. **WhatsApp** (`automacao-whatsapp.md`) — depends on the CRM (to know who's in which stage) and on the funnel (to know when to trigger).
4. **Workshop automation** (`workshop-automatizado.md`) — ties funnel + CRM + WhatsApp together into timed sequences.
5. **Paid traffic** (`estrutura-de-trafego-pago.md`) — only scales once the funnel and tracking (pixel/CAPI) are already working end to end; turning on traffic before that burns budget without reliable data.
6. **Customer service AI** (`atendimento-ia.md`) — the last piece because it depends on everything else already existing to have real context (offer, FAQ, the lead's state in the CRM) in order to respond well.

**Don't skip ahead to AI or paid traffic before steps 1-4 are working manually at least once.** Automating a broken process just breaks it faster and at a larger scale.

## 5. Signal that the ecosystem is working

The real test isn't "all the tools are connected" — it's: **a new lead can go from the ad to the purchase (or to a recovery follow-up) with no manual action at all**, and at any moment it's possible to open the CRM and answer, for any individual lead, "where is this person right now and what has already been triggered for them."

---

*This document should be reviewed whenever a piece of the ecosystem changes tool (e.g., switching payment processors, switching WhatsApp providers) — the table in section 3 is the contract between the pieces and needs to stay valid.*
