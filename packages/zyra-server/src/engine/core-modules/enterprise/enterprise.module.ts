/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/enterprise-key-validation.cron.job';
import { EnterpriseResolver } from 'src/engine/core-modules/enterprise/enterprise.resolver';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    ZyraConfigModule,
    TypeOrmModule.forFeature([
      UserWorkspaceEntity,
      AppTokenEntity,
      UserEntity,
      WorkspaceEntity,
    ]),
  ],
  providers: [
    EnterprisePlanService,
    EnterpriseKeyValidationCronJob,
    EnterpriseResolver,
  ],
  exports: [EnterprisePlanService, EnterpriseKeyValidationCronJob],
})
export class EnterpriseModule {}
