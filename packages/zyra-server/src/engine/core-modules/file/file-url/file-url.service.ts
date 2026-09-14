import { Injectable } from '@nestjs/common';

import { FileFolder } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class FileUrlService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly zyraConfigService: ZyraConfigService,
  ) {}

  async signWorkspaceLogoUrl(
    workspace: Pick<WorkspaceEntity, 'id' | 'logoFileId'>,
  ): Promise<string | null> {
    if (!isDefined(workspace.logoFileId)) {
      return null;
    }

    return this.signFileByIdUrl({
      fileId: workspace.logoFileId,
      workspaceId: workspace.id,
      fileFolder: FileFolder.CorePicture,
    });
  }

  async signFileByIdUrl({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<string> {
    const fileTokenExpiresIn = this.zyraConfigService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );

    const payload: FileTokenJwtPayload = {
      workspaceId,
      fileId,
      sub: workspaceId,
      type: JwtTokenTypeEnum.FILE,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: fileTokenExpiresIn,
    });

    const serverUrl = this.zyraConfigService.get('SERVER_URL');

    return `${serverUrl}/file/${fileFolder}/${fileId}?token=${token}`;
  }

  getLegacyWorkspaceMemberAvatarUrl({
    fileId,
    fileFolder,
  }: {
    fileId: string;
    fileFolder: FileFolder;
  }): string {
    const serverUrl = this.zyraConfigService.get('SERVER_URL');

    return `${serverUrl}/file/${fileFolder}/${fileId}`;
  }
}
