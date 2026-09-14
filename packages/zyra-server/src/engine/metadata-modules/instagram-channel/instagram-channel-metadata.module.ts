import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { InstagramAutomationRuleEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-rule.entity';
import { InstagramAutomationTriggerLogEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-automation-trigger-log.entity';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramFollowerSnapshotEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-follower-snapshot.entity';
import { InstagramPublicReportEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-public-report.entity';
import { InstagramAutomationRuleMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-automation-rule-metadata.service';
import { InstagramChannelMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-channel-metadata.service';
import { InstagramDiagnosticsService } from 'src/engine/metadata-modules/instagram-channel/instagram-diagnostics.service';
import { InstagramFollowerSnapshotMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-follower-snapshot-metadata.service';
import { InstagramPublicReportMetadataService } from 'src/engine/metadata-modules/instagram-channel/instagram-public-report-metadata.service';
import { InstagramAutomationRuleResolver } from 'src/engine/metadata-modules/instagram-channel/resolvers/instagram-automation-rule.resolver';
import { InstagramChannelResolver } from 'src/engine/metadata-modules/instagram-channel/resolvers/instagram-channel.resolver';
import { InstagramPublicReportResolver } from 'src/engine/metadata-modules/instagram-channel/resolvers/instagram-public-report.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { InstagramModule } from 'src/modules/instagram/instagram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstagramChannelEntity,
      InstagramAutomationRuleEntity,
      InstagramAutomationTriggerLogEntity,
      InstagramFollowerSnapshotEntity,
      InstagramPublicReportEntity,
      ConnectedAccountEntity,
    ]),
    PermissionsModule,
    ConnectedAccountMetadataModule,
    ConnectedAccountTokenEncryptionModule,
    InstagramModule,
  ],
  providers: [
    InstagramChannelMetadataService,
    InstagramAutomationRuleMetadataService,
    InstagramFollowerSnapshotMetadataService,
    InstagramPublicReportMetadataService,
    InstagramDiagnosticsService,
    InstagramChannelResolver,
    InstagramAutomationRuleResolver,
    InstagramPublicReportResolver,
  ],
  exports: [InstagramChannelMetadataService],
})
export class InstagramChannelMetadataModule {}
