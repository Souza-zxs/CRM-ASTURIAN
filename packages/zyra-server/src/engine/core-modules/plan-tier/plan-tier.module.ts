import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { PlanLimitService } from 'src/engine/core-modules/plan-tier/services/plan-limit.service';
import { WorkspaceModuleGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-module-grandfather.entity';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceModuleGrandfatherEntity,
      BillingSubscriptionItemEntity,
    ]),
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspacePlanTierService,
    PlanLimitService,
    provideWorkspaceScopedRepository(WorkspaceModuleGrandfatherEntity),
  ],
  exports: [WorkspacePlanTierService, PlanLimitService],
})
export class PlanTierModule {}
