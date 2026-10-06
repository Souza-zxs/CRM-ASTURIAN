# Paid Traffic Structure (Bonus)

A guide for structuring the paid campaigns that feed the workshop's sign-up funnel. Focused on Meta Ads (Instagram/Facebook), since it's the most common channel for this type of funnel — the principles apply to other platforms with some adjustments.

## 1. Campaign structure

**Recommended account structure** (CBO — Campaign Budget Optimization):

```
Campaign: [Offer] — Lead Acquisition
├── Set 1: Cold — Broad interests
├── Set 2: Cold — 1% Lookalike (buyers, if a base already exists)
├── Set 3: Cold — 1% Lookalike (leads/signups, if a base already exists)
└── Set 4: Cold — Advantage+ Audience (let Meta optimize with no interest restriction)

Campaign: [Offer] — Remarketing (warm funnel)
├── Set 1: Visited the signup page, didn't sign up (7 days)
├── Set 2: Signed up, didn't watch (3 days)
├── Set 3: Watched, didn't buy (7 days)
└── Set 4: Started checkout, didn't buy (3 days) — highest budget priority
```

- **Campaign objective**: Leads (optimized for the "Lead"/sign-up conversion event) for the cold campaign; Sales (optimized for the "Purchase" event) for remarketing, whenever there's enough data volume (from ~50 conversions/week the algorithm optimizes better for the final result than for leads).
- **Initial budget**: start with a fixed daily budget per ad set (not CBO) until you have data on which audience performs best; migrate to CBO/Advantage+ after identifying the 2-3 best-performing audiences.
- **Testing**: never put more than 1 new variable per test ad set (test either audience or creative, not both at the same time) — otherwise you won't be able to tell what worked.

## 2. Audience and remarketing setup

**Cold audiences** (people who've never heard of you):
- Interests related to the problem the workshop solves (not your niche — think "what does this person search on Google when they have this problem," not "who's interested in digital marketing").
- 1% lookalikes built from: buyers > sign-ups who watched >75% > all sign-ups, in that order of priority if you have more than one source.
- Advantage+ Audience as a separate ad set, always — it tends to outperform manual interests after ~1-2 weeks of learning.

**Remarketing audiences** (the segment that usually converts best, at a lower real cost):
- Pixel/Conversions API firing these events throughout the funnel (see section 4): `PageView` (sign-up page), `Lead` (confirmed sign-up), `ViewContent` (watched at least 50% of the workshop), `InitiateCheckout` (reached the offer/checkout page), `Purchase` (bought).
- Short remarketing windows (3-7 days) — someone who didn't convert within a week of a webinar funnel generally won't convert from a reminder, only from a new offer/trigger.
- **Mandatory exclusion**: exclude buyers from ALL active campaigns (cold and remarketing) — this avoids wasting budget showing ads to people who already bought.
- **Remarketing message sequence**: didn't sign up → reinforce the promise/social proof; signed up but didn't watch → reminder + content FOMO; watched but didn't buy → specific objection handling + proof of results + deadline urgency.

## 3. Creative strategy

- **Format**: native video (shot on a phone, not studio production) tends to convert better for info-product/workshop offers — it feels like content, not an ad.
- **Hook in the first 3 seconds**: without a strong visual/verbal hook at the start, nothing else in the creative matters. Test hooks like: a direct question about the pain point, a counter-intuitive statement, or a result shown up front ("before/after").
- **Creative angles to test** (run at least 3-4 different angles at a time, not just 1):
  1. Social proof/student results.
  2. Authority/behind-the-scenes of how you discovered the method.
  3. Myth-busting ("why [common solution] doesn't work").
  4. Direct, simple invitation to the free workshop (low friction, works well for cold broad-interest audiences).
- **Ad copy**: the first line has to work on its own (it's what shows before "see more") — repeat the video's hook there, don't introduce new information.
- **Refresh cadence**: monitor frequency (Ads Manager) — above 3-4 usually signals creative fatigue for the cold audience; refresh the creative, not just the audience.

## 4. Tracking and optimization for lead generation and sales

**Metrics by funnel stage** (track in this order, top to bottom — the bottleneck is usually at the first stage with a bad number):

| Stage | Metric | Initial benchmark* |
|---|---|---|
| Ad → Click | CTR (link click-through rate) | above 1% is already healthy for video |
| Click → Sign-up | Sign-up page conversion rate | 30-50% is a good page |
| Sign-up → Watched | Attendance rate (live/replay) | 20-40% is common for evergreen |
| Watched → Reached the offer | Retention through to the pitch | above 50% of those who watched >10min |
| Offer → Purchase | Checkout conversion rate | 1-3% of total sign-ups is a common market range |

*These numbers vary A LOT by niche/price/offer — treat them as a starting point for knowing where to investigate, not as a fixed target.

**Optimization routine**:
- **Daily** (first 7-14 days of a new campaign): CPL (cost per lead) per ad set, pause anything that's 2x+ above the average of the other ad sets.
- **Weekly**: CAC (customer acquisition cost = total spend ÷ sales) vs. the offer price — if CAC > 30-40% of the ticket price, revisit audience/creative before scaling budget.
- **When scaling**: increase the budget in increments of 20-30% every 2-3 days (don't double it all at once) — this avoids resetting the algorithm's learning.
- **Tracking required on the product side** (see `docs/estrategia/`, not solely the traffic manager's responsibility): Pixel + Conversions API (server-side) firing the 5 events from section 2 from the funnel pages and from the confirmed-payment webhook — without this, the ad algorithm's optimization is blind to what really matters (sales), not just clicks.

---

*This document assumes Meta Ads as the primary channel. For Google Ads/TikTok Ads, the funnel logic (cold → remarketing → buyer exclusion) stays the same, but the audience/creative formats change — ask for an adapted version when expanding to another channel.*
