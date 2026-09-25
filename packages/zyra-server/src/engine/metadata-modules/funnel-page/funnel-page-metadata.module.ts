import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FunnelPublicController } from 'src/engine/metadata-modules/funnel-page/controllers/funnel-public.controller';
import { FunnelLeadEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-lead.entity';
import { FunnelPageEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-page.entity';
import { FunnelPageMetadataService } from 'src/engine/metadata-modules/funnel-page/funnel-page-metadata.service';
import { FunnelPageResolver } from 'src/engine/metadata-modules/funnel-page/resolvers/funnel-page.resolver';
import { FunnelLeadCrmSyncService } from 'src/engine/metadata-modules/funnel-page/services/funnel-lead-crm-sync.service';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FunnelPageEntity, FunnelLeadEntity]),
    RecordCrudModule,
  ],
  providers: [
    FunnelPageMetadataService,
    FunnelLeadCrmSyncService,
    FunnelPageResolver,
    provideWorkspaceScopedRepository(FunnelPageEntity),
    provideWorkspaceScopedRepository(FunnelLeadEntity),
  ],
  controllers: [FunnelPublicController],
  exports: [FunnelPageMetadataService],
})
export class FunnelPageMetadataModule {}
