# Demo Readiness — Design

## Problem

Login is currently broken in production: the VPS backend (`zyra-api.179-199-135-212.sslip.io`)
serves a GraphQL schema missing core mutations that exist in the committed code (confirmed via
direct probe: `getLoginTokenFromCredentials` returns `Cannot query field ... on type Mutation`,
same symptom previously observed for `renewToken`). No one can sign in to either Vercel deploy
right now. A demo to the project owner is scheduled for tomorrow (2026-09-24). The user also asked
for two related but lower-urgency items: fluid/responsive landing page on mobile, and progress on
the previously-drafted WhatsApp templates + funnel pages plan (`docs/superpowers/plans/` /
the earlier `mossy-roaming-cake.md` plan file).

Constraint that shapes everything below: the VPS is only reachable through the user's own
terminal (no direct SSH access has been granted, and the user prefers not to share credentials).
Any backend-side fix must therefore be a single self-contained script the user runs once, not a
multi-step back-and-forth.

## Scope

### Phase 1 — Critical: restore login (must work for the demo)
One idempotent shell script (`scripts/vps-recover.sh`, run manually by the user on the VPS) that:
1. Diagnoses: `pm2 list`/`pm2 describe zyra-server`, checks for a process still bound to :3002
   outside pm2's tracking (`ss -tlnp`), checks recent non-Redis errors in the logs.
2. Forces a clean restart: `pm2 delete zyra-server zyra-worker`, kills anything still on :3002,
   confirms the port is free before restarting.
3. Rebuilds from a guaranteed-clean state: `git pull` (handling the `package-lock.json` conflict
   the same way as before), the Linux native-binding workaround
   (`@rolldown/binding-linux-x64-gnu` etc.), `npx nx reset`, `npx nx run zyra-server:build`.
4. Restarts both processes via `pm2 start ... && pm2 save` so the fix survives a VPS reboot.
5. Self-verifies: probes `getLoginTokenFromCredentials` locally (`curl 127.0.0.1:3002/graphql`)
   and prints a clear `PASS`/`FAIL` line — the user only needs to paste back that final line, not
   the whole transcript.

After the user confirms PASS, verify end-to-end from our side: sign in against
`workshop-os-app.vercel.app`, confirm a few core CRM pages load (People, Companies,
Opportunities) with real GraphQL data, not just that the login mutation exists.

### Phase 2 — Landing page fluidity + mobile
Fix the three concrete issues already diagnosed in `packages/zyra-website`, worst first:
1. `app-preview/stage/AppWindow.tsx` — `recalcLayout` hardcodes `INITIAL_MAX_WIDTH` (1040px)
   instead of clamping to the parent's actual width, so phones render a 1040×676 DOM subtree
   mostly off-screen. Add a mobile-aware sizing path (mirror the pattern already used by
   `terminal-window-geometry.ts`'s `isMobileBounds`), and stop the `ResizeObserver` from
   re-triggering a full re-render on the viewport-height churn Mobile Safari produces while
   scrolling.
2. `app-preview/product-visual/use-product-visual-autoplay.ts` and
   `use-product-hero-cursor-autoplay.ts` — both drive `setState` on unthrottled timers (one every
   20ms) with no visibility gating, unlike every WebGL scene in `platform/visuals` (which already
   pause via `IntersectionObserver`/`document.hidden`). Gate both behind the same
   `observeElementVisibility` pattern so they stop running once scrolled out of view.
3. `platform/visuals` halftone scenes (`FooterBackdrop.tsx`, `FaqBackdrop.tsx`,
   `HeroVisualScroll.tsx`'s `ProductBackdrop`) render full-fidelity WebGL shaders on mobile with
   no lower-power tier. Add a mobile/low-power check to `use-webgl-gate.ts` (viewport width or
   `navigator.hardwareConcurrency`-based) that lowers halftone resolution or skips the backdrop
   below a breakpoint.

Deploy to the existing `workshop-os` Vercel project (no new project — that's exactly what we
cleaned up today). Verify by checking bundle output and manually reasoning through the changed
code paths; no live device lab available, so this is code-level verification, not a device farm.

### Phase 3a — Funnel pages backend (ship complete, not a skeleton)
The frontend for this already exists in full (`packages/asturian-front/src/modules/funnel/`,
`pages/funnel/FunnelPage.tsx`, `pages/settings/funnel/SettingsFunnel.tsx`) and defines the exact
contract the backend must satisfy — no guesswork:

- Entity `FunnelPageEntity` (`packages/zyra-server/src/engine/metadata-modules/funnel-page/`,
  mirroring `whatsapp-channel.entity.ts`'s plain-TypeORM pattern): `id`, `type` (`SIGNUP` |
  `WORKSHOP` | `SALES` | `CONFIRMATION`), `slug` (unique per workspace), `status` (`DRAFT` |
  `PUBLISHED`), `content` (jsonb, shape below), `seoTitle`, `seoDescription`, timestamps.
- `content` jsonb must match `packages/asturian-front/src/modules/funnel/types/FunnelPage.ts`
  exactly — note this now includes `checkoutUrl` on the SALES variant, which the original plan
  draft didn't have.
- Authenticated resolver: `funnelPages`, `funnelPage(id)`, `createFunnelPage`, `updateFunnelPage`,
  `publishFunnelPage`, `unpublishFunnelPage`, `deleteFunnelPage` — field names taken directly from
  `funnelPageMutations.ts`/`getFunnelPages.ts` (already committed on the frontend).
  `CreateFunnelPageInput`/`UpdateFunnelPageInput` DTOs to match.
- Public REST controller (no auth, same shape as `whatsapp-webhooks.controller.ts`):
  `GET /funnel/:workspaceId/:slug` → 200 with `{id, type, content, seoTitle, seoDescription}` if
  `PUBLISHED`, 404 otherwise (matches `fetch-funnel-page.ts` exactly, including the null-on-404
  contract). `POST /funnel/:workspaceId/leads` → creates a `FunnelLeadEntity` row (`name`, `email`,
  `whatsapp`, `funnelPageId`, `utmSource/Medium/Campaign`, `createdAt`) from the exact body shape
  `submit-funnel-lead.ts` sends.
- Generate the instance command migration for both new entities.
- Determine the real workspace ID once login is restored (Phase 1) — either via the Postgres MCP
  if it has reconnected by then, or by querying `currentWorkspace { id }` over GraphQL after
  signing in — then set `REACT_APP_FUNNEL_WORKSPACE_ID` on the `workshop-os-app` Vercel project
  (currently unset — confirmed via `vercel env ls`) and create at least one `PUBLISHED`
  `FunnelPageEntity` row so `/w/:slug` is demoable. This step is therefore sequenced after Phase 1
  confirms login works, not fully parallel with it.

No new Vercel project, no new package — the frontend already made the simpler choice of routing
this inside the existing `asturian-front` app.

### Phase 3b — WhatsApp templates (explicit skeleton, not full feature)
Deliberately scoped down from the original plan given no Meta API credentials can be safely tested
today:
- `WhatsappTemplateEntity` (mirrors `whatsapp-channel.entity.ts`): `whatsappChannelId`, `name`,
  `category`, `language`, `headerText`, `bodyText`, `footerText`, `buttons` (jsonb), `status`
  (`DRAFT` | `PENDING` | `APPROVED` | `REJECTED`), `metaTemplateId`, `metaTemplateStatus`,
  `rejectionReason`.
- CRUD-only resolver/service (`create`/`update`/`delete`/list), no calls to the Meta Graph API.
- Minimal Settings UI: list + create/edit form (name, category, language, header/body/footer,
  buttons repeater). The "Send for approval" action is visible but disabled with a "coming soon"
  tooltip — explicitly not wired to Meta.
- Out of scope today: `WhatsappGraphApiService` extensions (`createMessageTemplate`,
  `sendTemplateMessage`, status polling) — these need real WABA credentials to verify and are
  deferred to a follow-up cycle.

## Non-goals (today)

- Real Meta Graph API template sync/approval.
- A separate `zyra-funnel` Vercel project (superseded by the frontend's existing in-app routing
  choice).
- Mobile device-lab testing of the landing page fixes (code-level fix + reasoning only).
- Anything from `docs/superpowers/plans/mossy-roaming-cake.md` beyond what's listed in 3a/3b.

## Testing / validation plan

- Backend (funnel + whatsapp-template): `npx jest <file> --config=packages/zyra-server/jest.config.mjs`
  for the new services (mock repository) and resolvers; `npx nx typecheck zyra-server`;
  `npx nx lint:diff-with-main zyra-server`.
- Frontend: `npx nx run asturian-front:graphql:generate` after the schema changes land, then
  `npx nx typecheck asturian-front`.
- End-to-end manual pass (us, not a device lab): sign in on `workshop-os-app.vercel.app`, browse
  People/Companies/Opportunities, open Settings → Funil and create+publish a SIGNUP page, open
  `/w/<slug>` in a fresh tab and submit the lead form, confirm a `FunnelLeadEntity` row exists
  (Postgres MCP if it reconnects, otherwise a log/curl check). Open Settings → WhatsApp →
  Templates, create a draft template, confirm "Send for approval" is visibly disabled.
- Landing page: rebuild `zyra-website` locally, inspect the built bundle for the changed files,
  and reason through the mobile breakpoint behavior directly in code (no live device available).

## Execution ordering

Phase 1 is the hard blocker and starts first — the recovery script gets handed to the user
immediately, in parallel with everything else, since it just needs to run once. While that's
in flight: Phase 2 (website) and Phase 3a (funnel backend) are independent of each other and of
Phase 1, so they run as parallel workstreams. Phase 3b (WhatsApp skeleton) starts after 3a's
entity/resolver pattern is in place (mirrors it directly, so going second avoids duplicated
pattern-setting work). Final end-to-end verification waits on Phase 1's PASS confirmation from the
user, since nothing is demoable without login working.
