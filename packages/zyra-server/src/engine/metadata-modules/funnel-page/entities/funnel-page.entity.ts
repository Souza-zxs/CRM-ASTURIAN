import { registerEnumType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  type FunnelPageContent,
  FunnelPageStatus,
  FunnelPageType,
} from 'zyra-shared/types';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(FunnelPageType, {
  name: 'FunnelPageType',
});

registerEnumType(FunnelPageStatus, {
  name: 'FunnelPageStatus',
});

// Editable, publishable landing page for the workshop marketing funnel
// (signup / workshop / sales / confirmation). `content` is a per-type
// discriminated union (see FunnelPageContent in zyra-shared) stored as
// jsonb — the front-end editor and the public funnel controller are both
// responsible for shaping it according to `type`.
@Entity({ name: 'funnelPage', schema: 'core' })
@Index('IDX_FUNNEL_PAGE_WORKSPACE_ID_SLUG', ['workspaceId', 'slug'], {
  unique: true,
})
export class FunnelPageEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FunnelPageType, nullable: false })
  type: FunnelPageType;

  // URL segment identifying the page within a workspace, e.g. "inscricao"
  // in /funnel/:workspaceId/inscricao — unique per workspace, not globally.
  @Column({ type: 'varchar', nullable: false })
  slug: string;

  @Column({
    type: 'enum',
    enum: FunnelPageStatus,
    nullable: false,
    default: FunnelPageStatus.DRAFT,
  })
  status: FunnelPageStatus;

  @Column({ type: 'jsonb', nullable: false })
  content: FunnelPageContent;

  @Column({ type: 'varchar', nullable: true })
  seoTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoDescription: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
