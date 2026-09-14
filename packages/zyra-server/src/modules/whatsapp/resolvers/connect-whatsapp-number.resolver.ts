import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectWhatsappNumberOutputDTO } from 'src/modules/whatsapp/dtos/connect-whatsapp-number-output.dto';
import { ConnectWhatsappNumberInput } from 'src/modules/whatsapp/dtos/connect-whatsapp-number.input';
import { WhatsappEmbeddedSignupService } from 'src/modules/whatsapp/services/whatsapp-embedded-signup.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS),
)
export class ConnectWhatsappNumberResolver {
  private readonly logger = new Logger(ConnectWhatsappNumberResolver.name);

  constructor(
    private readonly whatsappEmbeddedSignupService: WhatsappEmbeddedSignupService,
  ) {}

  @Mutation(() => ConnectWhatsappNumberOutputDTO)
  async connectWhatsappNumber(
    @Args('input') input: ConnectWhatsappNumberInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectWhatsappNumberOutputDTO> {
    const whatsappChannel = await this.whatsappEmbeddedSignupService.connectNumber({
      workspaceId: workspace.id,
      userWorkspaceId,
      code: input.code,
      wabaId: input.wabaId,
      phoneNumberId: input.phoneNumberId,
    });

    return {
      whatsappChannelId: whatsappChannel.id,
      displayPhoneNumber: whatsappChannel.displayPhoneNumber,
    };
  }
}
