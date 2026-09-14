import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1789000000000)
export class AddWhatsappAgentEntitiesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."whatsappAgent" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "whatsappChannelId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "systemPrompt" text NOT NULL, "greetingMessage" text, "forbiddenPhrases" text, "qualificationCriteria" text, "handoffInstructions" text, "model" character varying NOT NULL DEFAULT \'gpt-4.1-mini\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9f1a2b3c4d5e6f7a8b9c0d1e2f3" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_WHATSAPP_AGENT_WHATSAPP_CHANNEL_ID" ON "core"."whatsappAgent" ("whatsappChannelId") ');
    await queryRunner.query('CREATE TABLE "core"."whatsappAgentConversation" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "whatsappAgentId" uuid NOT NULL, "contactPhoneNumber" character varying NOT NULL, "isAiEnabled" boolean NOT NULL DEFAULT true, "qualificationSummary" text, "lastMessageAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4a5b6c7d8e9f0a1b2c3d4e5f6a7" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_WHATSAPP_AGENT_CONVERSATION_AGENT_ID_CONTACT_PHONE_NUMBER" ON "core"."whatsappAgentConversation" ("whatsappAgentId", "contactPhoneNumber") ');
    await queryRunner.query('CREATE TYPE "core"."whatsappAgentMessage_direction_enum" AS ENUM(\'INBOUND\', \'OUTBOUND\')');
    await queryRunner.query('CREATE TABLE "core"."whatsappAgentMessage" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" uuid NOT NULL, "direction" "core"."whatsappAgentMessage_direction_enum" NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7c8d9e0f1a2b3c4d5e6f7a8b9c0" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_WHATSAPP_AGENT_MESSAGE_CONVERSATION_ID_CREATED_AT" ON "core"."whatsappAgentMessage" ("conversationId", "createdAt") ');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgent" ADD CONSTRAINT "FK_1a1a1a1a1a1a1a1a1a1a1a1a1a1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgent" ADD CONSTRAINT "FK_2b2b2b2b2b2b2b2b2b2b2b2b2b2" FOREIGN KEY ("whatsappChannelId") REFERENCES "core"."whatsappChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" ADD CONSTRAINT "FK_3c3c3c3c3c3c3c3c3c3c3c3c3c3" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" ADD CONSTRAINT "FK_4d4d4d4d4d4d4d4d4d4d4d4d4d4" FOREIGN KEY ("whatsappAgentId") REFERENCES "core"."whatsappAgent"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentMessage" ADD CONSTRAINT "FK_5e5e5e5e5e5e5e5e5e5e5e5e5e5" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentMessage" ADD CONSTRAINT "FK_6f6f6f6f6f6f6f6f6f6f6f6f6f6" FOREIGN KEY ("conversationId") REFERENCES "core"."whatsappAgentConversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentMessage" DROP CONSTRAINT "FK_6f6f6f6f6f6f6f6f6f6f6f6f6f6"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentMessage" DROP CONSTRAINT "FK_5e5e5e5e5e5e5e5e5e5e5e5e5e5"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" DROP CONSTRAINT "FK_4d4d4d4d4d4d4d4d4d4d4d4d4d4"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgentConversation" DROP CONSTRAINT "FK_3c3c3c3c3c3c3c3c3c3c3c3c3c3"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgent" DROP CONSTRAINT "FK_2b2b2b2b2b2b2b2b2b2b2b2b2b2"');
    await queryRunner.query('ALTER TABLE "core"."whatsappAgent" DROP CONSTRAINT "FK_1a1a1a1a1a1a1a1a1a1a1a1a1a1"');
    await queryRunner.query('DROP INDEX "core"."IDX_WHATSAPP_AGENT_MESSAGE_CONVERSATION_ID_CREATED_AT"');
    await queryRunner.query('DROP TABLE "core"."whatsappAgentMessage"');
    await queryRunner.query('DROP TYPE "core"."whatsappAgentMessage_direction_enum"');
    await queryRunner.query('DROP INDEX "core"."IDX_WHATSAPP_AGENT_CONVERSATION_AGENT_ID_CONTACT_PHONE_NUMBER"');
    await queryRunner.query('DROP TABLE "core"."whatsappAgentConversation"');
    await queryRunner.query('DROP INDEX "core"."IDX_WHATSAPP_AGENT_WHATSAPP_CHANNEL_ID"');
    await queryRunner.query('DROP TABLE "core"."whatsappAgent"');
  }
}
