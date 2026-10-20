import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1804100000000)
export class ReorderPaymentWebhookEventLogUniqueIndexFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID_TYPE" ON "core"."paymentWebhookEventLog" ("workspaceId", "provider", "externalId", "type") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID_TYPE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_PAYMENT_WEBHOOK_EVENT_LOG_WORKSPACE_ID_PROVIDER_EXTERNAL_ID" ON "core"."paymentWebhookEventLog" ("externalId", "provider", "type", "workspaceId") ',
    );
  }
}
