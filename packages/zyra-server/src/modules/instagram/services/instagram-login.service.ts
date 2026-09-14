import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'zyra-shared/types';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';
import {
  InstagramException,
  InstagramExceptionCode,
} from 'src/modules/instagram/types/instagram.exception';

export type ConnectInstagramAccountInput = {
  workspaceId: string;
  userWorkspaceId: string;
  code: string;
};

// Persists the outcome of a successful front-end Instagram Login round trip
// (authorization redirect -> `code` -> here). Mirrors how the WhatsApp
// Embedded Signup callback creates a ConnectedAccountEntity +
// MessageChannelEntity, plus an InstagramChannelEntity for the
// Meta-specific identifiers.
@Injectable()
export class InstagramLoginService {
  constructor(
    private readonly instagramGraphApiService: InstagramGraphApiService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
  ) {}

  async connectAccount(
    input: ConnectInstagramAccountInput,
  ): Promise<InstagramChannelEntity> {
    const { workspaceId, userWorkspaceId, code } = input;

    const { igUserId, accessToken: shortLivedAccessToken } =
      await this.instagramGraphApiService.exchangeLoginCode(code);

    const accountDetails =
      await this.instagramGraphApiService.getAccountDetails(
        igUserId,
        shortLivedAccessToken,
      );

    // The token from exchangeLoginCode is only valid ~1h — exchange it for a
    // 60-day long-lived token immediately, since that's the token we'll
    // actually store and use for every subsequent Graph API call.
    const { accessToken: longLivedAccessToken, expiresInSeconds } =
      await this.instagramGraphApiService.exchangeForLongLivedToken(
        shortLivedAccessToken,
      );
    const accessTokenExpiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    );

    const encryptedAccessToken = this.connectedAccountTokenEncryptionService.encrypt(
      {
        plaintext: longLivedAccessToken as PlaintextString,
        workspaceId,
      },
    );

    // A given ig_business_account_id can only ever belong to one workspace
    // (enforced by the unique index on InstagramChannelEntity.igBusinessAccountId).
    // If this account was already connected — e.g. the user re-runs
    // Instagram Login after a token expired — update the existing rows in
    // place instead of inserting a duplicate set, which would leave inbound
    // webhook routing to pick whichever row Postgres returns first.
    const existingInstagramChannel = await this.instagramChannelRepository.findOne({
      where: { igBusinessAccountId: igUserId },
    });

    if (
      existingInstagramChannel &&
      existingInstagramChannel.workspaceId !== workspaceId
    ) {
      throw new InstagramException(
        `Instagram account ${igUserId} is already connected to a different workspace`,
        InstagramExceptionCode.INSTAGRAM_ACCOUNT_ALREADY_CONNECTED_ELSEWHERE,
      );
    }

    if (existingInstagramChannel) {
      await this.connectedAccountRepository.update(
        existingInstagramChannel.connectedAccountId,
        {
          handle: accountDetails.username,
          accessToken: encryptedAccessToken,
          refreshToken: null,
          lastCredentialsRefreshedAt: new Date(),
        },
      );

      await this.instagramChannelRepository.update(existingInstagramChannel.id, {
        username: accountDetails.username,
        profilePictureUrl: accountDetails.profile_picture_url ?? null,
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.ACTIVE,
        accessTokenExpiresAt,
      });

      return {
        ...existingInstagramChannel,
        username: accountDetails.username,
        profilePictureUrl: accountDetails.profile_picture_url ?? null,
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.ACTIVE,
        accessTokenExpiresAt,
      };
    }

    const connectedAccount = await this.connectedAccountRepository.save({
      workspaceId,
      userWorkspaceId,
      handle: accountDetails.username,
      provider: ConnectedAccountProvider.INSTAGRAM,
      accessToken: encryptedAccessToken,
      refreshToken: null,
      visibility: 'workspace',
      lastCredentialsRefreshedAt: new Date(),
    });

    const messageChannel = await this.messageChannelRepository.save({
      workspaceId,
      connectedAccountId: connectedAccount.id,
      handle: accountDetails.username,
      type: MessageChannelType.INSTAGRAM,
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
      messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
      excludeNonProfessionalEmails: false,
      excludeGroupEmails: false,
      pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
      // Instagram channels never enter the IMAP/Gmail cron-polling pipeline
      // (same reasoning as WhatsApp — see the `Not(In([...]))` exclusions
      // added to those cron jobs) — this stage is a permanent no-op
      // placeholder, not a real in-progress sync stage.
      isSyncEnabled: false,
      syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
    });

    return this.instagramChannelRepository.save({
      workspaceId,
      messageChannelId: messageChannel.id,
      connectedAccountId: connectedAccount.id,
      igBusinessAccountId: igUserId,
      username: accountDetails.username,
      profilePictureUrl: accountDetails.profile_picture_url ?? null,
      isSyncEnabled: true,
      syncStatus: MessageChannelSyncStatus.ACTIVE,
      accessTokenExpiresAt,
    });
  }
}
