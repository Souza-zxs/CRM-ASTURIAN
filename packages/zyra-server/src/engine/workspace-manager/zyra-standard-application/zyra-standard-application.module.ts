import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

import { ZyraStandardApplicationService } from './services/zyra-standard-application.service';

@Module({
  providers: [ZyraStandardApplicationService],
  imports: [
    ApplicationModule,
    ZyraConfigModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    GlobalWorkspaceDataSourceModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  exports: [ZyraStandardApplicationService],
})
export class ZyraStandardApplicationModule {}
