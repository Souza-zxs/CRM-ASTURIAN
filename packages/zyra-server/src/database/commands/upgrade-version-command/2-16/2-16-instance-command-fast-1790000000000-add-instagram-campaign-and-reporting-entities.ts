import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Extends the Instagram comment-automation rule into a "campaign": public
// reply variety, a follow gate, a delayed follow-up DM, and "attach to the
// next Reel" (which is why igMediaId + its cached media metadata become
// nullable — see InstagramAutomationRuleEntity). Also adds the two new
// reporting tables (follower snapshots, opt-in public report) and a
// diagnostics timestamp column on instagramChannel.
@RegisteredInstanceCommand('2.16.0', 1790000000000)
export class AddInstagramCampaignAndReportingEntitiesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ALTER COLUMN "igMediaId" DROP NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD COLUMN "name" character varying');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD COLUMN "publicReplyVariations" text');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD COLUMN "requiresFollowToReceiveDm" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD COLUMN "followUpMessage" text');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD COLUMN "followUpDelayMinutes" integer');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ADD COLUMN "attachToNextReel" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" ADD COLUMN "lastReconciliationAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('CREATE TABLE "core"."instagramFollowerSnapshot" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "instagramChannelId" uuid NOT NULL, "followerCount" integer NOT NULL, "capturedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_7c1c1c1c1c1c1c1c1c1c1c1c1c1" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_INSTAGRAM_FOLLOWER_SNAPSHOT_CHANNEL_ID_CAPTURED_AT" ON "core"."instagramFollowerSnapshot" ("instagramChannelId", "capturedAt") ');
    await queryRunner.query('CREATE TABLE "core"."instagramPublicReport" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "instagramChannelId" uuid NOT NULL, "shareSlug" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8d2d2d2d2d2d2d2d2d2d2d2d2d2" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_INSTAGRAM_PUBLIC_REPORT_INSTAGRAM_CHANNEL_ID" ON "core"."instagramPublicReport" ("instagramChannelId") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_INSTAGRAM_PUBLIC_REPORT_SHARE_SLUG" ON "core"."instagramPublicReport" ("shareSlug") ');
    await queryRunner.query('ALTER TABLE "core"."instagramFollowerSnapshot" ADD CONSTRAINT "FK_1a5a5a5a5a5a5a5a5a5a5a5a5a5" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramFollowerSnapshot" ADD CONSTRAINT "FK_2b6b6b6b6b6b6b6b6b6b6b6b6b6" FOREIGN KEY ("instagramChannelId") REFERENCES "core"."instagramChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramPublicReport" ADD CONSTRAINT "FK_3c7c7c7c7c7c7c7c7c7c7c7c7c7" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."instagramPublicReport" ADD CONSTRAINT "FK_4d8d8d8d8d8d8d8d8d8d8d8d8d8" FOREIGN KEY ("instagramChannelId") REFERENCES "core"."instagramChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."instagramPublicReport" DROP CONSTRAINT "FK_4d8d8d8d8d8d8d8d8d8d8d8d8d8"');
    await queryRunner.query('ALTER TABLE "core"."instagramPublicReport" DROP CONSTRAINT "FK_3c7c7c7c7c7c7c7c7c7c7c7c7c7"');
    await queryRunner.query('ALTER TABLE "core"."instagramFollowerSnapshot" DROP CONSTRAINT "FK_2b6b6b6b6b6b6b6b6b6b6b6b6b6"');
    await queryRunner.query('ALTER TABLE "core"."instagramFollowerSnapshot" DROP CONSTRAINT "FK_1a5a5a5a5a5a5a5a5a5a5a5a5a5"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTAGRAM_PUBLIC_REPORT_SHARE_SLUG"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTAGRAM_PUBLIC_REPORT_INSTAGRAM_CHANNEL_ID"');
    await queryRunner.query('DROP TABLE "core"."instagramPublicReport"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTAGRAM_FOLLOWER_SNAPSHOT_CHANNEL_ID_CAPTURED_AT"');
    await queryRunner.query('DROP TABLE "core"."instagramFollowerSnapshot"');
    await queryRunner.query('ALTER TABLE "core"."instagramChannel" DROP COLUMN "lastReconciliationAt"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP COLUMN "attachToNextReel"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP COLUMN "followUpDelayMinutes"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP COLUMN "followUpMessage"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP COLUMN "requiresFollowToReceiveDm"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP COLUMN "publicReplyVariations"');
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" DROP COLUMN "name"');
    // NOTE: re-applying NOT NULL will fail if any row was created with a
    // NULL igMediaId while this command was applied (i.e. any
    // attachToNextReel rule still pending). Not auto-resolved here since
    // that would mean silently deleting rows or inventing a fake media id —
    // an operator rolling back this command needs to resolve those rows
    // first.
    await queryRunner.query('ALTER TABLE "core"."instagramAutomationRule" ALTER COLUMN "igMediaId" SET NOT NULL');
  }
}
