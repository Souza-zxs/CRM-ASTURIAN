import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1800000000000)
export class AddWhatsappAgentQualificationFieldsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" ADD "qualificationScore" integer');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" ADD "qualificationStage" character varying');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" ADD "qualificationIsQualified" boolean');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgent" ADD "knowledgeBase" text');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."whatsappAgent" DROP COLUMN "knowledgeBase"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" DROP COLUMN "qualificationIsQualified"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" DROP COLUMN "qualificationStage"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" DROP COLUMN "qualificationScore"');
  }
}
