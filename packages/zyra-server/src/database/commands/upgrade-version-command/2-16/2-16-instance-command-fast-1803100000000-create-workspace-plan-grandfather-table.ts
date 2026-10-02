import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1803100000000)
export class CreateWorkspacePlanGrandfatherTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."workspacePlanGrandfather" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "reason" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_WORKSPACE_PLAN_GRANDFATHER" PRIMARY KEY ("id"),
        CONSTRAINT "IDX_WORKSPACE_PLAN_GRANDFATHER_WORKSPACE_ID_UNIQUE" UNIQUE ("workspaceId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."workspacePlanGrandfather"`);
  }
}
