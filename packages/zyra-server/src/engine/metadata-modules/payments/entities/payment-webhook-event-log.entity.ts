import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentProvider } from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Idempotency guard: a payment platform may redeliver the same webhook (e.g.
// after a timeout waiting for our 200). One row per (workspaceId, provider,
// externalId, type) that already ran to completion — a redelivery is a
// no-op instead of double-crediting a purchase or double-reverting a refund.
// type is part of the key (not just externalId) because a purchase and its
// later refund share the same externalId (the platform's transaction id)
// but are two distinct effects that must each run exactly once.
@Entity({ name: 'paymentWebhookEventLog', schema: 'core' })
@Index(
  'IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID_TYPE',
  ['workspaceId', 'provider', 'externalId', 'type'],
  { unique: true },
)
export class PaymentWebhookEventLogEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentProvider, nullable: false })
  provider: PaymentProvider;

  @Column({ type: 'varchar', nullable: false })
  externalId: string;

  @Column({ type: 'varchar', nullable: false })
  type: string;

  @Column({ type: 'timestamptz', nullable: true })
  succeededAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
