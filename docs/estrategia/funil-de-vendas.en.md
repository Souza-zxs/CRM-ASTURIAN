# Complete Sales Funnel

Guide/template for structuring each page of the funnel, from the first click to the purchase. Fill in each section with the real copy before building the pages — this becomes the final content and layout brief.

This funnel assumes an evergreen workshop format (see `estrutura-do-workshop.md`): the lead signs up, watches (live or recorded), and receives the offer at the end. All the pages below make up that journey.

## 1. Registration page

**Single objective**: convert paid/organic traffic into a registration (name + email + WhatsApp). Nothing beyond that — no navigation menu, no exit links, no distractions.

**Recommended structure**:

| Block | Content |
|---|---|
| Headline | The workshop's central promise, framed as a specific outcome ("How to [outcome] in [timeframe/condition], even if [common objection]") |
| Subheadline | Reinforces who it's for / what they'll learn, in 1 sentence |
| Date/format | If live: real date and time. If evergreen (on-demand): "Watch now" or a simulated time picker — never lie by claiming it's live if it isn't |
| Form | Name + email + WhatsApp (with country code). Every extra field lowers conversion — only ask for what will actually be used in the automations |
| Content bullets | 3-5 bullets of what the person will learn, each framed as an outcome ("how to do X," not "about X") |
| Social proof | If available: number of students/results, not generic praise |
| CTA | A single action verb, repeated on the button (e.g., "Save my spot") |

**Conversion target**: 30-50% of clicks (see `estrutura-de-trafego-pago.md`, section 4).

**Mandatory tracking on this page**: fire `PageView` on load and `Lead` on confirmed form submission (Pixel + Conversions API, server-side — see section 5 below).

## 2. Workshop page

**Single objective**: keep the person watching until the pitch. Zero navigation away from the page.

**Structure**:
- Centered video player, without fast-forward controls if the format requires a sense of "live" (evergreen with simulated chat).
- Side chat (real or simulated with fixed timestamps) — see the retention section in `estrutura-do-workshop.md`.
- Countdown/indicator showing the content is time-limited, if that's part of the scarcity strategy.
- No menu, no footer with links, no way to accidentally leave the page.
- On mobile: player fully featured, chat can collapse into a tab.

**Mandatory tracking**: fire `ViewContent` when the person reaches 50% of the video watched (via the player's progress event, not just the page load).

## 3. Sales/checkout page

**Single objective**: convert everyone who made it to the offer. This page exists both as the CTA destination inside the workshop and as a standalone page for remarketing to people who "watched but didn't buy."

**Recommended structure** (long-form sales letter, standard info-product format):
1. Headline reinforcing the transformation (not the product).
2. Reaffirm who it's for / who it's not for (qualifies and disqualifies at the same time — reduces refunds).
3. Full value stack (product + bonuses, see `estrutura-do-workshop.md` section 4), each item with name, description, and perceived value.
4. Social proof (real testimonials, with a specific result — never invented).
5. Price anchored against the total value vs. the real price.
6. Guarantee, explained without fine print.
7. FAQ — answer real objections before the person has to ask (price, time commitment, experience level required, support, access duration).
8. Final CTA, repeated at least 3x throughout the page (top, middle, end).
9. Visible scarcity (a real countdown for deadline/slots, not decorative).

**Checkout**: integration with the chosen payment processor (define the platform — Stripe, Hotmart, Kiwify, Eduzz, etc.). The checkout should:
- Capture the same WhatsApp/email already collected at registration whenever possible (avoids re-typing and allows the purchase record to be matched with the existing lead in the CRM).
- Fire `InitiateCheckout` on load and `Purchase` on the payment confirmation webhook (never on the button click — only on actual confirmation).

**Conversion target**: 1-3% of total registrants (see `estrutura-de-trafego-pago.md`, section 4).

## 4. Confirmation and redirect pages

| Page | When it appears | Minimum content |
|---|---|---|
| **Registration confirmation** | Right after submitting the registration form | "Registration confirmed" + instruction for the next step (e.g., "check your WhatsApp/email") + reinforcement of the date/access link |
| **Thank you for your purchase** | After payment is approved | Purchase confirmation + immediate next step (where to access the product, when access arrives) + reduces post-purchase anxiety ("you'll receive an email/WhatsApp message within X minutes with...") |
| **Payment declined/pending** | Returned from checkout in case of failure | Reduces friction for retrying: likely reason + direct button back to checkout, without having to refill everything |
| **Post-workshop redirect** | People who finish watching without buying on the spot | Leads back to the sales page or to a "last chance" page with the offer still visible for a short window |

These pages rarely get direct paid traffic, but they're where automation (WhatsApp/email, see `automacao-whatsapp.md`) connects to what the person just did — the message they receive next should match what the page confirmed.

## 5. The lead's complete journey to purchase

```
Ad (paid traffic)
   │  PageView
   ▼
Signup page ──────────────► [Lead lost — didn't convert]
   │  Lead
   ▼
Signup confirmation → triggers the pre-workshop WhatsApp/email sequence
   │
   ▼
Workshop page ────────────────► [Watched partially, didn't reach the pitch]
   │  ViewContent (>50%)
   ▼
Offer presented inside the workshop
   │
   ▼
Sales/checkout page ─────────► [Started checkout, abandoned → remarketing + WhatsApp recovery]
   │  InitiateCheckout
   ▼
Payment confirmed (webhook)
   │  Purchase
   ▼
Thank-you page → access unlocked → enters the post-purchase sequence
```

Every "exit" arrow in this funnel is a CRM stage (see `crm-e-leads.md`) and an automation trigger (see `workshop-automatizado.md` and `automacao-whatsapp.md`) — no one should leave this funnel without receiving at least one recovery attempt, except those who already bought.

---

*Every page above needs the real copy filled in before it becomes a design brief. Layout and visual system follow the principles in the project's `DESIGN.md`/`PRODUCT.md`, adapted for conversion pages (less editorial, more focus on a single CTA per page).*
