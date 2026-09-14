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
import { ConnectInstagramAccountOutputDTO } from 'src/modules/instagram/dtos/connect-instagram-account-output.dto';
import { ConnectInstagramAccountInput } from 'src/modules/instagram/dtos/connect-instagram-account.input';
import { InstagramLoginService } from 'src/modules/instagram/services/instagram-login.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS),
)
export class ConnectInstagramAccountResolver {
  private readonly logger = new Logger(ConnectInstagramAccountResolver.name);

  constructor(
    private readonly instagramLoginService: InstagramLoginService,
  ) {}

  @Mutation(() => ConnectInstagramAccountOutputDTO)
  async connectInstagramAccount(
    @Args('input') input: ConnectInstagramAccountInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectInstagramAccountOutputDTO> {
    const instagramChannel = await this.instagramLoginService.connectAccount({
      workspaceId: workspace.id,
      userWorkspaceId,
      code: input.code,
    });

    return {
      instagramChannelId: instagramChannel.id,
      username: instagramChannel.username,
    };
  }
}
