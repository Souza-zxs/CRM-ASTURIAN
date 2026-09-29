import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SendWhatsappMessageOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message-output.dto';
import { SendWhatsappMessageInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message.input';
import { SendWhatsappMessageService } from 'src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service';

@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
export class SendWhatsappMessageResolver {
  constructor(
    private readonly sendWhatsappMessageService: SendWhatsappMessageService,
  ) {}

  @Mutation(() => SendWhatsappMessageOutputDTO)
  async sendWhatsappMessage(
    @Args('input') input: SendWhatsappMessageInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendWhatsappMessageOutputDTO> {
    return this.sendWhatsappMessageService.sendWhatsappMessage(
      input,
      workspace,
    );
  }
}
