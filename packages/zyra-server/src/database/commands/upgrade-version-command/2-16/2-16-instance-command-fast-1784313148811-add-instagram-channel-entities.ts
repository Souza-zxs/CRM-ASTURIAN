import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1784313148811)
export class AddInstagramChannelEntitiesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."instagramChannel_syncstatus_enum" AS ENUM(\'NOT_SYNCED\', \'ONGOING\', \'ACTIVE\', \'FAILED_INSUFFICIENT_PERMISSIONS\', \'FAILED_UNKNOWN\')');
    await queryRunner.query('CREATE TABLE "core"."instagramChannel" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageChannelId" uuid NOT NULL, "connectedAccountId" uuid NOT NULL, "igBusinessAccountId" character varying NOT NULL, "username" character varying NOT NULL, "profilePictureUrl" character varying, "isSyncEnabled" boolean NOT NULL DEFAULT true, "syncStatus" "core"."instagramChannel_syncstatus_enum" NOT NULL DEFAULT \'NOT_SYNCED\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_404ab48c18c934d9574b6ab0664" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_INSTAGRAM_CHANNEL_WORKSPACE_ID_IG_BUSINESS_ACCOUNT_ID" ON "core"."instagramChannel" ("workspaceId", "igBusinessAccountId") ');
    await queryRunner.query('CREATE TABLE "core"."instagramAutomationRule" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "instagramChannelId" uuid NOT NULL, "igMediaId" character varying NOT NULL, "igMediaCaption" character varying, "igMediaThumbnailUrl" character varying, "igMediaPermalink" character varying, "keywords" text NOT NULL, "replyMessage" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bcf13f36ef383928eb44504ddce" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_INSTAGRAM_AUTOMATION_RULE_WORKSPACE_ID_IG_MEDIA_ID" ON "core"."instagramAutomationRule" ("workspaceId", "igMediaId") ');
    await queryRunner.query('CREATE TABLE "core"."instagramAutomationTriggerLog" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ruleId" uuid NOT NULL, "igCommentId" character varying NOT NULL, "triggeredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cd86e547c756a13d9d00c1f3cd6" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_INSTAGRAM_AUTOMATION_TRIGGER_LOG_WORKSPACE_ID_IG_COMMENT_ID" ON "core"."instagramAutomationTriggerLog" ("workspaceId", "igCommentId") ');
    await queryRunner.query('ALTER TYPE "core"."messageChannel_type_enum" RENAME TO "messageChannel_type_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_type_enum" AS ENUM(\'EMAIL\', \'SMS\', \'EMAIL_GROUP\', \'WHATSAPP\', \'INSTAGRAM\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum" USING "type"::"text"::"core"."messageChannel_type_enum"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum_old"');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" ADD CONSTRAINT "FK_d14568cce968fbb0161be6426ce" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" ADD CONSTRAINT "FK_db08530c652779a2b3a4154bbfa" FOREIGN KEY ("messageChannelId") REFERENCES "core"."messageChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" ADD CONSTRAINT "FK_7032171cbfd1efe4422764baa6f" FOREIGN KEY ("connectedAccountId") REFERENCES "core"."connectedAccount"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD CONSTRAINT "FK_5d5aa1673c1c4e33726a0767f83" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD CONSTRAINT "FK_ebe35f9d34475e4ab2bd0818175" FOREIGN KEY ("instagramChannelId") REFERENCES "core"."instagramChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationTriggerLog" ADD CONSTRAINT "FK_382a847f069d14c1ad575b54e8e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationTriggerLog" ADD CONSTRAINT "FK_dafc72999ddc2b7f3a177f4e40b" FOREIGN KEY ("ruleId") REFERENCES "core"."instagramAutomationRule"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationTriggerLog" DROP CONSTRAINT "FK_dafc72999ddc2b7f3a177f4e40b"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationTriggerLog" DROP CONSTRAINT "FK_382a847f069d14c1ad575b54e8e"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP CONSTRAINT "FK_ebe35f9d34475e4ab2bd0818175"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP CONSTRAINT "FK_5d5aa1673c1c4e33726a0767f83"');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" DROP CONSTRAINT "FK_7032171cbfd1efe4422764baa6f"');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" DROP CONSTRAINT "FK_db08530c652779a2b3a4154bbfa"');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" DROP CONSTRAINT "FK_d14568cce968fbb0161be6426ce"');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_type_enum_old" AS ENUM(\'EMAIL\', \'EMAIL_GROUP\', \'SMS\', \'WHATSAPP\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum_old" USING "type"::"text"::"core"."messageChannel_type_enum_old"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum"');
    await queryRunner.query('ALTER TYPE "core"."messageChannel_type_enum_old" RENAME TO "messageChannel_type_enum"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTAGRAM_AUTOMATION_TRIGGER_LOG_WORKSPACE_ID_IG_COMMENT_ID"');
    await queryRunner.query('DROP TABLE "core"."instagramAutomationTriggerLog"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTAGRAM_AUTOMATION_RULE_WORKSPACE_ID_IG_MEDIA_ID"');
    await queryRunner.query('DROP TABLE "core"."instagramAutomationRule"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTAGRAM_CHANNEL_WORKSPACE_ID_IG_BUSINESS_ACCOUNT_ID"');
    await queryRunner.query('DROP TABLE "core"."instagramChannel"');
    await queryRunner.query('DROP TYPE "core"."instagramChannel_syncstatus_enum"');
  }
}
