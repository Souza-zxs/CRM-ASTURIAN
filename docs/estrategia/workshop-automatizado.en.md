# Fully Automated Workshop

A guide for setting up the workshop as an evergreen event — the person signs up at any moment, watches, receives the offer, and enters follow-up sequences, all without manual intervention.

## Technical foundation in the current repository

The CRM already includes a complete automation engine (`packages/zyra-server/src/modules/workflow/`), inherited from the CRM's base, with:
- **Triggers**: database event (record created/updated/deleted — e.g., a stage change on the `Inscrição Workshop` object), scheduling (`CRON`, including intervals in days/hours/minutes), external webhook (GET/POST authenticated via API key), and manual trigger.
- **Actions**: send/draft email, HTTP request, create/update/delete/find records, custom code execution, conditionals (`if-else`), filter, iterator, AI agent, form, and **`delay`** (a wait step with its own queue) — essential for sequences spaced out over time.
- This covers the technical foundation needed for everything below: none of these sequences requires an external automation tool — the engine already exists within the product.

## 1. Configuration to function as an automatic event

**Recommended evergreen format**: the workshop's date/time is not fixed — each person sees "their" workshop starting from the moment they sign up (e.g., "your session unlocks in 10 minutes" or immediate access with a simulated chat, see `estrutura-do-workshop.md`, section 2).

**Configuration**:
- Trigger: `DATABASE_EVENT` — record created on the `Inscrição Workshop` object (see `crm-e-leads.md`).
- Initial action: generates the person's "session" time (e.g., now + N minutes) and saves it on the record — it's this field that the workshop page uses to decide what to display.
- The rest of the flow (reminders, access unlocking, follow-up) is tied to this individual timestamp, not to a global event time.

## 2. Automatic lead intake and management

- Record creation in the CRM (webhook from the signup page) is the only entry point into the flow — no signup should depend on someone importing a list afterward.
- Stage management: each funnel event (see `ecossistema-integrado.md`, section 3) triggers an `update-record` action that moves the stage in the CRM — this replaces any "manual spreadsheet management of registrants."
- Duplicates: before creating a new record, check (via a find action) whether a signup with the same email/WhatsApp number already exists within a recent window (e.g., the same evergreen cohort) — this avoids re-triggering the entire sequence for someone already in it.

## 3. Sequences before, during, and after the workshop

**Before** (between signup and the person's "session"):

| When (relative to session time) | Channel | Content |
|---|---|---|
| Immediate | WhatsApp + email | Signup confirmation + access link |
| N hours/days before (if applicable to the format) | WhatsApp | Reminder + value reinforcement ("what you'll learn") |
| Shortly before session time | WhatsApp | "It's about to unlock" — increases attendance |

**During** (only if real-time interaction is possible, e.g., an actual live session or AI chat):
- Timed simulated chat messages (see `estrutura-do-workshop.md`, section 3) are not the workflow engine's responsibility — they live in the workshop player/page.
- If real questions come in (WhatsApp during the session), they are routed to the service AI (`atendimento-ia.md`).

**After** (post-workshop, split by outcome):

| Segment | Sequence |
|---|---|
| Purchased | Purchase confirmation → access instructions → product onboarding (outside the scope of this funnel, but should start automatically) |
| Watched, didn't purchase | See section 4 — recovery follow-up |
| Didn't watch | A "you missed it, but there's still time" sequence with a new deadline/reinforcement, before falling into the standard recovery flow |

Each "when" row above is, in practice: a `DATABASE_EVENT` trigger (stage change) → a `delay` action (waits the interval) → a send action (native email; WhatsApp via `http-request` until a native action exists, see `automacao-whatsapp.md`) → an `update-record` action (marks that it was sent, avoiding duplicates).

## 4. Automatic follow-up for non-buyers

**Principle**: no one who reached the offer leaves the funnel without at least 2-3 recovery attempts, spaced out, each with a different angle (never repeating the same message).

**Recommended sequence** (trigger: stage = "Assistiu" or "Iniciou checkout" AND "Comprador" != true, after a deadline with no `Purchase`):

1. **+a few hours**: direct reminder — "there's still time, here's the link."
2. **+1 day**: addresses a specific objection (price, time, "will this work for me?") — use the exact stage (watched vs. started checkout) to pick the most likely objection.
3. **+2-3 days**: real urgency around a closing deadline/spots, or a final reduced offer — only if it's true (see `estrutura-do-workshop.md`, "real scarcity").
4. **Deadline close**: final "it's closing" message plus, optionally, moves the person into a long-term paid remarketing segment (`estrutura-de-trafego-pago.md`) instead of continuing to try via WhatsApp/email indefinitely.

**Automatic cutoff**: the entire follow-up sequence must check `Comprador = true` as an exit condition before each send (`if-else`) — never send a recovery message to someone who has already purchased.

---

*The workflow engine already natively supports all of this, except sending WhatsApp as a first-class action (today it would be via `http-request` calling the WhatsApp module — see the technical gap in `automacao-whatsapp.md`). Building these sequences is configuration within the product, not new development, with that single caveat.*
