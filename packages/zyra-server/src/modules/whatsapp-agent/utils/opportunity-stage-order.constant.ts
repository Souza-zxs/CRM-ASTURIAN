// Mirrors the `stage` SELECT field seeded on every workspace's Opportunity
// object (compute-opportunity-standard-flat-field-metadata.util.ts) — same
// values, in pipeline order. CUSTOMER is deliberately last and excluded from
// OPPORTUNITY_STAGE_VALUES_ASSIGNABLE_BY_AI: only a real purchase webhook
// (spec Part B) may move an Opportunity to CUSTOMER, never the WhatsApp
// agent's own guess.
export const OPPORTUNITY_STAGE_ORDER = [
  'NEW',
  'SCREENING',
  'MEETING',
  'PROPOSAL',
  'CUSTOMER',
] as const;

export const OPPORTUNITY_STAGE_VALUES_ASSIGNABLE_BY_AI =
  OPPORTUNITY_STAGE_ORDER.filter((stage) => stage !== 'CUSTOMER');
