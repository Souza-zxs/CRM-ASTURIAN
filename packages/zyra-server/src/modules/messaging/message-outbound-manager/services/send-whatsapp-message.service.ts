import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';

export type SendWhatsappMessageParams = {
  connectedAccountId: string;
  to: string;
  body: string;
};

export type SendWhatsappMessageResult = {
  success: boolean;
  error?: string;
};

@Injectable()
export class SendWhatsappMessageService {
  private readonly logger = new Logger(SendWhatsappMessageService.name);

  constructor(
    private readonly messagingMessageOutboundService: MessagingMessageOutboundService,
    private readonly sentMessagePersistenceService: SentMessagePersistenceService,
    @InjectWorkspaceScopedRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: WorkspaceScopedRepository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: WorkspaceScopedRepository<WhatsappChannelEntity>,
  ) {}

  async sendWhatsappMessage(
    params: SendWhatsappMessageParams,
    workspace: Pick<WorkspaceEntity, 'id'>,
  ): Promise<SendWhatsappMessageResult> {
    const connectedAccount = await this.connectedAccountRepository.findOne(
      workspace.id,
      {
        where: { id: params.connectedAccountId },
      },
    );

    if (!isDefined(connectedAccount)) {
      return { success: false, error: 'Connected account not found' };
    }

    const whatsappChannel = await this.whatsappChannelRepository.findOne(
      workspace.id,
      {
        where: { connectedAccountId: connectedAccount.id },
      },
    );

    if (!isDefined(whatsappChannel)) {
      return { success: false, error: 'WhatsApp channel not found' };
    }

    try {
      const sendResult = await this.messagingMessageOutboundService.sendMessage(
        {
          to: params.to,
          body: params.body,
          subject: '',
          html: '',
          threadExternalId: params.to,
        },
        connectedAccount,
      );

      await this.sentMessagePersistenceService.persistSentMessage({
        sendResult,
        subject: '',
        body: params.body,
        recipients: { to: [params.to], cc: [], bcc: [] },
        connectedAccount,
        messageChannelId: whatsappChannel.messageChannelId,
        parentThreadExternalId: params.to,
        workspaceId: workspace.id,
      });

      return { success: true };
    } catch (error) {
      this.logger.warn(`Failed to send WhatsApp message: ${error}`);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }
}
