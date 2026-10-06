import { DataSource, QueryRunner } from 'typeorm';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// The one real production workspace on this instance ("Horizon" — see
// docs/superpowers/specs/2026-10-03-saas-plan-tiers-design.md, used as the
// WORKSPACE_ID fixture across several test files, e.g.
// send-whatsapp-template.workflow-action.spec.ts). Explicit grant, not left
// to the general legacy-PRO backfill (1803300000000): its real Stripe
// subscription/billing status at the moment this runs is unconfirmed (open
// question in the spec), and this workspace must not lose access to
// anything regardless of what that status turns out to be. Only grants
// modules that are actually implemented today — MANYCHAT_LIKE and
// INTEGRATIONS are deliberately excluded, same reasoning as 1803300000000.
const HORIZON_WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';

const IMPLEMENTED_MODULES = [
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

@RegisteredInstanceCommand('2.16.0', 1803400000000, { type: 'slow' })
export class GrantHorizonWorkspaceAllModulesSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const workspaceExists = await dataSource.query(
      `SELECT 1 FROM "core"."workspace" WHERE "id" = $1`,
      [HORIZON_WORKSPACE_ID],
    );

    if (workspaceExists.length === 0) {
      // Safe no-op on any environment that doesn't have this workspace
      // (e.g. a fresh local/dev database) — this command exists for one
      // specific production workspace only.
      return;
    }

    await dataSource.query(
      `
      INSERT INTO "core"."workspaceModuleGrandfather" ("workspaceId", "module", "reason")
      SELECT $1, modules."module", 'explicit grant for the production workspace during the 2026-10-03 à-la-carte module redesign — see spec for details'
      FROM unnest($2::text[]) AS modules("module")
      ON CONFLICT ("workspaceId", "module") DO NOTHING
      `,
      [HORIZON_WORKSPACE_ID, IMPLEMENTED_MODULES],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
