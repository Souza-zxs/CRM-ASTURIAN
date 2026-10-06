// Mirrors PlanLimitKey on the backend
// (packages/zyra-server/src/engine/core-modules/plan-tier/constants/module-catalog.constant.ts),
// minus apiRateLimitPerMinute (a rate, not a cumulative usage count — see
// WorkspacePlanUsageService on the backend for why it's excluded there too).
export type PlanLimitUsageKey =
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
  | 'maxCustomFields';

export type PlanLimitUsage = {
  key: PlanLimitUsageKey;
  used: number;
  limit: number;
  __typename: 'PlanLimitUsage';
};
