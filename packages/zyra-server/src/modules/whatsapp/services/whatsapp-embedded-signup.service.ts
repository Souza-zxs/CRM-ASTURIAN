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
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappGraphApiService } from 'src/modules/whatsapp/services/whatsapp-graph-api.service';
import {
  WhatsappException,
  WhatsappExceptionCode,
} from 'src/modules/whatsapp/types/whatsapp.exception';

export type ConnectWhatsappNumberInput = {
  workspaceId: string;
  userWorkspaceId: string;
  code: string;
  wabaId: string;
  phoneNumberId: string;
};

// Persists the outcome of a successful front-end Embedded Signup round trip
// (FB.login() popup -> `code` -> here). Mirrors how the Google/Microsoft
// OAuth callbacks create a ConnectedAccountEntity + MessageChannelEntity,
// plus a WhatsappChannelEntity for the Meta-specific identifiers.
@Injectable()
export class WhatsappEmbeddedSignupService {
  constructor(
    private readonly whatsappGraphApiService: WhatsappGraphApiService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
  ) {}

  async connectNumber(
    input: ConnectWhatsappNumberInput,
  ): Promise<WhatsappChannelEntity> {
    const { workspaceId, userWorkspaceId, code, wabaId, phoneNumberId } =
      input;

    const { systemUserAccessToken } =
      await this.whatsappGraphApiService.exchangeEmbeddedSignupCode(
        code,
        wabaId,
        phoneNumberId,
      );

    const phoneNumberDetails =
      await this.whatsappGraphApiService.getPhoneNumberDetails(
        phoneNumberId,
        systemUserAccessToken,
      );

    const encryptedAccessToken = this.connectedAccountTokenEncryptionService.encrypt(
      {
        plaintext: systemUserAccessToken as PlaintextString,
        workspaceId,
      },
    );

    // A given Meta phone_number_id can only ever belong to one workspace
    // (enforced by the unique index on WhatsappChannelEntity.phoneNumberId).
    // If this number was already connected — e.g. the user re-runs Embedded
    // Signup after a token expired — update the existing rows in place
    // instead of inserting a duplicate set, which would leave inbound
    // webhook routing to pick whichever row Postgres returns first.
    const existingWhatsappChannel = await this.whatsappChannelRepository.findOne({
      where: { phoneNumberId },
    });

    if (
      existingWhatsappChannel &&
      existingWhatsappChannel.workspaceId !== workspaceId
    ) {
      throw new WhatsappException(
        `Phone number ${phoneNumberId} is already connected to a different workspace`,
        WhatsappExceptionCode.WHATSAPP_NUMBER_ALREADY_CONNECTED_ELSEWHERE,
      );
    }

    if (existingWhatsappChannel) {
      await this.connectedAccountRepository.update(
        existingWhatsappChannel.connectedAccountId,
        {
          workspaceId,
          userWorkspaceId,
          handle: phoneNumberDetails.display_phone_number,
          accessToken: encryptedAccessToken,
          refreshToken: null,
          lastCredentialsRefreshedAt: new Date(),
        },
      );

      await this.whatsappChannelRepository.update(existingWhatsappChannel.id, {
        wabaId,
        displayPhoneNumber: phoneNumberDetails.display_phone_number,
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.ACTIVE,
      });

      return {
        ...existingWhatsappChannel,
        wabaId,
        displayPhoneNumber: phoneNumberDetails.display_phone_number,
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.ACTIVE,
      };
    }

    const connectedAccount = await this.connectedAccountRepository.save({
      workspaceId,
      userWorkspaceId,
      handle: phoneNumberDetails.display_phone_number,
      provider: ConnectedAccountProvider.WHATSAPP,
      accessToken: encryptedAccessToken,
      refreshToken: null,
      visibility: 'workspace',
      lastCredentialsRefreshedAt: new Date(),
    });

    const messageChannel = await this.messageChannelRepository.save({
      workspaceId,
      connectedAccountId: connectedAccount.id,
      handle: phoneNumberDetails.display_phone_number,
      type: MessageChannelType.WHATSAPP,
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
      messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
      excludeNonProfessionalEmails: false,
      excludeGroupEmails: false,
      pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
      // WhatsApp channels never enter the IMAP/Gmail cron-polling pipeline
      // (see the `Not(In([EMAIL_GROUP, WHATSAPP]))` exclusions added to those
      // cron jobs) — this stage is a permanent no-op placeholder, not a real
      // in-progress sync stage.
      isSyncEnabled: false,
      syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
    });

    return this.whatsappChannelRepository.save({
      workspaceId,
      messageChannelId: messageChannel.id,
      connectedAccountId: connectedAccount.id,
      phoneNumberId,
      wabaId,
      displayPhoneNumber: phoneNumberDetails.display_phone_number,
      isSyncEnabled: true,
      syncStatus: MessageChannelSyncStatus.ACTIVE,
    });
  }
}
