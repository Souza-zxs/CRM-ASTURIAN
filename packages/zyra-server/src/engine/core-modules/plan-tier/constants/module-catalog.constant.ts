import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';

// Numeric limit keys. A key missing from BASE_PLAN_LIMITS or a module's
// includedLimits contributes 0 — there is no "unlimited" sentinel yet
// because no module in this catalog offers it; PlanLimitService.resolveLimit
// sums whatever's present, so adding one later is additive, not a rewrite.
export type PlanLimitKey =
  | 'maxUsers'
  | 'maxContacts'
  | 'maxCompanies'
  | 'maxDashboards'
  | 'maxWorkflowsActive'
  | 'maxWorkflowExecutionsMonthly'
  | 'maxWhatsAppNumbers'
  | 'maxAIAgents'
  | 'maxAIMessagesMonthly'
  | 'maxVoiceAgents'
  | 'maxVoiceMinutesMonthly'
  | 'maxCustomObjects'
  | 'maxCustomFields'
  | 'apiRateLimitPerMinute';

// Applies to every workspace with an active base subscription, regardless of
// which modules (if any) are additionally contracted. "alguns workflows mais
// fáceis" from the base plan copy is represented purely as a small numeric
// allowance — there is no separate "easy" vs "advanced" workflow engine.
export const BASE_PLAN_LIMITS: Partial<Record<PlanLimitKey, number>> = {
  maxUsers: 5,
  maxContacts: 2_000,
  maxCompanies: 1_000,
  maxDashboards: 3,
  maxWorkflowsActive: 2,
  maxWorkflowExecutionsMonthly: 200,
};

export type ModuleDefinition = {
  // Limits ADDED on top of BASE_PLAN_LIMITS (and any other contracted
  // module's limits) while this module is active, multiplied by the
  // contracted quantity (Stripe subscription item quantity). Empty object =
  // purely binary module (access on/off, no numeric dimension).
  includedLimits: Partial<Record<PlanLimitKey, number>>;
  // false = reserved in the catalog (sellable/visible) but the underlying
  // feature doesn't exist in the product yet. hasModule() still resolves
  // normally (so billing/entitlement wiring can be tested end-to-end), but
  // callers that gate real functionality must also check this flag and
  // return a "coming soon" response rather than real access.
  implemented: boolean;
};

export const MODULE_CATALOG: Record<PlanGatedFeature, ModuleDefinition> = {
  [PlanGatedFeature.WHATSAPP]: {
    includedLimits: { maxWhatsAppNumbers: 1 },
    implemented: true,
  },
  [PlanGatedFeature.INSTAGRAM]: {
    includedLimits: {},
    implemented: true,
  },
  [PlanGatedFeature.AI_AGENT]: {
    includedLimits: { maxAIAgents: 1, maxAIMessagesMonthly: 1_000 },
    implemented: true,
  },
  [PlanGatedFeature.VOICE_AGENT]: {
    includedLimits: { maxVoiceAgents: 1, maxVoiceMinutesMonthly: 500 },
    implemented: true,
  },
  [PlanGatedFeature.WORKFLOWS_ADVANCED]: {
    includedLimits: {
      maxWorkflowsActive: 20,
      maxWorkflowExecutionsMonthly: 5_000,
    },
    implemented: true,
  },
  [PlanGatedFeature.CUSTOM_OBJECTS]: {
    includedLimits: { maxCustomObjects: 5 },
    implemented: true,
  },
  [PlanGatedFeature.CUSTOM_FIELDS]: {
    includedLimits: { maxCustomFields: 20 },
    implemented: true,
  },
  [PlanGatedFeature.ROW_LEVEL_PERMISSIONS]: {
    includedLimits: {},
    implemented: true,
  },
  [PlanGatedFeature.API_ACCESS]: {
    includedLimits: { apiRateLimitPerMinute: 120 },
    implemented: true,
  },
  [PlanGatedFeature.MCP]: {
    includedLimits: {},
    implemented: true,
  },
  [PlanGatedFeature.MANYCHAT_LIKE]: {
    // Turns out this already exists, just under a different name:
    // Instagram comment-keyword → private DM automation
    // (InstagramAutomationRuleEntity), with public-reply variations, a
    // follow gate, delayed follow-up DMs, "attach to next Reel" campaigns,
    // and CSV import. Found 2026-10-03 while researching the user's
    // reference repo (github.com/diwenne/openreply) — see
    // docs/superpowers/specs/2026-10-03-manychat-like-and-integrations-design.md.
    // Re-gated from the general INSTAGRAM module to this one, since it's a
    // distinct sellable capability, not basic channel connectivity.
    includedLimits: {},
    implemented: true,
  },
  [PlanGatedFeature.INTEGRATIONS]: {
    // Outbound webhook subscriptions (WebhookEntity/WebhookResolver) already
    // exist and are a legitimate "connect to other platforms" capability —
    // gated here instead of building a new integrations framework from
    // scratch. See the same spec referenced above.
    includedLimits: {},
    implemented: true,
  },
};
