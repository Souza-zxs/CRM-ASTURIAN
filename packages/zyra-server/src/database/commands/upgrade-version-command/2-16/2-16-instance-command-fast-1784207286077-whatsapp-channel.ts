import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1784207286077)
export class WhatsappChannelFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."whatsappChannel_syncstatus_enum" AS ENUM(\'NOT_SYNCED\', \'ONGOING\', \'ACTIVE\', \'FAILED_INSUFFICIENT_PERMISSIONS\', \'FAILED_UNKNOWN\')');
    await queryRunner.query('CREATE TABLE "core"."whatsappChannel" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageChannelId" uuid NOT NULL, "connectedAccountId" uuid NOT NULL, "phoneNumberId" character varying NOT NULL, "wabaId" character varying NOT NULL, "displayPhoneNumber" character varying NOT NULL, "isSyncEnabled" boolean NOT NULL DEFAULT true, "syncStatus" "core"."whatsappChannel_syncstatus_enum" NOT NULL DEFAULT \'NOT_SYNCED\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8ac7fad837587cdfdd55393cb6e" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_WHATSAPP_CHANNEL_WORKSPACE_ID_PHONE_NUMBER_ID" ON "core"."whatsappChannel" ("workspaceId", "phoneNumberId") ');
    await queryRunner.query('ALTER TYPE "core"."messageChannel_type_enum" RENAME TO "messageChannel_type_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_type_enum" AS ENUM(\'EMAIL\', \'SMS\', \'EMAIL_GROUP\', \'WHATSAPP\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum" USING "type"::"text"::"core"."messageChannel_type_enum"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum_old"');
    await queryRunner.query('ALTER TABLE "core"."whatsappChannel" ADD CONSTRAINT "FK_e608875df00963dbce6995ee881" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappChannel" ADD CONSTRAINT "FK_aafb2e39fb128527b7b62724d14" FOREIGN KEY ("messageChannelId") REFERENCES "core"."messageChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappChannel" ADD CONSTRAINT "FK_5695c8f4acb243292568231ee15" FOREIGN KEY ("connectedAccountId") REFERENCES "core"."connectedAccount"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."whatsappChannel" DROP CONSTRAINT "FK_5695c8f4acb243292568231ee15"');
    await queryRunner.query('ALTER TABLE "core"."whatsappChannel" DROP CONSTRAINT "FK_aafb2e39fb128527b7b62724d14"');
    await queryRunner.query('ALTER TABLE "core"."whatsappChannel" DROP CONSTRAINT "FK_e608875df00963dbce6995ee881"');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_type_enum_old" AS ENUM(\'EMAIL\', \'EMAIL_GROUP\', \'SMS\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum_old" USING "type"::"text"::"core"."messageChannel_type_enum_old"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum"');
    await queryRunner.query('ALTER TYPE "core"."messageChannel_type_enum_old" RENAME TO "messageChannel_type_enum"');
    await queryRunner.query('DROP INDEX "core"."IDX_WHATSAPP_CHANNEL_WORKSPACE_ID_PHONE_NUMBER_ID"');
    await queryRunner.query('DROP TABLE "core"."whatsappChannel"');
    await queryRunner.query('DROP TYPE "core"."whatsappChannel_syncstatus_enum"');
  }
}
