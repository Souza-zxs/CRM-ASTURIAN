import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddUtmAndWorkshopSessionFieldsCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1803000000000-add-utm-and-workshop-session-fields.command';
import { GrandfatherWorkflowsAdvancedByUsageCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1803500000000-grandfather-workflows-advanced-by-usage.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PlanTierModule } from 'src/engine/core-modules/plan-tier/plan-tier.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    ApplicationModule,
    FieldMetadataModule,
    WorkspaceMigrationModule,
    PlanTierModule,
  ],
  providers: [
    AddUtmAndWorkshopSessionFieldsCommand,
    GrandfatherWorkflowsAdvancedByUsageCommand,
  ],
})
export class V2_16_UpgradeVersionCommandModule {}
