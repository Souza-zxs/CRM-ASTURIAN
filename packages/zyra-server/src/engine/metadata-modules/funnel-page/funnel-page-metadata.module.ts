import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FunnelPublicController } from 'src/engine/metadata-modules/funnel-page/controllers/funnel-public.controller';
import { FunnelLeadEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-lead.entity';
import { FunnelPageEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-page.entity';
import { FunnelPageMetadataService } from 'src/engine/metadata-modules/funnel-page/funnel-page-metadata.service';
import { FunnelPageResolver } from 'src/engine/metadata-modules/funnel-page/resolvers/funnel-page.resolver';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([FunnelPageEntity, FunnelLeadEntity])],
  providers: [
    FunnelPageMetadataService,
    FunnelPageResolver,
    provideWorkspaceScopedRepository(FunnelPageEntity),
    provideWorkspaceScopedRepository(FunnelLeadEntity),
  ],
  controllers: [FunnelPublicController],
  exports: [FunnelPageMetadataService],
})
export class FunnelPageMetadataModule {}
