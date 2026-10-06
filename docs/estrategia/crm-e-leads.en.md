# Full CRM (Lead Organization)

Guide for setting up the CRM as the central hub of the workshop funnel — every lead, at any stage, must be trackable here. This document defines the data structure and stages; the actual configuration (creating objects/fields) is done inside the CRM itself, with no deploy required (metadata-driven architecture).

## Technical foundation in the current repository

The CRM is already metadata-driven: objects, fields, and pipeline stages (`stage`) are configurable inside the product, with no code changes — the standard `Opportunity` object already uses a `stage` field of this type for the Kanban pipeline. This means the workshop's lead pipeline can be modeled as its **own custom object** (e.g., "Workshop Registration"), with a dedicated stage field, instead of forcing the funnel into the Opportunities object — this keeps the meaning of "sales opportunity" intact for other uses of the CRM and gives a stage field with the right vocabulary (Registered, Watched, etc., instead of generic sales stages).

## 1. Automatic lead organization

**Recommended object**: create a custom object `Workshop Registration` (or an equivalent name), related to the standard `Person` object (contact) — this way the person's existing email/WhatsApp history in the CRM is automatically linked to the registration, without duplicating records.

**Minimum fields**:

| Field | Type | Use |
|---|---|---|
| Stage | Selection (pipeline) | See section 2 |
| Source | Selection/text | Which campaign/ad it came from (matches the registration's UTM) |
| Registration date | Date | Timestamp of when they entered the funnel |
| Watched (%) | Number | Progress in the workshop, fed by the `ViewContent` event |
| Purchase date | Date | Filled only when `Purchase` is confirmed |
| Purchase value | Currency | Amount paid, if there's an upsell/offer variation |
| WhatsApp opt-in | Boolean | Consent confirmation for WhatsApp automation (see `automacao-whatsapp.md`) |

**Automatic record creation**: every registration on the signup page (`funil-de-vendas.md`, section 1) must create this record via webhook/API at the moment of submission — never manual/batch import, which causes delay and breaks real-time automation.

## 2. Custom funnel stages

Recommended stages (in pipeline order), mirroring the event table from `ecossistema-integrado.md` section 3:

```
Registered → Confirmed (WhatsApp/email validated) → Watched → Reached the offer
   → Started checkout → Buyer
                      ↘ Did not buy (inactive) → Recovered (if they purchase later)
```

- Every stage change must be automatic (triggered by an event, never moved manually by someone looking at the funnel) — see `workshop-automatizado.md` for the technical triggers.
- "Dead" stages (Did not buy / Inactive) should not be treated as a trash bin — they are the source list for recovery follow-up (`workshop-automatizado.md`, `automacao-whatsapp.md`).
- Recommended CRM views: one Kanban view per stage (overview of the funnel, bottleneck visible top to bottom) and a table view filtered by "Buyer" (revenue view).

## 3. Identifying registrants, participants, and buyers

Rule: the stage in the CRM **is** the identification — never keep this distinction only in the operator's head or in a parallel spreadsheet. Three live segments, always derived from the current stage:

- **Registrants**: stage ≥ "Registered", at any point in the funnel.
- **Participants**: stage ≥ "Watched" (field "Watched (%)" > defined threshold, e.g. 50%).
- **Buyers**: stage = "Buyer".

These three segments are the basis for any list used in paid remarketing (`estrutura-de-trafego-pago.md`, buyer exclusion) and in WhatsApp/email dispatch (`automacao-whatsapp.md`) — never build these lists directly in the ad tool or the dispatch tool; always from the CRM, which is the single source of truth.

## 4. History and tracking of each lead

Every `Workshop Registration` record must show, in a single timeline (the CRM's native timeline/activity feature):
- All WhatsApp/email messages exchanged (automatic and manual).
- All stage changes, with timestamp.
- Relevant tracking events (watched X%, started checkout).
- Any manual note from whoever is operating (e.g., AI support reply escalated to a human, see `atendimento-ia.md`).

**Sufficiency test**: anyone on the operations team should be able to open a lead's record and answer, without asking anyone, "what has already been sent to this person and why haven't they bought yet" — if that question requires checking another tool, integration is missing (see `ecossistema-integrado.md`, section 2).

---

*The object/field/stage structure above is configured inside the CRM itself (no deploy needed). What requires engineering work is the automation that writes to these fields from each funnel event — that is the subject of `workshop-automatizado.md`.*
