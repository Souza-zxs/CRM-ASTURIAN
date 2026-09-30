import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

export enum PaymentProvider {
  HOTMART = 'HOTMART',
  KIWIFY = 'KIWIFY',
  STRIPE = 'STRIPE',
  GENERIC = 'GENERIC',
}

// One row per (workspace, platform) the workspace has connected — the
// Settings screen the spec calls for reads/writes this table to turn a
// platform on/off and to store the secret used to verify that platform's
// webhook signature. The secret is never stored in plaintext (see
// SecretEncryptionService); POST /payments/:workspaceId/:provider looks this
// row up to know whether/how to trust an incoming webhook.
@Entity({ name: 'paymentProviderConnection', schema: 'core' })
@Index(
  'IDX_PAYMENT_PROVIDER_CONNECTION_WORKSPACE_ID_PROVIDER',
  ['workspaceId', 'provider'],
  { unique: true },
)
export class PaymentProviderConnectionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentProvider, nullable: false })
  provider: PaymentProvider;

  @Column({ type: 'boolean', nullable: false, default: false })
  isEnabled: boolean;

  // enc:v2 envelope (SecretEncryptionService.encryptVersioned) — the shared
  // secret/token each adapter uses to verify that platform's signature.
  @Column({ type: 'text', nullable: true })
  encryptedSecret: EncryptedString | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
