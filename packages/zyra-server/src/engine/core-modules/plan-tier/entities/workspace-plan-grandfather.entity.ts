import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'workspacePlanGrandfather', schema: 'core' })
@Unique('IDX_WORKSPACE_PLAN_GRANDFATHER_WORKSPACE_ID_UNIQUE', ['workspaceId'])
export class WorkspacePlanGrandfatherEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
