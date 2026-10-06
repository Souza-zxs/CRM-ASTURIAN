import { DataSource, QueryRunner } from 'typeorm';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Modules that existed (in spirit) under the old all-or-nothing PRO plan
// tier, so any workspace that was already PRO (active billing subscription
// or legacy workspacePlanGrandfather row) gets every one of them for free —
// preserving what they already paid for under the à-la-carte redesign. The
// two reserved-but-not-built modules (MANYCHAT_LIKE, INTEGRATIONS) are
// deliberately excluded: there is nothing to grant access to yet.
const MODULES_INCLUDED_IN_LEGACY_PRO = [
  PlanGatedFeature.WHATSAPP,
  PlanGatedFeature.INSTAGRAM,
  PlanGatedFeature.AI_AGENT,
  PlanGatedFeature.VOICE_AGENT,
  PlanGatedFeature.WORKFLOWS_ADVANCED,
  PlanGatedFeature.CUSTOM_OBJECTS,
  PlanGatedFeature.CUSTOM_FIELDS,
  PlanGatedFeature.ROW_LEVEL_PERMISSIONS,
  PlanGatedFeature.API_ACCESS,
  PlanGatedFeature.MCP,
];

@RegisteredInstanceCommand('2.16.0', 1803300000000, { type: 'slow' })
export class BackfillWorkspaceModuleGrandfatherSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `
      INSERT INTO "core"."workspaceModuleGrandfather" ("workspaceId", "module", "reason")
      SELECT w."id", modules."module",
        'migrated from legacy all-or-nothing PRO plan tier (2026-10-03 à-la-carte module redesign)'
      FROM "core"."workspace" w
      CROSS JOIN unnest($1::text[]) AS modules("module")
      WHERE EXISTS (
        SELECT 1 FROM "core"."billingSubscription" bs
        WHERE bs."workspaceId" = w."id"
          AND bs."status" IN ('trialing', 'active', 'past_due')
      ) OR EXISTS (
        SELECT 1 FROM "core"."workspacePlanGrandfather" g
        WHERE g."workspaceId" = w."id"
      )
      ON CONFLICT ("workspaceId", "module") DO NOTHING
      `,
      [MODULES_INCLUDED_IN_LEGACY_PRO],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
