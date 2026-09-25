import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The funnelPage / funnelLead entities shipped without a migration, so the
// tables never existed on databases built from migrations alone. Constraint
// names follow TypeORM's naming strategy so a later migrate:generate sees no
// difference between these tables and the entities.
@RegisteredInstanceCommand('2.16.0', 1791000000000)
export class CreateFunnelTablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."funnelPage_type_enum" AS ENUM(\'SIGNUP\', \'WORKSHOP\', \'SALES\', \'CONFIRMATION\')');
    await queryRunner.query('CREATE TYPE "core"."funnelPage_status_enum" AS ENUM(\'DRAFT\', \'PUBLISHED\')');
    await queryRunner.query('CREATE TABLE "core"."funnelPage" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "core"."funnelPage_type_enum" NOT NULL, "slug" character varying NOT NULL, "status" "core"."funnelPage_status_enum" NOT NULL DEFAULT \'DRAFT\', "content" jsonb NOT NULL, "seoTitle" character varying, "seoDescription" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_09dd4039f8d406a33fd7181f0e2" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_FUNNEL_PAGE_WORKSPACE_ID_SLUG" ON "core"."funnelPage" ("workspaceId", "slug") ');
    await queryRunner.query('CREATE TABLE "core"."funnelLead" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "funnelPageId" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "whatsapp" character varying NOT NULL, "utmSource" character varying, "utmMedium" character varying, "utmCampaign" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b6c595a5fa92c27b91359c464ed" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "core"."funnelPage" ADD CONSTRAINT "FK_4ff05416c68957116599530da7a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."funnelLead" ADD CONSTRAINT "FK_a98c6acd54c5f82898e16aba114" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."funnelLead" ADD CONSTRAINT "FK_a07060340d8b9901b34595df870" FOREIGN KEY ("funnelPageId") REFERENCES "core"."funnelPage"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."funnelLead" DROP CONSTRAINT "FK_a07060340d8b9901b34595df870"');
    await queryRunner.query('ALTER TABLE "core"."funnelLead" DROP CONSTRAINT "FK_a98c6acd54c5f82898e16aba114"');
    await queryRunner.query('ALTER TABLE "core"."funnelPage" DROP CONSTRAINT "FK_4ff05416c68957116599530da7a"');
    await queryRunner.query('DROP TABLE "core"."funnelLead"');
    await queryRunner.query('DROP INDEX "core"."IDX_FUNNEL_PAGE_WORKSPACE_ID_SLUG"');
    await queryRunner.query('DROP TABLE "core"."funnelPage"');
    await queryRunner.query('DROP TYPE "core"."funnelPage_status_enum"');
    await queryRunner.query('DROP TYPE "core"."funnelPage_type_enum"');
  }
}
