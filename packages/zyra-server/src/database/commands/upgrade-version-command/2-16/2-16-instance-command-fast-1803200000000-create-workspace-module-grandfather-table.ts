import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1803200000000)
export class CreateWorkspaceModuleGrandfatherTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."workspaceModuleGrandfather" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "module" varchar NOT NULL,
        "reason" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_WORKSPACE_MODULE_GRANDFATHER" PRIMARY KEY ("id"),
        CONSTRAINT "IDX_WORKSPACE_MODULE_GRANDFATHER_WORKSPACE_ID_MODULE_UNIQUE" UNIQUE ("workspaceId", "module")
      )
    `);
    await queryRunner.query(
      'ALTER TABLE "core"."workspaceModuleGrandfather" ADD CONSTRAINT "FK_WORKSPACE_MODULE_GRANDFATHER_WORKSPACE_ID" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspaceModuleGrandfather" DROP CONSTRAINT "FK_WORKSPACE_MODULE_GRANDFATHER_WORKSPACE_ID"',
    );
    await queryRunner.query(
      `DROP TABLE "core"."workspaceModuleGrandfather"`,
    );
  }
}
