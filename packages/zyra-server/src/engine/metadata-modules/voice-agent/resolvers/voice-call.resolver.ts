import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { VoiceCallDTO } from 'src/engine/metadata-modules/voice-agent/dtos/voice-call.dto';
import { VoiceCallMetadataService } from 'src/engine/metadata-modules/voice-agent/voice-call-metadata.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => VoiceCallDTO)
export class VoiceCallResolver {
  constructor(
    private readonly voiceCallMetadataService: VoiceCallMetadataService,
  ) {}

  @Query(() => [VoiceCallDTO])
  @UseGuards(NoPermissionGuard)
  async voiceCalls(
    @Args('voiceAgentId', { type: () => UUIDScalarType })
    voiceAgentId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<VoiceCallDTO[]> {
    return this.voiceCallMetadataService.findByVoiceAgentForWorkspace({
      voiceAgentId,
      workspaceId: workspace.id,
    });
  }
}
