import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { PlanTierModule } from 'src/engine/core-modules/plan-tier/plan-tier.module';
import { WorkspacePlanUsageService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-usage.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { WhatsappAgentMessageEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-message.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';

// Kept separate from PlanTierModule on purpose: WorkspacePlanUsageService
// pulls in a repository for every domain that owns a plan limit, which
// would otherwise bloat PlanTierModule's dependency graph for the ~15
// feature modules that only need the lightweight enforcement services
// (WorkspacePlanTierService/PlanLimitService). Only the workspace resolver
// (the usage-dashboard query) needs this module.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserWorkspaceEntity,
      WhatsappChannelEntity,
      WhatsappAgentEntity,
      WhatsappAgentMessageEntity,
      VoiceAgentEntity,
      VoiceCallEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      PageLayoutEntity,
    ]),
    ApplicationModule,
    PlanTierModule,
  ],
  providers: [WorkspacePlanUsageService],
  exports: [WorkspacePlanUsageService],
})
export class WorkspacePlanUsageModule {}
