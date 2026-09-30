import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1801000000000)
export class CreatePaymentsTablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."paymentProviderConnection_provider_enum" AS ENUM(\'HOTMART\', \'KIWIFY\', \'STRIPE\', \'GENERIC\')');
    await queryRunner.query('CREATE TABLE "core"."paymentProviderConnection" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "core"."paymentProviderConnection_provider_enum" NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "encryptedSecret" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5c26a1b83b2e4f7ca0f5e2a0c5d1" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_PAYMENT_PROVIDER_CONNECTION_WORKSPACE_ID_PROVIDER" ON "core"."paymentProviderConnection" ("workspaceId", "provider") ');
    await queryRunner.query('ALTER TABLE "core"."paymentProviderConnection" ADD CONSTRAINT "FK_7a1c9e2b6d4f4a3a9c1e8b7d6f5a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');

    await queryRunner.query('CREATE TYPE "core"."paymentWebhookEventLog_provider_enum" AS ENUM(\'HOTMART\', \'KIWIFY\', \'STRIPE\', \'GENERIC\')');
    await queryRunner.query('CREATE TABLE "core"."paymentWebhookEventLog" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "core"."paymentWebhookEventLog_provider_enum" NOT NULL, "externalId" character varying NOT NULL, "type" character varying NOT NULL, "succeededAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8f3b2d1a7c6e4b5a9d0c2e1f4a3b" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID_TYPE" ON "core"."paymentWebhookEventLog" ("workspaceId", "provider", "externalId", "type") ');
    await queryRunner.query('ALTER TABLE "core"."paymentWebhookEventLog" ADD CONSTRAINT "FK_2b4d6f8a1c3e5b7d9f0a2c4e6b8d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."paymentWebhookEventLog" DROP CONSTRAINT "FK_2b4d6f8a1c3e5b7d9f0a2c4e6b8d"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID_TYPE"');
    await queryRunner.query('DROP TABLE "core"."paymentWebhookEventLog"');
    await queryRunner.query('DROP TYPE "core"."paymentWebhookEventLog_provider_enum"');

    await queryRunner.query('ALTER TABLE "core"."paymentProviderConnection" DROP CONSTRAINT "FK_7a1c9e2b6d4f4a3a9c1e8b7d6f5a"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAYMENT_PROVIDER_CONNECTION_WORKSPACE_ID_PROVIDER"');
    await queryRunner.query('DROP TABLE "core"."paymentProviderConnection"');
    await queryRunner.query('DROP TYPE "core"."paymentProviderConnection_provider_enum"');
  }
}
