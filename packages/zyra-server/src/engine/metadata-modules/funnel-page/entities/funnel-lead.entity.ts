import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

import { FunnelPageEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-page.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Append-only capture record for a lead submitted through a public funnel
// page form (signup, purchase intent, etc). Never updated after insert.
@Entity({ name: 'funnelLead', schema: 'core' })
export class FunnelLeadEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  funnelPageId: string;

  @ManyToOne(() => FunnelPageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'funnelPageId' })
  funnelPage: Relation<FunnelPageEntity>;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  whatsapp: string;

  @Column({ type: 'varchar', nullable: true })
  utmSource: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmMedium: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmCampaign: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
