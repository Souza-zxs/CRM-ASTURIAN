import { registerEnumType } from '@nestjs/graphql';

export enum PlanGatedFeature {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  AI_AGENT = 'AI_AGENT',
  VOICE_AGENT = 'VOICE_AGENT',
  WORKFLOWS_ADVANCED = 'WORKFLOWS_ADVANCED',
  CUSTOM_OBJECTS = 'CUSTOM_OBJECTS',
  CUSTOM_FIELDS = 'CUSTOM_FIELDS',
  ROW_LEVEL_PERMISSIONS = 'ROW_LEVEL_PERMISSIONS',
  API_ACCESS = 'API_ACCESS',
  MCP = 'MCP',
  // Reserved for a future dedicated spec — not built yet. See
  // docs/superpowers/specs/2026-10-03-saas-plan-tiers-design.md.
  MANYCHAT_LIKE = 'MANYCHAT_LIKE',
  INTEGRATIONS = 'INTEGRATIONS',
}

registerEnumType(PlanGatedFeature, {
  name: 'PlanGatedFeature',
  description: 'An à-la-carte paid module a workspace can contract',
});
