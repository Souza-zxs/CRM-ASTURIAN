/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingProductKey {
  BASE_PRODUCT = 'BASE_PRODUCT',
  RESOURCE_CREDIT = 'RESOURCE_CREDIT',
  // À-la-carte module products (2026-10-03 redesign) — one Stripe product
  // per sellable PlanGatedFeature. Added here ahead of the real Stripe
  // products existing (operational step, tracked separately) so the
  // matching code in WorkspacePlanTierService is ready to pick them up.
  MODULE_WHATSAPP = 'MODULE_WHATSAPP',
  MODULE_INSTAGRAM = 'MODULE_INSTAGRAM',
  MODULE_AI_AGENT = 'MODULE_AI_AGENT',
  MODULE_VOICE_AGENT = 'MODULE_VOICE_AGENT',
  MODULE_WORKFLOWS_ADVANCED = 'MODULE_WORKFLOWS_ADVANCED',
  MODULE_CUSTOM_OBJECTS = 'MODULE_CUSTOM_OBJECTS',
  MODULE_CUSTOM_FIELDS = 'MODULE_CUSTOM_FIELDS',
  MODULE_ROW_LEVEL_PERMISSIONS = 'MODULE_ROW_LEVEL_PERMISSIONS',
  MODULE_API_ACCESS = 'MODULE_API_ACCESS',
  MODULE_MCP = 'MODULE_MCP',
}

registerEnumType(BillingProductKey, {
  name: 'BillingProductKey',
  description: 'The different billing products available',
});
