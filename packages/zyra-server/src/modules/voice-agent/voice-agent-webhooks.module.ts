import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceWebhooksController } from 'src/modules/voice-agent/controllers/voice-webhooks.controller';
import { VoiceMediaStreamGateway } from 'src/modules/voice-agent/gateways/voice-media-stream.gateway';
import { TwilioSignatureVerifierService } from 'src/modules/voice-agent/services/twilio-signature-verifier.service';
import { VoiceAgentInstructionsBuilderService } from 'src/modules/voice-agent/services/voice-agent-instructions-builder.service';
import { VoiceRealtimeBridgeService } from 'src/modules/voice-agent/services/voice-realtime-bridge.service';
import { provideWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    ZyraConfigModule,
    TypeOrmModule.forFeature([VoiceAgentEntity, VoiceCallEntity]),
  ],
  controllers: [VoiceWebhooksController],
  providers: [
    TwilioSignatureVerifierService,
    VoiceAgentInstructionsBuilderService,
    VoiceRealtimeBridgeService,
    VoiceMediaStreamGateway,
    provideWorkspaceScopedRepository(VoiceAgentEntity),
    provideWorkspaceScopedRepository(VoiceCallEntity),
  ],
})
export class VoiceAgentWebhooksModule {}
