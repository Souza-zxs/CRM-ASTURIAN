import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// MANYCHAT_LIKE and INTEGRATIONS were just re-gated from INSTAGRAM (general)
// to their own module keys (see
// docs/superpowers/specs/2026-10-03-manychat-like-and-integrations-design.md)
// — the underlying features (InstagramAutomationRuleEntity, WebhookEntity)
// already existed and already had real usage under the old gate. Same
// reasoning as 1803500000000-grandfather-workflows-advanced-by-usage: a
// workspace that already has rows here, regardless of its current plan
// tier, keeps access rather than losing something it was already using.
// Both tables are core-schema, so unlike the workflow backfill this doesn't
// need per-workspace-schema iteration — plain SQL is enough.
@RegisteredInstanceCommand('2.16.0', 1803600000000, { type: 'slow' })
export class GrandfatherManychatLikeAndIntegrationsByUsageSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      INSERT INTO "core"."workspaceModuleGrandfather" ("workspaceId", "module", "reason")
      SELECT DISTINCT "workspaceId", 'MANYCHAT_LIKE',
        'had Instagram automation rules configured before the module was split out from INSTAGRAM (2026-10-03)'
      FROM "core"."instagramAutomationRule"
      ON CONFLICT ("workspaceId", "module") DO NOTHING
    `);

    await dataSource.query(`
      INSERT INTO "core"."workspaceModuleGrandfather" ("workspaceId", "module", "reason")
      SELECT DISTINCT "workspaceId", 'INTEGRATIONS',
        'had webhooks configured before createWebhook was gated behind the INTEGRATIONS module (2026-10-03)'
      FROM "core"."webhook"
      ON CONFLICT ("workspaceId", "module") DO NOTHING
    `);
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
