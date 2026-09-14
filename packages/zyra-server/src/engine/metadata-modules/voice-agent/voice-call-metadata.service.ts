import { Injectable } from '@nestjs/common';

import { VoiceAgentMetadataService } from 'src/engine/metadata-modules/voice-agent/voice-agent-metadata.service';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class VoiceCallMetadataService {
  constructor(
    @InjectWorkspaceScopedRepository(VoiceCallEntity)
    private readonly voiceCallRepository: WorkspaceScopedRepository<VoiceCallEntity>,
    private readonly voiceAgentMetadataService: VoiceAgentMetadataService,
  ) {}

  async findByVoiceAgentForWorkspace({
    voiceAgentId,
    workspaceId,
  }: {
    voiceAgentId: string;
    workspaceId: string;
  }): Promise<VoiceCallEntity[]> {
    // Throws if the agent doesn't exist or belongs to another workspace —
    // this is the only access check calls get, same pattern as
    // InstagramAutomationRuleMetadataService.findByChannelForUser.
    await this.voiceAgentMetadataService.findByIdForWorkspace({
      id: voiceAgentId,
      workspaceId,
    });

    return this.voiceCallRepository.find(workspaceId, {
      where: { voiceAgentId },
      order: { createdAt: 'DESC' },
    });
  }
}
