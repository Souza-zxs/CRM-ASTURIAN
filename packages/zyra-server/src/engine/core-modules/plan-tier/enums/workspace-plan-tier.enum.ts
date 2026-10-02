import { registerEnumType } from '@nestjs/graphql';

export enum WorkspacePlanTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
}

registerEnumType(WorkspacePlanTier, {
  name: 'WorkspacePlanTier',
  description: 'The plan tier gating a workspace feature access',
});
