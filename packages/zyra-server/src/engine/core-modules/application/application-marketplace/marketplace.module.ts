import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { MarketplaceCatalogSyncCronCommand } from 'src/engine/core-modules/application/application-marketplace/crons/commands/marketplace-catalog-sync.cron.command';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-sync.service';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { MarketplaceResolver } from 'src/engine/core-modules/application/application-marketplace/marketplace.resolver';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { MarketplaceCatalogSyncCommand } from 'src/engine/core-modules/application/application-marketplace/crons/commands/marketplace-catalog-sync.command';

@Module({
  imports: [
    ApplicationModule,
    ApplicationRegistrationModule,
    ApplicationInstallModule,
    FeatureFlagModule,
    PermissionsModule,
    ZyraConfigModule,
  ],
  providers: [
    MarketplaceService,
    MarketplaceCatalogSyncService,
    MarketplaceQueryService,
    MarketplaceCatalogSyncCronJob,
    MarketplaceCatalogSyncCronCommand,
    MarketplaceCatalogSyncCommand,
    MarketplaceResolver,
  ],
  exports: [
    MarketplaceCatalogSyncService,
    MarketplaceQueryService,
    MarketplaceCatalogSyncCronCommand,
    MarketplaceService,
  ],
})
export class MarketplaceModule {}
