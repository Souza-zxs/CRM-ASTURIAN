// Mirrors PlanGatedFeature on the backend
// (packages/zyra-server/src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum.ts).
// Kept as a hand-written string union here (not generated) — see
// WorkspaceModuleEntitlementDTO on the backend for the source of truth.
export type WorkspaceModule =
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'AI_AGENT'
  | 'VOICE_AGENT'
  | 'WORKFLOWS_ADVANCED'
  | 'CUSTOM_OBJECTS'
  | 'CUSTOM_FIELDS'
  | 'ROW_LEVEL_PERMISSIONS'
  | 'API_ACCESS'
  | 'MCP'
  | 'MANYCHAT_LIKE'
  | 'INTEGRATIONS';

export type WorkspaceModuleEntitlement = {
  module: WorkspaceModule;
  quantity: number;
  hasAccess: boolean;
  implemented: boolean;
  __typename: 'WorkspaceModuleEntitlement';
};
