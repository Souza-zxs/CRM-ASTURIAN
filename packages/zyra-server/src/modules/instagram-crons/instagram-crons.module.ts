import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramFollowerSnapshotEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-follower-snapshot.entity';
import { InstagramAttachNextReelCronCommand } from 'src/modules/instagram-crons/crons/commands/instagram-attach-next-reel.cron.command';
import { InstagramCommentReconciliationCronCommand } from 'src/modules/instagram-crons/crons/commands/instagram-comment-reconciliation.cron.command';
import { InstagramFollowerSnapshotCronCommand } from 'src/modules/instagram-crons/crons/commands/instagram-follower-snapshot.cron.command';
import { InstagramAttachNextReelCronJob } from 'src/modules/instagram-crons/crons/jobs/instagram-attach-next-reel.cron.job';
import { InstagramCommentReconciliationCronJob } from 'src/modules/instagram-crons/crons/jobs/instagram-comment-reconciliation.cron.job';
import { InstagramFollowerSnapshotCronJob } from 'src/modules/instagram-crons/crons/jobs/instagram-follower-snapshot.cron.job';
import { InstagramModule } from 'src/modules/instagram/instagram.module';
import { InstagramWebhooksModule } from 'src/modules/instagram-webhooks/instagram-webhooks.module';

// Reliability crons layered on top of the live webhook-driven automation
// (InstagramWebhooksModule) — token refresh lives in InstagramModule itself
// since it existed before this module; everything added afterward
// (reconciliation, next-Reel attachment, follower snapshots) lives here to
// avoid a circular dependency between InstagramModule and
// InstagramWebhooksModule (reconciliation needs
// InstagramCommentAutomationService, which depends on InstagramModule).
@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    InstagramModule,
    InstagramWebhooksModule,
    TypeOrmModule.forFeature([
      InstagramChannelEntity,
      InstagramAutomationRuleEntity,
      InstagramFollowerSnapshotEntity,
      ConnectedAccountEntity,
    ]),
  ],
  providers: [
    InstagramCommentReconciliationCronJob,
    InstagramCommentReconciliationCronCommand,
    InstagramAttachNextReelCronJob,
    InstagramAttachNextReelCronCommand,
    InstagramFollowerSnapshotCronJob,
    InstagramFollowerSnapshotCronCommand,
  ],
})
export class InstagramCronsModule {}
