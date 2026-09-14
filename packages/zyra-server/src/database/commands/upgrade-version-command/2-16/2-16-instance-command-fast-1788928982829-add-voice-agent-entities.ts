import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1788928982829)
export class AddVoiceAgentEntitiesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."voiceAgent" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "phoneNumber" character varying, "voice" character varying NOT NULL DEFAULT \'alloy\', "systemPrompt" text NOT NULL, "greetingMessage" text, "forbiddenPhrases" text, "qualificationCriteria" text, "handoffInstructions" text, "transferPhoneNumber" character varying, "weeklyAvailability" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_bfc0be915ce99ded017f0d69cb7" UNIQUE ("phoneNumber"), CONSTRAINT "PK_c261fe25f398d809bbfd8d20368" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TYPE "core"."voiceCall_direction_enum" AS ENUM(\'INBOUND\', \'OUTBOUND\')');
    await queryRunner.query('CREATE TYPE "core"."voiceCall_status_enum" AS ENUM(\'IN_PROGRESS\', \'COMPLETED\', \'FAILED\', \'NO_ANSWER\')');
    await queryRunner.query('CREATE TABLE "core"."voiceCall" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "voiceAgentId" uuid NOT NULL, "twilioCallSid" character varying NOT NULL, "direction" "core"."voiceCall_direction_enum" NOT NULL, "status" "core"."voiceCall_status_enum" NOT NULL DEFAULT \'IN_PROGRESS\', "fromNumber" character varying NOT NULL, "toNumber" character varying NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE, "endedAt" TIMESTAMP WITH TIME ZONE, "durationSeconds" integer, "transcript" text, "summary" text, "recordingUrl" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ca27dd0897652667282543424f6" UNIQUE ("twilioCallSid"), CONSTRAINT "PK_ae56b9ccead2f52409c1432c6ac" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_VOICE_CALL_WORKSPACE_ID_VOICE_AGENT_ID" ON "core"."voiceCall" ("workspaceId", "voiceAgentId") ');
    await queryRunner.query('ALTER TABLE "core"."voiceAgent" ADD CONSTRAINT "FK_03fedf73043e9a9c97f15376000" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."voiceCall" ADD CONSTRAINT "FK_661ecebaaa835ab7e9a5b227fb4" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."voiceCall" ADD CONSTRAINT "FK_93004f264353d36f52218548cbf" FOREIGN KEY ("voiceAgentId") REFERENCES "core"."voiceAgent"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."voiceCall" DROP CONSTRAINT "FK_93004f264353d36f52218548cbf"');
    await queryRunner.query('ALTER TABLE "core"."voiceCall" DROP CONSTRAINT "FK_661ecebaaa835ab7e9a5b227fb4"');
    await queryRunner.query('ALTER TABLE "core"."voiceAgent" DROP CONSTRAINT "FK_03fedf73043e9a9c97f15376000"');
    await queryRunner.query('DROP INDEX "core"."IDX_VOICE_CALL_WORKSPACE_ID_VOICE_AGENT_ID"');
    await queryRunner.query('DROP TABLE "core"."voiceCall"');
    await queryRunner.query('DROP TYPE "core"."voiceCall_status_enum"');
    await queryRunner.query('DROP TYPE "core"."voiceCall_direction_enum"');
    await queryRunner.query('DROP TABLE "core"."voiceAgent"');
  }
}
