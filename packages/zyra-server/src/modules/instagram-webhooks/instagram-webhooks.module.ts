import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramAutomationTriggerLogEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-trigger-log.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { InstagramModule } from 'src/modules/instagram/instagram.module';
import { InstagramInboundCommentWebhookJob } from 'src/modules/instagram-webhooks/jobs/instagram-inbound-comment-webhook.job';
import { InstagramFollowUpDmJob } from 'src/modules/instagram-webhooks/jobs/instagram-follow-up-dm.job';
import { InstagramCommentAutomationService } from 'src/modules/instagram-webhooks/services/instagram-comment-automation.service';
import { InstagramInboundWebhookRouterService } from 'src/modules/instagram-webhooks/services/instagram-inbound-webhook-router.service';
import { InstagramSignatureVerifierService } from 'src/modules/instagram-webhooks/services/instagram-signature-verifier.service';
import { InstagramWebhooksController } from 'src/modules/instagram-webhooks/instagram-webhooks.controller';

@Module({
  imports: [
    ZyraConfigModule,
    ConnectedAccountTokenEncryptionModule,
    InstagramModule,
    TypeOrmModule.forFeature([
      InstagramChannelEntity,
      InstagramAutomationRuleEntity,
      InstagramAutomationTriggerLogEntity,
      ConnectedAccountEntity,
    ]),
  ],
  controllers: [InstagramWebhooksController],
  providers: [
    InstagramSignatureVerifierService,
    InstagramInboundWebhookRouterService,
    InstagramCommentAutomationService,
    InstagramInboundCommentWebhookJob,
    InstagramFollowUpDmJob,
  ],
  exports: [InstagramCommentAutomationService],
})
export class InstagramWebhooksModule {}
