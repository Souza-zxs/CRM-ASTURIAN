import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappGraphApiService } from 'src/modules/whatsapp/services/whatsapp-graph-api.service';
import {
  WhatsappException,
  WhatsappExceptionCode,
} from 'src/modules/whatsapp/types/whatsapp.exception';

@Injectable()
export class WhatsappMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly whatsappGraphApiService: WhatsappGraphApiService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const whatsappChannel = await this.whatsappChannelRepository.findOne({
      where: {
        connectedAccountId: connectedAccount.id,
        workspaceId: connectedAccount.workspaceId,
      },
    });

    if (!isDefined(whatsappChannel)) {
      throw new WhatsappException(
        `No WhatsApp channel found for connected account ${connectedAccount.id}`,
        WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    if (!isDefined(connectedAccount.accessToken)) {
      throw new WhatsappException(
        `Connected account ${connectedAccount.id} has no access token`,
        WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: connectedAccount.workspaceId,
    });

    // sendMessageInput.to is email-shaped (string | string[]) upstream —
    // WhatsApp sends to exactly one phone number per message.
    const to = Array.isArray(sendMessageInput.to)
      ? sendMessageInput.to[0]
      : sendMessageInput.to;

    const { messageExternalId } =
      await this.whatsappGraphApiService.sendTextMessage(
        whatsappChannel.phoneNumberId,
        accessToken,
        to,
        sendMessageInput.body,
      );

    return {
      headerMessageId: messageExternalId,
      messageExternalId,
    };
  }

  async createDraft(): Promise<void> {
    throw new WhatsappException(
      'WhatsApp does not support drafts.',
      WhatsappExceptionCode.WHATSAPP_NOT_CONFIGURED,
    );
  }
}
