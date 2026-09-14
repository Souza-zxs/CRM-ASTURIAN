import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceAgentResolver } from 'src/engine/metadata-modules/voice-agent/resolvers/voice-agent.resolver';
import { VoiceCallResolver } from 'src/engine/metadata-modules/voice-agent/resolvers/voice-call.resolver';
import { VoiceAgentMetadataService } from 'src/engine/metadata-modules/voice-agent/voice-agent-metadata.service';
import { VoiceCallMetadataService } from 'src/engine/metadata-modules/voice-agent/voice-call-metadata.service';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceAgentEntity, VoiceCallEntity]),
    PermissionsModule,
  ],
  providers: [
    VoiceAgentMetadataService,
    VoiceCallMetadataService,
    VoiceAgentResolver,
    VoiceCallResolver,
    provideWorkspaceScopedRepository(VoiceAgentEntity),
    provideWorkspaceScopedRepository(VoiceCallEntity),
  ],
  exports: [VoiceAgentMetadataService, VoiceCallMetadataService],
})
export class VoiceAgentMetadataModule {}
