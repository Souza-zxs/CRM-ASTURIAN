import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// One row per (workspace, module) the workspace has free/legacy access to,
// independent of billing — either migrated from the old all-or-nothing
// workspacePlanGrandfather table (see the 2026-10-03 à-la-carte module
// redesign) or a manual support/courtesy grant.
@Entity({ name: 'workspaceModuleGrandfather', schema: 'core' })
@Unique('IDX_WORKSPACE_MODULE_GRANDFATHER_WORKSPACE_ID_MODULE_UNIQUE', [
  'workspaceId',
  'module',
])
export class WorkspaceModuleGrandfatherEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  module: PlanGatedFeature;

  @Column({ nullable: false, type: 'text' })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
