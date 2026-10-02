import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspacePlanGrandfatherEntity]),
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspacePlanTierService,
    provideWorkspaceScopedRepository(WorkspacePlanGrandfatherEntity),
  ],
  exports: [WorkspacePlanTierService],
})
export class PlanTierModule {}
