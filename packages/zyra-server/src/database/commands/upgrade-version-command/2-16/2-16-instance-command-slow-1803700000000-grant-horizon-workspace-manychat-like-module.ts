import { DataSource, QueryRunner } from 'typeorm';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// The one real production workspace on this instance ("Horizon"). Separate
// from 2-16-instance-command-slow-1803400000000-grant-horizon-workspace-all-modules.ts
// (which must not be edited, per project convention) because that command's
// IMPLEMENTED_MODULES list excluded MANYCHAT_LIKE on purpose — it wasn't
// implemented: true in module-catalog.constant.ts yet when that command was
// written. It is now (see docs/superpowers/specs/2026-10-03-manychat-like-and-integrations-design.md),
// so this follow-up command grants it the same way.
const HORIZON_WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';

@RegisteredInstanceCommand('2.16.0', 1803700000000, { type: 'slow' })
export class GrantHorizonWorkspaceManychatLikeModuleSlowInstanceCommand
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
      VALUES ($1, $2, 'explicit grant for the production workspace once MANYCHAT_LIKE became implemented — see docs/superpowers/specs/2026-10-05-paid-module-locked-nav-items-design.md')
      ON CONFLICT ("workspaceId", "module") DO NOTHING
      `,
      [HORIZON_WORKSPACE_ID, PlanGatedFeature.MANYCHAT_LIKE],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
